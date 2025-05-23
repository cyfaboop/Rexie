import { RefObject } from './ref'
import { isEqual, isFunction } from './util'
import { Fiber } from './fiber'
import { update } from './root'
import { getCurrentFC, setCurrentFC } from './component'

export interface Hooks {
    /**
     * A collection of all hook states
     */
    [HookType.List]: HookState[]
    [HookType.Effect]: HookStateEffect[]
    [HookType.Layout]: HookStateEffect[]
}

export const enum HookType {
    List,
    Effect,
    Layout,
}

export type HookState = HookStateMemo | HookStateEffect | HookStateReducer
export type HookStateMemo<V = any> = [value: V, dependencies: Dependencies]
export type HookStateEffect = [setup: EffectSetup, dependencies: Dependencies, unmount?: () => any]
export type HookStateReducer<V = any, A = any> = [value: V, dispatch: Dispatch<A>]

export type Reducer<S, A> = (prevState: S, action: A) => S
export type Dispatch<A> = (value: A) => void
export type EffectSetup = (() => () => any) | (() => any)
export type Dependencies = ReadonlyArray<unknown>
export type StateUpdater<S> = S | ((prevState: S) => S)

let currentIndex = 0

export function resetHookIndex() {
    currentIndex = 0
}

/**
 * Returns a stateful value, and a function to update it.
 *
 * @param initialState The initial value (or a function that returns the initial value).
 *
 * @returns A tuple containing the current state and a function to update it.
 */
export function useState<S>(initialState: S | (() => S)): [S, Dispatch<StateUpdater<S>>]
export function useState<S = undefined>(): [S | undefined, Dispatch<StateUpdater<S | undefined>>]
export function useState<S = undefined>(
    initialState?: S | (() => S),
): [S | undefined, Dispatch<StateUpdater<S | undefined>>] {
    return useReducer(
        (prev, action) => (isFunction(action) ? action(prev) : action),
        // React will call your initializer function when initializing the component,
        // and store its return value as the initial state.
        isFunction(initialState) ? initialState() : initialState,
    )
}

/**
 * An alternative to `useState`.
 *
 * `useReducer` is usually preferable to `useState` when you have complex state logic that involves
 * multiple sub-values. It also lets you optimize performance for components that trigger deep
 * updates because you can pass `dispatch` down instead of callbacks.
 *
 * @param reducer Given the current state and an action, returns the new state.
 * @param initialState The initial value to store as state.
 *
 * @returns A tuple containing the current state and a dispatch function.
 */
export function useReducer<S, A>(reducer: Reducer<S, A>, initialState: S): [S, Dispatch<A>]
/**
 * An alternative to `useState`.
 *
 * `useReducer` is usually preferable to `useState` when you have complex state logic that involves
 * multiple sub-values. It also lets you optimize performance for components that trigger deep
 * updates because you can pass `dispatch` down instead of callbacks.
 *
 * @param reducer Given the current state and an action, returns the new state.
 * @param initialArg The initial argument to pass to the `init` function.
 * @param init A function that, given the `initialArg`, returns the initial value to store as state.
 *
 * @returns A tuple containing the current state and a dispatch function.
 */
export function useReducer<S, A, I>(
    reducer: Reducer<S, A>,
    initialArg: I,
    init: (arg: I) => S,
): [S, Dispatch<A>]
export function useReducer<S, A, I>(
    reducer: Reducer<S, A>,
    initialState: I,
    init?: (arg: I) => S,
): [S, Dispatch<A>] {
    const [hookState, current] = getHookState<HookStateReducer>(currentIndex++)

    if (hookState.length === 0) {
        hookState[0] = init ? init(initialState) : initialState
    }

    hookState[1] = createHookCallback((action: A) => {
        const nextState = reducer(hookState[0], action)
        if (hookState[0] !== nextState) {
            hookState[0] = nextState
            update(current)
        }
    }, current)

    return hookState as [S, Dispatch<A>]
}

/**
 * Accepts a function that contains imperative, possibly effectful code.
 * The effects run after browser paint, without blocking it.
 *
 * @param setup Imperative function that can return a cleanup function.
 * @param dependencies If present, effect will only activate if the values in the list change (using ===).
 */
