import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';

import { jobOffers } from '@/constants/jobs';
import { getItem, removeItem, setItem } from '@/utils/persistent-storage';

type NotificationType = 'application' | 'alert' | 'information';

export type UserNotification = {
  id: string;
  title: string;
  message: string;
  date: string;
  type: NotificationType;
  read: boolean;
};

export type UserAlert = {
  id: string;
  title: string;
  keywords: string[];
  location: string;
  frequency: 'Quotidienne' | 'Hebdomadaire';
  lastRun: string;
  active: boolean;
};

export type UserCV = {
  id: string;
  name: string;
  updatedAt: string;
  isPrimary?: boolean;
};

type ApplicationStatus =
  | 'Candidature envoyée'
  | 'En cours d\'étude'
  | 'Entretien planifié'
  | 'Proposition reçue';

export type UserApplication = {
  id: string;
  jobId: string;
  company: string;
  title: string;
  status: ApplicationStatus;
  lastUpdate: string;
  nextStep?: string;
};

type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  title: string;
  location: string;
  hasPassword: boolean;
  favorites: string[];
  alerts: UserAlert[];
  cvs: UserCV[];
  applications: UserApplication[];
  notifications: UserNotification[];
  stats: {
    profileViews: number;
    recruiterMessages: number;
    applicationsInProgress: number;
  };
  settings: {
    pushNotifications: boolean;
    emailSubscriptions: boolean;
    cookieConsent: 'Essentiel' | 'Complet';
    accessibilityMode: boolean;
  };
};

