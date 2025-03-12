import { Ref } from './ref'
import { Hooks } from './hooks'
import { RexieNode } from './pixi'
import { FIBER_TYPE } from './symbols'
import { FC } from './component'

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
    child?: FiberFinish
    parent?: FiberFinish
    sibling?: FiberFinish
    children?: FiberFinish[]
    deletions: FiberFinish[]
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

export interface FiberHostBase<
    T extends keyof JSX.IntrinsicElements = keyof JSX.IntrinsicElements,
> extends FiberBase {
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
    node?: RexieNode
    hooks?: Hooks
    child?: Fiber
    dirty?: boolean
    parent?: Fiber
    sibling?: Fiber
    children?: Fiber[]
    rootNode?: RexieNode
    deletions: Fiber[]
    parentNode?: RexieNode
}

export type PropsOf<T extends FC | keyof JSX.IntrinsicElements> = Omit<
    IntrinsicPropsOf<T>,
    'key' | 'ref' | 'children'
> & {
    children?: Fiber[]
}
export type IntrinsicPropsOf<T extends FC | keyof JSX.IntrinsicElements> =
    T extends FC<infer P>
        ? P
        : T extends keyof JSX.IntrinsicElements
          ? JSX.IntrinsicElements[T]
          : never

export interface IntrinsicAttributes<R = any> {
    key?: Key
    ref?: Ref<R>
    children?: Children
}

export type Key = string | number | symbol | null | undefined
export type Children = Child[] | Child
export type Child =
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
