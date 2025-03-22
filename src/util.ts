export const isString = (a: unknown): a is string => typeof a === 'string'
export const isFunction = (a: unknown): a is Function => typeof a === 'function'
export const isEqual = (a: unknown, b: unknown) =>
    // Faster than Object.is
    a === b || (a !== a && b !== b)
