export function ConceptsGuide() {
  return (
    <section
      aria-labelledby="concepts-guide-heading"
      className="space-y-8"
    >
      <div className="border-b border-[#D2DCE4] pb-5 dark:border-[#3A3735]">
        <h1
          id="concepts-guide-heading"
          className="font-display text-3xl tracking-tight text-[#A98273] dark:text-[#DEC3B3]"
        >
          Binary Expression Trees, Recursion &amp; Traversals
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#5F5A57] dark:text-[#DFD6D0]">
          A <strong className="font-bold">Binary Expression Tree</strong> is a binary tree representing an algebraic expression: internal nodes hold operators and leaf nodes hold operands.
        </p>
      </div>

      {/* 1. Core Terminology & Visual Anatomy */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="sidebar-gradient rounded-xl border border-[#D2DCE4] p-6 lg:col-span-5 dark:border-[#3A3735]">
          <h2 className="font-heading text-base font-bold text-[#A98273] dark:text-[#DEC3B3]">
            01. Anatomy of an Expression Tree
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[#5F5A57] dark:text-[#DFD6D0]">
            Every subtree inside an expression tree is a valid sub-expression, making recursion the natural way to build, measure, and evaluate it.
          </p>

          <svg
            viewBox="0 0 360 220"
            role="img"
            aria-label="Labeled binary expression tree diagram for A * B + C"
            className="mt-4 w-full rounded-lg border border-[#D2DCE4] bg-[#F8F2EF] dark:border-[#3E3B39] dark:bg-[#1E1C1B]"
          >
            <rect
              x="28"
              y="84"
              width="148"
              height="118"
              rx="8"
              fill="none"
              strokeDasharray="4 4"
              stroke="#B98E83"
              strokeWidth="1.5"
            />
            <text
              x="38"
              y="100"
              fill="#A98273"
              className="font-mono text-[9.5px] font-semibold"
            >
              Left Subtree (A * B)
            </text>

            <line x1="180" y1="42" x2="104" y2="112" stroke="#8C9DA7" strokeWidth="2" />
            <line x1="180" y1="42" x2="256" y2="112" stroke="#8C9DA7" strokeWidth="2" />
            <line x1="104" y1="112" x2="62" y2="174" stroke="#8C9DA7" strokeWidth="2" />
            <line x1="104" y1="112" x2="146" y2="174" stroke="#8C9DA7" strokeWidth="2" />

            <circle cx="180" cy="42" r="18" fill="#B98E83" />
            <text x="180" y="47" textAnchor="middle" fill="#F8F2EF" className="font-mono text-xs font-bold">
              +
            </text>
            <text x="206" y="40" className="font-mono text-[10px] font-semibold fill-[#5F5A57] dark:fill-[#DFD6D0]">
              Root Operator (depth 0)
            </text>

            <circle cx="104" cy="112" r="17" fill="#DEC3B3" stroke="#A98273" strokeWidth="2" />
            <text x="104" y="117" textAnchor="middle" fill="#46413E" className="font-mono text-xs font-semibold">
              *
            </text>

            <circle cx="256" cy="112" r="17" fill="#8C9DA7" stroke="#687C87" strokeWidth="2" />
            <text x="256" y="117" textAnchor="middle" fill="#F8F2EF" className="font-mono text-xs font-semibold">
              C
            </text>
            <text x="256" y="143" textAnchor="middle" fill="#687C87" className="font-mono text-[10px] font-semibold">
              Leaf Operand
            </text>

            <circle cx="62" cy="174" r="16" fill="#8C9DA7" stroke="#687C87" strokeWidth="2" />
            <text x="62" y="178" textAnchor="middle" fill="#F8F2EF" className="font-mono text-xs font-semibold">
              A
            </text>

            <circle cx="146" cy="174" r="16" fill="#8C9DA7" stroke="#687C87" strokeWidth="2" />
            <text x="146" y="178" textAnchor="middle" fill="#F8F2EF" className="font-mono text-xs font-semibold">
              B
            </text>
          </svg>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          {[
            {
              term: 'Root Node',
              desc: 'The top-level node with no parent (depth 0). It holds the lowest-precedence outer operator that evaluates last.',
            },
            {
              term: 'Internal Operator Nodes',
              desc: 'Every internal node holds a binary operator (+, -, *, /, ^) whose left and right children represent its two sub-expressions.',
            },
            {
              term: 'Leaf Operand Nodes',
              desc: 'Terminal nodes with no children (left = null, right = null). Every operand (number or variable) sits at a leaf.',
            },
            {
              term: 'Subtree Grouping',
              desc: 'Parentheses and higher-precedence operators create deeper subtrees so multiplication, division, and exponents bind before addition.',
            },
            {
              term: 'Depth vs. Height',
              desc: 'Depth counts edges from the root down to a node. Height counts edges from a node down to its deepest leaf (single node = 0, null = -1).',
            },
            {
              term: 'Operator Precedence',
              desc: 'Exponentiation (^) is highest and right-associative; multiplication (*) and division (/) bind next; addition (+) and subtraction (-) bind lowest.',
            },
          ].map((item) => (
            <div
              key={item.term}
              className="rounded-xl border border-[#D2DCE4] bg-[#E7EBEE] p-4 dark:border-[#3A3735] dark:bg-[#272625]"
            >
              <h3 className="font-heading text-sm font-bold text-[#A98273] dark:text-[#DEC3B3]">
                {item.term}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#5F5A57] dark:text-[#DFD6D0]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Precedence vs. Parentheses Visual Comparison */}
      <div className="rounded-xl border border-[#D2DCE4] bg-[#E7EBEE] p-6 dark:border-[#3A3735] dark:bg-[#272625]">
        <h2 className="font-heading text-base font-bold text-[#A98273] dark:text-[#DEC3B3]">
          02. How Precedence &amp; Parentheses Shape the Tree
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-[#5F5A57] dark:text-[#DFD6D0]">
          Notice how <code className="font-mono font-semibold">A * B + C</code> places <code className="font-mono">+</code> at the root, whereas <code className="font-mono font-semibold">A * (B + C)</code> places <code className="font-mono">*</code> at the root. Parentheses are not stored as nodes—the tree structure itself captures the grouping!
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-[#D2DCE4] bg-[#F8F2EF] p-4 dark:border-[#3E3B39] dark:bg-[#1E1C1B]">
            <div className="font-heading text-sm font-bold text-[#5F5A57] dark:text-[#F0E5DF]">
              Default Precedence: A * B + C
            </div>
            <div className="mt-1 font-mono text-[11px] text-[#827A75] dark:text-[#B8AFA9]">
              Prefix: + * A B C · Postfix: A B * C +
            </div>
            <svg viewBox="0 0 240 140" className="mt-3 h-32 w-full">
              <line x1="140" y1="26" x2="86" y2="72" stroke="#8C9DA7" strokeWidth="2" />
              <line x1="140" y1="26" x2="194" y2="72" stroke="#8C9DA7" strokeWidth="2" />
              <line x1="86" y1="72" x2="52" y2="118" stroke="#8C9DA7" strokeWidth="2" />
              <line x1="86" y1="72" x2="120" y2="118" stroke="#8C9DA7" strokeWidth="2" />
              <circle cx="140" cy="26" r="15" fill="#B98E83" />
              <text x="140" y="31" textAnchor="middle" fill="#F8F2EF" className="font-mono text-xs font-bold">+</text>
              <circle cx="86" cy="72" r="15" fill="#DEC3B3" stroke="#A98273" strokeWidth="2" />
              <text x="86" y="77" textAnchor="middle" fill="#46413E" className="font-mono text-xs font-semibold">*</text>
              <circle cx="194" cy="72" r="15" fill="#8C9DA7" stroke="#687C87" strokeWidth="2" />
              <text x="194" y="77" textAnchor="middle" fill="#F8F2EF" className="font-mono text-xs font-semibold">C</text>
              <circle cx="52" cy="118" r="14" fill="#8C9DA7" stroke="#687C87" strokeWidth="2" />
              <text x="52" y="122" textAnchor="middle" fill="#F8F2EF" className="font-mono text-xs font-semibold">A</text>
              <circle cx="120" cy="118" r="14" fill="#8C9DA7" stroke="#687C87" strokeWidth="2" />
              <text x="120" y="122" textAnchor="middle" fill="#F8F2EF" className="font-mono text-xs font-semibold">B</text>
            </svg>
          </div>

          <div className="rounded-lg border border-[#D2DCE4] bg-[#F8F2EF] p-4 dark:border-[#3E3B39] dark:bg-[#1E1C1B]">
            <div className="font-heading text-sm font-bold text-[#5F5A57] dark:text-[#F0E5DF]">
              Parenthesized Grouping: A * (B + C)
            </div>
            <div className="mt-1 font-mono text-[11px] text-[#827A75] dark:text-[#B8AFA9]">
              Prefix: * A + B C · Postfix: A B C + *
            </div>
            <svg viewBox="0 0 240 140" className="mt-3 h-32 w-full">
              <line x1="100" y1="26" x2="46" y2="72" stroke="#8C9DA7" strokeWidth="2" />
              <line x1="100" y1="26" x2="154" y2="72" stroke="#8C9DA7" strokeWidth="2" />
              <line x1="154" y1="72" x2="120" y2="118" stroke="#8C9DA7" strokeWidth="2" />
              <line x1="154" y1="72" x2="188" y2="118" stroke="#8C9DA7" strokeWidth="2" />
              <circle cx="100" cy="26" r="15" fill="#687C87" />
              <text x="100" y="31" textAnchor="middle" fill="#F8F2EF" className="font-mono text-xs font-bold">*</text>
              <circle cx="46" cy="72" r="15" fill="#8C9DA7" stroke="#687C87" strokeWidth="2" />
              <text x="46" y="77" textAnchor="middle" fill="#F8F2EF" className="font-mono text-xs font-semibold">A</text>
              <circle cx="154" cy="72" r="15" fill="#DEC3B3" stroke="#A98273" strokeWidth="2" />
              <text x="154" y="77" textAnchor="middle" fill="#46413E" className="font-mono text-xs font-semibold">+</text>
              <circle cx="120" cy="118" r="14" fill="#8C9DA7" stroke="#687C87" strokeWidth="2" />
              <text x="120" y="122" textAnchor="middle" fill="#F8F2EF" className="font-mono text-xs font-semibold">B</text>
              <circle cx="188" cy="118" r="14" fill="#8C9DA7" stroke="#687C87" strokeWidth="2" />
              <text x="188" y="122" textAnchor="middle" fill="#F8F2EF" className="font-mono text-xs font-semibold">C</text>
            </svg>
          </div>
        </div>
      </div>

      {/* 3. The Three Traversals */}
      <div className="rounded-xl border border-[#D2DCE4] bg-[#E7EBEE] p-6 dark:border-[#3A3735] dark:bg-[#272625]">
        <h2 className="font-heading text-base font-bold text-[#A98273] dark:text-[#DEC3B3]">
          03. Recursive Traversals: Infix (LTR), Prefix (TLR), Postfix (LRT)
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-[#5F5A57] dark:text-[#DFD6D0]">
          All three depth-first traversals share the exact same <strong className="font-bold">Base Case</strong> (<code className="font-mono">if (node === null) return;</code>) and differ only in when the current node <code className="font-mono">T</code> is visited relative to its <code className="font-mono">L</code> and <code className="font-mono">R</code> subtrees.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[#D2DCE4] bg-[#F8F2EF] p-4 dark:border-[#3E3B39] dark:bg-[#1E1C1B]">
            <div className="font-heading text-sm font-bold text-[#5F5A57] dark:text-[#F0E5DF]">
              INORDER (LTR)
            </div>
            <div className="mt-0.5 font-mono text-xs font-semibold text-[#A98273] dark:text-[#DEC3B3]">
              Left → Root → Right · Infix
            </div>
            <pre className="mt-3 overflow-x-auto rounded border border-[#D2DCE4] bg-[#E7EBEE] p-3 font-mono text-[11px] leading-relaxed text-[#5F5A57] dark:border-[#3A3735] dark:bg-[#272625] dark:text-[#DFD6D0]">
{`function inorder(node) {
  if (node === null) return;
  inorder(node.left);   // L
  visit(node.value);    // T
  inorder(node.right);  // R
}`}
            </pre>
            <p className="mt-2.5 text-xs leading-relaxed text-[#827A75] dark:text-[#B8AFA9]">
              Recovers standard algebraic Infix notation (wrapping lower-precedence child expressions in parentheses).
            </p>
          </div>

          <div className="rounded-lg border border-[#D2DCE4] bg-[#F8F2EF] p-4 dark:border-[#3E3B39] dark:bg-[#1E1C1B]">
            <div className="font-heading text-sm font-bold text-[#5F5A57] dark:text-[#F0E5DF]">
              PREORDER (TLR)
            </div>
            <div className="mt-0.5 font-mono text-xs font-semibold text-[#A98273] dark:text-[#DEC3B3]">
              Root → Left → Right · Prefix
            </div>
            <pre className="mt-3 overflow-x-auto rounded border border-[#D2DCE4] bg-[#E7EBEE] p-3 font-mono text-[11px] leading-relaxed text-[#5F5A57] dark:border-[#3A3735] dark:bg-[#272625] dark:text-[#DFD6D0]">
{`function preorder(node) {
  if (node === null) return;
  visit(node.value);    // T
  preorder(node.left);  // L
  preorder(node.right); // R
}`}
            </pre>
            <p className="mt-2.5 text-xs leading-relaxed text-[#827A75] dark:text-[#B8AFA9]">
              Produces unambiguous Polish Prefix notation where every operator precedes its two operand sub-expressions.
            </p>
          </div>

          <div className="rounded-lg border border-[#D2DCE4] bg-[#F8F2EF] p-4 dark:border-[#3E3B39] dark:bg-[#1E1C1B]">
            <div className="font-heading text-sm font-bold text-[#5F5A57] dark:text-[#F0E5DF]">
              POSTORDER (LRT)
            </div>
            <div className="mt-0.5 font-mono text-xs font-semibold text-[#A98273] dark:text-[#DEC3B3]">
              Left → Right → Root · Postfix
            </div>
            <pre className="mt-3 overflow-x-auto rounded border border-[#D2DCE4] bg-[#E7EBEE] p-3 font-mono text-[11px] leading-relaxed text-[#5F5A57] dark:border-[#3A3735] dark:bg-[#272625] dark:text-[#DFD6D0]">
{`function postorder(node) {
  if (node === null) return;
  postorder(node.left);  // L
  postorder(node.right); // R
  visit(node.value);     // T
}`}
            </pre>
            <p className="mt-2.5 text-xs leading-relaxed text-[#827A75] dark:text-[#B8AFA9]">
              Produces Reverse Polish Postfix notation—directly stack-evaluatable without parentheses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
