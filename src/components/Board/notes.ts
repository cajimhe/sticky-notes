import type { Note, NoteColor, Rect } from './types'

export const colors = ['yellow', 'pink', 'blue', 'green', 'purple'] as const

export const createNote = (rect: Rect, color: NoteColor): Note => ({
  ...rect,
  id: crypto.randomUUID(),
  text: '',
  color,
})

export const updateNote = (
  notes: Note[],
  id: string,
  changes: Partial<Omit<Note, 'id'>>,
): Note[] =>
  notes.map((note) => (note.id === id ? { ...note, ...changes } : note))

export const deleteNote = (notes: Note[], id: string): Note[] =>
  notes.filter((note) => note.id !== id)

export const bringToFront = (notes: Note[], id: string): Note[] => {
  const note = notes.find((note) => note.id === id)
  return !note || notes.at(-1) === note
    ? notes
    : [...notes.filter((note) => note.id !== id), note]
}
