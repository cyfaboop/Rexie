import { Ref } from './ref'
import { placeNode, removeNode, RexieNode, updateNode } from './pixi'
import { HookState, HookType } from './hooks'
import { isFunction } from './util'
import { Fiber, FiberFinish, Tag } from './fiber'
import { startTransition } from './schedule'

export function commitWork(fiber?: FiberFinish) {
    if (!fiber) return

    if (fiber.fc) {
        if (fiber.child) fiber.child.tag |= fiber.tag
    } else {
        if (fiber.tag & Tag.PLACEMENT) {
            placeNode(fiber.parentNode, fiber.node, fiber.old?.node)
            if (fiber.old) {
                deleteFiber(fiber.old)
            }
        }
        if (fiber.tag & Tag.UPDATE) {
            updateNode(fiber.node, fiber.props, fiber.old?.props || {})
        }
    }

    fiber.tag = Tag.NONE
    fiber.old = undefined
    attachRef(fiber.ref, fiber.node)
    commitWork(fiber.child)
    commitDeletions(fiber)
    commitWork(fiber.sibling)
    commitHookEffects(fiber)
}

function commitDeletions(fiber: FiberFinish) {
    fiber.deletions?.forEach(deletion => deleteFiber(deletion))
    fiber.deletions = undefined
}

function deleteFiber(fiber: FiberFinish) {
    if (fiber.fc) {
        fiber.hooks && unmountEffects(fiber.hooks[HookType.List])
        fiber.children?.forEach(deleteFiber)
    } else {
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
