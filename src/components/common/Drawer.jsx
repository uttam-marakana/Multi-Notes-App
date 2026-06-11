import { useEffect } from "react";

export default function Drawer({ isOpen, title, onClose, children }) {
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
        className={`fixed inset-0 z-9999 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        } bg-black/50 backdrop-blur-sm`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-10000
          transform transition-transform duration-300 ease-out
          will-change-transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          w-full max-w-[90vw]
          sm:max-w-105
          md:max-w-105
          lg:max-w-100
          xl:max-w-105`}
        aria-hidden={!isOpen}
        style={{ touchAction: "pan-y" }}
      >
        <div
          className="
            h-full
            w-full
            glass-card
            rounded-r-2xl
            overflow-y-auto
            shadow-2xl
            border-r
          "
          style={{
            backgroundColor: "var(--glass-bg)",
            borderColor: "var(--glass-border)",
            padding: "var(--spacing-xl)"
          }}
        >
          <div
            className="
              p-6
              border-b
              border-(--glass-border)
              flex
              items-center
              justify-between
            "
          >
            <h3 className="text-2xl font-bold">{title}</h3>
            <button
              className="
                w-10
                h-10
                rounded-full
                hover:bg-black/10
                transition
              "
              onClick={onClose}
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">{children}</div>
        </div>
      </aside>
    </>
  );
}
