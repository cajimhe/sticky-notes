import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type FC,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import {
  containsPoint,
  drawRect,
  fitRect,
  fitHeader,
  moveRect,
  resizeRect,
  DEFAULT_SIZE,
  MIN_HEIGHT,
  MIN_WIDTH,
} from '../Board/geometry'
import {
  bringToFront,
  createNote,
  deleteNote,
  updateNote,
} from '../Board/notes'
import { NoteCard } from '../NoteCard/NoteCard'
import type { Note, NoteColor, Point } from '../Board/types'
import type { Gesture } from './types'

const DRAG_THRESHOLD = 5
const KEYBOARD_STEP = 5
const KEYBOARD_DELTAS: Record<string, Point> = {
  ArrowLeft: { x: -KEYBOARD_STEP, y: 0 },
  ArrowRight: { x: KEYBOARD_STEP, y: 0 },
  ArrowUp: { x: 0, y: -KEYBOARD_STEP },
  ArrowDown: { x: 0, y: KEYBOARD_STEP },
}

type NotesCanvasProps = {
  notes: Note[]
  color: NoteColor
  onNotesChange: (notes: Note[]) => void
}

export const NotesCanvas: FC<NotesCanvasProps> = ({
  notes,
  color,
  onNotesChange,
}) => {
  const [gesture, setGesture] = useState<Gesture | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const trashRef = useRef<HTMLDivElement>(null)

  const bounds = () => ({
    width: canvasRef.current!.clientWidth,
    height: canvasRef.current!.clientHeight,
  })

  const headerHeight = () => {
    const note = canvasRef.current!.querySelector('article')
    const header = note?.querySelector('.note-header')
    return note && header
      ? header.getBoundingClientRect().bottom - note.getBoundingClientRect().top
      : 0
  }

  const point = (event: PointerEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const cancelGesture = () => {
    setGesture(null)
    if (gesture && canvasRef.current?.hasPointerCapture(gesture.pointerId)) {
      canvasRef.current.releasePointerCapture(gesture.pointerId)
    }
  }

  const handleCanvasResize = useEffectEvent(() => {
    cancelGesture()
    const area = bounds()
    const visibleHeight = headerHeight()
    const next = notes.map((note) => {
      const rect = fitHeader(note, area, visibleHeight)
      return rect.x === note.x && rect.y === note.y && rect.width === note.width
        ? note
        : { ...note, ...rect }
    })
    if (next.some((note, index) => note !== notes[index])) onNotesChange(next)
  })

  const handleWindowBlur = useEffectEvent(() => cancelGesture())

  useEffect(() => {
    const observer = new ResizeObserver(handleCanvasResize)
    observer.observe(canvasRef.current!)
    window.addEventListener('blur', handleWindowBlur)
    return () => {
      observer.disconnect()
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !event.isPrimary || gesture) return
    if (!(event.target instanceof Element)) return
    const card = event.target.closest<HTMLElement>('[data-note]')
    const note = notes.find((note) => note.id === card?.dataset.note)
    if (note) onNotesChange(bringToFront(notes, note.id))
    const handle = event.target.closest<HTMLElement>('[data-note-handle]')
    if (!(note && handle) && event.target !== event.currentTarget) return

    event.preventDefault()
    canvasRef.current!.focus({ preventScroll: true })
    const start = point(event)
    const original = note ? fitHeader(note, bounds(), headerHeight()) : null
    setGesture(
      note && original
        ? {
            kind:
              handle?.dataset.noteHandle === 'resize' ? 'resizing' : 'moving',
            pointerId: event.pointerId,
            start,
            id: note.id,
            original,
            rect: original,
            overTrash: false,
          }
        : {
            kind: 'creating',
            pointerId: event.pointerId,
            start,
            rect: drawRect(start, start, bounds()),
            color,
            dragging: false,
          },
    )
    canvasRef.current!.setPointerCapture(event.pointerId)
  }

  const previewGesture = (event: PointerEvent, current: Gesture): Gesture => {
    const end = point(event)
    if (current.kind === 'creating') {
      return {
        ...current,
        rect: drawRect(current.start, end, bounds()),
        dragging:
          current.dragging ||
          Math.hypot(end.x - current.start.x, end.y - current.start.y) >=
            DRAG_THRESHOLD,
      }
    }
    const delta = { x: end.x - current.start.x, y: end.y - current.start.y }
    const trash = trashRef.current!.getBoundingClientRect()
    return {
      ...current,
      rect:
        current.kind === 'moving'
          ? moveRect(current.original, delta)
          : resizeRect(current.original, delta, bounds()),
      overTrash:
        current.kind === 'moving' &&
        containsPoint(
          { x: event.clientX, y: event.clientY },
          {
            x: trash.left,
            y: trash.top,
            width: trash.width,
            height: trash.height,
          },
        ),
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (gesture && event.pointerId === gesture.pointerId) {
      setGesture(previewGesture(event, gesture))
    }
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return
    const final = previewGesture(event, gesture)
    if (final.kind === 'creating') {
      if (!final.dragging) {
        onNotesChange([
          ...notes,
          createNote(
            fitRect({ ...final.start, ...DEFAULT_SIZE }, bounds()),
            final.color,
          ),
        ])
      } else if (
        final.rect.width >= MIN_WIDTH &&
        final.rect.height >= MIN_HEIGHT
      ) {
        onNotesChange([...notes, createNote(final.rect, final.color)])
      }
    } else if (final.overTrash) {
      onNotesChange(deleteNote(notes, final.id))
    } else {
      onNotesChange(
        updateNote(
          notes,
          final.id,
          final.kind === 'moving'
            ? fitHeader(final.rect, bounds(), headerHeight())
            : final.rect,
        ),
      )
      canvasRef.current
        ?.querySelector<HTMLTextAreaElement>(
          `[data-note="${CSS.escape(final.id)}"] textarea`,
        )
        ?.focus({ preventScroll: true })
    }
    cancelGesture()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && gesture) {
      event.preventDefault()
      event.stopPropagation()
      cancelGesture()
      return
    }
    if (
      gesture ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return
    if (
      !(event.target instanceof HTMLElement) ||
      !event.target.matches('article')
    )
      return
    const delta = KEYBOARD_DELTAS[event.key]
    if (!delta) return
    const id = event.target.closest<HTMLElement>('[data-note]')?.dataset.note
    const note = notes.find((note) => note.id === id)
    if (!note) return

    event.preventDefault()
    const area = bounds()
    const visibleHeight = headerHeight()
    const rect = fitHeader(note, area, visibleHeight)
    const next = event.shiftKey
      ? resizeRect(rect, delta, area)
      : fitHeader(moveRect(rect, delta), area, visibleHeight)
    onNotesChange(updateNote(notes, note.id, next))
  }

  const overTrash = gesture?.kind === 'moving' && gesture.overTrash
  const previewTooSmall =
    gesture?.kind === 'creating' &&
    (gesture.rect.width < MIN_WIDTH || gesture.rect.height < MIN_HEIGHT)

  return (
    <>
      <p id="note-keyboard-help" className="sr-only">
        Enter to edit. Escape to leave editing. Arrow keys move the note; Shift
        and arrow keys resize it. Delete removes the note. Tab moves to the next
        note.
      </p>

      <div
        ref={canvasRef}
        className={`board${gesture ? ` board--${gesture.kind}` : ''}`}
        aria-label="Notes board"
        tabIndex={-1}
        onKeyDownCapture={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={cancelGesture}
        onLostPointerCapture={cancelGesture}
      >
        {notes.length === 0 && !gesture && (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              ＋
            </span>

            <h2>A little space for your thoughts.</h2>

            <p>
              Click anywhere to add a note,
              <br />
              or drag to make it your size.
            </p>
          </div>
        )}

        {notes.map((note) => {
          const active =
            gesture && gesture.kind !== 'creating' && gesture.id === note.id
          const rect = active ? gesture.rect : note

          return (
            <div
              key={note.id}
              data-note={note.id}
              className={`note-position${active ? ' note-position--active' : ''}${active && overTrash ? ' note-position--deleting' : ''}`}
              style={{
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
              }}
            >
              <NoteCard
                text={note.text}
                color={note.color}
                onTextChange={(text) =>
                  onNotesChange(updateNote(notes, note.id, { text }))
                }
                onDelete={() => onNotesChange(deleteNote(notes, note.id))}
              />
            </div>
          )
        })}

        {gesture?.kind === 'creating' && gesture.dragging && (
          <div
            className={`note note--${gesture.color} note-preview${previewTooSmall ? ' note-preview--small' : ''}`}
            aria-hidden="true"
            style={{
              left: gesture.rect.x,
              top: gesture.rect.y,
              width: gesture.rect.width,
              height: gesture.rect.height,
            }}
          >
            {!previewTooSmall && (
              <>
                <div className="note-header">
                  <span className="move-handle">⠿</span>
                  <span className="delete-note">×</span>
                </div>
                <span className="resize-handle" />
              </>
            )}
          </div>
        )}

        <div
          ref={trashRef}
          className={`trash${overTrash ? ' trash--over' : ''}`}
          aria-hidden="true"
        >
          <span className="trash-icon">
            <svg
              width="20"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" />
            </svg>
          </span>
          Drag here to delete
        </div>
      </div>

      <footer className="statusbar">
        <span role="status">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </span>

        <span>
          {overTrash
            ? 'Release to delete · Esc to cancel'
            : gesture
              ? 'Esc to cancel'
              : 'Tab to browse notes · Enter to edit · Arrows to move · Shift + arrows to resize'}
        </span>
      </footer>
    </>
  )
}
