import { useEffect } from "react";

export default function useDevToolsProtection() {
  useEffect(() => {
    const contextMenu = (e) => e.preventDefault();

    const keyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === "U") ||
        (e.metaKey &&
          e.altKey &&
          ["I", "J", "C"].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
        window.location.href = "/";
      }
    };

    document.addEventListener("contextmenu", contextMenu);
    document.addEventListener("keydown", keyDown);

    const interval = setInterval(() => {
      const start = performance.now();
      debugger;
      const end = performance.now();

      if (end - start > 100) {
        window.location.href = "/";
      }
    }, 500);

    return () => {
      document.removeEventListener("contextmenu", contextMenu);
      document.removeEventListener("keydown", keyDown);
      clearInterval(interval);
    };
  }, []);
}