import { isFunction } from './util'
import { Fiber, Command } from './fiber'

export function reconcileChildren(currentFiber: Fiber, newChildren: Fiber[]) {
    let oldChild: Fiber | undefined
    let prevChild: Fiber | undefined
    const oldChildren = currentFiber.children || []
    const oldKeyIndexMap = createKeyIndexMap(oldChildren)
    const reservedIndexMap: Record<number, boolean | undefined> = {}
    currentFiber.children = newChildren

    newChildren.forEach((newChild, index) => {
        oldChild = oldChildren[index] as Fiber | undefined
        newChild.old = oldChild
        newChild.parent = currentFiber
        if (prevChild) {
            prevChild.sibling = newChild
        }
        const newChildKT = keyAndType(newChild)
        if (oldChild && newChildKT === keyAndType(oldChild)) {
            newChild.cmd = Command.UPDATE
            mergeOldFiber(newChild, oldChild)
            reservedIndexMap[index] = true
        } else {
            newChild.cmd = Command.PLACEMENT
            const matchOldIndex = oldKeyIndexMap[newChildKT]
            if (matchOldIndex !== undefined) {
                mergeOldFiber(newChild, oldChildren[matchOldIndex])
                reservedIndexMap[matchOldIndex] = true
            }
        }

        prevChild = newChild
    })

    for (let i = 0; i < oldChildren.length; i++) {
        if (reservedIndexMap[i]) continue
        currentFiber.root!.deletions.push(oldChildren[i])
    }

    return newChildren[0]
}

function mergeOldFiber(target: Fiber, source: Fiber) {
    target.ref = source.ref
    target.node = source.node
    target.hooks = source.hooks
    target.child = source.child
    target.children = source.children
}

function createKeyIndexMap(children: Fiber[]) {
    const map: Record<string, number | undefined> = {}
    for (let i = 0; i < children.length; i++) {
        if (children[i].key === undefined) continue
        map[keyAndType(children[i])] = i
    }
    return map
}

function keyAndType(v: Fiber) {
    return `${v.key?.toString() || ''}${isFunction(v.type) ? v.type.id : v.type}`
}
