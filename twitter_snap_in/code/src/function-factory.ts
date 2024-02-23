import tweet_finder from './functions/tweet_finder';

export const functionFactory = {
  // Add your functions here
  tweet_finder,
} as const;

export type FunctionFactoryType = keyof typeof functionFactory;
