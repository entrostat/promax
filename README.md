# promax

[![NPM](https://nodei.co/npm/promax.png)](https://nodei.co/npm/promax/)

[![GitHub version](https://badge.fury.io/gh/entrostat%2Fpromax.svg)](https://badge.fury.io/gh/entrostat%2Fpromax)
[![npm version](https://badge.fury.io/js/promax.svg)](https://badge.fury.io/js/promax)
[![Build Status](https://travis-ci.org/entrostat/promax.svg?branch=master)](https://travis-ci.org/entrostat/promax)

Another promise limiter (adding concurrency to promises). This library uses rxjs to control concurrency, it also adds a little bit of extra functionality around how you get the results.


## Setup Instructions

To install this package, run,

```bash
npm install --save promax
```

## Usage Instructions

Once it's installed, you can use `Promax` to run your promises with a specified concurrency value. Pretend we had the following promise function:

```typescript
function somePromiseFunction(returns = null, timeout = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(returns);
    }, timeout);
  });
}
```

Promax can be used in many ways:
```typescript
import { Promax } from 'promax';

async function run() {
    const limit = 2;
    const expectedValues = [1, 2, 3];
    const promax = Promax.create(limit).add(
        expectedValues.map(ev => () => somePromiseFunction(ev))
    );
    const results = await promax.run();
    // In this case, results == expectedValues
    
    const resultMap = promax.getResultMap();
    /**
     * This would return:
     * {
     *    valid: [1, 2, 3],
     *    error: []
     * }
     */
}
```

**NOTE:** In this case, if a promise is rejected, it'll throw an error and end the call.

If we don't want to throw an error, we can pass a parameter object with ```throws: false``` to the create function:
```typescript
import { Promax } from 'promax';

async function run() {
    const limit = 2;
    const expectedValues = [1, 2, 3];
    const promax = Promax.create(limit, { throws: false }).add(
        expectedValues.map(ev => () => somePromiseFunction(ev))
    );
    // ... same as previous example
}
```

When it doesn't throw, it wraps errored results in an `ErrorResult` instance. Using `instanceof ErrorResult` will tell you whether or not there was an error in your array of results. Let's assume we have the following function:
```typescript
function someFailingPromiseFunction(returns = 0, timeout = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(returns);
        }, timeout);
    });
}
```
Then we may get the following:
```typescript
import { Promax } from 'promax';

async function run() {
    const limit = 2;
    const promax = Promax.create(limit, { throws: false }).add([
        () => somePromiseFunction(1),
        () => someFailingPromiseFunction(2),
        () => somePromiseFunction(3),
    ]);
    const results = await promax.run();
    /**
     * Now we would have the following
     * results = [
     *    1,
     *    ErrorResult,
     *    2
     *  ]
     *
     * So:
     * results[0] === 1
     * results[1] instanceof ErrorResult
     * results[1].data === 2
     * results[2] === 3
     */
    
    const resultMap = promax.getResultMap();
    /**
     * This would return:
     * {
     *    valid: [1, 3],
     *    error: [ErrorResult]
     * }
     */
}
```

**IMPORTANT:** If you don't need the functionality above, you can chain everything into one call:
```typescript
import { Promax } from 'promax';

async function run() {
    const limit = 2;
    const expectedValues = [1, 2, 3];
    const results = Promax.create(limit).add(
        expectedValues.map(ev => () => somePromiseFunction(ev))
    ).run();
}
```

And you can send in the result map by reference:
```typescript
import { Promax } from 'promax';

async function run() {
    const limit = 2;
    const expectedValues = [1, 2, 3];
    const resultMap = { valid: [], error: [] };
    const results = Promax.create(limit)
        .setResultMapOutput(resultMap)
        .add(
            expectedValues.map(ev => () => somePromiseFunction(ev))
        ).run();
    /**
     * In this case:
     *
     * results = [1, 2, 3]
     * resultMap = {
     *    valid: [1, 2, 3],
     *    error: []
     * }
     */

}
```
