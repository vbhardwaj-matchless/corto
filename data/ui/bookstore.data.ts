/**
 * Centralised UI test data for the DemoQA Book Store.
 * Add new books here as test coverage expands — no spreading data across specs.
 */
export const KNOWN_BOOKS = {
  gitPocketGuide: {
    title: "Git Pocket Guide",
    author: "Richard E. Silverman",
    isbn: "9781449325862",
  },
} as const;

export type KnownBook = (typeof KNOWN_BOOKS)[keyof typeof KNOWN_BOOKS];
