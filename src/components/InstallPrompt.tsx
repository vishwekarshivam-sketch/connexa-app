import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image } from 'react-native';
import { colors, fonts } from '@/tokens';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Logic to decide WHEN to show it would go here (e.g. after Sorting)
      // For now, we'll just listen for a global event or app state
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Expose a way to trigger the prompt globally
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const triggerHandler = () => {
       if (deferredPrompt || isIOS) {
         setIsVisible(true);
       }
    };

    window.addEventListener('show-install-prompt', triggerHandler);
    return () => window.removeEventListener('show-install-prompt', triggerHandler);
  }, [deferredPrompt, isIOS]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.header}>
           <View style={styles.iconContainer}>
             <Icon name="mark" size={32} color={colors.ember} />
           </View>
           <TouchableOpacity onPress={() => setIsVisible(false)} hitSlop={12}>
             <Icon name="chevronLeft" size={24} color={colors.inkMute} style={{ transform: [{ rotate: '-90deg' }] }} />
           </TouchableOpacity>
        </View>

        <Text style={styles.title}>Add Connexa to your home screen</Text>
        <Text style={styles.subtitle}>One tap to open. No app store needed.</Text>

        {isIOS ? (
          <View style={styles.iosInstructions}>
            <Text style={styles.iosText}>
              Tap <Icon name="moreHorizontal" size={16} color={colors.ink} /> then "Add to Home Screen"
            </Text>
            <Button onPress={() => setIsVisible(false)} style={styles.button}>Got it</Button>
          </View>
        ) : (
          <View style={styles.actions}>
            <Button onPress={handleInstall} style={styles.button}>Add to home screen</Button>
            <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.dismiss}>
              <Text style={styles.dismissText}>Not now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(21, 22, 28, 0.4)',
    justifyContent: 'flex-end',
    zIndex: 2000,
  },
  sheet: {
    backgroundColor: colors.khadi,
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: colors.khadiLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.hairlineSoft,
  },
  title: {
    fontFamily: fonts.display.medium,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.lore.regular,
    fontSize: 15,
    color: colors.inkMute,
    marginBottom: 24,
  },
  iosInstructions: {
    gap: 16,
  },
  iosText: {
    fontFamily: fonts.lore.regular,
    fontSize: 15,
    color: colors.ink,
    textAlign: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.khadiLight,
  },
  actions: {
    gap: 12,
  },
  button: {
    backgroundColor: colors.ink,
  },
  dismiss: {
    padding: 12,
    alignItems: 'center',
  },
  dismissText: {
    fontFamily: fonts.display.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.inkWhisper,
  },
});
