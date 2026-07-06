// ─────────────────────────────────────────────────────────────────────────────
// ROUTE CONSTANTS — Central definition for all navigable app routes
// Referenced throughout: navigation, breadcrumbs, redirect logic, route guards
// ─────────────────────────────────────────────────────────────────────────────

export const ROUTES = {
  // Public / Auth
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',

  // Dashboard root
  DASHBOARD: '/dashboard',

  // Academic
  SEMESTERS: '/semesters',
  SEMESTER_DETAIL: (id: string) => `/semesters/${id}`,
  SUBJECT_DETAIL: (semId: string, subId: string) =>
    `/semesters/${semId}/subjects/${subId}`,
  UNIT_DETAIL: (semId: string, subId: string, unitId: string) =>
    `/semesters/${semId}/subjects/${subId}/units/${unitId}`,
  TOPIC_DETAIL: (
    semId: string,
    subId: string,
    unitId: string,
    topicId: string
  ) =>
    `/semesters/${semId}/subjects/${subId}/units/${unitId}/topics/${topicId}`,

  // Learning tools
  NOTES: '/notes',
  FLASHCARDS: '/flashcards',
  RESOURCES: '/resources',
  REVISION: '/revision',

  // AI Features
  AI_MENTOR: '/ai-mentor',

  // Analytics & Gamification
  ANALYTICS: '/analytics',
  ACHIEVEMENTS: '/achievements',

  // Planning & Wellness
  PLANNER: '/planner',
  WELLNESS: '/wellness',

  // Account
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

// Navigation items for the sidebar — ordered as they appear
export type NavItem = {
  label: string;
  href: string;
  iconName: string;
  badge?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, iconName: 'LayoutDashboard' },
  { label: 'Semesters', href: ROUTES.SEMESTERS, iconName: 'BookOpen' },
  { label: 'Notes', href: ROUTES.NOTES, iconName: 'FileText' },
  { label: 'Flashcards', href: ROUTES.FLASHCARDS, iconName: 'Layers' },
  { label: 'Resources', href: ROUTES.RESOURCES, iconName: 'FolderOpen' },
  { label: 'Revision', href: ROUTES.REVISION, iconName: 'RefreshCw' },
  { label: 'AI Mentor', href: ROUTES.AI_MENTOR, iconName: 'Sparkles' },
  { label: 'Analytics', href: ROUTES.ANALYTICS, iconName: 'BarChart2' },
  { label: 'Achievements', href: ROUTES.ACHIEVEMENTS, iconName: 'Trophy' },
  { label: 'Planner', href: ROUTES.PLANNER, iconName: 'Calendar' },
  { label: 'Wellness', href: ROUTES.WELLNESS, iconName: 'Heart' },
  { label: 'Settings', href: ROUTES.SETTINGS, iconName: 'Settings' },
];
