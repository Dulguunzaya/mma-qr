"use client";

import { useState } from "react";

export function useNewsPagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const start = (page - 1) * pageSize;
  const visibleItems = items.slice(start, start + pageSize);

  return { page, setPage, totalPages, visibleItems };
}
