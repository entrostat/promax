import { PromiseFunctionWithArgs } from './promise-function-type';

export interface FunctionWithArgs<T> {
  func: PromiseFunctionWithArgs<T>;
  args: any[];
}
