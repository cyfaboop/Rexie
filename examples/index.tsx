import * as PIXI from 'pixi.js'
import { h, render } from 'rexie'

import { Examples } from './Examples'

async function mount() {
    const app = new PIXI.Application()
    await app.init({ background: '#ffffff', resizeTo: document.body })
    const container = new PIXI.Container()
    app.stage.addChild(container)
    document.body.appendChild(app.canvas)

    render(<Examples app={app} />, container)
}

mount()
