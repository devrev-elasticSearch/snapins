import other_tweets from './functions/other_tweets';

export const functionFactory = {
  // Add your functions here
  other_tweets,
} as const;

export type FunctionFactoryType = keyof typeof functionFactory;
