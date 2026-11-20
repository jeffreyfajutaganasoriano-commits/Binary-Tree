import { useEffect, useMemo, useState } from 'react';
import { ConceptsGuide } from './components/ConceptsGuide';
import { InorderInputPanel } from './components/InorderInputPanel';
import { type AppSection, Navbar } from './components/Navbar';
import { StepInspector } from './components/StepInspector';
import { TraversalTable } from './components/TraversalTable';
import { TreeCanvas } from './components/TreeCanvas';
import {
  buildAndAnalyzeTree,
  EXPRESSION_PRESETS,
  type ParseValidationError,
  type PresetExample,
  type TraversalType,
  type TreeBuildResult,
} from './lib/tree';

const INITIAL_EXPRESSION = EXPRESSION_PRESETS[0].input;

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('bts-theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    }
    return 'light';
  });

  const [activeSection, setActiveSection] = useState<AppSection>('visualizer');
  const [inputValue, setInputValue] = useState<string>(INITIAL_EXPRESSION);
  const [error, setError] = useState<ParseValidationError | null>(null);

  const [treeResult, setTreeResult] = useState<TreeBuildResult>(() => {
    const initial = buildAndAnalyzeTree(INITIAL_EXPRESSION);
    if (!initial.ok) {
      throw new Error(initial.error.message);
    }
    return initial.result;
  });

  const [activeTraversal, setActiveTraversal] = useState<TraversalType>('inorder');
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(700);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const rootEl = document.documentElement;
    if (theme === 'dark') {
      rootEl.classList.add('dark');
    } else {
      rootEl.classList.remove('dark');
    }
    window.localStorage.setItem('bts-theme', theme);
  }, [theme]);

  const currentSteps = useMemo(
    () => treeResult.traversals[activeTraversal].steps,
    [treeResult, activeTraversal],
  );

  const activeStep = useMemo(() => {
    if (currentSteps.length === 0) return null;
    const idx = Math.min(Math.max(stepIndex, 0), currentSteps.length - 1);
    return currentSteps[idx] ?? null;
  }, [currentSteps, stepIndex]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= currentSteps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [isPlaying, speedMs, currentSteps.length]);

  const applyBuild = (nextInput: string) => {
    const response = buildAndAnalyzeTree(nextInput);
    setIsPlaying(false);

    if (!response.ok) {
      setError(response.error);
      return;
    }

    setError(null);
    setTreeResult(response.result);
    setStepIndex(0);
    setSelectedNodeId(response.result.root.id);
  };

  const handleSelectPreset = (preset: PresetExample) => {
    setInputValue(preset.input);
    applyBuild(preset.input);
  };

  const handleChangeTraversal = (type: TraversalType) => {
    setActiveTraversal(type);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handleInspectFromTable = (type: TraversalType) => {
    setActiveTraversal(type);
    setStepIndex(0);
    setIsPlaying(false);
    setActiveSection('visualizer');
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F2EF] text-[#5F5A57] dark:bg-[#1E1C1B] dark:text-[#EDE6E2]">
      <Navbar
        activeSection={activeSection}
        onSelectSection={(section) => {
          setIsPlaying(false);
          setActiveSection(section);
        }}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {activeSection === 'visualizer' && (
          <div className="space-y-6">
            {/* Compact Academic Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-display text-3xl tracking-tight text-balance text-[#A98273] sm:text-4xl dark:text-[#DEC3B3]">
                  Binary Expression Tree Studio
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm text-[#5F5A57] dark:text-[#DFD6D0]">
                  Parse infix expressions into a <strong className="font-bold">Binary Expression Tree</strong> and trace recursive <strong className="font-bold">INORDER (Infix)</strong>, <strong className="font-bold">PREORDER (Prefix)</strong>, and <strong className="font-bold">POSTORDER (Postfix)</strong> traversals step by step.
                </p>
              </div>
              <div className="text-xs font-medium text-[#827A75] tabular-nums dark:text-[#B8AFA9]">
                Nodes: {treeResult.metrics.nodeCount} · Operands: {treeResult.metrics.leafCount} · Height: {treeResult.metrics.height}
              </div>
            </div>

            {/* Expression Input Panel */}
            <InorderInputPanel
              inputValue={inputValue}
              error={error}
              onInputChange={(val) => {
                setInputValue(val);
                if (error) setError(null);
              }}
              onSubmit={() => applyBuild(inputValue)}
              onSelectPreset={handleSelectPreset}
            />

            {/* Side-by-Side Workspace: Tree Diagram (Left) + Traversal Comparison Table (Right) */}
            <div className="grid items-stretch gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <TreeCanvas
                  root={treeResult.root}
                  metrics={treeResult.metrics}
                  activeStep={activeStep}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                />
              </div>

              <div className="lg:col-span-5">
                <TraversalTable
                  traversals={treeResult.traversals}
                  activeTraversal={activeTraversal}
                  onInspectTraversal={handleChangeTraversal}
                  compact
                />
              </div>
            </div>

            {/* Recursion & Step Inspector Below Tree + Table */}
            <StepInspector
              traversals={treeResult.traversals}
              buildTrace={treeResult.buildTrace}
              activeTraversal={activeTraversal}
              stepIndex={stepIndex}
              isPlaying={isPlaying}
              speedMs={speedMs}
              onChangeTraversal={handleChangeTraversal}
              onStepChange={(idx) => {
                setIsPlaying(false);
                setStepIndex(idx);
              }}
              onTogglePlay={() => {
                if (!isPlaying && stepIndex >= currentSteps.length - 1) {
                  setStepIndex(0);
                }
                setIsPlaying((prev) => !prev);
              }}
              onReset={() => {
                setIsPlaying(false);
                setStepIndex(0);
              }}
              onChangeSpeed={setSpeedMs}
            />
          </div>
        )}

        {activeSection === 'table' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 border-b border-[#D2DCE4] pb-5 sm:flex-row sm:items-end sm:justify-between dark:border-[#3A3735]">
              <div>
                <h1 className="font-display text-3xl tracking-tight text-balance text-[#A98273] dark:text-[#DEC3B3]">
                  Expression Traversal Comparison
                </h1>
                <p className="mt-1 text-sm text-[#5F5A57] dark:text-[#DFD6D0]">
                  Infix, Prefix, and Postfix outputs for <code className="font-mono font-semibold">{treeResult.normalizedInput}</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSection('visualizer')}
                className="inline-flex min-h-[40px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[#C9A995] bg-[#DEC3B3] px-4 py-2 text-xs font-bold text-[#46413E] transition-colors hover:bg-[#C9A995] dark:border-[#A98273] dark:bg-[#B98E83] dark:text-[#1E1C1B]"
              >
                Back to Tree Visualizer
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Total Nodes', value: treeResult.metrics.nodeCount },
                { label: 'Operands (Leaves)', value: treeResult.metrics.leafCount },
                { label: 'Operators (Internal)', value: treeResult.metrics.internalCount },
                { label: 'Tree Height', value: treeResult.metrics.height },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[#D2DCE4] bg-[#E7EBEE] p-4 dark:border-[#3A3735] dark:bg-[#272625]"
                >
                  <div className="text-xs font-semibold text-[#827A75] dark:text-[#B8AFA9]">
                    {stat.label}
                  </div>
                  <div className="mt-1 font-mono text-2xl font-bold text-[#A98273] tabular-nums dark:text-[#DEC3B3]">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            <TraversalTable
              traversals={treeResult.traversals}
              activeTraversal={activeTraversal}
              onInspectTraversal={handleInspectFromTable}
            />
          </div>
        )}

        {activeSection === 'concepts' && <ConceptsGuide />}
      </main>

      <footer className="border-t border-[#D2DCE4] bg-[#E5D6CE]/60 px-4 py-5 text-xs text-[#827A75] sm:px-6 lg:px-8 dark:border-[#3A3735] dark:bg-[#231F1E] dark:text-[#B8AFA9]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
          <span>BinaryTree Studio — Binary Expression Tree Educational Sandbox</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveSection('visualizer')}
              className="hover:text-[#5F5A57] dark:hover:text-[#F0E5DF]"
            >
              Visualizer
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('table')}
              className="hover:text-[#5F5A57] dark:hover:text-[#F0E5DF]"
            >
              Traversal Table
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('concepts')}
              className="hover:text-[#5F5A57] dark:hover:text-[#F0E5DF]"
            >
              Concepts &amp; Recursion
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
