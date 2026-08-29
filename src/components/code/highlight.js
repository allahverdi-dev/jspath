/**
 * A small JavaScript/HTML tokenizer for read-only code display.
 *
 * Written by hand rather than pulling in Prism or Shiki: the lesson pages render
 * hundreds of short snippets, and a 2KB scanner keeps that free of a syntax-
 * highlighting dependency and its bundle cost. The Monaco editor is used where
 * real editing happens, so this only needs to be good at *display*.
 */

const KEYWORDS = new Set([
  'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
  'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'from', 'function', 'get',
  'if', 'import', 'in', 'instanceof', 'let', 'new', 'of', 'return', 'set', 'static', 'super',
  'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'as',
]);

const LITERALS = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);

const BUILTINS = new Set([
  'Array', 'Object', 'String', 'Number', 'Boolean', 'Symbol', 'BigInt', 'Math', 'JSON', 'Date',
  'RegExp', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'Proxy', 'Reflect', 'Error',
  'TypeError', 'RangeError', 'SyntaxError', 'ReferenceError', 'console', 'document', 'window',
  'globalThis', 'localStorage', 'sessionStorage', 'fetch', 'setTimeout', 'setInterval',
  'clearTimeout', 'clearInterval', 'queueMicrotask', 'structuredClone', 'Intl', 'AbortController',
]);

const isIdentStart = (c) => /[A-Za-z_$]/.test(c);
const isIdentPart = (c) => /[A-Za-z0-9_$]/.test(c);
const isDigit = (c) => /[0-9]/.test(c);

/**
 * Decide whether a `/` begins a regex literal or is a division operator, by
 * looking at the last significant token. Without this, `a / b / c` would be
 * highlighted as a regex.
 */
function regexAllowed(tokens) {
  for (let i = tokens.length - 1; i >= 0; i -= 1) {
    const t = tokens[i];
    if (t.type === 'space' || t.type === 'comment') continue;
    if (t.type === 'keyword') return t.value !== 'this';
    if (t.type === 'punct') return !')]}'.includes(t.value);
    return false;
  }
  return true;
}

/** @returns {Array<{type: string, value: string}>} */
export function tokenizeJs(source) {
  const tokens = [];
  let i = 0;
  const n = source.length;

  while (i < n) {
    const c = source[i];

    // Whitespace
    if (/\s/.test(c)) {
      let j = i;
      while (j < n && /\s/.test(source[j])) j += 1;
      tokens.push({ type: 'space', value: source.slice(i, j) });
      i = j;
      continue;
    }

    // Comments
    if (c === '/' && source[i + 1] === '/') {
      let j = i;
      while (j < n && source[j] !== '\n') j += 1;
      tokens.push({ type: 'comment', value: source.slice(i, j) });
      i = j;
      continue;
    }
    if (c === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      const j = end === -1 ? n : end + 2;
      tokens.push({ type: 'comment', value: source.slice(i, j) });
      i = j;
      continue;
    }

    // Strings
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && source[j] !== c) {
        if (source[j] === '\\') j += 1;
        j += 1;
      }
      tokens.push({ type: 'string', value: source.slice(i, Math.min(j + 1, n)) });
      i = j + 1;
      continue;
    }

    // Template literals — interpolations are highlighted as ordinary code.
    if (c === '`') {
      let j = i + 1;
      let buffer = '`';
      while (j < n && source[j] !== '`') {
        if (source[j] === '\\') {
          buffer += source[j] + (source[j + 1] ?? '');
          j += 2;
          continue;
        }
        if (source[j] === '$' && source[j + 1] === '{') {
          tokens.push({ type: 'string', value: buffer });
          buffer = '';
          let depth = 1;
          let k = j + 2;
          while (k < n && depth > 0) {
            if (source[k] === '{') depth += 1;
            else if (source[k] === '}') depth -= 1;
            if (depth > 0) k += 1;
          }
          tokens.push({ type: 'punct', value: '${' });
          tokens.push(...tokenizeJs(source.slice(j + 2, k)));
          tokens.push({ type: 'punct', value: '}' });
          j = k + 1;
          continue;
        }
        buffer += source[j];
        j += 1;
      }
      tokens.push({ type: 'string', value: buffer + '`' });
      i = j + 1;
      continue;
    }

    // Regex literal
    if (c === '/' && regexAllowed(tokens)) {
      let j = i + 1;
      let inClass = false;
      let closed = false;
      while (j < n) {
        const ch = source[j];
        if (ch === '\\') { j += 2; continue; }
        if (ch === '[') inClass = true;
        else if (ch === ']') inClass = false;
        else if (ch === '/' && !inClass) { closed = true; break; }
        else if (ch === '\n') break;
        j += 1;
      }
      if (closed) {
        let k = j + 1;
        while (k < n && /[gimsuyvd]/.test(source[k])) k += 1;
        tokens.push({ type: 'regex', value: source.slice(i, k) });
        i = k;
        continue;
      }
    }

    // Numbers
    if (isDigit(c) || (c === '.' && isDigit(source[i + 1]))) {
      let j = i;
      while (j < n && /[0-9a-fA-FxXbBoOeE._n+-]/.test(source[j])) {
        // Stop at a `+`/`-` that is not part of an exponent.
        if ((source[j] === '+' || source[j] === '-') && !/[eE]/.test(source[j - 1])) break;
        j += 1;
      }
      tokens.push({ type: 'number', value: source.slice(i, j) });
      i = j;
      continue;
    }

    // Identifiers, keywords, calls
    if (isIdentStart(c)) {
      let j = i;
      while (j < n && isIdentPart(source[j])) j += 1;
      const value = source.slice(i, j);
      let k = j;
      while (k < n && /\s/.test(source[k])) k += 1;

      let type = 'ident';
      if (KEYWORDS.has(value)) type = 'keyword';
      else if (LITERALS.has(value)) type = 'literal';
      else if (BUILTINS.has(value)) type = 'builtin';
      else if (source[k] === '(') type = 'function';
      else if (/^[A-Z]/.test(value)) type = 'class';

      tokens.push({ type, value });
      i = j;
      continue;
    }

    // Punctuation and operators
    tokens.push({ type: 'punct', value: c });
    i += 1;
  }

  return tokens;
}

