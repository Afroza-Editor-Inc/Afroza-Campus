import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/ui';
import { AuthBackButton, AuthHeading } from '../../components/auth/AuthKit';
import theme from '../../theme';

type Method = 'sms' | 'email';

const OPTIONS: Array<{
  key: Method;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  detail: string;
}> = [
  { key: 'sms', icon: 'chatbubble-ellipses-outline', title: 'Par SMS', detail: '+221 ** *** ** 87' },
  { key: 'email', icon: 'mail-outline', title: 'Par Email', detail: 'a****@afroza.campus' },
];

export default function ForgotPasswordScreen({ navigation }: any) {
  const [method, setMethod] = React.useState<Method>('sms');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AuthBackButton onPress={() => navigation.goBack()} />

        <AuthHeading
          title="Mot de passe oublié ?"
          subtitle="Choisissez où recevoir votre code de vérification."
        />

        <View style={styles.options}>
          {OPTIONS.map((option) => {
            const selected = method === option.key;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setMethod(option.key)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={selected ? theme.colors.white : theme.colors.primary}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDetail}>{option.detail}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <AppButton label="Continuer" onPress={() => navigation.navigate('Otp', { method })} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.xl,
  },
  options: {
    gap: theme.spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSelected: {
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    ...theme.typography.title3,
    fontSize: 16,
  },
  optionDetail: {
    ...theme.typography.bodyMuted,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: theme.colors.primary,
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
});
