import { createContext, useContext, useState } from "react";
import { db, storage } from "../config/firebase";

import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useAuth } from "./AuthContext";
import { hashPIN } from "../utils/helpers";

const NoteContext = createContext();

export function useNote() {
  return useContext(NoteContext);
}

export function NoteProvider({ children }) {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadFiles = async (boardId, files) => {
    if (!currentUser || !files?.length) return [];

    const fileArray = Array.from(files).slice(0, 10);
    const uploadedFiles = await Promise.all(
      fileArray.map(async (file) => {
        const safeName = file.name.replace(/\s+/g, "_");
        const filePath = `${currentUser.uid}/boards/${boardId}/notes/${Date.now()}_${safeName}`;
        const fileRef = storageRef(storage, filePath);

        const snapshot = await uploadBytesResumable(fileRef, file);
        const url = await getDownloadURL(snapshot.ref);

        return {
          name: file.name,
          type: file.type,
          size: file.size,
          url,
          path: snapshot.ref.fullPath,
          uploadedAt: new Date().toISOString(),
        };
      }),
    );

    return uploadedFiles;
  };

  const deleteStoredFiles = async (files = []) => {
    if (!files.length) return;

    const deletePromises = files.map(async (file) => {
      if (!file?.path) return;
      const fileRef = storageRef(storage, file.path);
      return deleteObject(fileRef).catch(() => null);
    });

    return Promise.all(deletePromises);
  };

  const fetchNotes = (boardId) => {
    if (!currentUser || !boardId) {
      setNotes([]);
      return;
    }

    setLoading(true);
    const notesRef = collection(
      db,
      "users",
      currentUser.uid,
      "boards",
      boardId,
      "notes",
    );
    const q = query(notesRef, orderBy("order", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotes(notesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notes:", error);
        setLoading(false);
      },
    );

    return unsubscribe;
  };

  const addNote = async (boardId, noteData) => {
    if (!boardId || !currentUser) throw new Error("Invalid board or user");

    const uploadedFiles = noteData.files
      ? await uploadFiles(boardId, noteData.files)
      : [];

    const newNote = {
      title: noteData.title || "Untitled Note",
      content: noteData.content || "",
      priority: noteData.priority || "low", // low, medium, high
      pinnedBy: [],
      isProtected: noteData.isProtected || false,
      pin: noteData.pin ? hashPIN(noteData.pin) : null,
      contentType: noteData.contentType || ["text"],
      files: uploadedFiles,
      ownerId: currentUser.uid,
      order: notes.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const notesRef = collection(
      db,
      "users",
      currentUser.uid,
      "boards",
      boardId,
      "notes",
    );
    const docRef = await addDoc(notesRef, newNote);
    return docRef.id;
  };

  const deleteNote = async (boardId, noteId) => {
    if (!boardId || !noteId || !currentUser)
      throw new Error("Invalid parameters");

    const noteRef = doc(
      db,
      "users",
      currentUser.uid,
      "boards",
      boardId,
      "notes",
      noteId,
    );
    await deleteDoc(noteRef);
  };

  const updateNote = async (boardId, noteId, updates) => {
    if (!boardId || !noteId || !currentUser)
      throw new Error("Invalid parameters");

    const note = notes.find((n) => n.id === noteId);
    if (!note) throw new Error("Note not found");

    const noteRef = doc(
      db,
      "users",
      currentUser.uid,
      "boards",
      boardId,
      "notes",
      noteId,
    );

    let mergedFiles = note.files || [];

    if (updates.removeFiles?.length) {
      const removedFiles = mergedFiles.filter((file) =>
        updates.removeFiles.includes(file.path || file.url),
      );
      await deleteStoredFiles(removedFiles);
      mergedFiles = mergedFiles.filter(
        (file) => !updates.removeFiles.includes(file.path || file.url),
      );
    }

    if (updates.newFiles?.length) {
      const uploadedFiles = await uploadFiles(boardId, updates.newFiles);
      mergedFiles = [...mergedFiles, ...uploadedFiles];
    }

    if (Array.isArray(updates.files)) {
      mergedFiles = updates.files;
    }

    const updateData = {
      ...updates,
      files: mergedFiles,
      updatedAt: new Date().toISOString(),
    };

    delete updateData.newFiles;
    delete updateData.removeFiles;

    if (updates.pin && typeof updates.pin === "string") {
      updateData.pin = hashPIN(updates.pin);
    }

    await updateDoc(noteRef, updateData);
  };

  const toggleNotePin = async (boardId, noteId) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const pinnedBy = note.pinnedBy || [];
    const isCurrentlyPinned = pinnedBy.includes(currentUser.uid);

    const updatedPinnedBy = isCurrentlyPinned
      ? pinnedBy.filter((uid) => uid !== currentUser.uid)
      : [...pinnedBy, currentUser.uid];

    await updateNote(boardId, noteId, { pinnedBy: updatedPinnedBy });
  };

  const updateNoteOrder = async (boardId, newOrder) => {
    if (!boardId || !currentUser) return;

    const updatePromises = newOrder.map((noteId, index) => {
      const noteRef = doc(
        db,
        "users",
        currentUser.uid,
        "boards",
        boardId,
        "notes",
        noteId,
      );
      return updateDoc(noteRef, { order: index });
    });

    await Promise.all(updatePromises);
  };

  const getPinnedNotes = () =>
    notes.filter((n) => n.pinnedBy?.includes(currentUser.uid));

  const getNotesByPriority = (priority) =>
    notes.filter((n) => n.priority === priority);

  const getNoteCount = () => notes.length;

  return (
    <NoteContext.Provider
      value={{
        notes,
        loading,
        fetchNotes,
        addNote,
        deleteNote,
        updateNote,
        toggleNotePin,
        updateNoteOrder,
        getPinnedNotes,
        getNotesByPriority,
        getNoteCount,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}
