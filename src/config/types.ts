import type { Loader, TransformOptions } from "esbuild";

export type Extension = `.${string}`;
export type Options = TransformOptions;

export type Config = {
  [extension: Extension]: Options;
};

export type ConfigFile =
	| { common?: Options; config?: Config; loaders?: never; [extn: Extension]: never }
	| { common?: Options; loaders?: Loaders; config?: never; [extn: Extension]: never }
	| { common?: Options; config?: never; loaders?: never; [extn: Extension]: Options };

export type Loaders = {
  [extension: Extension]: Loader;
};

export interface Defaults {
  file: string | false;
  options: Options;
}