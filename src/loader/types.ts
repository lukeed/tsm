export type Promisable<T> = Promise<T> | T;
export type Source = string | SharedArrayBuffer | Uint8Array;
export type Format = "builtin" | "commonjs" | "json" | "module" | "wasm";

export type ModuleResolver = (
  specifier: string,
  context: {
    conditions: string[];
    parentURL?: string;
  },
  fallback: ModuleResolver
) => Promisable<{
  url: string;
  format?: Format;
}>;

export type Inspect = (
  url: string,
  context: object,
  fallback: Inspect
) => Promisable<{ format: Format }>;

export type Transform = (
  source: Source,
  context: Record<"url" | "format", string>,
  fallback: Transform
) => Promisable<{ source: Source }>;

export type ModuleLoader = (
  url: string,
  context: { format?: Format },
  fallback: ModuleLoader
) => Promisable<{
  format: Format;
  source: Source;
}>;