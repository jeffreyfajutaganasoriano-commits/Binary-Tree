import type {
  ExpressionToken,
  ParseValidationError,
  PresetExample,
} from './types';

const OPERATORS = new Set(['+', '-', '*', '/', '^']);
const MAX_EXPRESSION_TOKENS = 63;

export const EXPRESSION_PRESETS: PresetExample[] = [
  {
    id: 'expr-arith-mix',
    label: 'A * B + C / D',
    input: 'A * B + C / D',
    description: 'Multiplication and division bind tighter than addition, forming balanced operator subtrees.',
  },
  {
    id: 'expr-num-precedence',
    label: '3 + 5 + 9 * 2',
    input: '3 + 5 + 9 * 2',
    description: 'Left-associative addition chains on the left while 9 * 2 groups first on the right.',
  },
  {
    id: 'expr-parens',
    label: '(A + B) * (C - D)',
    input: '(A + B) * (C - D)',
    description: 'Parentheses override default precedence so * sits at the root above + and -.',
  },
  {
    id: 'expr-exponent',
    label: 'X ^ Y ^ Z + M * N',
    input: 'X ^ Y ^ Z + M * N',
    description: 'Right-associative exponentiation (^) nests rightwards before multiplying and adding.',
  },
];

export type ExpressionParseResult =
  | { ok: true; tokens: ExpressionToken[]; normalized: string }
  | { ok: false; error: ParseValidationError };

function isWhitespace(ch: string): boolean {
  return /\s/.test(ch);
}

function isIdentifierStart(ch: string): boolean {
  return /[a-zA-Z0-9_]/.test(ch);
}

function isIdentifierPart(ch: string): boolean {
  return /[a-zA-Z0-9_.]/.test(ch);
}

/**
 * Tokenizes and validates an infix/inorder mathematical expression.
 */
export function parseExpressionInput(rawInput: string): ExpressionParseResult {
  const trimmed = rawInput.trim();
  if (trimmed.length === 0) {
    return {
      ok: false,
      error: {
        message: 'Please enter an infix expression to build a Binary Expression Tree.',
        hint: 'Try an expression such as A * B + C / D or (3 + 5) * 2.',
      },
    };
  }

  const tokens: ExpressionToken[] = [];
  let i = 0;

  while (i < trimmed.length) {
    const ch = trimmed[i];

    if (isWhitespace(ch)) {
      i += 1;
      continue;
    }

    if (ch === '(') {
      tokens.push({ kind: 'lparen', value: '(', position: i });
      i += 1;
      continue;
    }

    if (ch === ')') {
      tokens.push({ kind: 'rparen', value: ')', position: i });
      i += 1;
      continue;
    }

    if (OPERATORS.has(ch)) {
      tokens.push({ kind: 'operator', value: ch, position: i });
      i += 1;
      continue;
    }

    if (isIdentifierStart(ch)) {
      const start = i;
      let value = '';
      while (i < trimmed.length && isIdentifierPart(trimmed[i])) {
        value += trimmed[i];
        i += 1;
      }

      if (value.endsWith('.')) {
        return {
          ok: false,
          error: {
            message: `Incomplete numeric token "${value}" at character ${start + 1}.`,
            hint: 'Include digits after the decimal point, e.g. 3.5.',
            position: start,
          },
        };
      }

      tokens.push({ kind: 'operand', value, position: start });
      continue;
    }

    return {
      ok: false,
      error: {
        message: `Unsupported character "${ch}" at position ${i + 1}.`,
        hint: 'Use letters/numbers for operands, +, -, *, /, ^ for operators, and ( ) for grouping.',
        position: i,
      },
    };
  }

  if (tokens.length > MAX_EXPRESSION_TOKENS) {
    return {
      ok: false,
      error: {
        message: `Expression has ${tokens.length} tokens (maximum ${MAX_EXPRESSION_TOKENS} for clear visualization).`,
        hint: 'Shorten the expression so each node and edge stays legible on the tree canvas.',
      },
    };
  }

  let parenDepth = 0;
  let expectOperand = true;

  for (let idx = 0; idx < tokens.length; idx += 1) {
    const token = tokens[idx];

    if (expectOperand) {
      if (token.kind === 'operand') {
        expectOperand = false;
      } else if (token.kind === 'lparen') {
        parenDepth += 1;
      } else if (token.kind === 'rparen') {
        const prev = tokens[idx - 1];
        if (prev && prev.kind === 'lparen') {
          return {
            ok: false,
            error: {
              message: `Empty parentheses "()" found at character ${token.position + 1}.`,
              hint: 'Place an operand or sub-expression inside every pair of parentheses.',
              position: token.position,
            },
          };
        }
        return {
          ok: false,
          error: {
            message: `Unexpected closing parenthesis ")" at character ${token.position + 1}.`,
            hint: 'An operator or opening of expression cannot be immediately followed by ")".',
            position: token.position,
          },
        };
      } else {
        return {
          ok: false,
          error: {
            message: `Missing operand before binary operator "${token.value}" at character ${token.position + 1}.`,
            hint: 'Every operator (+, -, *, /, ^) requires both a left and right operand.',
            position: token.position,
          },
        };
      }
    } else {
      if (token.kind === 'operator') {
        expectOperand = true;
      } else if (token.kind === 'rparen') {
        parenDepth -= 1;
        if (parenDepth < 0) {
          return {
            ok: false,
            error: {
              message: `Unmatched closing parenthesis ")" at character ${token.position + 1}.`,
              hint: 'Check that every ")" has a matching "(" earlier in the expression.',
              position: token.position,
            },
          };
        }
      } else if (token.kind === 'lparen') {
        return {
          ok: false,
          error: {
            message: `Missing operator before "(" at character ${token.position + 1}.`,
            hint: 'Write explicit multiplication such as A * (B + C) instead of A(B + C).',
            position: token.position,
          },
        };
      } else {
        return {
          ok: false,
          error: {
            message: `Missing operator before operand "${token.value}" at character ${token.position + 1}.`,
            hint: 'Separate adjacent operands with an operator (+, -, *, /, ^).',
            position: token.position,
          },
        };
      }
    }
  }

  if (expectOperand) {
    const last = tokens[tokens.length - 1];
    return {
      ok: false,
      error: {
        message: `Expression cannot end with "${last.value}".`,
        hint: 'Add a right-hand operand after the trailing operator.',
        position: last.position,
      },
    };
  }

  if (parenDepth > 0) {
    return {
      ok: false,
      error: {
        message: `Unbalanced parentheses: missing ${parenDepth} closing ")" ${parenDepth === 1 ? 'parenthesis' : 'parentheses'}.`,
        hint: 'Ensure every opening "(" has a corresponding closing ")".',
      },
    };
  }

  const normalized = tokens.map((t) => t.value).join(' ');
  return { ok: true, tokens, normalized };
}
