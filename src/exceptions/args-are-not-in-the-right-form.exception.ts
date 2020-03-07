export class ArgsAreNotInTheRightFormException extends Error {
  constructor(type: string) {
    super(`The arguments should be in the form of an array, but we received ${type}`);
  }
}