type AuthContextValue = {
  user: AuthenticatedUser | null;
  hydrated: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (credentials: EmailCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  toggleFavorite: (jobId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  toggleAlertActivation: (alertId: string) => void;
  updateSettings: (
    settings: Partial<AuthenticatedUser['settings']>
  ) => void;
  createPassword: () => void;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type StoredAccountProvider = 'google' | 'apple' | 'email';

type StoredAccount = {
  user: AuthenticatedUser;
  provider: StoredAccountProvider;
  password?: string;
};

type StoredAccountMap = Record<string, StoredAccount>;

type EmailCredentials = {
  email: string;
  password: string;
  fullName?: string;
};

const CURRENT_USER_KEY = '2ta.auth.currentUser';
const REGISTERED_ACCOUNTS_KEY = '2ta.auth.accounts';

function cloneUser(user: AuthenticatedUser): AuthenticatedUser {
  return {
    ...user,
    favorites: [...user.favorites],
    alerts: user.alerts.map((alert) => ({ ...alert })),
    cvs: user.cvs.map((cv) => ({ ...cv })),
    applications: user.applications.map((application) => ({ ...application })),
    notifications: user.notifications.map((notification) => ({ ...notification })),
    stats: { ...user.stats },
    settings: { ...user.settings },
  };
}

function createDefaultUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  const base = cloneUser(mockUser);
  const merged: AuthenticatedUser = {
    ...base,
    ...overrides,
    favorites: overrides.favorites ? [...overrides.favorites] : base.favorites,
    alerts: overrides.alerts
      ? overrides.alerts.map((alert) => ({ ...alert }))
      : base.alerts,
    cvs: overrides.cvs ? overrides.cvs.map((cv) => ({ ...cv })) : base.cvs,
    applications: overrides.applications
      ? overrides.applications.map((application) => ({ ...application }))
      : base.applications,
    notifications: overrides.notifications
      ? overrides.notifications.map((notification) => ({ ...notification }))
      : base.notifications,
    stats: overrides.stats ? { ...base.stats, ...overrides.stats } : base.stats,
    settings: overrides.settings
      ? { ...base.settings, ...overrides.settings }
      : base.settings,
  };

  return merged;
}

function extractInitials(fullName: string) {
  const segments = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (segments.length === 0) {
    return 'US';
  }
  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase();
  }
  return `${segments[0][0]}${segments[segments.length - 1][0]}`.toUpperCase();
}

const mockUser: AuthenticatedUser = {
  id: 'user-1',
  name: 'Camille Martin',
  email: 'camille.martin@example.com',
  avatarInitials: 'CM',
  title: 'Product Designer',
  location: 'Paris, Île-de-France',
  hasPassword: false,
  favorites: ['job-1', 'job-3'],
  alerts: [
    {
      id: 'alert-1',
      title: 'UX Designer - Télétravail',
      keywords: ['UX', 'Figma', 'Research'],
      location: 'Télétravail',
      frequency: 'Quotidienne',
      lastRun: 'Il y a 2 heures',
      active: true,
    },
    {
      id: 'alert-2',
      title: 'Product Manager - Paris',
      keywords: ['Product', 'Agile'],
      location: 'Paris (75)',
      frequency: 'Hebdomadaire',
      lastRun: 'Hier',
      active: true,
    },
    {
      id: 'alert-3',
      title: 'Lead Designer - Lyon',
      keywords: ['Design System'],
      location: 'Lyon (69)',
      frequency: 'Hebdomadaire',
      lastRun: 'Il y a 3 jours',
      active: false,
    },
  ],
  cvs: [
    { id: 'cv-1', name: 'CV_Product_Designer.pdf', updatedAt: 'Mis à jour il y a 5 jours', isPrimary: true },
    { id: 'cv-2', name: 'Portfolio_2025.pdf', updatedAt: 'Mis à jour il y a 12 jours' },
  ],
  applications: [
    {
      id: 'application-1',
      jobId: 'job-1',
      company: 'HelloWork',
      title: 'Product Designer Senior',
      status: 'Entretien planifié',
      lastUpdate: 'Entretien le 15 mai',
      nextStep: 'Préparer le cas pratique',
    },
    {
      id: 'application-2',
      jobId: 'job-4',
      company: 'SaaSly',
      title: 'UX Researcher',
      status: 'Candidature envoyée',
      lastUpdate: 'Envoyée il y a 3 jours',
    },
    {
      id: 'application-3',
      jobId: 'job-3',
      company: 'RetailX',
      title: 'Lead Product Designer',
      status: "En cours d'étude",
      lastUpdate: 'Reçu il y a 1 semaine',
    },
  ],
  notifications: [
    {
      id: 'notification-1',
      title: 'Réponse à votre candidature',
      message: "L'équipe HelloWork souhaite vous rencontrer.",
      date: 'Il y a 2 heures',
      type: 'application',
      read: false,
    },
    {
      id: 'notification-2',
      title: 'Nouvelle offre pour votre alerte',
      message: '3 nouvelles offres correspondent à "UX Designer - Télétravail".',
      date: 'Il y a 5 heures',
      type: 'alert',
      read: false,
    },
    {
      id: 'notification-3',
      title: 'Astuce carrière',
      message: 'Découvrez comment optimiser votre portfolio pour les recruteurs.',
      date: 'Hier',
      type: 'information',
      read: true,
    },
  ],
  stats: {
    profileViews: 126,
    recruiterMessages: 4,
    applicationsInProgress: 3,
  },
  settings: {
    pushNotifications: true,
    emailSubscriptions: true,
    cookieConsent: 'Complet',
    accessibilityMode: false,
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const accountsRef = useRef<StoredAccountMap>({});
  const activeEmailRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      try {
        const [storedUser, storedAccounts] = await Promise.all([
          getItem(CURRENT_USER_KEY),
          getItem(REGISTERED_ACCOUNTS_KEY),
        ]);

        if (storedAccounts) {
          try {
            accountsRef.current = JSON.parse(storedAccounts) as StoredAccountMap;
          } catch (error) {
            accountsRef.current = {};
          }
        }

        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser) as AuthenticatedUser;
            if (isMounted) {
              setUser(cloneUser(parsed));
              activeEmailRef.current = parsed.email.toLowerCase();
            }
          } catch (error) {
            // Ignore invalid JSON and start with a clean state.
          }
        }
      } finally {
        if (isMounted) {
          setHydrated(true);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const persist = async () => {
      if (user) {
        activeEmailRef.current = user.email.toLowerCase();
        await setItem(CURRENT_USER_KEY, JSON.stringify(user));

        const normalizedEmail = user.email.toLowerCase();
        const existing = accountsRef.current[normalizedEmail];
        if (existing) {
          accountsRef.current[normalizedEmail] = {
            ...existing,
            user: cloneUser(user),
          };
        } else {
          accountsRef.current[normalizedEmail] = {
            user: cloneUser(user),
            provider: 'email',
          };
        }
      } else {
        activeEmailRef.current = null;
        await removeItem(CURRENT_USER_KEY);
      }

      await setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accountsRef.current));
    };

    void persist();
  }, [user, hydrated]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 750));
      const googleUser = createDefaultUser({
        id: 'google-user-1',
        email: 'camille.martin@example.com',
        hasPassword: false,
      });

      const normalizedEmail = googleUser.email.toLowerCase();
      accountsRef.current[normalizedEmail] = {
        user: cloneUser(googleUser),
        provider: 'google',
      };
      setUser(googleUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 750));

      const appleUser = createDefaultUser({
        id: 'apple-user-1',
        email: 'camille.martin@icloud.com',
        hasPassword: false,
      });

      const normalizedEmail = appleUser.email.toLowerCase();
      accountsRef.current[normalizedEmail] = {
        user: cloneUser(appleUser),
        provider: 'apple',
      };
      setUser(appleUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithEmail = useCallback(
    async ({ email, password, fullName }: EmailCredentials) => {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        throw new Error('Veuillez renseigner une adresse email.');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw new Error("L'adresse email n'est pas valide.");
      }

      if (!password || password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
      }

      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 600));

        const existingAccount = accountsRef.current[normalizedEmail];

        if (existingAccount) {
          if (existingAccount.provider !== 'email') {
            throw new Error(
              'Ce compte utilise une connexion via un fournisseur externe. Veuillez vous connecter avec celui-ci.'
            );
          }

          if (existingAccount.password !== password) {
            throw new Error('Mot de passe incorrect.');
          }

          setUser(cloneUser(existingAccount.user));
          return;
        }

        const generatedName = fullName?.trim() || normalizedEmail.split('@')[0];
        const normalizedName = generatedName
          .split(' ')
          .map((segment) =>
            segment.length > 0
              ? segment[0].toUpperCase() + segment.slice(1).toLowerCase()
              : segment
          )
          .join(' ');

        const emailUser = createDefaultUser({
          id: `email-user-${Date.now()}`,
          email: normalizedEmail,
          name: normalizedName || 'Utilisateur 2TA',
          avatarInitials: extractInitials(normalizedName || normalizedEmail),
          hasPassword: true,
        });

        accountsRef.current[normalizedEmail] = {
          user: cloneUser(emailUser),
          provider: 'email',
          password,
        };

        setUser(emailUser);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    activeEmailRef.current = null;
    setUser(null);
  }, []);

  const toggleFavorite = useCallback((jobId: string) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      const isFavorite = prev.favorites.includes(jobId);
      return {
        ...prev,
        favorites: isFavorite
          ? prev.favorites.filter((id) => id !== jobId)
          : [...prev.favorites, jobId],
      };
    });
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        notifications: prev.notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        ),
      };
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        notifications: prev.notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
      };
    });
  }, []);

  const toggleAlertActivation = useCallback((alertId: string) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        alerts: prev.alerts.map((alert) =>
          alert.id === alertId ? { ...alert, active: !alert.active } : alert
        ),
      };
    });
  }, []);

  const updateSettings = useCallback(
    (settings: Partial<AuthenticatedUser['settings']>) => {
      setUser((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          settings: {
            ...prev.settings,
            ...settings,
          },
        };
      });
    },
    []
  );

  const createPassword = useCallback(() => {
    if (!user) {
      return;
    }

    Alert.alert(
      user.hasPassword ? 'Modification du mot de passe' : 'Création du mot de passe',
      user.hasPassword
        ? 'Nous venons de vous envoyer un email pour sécuriser le changement de mot de passe.'
        : 'Nous venons de vous envoyer un lien pour créer un mot de passe et sécuriser votre compte.',
      [{ text: 'Fermer' }]
    );

    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        hasPassword: true,
      };
    });
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!user) {
      return;
    }

    Alert.alert(
      'Suppression du compte',
      'Votre compte et vos données associées ont été supprimés. Vous pourrez revenir quand vous le souhaitez !',
      [{ text: 'Fermer' }]
    );

    const normalizedEmail = user.email.toLowerCase();
    delete accountsRef.current[normalizedEmail];
    activeEmailRef.current = null;
    setUser(null);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      hydrated,
      loading,
      signInWithGoogle,
      signInWithApple,
      signInWithEmail,
      signOut,
      toggleFavorite,
      markNotificationRead,
      markAllNotificationsRead,
      toggleAlertActivation,
      updateSettings,
      createPassword,
      deleteAccount,
    }),
    [
      createPassword,
      deleteAccount,
      hydrated,
      loading,
      markAllNotificationsRead,
      markNotificationRead,
      signInWithApple,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      toggleAlertActivation,
      toggleFavorite,
      updateSettings,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function isJobFavorite(jobId: string, favorites: string[]) {
  return favorites.includes(jobId);
}

export function getJobById(jobId: string) {
  return jobOffers.find((job) => job.id === jobId);
}
