import pc from "picocolors";

export const highlight = {
  file: (path: string): string => pc.cyan(path),
  line: (num: number): string => pc.yellow(String(num)),
  rule: (id: string): string => pc.magenta(id),
  error: (text: string): string => pc.red(pc.bold(text)),
  warning: (text: string): string => pc.yellow(text),
  score: (value: number): string => {
    if (value >= 75) return pc.green(pc.bold(String(value)));
    if (value >= 50) return pc.yellow(pc.bold(String(value)));
    return pc.red(pc.bold(String(value)));
  },
  category: (name: string): string => pc.blue(pc.bold(name)),
  dim: (text: string): string => pc.dim(text),
  bold: (text: string): string => pc.bold(text),
  wcag: (criteria: string): string => pc.cyan(`WCAG ${criteria}`),
};
