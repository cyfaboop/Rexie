import { Fiber } from './fiber'
import { recursivelyTraverseUnmountFiber } from './commit'
import { RexieNode } from './pixijs'
import { schedule } from './schedule'
import { performSyncWork, performConcurrentWork } from './workLoop'

export function createRoot(node: RexieNode) {
    return new FiberRoot(node)
}

export class FiberRoot {
    public node: RexieNode
    public child?: Fiber
    public deletions: Fiber[] = []

    constructor(node: RexieNode) {
        this.node = node
    }

    private _unmount?: () => void

    public render(fiber: Fiber, sync: true): void
    public render(fiber: Fiber, sync: false): (() => void) | void
    public render(fiber: Fiber, sync?: boolean): (() => void) | void
    public render(fiber: Fiber, sync = false) {
        if (this.child) {
            this.unmount()
        }

        fiber.root = this
        this.child = fiber
        this._unmount = update(fiber, sync) || undefined
    }

    public unmount() {
        this._unmount?.()
        this.child = undefined
        this.deletions = []
    }
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
