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

type NotificationLink =
  | { type: 'job'; jobId: string }
  | { type: 'application'; applicationId: string }
  | { type: 'alert'; alertId: string };

export type UserNotification = {
  id: string;
  title: string;
  message: string;
  date: string;
  type: NotificationType;
  read: boolean;
  link?: NotificationLink;
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
  appliedOn: string;
  notes: string[];
};

type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  title: string;
  location: string;
  phone?: string;
  bio?: string;
  hasPassword: boolean;
  favorites: string[];
  alerts: UserAlert[];
  cvs: UserCV[];
  applications: UserApplication[];
  notifications: UserNotification[];
  followedCompanies: string[];
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
  activeProvider: StoredAccountProvider | null;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (credentials: EmailCredentials) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (input: UpdatePasswordInput) => Promise<void>;
  signOut: () => Promise<void>;
  toggleFavorite: (jobId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  toggleAlertActivation: (alertId: string) => void;
  updateSettings: (
    settings: Partial<AuthenticatedUser['settings']>
  ) => void;
  updateProfile: (
    profile: Partial<
      Pick<AuthenticatedUser, 'name' | 'title' | 'location' | 'phone' | 'bio'>
    >
  ) => void;
  addCv: (name: string) => void;
  renameCv: (id: string, name: string) => void;
  removeCv: (id: string) => void;
  setPrimaryCv: (id: string) => void;
  createAlert: (alert: Omit<UserAlert, 'id' | 'lastRun' | 'active'> & { active?: boolean }) => string;
  updateAlert: (
    alertId: string,
    alert: Partial<Omit<UserAlert, 'id'>>
  ) => void;
  deleteAlert: (alertId: string) => void;
  addApplication: (
    application: Omit<UserApplication, 'id' | 'lastUpdate' | 'notes'> & {
      notes?: string[];
      lastUpdate?: string;
    }
  ) => void;
  updateApplication: (
    applicationId: string,
    updates: Partial<Omit<UserApplication, 'id' | 'jobId'>>
  ) => void;
  addApplicationNote: (applicationId: string, note: string) => void;
  updateApplicationStatus: (
    applicationId: string,
    status: ApplicationStatus,
    nextStep?: string
  ) => void;
  followCompany: (companyId: string) => void;
  unfollowCompany: (companyId: string) => void;
  removeNotification: (notificationId: string) => void;
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

type UpdatePasswordInput = {
  currentPassword?: string;
  newPassword: string;
};

const CURRENT_USER_KEY = '2ta.auth.currentUser';
const REGISTERED_ACCOUNTS_KEY = '2ta.auth.accounts';

function cloneUser(user: AuthenticatedUser): AuthenticatedUser {
  return {
    ...user,
    favorites: [...user.favorites],
    alerts: user.alerts.map((alert) => ({ ...alert })),
    cvs: user.cvs.map((cv) => ({ ...cv })),
    applications: user.applications.map((application) => ({
      ...application,
      notes: [...application.notes],
    })),
    notifications: user.notifications.map((notification) => ({
      ...notification,
      link: notification.link ? { ...notification.link } : undefined,
    })),
    stats: { ...user.stats },
    settings: { ...user.settings },
    followedCompanies: [...user.followedCompanies],
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
      ? overrides.applications.map((application) => ({
          ...application,
          notes: [...application.notes],
        }))
      : base.applications,
    notifications: overrides.notifications
      ? overrides.notifications.map((notification) => ({
          ...notification,
          link: notification.link ? { ...notification.link } : undefined,
        }))
      : base.notifications,
    stats: overrides.stats ? { ...base.stats, ...overrides.stats } : base.stats,
    settings: overrides.settings
      ? { ...base.settings, ...overrides.settings }
      : base.settings,
    followedCompanies: overrides.followedCompanies
      ? [...overrides.followedCompanies]
      : base.followedCompanies,
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
  phone: '+33 6 12 34 56 78',
  bio: 'Designer produit passionnée par la recherche utilisateur et les expériences inclusives.',
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
      appliedOn: 'Candidature envoyée le 28 avril',
      notes: ['Entretien RH très positif'],
    },
    {
      id: 'application-2',
      jobId: 'job-4',
      company: 'SaaSly',
      title: 'UX Researcher',
      status: 'Candidature envoyée',
      lastUpdate: 'Envoyée il y a 3 jours',
      appliedOn: 'Envoyée le 2 mai',
      notes: [],
    },
    {
      id: 'application-3',
      jobId: 'job-3',
      company: 'RetailX',
      title: 'Lead Product Designer',
      status: "En cours d'étude",
      lastUpdate: 'Reçu il y a 1 semaine',
      appliedOn: 'Envoyée le 22 avril',
      notes: ['Relancer le 10 mai'],
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
      link: { type: 'application', applicationId: 'application-1' },
    },
    {
      id: 'notification-2',
      title: 'Nouvelle offre pour votre alerte',
      message: '3 nouvelles offres correspondent à "UX Designer - Télétravail".',
      date: 'Il y a 5 heures',
      type: 'alert',
      read: false,
      link: { type: 'alert', alertId: 'alert-1' },
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
  followedCompanies: ['company-1'],
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
  const [activeProvider, setActiveProvider] = useState<StoredAccountProvider | null>(null);
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
              const normalizedEmail = parsed.email.toLowerCase();
              setUser(cloneUser(parsed));
              activeEmailRef.current = normalizedEmail;
              const account = accountsRef.current[normalizedEmail];
              setActiveProvider(account?.provider ?? 'email');
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
        setActiveProvider(null);
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
      setActiveProvider('google');
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
      setActiveProvider('apple');
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
          if (!existingAccount.password) {
            throw new Error(
              'Ce compte utilise une connexion externe sans mot de passe défini. Rendez-vous sur votre fournisseur (Google ou Apple).' 
            );
          }

          if (existingAccount.password !== password) {
            throw new Error('Mot de passe incorrect.');
          }

          setActiveProvider(existingAccount.provider ?? 'email');
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
        setActiveProvider('email');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    activeEmailRef.current = null;
    setActiveProvider(null);
    setUser(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error('Veuillez renseigner votre adresse email.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error("L'adresse email n'est pas valide.");
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    const account = accountsRef.current[normalizedEmail];

    if (!account) {
      throw new Error("Aucun compte n'est associé à cette adresse email.");
    }

    if (account.provider !== 'email' && !account.password) {
      throw new Error(
        'Cette adresse est associée à une connexion Google ou Apple. Utilisez ce fournisseur pour récupérer l’accès.'
      );
    }
  }, []);

  const updatePassword = useCallback(
    async ({ currentPassword, newPassword }: UpdatePasswordInput) => {
      if (!user) {
        throw new Error('Vous devez être connecté pour modifier votre mot de passe.');
      }

      if (!newPassword || newPassword.trim().length < 8) {
        throw new Error('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      }

      if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        throw new Error('Le mot de passe doit contenir au moins une lettre et un chiffre.');
      }

      const normalizedEmail = user.email.toLowerCase();
      const account = accountsRef.current[normalizedEmail];

      if (account?.password) {
        if (!currentPassword || currentPassword.length === 0) {
          throw new Error('Veuillez renseigner votre mot de passe actuel.');
        }

        if (account.password !== currentPassword) {
          throw new Error('Mot de passe actuel incorrect.');
        }
      } else if (currentPassword && currentPassword.length > 0) {
        throw new Error('Aucun mot de passe actuel n’est défini pour ce compte.');
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const provider = account?.provider ?? 'email';
      const nextUser = cloneUser({ ...user, hasPassword: true });

      accountsRef.current[normalizedEmail] = {
        user: cloneUser(nextUser),
        provider,
        password: newPassword,
      };

      setUser(nextUser);
      setActiveProvider(provider);
    },
    [user]
  );

  const updateProfile = useCallback(
    (profile: Partial<
      Pick<AuthenticatedUser, 'name' | 'title' | 'location' | 'phone' | 'bio'>
    >) => {
      setUser((prev) => {
        if (!prev) {
          return prev;
        }

        const nameChanged = profile.name && profile.name.trim() !== prev.name;

        return {
          ...prev,
          ...profile,
          avatarInitials: nameChanged ? extractInitials(profile.name!) : prev.avatarInitials,
        };
      });
    },
    []
  );

  const addCv = useCallback((name: string) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      const id = `cv-${Date.now()}`;
      const newCv: UserCV = {
        id,
        name,
        updatedAt: 'Ajouté à l’instant',
        isPrimary: prev.cvs.length === 0,
      };

      return {
        ...prev,
        cvs: [...prev.cvs, newCv],
      };
    });
  }, []);

  const renameCv = useCallback((id: string, name: string) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        cvs: prev.cvs.map((cv) =>
          cv.id === id ? { ...cv, name, updatedAt: 'Mis à jour à l’instant' } : cv
        ),
      };
    });
  }, []);

  const removeCv = useCallback((id: string) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      const remaining = prev.cvs.filter((cv) => cv.id !== id);
      if (remaining.length === 0) {
        return {
          ...prev,
          cvs: [],
        };
      }

      return {
        ...prev,
        cvs: remaining.map((cv, index) => ({
          ...cv,
          isPrimary: index === 0,
        })),
      };
    });
  }, []);

  const setPrimaryCv = useCallback((id: string) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        cvs: prev.cvs.map((cv) => ({
          ...cv,
          isPrimary: cv.id === id,
        })),
      };
    });
  }, []);

  const createAlert = useCallback(
    (alert: Omit<UserAlert, 'id' | 'lastRun' | 'active'> & { active?: boolean }) => {
      const id = `alert-${Date.now()}`;

      setUser((prev) => {
        if (!prev) {
          return prev;
        }

        const nextAlert: UserAlert = {
          ...alert,
          id,
          lastRun: 'Jamais',
          active: alert.active ?? true,
        };

        return {
          ...prev,
          alerts: [...prev.alerts, nextAlert],
        };
      });

      return id;
    },
    []
  );

  const updateAlert = useCallback(
    (alertId: string, alert: Partial<Omit<UserAlert, 'id'>>) => {
      setUser((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          alerts: prev.alerts.map((existing) =>
            existing.id === alertId
              ? { ...existing, ...alert, lastRun: alert.lastRun ?? existing.lastRun }
              : existing
          ),
        };
      });
    },
    []
  );

  const deleteAlert = useCallback((alertId: string) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        alerts: prev.alerts.filter((existing) => existing.id !== alertId),
      };
    });
  }, []);

  const computeApplicationsInProgress = useCallback((applications: UserApplication[]) => {
    return applications.filter((application) => application.status !== 'Proposition reçue').length;
  }, []);

  const addApplication = useCallback(
    (
      application: Omit<UserApplication, 'id' | 'lastUpdate' | 'notes'> & {
        notes?: string[];
        lastUpdate?: string;
      }
    ) => {
      setUser((prev) => {
        if (!prev) {
          return prev;
        }

        const id = `application-${Date.now()}`;
        const nextApplications = [
          {
            ...application,
            id,
            lastUpdate: application.lastUpdate ?? 'Ajoutée à l’instant',
            notes: application.notes ? [...application.notes] : [],
          },
          ...prev.applications,
        ];

        return {
          ...prev,
          applications: nextApplications,
          stats: {
            ...prev.stats,
            applicationsInProgress: computeApplicationsInProgress(nextApplications),
          },
        };
      });
    },
    [computeApplicationsInProgress]
  );

  const updateApplication = useCallback(
    (applicationId: string, updates: Partial<Omit<UserApplication, 'id' | 'jobId'>>) => {
      setUser((prev) => {
        if (!prev) {
          return prev;
        }

        const nextApplications = prev.applications.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                ...updates,
                notes: updates.notes ? [...updates.notes] : application.notes,
              }
            : application
        );

        return {
          ...prev,
          applications: nextApplications,
          stats: {
            ...prev.stats,
            applicationsInProgress: computeApplicationsInProgress(nextApplications),
          },
        };
      });
    },
    [computeApplicationsInProgress]
  );

  const addApplicationNote = useCallback((applicationId: string, note: string) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      const nextApplications = prev.applications.map((application) =>
        application.id === applicationId
          ? {
              ...application,
              notes: [...application.notes, note],
              lastUpdate: 'Note ajoutée à l’instant',
            }
          : application
      );

      return {
        ...prev,
        applications: nextApplications,
      };
    });
  }, []);

  const updateApplicationStatus = useCallback(
    (applicationId: string, status: ApplicationStatus, nextStep?: string) => {
      setUser((prev) => {
        if (!prev) {
          return prev;
        }

        const nextApplications = prev.applications.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status,
                nextStep: nextStep ?? application.nextStep,
                lastUpdate: 'Statut mis à jour à l’instant',
              }
            : application
        );

        return {
          ...prev,
          applications: nextApplications,
          stats: {
            ...prev.stats,
            applicationsInProgress: computeApplicationsInProgress(nextApplications),
          },
        };
      });
    },
    [computeApplicationsInProgress]
  );

  const followCompany = useCallback((companyId: string) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      if (prev.followedCompanies.includes(companyId)) {
        return prev;
      }

      return {
        ...prev,
        followedCompanies: [...prev.followedCompanies, companyId],
      };
    });
  }, []);

  const unfollowCompany = useCallback((companyId: string) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        followedCompanies: prev.followedCompanies.filter((id) => id !== companyId),
      };
    });
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        notifications: prev.notifications.filter((notification) => notification.id !== notificationId),
      };
    });
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
    setActiveProvider(null);
    setUser(null);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      hydrated,
      loading,
      activeProvider,
      signInWithGoogle,
      signInWithApple,
      signInWithEmail,
      requestPasswordReset,
      updatePassword,
      signOut,
      updateProfile,
      addCv,
      renameCv,
      removeCv,
      setPrimaryCv,
      createAlert,
      updateAlert,
      deleteAlert,
      addApplication,
      updateApplication,
      addApplicationNote,
      updateApplicationStatus,
      followCompany,
      unfollowCompany,
      toggleFavorite,
      markNotificationRead,
      markAllNotificationsRead,
      removeNotification,
      toggleAlertActivation,
      updateSettings,
      deleteAccount,
    }),
    [
      deleteAccount,
      hydrated,
      loading,
      activeProvider,
      addApplication,
      addApplicationNote,
      addCv,
      createAlert,
      deleteAlert,
      followCompany,
      requestPasswordReset,
      markAllNotificationsRead,
      markNotificationRead,
      removeCv,
      renameCv,
      removeNotification,
      signInWithApple,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      setPrimaryCv,
      toggleAlertActivation,
      toggleFavorite,
      unfollowCompany,
      updateAlert,
      updateApplication,
      updateApplicationStatus,
      updateProfile,
      updateSettings,
      updatePassword,
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
