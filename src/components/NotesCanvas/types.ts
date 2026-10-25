import type { NoteColor, Point, Rect } from '../Board/types'

export type Gesture = {
  pointerId: number
  start: Point
  rect: Rect
} & (
  | { kind: 'creating'; color: NoteColor; dragging: boolean }
  | {
      kind: 'moving' | 'resizing'
      id: string
      original: Rect
      overTrash: boolean
    }
)
