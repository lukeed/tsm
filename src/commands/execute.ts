import { URL } from "url";
import { spawn } from "child_process";

export const execute = () => {
  /**
   * Silence experimental warnings.
   */
  process.env.NODE_OPTIONS = "--no-warnings";

  const __filename = import.meta.url;
  /**
   * This will refer to the built loader regardless of whether it is running
   * from inside `dist/` or `src/`.
   */
  const loaderUrl = new URL("../../dist/loader/index.js", __filename);

  const nodeArgs = [
    "--loader",
    loaderUrl.href,
    ...process.argv.slice(2)
  ];

  spawn("node", nodeArgs, { stdio: "inherit" })
    .on("exit", process.exit);
};