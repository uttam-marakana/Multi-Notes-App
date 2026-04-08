import React, { createContext, useContext, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
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

    const newNote = {
      title: noteData.title || "Untitled Note",
      content: noteData.content || "",
      priority: noteData.priority || "low", // low, medium, high
      pinnedBy: [],
      isProtected: noteData.isProtected || false,
      pin: noteData.pin ? hashPIN(noteData.pin) : null,
      contentType: noteData.contentType || ["text"],
      files: noteData.files || [],
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

    const noteRef = doc(
      db,
      "users",
      currentUser.uid,
      "boards",
      boardId,
      "notes",
      noteId,
    );

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Hash PIN if it's being updated
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
