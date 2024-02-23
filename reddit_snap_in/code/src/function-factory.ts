import reddit_post_finder from './functions/reddit_post_finder';

export const functionFactory = {
  // Add your functions here
  reddit_post_finder,
} as const;

export type FunctionFactoryType = keyof typeof functionFactory;
