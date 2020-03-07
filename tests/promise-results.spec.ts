import {Promax} from "../src";

function createPromiseFunction(returns = null, timeout = 0) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(returns);
        }, timeout);
    });
}

describe('Promise Result Tests', () => {
  /**
   * We don't need to test observable concurrency (that's why we're
   * using it instead of writing it from scratch) so these tests
   * look to make sure that we get the right results.
   */
  it('resolves a single promise correctly', async (done) => {
      const expected = 1;
      const promax = Promax.create(1).add(() => createPromiseFunction(expected));
      const results = await promax.run();
      expect(results[0]).toBe(expected);
      done();
  });
});
