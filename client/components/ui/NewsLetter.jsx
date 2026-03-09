import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

 const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const API_VERSION = process.env.EXPO_PUBLIC_API_VERSION;

export const NewsLetter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubscribe = async () => {
    if (!email || !validateEmail(email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_VERSION}/subscription/create-subscription`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();

      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        setEmail('');
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch {
      setMessage({ text: 'Failed to subscribe. Please try again later.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Stay Updated</Text>
          <Text style={styles.subtitle}>
            Subscribe to our newsletter for exclusive deals, new vehicle listings, and travel tips
          </Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>✉️</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            onSubmitEditing={handleSubscribe}
            returnKeyType="send"
          />
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeBtn, loading && styles.subscribeBtnDisabled]}
          onPress={handleSubscribe}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={styles.btnInner}>
              <Text style={styles.btnText}>Subscribe</Text>
              <Text style={styles.btnArrow}>→</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Success / Error Message */}
        {message.text ? (
          <View
            style={[
              styles.messageBanner,
              message.type === 'success' ? styles.successBanner : styles.errorBanner,
            ]}
          >
            <Text style={styles.messageIcon}>
              {message.type === 'success' ? '✅' : '⚠️'}
            </Text>
            <Text
              style={[
                styles.messageText,
                message.type === 'success' ? styles.successText : styles.errorText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0d3778', marginBottom: 16 },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 16,
  },
  subscribeBtn: {
    backgroundColor: '#0d3778',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#0d3778',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  subscribeBtnDisabled: { opacity: 0.5 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  btnArrow: { color: '#fff', fontSize: 18 },
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    gap: 10,
  },
  successBanner: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  errorBanner: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  messageIcon: { fontSize: 16 },
  messageText: { flex: 1, fontSize: 13, lineHeight: 20 },
  successText: { color: '#16a34a' },
  errorText: { color: '#dc2626' },
});