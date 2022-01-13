export type Promisable<T> = Promise<T> | T;
export type ModuleSource = string | SharedArrayBuffer | Uint8Array;
export type ModuleFormat = "builtin" | "commonjs" | "json" | "module" | "wasm";

export type ModuleResolver = (
  specifier: string,
  context: {
    conditions: string[];
    parentURL?: string;
  },
  fallback: ModuleResolver
) => Promisable<{
  url: string;
  format?: ModuleFormat;
}>;

export type Inspect = (
  url: string,
  context: object,
  fallback: Inspect
) => Promisable<{ format: ModuleFormat }>;

export type Transform = (
  source: ModuleSource,
  context: Record<"url" | "format", string>,
  fallback: Transform
) => Promisable<{ source: ModuleSource }>;

export type ModuleLoader = (
  url: string,
  context: { format?: ModuleFormat },
  fallback: ModuleLoader
) => Promisable<{
  format: ModuleFormat;
  source: ModuleSource;
}>;