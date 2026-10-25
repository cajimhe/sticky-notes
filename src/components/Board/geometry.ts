import type { Point, Rect, Size } from './types'

export const MIN_WIDTH = 160
export const MIN_HEIGHT = 140
export const DEFAULT_SIZE = { width: 240, height: 220 }

export const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(value, max))
}

export const moveRect = (rect: Rect, delta: Point): Rect => ({
  x: rect.x + delta.x,
  y: rect.y + delta.y,
  width: rect.width,
  height: rect.height,
})

export const resizeRect = (rect: Rect, delta: Point, bounds: Size): Rect => ({
  x: rect.x,
  y: rect.y,
  width: clamp(rect.width + delta.x, MIN_WIDTH, bounds.width - rect.x),
  height: clamp(
    rect.height + delta.y,
    MIN_HEIGHT,
    Math.max(rect.height, bounds.height - rect.y),
  ),
})

export const containsPoint = (point: Point, rect: Rect): boolean =>
  point.x >= rect.x &&
  point.x <= rect.x + rect.width &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.height

export const fitRect = (rect: Rect, bounds: Size): Rect => {
  const width = clamp(rect.width, MIN_WIDTH, bounds.width)
  const height = clamp(rect.height, MIN_HEIGHT, bounds.height)
  return {
    x: clamp(rect.x, 0, bounds.width - width),
    y: clamp(rect.y, 0, bounds.height - height),
    width,
    height,
  }
}

export const drawRect = (start: Point, end: Point, bounds: Size): Rect => {
  const x = clamp(end.x, 0, bounds.width)
  const y = clamp(end.y, 0, bounds.height)
  return {
    x: Math.min(start.x, x),
    y: Math.min(start.y, y),
    width: Math.abs(x - start.x),
    height: Math.abs(y - start.y),
  }
}

export const fitHeader = (
  rect: Rect,
  bounds: Size,
  headerHeight: number,
): Rect => {
  const width = Math.min(rect.width, bounds.width)
  return {
    width,
    height: rect.height,
    x: clamp(rect.x, 0, bounds.width - width),
    y: clamp(rect.y, 0, bounds.height - headerHeight),
  }
}
