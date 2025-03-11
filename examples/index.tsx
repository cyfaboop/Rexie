import * as PIXI from 'pixi.js'

import { h, render } from 'src'
import { Examples } from './Examples'

async function mount() {
    const app = new PIXI.Application()
    await app.init({ background: '#ffffff', resizeTo: window })
    const container = new PIXI.Container()
    app.stage.addChild(container)
    document.body.appendChild(app.canvas)

    render(<Examples screen={app.screen} />, container)
}

mount()
