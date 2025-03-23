import { describe, it, expect } from '@jest/globals'
import { isString, isFunction, isEqual } from 'src/util'

describe('isString', () => {
    it('should correctly identify string types', () => {
        // Valid strings
        expect(isString('')).toBe(true)
        expect(isString('hello')).toBe(true)

        // Non-string values
        expect(isString(123)).toBe(false)
        expect(isString(null)).toBe(false)
        expect(isString(undefined)).toBe(false)
        expect(isString(true)).toBe(false)
        expect(isString({})).toBe(false)
        expect(isString([])).toBe(false)
        expect(isString(() => {})).toBe(false)
    })
})

describe('isFunction', () => {
    it('should correctly identify function types', () => {
        // Valid functions
        expect(isFunction(function () {})).toBe(true)
        expect(isFunction(() => {})).toBe(true)
        expect(isFunction(class {})).toBe(true)
        expect(isFunction(async () => {})).toBe(true)
        expect(isFunction(function* () {})).toBe(true)

        // Non-function values
        expect(isFunction('function')).toBe(false)
        expect(isFunction(123)).toBe(false)
        expect(isFunction(null)).toBe(false)
        expect(isFunction(undefined)).toBe(false)
        expect(isFunction({})).toBe(false)
        expect(isFunction([])).toBe(false)
    })
})

describe('isEqual', () => {
    it('should correctly handle basic type comparisons', () => {
        // Same values
        expect(isEqual(42, 42)).toBe(true)
        expect(isEqual('test', 'test')).toBe(true)
        expect(isEqual(true, true)).toBe(true)

        // Different values
        expect(isEqual(42, '42')).toBe(false)
        expect(isEqual(0, false)).toBe(false)
    })

    it('should handle special numeric cases', () => {
        // NaN comparison
        expect(isEqual(NaN, NaN)).toBe(true)
        expect(isEqual(NaN, 42)).toBe(false)

        // 0 and -0
        expect(isEqual(0, -0)).toBe(true)
    })

    it('should handle reference type comparisons', () => {
        // Same reference
        const obj = {}
        expect(isEqual(obj, obj)).toBe(true)

        // Different references
        expect(isEqual({}, {})).toBe(false)
        expect(isEqual([], [])).toBe(false)
    })

    it('should handle edge cases', () => {
        // null/undefined
        expect(isEqual(null, null)).toBe(true)
        expect(isEqual(undefined, undefined)).toBe(true)
        expect(isEqual(null, undefined)).toBe(false)

        // Reflexivity
        expect(isEqual(Infinity, Infinity)).toBe(true)
        expect(isEqual(-Infinity, -Infinity)).toBe(true)
    })
})
