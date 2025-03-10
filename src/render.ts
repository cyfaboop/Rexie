import { RexieNode } from './pixi'
import { Fiber } from './fiber'
import { schedule } from './schedule'
import { performSyncWork, performConcurrentWork } from './workLoop'

export function render(fiber: Fiber, node: RexieNode, sync = false) {
    fiber.rootNode = node
    update(fiber, sync)
}

export function update(fiber: Fiber, sync = false) {
    // Commit changes only if the node is marked as dirty
    if (!fiber.dirty) {
        fiber.dirty = true
        if (sync) {
            performSyncWork(fiber)
        } else {
            schedule(() => performConcurrentWork(fiber))
        }
    }
}
