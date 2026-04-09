import React, { createContext, useContext, useState, useEffect } from "react";
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
      orderBy("order", "asc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const boardsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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
      order: boards.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "boards"), newBoard);
    return docRef.id;
  };

  const deleteBoard = async (id) => {
    if (!currentUser) throw new Error("User not authenticated");
    await deleteDoc(doc(db, "boards", id));
  };

  const updateBoard = async (id, updates) => {
    if (!currentUser) throw new Error("User not authenticated");

    const boardRef = doc(db, "boards", id);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Hash PIN if it's being updated
    if (updates.pin && typeof updates.pin === "string") {
      updateData.pin = hashPIN(updates.pin);
    }

    await updateDoc(boardRef, updateData);
  };

  const updateBoardName = async (id, newName) => {
    await updateBoard(id, { name: newName });
  };

  const updateBoardOrder = async (newOrder) => {
    // Update order for drag and drop
    const updatePromises = newOrder.map((boardId, index) =>
      updateDoc(doc(db, "boards", boardId), { order: index }),
    );
    await Promise.all(updatePromises);
  };

  const toggleBoardPin = async (boardId) => {
    const board = boards.find((b) => b.id === boardId);
    if (!board) return;

    const pinnedBy = board.pinnedBy || [];
    const isCurrentlyPinned = pinnedBy.includes(currentUser.uid);

    const updatedPinnedBy = isCurrentlyPinned
      ? pinnedBy.filter((uid) => uid !== currentUser.uid)
      : [...pinnedBy, currentUser.uid];

    await updateBoard(boardId, { pinnedBy: updatedPinnedBy });
  };

  const getBoardCount = () => boards.length;

  const getPinnedBoards = () =>
    boards.filter((b) => b.pinnedBy?.includes(currentUser.uid));

  const getBoards = async () => {
    if (!currentUser) return [];

    const q = query(
      collection(db, "boards"),
      where("userId", "==", currentUser.uid),
      orderBy("order", "asc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
        updateBoardOrder,
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
