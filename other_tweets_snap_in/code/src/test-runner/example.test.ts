import { run } from '../functions/other_tweets'

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