/** Token type → Tailwind classes. Tuned for contrast on both themes. */
export const TOKEN_CLASS = {
  keyword: 'text-[#F97583] dark:text-[#FF7B72]',
  literal: 'text-[#B392F0] dark:text-[#D2A8FF]',
  string: 'text-[#22863A] dark:text-[#A5D6FF]',
  regex: 'text-[#22863A] dark:text-[#7EE787]',
  number: 'text-[#005CC5] dark:text-[#79C0FF]',
  comment: 'text-on-surface-variant/70 italic',
  function: 'text-[#6F42C1] dark:text-[#D2A8FF]',
  builtin: 'text-[#E36209] dark:text-[#FFA657]',
  class: 'text-[#E36209] dark:text-[#FFA657]',
  ident: 'text-on-surface',
  punct: 'text-on-surface-variant',
  space: '',
};

/** Tokenize HTML well enough for the markup samples used in DOM lessons. */
export function tokenizeHtml(source) {
  const tokens = [];
  const re = /(<!--[\s\S]*?-->)|(<\/?)([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?>)/g;
  let last = 0;
  let m;
  while ((m = re.exec(source)) !== null) {
    if (m.index > last) tokens.push({ type: 'ident', value: source.slice(last, m.index) });
    if (m[1]) {
      tokens.push({ type: 'comment', value: m[1] });
    } else {
      tokens.push({ type: 'punct', value: m[2] });
      tokens.push({ type: 'class', value: m[3] });
      if (m[4]) {
        const attrRe = /([\w-]+)(\s*=\s*)("[^"]*"|'[^']*')?/g;
        let alast = 0;
        let am;
        while ((am = attrRe.exec(m[4])) !== null) {
          if (am.index > alast) tokens.push({ type: 'space', value: m[4].slice(alast, am.index) });
          tokens.push({ type: 'function', value: am[1] });
          if (am[2]) tokens.push({ type: 'punct', value: am[2] });
          if (am[3]) tokens.push({ type: 'string', value: am[3] });
          alast = attrRe.lastIndex;
        }
        if (alast < m[4].length) tokens.push({ type: 'space', value: m[4].slice(alast) });
      }
      tokens.push({ type: 'punct', value: m[5] });
    }
    last = re.lastIndex;
  }
  if (last < source.length) tokens.push({ type: 'ident', value: source.slice(last) });
  return tokens;
}

export function tokenize(source, language = 'javascript') {
  if (language === 'html') return tokenizeHtml(source);
  if (language === 'text' || language === 'plain') return [{ type: 'ident', value: source }];
  return tokenizeJs(source);
}
