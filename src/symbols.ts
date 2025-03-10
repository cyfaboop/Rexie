const supportSymbol = typeof Symbol === 'function' && Symbol.for

export const FIBER_TYPE = supportSymbol ? Symbol.for('element') : 0xeac1
