import { run } from '../functions/tweet_finder'

describe('Test some function', () => {
  it('Something', () => {
    run([{
      payload: {
        work_created: {
          work: {
            id: 'some-id'
          }
        }
      }
    }]);
  });
});
