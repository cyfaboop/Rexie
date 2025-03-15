import * as PIXI from 'pixi.js'

import { Ref } from './ref'
import { Fiber, IntrinsicAttributes } from './fiber'

/*
type IfEquals<T, U> =
    (<G>() => G extends T ? 1 : 2) extends
    (<G>() => G extends U ? 1 : 2) ? true : false;

type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P> extends true ? P : never;
}[keyof T];

type RemoveGetters<T> = Pick<T, WritableKeys<T>>;
*/

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
            ref?: Ref<PIXI.Text>
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
            extends ContainerElement<PIXI.SpriteOptions | PIXI.Texture> {
            ref?: Ref<PIXI.Sprite>
            /** The texture that the sprite is using. */
            texture?: PIXI.Texture
            /**
             * The anchor sets the origin point of the sprite. The default value is taken from the {@link Texture}
             * and passed to the constructor.
             *
             * The default is `(0,0)`, this means the sprite's origin is the top left.
             *
             * Setting the anchor to `(0.5,0.5)` means the sprite's origin is centered.
             *
             * Setting the anchor to `(1,1)` would mean the sprite's origin point will be the bottom right corner.
             *
             * If you pass only single parameter, it will set both x and y to the same value as shown in the example below.
             * @example
             * import { Sprite } from 'pixi.js';
             *
             * const sprite = new Sprite({texture: Texture.WHITE});
             * sprite.anchor.set(0.5); // This will set the origin to center. (0.5) is same as (0.5, 0.5).
             */
            anchor?: PIXI.PointData | number
        }

        export interface GraphicsElement
            extends ContainerElement<
                PIXI.GraphicsOptions | PIXI.GraphicsContext
            > {
            ref?: Ref<PIXI.Graphics>
        }

        export interface ContainerElement<
            T = PIXI.ContainerOptions<PIXI.ContainerChild>,
        > extends Omit<IntrinsicAttributes, 'ref'>,
                Options<T>,
                FederatedEventHandler {
            ref?: Ref<PIXI.Container>
            /**
             * The position of the container on the x axis relative to the local coordinates of the parent.
             * An alias to position.x
             */
            x?: number
            /**
             * The position of the container on the y axis relative to the local coordinates of the parent.
             * An alias to position.y
             */
            y?: number
            /**
             * The coordinate of the object relative to the local coordinates of the parent.
             * @since 4.0.0
             */
            position?: PIXI.PointData
            /**
             * The rotation of the object in radians.
             * 'rotation' and 'angle' have the same effect on a display object; rotation is in radians, angle is in degrees.
             */
            rotation?: number
            /**
             * The angle of the object in degrees.
             * 'rotation' and 'angle' have the same effect on a display object; rotation is in radians, angle is in degrees.
             */
            angle?: number
            /**
             * The center of rotation, scaling, and skewing for this display object in its local space. The `position`
             * is the projection of `pivot` in the parent's local space.
             *
             * By default, the pivot is the origin (0, 0).
             * @since 4.0.0
             */
            pivot?: PIXI.PointData | number
            /**
             * The skew factor for the object in radians.
             * @since 4.0.0
             */
            skew?: PIXI.PointData
            /**
             * The scale factors of this object along the local coordinate axes.
             *
             * The default scale is (1, 1).
             * @since 4.0.0
             */
            scale?: PIXI.PointData | number
            /**
             * The width of the Container, setting this will actually modify the scale to achieve the value set.
             * @memberof scene.Container#
             */
            width?: number
            /**
             * The height of the Container, setting this will actually modify the scale to achieve the value set.
             * @memberof scene.Container#
             */
            height?: number
            /** The opacity of the object. */
            alpha?: number
            /**
             * The tint applied to the sprite. This is a hex value.
             *
             * A value of 0xFFFFFF will remove any tint effect.
             * @default 0xFFFFFF
             */
            tint?: PIXI.ColorSource
            /**
             * The blend mode to be applied to the sprite. Apply a value of `'normal'` to reset the blend mode.
             * @default 'normal'
             */
            blendMode?: PIXI.BLEND_MODES
            /** The visibility of the object. If false the object will not be drawn, and the transform will not be updated. */
            visible?: boolean
            /** Can this object be rendered, if false the object will not be drawn but the transform will still be updated. */
            renderable?: boolean
            filterArea?: PIXI.Rectangle
            effects?: PIXI.Effect[]
            mask?: PIXI.Mask
            filters?: PIXI.Filter | PIXI.Filter[]
            zIndex?: number
            sortDirty?: boolean
            sortableChildren?: boolean
            /**
             * An optional bounds area for this container. Setting this rectangle will stop the renderer
             * from recursively measuring the bounds of each children and instead use this single boundArea.
             * This is great for optimisation! If for example you have a 1000 spinning particles and you know they all sit
             * within a specific bounds, then setting it will mean the renderer will not need to measure the
             * 1000 children to find the bounds. Instead it will just use the bounds you set.
             */
            boundsArea?: PIXI.Rectangle
            isRenderGroup?: boolean
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
