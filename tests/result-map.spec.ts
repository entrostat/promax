import {Promax} from "../src";

function createPromiseFunction(returns = null, timeout = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(returns);
    }, timeout);
  });
}

describe('Result Map', () => {
    it('allows you to pass in a result map by reference', async (done) => {
        const expected = 1;
        const resultMap: any = {};
      const results = await Promax.create(1)
          .setResultsOutput(resultMap)
          .add(() => createPromiseFunction(expected))
          .run();
      expect(results[0]).toEqual(expected);
      expect(resultMap.valid[0]).toEqual(expected);
      done();
    })
});
