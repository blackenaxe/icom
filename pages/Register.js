import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import api from '../lib/api';

export default function Register({ onNavigate, onMessage }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await api.post('/api/register', {
        username,
        email,
        password,
      });

      const successMsg = response?.data?.message || 'Kayıt başarılı!';
      onMessage(successMsg, 'success');
      onNavigate('Login');
    } catch (error) {
      console.error('Kayıt hatası:', error.response?.data || error.message);

      let rawErrorMessage = 'Kayıt başarısız: Bir hata oluştu.';

      const responseData = error.response?.data;
      if (Array.isArray(responseData?.detail)) {
        rawErrorMessage = responseData.detail
          .map((item) =>
            typeof item === 'object' && item.msg
              ? String(item.msg)
              : typeof item === 'string'
              ? item
              : JSON.stringify(item)
          )
          .join('\n');
      } else if (typeof responseData?.detail === 'string') {
        rawErrorMessage = responseData.detail;
      } else if (typeof responseData === 'string') {
        rawErrorMessage = responseData;
      } else if (responseData) {
        rawErrorMessage = JSON.stringify(responseData);
      } else if (error.message) {
        rawErrorMessage = error.message;
      }

      onMessage(rawErrorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.title}>Kayıt Ol</Text>

        <View style={styles.form}>
          <View>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı Adı"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="E-posta"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            onPress={handleRegister}
            style={({ pressed }) => [
              styles.registerButton,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Kayıt Ol</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Zaten hesabınız var mı?{' '}
            <Pressable onPress={() => onNavigate('Login')}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </Pressable>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#F3F4F6',
  },
  container: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 8,
    elevation: 4,
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#374151',
    marginBottom: 24,
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    fontSize: 16,
  },
  registerButton: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    elevation: 3,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    textAlign: 'center',
    color: '#4B5563',
  },
  loginLink: {
    color: '#2563EB',
    fontWeight: '500',
  },
});
