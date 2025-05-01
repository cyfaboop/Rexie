import { Ref } from './ref'
import { isFunction } from './util'
import { Children, Fiber, FiberFC, FiberHostBase, ExternalPropsOf, Key, PropsOf } from './fiber'
import { FIBER_TYPE } from './symbols'
import { ExternalFC, FC } from './component'

let fiberId = 0
let componentId = 0

/**
 * Creates a new fiber node.
 *
 * @param type The type of the fiber node. This can be a function component or a string representing a element.
 * @param props The properties to be passed to the fiber node. This can include attributes, event handlers, and children.
 * @param children  The children of the fiber node. This can be a single child or an array of children.
 *
 * @returns A new fiber node.
 */
export function h<T extends ExternalFC<P>, P = any>(
    type: T,
    props?: ExternalPropsOf<T> | null,
    ...children: Children[]
): FiberFC
export function h<T extends keyof JSX.IntrinsicElements>(
    type: T,
    props?: ExternalPropsOf<T> | null,
    ...children: Children[]
): FiberHostBase<T>
export function h<T extends ExternalFC<any> | keyof JSX.IntrinsicElements>(
    type: T,
    props?: ExternalPropsOf<T> | null,
    ...children: Children[]
): Fiber {
    const nonNullProps = props ?? ({} as ExternalPropsOf<T>)
    const key = nonNullProps.key ?? undefined
    const ref = nonNullProps.ref ?? undefined
    delete nonNullProps.key
    delete nonNullProps.ref

    const nChildren = normalizeChildrenToFibers(props?.children || children.flat())
    if (
        type === 'text' &&
        !('text' in nonNullProps) &&
        nChildren.length === 1 &&
        nChildren[0].type === 'text'
    )
        (nonNullProps as PropsOf<'text'>).text = '' + nChildren[0].props.text
    else if (nChildren.length > 0) nonNullProps.children = nChildren

    return createFiber(type as FC, nonNullProps, key, ref)
}

export function normalizeChildrenToFibers(children: Children): Fiber[] {
    const arr: Children[] = Array.isArray(children) ? children : [children]
    return arr
        .filter(child => child != null)
        .map(child => {
            if (isValidElement(child)) return child
            return h('text', {
                text: child,
            })
        })
}

/**
 * Checks if the given object is a valid fiber node.
 *
 * @param element The object to be checked.
 *
 * @returns True if the object is a valid fiber node, false otherwise.
 */
export function isValidElement(element: unknown): element is Fiber {
    return (
        typeof element === 'object' &&
        element !== null &&
        (element as Fiber).$$typeof === FIBER_TYPE
    )
}

function createFiber<T extends FC<any> | keyof JSX.IntrinsicElements>(
    type: T,
    props: PropsOf<T>,
    key?: Key,
    ref?: Ref,
): Fiber {
    // function namespace
    if (isFunction(type) && !type.id) type.id = `${type.name}_${++componentId}`
    return {
        $$typeof: FIBER_TYPE,
        id: ++fiberId,
        fc: isFunction(type) as any,
        type,
        key,
        ref,
        props,
    }
}

/**
 * Fragment is a special component that allows you to group a list of children without adding extra node container.
 * It is used to return multiple elements from a component without wrapping them in a single parent element.
 *
 * @param props The properties to be passed to the fragment. This can include attributes, event handlers, and children.
 *
 * @returns A new fiber node representing the fragment.
 */
export function Fragment(props: ExternalPropsOf<ExternalFC>): JSX.Element {
    // For JSX compatibility
    return props.children as JSX.Element
}

/**
 * Creates a memoized version of the given component.
 * This is useful for optimizing performance by preventing unnecessary re-renders.
 *
 * @param component The component to be memoized. This can be a function component or a class component.
 * @param shouldUpdate A function that determines whether the component should update or not.
 *
 * @returns A memoized version of the component.
 */
export function memo<P = object>(
    component: ExternalFC<P>,
    shouldUpdate?: ExternalFC<P>['shouldUpdate'],
): ExternalFC<P> {
    component.memo = true
    component.shouldUpdate = shouldUpdate
    return component
}
