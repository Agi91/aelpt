import { create } from 'zustand';

// ─────────────────────────────────────────────────────────────────────────────
// UI STORE — Global UI state managed with Zustand
// Covers: sidebar open/closed state, mobile drawer, page title
// ─────────────────────────────────────────────────────────────────────────────

interface UiState {
  /** Desktop sidebar collapsed to icon-only mode */
  isSidebarCollapsed: boolean;
  /** Mobile drawer open state */
  isMobileSidebarOpen: boolean;
  /** Current page title shown in the header */
  activePageTitle: string;

  // Actions
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
  setPageTitle: (title: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  activePageTitle: 'Dashboard',

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  collapseSidebar: () => set({ isSidebarCollapsed: true }),

  expandSidebar: () => set({ isSidebarCollapsed: false }),

  openMobileSidebar: () => set({ isMobileSidebarOpen: true }),

  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),

  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),

  setPageTitle: (title: string) => set({ activePageTitle: title }),
}));
