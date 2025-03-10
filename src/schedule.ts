import { NULL, UNDEFINED } from './util'

export type TaskGenerator = (pending?: boolean) => TaskGenerator | void

export interface Task {
    next?: TaskGenerator
    onResolved?: () => void
}

let deadline = 0
let useMicrotask = false
const taskQueue: Task[] = []
const TASK_YIELD_THRESHOLD_MS = 5

/**
 * Non-urgent update (transitional update):
 * For example, search suggestions, data loading, etc., which can be processed later.
 * Marks the wrapped update as non-urgent, and the action will be executed after the UI update.
 */
export function startTransition(action: () => void) {
    schedule(action)
}

export function schedule(next: TaskGenerator, onResolved?: () => void) {
    taskQueue.push({ next, onResolved })
    startUnitOfWork(processTaskQueue)
}

function processTaskQueue() {
    deadline = performance.now() + TASK_YIELD_THRESHOLD_MS

    while (firstTask() && !shouldYield()) {
        const task = firstTask()
        const next = task.next?.()
        if (next) {
            task.next = next
        } else {
            taskQueue.shift()
            task.next = UNDEFINED
            task.onResolved?.()
        }
    }

    if (firstTask()) {
        useMicrotask = !shouldYield()
        startUnitOfWork(processTaskQueue)
    }
}

const firstTask = () => taskQueue[0]

/**
 * Determines if the current task should yield control back to the main thread.
 * This function compares the current time with a predefined deadline.
 */
export const shouldYield = () => performance.now() >= deadline

function startUnitOfWork(work: () => void) {
    if (useMicrotask && typeof queueMicrotask !== 'undefined')
        queueMicrotask(work)
    else if (typeof MessageChannel !== 'undefined') {
        const { port1, port2 } = new MessageChannel()
        port1.onmessage = work
        port2.postMessage(NULL)
    } else setTimeout(work)
}
