export class IncorrectDataTypesForTheFunctionAndArgs extends Error {
  constructor(func: any, args: any) {
    super(
      `Expected the function type to either be a function, an array of functions, or an array of objects with a function and args and received ${typeof func} (is array ${
        Array.isArray(func) ? 'true' : 'false'
      }). Expected the args to be undefined or an array and got ${typeof args} (is array ${
        Array.isArray(args) ? 'true' : 'false'
      }).`,
    );
  }
}
