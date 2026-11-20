import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import type {
  BuildTraceStep,
  TraversalComparison,
  TraversalStep,
  TraversalType,
} from '../lib/tree';

interface StepInspectorProps {
  traversals: TraversalComparison;
  buildTrace: BuildTraceStep[];
  activeTraversal: TraversalType;
  stepIndex: number;
  isPlaying: boolean;
  speedMs: number;
  onChangeTraversal: (type: TraversalType) => void;
  onStepChange: (nextIndex: number) => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onChangeSpeed: (ms: number) => void;
}

const SPEED_OPTIONS = [
  { label: '0.5×', ms: 1200 },
  { label: '1×', ms: 700 },
  { label: '1.5×', ms: 420 },
  { label: '2×', ms: 220 },
];

export function StepInspector({
  traversals,
  buildTrace,
  activeTraversal,
  stepIndex,
  isPlaying,
  speedMs,
  onChangeTraversal,
  onStepChange,
  onTogglePlay,
  onReset,
  onChangeSpeed,
}: StepInspectorProps) {
  const [inspectorTab, setInspectorTab] = useState<'traversal' | 'construction'>('traversal');

  const currentSequence = traversals[activeTraversal];
  const steps = currentSequence.steps;
  const clampedIndex = Math.min(Math.max(stepIndex, 0), Math.max(steps.length - 1, 0));
  const currentStep: TraversalStep | undefined = steps[clampedIndex];

  return (
    <aside
      aria-labelledby="step-inspector-heading"
      className="sidebar-gradient flex flex-col overflow-hidden rounded-xl border border-[#D2DCE4] dark:border-[#3A3735]"
    >
      {/* Header + Tab Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D2DCE4] px-5 py-3.5 dark:border-[#3E3B39]">
        <div>
          <h2
            id="step-inspector-heading"
            className="font-heading text-base font-bold text-[#A98273] dark:text-[#DEC3B3]"
          >
            Recursion &amp; Step Inspector
          </h2>
          <p className="text-xs text-[#827A75] dark:text-[#B8AFA9]">
            Watch how recursive calls visit nodes and unwind the call stack.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Inspector Mode"
          className="inline-flex rounded-lg border border-[#D2DCE4] bg-[#F8F2EF] p-0.5 dark:border-[#3E3B39] dark:bg-[#1E1C1B]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={inspectorTab === 'traversal'}
            onClick={() => setInspectorTab('traversal')}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              inspectorTab === 'traversal'
                ? 'bg-[#DEC3B3] text-[#46413E] dark:bg-[#B98E83] dark:text-[#1E1C1B]'
                : 'text-[#827A75] hover:text-[#5F5A57] dark:text-[#B8AFA9] dark:hover:text-[#F0E5DF]'
            }`}
          >
            Traversal Trace
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={inspectorTab === 'construction'}
            onClick={() => setInspectorTab('construction')}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              inspectorTab === 'construction'
                ? 'bg-[#DEC3B3] text-[#46413E] dark:bg-[#B98E83] dark:text-[#1E1C1B]'
                : 'text-[#827A75] hover:text-[#5F5A57] dark:text-[#B8AFA9] dark:hover:text-[#F0E5DF]'
            }`}
          >
            Build Log
          </button>
        </div>
      </div>

      {inspectorTab === 'traversal' ? (
        <div className="grid gap-5 p-5 lg:grid-cols-12">
          {/* Left Column: Playback Controls & Current Step Explanation */}
          <div className="flex flex-col gap-4 lg:col-span-6">
            {/* Traversal Selector */}
            <div>
              <div className="mb-1.5 text-xs font-semibold text-[#5F5A57] dark:text-[#DFD6D0]">
                Active Traversal Order
              </div>
              <div
                role="group"
                aria-label="Select traversal order to step through"
                className="grid grid-cols-3 gap-1.5 rounded-lg border border-[#D2DCE4] bg-[#F8F2EF] p-1 dark:border-[#3E3B39] dark:bg-[#1E1C1B]"
              >
                {(
                  [
                    { id: 'inorder', label: 'Inorder (LTR)' },
                    { id: 'preorder', label: 'Preorder (TLR)' },
                    { id: 'postorder', label: 'Postorder (LRT)' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onChangeTraversal(item.id)}
                    aria-pressed={activeTraversal === item.id}
                    className={`whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
                      activeTraversal === item.id
                        ? 'bg-[#687C87] text-[#F8F2EF] dark:bg-[#8C9DA7] dark:text-[#1E1C1B]'
                        : 'text-[#827A75] hover:text-[#5F5A57] dark:text-[#B8AFA9] dark:hover:text-[#F0E5DF]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-col gap-3 rounded-lg border border-[#D2DCE4] bg-[#E7EBEE] p-3.5 dark:border-[#3E3B39] dark:bg-[#272625]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onTogglePlay}
                    className="inline-flex min-h-[38px] items-center gap-1.5 whitespace-nowrap rounded-md border border-[#C9A995] bg-[#DEC3B3] px-3.5 py-1.5 text-xs font-bold text-[#46413E] transition-colors hover:bg-[#C9A995] focus-visible:outline-2 focus-visible:outline-[#A98273] dark:border-[#A98273] dark:bg-[#B98E83] dark:text-[#1E1C1B]"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Play</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onStepChange(Math.max(0, clampedIndex - 1))}
                    disabled={clampedIndex <= 0}
                    aria-label="Step backward"
                    className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-md border border-[#D2DCE4] bg-[#F8F2EF] text-[#5F5A57] transition-colors hover:bg-[#DEC3B3] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#3E3B39] dark:bg-[#1E1C1B] dark:text-[#DFD6D0] dark:hover:bg-[#342F2D]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onStepChange(Math.min(steps.length - 1, clampedIndex + 1))}
                    disabled={clampedIndex >= steps.length - 1}
                    aria-label="Step forward"
                    className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-md border border-[#D2DCE4] bg-[#F8F2EF] text-[#5F5A57] transition-colors hover:bg-[#DEC3B3] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#3E3B39] dark:bg-[#1E1C1B] dark:text-[#DFD6D0] dark:hover:bg-[#342F2D]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={onReset}
                    aria-label="Reset traversal to step 1"
                    className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-md border border-[#D2DCE4] bg-[#F8F2EF] text-[#5F5A57] transition-colors hover:bg-[#DEC3B3] dark:border-[#3E3B39] dark:bg-[#1E1C1B] dark:text-[#DFD6D0] dark:hover:bg-[#342F2D]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Speed Selector */}
                <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
                  {SPEED_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => onChangeSpeed(opt.ms)}
                      aria-pressed={speedMs === opt.ms}
                      className={`rounded px-2 py-1 font-mono text-[11px] font-semibold tabular-nums transition-colors ${
                        speedMs === opt.ms
                          ? 'bg-[#687C87] text-[#F8F2EF] dark:bg-[#8C9DA7] dark:text-[#1E1C1B]'
                          : 'text-[#827A75] hover:bg-[#D2DCE4]/70 dark:text-[#B8AFA9] dark:hover:bg-[#342F2D]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrubber Slider */}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-[#5F5A57] tabular-nums dark:text-[#DFD6D0]">
                  <label htmlFor="traversal-step-slider" className="font-semibold">
                    Execution Step
                  </label>
                  <span className="font-mono">
                    {clampedIndex + 1} / {steps.length}
                  </span>
                </div>
                <input
                  id="traversal-step-slider"
                  type="range"
                  min={0}
                  max={Math.max(steps.length - 1, 0)}
                  value={clampedIndex}
                  onChange={(e) => onStepChange(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer accent-[#A98273] dark:accent-[#DEC3B3]"
                />
              </div>
            </div>

            {/* Current Step Plain-English Explanation */}
            {currentStep && (
              <div className="rounded-lg border border-[#D2DCE4] bg-[#F8F2EF] p-4 dark:border-[#3E3B39] dark:bg-[#1E1C1B]">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-semibold text-[#A98273] dark:text-[#DEC3B3]">
                    {currentStep.ruleLabel}
                  </span>
                  {currentStep.nodeValue !== null && (
                    <span className="font-mono text-[#827A75] dark:text-[#B8AFA9]">
                      Node: {currentStep.nodeValue}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-[#5F5A57] dark:text-[#DFD6D0]">
                  {currentStep.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Emitted Output & Call Stack */}
          <div className="flex flex-col gap-4 lg:col-span-6">
            {/* Output Accumulated So Far */}
            {currentStep && (
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs text-[#5F5A57] tabular-nums dark:text-[#DFD6D0]">
                  <span className="font-semibold">Emitted Output ({currentSequence.code})</span>
                  <span className="font-mono text-[#827A75] dark:text-[#B8AFA9]">
                    {currentStep.visitedNodes.length} / {currentSequence.tokens.length} visited
                  </span>
                </div>
                <div className="min-h-[46px] rounded-lg border border-[#D2DCE4] bg-[#F8F2EF] px-3 py-2.5 font-mono text-sm text-[#5F5A57] dark:border-[#3E3B39] dark:bg-[#1E1C1B] dark:text-[#F0E5DF]">
                  {currentStep.visitedNodes.length === 0 ? (
                    <span className="text-xs text-[#827A75] dark:text-[#B8AFA9]">
                      No nodes emitted yet — descending into recursive calls.
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {currentStep.visitedNodes.map((token, idx) => {
                        const isLatest =
                          idx === currentStep.visitedNodes.length - 1 &&
                          currentStep.action === 'visit-node';
                        return (
                          <span
                            key={`${token.nodeId}-${token.order}`}
                            className={`rounded px-2 py-0.5 text-xs font-semibold tabular-nums ${
                              isLatest
                                ? 'bg-[#A98273] text-[#F8F2EF] dark:bg-[#DEC3B3] dark:text-[#1E1C1B]'
                                : 'bg-[#8C9DA7] text-[#F8F2EF] dark:bg-[#687C87] dark:text-[#F8F2EF]'
                            }`}
                          >
                            {token.value}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Live Recursion Call Stack */}
            {currentStep && (
              <div className="flex-1">
                <div className="mb-1.5 flex items-center justify-between text-xs text-[#5F5A57] tabular-nums dark:text-[#DFD6D0]">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Layers className="h-3.5 w-3.5 text-[#A98273]" aria-hidden="true" />
                    <span>Active Recursion Call Stack</span>
                  </span>
                  <span className="font-mono text-[#827A75] dark:text-[#B8AFA9]">
                    Depth: {currentStep.callStack.length}
                  </span>
                </div>
                <div className="max-h-52 overflow-y-auto rounded-lg border border-[#D2DCE4] bg-[#F8F2EF] p-2.5 font-mono text-xs dark:border-[#3E3B39] dark:bg-[#1E1C1B]">
                  {currentStep.callStack.length === 0 ? (
                    <div className="py-3 text-center text-[#827A75] dark:text-[#B8AFA9]">
                      Call stack empty (traversal complete)
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {currentStep.callStack.map((frame, idx) => {
                        const isTop = idx === currentStep.callStack.length - 1;
                        return (
                          <li
                            key={`${frame.nodeId}-${frame.depth}`}
                            style={{ paddingLeft: `${Math.min(frame.depth, 6) * 10 + 8}px` }}
                            className={`flex items-center justify-between rounded px-2 py-1 ${
                              isTop
                                ? 'bg-[#DEC3B3] font-semibold text-[#46413E] dark:bg-[#B98E83] dark:text-[#1E1C1B]'
                                : 'text-[#827A75] dark:text-[#B8AFA9]'
                            }`}
                          >
                            <span>
                              {frame.fnName}(&quot;{frame.nodeValue}&quot;)
                            </span>
                            <span className="text-[11px] opacity-85">{frame.phase}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Construction Build Log */
        <div className="flex flex-1 flex-col gap-3 p-5">
          <p className="text-xs leading-relaxed text-[#5F5A57] dark:text-[#DFD6D0]">
            Step-by-step recursive construction trace showing how your inputted sequence was transformed into a binary tree ({buildTrace.length} operations).
          </p>
          <ol className="grid max-h-[340px] gap-2.5 overflow-y-auto pr-1 md:grid-cols-2">
            {buildTrace.map((entry) => (
              <li
                key={entry.stepNumber}
                className="rounded-lg border border-[#D2DCE4] bg-[#F8F2EF] p-3 dark:border-[#3E3B39] dark:bg-[#1E1C1B]"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-semibold text-[#A98273] dark:text-[#DEC3B3]">
                    {entry.stepNumber}. {entry.summary}
                  </span>
                  <span className="font-mono text-[11px] text-[#827A75] tabular-nums dark:text-[#B8AFA9]">
                    depth {entry.depth}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#5F5A57] dark:text-[#CFC6C0]">
                  {entry.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </aside>
  );
}
