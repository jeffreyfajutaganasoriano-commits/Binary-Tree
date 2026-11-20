import type {
  CallStackFrame,
  TraversalComparison,
  TraversalSequenceResult,
  TraversalStep,
  TraversalType,
  TraversalVisitToken,
  TreeNode,
} from './types';

function operatorPrecedence(op: string): number {
  if (op === '+' || op === '-') return 1;
  if (op === '*' || op === '/') return 2;
  if (op === '^') return 3;
  return 4;
}

function isRightAssociative(op: string): boolean {
  return op === '^';
}

/**
 * Recursively reconstructs minimal parenthesized infix notation from a Binary Expression Tree.
 */
export function buildParenthesizedInfix(node: TreeNode | null): string {
  if (node === null) {
    return '';
  }
  if (node.left === null && node.right === null) {
    return node.value;
  }

  const parentPrec = operatorPrecedence(node.value);
  const leftText = buildParenthesizedInfix(node.left);
  const rightText = buildParenthesizedInfix(node.right);

  let wrappedLeft = leftText;
  if (node.left && node.left.kind === 'operator') {
    const leftPrec = operatorPrecedence(node.left.value);
    const needsLeftParens =
      leftPrec < parentPrec || (leftPrec === parentPrec && isRightAssociative(node.value));
    if (needsLeftParens) {
      wrappedLeft = `(${leftText})`;
    }
  }

  let wrappedRight = rightText;
  if (node.right && node.right.kind === 'operator') {
    const rightPrec = operatorPrecedence(node.right.value);
    const needsRightParens =
      rightPrec < parentPrec ||
      (rightPrec === parentPrec &&
        (!isRightAssociative(node.value) || node.value === '-' || node.value === '/'));
    if (needsRightParens) {
      wrappedRight = `(${rightText})`;
    }
  }

  return `${wrappedLeft} ${node.value} ${wrappedRight}`;
}

function cloneStack(stack: CallStackFrame[]): CallStackFrame[] {
  return stack.map((frame) => ({ ...frame }));
}

function cloneVisited(visited: TraversalVisitToken[]): TraversalVisitToken[] {
  return visited.map((v) => ({ ...v }));
}

/**
 * Executes a pure recursive traversal (INORDER LTR, PREORDER TLR, or POSTORDER LRT)
 * and records every recursive frame, null base case, and node emission step.
 */
