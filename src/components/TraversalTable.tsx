import { Check, Copy, Play } from 'lucide-react';
import { useState } from 'react';
import type {
  TraversalComparison,
  TraversalSequenceResult,
  TraversalType,
} from '../lib/tree';

interface TraversalTableProps {
  traversals: TraversalComparison;
  activeTraversal: TraversalType;
  onInspectTraversal: (type: TraversalType) => void;
  compact?: boolean;
}

export function TraversalTable({
  traversals,
  activeTraversal,
  onInspectTraversal,
  compact = false,
}: TraversalTableProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const rows: TraversalSequenceResult[] = [
    traversals.inorder,
    traversals.preorder,
    traversals.postorder,
  ];

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 1800);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 1800);
    }
  };

  return (
    <section
      aria-labelledby="traversal-table-heading"
      className="flex h-full flex-col overflow-hidden rounded-xl border border-[#D2DCE4] bg-[#E7EBEE] dark:border-[#3A3735] dark:bg-[#272625]"
    >
      <div className="flex flex-col gap-1 border-b border-[#D2DCE4] px-5 py-3.5 dark:border-[#3E3B39]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="traversal-table-heading"
            className="font-heading text-base font-bold text-[#A98273] dark:text-[#DEC3B3]"
          >
            Traversal Comparison Table
          </h2>
          <span className="text-xs font-medium text-[#827A75] tabular-nums dark:text-[#B8AFA9]">
            Infix · Prefix · Postfix
          </span>
        </div>
        <p className="text-xs text-[#827A75] dark:text-[#B8AFA9]">
          Recursive visit orders generated from the Binary Expression Tree.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto bg-[#F8F2EF]/60 dark:bg-[#1E1C1B]/50">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#D2DCE4] bg-[#E5D6CE]/70 text-xs font-bold text-[#5F5A57] dark:border-[#3E3B39] dark:bg-[#2C2725] dark:text-[#DFD6D0]">
              <th scope="col" className="px-4 py-2.5">
                Traversal
              </th>
              <th scope="col" className="px-4 py-2.5">
                Expression Output
              </th>
              {!compact && (
                <th scope="col" className="px-4 py-2.5 text-right">
                  Tokens
                </th>
              )}
              <th scope="col" className="px-4 py-2.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D2DCE4] dark:divide-[#3A3735]">
            {rows.map((row) => {
              const isSelected = activeTraversal === row.type;
              const copyId = row.type;
              const copyValue = row.parenthesizedInfix ?? row.formatted;

              return (
                <tr
                  key={row.type}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-[#F0E5DF] dark:bg-[#2F2926]'
                      : 'bg-[#F8F2EF]/80 hover:bg-[#E5D6CE]/40 dark:bg-[#1E1C1B]/80 dark:hover:bg-[#2A2624]'
                  }`}
                >
                  <td className="px-4 py-3.5 align-top">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="font-heading text-xs font-bold text-[#5F5A57] sm:text-sm dark:text-[#F0E5DF]">
                        {row.type.toUpperCase()} ({row.code})
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#A98273] dark:text-[#DEC3B3]">
                        · {row.expressionAlias}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-[#827A75] dark:text-[#B8AFA9]">
                      {row.code === 'LTR' && 'Left → Root → Right'}
                      {row.code === 'TLR' && 'Root → Left → Right'}
                      {row.code === 'LRT' && 'Left → Right → Root'}
                    </p>
                    {compact && (
                      <div className="mt-1 font-mono text-[11px] text-[#827A75] tabular-nums dark:text-[#B8AFA9]">
                        Tokens: {row.tokens.length}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3.5 align-top">
                    <div className="font-mono text-xs font-semibold break-words text-[#5F5A57] sm:text-sm dark:text-[#F0E5DF]">
                      {row.formatted}
                    </div>
                    {row.parenthesizedInfix && (
                      <div className="mt-1.5 text-[11px] text-[#827A75] dark:text-[#B8AFA9]">
                        <span className="font-semibold text-[#5F5A57] dark:text-[#DFD6D0]">
                          Grouped:
                        </span>{' '}
                        <code className="font-mono text-[#A98273] dark:text-[#DEC3B3]">
                          {row.parenthesizedInfix}
                        </code>
                      </div>
                    )}
                  </td>

                  {!compact && (
                    <td className="px-4 py-3.5 text-right align-top font-mono text-xs font-semibold text-[#5F5A57] tabular-nums dark:text-[#DFD6D0]">
                      {row.tokens.length}
                    </td>
                  )}

                  <td className="px-4 py-3.5 text-right align-top">
                    <div className="inline-flex flex-col items-end gap-1.5 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={() => handleCopy(copyId, copyValue)}
                        aria-label={`Copy ${row.type} expression`}
                        className="inline-flex min-h-[34px] shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-[#D2DCE4] bg-[#E7EBEE] px-2.5 py-1 text-xs font-semibold text-[#5F5A57] transition-colors hover:bg-[#C9A995] hover:text-[#3D3835] focus-visible:outline-2 focus-visible:outline-[#A98273] dark:border-[#3E3B39] dark:bg-[#2A2726] dark:text-[#DFD6D0] dark:hover:bg-[#3A3532]"
                      >
                        {copiedKey === copyId ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-[#687C87] dark:text-[#8C9DA7]" aria-hidden="true" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onInspectTraversal(row.type)}
                        className={`inline-flex min-h-[34px] shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-[#A98273] ${
                          isSelected
                            ? 'border border-[#A98273] bg-[#DEC3B3] text-[#46413E] dark:border-[#C9A995] dark:bg-[#B98E83] dark:text-[#1E1C1B]'
                            : 'border border-[#D2DCE4] bg-[#F8F2EF] text-[#5F5A57] hover:bg-[#DEC3B3] dark:border-[#3E3B39] dark:bg-[#1E1C1B] dark:text-[#DFD6D0] dark:hover:bg-[#342F2D]'
                        }`}
                      >
                        <Play className="h-3 w-3" aria-hidden="true" />
                        <span>{isSelected ? 'Active' : 'Step'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[#D2DCE4] bg-[#E7EBEE] px-4 py-2.5 text-[11px] text-[#827A75] dark:border-[#3E3B39] dark:bg-[#272625] dark:text-[#B8AFA9]">
        Click <strong className="font-semibold text-[#5F5A57] dark:text-[#DFD6D0]">Step</strong> on any row to trace its recursive calls below.
      </div>
    </section>
  );
}
