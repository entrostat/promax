import { EMPTY, from } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { PromiseFunction, PromiseFunctionWithArgs } from './interfaces/promise-function-type';
import { FunctionWithArgs } from './interfaces/funciton-with-args';
import { defaultPromiseLimitOptions, PromiseLimitOptions } from './interfaces/promise-limit-options';
import { FunctionToRun } from './interfaces/function-to-run';
import { assertValidFunctionOrFunctions } from './assertions/assert-valid-function-or-functions';
import { assertValidFunctionAndArgs } from './assertions/assert-valid-function-and-args';
import { IncorrectDataTypesForTheFunctionAndArgs } from './exceptions/incorrect-data-types-for-the-function-and-args.exception';

export class ErrorResult<T> {
  constructor(public data: any, public func: PromiseFunction<T> | FunctionWithArgs<T>, public args: any[]) {}
}

/**
 * A simplified class that allows you to limit an array of function
 * calls that return promises.
 *
 * I used p-limit and found that it didn't run my functions correctly.
 * Thanks to @LiamEntrostat for the rxjs code used in this to run promises
 * concurrently.
 */
export class Promax<T = any> {
  private options: PromiseLimitOptions;

  private functions: FunctionToRun<T>[] = [];
  private indexMap = new Map();
  private resultMap: { [index: number]: any } = {};
  private results: { valid: T[]; error: ErrorResult<T>[] } = {
    valid: [],
    error: [],
  };

  /**
   * Creates the promise limit class that you can use to limit
   * an array of function calls that return promises.
   * @param limit The number of concurrent jobs that can run
   * @param options Additional options. Set throws = false (default true)
   * if you want all of them to complete and the results of which passed
   * and failed will be written to the results object which you
   * can get using the .getResults(...) function.
   */
  static create<T>(limit: number = 1, options: Partial<PromiseLimitOptions> = defaultPromiseLimitOptions) {
    return new Promax<T>(limit, Promax.mergeOptions(options));
  }

  /**
   * Creates the promise limit class that you can use to limit
   * an array of function calls that return promises.
   * @param limit The number of concurrent jobs that can run
   * @param options Additional options. Set throws = false (default true)
   * if you want all of them to complete and the results of which passed
   * and failed will be written to the results object which you
   * can get using the .getResults(...) function.
   */
  constructor(private readonly limit: number = 1, options: Partial<PromiseLimitOptions> = defaultPromiseLimitOptions) {
    this.options = Promax.mergeOptions(options);
  }

  /**
   * Merges the partial options with the defaults so that we have
   * all of the options available when needed.
   * @param options The partial options that we need to merge with
   * the defaults.
   */
  private static mergeOptions(options: Partial<PromiseLimitOptions>) {
    return Object.assign({}, defaultPromiseLimitOptions, options);
  }

  /**
   * Allows you to set the results array by reference (if you want to
   * chain all of your commands together)
   * @param results
   */
  public setResults(results: any) {
    results.valid = [];
    results.invalid = [];
    this.results = results;
  }

  public add(func: PromiseFunction<T>): Promax;
  public add(func: PromiseFunctionWithArgs<T>, ...args: any[]): Promax;
  // tslint:disable-next-line:unified-signatures
  public add(functions: PromiseFunction<T>[] | FunctionWithArgs<T>[]): Promax;

  public add(
    param1: PromiseFunction<T> | PromiseFunctionWithArgs<T> | PromiseFunction<T>[] | FunctionWithArgs<T>[],
    ...param2: any[]
  ): Promax {
    assertValidFunctionOrFunctions(param1, param2);

    if (typeof param1 === 'function' && this.isEmpty(param2)) {
      // Single function with no parameters
      this.addFunction(param1);
      return this;
    } else if (typeof param1 === 'function' && !this.isEmpty(param2)) {
      // Single function with parameters
      this.addFunction(param1, param2);
      return this;
    } else if (Array.isArray(param1) && this.isEmpty(param2)) {
      // Array of single functions or functions with args
      for (const funcWithArguments of param1) {
        if (typeof funcWithArguments === 'function') {
          this.functions.push({
            func: funcWithArguments,
          });
        } else {
          const func = funcWithArguments.func;
          const args = funcWithArguments.args;
          assertValidFunctionAndArgs(func, args);
          this.addFunction(func, args);
        }
      }
      return this;
    }
    throw new IncorrectDataTypesForTheFunctionAndArgs(param1, param2);
  }

  /**
   * Adds a function to the array of functions to run and also indexes it
   * for the returned data.
   * @param func The function to add
   * @param args The arguments that must go with the function
   */
  private addFunction(func: PromiseFunction<T>, args?: any[]) {
    const obj: FunctionToRun<T> = {
      func,
    };
    if (args) {
      obj.args = args;
    }
    const index = this.functions.length;
    this.functions.push(obj);
    this.indexMap.set(obj, index);
  }

  private isEmpty(param: any) {
    if (!param) {
      return true;
    }
    return Array.isArray(param) && param.length === 0;
  }

  /**
   * Runs all of the functions that have been added and returns an array with
   * all of the results. If it was an error, you'll get an object that has
   * the error, the function, and the original arguments. To see if it was
   * an error use `instanceof ErrorResult` in an if statement.
   *
   * *** Thanks to @LiamEntrostat for the code below that runs the promises
   * concurrently using rxjs!
   */
  public async run(): Promise<(T | ErrorResult<T>)[]> {
    const jobs = from(this.functions).pipe(
      mergeMap(item => {
        return from(item.func(...item.args)).pipe(
          catchError(error => {
            const index = this.indexMap.get(item);
            const errorResult = new ErrorResult<T>(error, item.func, item.args);
            this.resultMap[index] = errorResult;
            this.results.error.push(errorResult);
            if (this.options.throws) {
              throw error;
            }
            return EMPTY;
          }),
          tap(result => {
            const index = this.indexMap.get(item);
            this.resultMap[index] = result;
          }),
        );
      }, this.limit),
    );
    await jobs.toPromise();
    const results: T[] = [];
    for (let i = 0; i < this.functions.length; i++) {
      results.push(this.resultMap[i]);
    }
    return results;
  }
}
