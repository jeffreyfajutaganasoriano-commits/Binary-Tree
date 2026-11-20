import { AlertCircle, ArrowRight, Info } from 'lucide-react';
import type { FormEvent } from 'react';
import {
  EXPRESSION_PRESETS,
  type ParseValidationError,
  type PresetExample,
} from '../lib/tree';

interface InorderInputPanelProps {
  inputValue: string;
  error: ParseValidationError | null;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onSelectPreset: (preset: PresetExample) => void;
}

export function InorderInputPanel({
  inputValue,
  error,
  onInputChange,
  onSubmit,
  onSelectPreset,
}: InorderInputPanelProps) {
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section
      aria-labelledby="input-panel-heading"
      className="rounded-xl border border-[#D2DCE4] bg-[#E7EBEE] p-5 sm:p-6 dark:border-[#3A3735] dark:bg-[#272625]"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h2
            id="input-panel-heading"
            className="font-heading text-lg font-bold text-[#A98273] dark:text-[#DEC3B3]"
          >
            Expression Input (Inorder / Infix)
          </h2>
          <p className="mt-1 text-sm text-[#827A75] dark:text-[#B8AFA9]">
            Enter any algebraic expression with operands, operators (<code className="font-mono font-semibold text-[#5F5A57] dark:text-[#DFD6D0]">+</code>, <code className="font-mono font-semibold text-[#5F5A57] dark:text-[#DFD6D0]">-</code>, <code className="font-mono font-semibold text-[#5F5A57] dark:text-[#DFD6D0]">*</code>, <code className="font-mono font-semibold text-[#5F5A57] dark:text-[#DFD6D0]">/</code>, <code className="font-mono font-semibold text-[#5F5A57] dark:text-[#DFD6D0]">^</code>), and parentheses.
          </p>
        </div>

        <div className="text-xs font-semibold text-[#687C87] dark:text-[#8C9DA7]">
          Operators = Internal · Operands = Leaves
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleFormSubmit} className="mt-4">
        <label
          htmlFor="inorder-expression-input"
          className="block text-xs font-semibold tracking-wide text-[#5F5A57] dark:text-[#DFD6D0]"
        >
          Infix Expression
        </label>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="inorder-expression-input"
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="e.g., A * B + C / D or (3 + 5) * 2"
            spellCheck={false}
            autoComplete="off"
            aria-invalid={error !== null}
            aria-describedby={error ? 'input-validation-error' : 'expression-precedence-note'}
            className={`min-h-[44px] flex-1 rounded-lg border bg-[#F8F2EF] px-4 py-2.5 font-mono text-sm text-[#5F5A57] transition-colors placeholder:text-[#827A75]/70 focus:bg-white focus:outline-2 focus:outline-offset-0 dark:bg-[#1E1C1B] dark:text-[#F0E5DF] dark:placeholder:text-[#827A75] dark:focus:bg-[#1E1C1B] ${
              error
                ? 'border-[#A98273] focus:outline-[#A98273]'
                : 'border-[#D2DCE4] focus:border-[#8C9DA7] focus:outline-[#8C9DA7] dark:border-[#3E3B39] dark:focus:border-[#8C9DA7]'
            }`}
          />
          <button
            type="submit"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#C9A995] bg-[#DEC3B3] px-5 py-2.5 text-sm font-bold text-[#46413E] transition-colors duration-150 hover:bg-[#C9A995] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A98273] dark:border-[#A98273] dark:bg-[#B98E83] dark:text-[#1E1C1B] dark:hover:bg-[#C9A995]"
          >
            <span>Build Expression Tree</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Inline Validation Error */}
        {error && (
          <div
            id="input-validation-error"
            role="alert"
            className="mt-3 flex items-start gap-2.5 rounded-lg border border-[#B98E83] bg-[#F0E5DF] px-3.5 py-2.5 text-sm text-[#5F5A57] dark:border-[#B98E83]/60 dark:bg-[#2F2623] dark:text-[#F0E5DF]"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#A98273] dark:text-[#DEC3B3]" aria-hidden="true" />
            <div>
              <p className="font-semibold">{error.message}</p>
              <p className="mt-0.5 text-xs text-[#827A75] dark:text-[#CFC6C0]">{error.hint}</p>
            </div>
          </div>
        )}
      </form>

      {/* Preset Examples */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold text-[#827A75] dark:text-[#B8AFA9]">
          Presets:
        </span>
        {EXPRESSION_PRESETS.map((preset) => {
          const isCurrent = inputValue.trim() === preset.input;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              title={preset.description}
              className={`min-h-[34px] whitespace-nowrap rounded-md border px-3 py-1 font-mono text-xs transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#A98273] ${
                isCurrent
                  ? 'border-[#A98273] bg-[#DEC3B3] font-semibold text-[#46413E] dark:border-[#C9A995] dark:bg-[#B98E83] dark:text-[#1E1C1B]'
                  : 'border-[#D2DCE4] bg-[#F8F2EF] text-[#5F5A57] hover:border-[#C9A995] hover:bg-[#E5D6CE] dark:border-[#3E3B39] dark:bg-[#1E1C1B] dark:text-[#DFD6D0] dark:hover:bg-[#342F2D]'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Precedence & Structure Explanation Note */}
      <div
        id="expression-precedence-note"
        className="sidebar-gradient mt-4 flex items-start gap-2.5 rounded-lg border border-[#D2DCE4] px-3.5 py-2.5 text-xs leading-relaxed text-[#5F5A57] dark:border-[#3E3B39] dark:text-[#DFD6D0]"
      >
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#A98273] dark:text-[#DEC3B3]" aria-hidden="true" />
        <p>
          <strong className="font-bold text-[#A98273] dark:text-[#DEC3B3]">
            How the Expression Tree is constructed:
          </strong>{' '}
          Recursive descent parsing resolves operator precedence (<code className="font-mono">^</code> right-associative &gt; <code className="font-mono">*, /</code> &gt; <code className="font-mono">+, -</code> left-associative) and parentheses <code className="font-mono">( )</code> so operators sit as internal nodes above their operand subtrees.
        </p>
      </div>
    </section>
  );
}
