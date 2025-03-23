import { Ref } from './ref'
import { isFunction } from './util'
import {
    Children,
    Fiber,
    FiberFC,
    FiberHostBase,
    ExternalPropsOf,
    Key,
    PropsOf,
} from './fiber'
import { FIBER_TYPE } from './symbols'
import { ExternalFC, FC } from './component'

let fiberId = 0
let componentId = 0

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
) {
    const nonNullProps = props ?? ({} as ExternalPropsOf<T>)
    const key = nonNullProps.key ?? undefined
    const ref = nonNullProps.ref ?? undefined
    delete nonNullProps.key
    delete nonNullProps.ref

    const nChildren = normalizeChildren(props?.children || children.flat())
    if (
        type === 'text' &&
        !('text' in nonNullProps) &&
        nChildren.length === 1 &&
        nChildren[0].type === 'text'
    )
        (nonNullProps as PropsOf<'text'>).text = '' + nChildren[0].props.text
    else if (nChildren.length > 0) nonNullProps.children = nChildren

    return createFiber(type as FC, nonNullProps as PropsOf<FC>, key, ref)
}

export function normalizeChildren(children: Children) {
    const arr = Array.isArray(children) ? children : [children]
    return arr
        .filter(child => child != null)
        .map(child => {
            if (isValidElement(child)) return child
            return h('text', {
                text: child,
            })
        })
}

export function isValidElement(obj: unknown): obj is Fiber {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        (obj as Fiber).$$typeof === FIBER_TYPE
    )
}

function createFiber<T extends FC<any> | keyof JSX.IntrinsicElements>(
    type: T,
    props: PropsOf<T>,
    key?: Key,
    ref?: Ref,
): Fiber {
    // function namespace
    if (isFunction(type) && !type.id) type.id = generateComponentId(type)
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

const generateComponentId = (c: Function) => {
    return `${c.name}_${++componentId}`
}

export function Fragment(props: ExternalPropsOf<ExternalFC>) {
    // For JSX compatibility
    return props.children as JSX.Element
}

export function memo<P = object>(
    component: ExternalFC<P>,
    comparer?: ExternalFC<P>['shouldUpdate'],
) {
    component.memo = true
    component.shouldUpdate = comparer
    return component
}
