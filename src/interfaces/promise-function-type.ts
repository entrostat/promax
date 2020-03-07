export type PromiseFunction<T> = () => PromiseLike<T>;
export type PromiseFunctionWithArgs<T> = (...args) => PromiseLike<T>;