export function runRecursiveTraversal(
  root: TreeNode,
  type: TraversalType,
): TraversalSequenceResult {
  const fnName =
    type === 'inorder' ? 'inorder' : type === 'preorder' ? 'preorder' : 'postorder';
  const code = type === 'inorder' ? 'LTR' : type === 'preorder' ? 'TLR' : 'LRT';
  const label =
    type === 'inorder'
      ? 'INORDER (LTR — Left, Root, Right)'
      : type === 'preorder'
        ? 'PREORDER (TLR — Root, Left, Right)'
        : 'POSTORDER (LRT — Left, Right, Root)';
  const expressionAlias: 'Infix' | 'Prefix' | 'Postfix' =
    type === 'inorder'
      ? 'Infix'
      : type === 'preorder'
        ? 'Prefix'
        : 'Postfix';

  const steps: TraversalStep[] = [];
  const visited: TraversalVisitToken[] = [];
  const stack: CallStackFrame[] = [];

  const recordStep = (
    partial: Omit<TraversalStep, 'stepIndex' | 'traversal' | 'callStack' | 'visitedNodes'>,
  ): void => {
    steps.push({
      ...partial,
      stepIndex: steps.length,
      traversal: type,
      callStack: cloneStack(stack),
      visitedNodes: cloneVisited(visited),
    });
  };

  const visitNode = (node: TreeNode, parentId: string | null): void => {
    const order = visited.length + 1;
    visited.push({
      nodeId: node.id,
      value: node.value,
      order,
    });
    if (stack.length > 0) {
      stack[stack.length - 1].phase = 'visiting';
    }
    recordStep({
      action: 'visit-node',
      nodeId: node.id,
      nodeValue: node.value,
      parentNodeId: parentId,
      ruleLabel: `${code}: Visit Root (#${order})`,
      description: `Emit node "${node.value}" as output #${order} in ${type.toUpperCase()} (${code}) order.`,
      activeEdge: null,
    });
  };

  const recurseLeft = (node: TreeNode, depth: number): void => {
    if (stack.length > 0) {
      stack[stack.length - 1].phase = 'left-subtree';
    }
    if (node.left === null) {
      recordStep({
        action: 'base-null-left',
        nodeId: node.id,
        nodeValue: node.value,
        parentNodeId: node.id,
        ruleLabel: 'Base Case: left == null',
        description: `Left child of "${node.value}" is null — base case reached, return immediately.`,
        activeEdge: null,
      });
      return;
    }

    recordStep({
      action: 'recurse-left',
      nodeId: node.id,
      nodeValue: node.value,
      parentNodeId: node.id,
      ruleLabel: `${code}: Recurse Left`,
      description: `Call ${fnName}("${node.left.value}") on the left child of "${node.value}".`,
      activeEdge: { fromId: node.id, toId: node.left.id, side: 'left' },
    });
    traverseRecursive(node.left, node.id, depth + 1);
  };

  const recurseRight = (node: TreeNode, depth: number): void => {
    if (stack.length > 0) {
      stack[stack.length - 1].phase = 'right-subtree';
    }
    if (node.right === null) {
      recordStep({
        action: 'base-null-right',
        nodeId: node.id,
        nodeValue: node.value,
        parentNodeId: node.id,
        ruleLabel: 'Base Case: right == null',
        description: `Right child of "${node.value}" is null — base case reached, return immediately.`,
        activeEdge: null,
      });
      return;
    }

    recordStep({
      action: 'recurse-right',
      nodeId: node.id,
      nodeValue: node.value,
      parentNodeId: node.id,
      ruleLabel: `${code}: Recurse Right`,
      description: `Call ${fnName}("${node.right.value}") on the right child of "${node.value}".`,
      activeEdge: { fromId: node.id, toId: node.right.id, side: 'right' },
    });
    traverseRecursive(node.right, node.id, depth + 1);
  };

  function traverseRecursive(node: TreeNode, parentId: string | null, depth: number): void {
    stack.push({
      fnName,
      nodeId: node.id,
      nodeValue: node.value,
      depth,
      phase: 'entering',
    });

    recordStep({
      action: 'enter-node',
      nodeId: node.id,
      nodeValue: node.value,
      parentNodeId: parentId,
      ruleLabel: `Enter ${fnName}("${node.value}")`,
      description: `Enter recursive frame ${fnName}("${node.value}") at depth ${depth}.`,
      activeEdge: null,
    });

    if (type === 'inorder') {
      recurseLeft(node, depth);
      visitNode(node, parentId);
      recurseRight(node, depth);
    } else if (type === 'preorder') {
      visitNode(node, parentId);
      recurseLeft(node, depth);
      recurseRight(node, depth);
    } else {
      recurseLeft(node, depth);
      recurseRight(node, depth);
      visitNode(node, parentId);
    }

    if (stack.length > 0) {
      stack[stack.length - 1].phase = 'returning';
    }
    recordStep({
      action: 'return-node',
      nodeId: node.id,
      nodeValue: node.value,
      parentNodeId: parentId,
      ruleLabel: `Return from "${node.value}"`,
      description: `Completed left and right subtrees of "${node.value}"; pop stack frame.`,
      activeEdge: null,
    });
    stack.pop();
  }

  traverseRecursive(root, null, 0);

  return {
    type,
    code,
    label,
    expressionAlias,
    tokens: visited,
    formatted: visited.map((v) => v.value).join(' '),
    parenthesizedInfix: type === 'inorder' ? buildParenthesizedInfix(root) : undefined,
    steps,
  };
}

export function computeAllTraversals(root: TreeNode): TraversalComparison {
  return {
    inorder: runRecursiveTraversal(root, 'inorder'),
    preorder: runRecursiveTraversal(root, 'preorder'),
    postorder: runRecursiveTraversal(root, 'postorder'),
  };
}
