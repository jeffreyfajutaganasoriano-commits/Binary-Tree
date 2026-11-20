import { Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';

export type AppSection = 'visualizer' | 'table' | 'concepts';

interface NavbarProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NAV_ITEMS: { id: AppSection; label: string }[] = [
  { id: 'visualizer', label: 'Visualizer' },
  { id: 'table', label: 'Traversal Table' },
  { id: 'concepts', label: 'Concepts & Recursion' },
];

export function Navbar({
  activeSection,
  onSelectSection,
  theme,
  onToggleTheme,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (id: AppSection) => {
    onSelectSection(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#D2DCE4] bg-[#F8F2EF]/95 backdrop-blur-sm dark:border-[#3A3735] dark:bg-[#1E1C1B]/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('visualizer')}
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-left font-display text-xl tracking-tight text-[#5F5A57] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A98273] dark:text-[#F0E5DF]"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="text-[#A98273] dark:text-[#C9A995]"
          >
            <line
              x1="12"
              y1="6"
              x2="6"
              y2="17"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="6"
              x2="18"
              y2="17"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            <circle cx="12" cy="5.5" r="3" fill="#B98E83" />
            <circle
              cx="6"
              cy="17.5"
              r="2.75"
              className="fill-[#F8F2EF] stroke-[#687C87] dark:fill-[#1E1C1B] dark:stroke-[#8C9DA7]"
              strokeWidth="1.75"
            />
            <circle
              cx="18"
              cy="17.5"
              r="2.75"
              className="fill-[#F8F2EF] stroke-[#687C87] dark:fill-[#1E1C1B] dark:stroke-[#8C9DA7]"
              strokeWidth="1.75"
            />
          </svg>
          <span>BinaryTree Studio</span>
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative shrink-0 whitespace-nowrap py-1 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A98273] ${
                  isActive
                    ? 'text-[#A98273] dark:text-[#DEC3B3]'
                    : 'text-[#827A75] hover:text-[#5F5A57] dark:text-[#B8AFA9] dark:hover:text-[#F0E5DF]'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full transition-transform duration-150 ${
                    isActive
                      ? 'scale-x-100 bg-[#B98E83] dark:bg-[#DEC3B3]'
                      : 'scale-x-0 bg-transparent'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Theme action & mobile drawer toggle */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-[#D2DCE4] bg-[#DEC3B3] px-3.5 text-xs font-bold text-[#46413E] transition-colors duration-150 hover:bg-[#C9A995] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A98273] dark:border-[#4A4542] dark:bg-[#342F2D] dark:text-[#F0E5DF] dark:hover:bg-[#443D3A]"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-[#DEC3B3]" aria-hidden="true" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-[#5F5A57]" aria-hidden="true" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#D2DCE4] bg-[#E7EBEE] text-[#5F5A57] transition-colors hover:bg-[#D2DCE4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A98273] md:hidden dark:border-[#3A3735] dark:bg-[#2A2726] dark:text-[#F0E5DF] dark:hover:bg-[#363230]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          id="mobile-nav-drawer"
          className="border-t border-[#D2DCE4] bg-[#E5D6CE] px-4 py-3 md:hidden dark:border-[#3A3735] dark:bg-[#262220]"
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-[44px] items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#DEC3B3] text-[#46413E] dark:bg-[#3A3330] dark:text-[#F0E5DF]'
                      : 'text-[#5F5A57] hover:bg-[#F0E5DF] dark:text-[#CFC6C0] dark:hover:bg-[#2F2B29]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="text-xs font-bold text-[#A98273] dark:text-[#DEC3B3]">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
