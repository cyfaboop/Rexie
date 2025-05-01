export function isString(a: unknown): a is string {
    return typeof a === 'string'
}

export function isFunction(a: unknown): a is Function {
    return typeof a === 'function'
}

// Faster than Object.is
export function isEqual(a: unknown, b: unknown): boolean {
    return a === b || (a !== a && b !== b)
}
