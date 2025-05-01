import { Ref } from './ref'
import { placeNode, removeNode, RexieNode, updateNode } from './pixijs'
import { HookState, HookType } from './hooks'
import { isFunction } from './util'
import { Fiber, FiberFinish, Command } from './fiber'
import { schedule } from './schedule'

export function commitWork(fiber: FiberFinish): void {
    commitDeletions(fiber)
    commitCommand(fiber)
}

function commitDeletions(fiber: FiberFinish): void {
    fiber.root.deletions.forEach(recursivelyTraverseUnmountFiber)
    fiber.root.deletions = []
}

export function recursivelyTraverseUnmountFiber(fiber: Fiber | FiberFinish): void {
    if (fiber.destroyed) return

    if (fiber.fc) {
        if (fiber.hooks) {
            unmountEffects(fiber.hooks[HookType.List])
            fiber.hooks[HookType.Effect].length = 0
            fiber.hooks[HookType.Layout].length = 0
        }
    } else {
        removeNode(fiber.node!)
        attachRef(fiber.ref, undefined)
    }

    fiber.destroyed = true

    // Ensure all child fibers are properly unmounted
    fiber.children?.forEach(recursivelyTraverseUnmountFiber)
}

function commitCommand(fiber?: FiberFinish): void {
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

    commitSiblingCommand(fiber.child)
    commitSiblingCommand(fiber.sibling)

    commitHookEffects(fiber)
}

function commitSiblingCommand(fiber?: FiberFinish): void {
    if (fiber?.memo) {
        commitSiblingCommand(fiber.sibling)
    } else {
        commitCommand(fiber)
    }
}

function attachRef(ref?: Ref, node?: RexieNode): void {
    if (ref) {
        if (isFunction(ref)) {
            ref(node)
        } else {
            ref.current = node
        }
    }
}

function commitHookEffects(fiber: Fiber): void {
    if (fiber.hooks) {
        updateEffects(fiber.hooks[HookType.Layout])
        schedule(() => fiber.hooks && updateEffects(fiber.hooks[HookType.Effect]))
    }
}

function updateEffects(effects: HookState[]): void {
    unmountEffects(effects)
    effects.forEach(e => (e[2] = e[0]?.()))
    // Only the new effect from the next change will trigger an effect update
    effects.length = 0
}

function unmountEffects(effects: readonly HookState[]): void {
    effects.forEach(e => e[2]?.())
}
