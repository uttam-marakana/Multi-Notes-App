import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaCheckSquare,
  FaQuoteLeft,
  FaCode,
  FaLink,
  FaUndo,
  FaRedo,
  FaHeading,
  FaMinus,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
} from "react-icons/fa";
import { sanitizeRichText, richTextToPlainText } from "../../utils/helpers";

const COMMANDS = {
  bold: "bold",
  italic: "italic",
  underline: "underline",
  strikeThrough: "strikeThrough",
  insertUnorderedList: "insertUnorderedList",
  insertOrderedList: "insertOrderedList",
  formatBlock: "formatBlock",
  formatQuote: "formatBlock",
  undo: "undo",
  redo: "redo",
  createLink: "createLink",
  insertHorizontalRule: "insertHorizontalRule",
};

const ToolButton = ({ label, title, onClick, active, children }) => (
  <button
    type="button"
    className={`rich-editor-tool ${active ? "is-active" : ""}`}
    aria-label={label}
    title={title || label}
    onMouseDown={(event) => {
      event.preventDefault();
      onClick();
    }}
  >
    {children}
  </button>
);

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write your note...",
}) {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);
  const { colors } = useTheme();
  const [active, setActive] = useState({});

  useEffect(() => {
    if (!editorRef.current) return;

    const next = value || "";
    const sanitizedValue = sanitizeRichText(next);

    if (editorRef.current.innerHTML !== sanitizedValue) {
      editorRef.current.innerHTML = sanitizedValue;
    }
  }, [value]);

  const saveSelection = () => {
    const selection = window.getSelection?.();

    if (
      !selection?.rangeCount ||
      !editorRef.current?.contains(selection.anchorNode)
    ) {
      return;
    }

    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    if (!savedRangeRef.current) return;

    const selection = window.getSelection?.();

    selection?.removeAllRanges();
    selection?.addRange(savedRangeRef.current);
  };

  const emitChange = () => {
    if (!editorRef.current) return;

    const html = sanitizeRichText(editorRef.current.innerHTML);

    onChange?.(html);
    updateActiveState();
  };

  const updateActiveState = () => {
    setActive({
      bold: document.queryCommandState?.(COMMANDS.bold) || false,
      italic: document.queryCommandState?.(COMMANDS.italic) || false,
      underline: document.queryCommandState?.(COMMANDS.underline) || false,
      strikeThrough:
        document.queryCommandState?.(COMMANDS.strikeThrough) || false,
    });
  };

  const exec = (command, argument = null) => {
    editorRef.current?.focus();
    restoreSelection();

    document.execCommand(command, false, argument);

    saveSelection();
    emitChange();
  };

  const addLink = () => {
    editorRef.current?.focus();
    restoreSelection();

    const url = window.prompt("Enter URL");

    if (!url) return;

    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;

    document.execCommand(COMMANDS.createLink, false, normalized);

    emitChange();
  };

  const addChecklist = () => {
    editorRef.current?.focus();
    restoreSelection();

    document.execCommand(COMMANDS.insertUnorderedList, false, null);

    const selection = window.getSelection();
    const list = selection?.anchorNode?.parentElement?.closest("ul");

    if (list) {
      list.classList.add("rich-checklist");

      [...list.children].forEach((item) => {
        if (!item.querySelector("input")) {
          item.innerHTML = `<label class="rich-check-item"><input type="checkbox" /> <span>${item.innerHTML}</span></label>`;
        }
      });
    }

    emitChange();
  };

  const insertCode = () => {
    editorRef.current?.focus();
    restoreSelection();

    document.execCommand("formatBlock", false, "pre");

    emitChange();
  };

  const insertQuote = () => {
    editorRef.current?.focus();
    restoreSelection();

    document.execCommand("formatBlock", false, "blockquote");

    emitChange();
  };

  const setHeading = (level) => {
    exec(COMMANDS.formatBlock, `h${level}`);
  };

  const handleInput = () => emitChange();

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      addLink();
    }
  };

  return (
    <div
      className="rich-editor"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.background,
      }}
    >
      <div
        className="rich-editor-toolbar"
        role="toolbar"
        aria-label="Note formatting"
      >
        <ToolButton
          label="Bold"
          active={active.bold}
          onClick={() => exec(COMMANDS.bold)}
        >
          <FaBold />
        </ToolButton>

        <ToolButton
          label="Italic"
          active={active.italic}
          onClick={() => exec(COMMANDS.italic)}
        >
          <FaItalic />
        </ToolButton>

        <ToolButton
          label="Underline"
          active={active.underline}
          onClick={() => exec(COMMANDS.underline)}
        >
          <FaUnderline />
        </ToolButton>

        <ToolButton
          label="Strikethrough"
          active={active.strikeThrough}
          onClick={() => exec(COMMANDS.strikeThrough)}
        >
          <FaStrikethrough />
        </ToolButton>

        <span className="rich-editor-divider" />

        <ToolButton label="Heading 1" onClick={() => setHeading(1)}>
          <FaHeading />
          <small>1</small>
        </ToolButton>

        <ToolButton label="Heading 2" onClick={() => setHeading(2)}>
          <FaHeading />
          <small>2</small>
        </ToolButton>

        <ToolButton
          label="Bullet list"
          onClick={() => exec(COMMANDS.insertUnorderedList)}
        >
          <FaListUl />
        </ToolButton>

        <ToolButton
          label="Numbered list"
          onClick={() => exec(COMMANDS.insertOrderedList)}
        >
          <FaListOl />
        </ToolButton>

        <ToolButton label="Checklist" onClick={addChecklist}>
          <FaCheckSquare />
        </ToolButton>

        <span className="rich-editor-divider" />

        <ToolButton label="Align left" onClick={() => exec("justifyLeft")}>
          <FaAlignLeft />
        </ToolButton>

        <ToolButton label="Align center" onClick={() => exec("justifyCenter")}>
          <FaAlignCenter />
        </ToolButton>

        <ToolButton label="Align right" onClick={() => exec("justifyRight")}>
          <FaAlignRight />
        </ToolButton>

        <span className="rich-editor-divider" />

        <ToolButton label="Quote" onClick={insertQuote}>
          <FaQuoteLeft />
        </ToolButton>

        <ToolButton label="Code block" onClick={insertCode}>
          <FaCode />
        </ToolButton>

        <ToolButton label="Link" onClick={addLink}>
          <FaLink />
        </ToolButton>

        <ToolButton
          label="Divider"
          onClick={() => exec(COMMANDS.insertHorizontalRule)}
        >
          <FaMinus />
        </ToolButton>

        <span className="rich-editor-divider" />

        <ToolButton label="Undo" onClick={() => exec(COMMANDS.undo)}>
          <FaUndo />
        </ToolButton>

        <ToolButton label="Redo" onClick={() => exec(COMMANDS.redo)}>
          <FaRedo />
        </ToolButton>
      </div>

      <div
        ref={editorRef}
        className="rich-editor-content"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={updateActiveState}
        onMouseUp={() => {
          saveSelection();
          updateActiveState();
        }}
        onFocus={updateActiveState}
      />

      <div className="rich-editor-footer">
        <span>Rich text</span>
        <span>{richTextToPlainText(value).length} characters</span>
      </div>
    </div>
  );
}
