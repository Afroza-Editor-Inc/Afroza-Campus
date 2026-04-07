import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, Image, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../theme';

export default function PostCreateModal() {
  const navigation = useNavigation<any>();
  const [text, setText] = useState('');
  const slide = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const backdrop = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 0.6, duration: 220, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 320, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  }, []);

  const close = () => {
    navigation.goBack();
  };

  const handlePublish = () => {
    if (text.trim()) {
      // TODO: Send post to backend
      console.log('Publishing:', text);
      close();
    }
  };

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]} onTouchEnd={close} />
      <Animated.View
        style={[styles.container, { transform: [{ translateY: slide }] }]}
        pointerEvents="auto"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={close}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Créer une publication</Text>
          <View style={styles.spacer} />
        </View>

        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder="Quoi de neuf sur le campus ?"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
        />

        <View style={styles.preview}>
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>➕ Ajouter une image</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, !text.trim() && styles.buttonDisabled]}
          onPress={handlePublish}
          disabled={!text.trim()}
        >
          <Text style={styles.buttonText}>Publier</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  closeIcon: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  spacer: {
    width: 24,
  },
  input: {
    minHeight: 120,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    textAlignVertical: 'top',
    fontSize: 16,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  preview: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  button: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});