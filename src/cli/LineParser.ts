/** Tokenize a CLI line; double-quoted strings keep spaces. */
export function tokenize(line: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  const s = line.trim();
  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i])) i++;
    if (i >= s.length) break;
    if (s[i] === '"') {
      i++;
      let buf = "";
      while (i < s.length && s[i] !== '"') {
        buf += s[i++];
      }
      if (i < s.length && s[i] === '"') i++;
      tokens.push(buf);
    } else {
      let buf = "";
      while (i < s.length && !/\s/.test(s[i])) {
        buf += s[i++];
      }
      tokens.push(buf);
    }
  }
  return tokens;
}

/** Split optional trailing `in <containerId>` from create args. */
export function extractInClause(tokens: string[]): {
  args: string[];
  containerId?: string;
} {
  const idx = tokens.lastIndexOf("in");
  if (idx >= 0 && idx === tokens.length - 2) {
    return {
      args: tokens.slice(0, idx),
      containerId: tokens[idx + 1],
    };
  }
  return { args: tokens };
}
