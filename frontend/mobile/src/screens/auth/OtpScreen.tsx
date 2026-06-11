import React from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/ui';
import { AuthBackButton, AuthHeading } from '../../components/auth/AuthKit';
import theme from '../../theme';

const CODE_LENGTH = 4;
const RESEND_SECONDS = 59;

export default function OtpScreen({ navigation, route }: any) {
  const method = route?.params?.method === 'email' ? 'email' : 'sms';
  const [digits, setDigits] = React.useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [seconds, setSeconds] = React.useState(RESEND_SECONDS);
  const inputs = React.useRef<Array<TextInput | null>>([]);

  React.useEffect(() => {
    if (seconds <= 0) {
      return;
    }
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/[^0-9]/g, '').slice(-1);
    setDigits((current) => {
      const nextDigits = [...current];
      nextDigits[index] = char;
      return nextDigits;
    });
    if (char && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const resend = () => {
    setDigits(Array(CODE_LENGTH).fill(''));
    setSeconds(RESEND_SECONDS);
    inputs.current[0]?.focus();
  };

  const isComplete = digits.every((digit) => digit.length === 1);
  const destination = method === 'email' ? 'votre adresse email' : 'votre téléphone';
  const timerLabel = `0:${seconds.toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <AuthBackButton onPress={() => navigation.goBack()} />

        <AuthHeading
          title="Code de vérification"
          subtitle={`Saisissez le code à ${CODE_LENGTH} chiffres envoyé sur ${destination}.`}
        />

        <View style={styles.codeRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(node) => {
                inputs.current[index] = node;
              }}
              value={digit}
              onChangeText={(value) => handleChange(index, value)}
              onKeyPress={(event) => handleKeyPress(index, event)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={index === 0}
              style={[styles.codeBox, digit ? styles.codeBoxFilled : null]}
            />
          ))}
        </View>

        <View style={styles.resendRow}>
          {seconds > 0 ? (
            <Text style={styles.resendMuted}>Renvoyer le code dans {timerLabel}</Text>
          ) : (
            <Pressable hitSlop={theme.accessibility.hitSlop} onPress={resend}>
              <Text style={styles.resendLink}>Renvoyer le code</Text>
            </Pressable>
          )}
        </View>

        <AppButton
          label="Vérifier"
          disabled={!isComplete}
          onPress={() => navigation.navigate('NewPassword')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.xl,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  codeBox: {
    width: 64,
    height: 68,
    borderRadius: theme.radii.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textStrong,
  },
  codeBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  resendRow: {
    alignItems: 'center',
  },
  resendMuted: {
    ...theme.typography.bodyMuted,
  },
  resendLink: {
    ...theme.typography.label,
    color: theme.colors.primary,
    fontSize: 15,
  },
});
