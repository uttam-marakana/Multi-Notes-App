import { createContext, useContext, useState, useCallback } from "react";
import { db, storage } from "../config/firebase";

import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  getDoc,
  writeBatch,
} from "firebase/firestore";

import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getBytes,
  uploadBytes,
} from "firebase/storage";

import { useAuth } from "./AuthContext";
import { hashPIN, revokeProtectedAccess } from "../utils/helpers";

const NoteContext = createContext();

export function useNote() {
  return useContext(NoteContext);
}

export function NoteProvider({ children }) {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadFiles = useCallback(
    async (boardId, files) => {
      if (!currentUser || !files?.length) return [];

      const fileArray = Array.from(files).slice(0, 10);
      const uploadedFiles = await Promise.all(
        fileArray.map(async (file) => {
          const safeName = file.name.replace(/\s+/g, "_");
          const filePath = `${currentUser.uid}/boards/${boardId}/notes/${Date.now()}_${crypto.randomUUID()}_${safeName}`;
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
    },
    [currentUser],
  );

  const deleteStoredFiles = useCallback(async (files = []) => {
    if (!files.length) return;

    const deletePromises = files.map(async (file) => {
      if (!file?.path) return;
      const fileRef = storageRef(storage, file.path);
      return deleteObject(fileRef).catch(() => null);
    });

    return Promise.all(deletePromises);
  }, []);

  const fetchNotes = useCallback(
    (boardId) => {
      if (!currentUser || !boardId) {
        setNotes([]);
        return;
      }

      setLoading(true);
      const notesRef = collection(db, "notes");
      const q = query(
        notesRef,
        where("boardId", "==", boardId),
        where("ownerId", "==", currentUser.uid),
        orderBy("order", "asc"),
      );

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
          setLoading(false);

          if (error.code === "failed-precondition") {
            console.warn("Missing Firestore index. Create it in console.");
          } else {
            console.error("Error fetching notes");
          }
        },
      );

      return unsubscribe;
    },
    [currentUser],
  );

  const addNote = async (boardId, noteData) => {
    if (!boardId || !currentUser) throw new Error("Invalid board or user");

    const uploadedFiles = noteData.files
      ? await uploadFiles(boardId, noteData.files)
      : [];

    const newNote = {
      boardId,
      ownerId: currentUser.uid,
      title: noteData.title || "Untitled Note",
      content: noteData.content || "",
      priority: noteData.priority || "low",
      pinnedBy: [],
      isProtected: noteData.isProtected || false,
      pin: noteData.pinHash
        ? noteData.pinHash
        : noteData.pin
          ? await hashPIN(noteData.pin)
          : null,
      contentType: noteData.contentType || ["html"],
      files: uploadedFiles,

      // ✅ FIXED ORDER (only change)
      order: Date.now(),

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const notesRef = collection(db, "notes");
    const docRef = await addDoc(notesRef, newNote);
    return docRef.id;
  };

  const deleteNote = async (boardId, noteId) => {
    if (!boardId || !noteId || !currentUser)
      throw new Error("Invalid parameters");

    const noteRef = doc(db, "notes", noteId);

    const noteSnapshot = await getDoc(noteRef);
    const noteData = noteSnapshot.data();
    if (
      !noteSnapshot.exists() ||
      noteData.ownerId !== currentUser.uid ||
      noteData.boardId !== boardId
    ) {
      throw new Error("Note not found or access denied");
    }

    await deleteStoredFiles(noteData.files || []);
    await deleteDoc(noteRef);
    revokeProtectedAccess("note", noteId);
  };

  const updateNote = async (boardId, noteId, updates = {}) => {
    if (!boardId || !noteId || !currentUser)
      throw new Error("Invalid parameters");
    if (typeof updates !== "object" || updates === null) {
      throw new Error("Invalid note update");
    }

    const noteRef = doc(db, "notes", noteId);
    const noteSnapshot = await getDoc(noteRef);

    if (!noteSnapshot.exists()) {
      throw new Error("Note not found");
    }

    const note = noteSnapshot.data();
    if (note.ownerId !== currentUser.uid || note.boardId !== boardId) {
      throw new Error("Note not found or access denied");
    }

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

    const allowedFields = [
      "title",
      "content",
      "priority",
      "pinnedBy",
      "isProtected",
      "pin",
      "contentType",
      "files",
      "order",
    ];

    const updateData = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedFields.includes(key)),
    );

    updateData.files = mergedFiles;

    if (Object.prototype.hasOwnProperty.call(updates, "pin")) {
      updateData.pin =
        typeof updates.pin === "string" && updates.pin
          ? await hashPIN(updates.pin)
          : updates.pin || null;
    }

    if (updates.isProtected === false) {
      updateData.pin = null;
    }

    updateData.updatedAt = new Date().toISOString();

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
    if (!boardId || !currentUser || !Array.isArray(newOrder)) return;

    const uniqueNoteIds = [...new Set(newOrder)].filter(Boolean);
    if (!uniqueNoteIds.length) return;

    const noteRefs = uniqueNoteIds.map((noteId) => doc(db, "notes", noteId));
    const snapshots = await Promise.all(noteRefs.map((ref) => getDoc(ref)));

    const unauthorized = snapshots.some(
      (snapshot) =>
        !snapshot.exists() ||
        snapshot.data().ownerId !== currentUser.uid ||
        snapshot.data().boardId !== boardId,
    );

    if (unauthorized) {
      throw new Error("One or more notes are not accessible in this board");
    }

    const baseOrder = Date.now();
    const chunkSize = 450;

    for (let start = 0; start < uniqueNoteIds.length; start += chunkSize) {
      const batch = writeBatch(db);
      const chunk = uniqueNoteIds.slice(start, start + chunkSize);

      chunk.forEach((noteId, offset) => {
        batch.update(doc(db, "notes", noteId), {
          order: baseOrder + start + offset,
          updatedAt: new Date().toISOString(),
        });
      });

      await batch.commit();
    }
  };
  const getPinnedNotes = () =>
    notes.filter((n) => n.pinnedBy?.includes(currentUser.uid));

  const getNotesByPriority = (priority) =>
    notes.filter((n) => n.priority === priority);

  const cloneNote = async (boardId, noteId) => {
    if (!boardId || !noteId || !currentUser) throw new Error("Invalid parameters");

    const noteRef = doc(db, "notes", noteId);
    const noteSnapshot = await getDoc(noteRef);

    if (!noteSnapshot.exists()) throw new Error("Note not found");

    const noteData = noteSnapshot.data();

    if (noteData.ownerId !== currentUser.uid || noteData.boardId !== boardId) {
      throw new Error("Note not found or access denied");
    }

    const clonedFiles = [];

    try {
      for (const file of noteData.files || []) {
        if (!file?.path) {
          clonedFiles.push(file);
          continue;
        }

        const sourceRef = storageRef(storage, file.path);
        const bytes = await getBytes(sourceRef);
        const safeName = (file.name || "attachment").replace(/\s+/g, "_");
        const destinationPath = `${currentUser.uid}/boards/${boardId}/notes/${Date.now()}_${crypto.randomUUID()}_${safeName}`;
        const destinationRef = storageRef(storage, destinationPath);
        const metadata = file.type ? { contentType: file.type } : undefined;

        await uploadBytes(destinationRef, bytes, metadata);
        const url = await getDownloadURL(destinationRef);

        clonedFiles.push({
          ...file,
          url,
          path: destinationPath,
          uploadedAt: new Date().toISOString(),
        });
      }

      const newNote = {
        boardId,
        ownerId: currentUser.uid,
        title: `${noteData.title || "Untitled Note"} (Copy)`,
        content: noteData.content || "",
        priority: noteData.priority || "low",
        pinnedBy: [],
        isProtected: noteData.isProtected || false,
        pin: noteData.pin ? noteData.pin : null,
        contentType: noteData.contentType || ["html"],
        files: clonedFiles,
        order: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "notes"), newNote);
      return docRef.id;
    } catch (error) {
      await deleteStoredFiles(clonedFiles);
      throw error;
    }
  };
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
        cloneNote,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}
