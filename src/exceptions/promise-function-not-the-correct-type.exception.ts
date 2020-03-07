export class PromiseFunctionNotTheCorrectType extends Error {
  constructor(type: string) {
    super(`Expected a function or array in the promise limit but received ${type}`);
  }
}
