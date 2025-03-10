import { Ref } from './ref'
import { placeNode, removeNode, RexieNode, updateNode } from './pixi'
import { HookState, HookType } from './hooks'
import { isFunction, UNDEFINED } from './util'
import { Fiber, FiberFinish, Tag } from './fiber'
import { schedule } from './schedule'

export function commitWork(fiber?: FiberFinish) {
    if (!fiber) return

    if (fiber.fc) {
        if (fiber.child) fiber.child.tag |= fiber.tag
    } else {
        if (fiber.tag & Tag.PLACEMENT) {
            placeNode(fiber.parentNode, fiber.node, fiber.old?.node)
            if (fiber.old) {
                commitDeletion(fiber.old)
            }
        }
        if (fiber.tag & Tag.UPDATE) {
            updateNode(fiber.node, fiber.props, fiber.old?.props || {})
        }
    }

    fiber.tag = Tag.NONE
    fiber.old = UNDEFINED
    attachRef(fiber.ref, fiber.node)
    commitWork(fiber.child)
    commitWork(fiber.sibling)
    // bubble
    commitDeletions(fiber)
    commitHookEffects(fiber)
}

function commitDeletions(fiber: FiberFinish) {
    fiber.deletions?.forEach(deletion => commitDeletion(deletion))
}

function commitDeletion(fiber: FiberFinish) {
    if (fiber.fc) {
        fiber.hooks && unmountEffects(fiber.hooks[HookType.List])
        fiber.children?.forEach(commitDeletion)
    } else {
        removeNode(fiber.parentNode, fiber.node)
        commitReleaseRef(fiber)
    }
}

function commitReleaseRef(fiber: Fiber) {
    if (fiber.children) fiber.children.forEach(child => commitReleaseRef(child))
    attachRef(fiber.ref, UNDEFINED)
}

function attachRef(ref?: Ref, node?: RexieNode) {
    if (!ref) return
    isFunction(ref) ? ref(node) : (ref.current = node)
}

function commitHookEffects(fiber: Fiber) {
    if (!fiber.hooks) return
    updateEffects(fiber.hooks[HookType.Layout])
    schedule(() => fiber.hooks && updateEffects(fiber.hooks[HookType.Effect]))
}

function updateEffects(effects: HookState[]) {
    unmountEffects(effects)
    effects.forEach(e => (e[2] = e[0]?.()))
    effects.length = 0
}

function unmountEffects(effects: HookState[]) {
    effects.forEach(e => e[2] && e[2]())
}
