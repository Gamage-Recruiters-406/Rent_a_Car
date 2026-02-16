
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
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const baseUrl = 'http://localhost:8090';
const apiVersion =  '/api/v1';

export const NewsLetter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string }>({
    text: '',
    type: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async () => {
    // Basic email validation
    if (!email || !validateEmail(email)) {
      setMessage({
        text: 'Please enter a valid email address',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch(
        `${baseUrl}${apiVersion}/subscription/create-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        setEmail(''); // Clear the input on success
        
        // Optional: Show native alert for success
        Alert.alert(
          'Success!',
          data.message || 'Successfully subscribed to newsletter',
          [{ text: 'OK' }]
        );
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (error) {
      setMessage({
        text: 'Failed to subscribe. Please try again later.',
        type: 'error',
      });
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Stay Updated</Text>
          <Text style={styles.subtitle}>
            Subscribe to our newsletter for exclusive deals, new vehicle
            listings, and travel tips
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#6B7280"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Subscribe Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubscribe}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>Subscribe</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Success/Error Message */}
        {message.text && (
          <View
            style={[
              styles.messageContainer,
              message.type === 'success'
                ? styles.messageSuccess
                : styles.messageError,
            ]}
          >
            <Ionicons
              name={
                message.type === 'success'
                  ? 'checkmark-circle'
                  : 'alert-circle'
              }
              size={20}
              color={message.type === 'success' ? '#059669' : '#DC2626'}
              style={styles.messageIcon}
            />
            <Text
              style={[
                styles.messageText,
                message.type === 'success'
                  ? styles.messageTextSuccess
                  : styles.messageTextError,
              ]}
            >
              {message.text}
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  content: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0d3778',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  formContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 16,
  },
  button: {
    backgroundColor: '#0d3778',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
  },
  messageSuccess: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  messageError: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  messageIcon: {
    marginRight: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextSuccess: {
    color: '#059669',
  },
  messageTextError: {
    color: '#DC2626',
  },
});