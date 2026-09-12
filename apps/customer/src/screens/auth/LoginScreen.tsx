import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
  StatusBar, Animated,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../theme';

interface LoginScreenProps {
  onNavigateRegister: () => void;
}

export default function LoginScreen({ onNavigateRegister }: LoginScreenProps) {
  const { login, loginAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
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

      {/* Maroon Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroInner}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>⚡</Text>
            </View>
          </View>
          <Text style={styles.brandName}>Quickbites</Text>
          <Text style={styles.tagline}>Bites that reach you quick!</Text>
        </View>
        {/* Decorative curve */}
        <View style={styles.curveContainer}>
          <View style={styles.curve} />
        </View>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.welcomeSub}>Sign in to continue ordering</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <Text style={styles.buttonText}>Sign In →</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={loginAsGuest}
            activeOpacity={0.85}
          >
            <Text style={styles.guestButtonText}>Explore App as Guest ⚡</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onNavigateRegister} style={styles.linkButton}>
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.linkTextBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    position: 'relative',
  },
  heroInner: { alignItems: 'center', zIndex: 2 },
  logoRow: { marginBottom: Spacing.md },
  logoBadge: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.gold,
  },
  logoEmoji: { fontSize: 32 },
  brandName: {
    fontSize: 34, fontWeight: '900', color: Colors.white,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: FontSize.md, color: Colors.accentLight,
    marginTop: Spacing.xs, fontWeight: '500',
  },
  curveContainer: {
    position: 'absolute', bottom: -1, left: 0, right: 0,
    height: 30, overflow: 'hidden',
  },
  curve: {
    position: 'absolute', bottom: 0, left: -20, right: -20,
    height: 60, borderTopLeftRadius: 999, borderTopRightRadius: 999,
    backgroundColor: Colors.background,
  },
  formSection: {
    flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg,
  },
  welcomeText: {
    fontSize: FontSize.xxl, fontWeight: '800', color: Colors.textPrimary,
  },
  welcomeSub: {
    fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 2,
    marginBottom: Spacing.xl,
  },
  form: { gap: Spacing.base },
  inputGroup: { gap: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginLeft: 2 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceWarm,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: { fontSize: 16, marginRight: Spacing.sm },
  input: {
    flex: 1, paddingVertical: Spacing.md,
    fontSize: FontSize.base, color: Colors.textPrimary,
  },
  eyeButton: { padding: Spacing.xs },
  eyeIcon: { fontSize: 16 },
  forgotButton: { alignSelf: 'flex-end' },
  forgotText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  button: {
    backgroundColor: Colors.accent, borderRadius: BorderRadius.md,
    paddingVertical: 16, alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.gold,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: '800' },
  guestButton: {
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 14, alignItems: 'center',
    backgroundColor: Colors.white,
    marginTop: Spacing.xs,
  },
  guestButtonText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '700' },
  linkButton: { alignItems: 'center', paddingVertical: Spacing.md },
  linkText: { fontSize: FontSize.md, color: Colors.textSecondary },
  linkTextBold: { color: Colors.primary, fontWeight: '700' },
});
