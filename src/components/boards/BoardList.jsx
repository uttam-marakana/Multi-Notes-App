import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useTheme } from "../../contexts/ThemeContext";
import BoardCard from "./BoardCard";

const BoardList = ({ boards, onDelete, onPin, onReorder }) => {
  const { colors } = useTheme();
  const [expandedBoard, setExpandedBoard] = useState(null);

  // Separate pinned and unpinned boards
  const currentUserId = localStorage.getItem("userId");
  const pinnedBoards = boards.filter((b) =>
    b.pinnedBy?.includes(currentUserId),
  );
  const unpinnedBoards = boards.filter(
    (b) => !b.pinnedBy?.includes(currentUserId),
  );

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // No change in position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Reorder boards
    const reorderedBoards = Array.from(boards);
    const [movedBoard] = reorderedBoards.splice(source.index, 1);
    reorderedBoards.splice(destination.index, 0, movedBoard);

    if (onReorder) {
      onReorder(reorderedBoards.map((b) => b.id));
    }
  };

  if (boards.length === 0) {
    return (
      <div
        className="empty-state"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <h3 style={{ color: colors.text }}>📋 No Boards Yet</h3>
        <p style={{ color: colors.textMuted }}>
          Create your first board to get started organizing your notes!
        </p>
      </div>
    );
  }

  return (
    <div className="board-list-container">
      {/* Pinned Boards Section */}
      {pinnedBoards.length > 0 && (
        <div className="board-section">
          <h3 style={{ color: colors.text }}>⭐ Pinned Boards</h3>
          <div className="board-grid">
            {pinnedBoards.map((board, index) => (
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

      {/* All Boards Section */}
      <div className="board-section">
        <h3 style={{ color: colors.text }}>
          {pinnedBoards.length > 0 ? "All Boards" : "Your Boards"}
        </h3>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="boards" direction="horizontal">
            {(provided, snapshot) => (
              <div
                className={`board-grid ${
                  snapshot.isDraggingOver ? "dragging-over" : ""
                }`}
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  backgroundColor: snapshot.isDraggingOver
                    ? colors.background
                    : "transparent",
                }}
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
                        className={snapshot.isDragging ? "dragging" : ""}
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
