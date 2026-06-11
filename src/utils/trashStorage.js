const TRASH_STORAGE_KEY = "noteflow-trash-v1";

function readTrash() {
  try {
    const raw = sessionStorage.getItem(TRASH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { boards: [], notes: {} };
  } catch {
    return { boards: [], notes: {} };
  }
}

function writeTrash(trash) {
  sessionStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trash));
}

export function getTrashedBoardIds() {
  const trash = readTrash();
  return Array.isArray(trash.boards) ? trash.boards : [];
}

export function isBoardTrashed(boardId) {
  if (!boardId) return false;
  return getTrashedBoardIds().includes(boardId);
}

export function trashBoard(boardId) {
  if (!boardId) return;
  const trash = readTrash();
  if (!Array.isArray(trash.boards)) trash.boards = [];
  if (!trash.boards.includes(boardId)) trash.boards.push(boardId);
  writeTrash(trash);
}

export function restoreBoard(boardId) {
  if (!boardId) return;
  const trash = readTrash();
  trash.boards = (trash.boards || []).filter((id) => id !== boardId);
  writeTrash(trash);
}

export function purgeBoardTrash(boardId) {
  // UI-only: purging just removes trash marker.
  restoreBoard(boardId);
}

export function getTrashedNotes(boardId) {
  const trash = readTrash();
  if (!boardId) return [];
  const list = trash.notes?.[boardId] || [];
  return Array.isArray(list) ? list : [];
}

export function isNoteTrashed(boardId, noteId) {
  if (!boardId || !noteId) return false;
  return getTrashedNotes(boardId).includes(noteId);
}

export function trashNote(boardId, noteId) {
  if (!boardId || !noteId) return;
  const trash = readTrash();
  if (!trash.notes) trash.notes = {};
  if (!Array.isArray(trash.notes[boardId])) trash.notes[boardId] = [];
  if (!trash.notes[boardId].includes(noteId)) trash.notes[boardId].push(noteId);
  writeTrash(trash);
}

export function restoreNote(boardId, noteId) {
  if (!boardId || !noteId) return;
  const trash = readTrash();
  trash.notes = trash.notes || {};
  trash.notes[boardId] = (trash.notes[boardId] || []).filter((id) => id !== noteId);
  if (trash.notes[boardId].length === 0) delete trash.notes[boardId];
  writeTrash(trash);
}

export function purgeNoteTrash(boardId, noteId) {
  // UI-only: purging just removes trash marker.
  restoreNote(boardId, noteId);
}

