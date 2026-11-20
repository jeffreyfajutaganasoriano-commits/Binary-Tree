export type TraversalType = 'inorder' | 'preorder' | 'postorder';

export type TokenKind = 'operand' | 'operator' | 'lparen' | 'rparen';

export interface ExpressionToken {
  kind: TokenKind;
  value: string;
  position: number;
}

export interface TreeNode {
  id: string;
  value: string;
  kind: 'operator' | 'operand';
  left: TreeNode | null;
  right: TreeNode | null;
  depth: number;
  height: number;
  subtreeSize: number;
  isRoot: boolean;
  isLeaf: boolean;
}

export interface BuildTraceStep {
  stepNumber: number;
  action: 'create-leaf' | 'combine-subtree';
  summary: string;
  detail: string;
  nodeValue: string;
  nodeId: string;
  depth: number;
}

export interface TreeMetrics {
  nodeCount: number;
  leafCount: number;
  internalCount: number;
  height: number;
  rootValue: string;
  maxWidth: number;
}

export interface TraversalVisitToken {
  nodeId: string;
  value: string;
  order: number;
}

export type TraversalAction =
  | 'enter-node'
  | 'recurse-left'
  | 'base-null-left'
  | 'visit-node'
  | 'recurse-right'
  | 'base-null-right'
  | 'return-node';

export interface CallStackFrame {
  fnName: string;
  nodeId: string;
  nodeValue: string;
  depth: number;
  phase: 'entering' | 'left-subtree' | 'visiting' | 'right-subtree' | 'returning';
}

export interface TraversalStep {
  stepIndex: number;
  traversal: TraversalType;
  action: TraversalAction;
  nodeId: string | null;
  nodeValue: string | null;
  parentNodeId: string | null;
  ruleLabel: string;
  description: string;
  callStack: CallStackFrame[];
  visitedNodes: TraversalVisitToken[];
  activeEdge: { fromId: string; toId: string; side: 'left' | 'right' } | null;
}

export interface TraversalSequenceResult {
  type: TraversalType;
  code: 'LTR' | 'TLR' | 'LRT';
  label: string;
  expressionAlias: 'Infix' | 'Prefix' | 'Postfix';
  tokens: TraversalVisitToken[];
  formatted: string;
  parenthesizedInfix?: string;
  steps: TraversalStep[];
}

export interface TraversalComparison {
  inorder: TraversalSequenceResult;
  preorder: TraversalSequenceResult;
  postorder: TraversalSequenceResult;
}

export interface TreeBuildResult {
  root: TreeNode;
  metrics: TreeMetrics;
  buildTrace: BuildTraceStep[];
  traversals: TraversalComparison;
  normalizedInput: string;
}

export interface ParseValidationError {
  message: string;
  hint: string;
  position?: number;
}

export interface PresetExample {
  id: string;
  label: string;
  input: string;
  description: string;
}
