import * as PIXI from 'pixi.js'

import { FiberHost } from './fiber'

export type RexieNode = PIXI.ContainerChild

export function createNode(fiber: FiberHost) {
    let node: PIXI.Container
    switch (fiber.type) {
        case 'text':
            node = new PIXI.Text(fiber.props.options)
            break
        case 'sprite':
            node = new PIXI.Sprite(fiber.props.options)
            break
        case 'graphics':
            node = new PIXI.Graphics(fiber.props.options)
            break
        case 'container':
            node = new PIXI.Container(fiber.props.options)
            break
        default:
            throw new TypeError('Unknown node type')
    }
    updateNode(node, fiber.props, {})
    return node
}

export function updateNode(
    node: PIXI.Container,
    newProps: Record<string, any>,
    oldProps: Record<string, any>,
) {
    new Set([...Object.keys(newProps), ...Object.keys(oldProps)]).forEach(
        key => {
            const newProp = newProps[key]
            const oldProp = oldProps[key]

            if (
                newProp === oldProp ||
                key === 'children' ||
                key === 'options'
            ) {
            } else if (key[0] === 'o' && key[1] === 'n') {
                key = key.slice(2).toLowerCase()
                if (oldProp) {
                    node.removeEventListener(key, oldProp)
                }
                node.addEventListener(key, newProp)
            } else {
                try {
                    // @ts-expect-error
                    node[key] = newProp
                } catch (error) {
                    console.error(`Failed to set property "${key}": `, error)
                }
            }
        },
    )
}

export function placeNode(
    parent: RexieNode,
    newChild: RexieNode,
    oldChild?: RexieNode,
) {
    if (oldChild) {
        parent.addChildAt(newChild, parent.getChildIndex(oldChild))
    } else {
        parent.addChild(newChild)
    }
}

export function removeNode(parent: RexieNode, child: RexieNode) {
    parent.removeChild(child).destroy()
}
