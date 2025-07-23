import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, ScrollView, Alert, Platform } from 'react-native'; // Platform import edildi
import { Picker } from '@react-native-picker/picker';
import api from '../lib/api';

export default function IsEmriDuzenle({ workOrderId, onNavigate, onMessage }) {
  const [workOrder, setWorkOrder] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!workOrderId) {
        onMessage("İş Emri ID bulunamadı.", "error");
        onNavigate('IsEmriListesi');
        return;
      }

      try {
        const usersRes = await api.get('/api/users');
        setUsers(usersRes.data);

        const workOrderRes = await api.get(`/api/emirler/${workOrderId}`);
        const data = workOrderRes.data;
        setWorkOrder(data);
        setTitle(data.title);
        setDescription(data.description);
        setStatus(data.status);
        setAssignedTo(data.assigned_to || '');
      } catch (err) {
        console.error("İş emri veya kullanıcılar alınamadı:", err.response?.data || err.message);
        onMessage(err.response?.data?.detail || err.message || "İş emri detayları alınamadı.", "error");
        onNavigate('IsEmriListesi');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workOrderId, onMessage, onNavigate]);

  const handleSave = async () => {
    if (!title || !description || !status || !assignedTo) {
      onMessage("Lütfen tüm alanları doldurun.", "error");
      return;
    }

    setSaving(true);
    try {
      const updatedWorkOrder = {
        title,
        description,
        status,
        assigned_to: assignedTo,
      };
      await api.put(`/api/emirler/${workOrderId}`, updatedWorkOrder);
      onMessage("İş emri başarıyla güncellendi!", "success");
      onNavigate('IsEmriListesi');
    } catch (err) {
      console.error("İş emri güncellenirken hata:", err.response?.data || err.message);
      onMessage(err.response?.data?.detail || err.message || "İş emri güncellenirken bir hata oluştu.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    // DÜZELTME BAŞLANGICI: Platforma özel onay mekanizması
    const confirmDelete = async () => {
      setSaving(true);
      try {
        await api.delete(`/api/emirler/${workOrderId}`);
        onMessage("İş emri başarıyla silindi.", "success");
        onNavigate('IsEmriListesi');
      } catch (err) {
        console.error("İş emri silinirken hata:", err.response?.data || err.message);
        onMessage(err.response?.data?.detail || err.message || "İş emri silinirken bir hata oluştu.", "error");
      } finally {
        setSaving(false);
      }
    };

    if (Platform.OS === 'web') {
      // Web için window.confirm kullan
      if (window.confirm("Bu iş emrini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
        confirmDelete();
      }
    } else {
      // Mobil için Alert.alert kullan
      Alert.alert(
        "İş Emrini Sil",
        "Bu iş emrini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
        [
          {
            text: "İptal",
            style: "cancel",
          },
          {
            text: "Sil",
            onPress: confirmDelete, // Onaylandığında silme işlemini çağır
            style: "destructive",
          },
        ],
        { cancelable: false }
      );
    }
    // DÜZELTME SONU
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>İş emri yükleniyor...</Text>
      </View>
    );
  }

  if (!workOrder) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>İş emri bulunamadı veya yüklenemedi.</Text>
        <Pressable onPress={() => onNavigate('IsEmriListesi')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Listeye Geri Dön</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.title}>İş Emri Düzenle</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Başlık</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="İş Emri Başlığı"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="İş Emri Açıklaması"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Durum</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => setStatus(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Beklemede" value="pending" />
              <Picker.Item label="Devam Ediyor" value="in_progress" />
              <Picker.Item label="Tamamlandı" value="completed" />
              <Picker.Item label="İptal Edildi" value="cancelled" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Atanan Kişi</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={assignedTo}
              onValueChange={(itemValue) => setAssignedTo(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Seçiniz..." value="" />
              {users.map(user => (
                <Picker.Item key={user.id} label={user.username} value={user.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.buttonPressed,
              saving && styles.buttonDisabled,
            ]}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Kaydet</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => onNavigate('IsEmriListesi')}
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.buttonPressed,
            ]}
            disabled={saving}
          >
            <Text style={styles.buttonText}>İptal</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.buttonPressed,
            saving && styles.buttonDisabled,
          ]}
          disabled={saving}
        >
          <Text style={styles.buttonText}>İş Emrini Sil</Text>
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
    backgroundColor: '#F3F4F6',
  },
  container: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: '95%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2563EB',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#1F2937',
  },
  pickerItem: {
    fontSize: 16,
    color: '#1F2937',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4B5563',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
