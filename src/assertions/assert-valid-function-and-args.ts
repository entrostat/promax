import { assertValidFunction } from './assert-valid-function';
import { assertValidArgs } from './assert-valid-args';

export function assertValidFunctionAndArgs(func: any, args: any) {
  assertValidFunction(func);
  assertValidArgs(args);
}
