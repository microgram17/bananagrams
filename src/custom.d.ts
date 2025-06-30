/**
 * Custom TypeScript declaration file.
 * 
 * Adds type definitions for non-standard file imports
 * to ensure TypeScript compatibility.
 */

/**
 * Declaration for CSV file imports.
 * Allows importing CSV files as strings in TypeScript.
 * Used for loading the word dictionary.
 */
declare module '*.csv' {
  const content: string;
  export default content;
}
