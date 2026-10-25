# Sticky notes

A desktop single-page app for sticky notes. Built with React, TypeScript, Vite, and plain CSS.

## Requirements

- Node.js 22.12 or later.
- npm.
- A desktop viewport of at least 1024 × 768 pixels.
- A current version of Chrome, Firefox, or Edge.

## Run

Install the dependencies:

```sh
npm ci
```

Start the development server:

```sh
npm run dev
```

Open the URL that Vite prints in the terminal.

Create the production build:

```sh
npm run build
```

The build command checks TypeScript types and writes the static files to `dist/`.

Serve the production build locally:

```sh
npm run preview
```

## Features

The app implements all four core interactions:

- Create a note at a selected position and size.
- Resize a note by dragging its bottom-right handle.
- Move a note by dragging its header.
- Delete a note by dragging the pointer into the trash zone.

The app also supports text editing, note colors, overlapping notes, browser storage, keyboard controls, and light and dark themes.

## Controls

- Select a color before creating a note.
- Click empty canvas space to create a default note. Select **New note** to create one near the top-left corner.
- Drag empty canvas space to draw a note in any direction. Release the pointer to create the note.
- A drawing smaller than 160 × 140 pixels shows a warning border. Releasing the pointer discards that drawing.
- Click a note to bring it forward. The notes array also defines which notes appear in front.
- Click a header to focus the note text. Moving or resizing a note also focuses its text after release.
- Move a note freely during a drag. On release, the app adjusts its position to keep the full header inside the canvas.
- Release a moving note with the pointer inside the trash zone to delete it. The × button also deletes a note.
- Press Escape to cancel an active drawing, move, or resize. Window blur and pointer cancellation also cancel the operation.

Keyboard controls:

| Key                  | Action                                                           |
| -------------------- | ---------------------------------------------------------------- |
| Tab / Shift + Tab    | Navigate toolbar controls and notes in their current array order |
| Enter                | Edit the focused note                                            |
| Escape while editing | Focus the note card                                              |
| Arrow keys           | Move the focused note by 5 pixels                                |
| Shift + arrow keys   | Resize the focused note by 5 pixels                              |
| Delete / Backspace   | Delete the focused note                                          |

The initial theme follows the system preference. The theme button saves an explicit choice for later visits.

## Architecture

`Board` owns the notes array, selected color, and storage calls. One handler updates state and saves the same array. The array defines note content and stacking order. Note operations in `components/Board/notes.ts` preserve their input arrays. Supporting types and utilities stay beside their owning components.

`NotesCanvas` receives `notes`, `color`, and `onNotesChange`. It handles canvas events and keeps only temporary gesture state. Pointer release commits the final coordinates, while cancellation discards the preview. Pointer and keyboard controls share the geometry functions. Header constraints use the rendered header height. One effect subscribes to canvas resizing and window blur, with cleanup when the component unmounts.

`NoteCard` renders text and handles editing, local focus, and deletion requests. Its prop types remain in the component file. Other component types reside in adjacent `types.ts` files. The shared `hooks/useTheme.ts` handles system preferences and the saved theme. Storage functions check saved notes before restoring them. The app uses React state and standard browser APIs without component, routing, or state libraries.

## Checks

```sh
npm run build
npm run format:check
```

Use `npm run format` to format the project. Prettier uses single quotes and no semicolons.

Manual checks in the in-app browser covered creation, reverse drawing, movement, resizing, trash deletion, text editing, keyboard navigation, focus, and saved notes. Chrome on macOS checks covered Tab navigation. Firefox, Edge, and Windows checks remain incomplete. The project does not include an automated test suite or CI configuration.

## Limits

Notes remain in the current browser. The app does not synchronize tabs or devices and does not use a REST API. Storage write failures appear in the browser console. Invalid saved data produces an empty board. A later saved change can replace that invalid data. Browser storage is not a backup.
