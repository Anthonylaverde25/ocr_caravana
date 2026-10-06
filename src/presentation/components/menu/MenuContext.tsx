import React, { createContext, useContext, useState, useCallback } from 'react';

interface MenuContextValue {
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  return (
    <MenuContext.Provider value={{ isMenuOpen, openMenu, closeMenu, toggleMenu }}>
      {children}
    </MenuContext.Provider>
  );
}

const defaultMenuValue: MenuContextValue = {
  isMenuOpen: false,
  openMenu: () => {},
  closeMenu: () => {},
  toggleMenu: () => {},
};

export function useNavMenu(): MenuContextValue {
  const context = useContext(MenuContext);
  return context || defaultMenuValue;
}
