import { Ref } from './ref'
import { Hooks } from './hooks'
import { FiberRoot } from './root'
import { RexieNode } from './pixijs'
import { FIBER_TYPE } from './symbols'
import { ExternalFC, FC } from './component'

export type FiberFinish = FiberFCFinish | FiberHostFinish
type FiberHostFinish = FiberBaseFinish &
    FiberHost & {
        node: RexieNode
        parentNode: RexieNode
    }
type FiberFCFinish = FiberBaseFinish &
    FiberFC & {
        node: undefined
        parentNode: undefined
    }

interface FiberBaseFinish extends FiberBase {
    cmd: Command
    old?: FiberFinish
    root: FiberRoot
    child?: FiberFinish
    parent?: FiberFinish
    sibling?: FiberFinish
    children?: FiberFinish[]
}

export type Fiber = FiberFC | FiberHost

export interface FiberFC extends FiberBase {
    fc: true
    type: FC
    props: PropsOf<FC>
}

export type FiberHost =
    | FiberHostBase<'text'>
    | FiberHostBase<'sprite'>
    | FiberHostBase<'graphics'>
    | FiberHostBase<'container'>

export interface FiberHostBase<T extends keyof JSX.IntrinsicElements = keyof JSX.IntrinsicElements>
    extends FiberBase {
    fc: false
    type: T
    props: PropsOf<T>
}

interface FiberBase {
    $$typeof: typeof FIBER_TYPE
    id: number
    key?: Key
    ref?: Ref
    cmd?: Command
    old?: Fiber
    memo?: boolean
    root?: FiberRoot
    node?: RexieNode
    hooks?: Hooks
    child?: Fiber
    dirty?: boolean
    parent?: Fiber
    sibling?: Fiber
    children?: Fiber[]
    destroyed?: boolean
    parentNode?: RexieNode
}

export type PropsOf<T extends FC | keyof JSX.IntrinsicElements> = Omit<
    T extends FC<infer P>
        ? P
        : T extends keyof JSX.IntrinsicElements
          ? JSX.IntrinsicElements[T]
          : never,
    'key' | 'ref' | 'children'
> & {
    children?: Fiber[]
}

export type ExternalPropsOf<T extends ExternalFC<P> | keyof JSX.IntrinsicElements, P = any> =
    T extends ExternalFC<infer P>
        ? P
        : T extends keyof JSX.IntrinsicElements
          ? JSX.IntrinsicElements[T]
          : never

export interface IntrinsicAttributes {
    key?: Key
    children?: Children
}

export type Key = string | number | symbol | null | undefined
export type Children =
    | Children[]
    | Fiber
    | object
    | string
    | number
    | bigint
    | boolean
    | null
    | undefined

export const enum Command {
    NONE = 0,
    UPDATE = 1 << 1,
    PLACEMENT = 1 << 2,
}
