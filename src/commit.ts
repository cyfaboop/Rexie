import { Ref } from './ref'
import { placeNode, removeNode, RexieNode, updateNode } from './pixijs'
import { HookState, HookType } from './hooks'
import { isFunction } from './util'
import { Fiber, FiberFinish, Command } from './fiber'
import { schedule } from './schedule'

export function commitWork(fiber?: FiberFinish) {
    if (!fiber) return

    if (fiber.fc) {
        if (fiber.child) fiber.child.cmd |= fiber.cmd
    } else {
        if (fiber.cmd & Command.PLACEMENT) {
            placeNode(fiber.parentNode, fiber.node, fiber.old?.node)
        }
        if (fiber.cmd & Command.UPDATE) {
            updateNode(fiber.node, fiber.props, fiber.old?.props || {})
        }
    }

    fiber.cmd = Command.NONE

    attachRef(fiber.ref, fiber.node)
    commitDeletions(fiber)

    commitSiblingWork(fiber.child)
    commitSiblingWork(fiber.sibling)

    commitHookEffects(fiber)
}

function commitSiblingWork(fiber?: FiberFinish) {
    if (fiber?.memo) {
        commitSiblingWork(fiber.sibling)
    } else {
        commitWork(fiber)
    }
}

function commitDeletions(fiber: FiberFinish) {
    fiber.deletions.forEach(deletion =>
        recursivelyTraverseUnmountFiber(deletion),
    )
    fiber.deletions = []
}

export function recursivelyTraverseUnmountFiber(fiber: Fiber | FiberFinish) {
    if (fiber.fc) {
        if (fiber.hooks) {
            unmountEffects(fiber.hooks[HookType.List])
            fiber.hooks[HookType.Effect].length = 0
            fiber.hooks[HookType.Layout].length = 0
        }
    } else {
        if (fiber.parentNode && fiber.node) {
            removeNode(fiber.parentNode, fiber.node)
        }
        attachRef(fiber.ref, undefined)
    }

    // Ensure all child fibers are properly unmounted
    fiber.children?.forEach(recursivelyTraverseUnmountFiber)
}

function attachRef(ref?: Ref, node?: RexieNode) {
    if (ref) {
        isFunction(ref) ? ref(node) : (ref.current = node)
    }
}

function commitHookEffects(fiber: Fiber) {
    if (fiber.hooks) {
        updateEffects(fiber.hooks[HookType.Layout])
        schedule(
            () => fiber.hooks && updateEffects(fiber.hooks[HookType.Effect]),
        )
    }
}

function updateEffects(effects: HookState[]) {
    unmountEffects(effects)
    effects.forEach(e => (e[2] = e[0]?.()))
    // Only the new effect from the next change will trigger an effect update
    effects.length = 0
}

function unmountEffects(effects: HookState[]) {
    effects.forEach(e => e[2]?.())
}
