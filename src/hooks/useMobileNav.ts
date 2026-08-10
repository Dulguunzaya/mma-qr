"use client";

import { useEffect, useRef, useState } from "react";

export function useMobileNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function close() {
    setOpen(false);
    setExpanded(null);
  }

  function toggleExpanded(id: string) {
    setExpanded((current) => (current === id ? null : id));
  }

  return {
    close,
    dialogRef,
    expanded,
    isOpen: open,
    openMenu: () => setOpen(true),
    toggleExpanded,
  };
}
