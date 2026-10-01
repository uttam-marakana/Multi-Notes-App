import { createContext, useContext, useState, useEffect } from "react";
import { db, storage } from "../config/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref as storageRef,
  deleteObject,
  getBytes,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import { useAuth } from "./AuthContext";
import { hashPIN, revokeProtectedAccess } from "../utils/helpers";

const BoardContext = createContext();

export function useBoard() {
  return useContext(BoardContext);
}

async function cloneNoteFiles(files, userId, boardId) {
  return Promise.all(
    (files || []).map(async (file) => {
      if (!file?.path) return file;

      const sourceRef = storageRef(storage, file.path);
      const bytes = await getBytes(sourceRef);
      const safeName = (file.name || "attachment").replace(/\s+/g, "_");
      const destinationPath = `${userId}/boards/${boardId}/notes/${Date.now()}_${crypto.randomUUID()}_${safeName}`;
      const destinationRef = storageRef(storage, destinationPath);

      const metadata = file.type ? { contentType: file.type } : undefined;
      await uploadBytes(destinationRef, bytes, metadata);
      const url = await getDownloadURL(destinationRef);

      return {
        ...file,
        url,
        path: destinationPath,
        uploadedAt: new Date().toISOString(),
      };
    }),
  );
}


async function deleteClonedFiles(files = []) {
  await Promise.all(
    files
      .filter((file) => file?.path)
      .map((file) =>
        deleteObject(storageRef(storage, file.path)).catch(() => null),
      ),
  );
}

