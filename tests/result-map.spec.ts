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
          .setResultMapOutput(resultMap)
          .add(() => createPromiseFunction(expected))
          .run();
      expect(results[0]).toEqual(expected);
      expect(resultMap.valid[0]).toEqual(expected);
      done();
    });

    it('allows you to pass in a result map by reference and save multiple results', async (done) => {
      const expected = [1, 2, 3];
      const promiseFunctions = expected.map(value => () => createPromiseFunction(value));
      const resultMap: any = {};
      const results = await Promax.create(1)
          .setResultMapOutput(resultMap)
          .add(promiseFunctions)
          .run();
      expect(results).toEqual(expected);
      expect(resultMap.valid).toEqual(expected);
      done();
    });
});
