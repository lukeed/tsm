export const debugLog = (...msgs: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...msgs);
  }
};

export const log = (...msgs: unknown[]) => {
  console.log(...msgs);
};