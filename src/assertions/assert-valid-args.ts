import { ArgsAreNotInTheRightFormException } from '../exceptions/args-are-not-in-the-right-form.exception';

export function assertValidArgs(args: any) {
  if (args && !Array.isArray(args)) {
    throw new ArgsAreNotInTheRightFormException(typeof args);
  }
}
