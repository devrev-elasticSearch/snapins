import playstore_review_finder from './functions/playstore_review_finder';

export const functionFactory = {
  // Add your functions here
  playstore_review_finder,
} as const;

export type FunctionFactoryType = keyof typeof functionFactory;
