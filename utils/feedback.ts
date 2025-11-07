import { dispatchToast } from '@/context/ToastContext';

export function showApplicationFeedback(jobTitle: string) {
  const message = `Votre candidature pour "${jobTitle}" a bien été envoyée.`;
  dispatchToast({ message, type: 'success' });
}
