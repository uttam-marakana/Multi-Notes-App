import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useTheme } from "../../contexts/ThemeContext";
import BoardCard from "./BoardCard";

const BoardList = ({ boards, onDelete, onPin, onReorder }) => {
  const { colors } = useTheme();

  const currentUserId = localStorage.getItem("userId");

  const pinnedBoards = boards.filter((b) =>
    b.pinnedBy?.includes(currentUserId),
  );

  const unpinnedBoards = boards.filter(
    (b) => !b.pinnedBy?.includes(currentUserId),
  );

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.index === destination.index) return;

    // ✅ ONLY reorder UNPINNED boards
    const reordered = Array.from(unpinnedBoards);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    if (onReorder) {
      onReorder(reordered.map((b) => b.id));
    }
  };

  return (
    <div className="board-list-container">
      {/* ⭐ PINNED */}
      {pinnedBoards.length > 0 && (
        <div className="board-section">
          <h3 style={{ color: colors.text }}>⭐ Pinned Boards</h3>
          <div className="board-grid">
            {pinnedBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onDelete={onDelete}
                onPin={onPin}
              />
            ))}
          </div>
        </div>
      )}

      {/* 📦 ALL BOARDS */}
      <div className="board-section">
        <h3 style={{ color: colors.text }}>Your Boards</h3>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="boards" direction="horizontal">
            {(provided) => (
              <div
                className="board-grid"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {unpinnedBoards.map((board, index) => (
                  <Draggable
                    key={board.id}
                    draggableId={board.id}
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
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default BoardList;
