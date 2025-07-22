import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, ScrollView, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker';
import api from "../lib/api";

export default function IsEmriDuzenle({ workOrderId, onNavigate, onMessage }) {
  const id = workOrderId;

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Normal",
    status: "Pending",
    assigned_user_id: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!id) {
      onMessage("Hata: Düzenlenecek iş emri ID'si bulunamadı.", "error");
      onNavigate('IsEmriListesi');
      return;
    }

    setLoading(true);
    setError(null);

    const fetchWorkOrderAndUsers = async () => {
      try {
        const [workOrderRes, usersRes] = await Promise.all([
          api.get(`/api/emirler/${id}`),
          api.get('/api/users')
        ]);

        setForm({
          title: workOrderRes.data.title || "",
          description: workOrderRes.data.description || "",
          priority: workOrderRes.data.priority || "Normal",
          status: workOrderRes.data.status || "Pending",
          assigned_user_id: workOrderRes.data.assigned_user_id || null,
        });
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Veri alınamadı:", err);
        const errorMessage = err.response?.data?.detail || "İş emri bulunamadı veya yüklenirken bir hata oluştu.";
        setError(errorMessage);
        onMessage(errorMessage, "error");
        onNavigate('IsEmriListesi');
      } finally {
        setLoading(false);
        setLoadingUsers(false);
      }
    };
    
    fetchWorkOrderAndUsers();
  }, [id, onNavigate, onMessage]);

  const handleChange = (name, value) => {
    setForm(prevForm => ({
      ...prevForm,
      [name]: value === "" ? null : value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    try {
      await api.put(`/api/emirler/${id}`, form);
      onMessage("İş emri başarıyla güncellendi!", "success");
      onNavigate('IsEmriListesi');
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      const errorMessage = error.response?.data?.detail || "Güncelleme başarısız oldu!";
      setError(errorMessage);
      onMessage(errorMessage, "error");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable
          onPress={() => onNavigate('IsEmriListesi')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Listeye Geri Dön</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>İş Emrini Düzenle</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Başlık</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => handleChange("title", text)}
            value={form.title}
            placeholder="İş emri başlığı"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            onChangeText={(text) => handleChange("description", text)}
            value={form.description}
            placeholder="İş emri açıklaması"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Öncelik</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.priority}
              onValueChange={(itemValue) => handleChange("priority", itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Düşük" value="Düşük" />
              <Picker.Item label="Normal" value="Normal" />
              <Picker.Item label="Yüksek" value="Yüksek" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Durum</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.status}
              onValueChange={(itemValue) => handleChange("status", itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Beklemede" value="Pending" />
              <Picker.Item label="Devam Ediyor" value="In Progress" />
              <Picker.Item label="Tamamlandı" value="Completed" />
              <Picker.Item label="İptal Edildi" value="Cancelled" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Atanan Kullanıcı</Text>
          {loadingUsers ? (
            <ActivityIndicator size="small" color="#6B7280" style={styles.loadingUsersIndicator} />
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.assigned_user_id}
                onValueChange={(itemValue) => handleChange("assigned_user_id", itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Atanmamış" value={null} />
                {users.map(user => (
                  <Picker.Item key={user.id} label={user.username} value={user.id} />
                ))}
              </Picker>
            </View>
          )}
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Kaydet</Text>
        </Pressable>
        <Pressable
          onPress={() => onNavigate('IsEmriListesi')}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>İptal</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  container: {
    padding: 16,
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#374151',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#2563EB',
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 18,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingUsersIndicator: {
    marginTop: 10,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    width: '100%',
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});