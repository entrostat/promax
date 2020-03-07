import { PromiseFunctionNotSpecifiedException } from '../exceptions/promise-function-not-specified.exception';
import { PromiseFunctionNotTheCorrectType } from '../exceptions/promise-function-not-the-correct-type.exception';

export function assertValidFunction(func: any) {
  if (!func) {
    throw new PromiseFunctionNotSpecifiedException();
  }
  if (typeof func !== 'function') {
    throw new PromiseFunctionNotTheCorrectType(typeof func);
  }
}
