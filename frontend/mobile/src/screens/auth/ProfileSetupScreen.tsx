import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/ui';
import { AuthBackButton, AuthHeading } from '../../components/auth/AuthKit';
import SelectField from '../../components/auth/SelectField';
import { AuthSteps } from '../../components/auth/AuthSteps';
import theme from '../../theme';

const COUNTRIES = [
  'Sénégal', "Côte d'Ivoire", 'Mali', 'Cameroun', 'Bénin', 'Togo', 'Guinée', 'Burkina Faso', 'France', 'Maroc',
];
const ESTABLISHMENTS = [
  'Université Cheikh Anta Diop', 'Université Gaston Berger', 'Université Virtuelle (UVCI)', 'Université de Lomé', 'ESP Dakar', 'ISM Dakar',
];
const FACULTIES = [
  'Sciences et Technologies', 'Lettres et Sciences Humaines', 'Médecine', 'Droit et Sciences politiques', 'Économie et Gestion', 'Arts',
];
const PROGRAMS = [
  'Informatique', 'Génie logiciel', 'Réseaux & Télécoms', 'Marketing', 'Finance', 'Droit des affaires', 'Médecine générale', 'Design',
];
const LEVELS = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Doctorat'];

export default function ProfileSetupScreen({ navigation }: any) {
  const [country, setCountry] = React.useState<string | null>(null);
  const [establishment, setEstablishment] = React.useState<string | null>(null);
  const [faculty, setFaculty] = React.useState<string | null>(null);
  const [program, setProgram] = React.useState<string | null>(null);
  const [level, setLevel] = React.useState<string | null>(null);

  const complete = Boolean(country && establishment && faculty && program && level);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthBackButton onPress={() => navigation.goBack()} />
        <AuthSteps total={3} current={1} />

        <AuthHeading
          title="Votre parcours étudiant"
          subtitle="Ces informations personnalisent vos communautés et suggestions."
        />

        <View style={styles.form}>
          <SelectField icon="earth-outline" placeholder="Pays" value={country} options={COUNTRIES} onSelect={setCountry} />
          <SelectField icon="school-outline" placeholder="Établissement" value={establishment} options={ESTABLISHMENTS} onSelect={setEstablishment} />
          <SelectField icon="business-outline" placeholder="Faculté" value={faculty} options={FACULTIES} onSelect={setFaculty} />
          <SelectField icon="book-outline" placeholder="Filière" value={program} options={PROGRAMS} onSelect={setProgram} />
          <SelectField icon="ribbon-outline" placeholder="Niveau académique" value={level} options={LEVELS} onSelect={setLevel} />
        </View>

        <AppButton
          label="Continuer"
          disabled={!complete}
          onPress={() => navigation.navigate('ProfileDetails')}
        />
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
  form: {
    gap: theme.spacing.md,
  },
});
