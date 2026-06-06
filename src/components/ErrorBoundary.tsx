import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, fonts } from '@/tokens';
import { Icon } from './Icon';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  title?: string;
  message?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Here you would typically log the error to a service like Sentry
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isNetworkError = this.state.error?.message?.toLowerCase().includes('network') || 
                             this.state.error?.message?.toLowerCase().includes('fetch') ||
                             this.state.error?.message?.toLowerCase().includes('timeout');

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Icon 
                name={isNetworkError ? 'wifiOff' : 'alertTriangle'} 
                size={40} 
                color={colors.inkWhisper} 
              />
            </View>
            
            <Text style={styles.title}>
              {this.props.title || (isNetworkError ? 'Connection Issue' : 'Something went wrong')}
            </Text>
            
            <Text style={styles.message}>
              {this.props.message || 
                (isNetworkError 
                  ? "We're having trouble reaching the server. Please check your connection and try again." 
                  : "An unexpected error occurred. Our team has been notified.")}
            </Text>

            <TouchableOpacity 
              style={styles.button}
              onPress={this.handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Try again</Text>
            </TouchableOpacity>

            {Platform.OS === 'web' && (
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => window.location.reload()}
              >
                <Text style={styles.secondaryButtonText}>Reload Page</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.khadi,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 24,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(21, 22, 28, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.inkMute,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: colors.ink,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.khadi,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  secondaryButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.inkWhisper,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
