import { Ref } from './ref'
import { placeNode, removeNode, RexieNode, updateNode } from './pixi'
import { HookState, HookType } from './hooks'
import { isFunction } from './util'
import { Fiber, FiberFinish, Command } from './fiber'
import { startTransition } from './schedule'

export function commitWork(fiber?: FiberFinish) {
    if (!fiber) return

    if (fiber.fc) {
        if (fiber.child) fiber.child.cmd |= fiber.cmd
    } else {
        if (fiber.cmd & Command.PLACEMENT) {
            placeNode(fiber.parentNode, fiber.node, fiber.old?.node)
            if (fiber.old) {
                unmountFiber(fiber.old)
            }
        }
        if (fiber.cmd & Command.UPDATE) {
            updateNode(fiber.node, fiber.props, fiber.old?.props || {})
        }
    }

    fiber.cmd = Command.NONE
    fiber.old = undefined
    attachRef(fiber.ref, fiber.node)
    commitWork(fiber.child)
    commitDeletions(fiber)
    commitWork(fiber.sibling)
    commitHookEffects(fiber)
}

function commitDeletions(fiber: FiberFinish) {
    fiber.deletions?.forEach(deletion => unmountFiber(deletion))
    fiber.deletions = undefined
}

export function unmountFiber(fiber: Fiber | FiberFinish) {
    if (fiber.fc) {
        fiber.hooks && unmountEffects(fiber.hooks[HookType.List])
        fiber.children?.forEach(unmountFiber)
    } else {
        fiber.parentNode &&
            fiber.node &&
            removeNode(fiber.parentNode, fiber.node)
        attachRef(fiber.ref, undefined)
    }
}

function attachRef(ref?: Ref, node?: RexieNode) {
    if (ref) {
        isFunction(ref) ? ref(node) : (ref.current = node)
    }
}

function commitHookEffects(fiber: Fiber) {
    if (fiber.hooks) {
        updateEffects(fiber.hooks[HookType.Layout])
        startTransition(
            () => fiber.hooks && updateEffects(fiber.hooks[HookType.Effect]),
        )
    }
}

function updateEffects(effects: HookState[]) {
    unmountEffects(effects)
    effects.forEach(e => (e[2] = e[0]?.()))
    effects.length = 0
}

function unmountEffects(effects: HookState[]) {
    effects.forEach(e => e[2] && e[2]())
}
