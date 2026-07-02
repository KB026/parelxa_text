'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CompareContextType {
  selectedIds: number[];
  toggleCompare: (id: number) => void;
  removeFromCompare: (id: number) => void;
  clearCompare: () => void;
  setCompare: (ids: number[]) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('parlexa_compare_ids');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        if (Array.isArray(ids)) {
          setSelectedIds(ids.slice(0, 3)); // Ensure max 3
        }
      } catch (e) {
        console.error('Failed to parse compare IDs from localStorage');
      }
    }
    setIsInitialized(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('parlexa_compare_ids', JSON.stringify(selectedIds));
    }
  }, [selectedIds, isInitialized]);

  const toggleCompare = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 3) {
        return prev; // Max 3
      }
      return [...prev, id];
    });
  };

  const removeFromCompare = (id: number) => {
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const clearCompare = () => {
    setSelectedIds([]);
  };

  const setCompare = (ids: number[]) => {
    setSelectedIds(ids.slice(0, 3));
  };

  return (
    <CompareContext.Provider value={{ selectedIds, toggleCompare, removeFromCompare, clearCompare, setCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
