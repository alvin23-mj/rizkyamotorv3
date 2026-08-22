'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CarListing } from '@/types';

interface ComparisonContextType {
  comparisonList: CarListing[];
  addToComparison: (car: CarListing) => void;
  removeFromComparison: (carId: string) => void;
  isInComparison: (carId: string) => boolean;
  clearComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [comparisonList, setComparisonList] = useState<CarListing[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('mobilku_comparison');
    if (saved) {
      try {
        setComparisonList(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved comparison', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mobilku_comparison', JSON.stringify(comparisonList));
  }, [comparisonList]);

  const addToComparison = (car: CarListing) => {
    if (comparisonList.some((item) => item.id === car.id)) return;
    if (comparisonList.length >= 3) {
      alert('Maksimal 3 mobil yang dapat dibandingkan sekaligus.');
      return;
    }
    setComparisonList((prev) => [...prev, car]);
  };

  const removeFromComparison = (carId: string) => {
    setComparisonList((prev) => prev.filter((item) => item.id !== carId));
  };

  const isInComparison = (carId: string) => {
    return comparisonList.some((item) => item.id === carId);
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparisonList,
        addToComparison,
        removeFromComparison,
        isInComparison,
        clearComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
