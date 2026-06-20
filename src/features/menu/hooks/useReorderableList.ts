'use client';

// src/features/menu/hooks/useReorderableList.ts
//
// Generic native HTML5 drag-and-drop reorder hook — no extra dependency
// (no dnd-kit/react-beautiful-dnd). Used for both category order and
// item order within a category.

import { useCallback, useState } from 'react';

export function useReorderableList<T>(items: T[], onCommit: (reordered: T[]) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback(
    (index: number) => (e: React.DragEvent) => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  const handleDragOver = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.preventDefault();
      setOverIndex((current) => (current === index ? current : index));
    },
    []
  );

  const handleDrop = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.preventDefault();
      if (dragIndex === null || dragIndex === index) {
        setDragIndex(null);
        setOverIndex(null);
        return;
      }
      const next = [...items];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      setDragIndex(null);
      setOverIndex(null);
      onCommit(next);
    },
    [dragIndex, items, onCommit]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  return { dragIndex, overIndex, handleDragStart, handleDragOver, handleDrop, handleDragEnd };
}
