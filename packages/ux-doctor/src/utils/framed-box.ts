export const framedBox = (lines: string[], title?: string): string => {
  const maxLength = Math.max(
    ...lines.map((line) => stripAnsi(line).length),
    title ? stripAnsi(title).length + 4 : 0,
    40,
  );

  const horizontal = "─".repeat(maxLength + 2);
  const top = title
    ? `┌─ ${title} ${"─".repeat(maxLength - stripAnsi(title).length - 2)}┐`
    : `┌${horizontal}┐`;
  const bottom = `└${horizontal}┘`;

  const paddedLines = lines.map((line) => {
    const padding = maxLength - stripAnsi(line).length;
    return `│ ${line}${" ".repeat(padding)} │`;
  });

  return [top, ...paddedLines, bottom].join("\n");
};

const stripAnsi = (str: string): string =>
  str.replace(
    /[\u001B\u009B][[\]()#;?]*(?:(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nq-uy=><~])/g,
    "",
  );
