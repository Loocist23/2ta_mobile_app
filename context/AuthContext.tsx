import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';

import { jobOffers } from '@/constants/jobs';

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
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  toggleFavorite: (jobId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  toggleAlertActivation: (alertId: string) => void;
  updateSettings: (
    settings: Partial<AuthenticatedUser['settings']>
  ) => void;
  createPassword: () => void;
  deleteAccount: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 750));
      setUser(mockUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
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

  const deleteAccount = useCallback(() => {
    Alert.alert(
      'Suppression du compte',
      'Votre compte et vos données associées ont été supprimés. Vous pourrez revenir quand vous le souhaitez !',
      [{ text: 'Fermer' }]
    );
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signInWithGoogle,
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
      loading,
      markAllNotificationsRead,
      markNotificationRead,
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
