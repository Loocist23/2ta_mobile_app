import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export type ToastType = 'info' | 'success' | 'error';

export type ToastOptions = {
  message: string;
  type?: ToastType;
  duration?: number;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
};

type ToastQueueItem = ToastOptions & {
  id: number;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let externalToastHandler: ((options: ToastOptions) => void) | null = null;

export function dispatchToast(options: ToastOptions) {
  externalToastHandler?.(options);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<ToastQueueItem[]>([]);
  const [currentToast, setCurrentToast] = useState<ToastQueueItem | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  const showToast = useCallback((options: ToastOptions) => {
    setQueue((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        ...options,
      },
    ]);
  }, []);

  useEffect(() => {
    externalToastHandler = showToast;
    return () => {
      if (externalToastHandler === showToast) {
        externalToastHandler = null;
      }
    };
  }, [showToast]);

  useEffect(() => {
    if (!currentToast && queue.length > 0) {
      setCurrentToast(queue[0]);
      setQueue((prev) => prev.slice(1));
    }
  }, [currentToast, queue]);

  useEffect(() => {
    if (!currentToast) {
      return;
    }

    opacity.setValue(0);
    translateY.setValue(24);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 24,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setCurrentToast(null);
        }
      });
    }, currentToast.duration ?? 3200);

    return () => {
      clearTimeout(timeout);
    };
  }, [currentToast, opacity, translateY]);

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastViewport toast={currentToast} opacity={opacity} translateY={translateY} />
    </ToastContext.Provider>
  );
}

function getBackgroundColor(type: ToastType = 'info') {
  switch (type) {
    case 'success':
      return '#1B873F';
    case 'error':
      return '#C0353A';
    default:
      return 'rgba(33, 41, 54, 0.96)';
  }
}

type ToastViewportProps = {
  toast: ToastQueueItem | null;
  opacity: Animated.Value;
  translateY: Animated.Value;
};

function ToastViewport({ toast, opacity, translateY }: ToastViewportProps) {
  if (!toast) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.viewport,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      <View style={[styles.toast, { backgroundColor: getBackgroundColor(toast.type) }]}>
        <Text style={styles.message}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  toast: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    maxWidth: 480,
  },
  message: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
});
