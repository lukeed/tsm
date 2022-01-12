declare global {
  const PACKAGE_JSON: Record<string, unknown>;
}

export * from "../config/types";
export * from "../loader/types";