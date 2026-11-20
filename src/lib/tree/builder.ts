import type {
  BuildTraceStep,
  ExpressionToken,
  TreeMetrics,
  TreeNode,
} from './types';

interface RawTreeNode {
  id: string;
  value: string;
  kind: 'operator' | 'operand';
  left: RawTreeNode | null;
  right: RawTreeNode | null;
}

class IdCounter {
  private count = 0;

  next(prefix = 'node'): string {
    this.count += 1;
    return `${prefix}-${this.count}`;
  }
}

/**
 * Pure recursive height calculation (edges from node to deepest leaf).
 * Base case: null node returns -1; leaf node returns 0.
 */
export function computeHeightRecursive(node: TreeNode | null): number {
  if (node === null) {
    return -1;
  }
  return 1 + Math.max(computeHeightRecursive(node.left), computeHeightRecursive(node.right));
}

/**
 * Pure recursive node count.
 */
export function countNodesRecursive(node: TreeNode | null): number {
  if (node === null) {
    return 0;
  }
  return 1 + countNodesRecursive(node.left) + countNodesRecursive(node.right);
}

/**
 * Pure recursive leaf count.
 */
export function countLeavesRecursive(node: TreeNode | null): number {
  if (node === null) {
    return 0;
  }
  if (node.left === null && node.right === null) {
    return 1;
  }
  return countLeavesRecursive(node.left) + countLeavesRecursive(node.right);
}

/**
 * Recursively enriches every node with depth, subtree height, subtree size, and root/leaf flags.
 */
function annotateNodeRecursive(raw: RawTreeNode | null, depth: number, isRoot: boolean): TreeNode | null {
  if (raw === null) {
    return null;
  }

  const left = annotateNodeRecursive(raw.left, depth + 1, false);
  const right = annotateNodeRecursive(raw.right, depth + 1, false);

  const leftHeight = left ? left.height : -1;
  const rightHeight = right ? right.height : -1;
  const height = 1 + Math.max(leftHeight, rightHeight);

  const leftSize = left ? left.subtreeSize : 0;
  const rightSize = right ? right.subtreeSize : 0;
  const subtreeSize = 1 + leftSize + rightSize;

  return {
    id: raw.id,
    value: raw.value,
    kind: raw.kind,
    left,
    right,
    depth,
    height,
    subtreeSize,
    isRoot,
    isLeaf: left === null && right === null,
  };
}

function collectLevelCountsRecursive(node: TreeNode | null, counts: Map<number, number>): void {
  if (node === null) {
    return;
  }
  counts.set(node.depth, (counts.get(node.depth) ?? 0) + 1);
  collectLevelCountsRecursive(node.left, counts);
  collectLevelCountsRecursive(node.right, counts);
}

export function computeTreeMetrics(root: TreeNode): TreeMetrics {
  const nodeCount = countNodesRecursive(root);
  const leafCount = countLeavesRecursive(root);
  const height = computeHeightRecursive(root);
  const levelCounts = new Map<number, number>();
  collectLevelCountsRecursive(root, levelCounts);
  let maxWidth = 1;
  for (const count of levelCounts.values()) {
    if (count > maxWidth) {
      maxWidth = count;
    }
  }

  return {
    nodeCount,
    leafCount,
    internalCount: nodeCount - leafCount,
    height,
    rootValue: root.value,
    maxWidth,
  };
}

/**
 * Recursive descent parser for Binary Expression Trees.
 * Grammar:
 *   expr    := term ( ('+' | '-') term )*      [left-associative]
 *   term    := factor ( ('*' | '/') factor )*  [left-associative]
 *   factor  := primary ( '^' factor )?         [right-associative]
 *   primary := operand | '(' expr ')'
 */
export function buildExpressionTree(tokens: ExpressionToken[]): {
  root: TreeNode;
  metrics: TreeMetrics;
  trace: BuildTraceStep[];
} {
  let cursor = 0;
  const ids = new IdCounter();
  const trace: BuildTraceStep[] = [];

  const peek = (): ExpressionToken | undefined => tokens[cursor];
  const consume = (): ExpressionToken => {
    const token = tokens[cursor];
    cursor += 1;
    return token;
  };

  function parseAddSub(depth: number): RawTreeNode {
    let left = parseMulDiv(depth + 1);

    while (peek()?.kind === 'operator' && (peek()?.value === '+' || peek()?.value === '-')) {
      const op = consume();
      const right = parseMulDiv(depth + 1);
      const id = ids.next('op');
      trace.push({
        stepNumber: trace.length + 1,
        action: 'combine-subtree',
        summary: `Combine (${left.value}) ${op.value} (${right.value})`,
        detail: `Operator "${op.value}" becomes parent of left subtree "${left.value}" and right subtree "${right.value}".`,
        nodeValue: op.value,
        nodeId: id,
        depth,
      });
      left = {
        id,
        value: op.value,
        kind: 'operator',
        left,
        right,
      };
    }

    return left;
  }

  function parseMulDiv(depth: number): RawTreeNode {
    let left = parseExponent(depth + 1);

    while (peek()?.kind === 'operator' && (peek()?.value === '*' || peek()?.value === '/')) {
      const op = consume();
      const right = parseExponent(depth + 1);
      const id = ids.next('op');
      trace.push({
        stepNumber: trace.length + 1,
        action: 'combine-subtree',
        summary: `Combine (${left.value}) ${op.value} (${right.value})`,
        detail: `Higher-precedence operator "${op.value}" binds "${left.value}" (left) and "${right.value}" (right).`,
        nodeValue: op.value,
        nodeId: id,
        depth,
      });
      left = {
        id,
        value: op.value,
        kind: 'operator',
        left,
        right,
      };
    }

    return left;
  }

  function parseExponent(depth: number): RawTreeNode {
    const base = parsePrimary(depth + 1);
    if (peek()?.kind === 'operator' && peek()?.value === '^') {
      const op = consume();
      const exponent = parseExponent(depth + 1);
      const id = ids.next('op');
      trace.push({
        stepNumber: trace.length + 1,
        action: 'combine-subtree',
        summary: `Combine (${base.value}) ^ (${exponent.value})`,
        detail: `Right-associative "^" binds base "${base.value}" with right-recursive exponent "${exponent.value}".`,
        nodeValue: op.value,
        nodeId: id,
        depth,
      });
      return {
        id,
        value: op.value,
        kind: 'operator',
        left: base,
        right: exponent,
      };
    }
    return base;
  }

  function parsePrimary(depth: number): RawTreeNode {
    const token = peek();
    if (!token) {
      throw new Error('Unexpected end of expression.');
    }

    if (token.kind === 'lparen') {
      consume();
      const inner = parseAddSub(depth + 1);
      const closing = peek();
      if (!closing || closing.kind !== 'rparen') {
        throw new Error('Unbalanced parentheses.');
      }
      consume();
      return inner;
    }

    consume();
    const id = ids.next('leaf');
    trace.push({
      stepNumber: trace.length + 1,
      action: 'create-leaf',
      summary: `Create operand leaf "${token.value}"`,
      detail: `Base case reached: operand "${token.value}" becomes a leaf node with no children.`,
      nodeValue: token.value,
      nodeId: id,
      depth,
    });

    return {
      id,
      value: token.value,
      kind: 'operand',
      left: null,
      right: null,
    };
  }

  const rawRoot = parseAddSub(0);
  const root = annotateNodeRecursive(rawRoot, 0, true);
  if (!root) {
    throw new Error('Failed to construct expression tree.');
  }

  return {
    root,
    metrics: computeTreeMetrics(root),
    trace,
  };
}
