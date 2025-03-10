import { isFunction, NULL, UNDEFINED } from './util'
import { FIBER_TYPE } from './symbols'
import { ExternalFC, FC } from './component'
import {
    Children,
    Fiber,
    FiberFC,
    FiberHostBase,
    IntrinsicPropsOf,
    Key,
    PropsOf,
} from './fiber'
import { Ref } from './ref'

let fiberId = 0

export function h<T extends FC>(
    type: T,
    props?: IntrinsicPropsOf<T> | null,
    ...children: Children[]
): FiberFC
export function h<T extends keyof JSX.IntrinsicElements>(
    type: T,
    props?: IntrinsicPropsOf<T> | null,
    ...children: Children[]
): FiberHostBase<T>
export function h<T extends FC | keyof JSX.IntrinsicElements>(
    type: T,
    props?: IntrinsicPropsOf<T> | null,
    ...children: Children[]
) {
    const nonNullProps = props ?? ({} as IntrinsicPropsOf<T>)
    const key = nonNullProps.key ?? UNDEFINED
    const ref = nonNullProps.ref ?? UNDEFINED
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

    return createFiber(type, nonNullProps as PropsOf<T>, key, ref)
}

export function normalizeChildren(children: Children) {
    const arr = Array.isArray(children) ? children : [children]
    return arr
        .filter(child => child != NULL)
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
        obj !== NULL &&
        (obj as Fiber).$$typeof === FIBER_TYPE
    )
}

const createFiber = <T extends FC<any> | keyof JSX.IntrinsicElements>(
    type: T,
    props: PropsOf<T>,
    key?: Key,
    ref?: Ref,
): Fiber => ({
    $$typeof: FIBER_TYPE,
    id: ++fiberId,
    fc: isFunction(type) as any,
    type,
    key,
    ref,
    props,
})

export function Fragment(props: IntrinsicPropsOf<FC>) {
    // For JSX compatibility
    return props.children as JSX.Element
}

export function memo<P = {}>(
    component: ExternalFC<P>,
    comparer?: ExternalFC<P>['shouldUpdate'],
) {
    component.memo = true
    component.shouldUpdate = comparer
    return component
}
