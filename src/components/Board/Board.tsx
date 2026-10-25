import { useState, type FC } from 'react'
import { NotesCanvas } from '../NotesCanvas/NotesCanvas'
import { DEFAULT_SIZE } from './geometry'
import { colors, createNote } from './notes'
import type { Note, NoteColor, Point } from './types'
import { loadNotes, saveNotes } from './storage'
import { useTheme } from '../../hooks/useTheme'

const NEW_NOTE_POSITION: Point = { x: 40, y: 40 }

export const Board: FC = () => {
  const { theme, toggleTheme } = useTheme()
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  const [color, setColor] = useState<NoteColor>('yellow')

  const handleNotesChange = (next: Note[]) => {
    if (next === notes) return
    setNotes(next)
    saveNotes(next)
  }

  const addNote = () => {
    handleNotesChange([
      ...notes,
      createNote({ ...NEW_NOTE_POSITION, ...DEFAULT_SIZE }, color),
    ])
  }

  return (
    <main className="app">
      <header className="toolbar">
        <h1>
          <span className="brand-mark" aria-hidden="true" />
          Sticky notes
        </h1>

        <div className="palette" role="group" aria-label="New note color">
          {colors.map((value) => (
            <button
              key={value}
              className={`swatch note--${value}`}
              aria-label={`${value} notes`}
              aria-pressed={color === value}
              title={`${value} notes`}
              onClick={() => setColor(value)}
            >
              {color === value && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>

        <p className="toolbar-hint">Click to add. Drag to draw.</p>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={
            theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
          }
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {theme === 'dark' ? (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </>
            ) : (
              <path d="M20.9 13a9 9 0 0 1-9.9-9.9A9 9 0 1 0 20.9 13Z" />
            )}
          </svg>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        <button className="add-note" onClick={addNote}>
          + New note
        </button>
      </header>

      <NotesCanvas
        notes={notes}
        color={color}
        onNotesChange={handleNotesChange}
      />
    </main>
  )
}
