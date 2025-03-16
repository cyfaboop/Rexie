import { Fiber, FiberFinish } from './fiber'
import { commitWork } from './commit'
import { shouldYield } from './schedule'
import { isMemoizedComponent, updateComponent } from './component'

export function performSyncWork(fiber?: Fiber) {
    while (fiber) {
        fiber = performUnitOfWork(fiber)
    }
}

export function performConcurrentWork(fiber?: Fiber) {
    while (fiber && !shouldYield()) {
        fiber = performUnitOfWork(fiber)
    }

    if (fiber) {
        return () => performConcurrentWork(fiber)
    }
}

function performUnitOfWork(fiber: Fiber) {
    if (isMemoizedComponent(fiber)) {
        fiber.memo = true
    } else {
        if (fiber.memo) {
            fiber.memo = false
        }

        updateComponent(fiber)
        if (fiber.child) {
            return fiber.child
        }
    }

    let next: Fiber | undefined = fiber
    while (next) {
        if (next.dirty) {
            next.dirty = false
            commitWork(next as FiberFinish)
            return
        }
        if (next.sibling) {
            return next.sibling
        }
        next = next.parent
    }
}
