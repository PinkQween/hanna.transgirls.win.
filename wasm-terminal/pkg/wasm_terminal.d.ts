/* tslint:disable */
/* eslint-disable */
export function main(): void;
export class RustTerminal {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get the current prompt string
   */
  getPrompt(): string;
  /**
   * List all users
   */
  listUsers(): string[];
  /**
   * Get command history
   */
  getHistory(): string[];
  /**
   * Add a directory to the filesystem (called from JavaScript)
   */
  addDirectory(path: string): void;
  /**
   * Get current authentication state
   */
  getAuthState(): string;
  /**
   * List files in a directory (called from JavaScript)
   */
  listDirectory(path: string): string[];
  /**
   * Execute a command and return the new lines to display
   */
  executeCommand(input: string): string;
  /**
   * Get current working directory
   */
  getCurrentDir(): string;
  /**
   * Load filesystem from JSON (for persistence)
   */
  loadFilesystem(json: string): void;
  /**
   * Save filesystem to JSON (for persistence)
   */
  saveFilesystem(): string;
  /**
   * Get a specific history item
   */
  getHistoryItem(index: number): string | undefined;
  /**
   * Set user password hash (for configuration)
   */
  setUserPassword(username: string, hash: string): void;
  /**
   * Get history length
   */
  getHistoryLength(): number;
  /**
   * Get current username (if logged in)
   */
  getCurrentUsername(): string;
  /**
   * Get autocomplete suggestions for the current input
   */
  getAutocompleteSuggestions(input: string): string[];
  constructor();
  /**
   * Check if user is root
   */
  isRoot(): boolean;
  /**
   * Add a file to the filesystem (called from JavaScript)
   */
  addFile(path: string, content: string): void;
  /**
   * Read a file (called from JavaScript)
   */
  readFile(path: string): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_rustterminal_free: (a: number, b: number) => void;
  readonly rustterminal_addDirectory: (a: number, b: number, c: number) => [number, number];
  readonly rustterminal_addFile: (a: number, b: number, c: number, d: number, e: number) => [number, number];
  readonly rustterminal_executeCommand: (a: number, b: number, c: number) => [number, number];
  readonly rustterminal_getAuthState: (a: number) => [number, number];
  readonly rustterminal_getAutocompleteSuggestions: (a: number, b: number, c: number) => [number, number];
  readonly rustterminal_getCurrentDir: (a: number) => [number, number];
  readonly rustterminal_getCurrentUsername: (a: number) => [number, number];
  readonly rustterminal_getHistory: (a: number) => [number, number];
  readonly rustterminal_getHistoryItem: (a: number, b: number) => [number, number];
  readonly rustterminal_getHistoryLength: (a: number) => number;
  readonly rustterminal_getPrompt: (a: number) => [number, number];
  readonly rustterminal_isRoot: (a: number) => number;
  readonly rustterminal_listDirectory: (a: number, b: number, c: number) => [number, number, number, number];
  readonly rustterminal_listUsers: (a: number) => [number, number];
  readonly rustterminal_loadFilesystem: (a: number, b: number, c: number) => [number, number];
  readonly rustterminal_new: () => number;
  readonly rustterminal_readFile: (a: number, b: number, c: number) => [number, number, number, number];
  readonly rustterminal_saveFilesystem: (a: number) => [number, number, number, number];
  readonly rustterminal_setUserPassword: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly main: () => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
