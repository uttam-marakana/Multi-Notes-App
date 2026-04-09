import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { useTheme } from "../../contexts/ThemeContext";
import BoardCard from "./BoardCard";

const BoardList = ({ boards, onDelete, onPin }) => {
  const { colors } = useTheme();

  const currentUserId = localStorage.getItem("userId");

  /* ===========================
     SPLIT BOARDS
  =========================== */
  const pinnedBoards = boards.filter((b) =>
    b.pinnedBy?.includes(currentUserId),
  );

  const unpinnedBoards = boards.filter(
    (b) => !b.pinnedBy?.includes(currentUserId),
  );

  return (
    <div className="board-list-container">
      {/* ⭐ PINNED BOARDS */}
      {pinnedBoards.length > 0 && (
        <div className="board-section">
          <h3 style={{ color: colors.text }}>⭐ Pinned Boards</h3>

          <div className="board-grid">
            {pinnedBoards.map((board) => {
              if (!board?.id) return null;

              return (
                <BoardCard
                  key={board.id}
                  board={board}
                  onDelete={onDelete}
                  onPin={onPin}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 📦 DRAGGABLE BOARDS */}
      <div className="board-section">
        <h3 style={{ color: colors.text }}>Your Boards</h3>

        <Droppable droppableId="boards" direction="horizontal">
          {(provided) => (
            <div
              className="board-grid"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {unpinnedBoards.map((board, index) => {
                if (!board?.id) return null;

                return (
                  <Draggable
                    key={board.id}
                    draggableId={String(board.id)} // ✅ CRITICAL FIX
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <BoardCard
                          board={board}
                          onDelete={onDelete}
                          onPin={onPin}
                          isDragging={snapshot.isDragging}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

export default BoardList;
