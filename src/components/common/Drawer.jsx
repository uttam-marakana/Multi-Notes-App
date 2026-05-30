import { useEffect } from "react";

export default function Drawer({
  isOpen,
  title,
  onClose,
  children,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[9999] transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        } bg-black/30`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={`fixed left-0 top-0 z-[10000] h-full transform bg-white/0 backdrop-blur-xl transition-transform duration-300 ease-out will-change-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-[40vw] max-w-full md:w-[40vw] sm:w-[70vw] xs:w-[85vw]`}
        aria-hidden={!isOpen}
        style={{ touchAction: "pan-y" }}
      >
        <div
          className="h-full w-full glass-card border-r-0 rounded-none overflow-y-auto"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            borderColor: "var(--glass-border)",
          }}
        >

          <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between gap-2">
            <h3 className="font-semibold text-[1.05rem]">{title}</h3>
            <button
              className="btn btn-ghost btn-xs"
              onClick={onClose}
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="p-4">{children}</div>
        </div>
      </aside>
    </>
  );
}

