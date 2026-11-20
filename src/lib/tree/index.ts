import { buildExpressionTree } from './builder';
import { parseExpressionInput } from './parser';
import { computeAllTraversals } from './traversals';
import type { ParseValidationError, TreeBuildResult } from './types';

export * from './types';
export * from './parser';
export * from './builder';
export * from './traversals';

export type AnalyzeTreeResponse =
  | { ok: true; result: TreeBuildResult }
  | { ok: false; error: ParseValidationError };

/**
 * Pure end-to-end builder and traversal analyzer for Binary Expression Trees.
 */
export function buildAndAnalyzeTree(rawInput: string): AnalyzeTreeResponse {
  const parsed = parseExpressionInput(rawInput);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const built = buildExpressionTree(parsed.tokens);
  const traversals = computeAllTraversals(built.root);

  return {
    ok: true,
    result: {
      root: built.root,
      metrics: built.metrics,
      buildTrace: built.trace,
      traversals,
      normalizedInput: parsed.normalized,
    },
  };
}
