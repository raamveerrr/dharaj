import { create } from "zustand";

interface UIState {
  cartOpen: boolean;
  menuOpen: boolean;
  searchOpen: boolean;
  isMobileMenuOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;
}

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  menuOpen: false,
  searchOpen: false,
  isMobileMenuOpen: false,
  setCartOpen: (v) => set({ cartOpen: v }),
  setMenuOpen: (v) => set({ menuOpen: v }),
  setSearchOpen: (v) => set({ searchOpen: v }),
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
}));
