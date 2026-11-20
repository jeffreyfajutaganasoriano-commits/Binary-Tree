# BinaryTree Studio

An interactive Data Structures and Algorithms (DSA) educational web application dedicated exclusively to **Binary Expression Trees**, recursive expression parsing, and **INORDER (LTR / Infix)**, **PREORDER (TLR / Prefix)**, and **POSTORDER (LRT / Postfix)** traversals.

## Features

- **Pure Recursive Expression Tree Engine (`src/lib/tree/`):**
  - `types.ts` — Strongly typed expression tree nodes (`operator` and `operand`), metrics, construction trace entries, and traversal step frames.
  - `parser.ts` — Tokenizes and validates mathematical infix expressions (`+`, `-`, `*`, `/`, `^`, parentheses) with clear diagnostic messages.
  - `builder.ts` — Pure recursive descent Expression Tree builder (right-associative `^`, left-associative `*`/`/` and `+`/`-`) and recursive tree metric calculations.
  - `traversals.ts` — Pure recursive `INORDER (LTR / Infix)`, `PREORDER (TLR / Prefix)`, and `POSTORDER (LRT / Postfix)` traversals recording call-stack frames, `null` base cases, and node visit order.
- **Side-by-Side SVG Visualizer & Traversal Table + Step-by-Step Recursion Inspector:**
  - Non-overlapping inorder SVG tree layout with zoom controls, Root/Leaf indicators, directional `L`/`R` edge labels, and click-to-inspect node metadata alongside the Traversal Comparison Table.
  - Play/Pause, Step Forward/Backward, Reset, speed selector, step scrubber, live recursion call stack, and construction build log.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### Verification

```bash
npm run lint
npm run build
```

## Deploying to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Vercel automatically detects Vite:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**.
