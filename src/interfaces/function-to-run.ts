import { PromiseFunction, PromiseFunctionWithArgs } from './promise-function-type';

export interface FunctionToRun<T> {
  func: PromiseFunctionWithArgs<T> | PromiseFunction<T>;
  args?: any[];
}
