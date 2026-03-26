import ora, { type Ora } from "ora";

let currentSpinner: Ora | null = null;

export const startSpinner = (text: string): Ora => {
  currentSpinner = ora({ text, color: "cyan" }).start();
  return currentSpinner;
};

export const stopSpinner = (
  spinner: Ora,
  text?: string,
  success = true,
): void => {
  if (success) {
    spinner.succeed(text);
  } else {
    spinner.fail(text);
  }
  if (currentSpinner === spinner) {
    currentSpinner = null;
  }
};

export const updateSpinner = (spinner: Ora, text: string): void => {
  spinner.text = text;
};
