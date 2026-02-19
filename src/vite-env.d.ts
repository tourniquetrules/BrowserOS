/// <reference types="vite/client" />

// CSS Modules type declarations – Vite handles the import at runtime;
// we declare the shape here so TypeScript is satisfied.
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
