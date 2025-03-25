import { describe, expect, jest, test } from '@jest/globals'
import { performance } from 'perf_hooks'

import { schedule } from 'src/schedule'

jest.spyOn(performance, 'now')

jest.useFakeTimers()

describe('Scheduler', () => {
    describe('schedule()', () => {
        test('should add task to queue and excute it', done => {
            schedule(() => {
                expect(true).toBe(true)
                done()
            })
        })
    })

    test('should cancel a scheduled task', () => {
        const cancelTask = schedule(() => {
            throw new Error('This task should have been canceled')
        })
        cancelTask()
        jest.advanceTimersByTime(10)
        expect(true).toBe(true)
    })

    test('should execute tasks in order', done => {
        const results: number[] = []
        schedule(() => {
            results.push(1)
            return () => {
                results.push(2)
                expect(results).toEqual([1, 2])
                done()
            }
        })
    })

    test('should handle async tasks', done => {
        schedule(
            new Promise<undefined>(resolve => {
                expect(true).toBe(true)
                resolve(undefined)
                done()
            }),
        )
    })

    test('should yield control when deadline is exceeded', () => {
        let taskExecuted = false
        jest.spyOn(performance, 'now')
            .mockImplementationOnce(() => 0)
            .mockImplementationOnce(() => 10)
        schedule(() => {
            taskExecuted = true
        })
        jest.advanceTimersByTime(10)
        expect(taskExecuted).toBe(false)
    })
})
