import * as PIXI from 'pixi.js'

import { Fiber, IntrinsicAttributes } from './fiber'

declare global {
    namespace JSX {
        export interface IntrinsicElements {
            text: TextElement
            sprite: SpriteElement
            graphics: GraphicsElement
            container: ContainerElement
        }

        export type Element = Fiber

        export interface TextElement
            extends ContainerElement<PIXI.TextOptions> {
            /** The anchor point of the text. */
            anchor?: PIXI.PointData | number
            /** Set the copy for the text object. To split a line you can use '\n'. */
            text?: PIXI.TextString
            /**
             * The resolution / device pixel ratio of the canvas.
             * @default 1
             */
            resolution?: number
            /**
             * Set the style of the text.
             *
             * Set up an event listener to listen for changes on the style object and mark the text as dirty.
             *
             * If setting the `style` can also be partial {@link PIXI.AnyTextStyleOptions}.
             * @type {
             * PIXI.TextStyle |
             * Partial<PIXI.TextStyle> |
             * PIXI.TextStyleOptions |
             * PIXI.HTMLTextStyle |
             * Partial<PIXI.HTMLTextStyle> |
             * PIXI.HTMLTextStyleOptions
             * }
             */
            style?:
                | PIXI.TextStyle
                | Partial<PIXI.TextStyle>
                | PIXI.TextStyleOptions
            /** Whether or not to round the x/y position. */
            roundPixels?: boolean
            /** The width of the sprite, setting this will actually modify the scale to achieve the value set. */
            width?: number
            /** The height of the sprite, setting this will actually modify the scale to achieve the value set. */
            height?: number
        }

        export interface SpriteElement
            extends ContainerElement<PIXI.SpriteOptions | PIXI.Texture> {}

        export interface GraphicsElement
            extends ContainerElement<
                PIXI.GraphicsOptions | PIXI.GraphicsContext
            > {}

        export interface ContainerElement<
            T = PIXI.ContainerOptions<PIXI.ContainerChild>,
        > extends IntrinsicAttributes,
                Options<T>,
                FederatedEventHandler {
            x?: number
            y?: number
            width?: number
            height?: number
            filterArea?: Rectangle
            effects?: Effect[]
            mask?: Mask
            filters?: Filter | Filter[]
            zIndex?: number
            sortDirty?: boolean
            sortableChildren?: boolean
        }

        type Options<T> = {
            /**
             * This property is immutable and only takes effect during the initial setup.
             */
            options?: T
        }

        export interface FederatedEventHandler {
            /** The cursor preferred when the mouse pointer is hovering over. */
            cursor?: PIXI.Cursor | string
            /** The mode of interaction for this object */
            eventMode?: PIXI.EventMode
            /** Whether this event target should fire UI events. */
            interactive?: boolean
            /** Whether this event target has any children that need UI events. This can be used optimize event propagation. */
            interactiveChildren?: boolean
            /** The hit-area specifies the area for which pointer events should be captured by this event target. */
            hitArea?: PIXI.IHitArea | null
            /** Handler for 'click' event */
            onClick?: PIXI.FederatedEventHandler | null
            /** Handler for 'mousedown' event */
            onMousedown?: PIXI.FederatedEventHandler | null
            /** Handler for 'mouseenter' event */
            onMouseenter?: PIXI.FederatedEventHandler | null
            /** Handler for 'mouseleave' event */
            onMouseleave?: PIXI.FederatedEventHandler | null
            /** Handler for 'mousemove' event */
            onMousemove?: PIXI.FederatedEventHandler | null
            /** Handler for 'globalmousemove' event */
            onGlobalMousemove?: PIXI.FederatedEventHandler | null
            /** Handler for 'mouseout' event */
            onMouseout?: PIXI.FederatedEventHandler | null
            /** Handler for 'mouseover' event */
            onMouseover?: PIXI.FederatedEventHandler | null
            /** Handler for 'mouseup' event */
            onMouseup?: PIXI.FederatedEventHandler | null
            /** Handler for 'mouseupoutside' event */
            onMouseupoutside?: PIXI.FederatedEventHandler | null
            /** Handler for 'pointercancel' event */
            onPointercancel?: PIXI.FederatedEventHandler | null
            /** Handler for 'pointerdown' event */
            onPointerdown?: PIXI.FederatedEventHandler | null
            /** Handler for 'pointerenter' event */
            onPointerenter?: PIXI.FederatedEventHandler | null
            /** Handler for 'pointerleave' event */
            onPointerleave?: PIXI.FederatedEventHandler | null
            /** Handler for 'pointermove' event */
            onPointermove?: PIXI.FederatedEventHandler | null
            /** Handler for 'globalpointermove' event */
            onGlobalPointermove?: PIXI.FederatedEventHandler | null
            /** Handler for 'pointerout' event */
            onPointerout?: PIXI.FederatedEventHandler | null
            /** Handler for 'pointerover' event */
            onPointerover?: PIXI.FederatedEventHandler | null
            /** Handler for 'pointertap' event */
            onPointertap?: PIXI.FederatedEventHandler | null
            /** Handler for 'pointerup' event */
            onPointerup?: PIXI.FederatedEventHandler | null
            /** Handler for 'pointerupoutside' event */
            onPointerupoutside?: PIXI.FederatedEventHandler | null
            /** Handler for 'rightclick' event */
            onRightclick?: PIXI.FederatedEventHandler | null
            /** Handler for 'rightdown' event */
            onRightdown?: PIXI.FederatedEventHandler | null
            /** Handler for 'rightup' event */
            onRightup?: PIXI.FederatedEventHandler | null
            /** Handler for 'rightupoutside' event */
            onRightupoutside?: PIXI.FederatedEventHandler | null
            /** Handler for 'tap' event */
            onTap?: PIXI.FederatedEventHandler | null
            /** Handler for 'touchcancel' event */
            onTouchcancel?: PIXI.FederatedEventHandler | null
            /** Handler for 'touchend' event */
            onTouchend?: PIXI.FederatedEventHandler | null
            /** Handler for 'touchendoutside' event */
            onTouchendoutside?: PIXI.FederatedEventHandler | null
            /** Handler for 'touchmove' event */
            onTouchmove?: PIXI.FederatedEventHandler | null
            /** Handler for 'globaltouchmove' event */
            onGlobalTouchmove?: PIXI.FederatedEventHandler | null
            /** Handler for 'touchstart' event */
            onTouchstart?: PIXI.FederatedEventHandler | null
            /** Handler for 'wheel' event */
            onWheel?: PIXI.FederatedEventHandler<PIXI.FederatedWheelEvent> | null
        }
    }
}
