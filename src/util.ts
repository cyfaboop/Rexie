export const NULL = null
export const UNDEFINED = undefined

export const isString = (a: unknown): a is string => typeof a === 'string'
export const isFunction = (a: unknown): a is Function => typeof a === 'function'
