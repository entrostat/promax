import { PromiseFunctionNotTheCorrectType } from '../exceptions/promise-function-not-the-correct-type.exception';
import { assertValidFunctionAndArgs } from './assert-valid-function-and-args';
import { assertValidFunction } from './assert-valid-function';
import { assertValidArgs } from './assert-valid-args';

export function assertValidFunctionOrFunctions(func: any, args?: any) {
  if (typeof func !== 'function' && !Array.isArray(func)) {
    throw new PromiseFunctionNotTheCorrectType(typeof func);
  }

  if (Array.isArray(func)) {
    // It's an array now
    func.forEach(funcWithArguments => {
      if (typeof funcWithArguments === 'object') {
        assertValidFunctionAndArgs(funcWithArguments.func, funcWithArguments.args);
      }
    });
  } else {
    assertValidFunction(func);
    assertValidArgs(args);
  }
}
