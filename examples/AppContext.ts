import * as PIXI from 'pixi.js'
import { createContext } from 'rexie'

export const AppContext = createContext<PIXI.Application<PIXI.Renderer> | null>(
    null,
)
