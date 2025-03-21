import { RexieNode } from './pixijs'
import { Fiber } from './fiber'
import { recursivelyTraverseUnmountFiber } from './commit'
import { schedule } from './schedule'
import { performSyncWork, performConcurrentWork } from './workLoop'

export function render(fiber: Fiber, node: RexieNode, sync: true): void
export function render(
    fiber: Fiber,
    node: RexieNode,
    sync: false,
): (() => void) | void
export function render(
    fiber: Fiber,
    node: RexieNode,
    sync?: boolean,
): (() => void) | void
export function render(fiber: Fiber, node: RexieNode, sync = false) {
    fiber.rootNode = node
    return update(fiber, sync)
}

export function update(fiber: Fiber, sync: true): void
export function update(fiber: Fiber, sync: false): (() => void) | void
export function update(fiber: Fiber, sync?: boolean): (() => void) | void
export function update(fiber: Fiber, sync = false) {
    // Commit changes only if the node is marked as dirty.
    // Concurrent mode will defer the update call to ensure all synchronous setters are fully executed.
    // Equivalent to batching updates
    if (!fiber.dirty) {
        fiber.dirty = true
        if (sync) {
            performSyncWork(fiber)
        } else {
            const interrupt = schedule(() => performConcurrentWork(fiber))
            return () => {
                interrupt()
                recursivelyTraverseUnmountFiber(fiber)
            }
        }
    }
}
