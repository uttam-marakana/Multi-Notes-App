// Guest temporary storage utility using localStorage
// Data is cleared when browser/tab closes

const GUEST_STORAGE_KEY = "guest_app_data";

export const guestStorage = {
  // Get all guest data
  getAllData: () => {
    try {
      const data = sessionStorage.getItem(GUEST_STORAGE_KEY);
      return data ? JSON.parse(data) : { boards: [], notes: {} };
    } catch {
      return { boards: [], notes: {} };
    }
  },

  // Save boards
  saveBoards: (boards) => {
    try {
      const data = guestStorage.getAllData();
      data.boards = boards;
      sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Guest storage error:", e);
    }
  },

  // Save notes for a board
  saveNotes: (boardId, notes) => {
    try {
      const data = guestStorage.getAllData();
      if (!data.notes) data.notes = {};
      data.notes[boardId] = notes;
      sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Guest storage error:", e);
    }
  },

  // Get boards
  getBoards: () => {
    const data = guestStorage.getAllData();
    return data.boards || [];
  },

  // Get notes for a board
  getNotes: (boardId) => {
    const data = guestStorage.getAllData();
    return (data.notes && data.notes[boardId]) || [];
  },

  // Clear all guest data
  clearAll: () => {
    try {
      sessionStorage.removeItem(GUEST_STORAGE_KEY);
    } catch (e) {
      console.error("Guest storage error:", e);
    }
  },
};
