"use client";

import { useEffect, useState } from "react";

export function useMobileNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setExpanded(null);
  }

  function openMenu() {
    setOpen(true);
  }

  function toggleExpanded(id: string) {
    setExpanded((current) => (current === id ? null : id));
  }

  return {
    close,
    expanded,
    isOpen: open,
    openMenu,
    toggleExpanded,
  };
}
