import type { colors } from './notes'

export type Point = { x: number; y: number }
export type Size = { width: number; height: number }
export type Rect = Point & Size
export type NoteColor = (typeof colors)[number]
export type Note = Rect & { id: string; text: string; color: NoteColor }
