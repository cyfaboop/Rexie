export type Action = (() => Action) | Promise<Action> | void

export interface Task {
    next: Action
    wait?: boolean
    cancel?: boolean
    waitTasks?: Task[]
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
    const task = { next: action, onResolved } as Task
    taskQueue.push(task)
    scheduleWork(processTaskQueue)
    return () => {
        task.cancel = true
        removeTask(task)
    }
}

function processTaskQueue() {
    deadline = performance.now() + TASK_YIELD_THRESHOLD_MS

    while (firstTask() && !shouldYield()) {
        const task = firstTask()
        if (task.cancel || !task.next) {
            resolveFirstTask()
            return
        }

        if (task.next instanceof Promise) {
            taskQueue.shift()
            taskQueue.push(task)
            if (task.wait) return
            task.wait = true

            task.next
                .then(next => {
                    if (next) {
                        task.next = next
                    } else {
                        resolveAsyncTask(task)
                    }
                })
                .catch(err => {
                    task.cancel = true
                    resolveAsyncTask(task)

                    if (__DEV__) {
                        console.error(err)
                    }
                })
        } else {
            try {
                const next = task.next()
                if (next) {
                    task.next = next
                } else {
                    resolveFirstTask()
                }
            } catch (err) {
                task.cancel = true
                resolveFirstTask()

                if (__DEV__) {
                    console.error(err)
                }
            }
        }
    }

    if (firstTask()) {
        useMicrotask = !shouldYield()
        scheduleWork(processTaskQueue)
    }
}

/**
 * Determines if the current task should yield control back to the main thread.
 * This function compares the current time with a predefined deadline.
 */
export const shouldYield = () => performance.now() >= deadline

function resolveAsyncTask(task: Task) {
    const first = firstTask()
    if (first === task) {
        resolveFirstTask()
    } else {
        removeTask(task, () => {
            task.next = undefined
            task.wait = undefined
            if (!task.cancel) {
                if (!first.waitTasks) first.waitTasks = []
                first.waitTasks.push(task)
            }
        })
    }
}

const firstTask = () => taskQueue[0]

function resolveFirstTask() {
    const task = taskQueue.shift()
    if (task) {
        task.next = undefined
        if (!task.cancel) {
            task.onResolved?.()
        }
        task.waitTasks?.forEach(task => !task.cancel && task.onResolved?.())
    }
}

function removeTask(task: Task, after?: () => void) {
    const index = taskQueue.findIndex(t => t === task)
    if (index > -1) {
        taskQueue.splice(index, 1)
        after?.()
    }
}

function scheduleWork(work: () => void) {
    if (useMicrotask && typeof queueMicrotask !== 'undefined') queueMicrotask(work)
    else if (typeof MessageChannel !== 'undefined') {
        const { port1, port2 } = new MessageChannel()
        port1.onmessage = work
        port2.postMessage(null)
    } else setTimeout(work)
}
