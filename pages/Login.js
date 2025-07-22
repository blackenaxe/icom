import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import api from "../lib/api";
import qs from "qs";
import Storage from "../lib/storage"; // ✅ storage.js dosyasını kullanıyoruz

export default function Login({ onLogin, onNavigate, onMessage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Sadece debug amaçlı kontrol (gerekirse)
  useEffect(() => {
    if (!Storage || typeof Storage.getItem !== "function") {
      console.error("Storage modülü geçerli değil!");
    } else {
      console.log("Storage kullanılabilir durumda.");
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);

    if (!username || !password) {
      onMessage("Kullanıcı adı ve şifre zorunludur.", "error");
      setLoading(false);
      return;
    }

    const formData = {
      username: username.trim(),
      password: password,
    };

    console.log("Gönderilen login verisi:", formData);

    try {
      const loginRes = await api.post(
        "/api/login",
        qs.stringify(formData),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const token = loginRes.data.access_token;
      await Storage.setItem("token", token); // ✅ Storage kullanıldı

      const userRes = await api.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = userRes.data;
      await Storage.setItem("user", JSON.stringify(userData)); // ✅ Storage kullanıldı
      onLogin(userData);
      onMessage("Giriş başarılı!", "success");
      onNavigate("Dashboard");
    } catch (err) {
      console.error("Giriş başarısız (ham hata):", err.response?.data || err.message);

      let rawErrorMessage = "Giriş başarısız oldu!";

      if (err.response && err.response.data) {
        const resData = err.response.data;
        if (Array.isArray(resData.detail)) {
          rawErrorMessage = resData.detail
            .map((d) => (d.msg ? d.msg : JSON.stringify(d)))
            .join("\n");
        } else if (typeof resData.detail === "string") {
          rawErrorMessage = resData.detail;
        } else {
          rawErrorMessage = JSON.stringify(resData);
        }
      } else if (err.message) {
        rawErrorMessage = err.message;
      }

      onMessage(String(rawErrorMessage), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.title}>Giriş Yap</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Kullanıcı Adı</Text>
          <TextInput
            style={styles.input}
            onChangeText={setUsername}
            value={username}
            placeholder="Kullanıcı Adı"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            placeholder="Şifre"
            secureTextEntry
          />
        </View>

        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.loginButton,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          )}
        </Pressable>

        <View style={styles.registerTextContainer}>
          <Text style={styles.registerText}>
            Hesabınız yok mu?{" "}
            <Text
              onPress={() => onNavigate("Register")}
              style={styles.registerLink}
            >
              Kayıt Ol
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#E0F2F7",
  },
  container: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 16,
    width: "90%",
    maxWidth: 380,
    alignSelf: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#374151",
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    fontSize: 16,
    color: "#374151",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 1.02 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  registerTextContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  registerText: {
    textAlign: "center",
    color: "#4B5563",
    fontSize: 14,
  },
  registerLink: {
    color: "#2563EB",
    fontWeight: "600",
  },
});
