import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
  StatusBar, Animated,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

interface RegisterScreenProps {
  onNavigateLogin: () => void;
}

export default function RegisterScreen({ onNavigateLogin }: RegisterScreenProps) {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    try {
      setLoading(true);
      await register({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password });
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Maroon Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroInner}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>⚡</Text>
            </View>
            <Text style={styles.brandName}>Quickbites</Text>
            <Text style={styles.tagline}>Bites that reach you quick!</Text>
          </View>
          <View style={styles.curveContainer}>
            <View style={styles.curve} />
          </View>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.welcomeSub}>Join Quickbites and order delicious food</Text>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>First Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} placeholder="John" placeholderTextColor={Colors.textMuted}
                    value={firstName} onChangeText={setFirstName} />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput style={styles.input} placeholder="Doe" placeholderTextColor={Colors.textMuted}
                    value={lastName} onChangeText={setLastName} />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor={Colors.textMuted}
                  value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput style={styles.input} placeholder="Min 8 characters" placeholderTextColor={Colors.textMuted}
                  value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
                activeOpacity={0.9}
              >
                {loading ? <ActivityIndicator color={Colors.primary} /> : <Text style={styles.buttonText}>Create Account →</Text>}
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity onPress={onNavigateLogin} style={styles.linkButton}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1 },
  hero: {
    backgroundColor: Colors.primary,
    paddingTop: 56, paddingBottom: 36,
    alignItems: 'center', position: 'relative',
  },
  heroInner: { alignItems: 'center', zIndex: 2 },
  logoBadge: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: Colors.accent,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.gold,
  },
  logoEmoji: { fontSize: 28 },
  brandName: { fontSize: 28, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
  tagline: { fontSize: FontSize.sm, color: Colors.accentLight, marginTop: 2, fontWeight: '500' },
  curveContainer: {
    position: 'absolute', bottom: -1, left: 0, right: 0,
    height: 28, overflow: 'hidden',
  },
  curve: {
    position: 'absolute', bottom: 0, left: -20, right: -20,
    height: 56, borderTopLeftRadius: 999, borderTopRightRadius: 999,
    backgroundColor: Colors.background,
  },
  formSection: {
    flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  welcomeText: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary },
  welcomeSub: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 2, marginBottom: Spacing.lg },
  form: { gap: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.sm },
  inputGroup: { gap: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginLeft: 2 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceWarm, paddingHorizontal: Spacing.md,
  },
  inputIcon: { fontSize: 16, marginRight: Spacing.sm },
  input: {
    flex: 1, paddingVertical: Spacing.md,
    fontSize: FontSize.base, color: Colors.textPrimary,
  },
  eyeButton: { padding: Spacing.xs },
  eyeIcon: { fontSize: 16 },
  button: {
    backgroundColor: Colors.accent, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center',
    marginTop: Spacing.sm, ...Shadows.gold,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '800' },
  linkButton: { alignItems: 'center', paddingVertical: Spacing.md },
  linkText: { fontSize: FontSize.md, color: Colors.textSecondary },
  linkBold: { color: Colors.primary, fontWeight: '700' },
});
