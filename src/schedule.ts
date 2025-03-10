import { NULL, UNDEFINED } from './util'

export type Action = (() => Action) | Promise<Action> | void

export interface Task {
    next: Action
    wait?: boolean
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
export function startTransition(action: () => void | Promise<void>) {
    schedule(action)
}

export function schedule(action: Action, onResolved?: () => void) {
    taskQueue.push({ next: action, onResolved })
    scheduleWork(processTaskQueue)
}

function processTaskQueue() {
    deadline = performance.now() + TASK_YIELD_THRESHOLD_MS

    while (firstTask() && !shouldYield()) {
        const task = firstTask()
        if (task.next instanceof Promise) {
            processAsyncAction(task, task.next)
        } else if (task.next) {
            processActionSync(task, task.next)
        } else {
            resolveSyncTask(task)
        }
    }

    if (firstTask()) {
        useMicrotask = !shouldYield()
        scheduleWork(processTaskQueue)
    }
}

const firstTask = () => taskQueue[0]

/**
 * Determines if the current task should yield control back to the main thread.
 * This function compares the current time with a predefined deadline.
 */
export const shouldYield = () => performance.now() >= deadline

async function processAsyncAction(task: Task, action: Promise<Action>) {
    taskQueue.shift()
    taskQueue.push(task)

    if (task.wait === UNDEFINED) {
        task.wait = true
    } else {
        return
    }

    action
        .then(next => {
            if (next) {
                task.next = next
            } else {
                resolveAsyncTask(task)
            }
        })
        .catch(err => {
            resolveAsyncTask(task)

            if (__DEV__) {
                console.error(err)
            }
        })
}

function resolveAsyncTask(task: Task) {
    const first = firstTask()
    if (first == task) {
        resolveSyncTask(task)
    } else {
        taskQueue.splice(
            taskQueue.findIndex(t => t == task),
            1,
        )
        task.next = UNDEFINED
        task.wait = UNDEFINED
        first.onResolved = () => {
            first.onResolved?.()
            task.onResolved?.()
        }
    }
}

function processActionSync(task: Task, action: () => Action | void) {
    const next = action?.()
    if (next) {
        task.next = next
    } else {
        resolveSyncTask(task)
    }
}

function resolveSyncTask(task: Task) {
    taskQueue.shift()
    task.next = UNDEFINED
    task.onResolved?.()
}

function scheduleWork(work: () => void) {
    if (useMicrotask && typeof queueMicrotask !== 'undefined')
        queueMicrotask(work)
    else if (typeof MessageChannel !== 'undefined') {
        const { port1, port2 } = new MessageChannel()
        port1.onmessage = work
        port2.postMessage(NULL)
    } else setTimeout(work)
}
