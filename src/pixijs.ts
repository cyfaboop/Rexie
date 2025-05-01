import * as PIXI from 'pixi.js'

import { FiberHost } from './fiber'

export type RexieNode = PIXI.ContainerChild

export function createNode(fiber: FiberHost): PIXI.Container {
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
    newProps: Readonly<Record<string, any>>,
    oldProps: Readonly<Record<string, any>>,
): void {
    new Set([...Object.keys(newProps), ...Object.keys(oldProps)]).forEach(key => {
        const newProp = newProps[key]
        const oldProp = oldProps[key]

        if (newProp === oldProp || key === 'children' || key === 'options') {
            return
        } else if (key[0] === 'o' && key[1] === 'n') {
            // TODO Optimize event handling: hitArea, interactive, bubble, etc.
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
    })
}

export function placeNode(parent: RexieNode, newChild: RexieNode, oldChild?: RexieNode): void {
    if (oldChild) {
        parent.addChildAt(newChild, parent.getChildIndex(oldChild))
    } else {
        parent.addChild(newChild)
    }
}

export function removeNode(child: RexieNode): void {
    child.removeFromParent()
    // PixiJS ensures destroyed nodes are not removed again
    child.destroy({ children: true })
}