export function useEffect(setup: EffectSetup, dependencies?: Dependencies) {
    useEffectImplement(setup, HookType.Effect, dependencies)
}

/**
 * Accepts a function that contains imperative, possibly effectful code.
 * Use this to read layout from the DOM and synchronously re-render.
 * Updates scheduled inside `useLayoutEffect` will be flushed synchronously,
 * after all DOM mutations but before the browser has a chance to paint.
 * Prefer the standard `useEffect` hook when possible to avoid blocking visual updates.
 *
 * @param setup Imperative function that can return a cleanup function.
 * @param dependencies If present, effect will only activate if the values in the list change (using ===).
 * ```
 */
export function useLayout(setup: EffectSetup, dependencies?: Dependencies) {
    useEffectImplement(setup, HookType.Layout, dependencies)
}

function useEffectImplement(
    setup: EffectSetup,
    type: HookType.Effect | HookType.Layout,
    dependencies?: Dependencies,
) {
    const [hook, current] = getHookState<HookStateEffect>(currentIndex++)
    if (haveDependenciesChanged(hook[1], dependencies)) {
        hook[0] = createHookCallback(setup, current)
        hook[1] = dependencies
        current.hooks?.[type].push(hook as Required<HookStateEffect>)
    }
}

/**
 * Returns a memoized version of the callback that only changes if one of the `dependencies`
 * has changed (using ===).
 * This is useful when passing callbacks to optimized child components
 * that rely on reference equality to prevent unnecessary renders.
 *
 * @param fn The function to memoize.
 * @param dependencies If present, memoized value will only activate if the values in the list change (using ===).
 *
 * @returns A memoized version of the callback.
 */
export function useCallback<T extends Function>(fn: T, dependencies?: Dependencies): T {
    return useMemo(() => fn, dependencies)
}

/**
 * `useRef` returns a mutable ref object whose `.current` property is initialized to the passed argument
 * (`initialValue`). The returned object will persist for the full lifetime of the component.
 *
 * Note that `useRef()` is useful for more than the `ref` attribute. It’s handy for keeping any mutable
 * value around similar to how you’d use instance fields in classes.
 *
 * @param initialValue the initial value to store in the ref object.
 *
 * @returns A mutable ref object whose `.current` property is initialized to the passed argument.
 */
export function useRef<T>(initialValue: T): RefObject<T>
export function useRef<T>(initialValue: T | null): RefObject<T>
export function useRef<T = undefined>(): RefObject<T | undefined>
export function useRef<T = undefined>(initialValue?: T): RefObject<T | undefined> {
    return useMemo(() => ({ current: initialValue }))
}

/**
 * Returns a memoized value that only changes if one of the `dependencies` has changed (using ===).
 * This hook is useful to optimize performance for expensive calculations that don’t need to be recalculated
 * on every render.
 *
 * @param calculateValue A function that returns the value to be memoized.
 * @param dependencies If present, memoized value will only activate if the values in the list change (using ===).
 *
 * @returns The memoized value.
 */
export function useMemo<T>(calculateValue: () => T, dependencies: Dependencies = []): T {
    const [hook, current] = getHookState<HookStateMemo>(currentIndex++)

    if (haveDependenciesChanged(hook[1], dependencies)) {
        hook[1] = dependencies
        hook[0] = createHookCallback(calculateValue, current)()
    }

    return hook[0]
}

function getHookState<T extends HookState = HookState>(index: number): [Partial<T>, Fiber] {
    const current = getCurrentFC()
    if (!current.hooks) {
        current.hooks = {
            [HookType.List]: [],
            [HookType.Effect]: [],
            [HookType.Layout]: [],
        }
    }

    const list = current.hooks[HookType.List]

    if (index >= list.length) {
        list.push([] as any)
    }

    return [list[index], current] as any
}

function haveDependenciesChanged(a?: Dependencies, b?: Dependencies): boolean {
    return !a || a.length !== b?.length || b.some((arg, index) => !isEqual(arg, a[index]))
}

function createHookCallback<T extends (...args: any[]) => any>(callback: T, current: Fiber): T {
    return ((...args: any[]) => {
        setCurrentFC(current)
        return callback(...args)
    }) as T
}
