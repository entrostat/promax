import {Promax} from "../src";
import {ErrorResult} from "../src/promax";

function createFailedPromiseFunction(returns = 0, timeout = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(returns);
        }, timeout);
    });
}

describe('Failed Results', () => {
    it('returns an error result if it is not supposed to throw an exception', async (done) => {
        const expectedData = 1;
        const promax = Promax.create(1, { throws: false }).add(() => createFailedPromiseFunction(expectedData));
        const results = await promax.run();
        expect(results[0]).toBeInstanceOf(ErrorResult);
        expect(results[0].data).toEqual(expectedData);
        done();
    });

    it('throws by default if there is a rejected promise', async (done) => {
        const expectedData = 1;
        const promax = Promax.create(1).add(() => createFailedPromiseFunction(expectedData));
        await expect(promax.run()).rejects.toEqual(expectedData);
        done();
    });

});
