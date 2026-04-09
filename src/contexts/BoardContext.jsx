import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../config/firebase";
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
import { useAuth } from "./AuthContext";
import { hashPIN } from "../utils/helpers";

const BoardContext = createContext();

export function useBoard() {
  return useContext(BoardContext);
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
      color: boardData.color || "#3B82F6",
      description: boardData.description || "",
      pinnedBy: [],
      isProtected: boardData.isProtected || false,
      pin: boardData.pin ? hashPIN(boardData.pin) : null,
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
    await deleteDoc(doc(db, "boards", id));
  };

  /* ------ ✏️ UPDATE BOARD
     =========================== */
  const updateBoard = async (id, updates) => {
    if (!currentUser) throw new Error("User not authenticated");

    const boardRef = doc(db, "boards", id);

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (updates.pin && typeof updates.pin === "string") {
      updateData.pin = hashPIN(updates.pin);
    }

    await updateDoc(boardRef, updateData);
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
        getBoardCount,
        getPinnedBoards,
        getBoards,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}