export function BoardProvider({ children }) {
  const { currentUser } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ------ 🔄 REAL-TIME LISTENER
     =========================== */
  useEffect(() => {
    if (!currentUser) {
      setBoards([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, "boards"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let boardsData = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          return {
            id: docSnap.id, // ✅ ONLY source of truth
            ...data,
          };
        });

        /* 🔥 SAFE SORTING (handles null timestamps) */
        boardsData.sort((a, b) => {
          const aPinned = a.pinnedBy?.includes(currentUser.uid);
          const bPinned = b.pinnedBy?.includes(currentUser.uid);

          if (aPinned !== bPinned) return aPinned ? -1 : 1;

          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;

          return bTime - aTime;
        });

        setBoards(boardsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching boards:", error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [currentUser]);

  /* ------ ➕ ADD BOARD
     =========================== */
  const addBoard = async (boardData) => {
    if (!currentUser) throw new Error("User not authenticated");

    const newBoard = {
      name: boardData.name || "Untitled Board",
      userId: currentUser.uid,
      ownerId: currentUser.uid,
      color: boardData.color || "#3B82F6",
      description: boardData.description || "",
      pinnedBy: [],
      isProtected: boardData.isProtected || false,
      pin: boardData.pin ? await hashPIN(boardData.pin) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "boards"), newBoard);

    return docRef.id; // ✅ use this everywhere
  };

  /* ------ ❌ DELETE BOARD
     =========================== */
  const deleteBoard = async (id) => {
    if (!currentUser) throw new Error("User not authenticated");

    // Delete notes from the same collection your app queries in NoteContext
    // (/notes where boardId == id AND ownerId == currentUser.uid)
    const notesQuery = query(
      collection(db, "notes"),
      where("boardId", "==", id),
      where("ownerId", "==", currentUser.uid),
    );

    const notesSnapshot = await getDocs(notesQuery);

    await Promise.allSettled(
      notesSnapshot.docs.flatMap((noteDoc) => {
        const noteData = noteDoc.data();
        const fileDeletes = (noteData.files || [])
          .filter((file) => file?.path)
          .map((file) => deleteObject(storageRef(storage, file.path)));

        return [...fileDeletes, deleteDoc(noteDoc.ref)];
      }),
    );

    await deleteDoc(doc(db, "boards", id));
    revokeProtectedAccess("board", id);
  };

  /* ------ ✏️ UPDATE BOARD
     =========================== */
  const updateBoard = async (id, updates = {}) => {
    if (!currentUser) throw new Error("User not authenticated");
    if (!id || typeof updates !== "object" || updates === null) {
      throw new Error("Invalid board update");
    }

    const allowedFields = [
      "name",
      "color",
      "description",
      "pinnedBy",
      "isProtected",
      "pin",
    ];

    const updateData = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedFields.includes(key)),
    );

    if (Object.prototype.hasOwnProperty.call(updates, "pin")) {
      updateData.pin =
        typeof updates.pin === "string" && updates.pin
          ? await hashPIN(updates.pin)
          : updates.pin || null;
    }

    if (updates.isProtected === false) {
      updateData.pin = null;
    }

    updateData.updatedAt = serverTimestamp();

    await updateDoc(doc(db, "boards", id), updateData);
  };

  const updateBoardName = async (id, newName) => {
    await updateBoard(id, { name: newName });
  };

  /* ------ 📌 PIN TOGGLE
     =========================== */
  const toggleBoardPin = async (boardId) => {
    if (!currentUser) return;

    const board = boards.find((b) => b.id === boardId);
    if (!board) return;

    const pinnedBy = board.pinnedBy || [];
    const isPinned = pinnedBy.includes(currentUser.uid);

    const updatedPinnedBy = isPinned
      ? pinnedBy.filter((uid) => uid !== currentUser.uid)
      : [...pinnedBy, currentUser.uid];

    await updateBoard(boardId, { pinnedBy: updatedPinnedBy });
  };

  /* ------ 📊 HELPERS
     =========================== */
  const getBoardCount = () => boards.length;

  const getPinnedBoards = () =>
    boards.filter((b) => b.pinnedBy?.includes(currentUser.uid));

  /* ------ 📑 DUPLICATE BOARD
     =========================== */
  const duplicateBoard = async (boardId) => {
    if (!currentUser) throw new Error("User not authenticated");

    if (!boardId) throw new Error("Invalid boardId");

    // ✅ Load source board
    const sourceBoardSnap = await getDocs(query(collection(db, "boards"), where("userId", "==", currentUser.uid), where("__name__", "==", boardId)));
    if (sourceBoardSnap.empty) {
      throw new Error("Board not found or access denied");
    }

    const source = sourceBoardSnap.docs[0].data();

    // ✅ Create duplicated board
    const newBoard = {
      name: `${source.name || "Untitled Board"} (Copy)`,
      userId: currentUser.uid,
      ownerId: currentUser.uid,
      color: source.color || "#3B82F6",
      description: source.description || "",
      pinnedBy: [],
      isProtected: Boolean(source.isProtected),
      pin: source.isProtected ? source.pin || null : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const newBoardRef = await addDoc(collection(db, "boards"), newBoard);
    const newBoardId = newBoardRef.id;

    const notesSnap = await getDocs(
      query(
        collection(db, "notes"),
        where("boardId", "==", boardId),
        where("ownerId", "==", currentUser.uid),
      ),
    );

    const createdNoteRefs = [];
    const createdFiles = [];

    try {
      await Promise.all(
        notesSnap.docs.map(async (noteDoc) => {
          const d = noteDoc.data();
          const clonedFiles = await cloneNoteFiles(
            d.files || [],
            currentUser.uid,
            newBoardId,
          );
          createdFiles.push(...clonedFiles);

          const noteRef = await addDoc(collection(db, "notes"), {
            boardId: newBoardId,
            ownerId: currentUser.uid,
            title: d.title || "Untitled Note",
            content: d.content || "",
            priority: d.priority || "low",
            pinnedBy: [],
            isProtected: Boolean(d.isProtected),
            pin: d.isProtected ? d.pin || null : null,
            contentType: d.contentType || ["text"],
            files: clonedFiles,
            order: typeof d.order === "number" ? d.order : Date.now(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          createdNoteRefs.push(noteRef);
        }),
      );
    } catch (error) {
      await Promise.allSettled(createdNoteRefs.map((noteRef) => deleteDoc(noteRef)));
      await deleteClonedFiles(createdFiles);
      await deleteDoc(newBoardRef).catch(() => null);
      throw error;
    }


    return newBoardId;
  };

  /* ------ 📦 ONE-TIME FETCH
     =========================== */
  const getBoards = async () => {
    if (!currentUser) return [];

    const q = query(
      collection(db, "boards"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);

    let boardsData = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    /* 🔥 SAME SORTING LOGIC */
    boardsData.sort((a, b) => {
      const aPinned = a.pinnedBy?.includes(currentUser.uid);
      const bPinned = b.pinnedBy?.includes(currentUser.uid);

      if (aPinned !== bPinned) return aPinned ? -1 : 1;

      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;

      return bTime - aTime;
    });

    return boardsData;
  };

  return (
    <BoardContext.Provider
      value={{
        boards,
        loading,
        addBoard,
        deleteBoard,
        updateBoard,
        updateBoardName,
        toggleBoardPin,
        duplicateBoard,
        getBoardCount,
        getPinnedBoards,
        getBoards,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
