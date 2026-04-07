import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import theme from '../theme';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('App boot error', error);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.badge}>Diagnostic de demarrage</Text>
          <Text style={styles.title}>L'application a rencontre une erreur au lancement.</Text>
          <Text style={styles.message}>
            {error.message || 'Erreur inconnue'}
          </Text>
          <Text style={styles.caption}>
            Cette vue evite un ecran blanc et permet de relancer rapidement l'application.
          </Text>
          <Pressable onPress={this.handleRetry} style={styles.button}>
            <Text style={styles.buttonText}>Reessayer</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 999,
    backgroundColor: '#D7E9FB',
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  message: {
    fontSize: 15,
    color: '#B42318',
    marginBottom: theme.spacing.md,
  },
  caption: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.muted,
    marginBottom: theme.spacing.xl,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
