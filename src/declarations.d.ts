declare module '*.css';
declare module '*.scss';

declare interface RequireContext {
  keys(): Array<string>;
  (id: string): unknown;
  <T>(id: string): T;
  resolve(id: string): string;
  id: string;
}

declare namespace NodeJS {
  interface Require {
    context(directory: string, useSubdirectories?: boolean, regExp?: RegExp, mode?: string): RequireContext;
  }
}
