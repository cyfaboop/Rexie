export const isString = (a: unknown): a is string => typeof a === 'string'
export const isFunction = (a: unknown): a is Function => typeof a === 'function'

export function isEqual(a: unknown, b: unknown) {
    // Faster than Object.is
    return a === b || (a !== a && b !== b)
}
