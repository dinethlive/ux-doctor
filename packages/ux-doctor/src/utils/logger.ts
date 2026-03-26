import pc from "picocolors";

let isVerbose = false;

export const setVerbose = (verbose: boolean): void => {
  isVerbose = verbose;
};

export const log = {
  info: (message: string): void => {
    console.log(message);
  },

  verbose: (message: string): void => {
    if (isVerbose) {
      console.log(pc.dim(message));
    }
  },

  warn: (message: string): void => {
    console.warn(pc.yellow(`⚠ ${message}`));
  },

  error: (message: string): void => {
    console.error(pc.red(`✖ ${message}`));
  },

  success: (message: string): void => {
    console.log(pc.green(`✔ ${message}`));
  },

  debug: (message: string): void => {
    if (process.env.UX_DOCTOR_DEBUG) {
      console.log(pc.gray(`[debug] ${message}`));
    }
  },
};
