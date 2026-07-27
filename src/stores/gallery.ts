import { create } from "zustand";

interface GalleryState {
  indexByProduct: Record<string, number>;
  setIndex: (productId: string, idx: number) => void;
  getIndex: (productId: string) => number;
}

export const useGallery = create<GalleryState>((set, get) => ({
  indexByProduct: {},
  setIndex: (productId, idx) =>
    set((s) => ({ indexByProduct: { ...s.indexByProduct, [productId]: idx } })),
  getIndex: (productId) => get().indexByProduct[productId] ?? 0,
}));
