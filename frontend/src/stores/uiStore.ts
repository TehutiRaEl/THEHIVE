import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { TabId, ColonyId, Notification, Modal, Theme, UserPreferences } from '../types'

interface UIState {
  activeTab: TabId
  activeColony: ColonyId | null
  theme: Theme
  preferences: UserPreferences
  notifications: Notification[]
  modals: Modal[]
  loadingCount: number
  isLoading: boolean
  isSidebarOpen: boolean
  isSidebarCollapsed: boolean
  isSearchOpen: boolean
  searchQuery: string
  searchResults: any[]
  contextMenu: { isOpen: boolean; x: number; y: number; items: any[] } | null
  activeTooltip: string | null
}

interface UIActions {
  setActiveTab: (tab: TabId) => void
  setActiveColony: (colony: ColonyId | null) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setPreferences: (preferences: Partial<UserPreferences>) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string
  removeNotification: (id: string) => void
  clearNotifications: () => void
  addModal: (modal: Omit<Modal, 'isOpen'>) => string
  closeModal: (id: string) => void
  closeAllModals: () => void
  incrementLoader: () => void
  decrementLoader: () => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openSearch: () => void
  closeSearch: () => void
  setSearchQuery: (query: string) => void
  setSearchResults: (results: any[]) => void
  openContextMenu: (x: number, y: number, items: any[]) => void
  closeContextMenu: () => void
  showTooltip: (id: string) => void
  hideTooltip: () => void
  resetUI: () => void
}

type UIStore = UIState & UIActions

const INITIAL_PREFERENCES: UserPreferences = {
  theme: 'system',
  fontSize: 'medium',
  animations: true,
  sound: true,
  notifications: true,
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
}

const INITIAL_THEME: Theme = {
  mode: 'dark',
  primary: '#6B3FA0',
  secondary: '#FFD700',
  background: '#0A0E2A',
  surface: 'rgba(10, 14, 42, 0.7)',
  text: '#F8F9FA',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  border: 'rgba(107, 63, 160, 0.3)'
}

const INITIAL_STATE: UIState = {
  activeTab: 'hive',
  activeColony: null,
  theme: INITIAL_THEME,
  preferences: INITIAL_PREFERENCES,
  notifications: [],
  modals: [],
  loadingCount: 0,
  isLoading: false,
  isSidebarOpen: true,
  isSidebarCollapsed: false,
  isSearchOpen: false,
  searchQuery: '',
  searchResults: [],
  contextMenu: null,
  activeTooltip: null
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      ...INITIAL_STATE,
      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveColony: (colony) => set({ activeColony: colony }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set(state => ({
        theme: { ...state.theme, mode: state.theme.mode === 'dark' ? 'light' : 'dark' }
      })),
      setPreferences: (preferences) => set(state => ({
        preferences: { ...state.preferences, ...preferences }
      })),
      addNotification: (notification) => {
        const id = 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: new Date().toISOString()
        }
        set(state => ({ notifications: [...state.notifications, newNotification] }))
        const duration = notification.duration || 5000
        setTimeout(() => get().removeNotification(id), duration)
        return id
      },
      removeNotification: (id) => set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),
      addModal: (modal) => {
        const id = 'modal-' + Date.now()
        set(state => ({ modals: [...state.modals, { ...modal, id, isOpen: true }] }))
        return id
      },
      closeModal: (id) => set(state => ({
        modals: state.modals.map(m => m.id === id ? { ...m, isOpen: false } : m)
      })),
      closeAllModals: () => set(state => ({
        modals: state.modals.map(m => ({ ...m, isOpen: false }))
      })),
      incrementLoader: () => set(state => ({
        loadingCount: state.loadingCount + 1,
        isLoading: state.loadingCount + 1 > 0
      })),
      decrementLoader: () => set(state => {
        const count = Math.max(0, state.loadingCount - 1)
        return { loadingCount: count, isLoading: count > 0 }
      }),
      toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      openSearch: () => set({ isSearchOpen: true, searchQuery: '' }),
      closeSearch: () => set({ isSearchOpen: false, searchQuery: '', searchResults: [] }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchResults: (results) => set({ searchResults: results }),
      openContextMenu: (x, y, items) => set({ contextMenu: { isOpen: true, x, y, items } }),
      closeContextMenu: () => set({ contextMenu: null }),
      showTooltip: (id) => set({ activeTooltip: id }),
      hideTooltip: () => set({ activeTooltip: null }),
      resetUI: () => set(INITIAL_STATE)
    }),
    { name: 'SovereignHiveUIStore' }
  )
)

export const useTheme = () => useUIStore(state => state.theme)
export const usePreferences = () => useUIStore(state => state.preferences)
export const useNotifications = () => useUIStore(state => state.notifications)
export const useModals = () => useUIStore(state => state.modals)
export const useIsLoading = () => useUIStore(state => state.isLoading)
export const useSidebar = () => useUIStore(state => ({ isOpen: state.isSidebarOpen, isCollapsed: state.isSidebarCollapsed }))
export const useSearch = () => useUIStore(state => ({ isOpen: state.isSearchOpen, query: state.searchQuery, results: state.searchResults }))
export const useContextMenu = () => useUIStore(state => state.contextMenu)
