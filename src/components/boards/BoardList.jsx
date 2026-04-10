import { useTheme } from "../../contexts/ThemeContext";
import BoardCard from "./BoardCard";

const BoardList = ({ boards, onDelete, onPin }) => {
  const { colors } = useTheme();

  const currentUserId = localStorage.getItem("userId");

  /* ------ SPLIT BOARDS ----------------------------- */
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

      {/* 📦 BOARDS */}
      <div className="board-section">
        <h3 style={{ color: colors.text }}>Your Boards</h3>

        <div className="board-grid">
          {unpinnedBoards.map((board) => {
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
    </div>
  );
};

export default BoardList;
