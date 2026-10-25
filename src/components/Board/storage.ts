import { MIN_WIDTH, MIN_HEIGHT } from './geometry'
import { colors } from './notes'
import type { Note } from './types'

const KEY = 'sticky-notes:v1'

const isNote = (value: unknown): value is Note => {
  if (typeof value !== 'object' || value === null) return false
  const note = value as Record<string, unknown>
  return (
    typeof note.id === 'string' &&
    note.id.length > 0 &&
    typeof note.text === 'string' &&
    colors.some((color) => color === note.color) &&
    ['x', 'y', 'width', 'height'].every(
      (key) => typeof note[key] === 'number' && Number.isFinite(note[key]),
    ) &&
    (note.x as number) >= 0 &&
    (note.y as number) >= 0 &&
    (note.width as number) >= MIN_WIDTH &&
    (note.height as number) >= MIN_HEIGHT
  )
}

export const loadNotes = (): Note[] => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === null) return []
    const data: unknown = JSON.parse(raw)
    if (
      !Array.isArray(data) ||
      !data.every(isNote) ||
      new Set(data.map((note) => note.id)).size !== data.length
    ) {
      throw new Error('Invalid saved notes')
    }
    return data
  } catch {
    return []
  }
}

export const saveNotes = (notes: Note[]): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(notes))
  } catch (error) {
    console.warn('Could not save notes', error)
  }
}
