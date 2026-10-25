import { useRef, type FC } from 'react'
import type { NoteColor } from '../Board/types'

type NoteCardProps = {
  text: string
  color: NoteColor
  onTextChange: (text: string) => void
  onDelete: () => void
}

export const NoteCard: FC<NoteCardProps> = ({
  text,
  color,
  onTextChange,
  onDelete,
}) => {
  const textRef = useRef<HTMLTextAreaElement>(null)
  const noteRef = useRef<HTMLElement>(null)

  return (
    <article
      ref={noteRef}
      tabIndex={0}
      className={`note note--${color}`}
      aria-label={`${color} note: ${text.trim() || 'Empty'}`}
      aria-describedby="note-keyboard-help"
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter') {
          event.preventDefault()
          textRef.current?.focus()
        } else if (event.key === 'Delete' || event.key === 'Backspace') {
          event.preventDefault()
          onDelete()
        }
      }}
    >
      <div className="note-header">
        <button
          className="move-handle"
          data-note-handle="move"
          tabIndex={-1}
          aria-label="Move note"
          title="Drag to move"
        >
          <span aria-hidden="true">⠿</span>
        </button>

        <button
          className="delete-note"
          tabIndex={-1}
          aria-label="Delete note"
          title="Delete note"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onDelete}
        >
          ×
        </button>
      </div>

      <div className="note-text">
        <textarea
          ref={textRef}
          autoFocus
          tabIndex={-1}
          aria-label="Note text"
          placeholder="Write something…"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              noteRef.current?.focus({ preventScroll: true })
            }
          }}
          spellCheck
        />
      </div>

      <button
        className="resize-handle"
        data-note-handle="resize"
        tabIndex={-1}
        aria-label="Resize note"
        title="Drag to resize"
      />
    </article>
  )
}
