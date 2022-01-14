export const debugLog = (...msgs: string[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...msgs);
  }
};

export const log = (...msgs: string[]) => {
  console.log(...msgs);
};