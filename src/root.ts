import { Fiber } from './fiber'
import { recursivelyTraverseUnmountFiber } from './commit'
import { RexieNode } from './pixijs'
import { schedule } from './schedule'
import { performSyncWork, performConcurrentWork } from './workLoop'

/**
 * Creates a root for the given node.
 *
 * @param node The node to be used as the root.
 *
 * @returns A new FiberRoot instance.
 */
export function createRoot(node: RexieNode): FiberRoot {
    return new FiberRoot(node)
}

export class FiberRoot {
    public node: RexieNode
    public deletions: Fiber[] = []

    constructor(node: RexieNode) {
        this.node = node
    }

    private _unmount?: () => void

    /**
     * Renders the given fiber tree.
     *
     * @param fiber The fiber tree to be rendered.
     * @param sync Whether to render synchronously or asynchronously.
     */
    public render(fiber: Fiber, sync = false): void {
        fiber.root = this
        this._unmount = update(fiber, sync) || undefined
    }

    /**
     * Unmounts the fiber tree.
     */
    public unmount(): void {
        this._unmount?.()
        this._unmount = undefined
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
