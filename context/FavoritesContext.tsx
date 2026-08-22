'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CarListing } from '@/types';
import { useSession } from '@/components/providers/AuthProvider';

interface FavoritesContextType {
  favoriteList: CarListing[];
  toggleFavorite: (car: CarListing) => void;
  isFavorited: (carId: string) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteList, setFavoriteList] = useState<CarListing[]>([]);
  const { data: session } = useSession();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mobilku_favorites');
    if (saved) {
      try {
        setFavoriteList(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved favorites from localStorage', e);
      }
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('mobilku_favorites', JSON.stringify(favoriteList));
  }, [favoriteList]);

  // Sync with API if user is logged in
  useEffect(() => {
    async function syncApiFavorites() {
      if (!session) return;
      try {
        const res = await fetch('/api/favorites');
        if (res.ok) {
          const apiFavs = await res.json();
          if (Array.isArray(apiFavs) && apiFavs.length > 0) {
            const carsFromApi: CarListing[] = apiFavs
              .map((item: any) => item.carListing)
              .filter(Boolean);
            
            setFavoriteList((prev) => {
              const mergedMap = new Map<string, CarListing>();
              prev.forEach((c) => mergedMap.set(c.id, c));
              carsFromApi.forEach((c) => mergedMap.set(c.id, c));
              return Array.from(mergedMap.values());
            });
          }
        }
      } catch (e) {
        console.error('Error fetching favorites API:', e);
      }
    }
    syncApiFavorites();
  }, [session]);

  const toggleFavorite = (car: CarListing) => {
    const exists = favoriteList.some((item) => item.id === car.id);
    if (exists) {
      setFavoriteList((prev) => prev.filter((item) => item.id !== car.id));
    } else {
      setFavoriteList((prev) => [car, ...prev]);
    }

    // If logged in, also sync POST to API
    if (session) {
      fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carListingId: car.id }),
      }).catch((err) => console.error('Error syncing favorite POST:', err));
    }
  };

  const isFavorited = (carId: string) => {
    return favoriteList.some((item) => item.id === carId);
  };

  const clearFavorites = () => {
    setFavoriteList([]);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteList,
        toggleFavorite,
        isFavorited,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
