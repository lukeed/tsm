import { fileURLToPath, URL } from "url";
import { spawn } from "child_process";

export const load = () => {
  /**
   * Silence experimental warnings.
   */
  process.env.NODE_OPTIONS = "--no-warnings";

  const __filename = import.meta.url;
  console.log({ __filename });
  const loaderUrl = new URL("../runtime/loader.js", __filename);

  const nodeArgs = [
    "--loader",
    fileURLToPath(loaderUrl.href),
    ...process.argv.slice(2)
  ];

  spawn("node", nodeArgs, { stdio: "inherit" })
    .on("exit", process.exit);
};