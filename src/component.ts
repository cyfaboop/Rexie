import { normalizeChildrenToFibers } from './h'
import { resetHookIndex } from './hooks'
import { createNode, RexieNode } from './pixijs'
import { IntrinsicAttributes, Children, Fiber, FiberFC, FiberHost } from './fiber'
import { reconcileFiberChildrenShallowly } from './reconcile'
import { FiberRoot } from './root'

export interface ExternalFC<P = IntrinsicAttributes> extends Omit<FC<P>, 'id'> {
    (props: P & IntrinsicAttributes): Fiber
}

export interface FC<P = IntrinsicAttributes> {
    (props: P & IntrinsicAttributes): Children
    id: string
    memo?: boolean
    shouldUpdate?: (newProps: Readonly<P>, oldProps: Readonly<P>) => boolean
}

let currentFC: Fiber | undefined

export function setCurrentFC(fiber: Fiber) {
    currentFC = fiber
}

export function getCurrentFC(): Fiber {
    if (!currentFC) {
        throw new Error('Invalid hook call')
    }

    return currentFC
}

export function updateComponent(fiber: Fiber) {
    fiber.root = findRoot(fiber)
    if (!fiber.root) {
        throw new Error('Not found the root.')
    }

    if (fiber.fc) {
        updateFC(fiber)
    } else {
        updateHost(fiber)
    }
}

function findRoot(fiber: Readonly<Fiber>): FiberRoot | undefined {
    let parent = fiber
    while (parent) {
        if (parent.root) {
            return parent.root
        }

        if (parent.parent) {
            parent = parent.parent
        } else {
            return parent.root
        }
    }
}

function updateFC(fiber: FiberFC) {
    resetHookIndex()
    setCurrentFC(fiber)
    reconcileFiberChildrenShallowly(fiber, normalizeChildrenToFibers(fiber.type(fiber.props)))
}

function updateHost(fiber: FiberHost) {
    fiber.parentNode = findClosestHostParentNode(fiber)
    if (!fiber.parentNode) {
        throw new Error('Not found the parent node.')
    }

    if (!fiber.node) {
        fiber.node = createNode(fiber)
    }

    reconcileFiberChildrenShallowly(fiber, fiber.props.children || [])
}

function findClosestHostParentNode(fiber: Readonly<FiberHost>): RexieNode | undefined {
    let parent = fiber?.parent
    while (parent) {
        if (!parent.fc) {
            return parent.node
        }

        if (parent.parent) {
            parent = parent.parent
        } else {
            return parent.root?.node
        }
    }
}

export function isMemoizedComponent(fiber: Readonly<Fiber>): boolean {
    if (fiber.fc && fiber.type.memo && fiber.type === fiber.old?.type && fiber.old.props) {
        const shouldUpdate = fiber.type.shouldUpdate || havePropsChangedShallowly
        if (!shouldUpdate(fiber.props, fiber.old.props)) {
            return true
        }
    }
    return false
}

function havePropsChangedShallowly(
    a: Readonly<Record<string, unknown>>,
    b: Readonly<Record<string, unknown>>,
): boolean {
    for (const k in a) {
        if (!(k in b)) {
            return true
        }
    }
    for (const k in b) {
        if (a[k] !== b[k]) {
            return true
        }
    }

    return false
}
