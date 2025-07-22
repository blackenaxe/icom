import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // AsyncStorage importu
import api from "../lib/api";

export default function IsEmriDetay({ workOrderId, onNavigate, onMessage }) {
  const [emir, setEmir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newUpdate, setNewUpdate] = useState("");
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);

  const [editingUpdateId, setEditingUpdateId] = useState(null);
  const [editUpdateText, setEditUpdateText] = useState("");

  const veriGetir = async () => {
    if (!workOrderId) {
      onMessage("Hata: Görüntülenecek iş emri ID'si bulunamadı.", "error");
      onNavigate('IsEmriListesi');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/emirler/${workOrderId}`);
      setEmir(res.data);
    } catch (err) {
      console.error("İş emri detayı alınamadı:", err);
      setError("İş emri bulunamadı veya yüklenirken bir hata oluştu.");
      onMessage("İş emri bulunamadı veya yüklenirken bir hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    veriGetir();
  }, [workOrderId]);

  const handleAddUpdate = async () => {
    setIsAddingUpdate(true);
    try {
      const token = await AsyncStorage.getItem("token"); // AsyncStorage'dan token'ı al
      if (!token) {
        onMessage("Oturum süresi doldu. Lütfen tekrar giriş yapın.", "error");
        onNavigate("Login");
        return;
      }

      await api.post(
        `/api/emirler/${workOrderId}/updates`,
        { description: newUpdate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onMessage("Güncelleme başarıyla eklendi!", "success");
      setNewUpdate("");
      await veriGetir();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Güncelleme eklenirken bir hata oluştu.";
      onMessage(errorMessage, "error");
    } finally {
      setIsAddingUpdate(false);
    }
  };

  const handleEditSubmit = async () => {
    setLoading(true);
    try {
      await api.put(`/api/updates/${editingUpdateId}`, { description: editUpdateText });
      onMessage("Güncelleme başarıyla düzenlendi!", "success");
      setEditingUpdateId(null);
      await veriGetir();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Güncelleme düzenlenirken bir hata oluştu.";
      onMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending": return "Beklemede";
      case "In Progress": return "Devam Ediyor";
      case "Completed": return "Tamamlandı";
      case "Cancelled": return "İptal Edildi";
      default: return status;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "Düşük": return "Düşük";
      case "Normal": return "Normal";
      case "Yüksek": return "Yüksek";
      default: return priority;
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Yüksek": return styles.priorityHigh;
      case "Normal": return styles.priorityNormal;
      case "Düşük": return styles.priorityLow;
      default: return styles.priorityDefault;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return styles.statusPending;
      case "In Progress": return styles.statusInProgress;
      case "Completed": return styles.statusCompleted;
      case "Cancelled": return styles.statusCancelled;
      default: return styles.statusDefault;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>İş Emri Detayları Yükleniyor...</Text>
      </View>
    );
  }

  if (error || !emir) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || "İş emri bulunamadı."}</Text>
        <Pressable onPress={() => onNavigate('IsEmriListesi')} style={styles.backButton}>
          <Text style={styles.backButtonText}>Listeye Geri Dön</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>İş Emri Detayı</Text>
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>{emir.title}</Text>
          <Text style={styles.cardDescription}>{emir.description || "Açıklama yok."}</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>İş Emri No:</Text>
              <Text style={styles.infoText}>{emir.is_emri_no}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Öncelik:</Text>
              <View style={[styles.badge, getPriorityColor(emir.priority)]}>
                <Text style={styles.badgeText}>{getPriorityLabel(emir.priority)}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Durum:</Text>
              <View style={[styles.badge, getStatusColor(emir.status)]}>
                <Text style={styles.badgeText}>{getStatusLabel(emir.status)}</Text>
              </View>
            </View>
            {emir.assigned_to_user && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Atanan Kullanıcı:</Text>
                <Text style={styles.infoText}>{emir.assigned_to_user.username}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.updatesSection}>
          <Text style={styles.sectionTitle}>Yeni Güncelleme Ekle</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={newUpdate}
            onChangeText={setNewUpdate}
            placeholder="Güncelleme notlarınızı buraya yazın..."
            multiline
            numberOfLines={3}
            required
          />
          <Pressable
            onPress={handleAddUpdate}
            disabled={isAddingUpdate || !newUpdate.trim()}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.buttonPressed,
              (isAddingUpdate || !newUpdate.trim()) && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.addButtonText}>
              {isAddingUpdate ? "Ekleniyor..." : "Güncelleme Ekle"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.updatesSection}>
          <Text style={styles.sectionTitle}>İş Emri Sicili</Text>
          {emir.updates && emir.updates.length > 0 ? (
            <View style={styles.updateList}>
              {emir.updates.map((update) => (
                <View key={update.id} style={styles.updateItem}>
                  {editingUpdateId === update.id ? (
                    <View>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={editUpdateText}
                        onChangeText={setEditUpdateText}
                        multiline
                        numberOfLines={3}
                        required
                      />
                      <View style={styles.editButtons}>
                        <Pressable
                          onPress={() => setEditingUpdateId(null)}
                          style={styles.cancelEditButton}
                        >
                          <Text style={styles.cancelEditButtonText}>İptal</Text>
                        </Pressable>
                        <Pressable
                          onPress={handleEditSubmit}
                          style={styles.saveEditButton}
                        >
                          <Text style={styles.saveEditButtonText}>Kaydet</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.updateDescription}>{update.description}</Text>
                      <View style={styles.updateFooter}>
                        <Text style={styles.updateMeta}>
                          <Text style={styles.updateUser}>
                            {update.user ? update.user.username : "Bilinmiyor"}
                          </Text>
                          {" - "}
                          {new Date(update.created_at).toLocaleString("tr-TR")}
                        </Text>
                        <Pressable
                          onPress={() => {
                            setEditingUpdateId(update.id);
                            setEditUpdateText(update.description);
                          }}
                          style={styles.editButton}
                        >
                          <Text style={styles.editButtonText}>Düzenle</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noUpdatesText}>Bu iş emri için henüz bir güncelleme bulunmamaktadır.</Text>
          )}
        </View>
        
        <View style={styles.backButtonContainer}>
          <Pressable onPress={() => onNavigate('IsEmriListesi')} style={styles.backToListButton}>
            <Text style={styles.backToListButtonText}>Listeye Geri Dön</Text>
          </Pressable>
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
  },
  container: {
    padding: 16,
    maxWidth: 600,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderTopWidth: 8,
    borderTopColor: '#2563EB',
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
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: '#374151',
    marginBottom: 24,
  },
  detailCard: {
    backgroundColor: '#F9FAFB',
    padding: 24,
    borderRadius: 8,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 8,
  },
  cardDescription: {
    color: '#4B5563',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  infoItem: {
    flexBasis: '48%', // sm:grid-cols-2
  },
  infoLabel: {
    fontWeight: '600',
    color: '#4B5563',
  },
  infoText: {
    color: '#4B5563',
  },
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  updatesSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    textAlignVertical: 'top',
    height: 90,
  },
  addButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  updateList: {
    rowGap: 16,
  },
  updateItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 2,
  },
  updateDescription: {
    color: '#374151',
    marginBottom: 8,
  },
  updateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  updateUser: {
    fontWeight: '600',
    color: '#4B5563',
  },
  editButton: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  editButtonText: {
    fontSize: 12,
    color: '#1D4ED8',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelEditButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelEditButtonText: {
    color: '#4B5563',
  },
  saveEditButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  saveEditButtonText: {
    color: '#fff',
  },
  noUpdatesText: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  backButtonContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  backToListButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backToListButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  priorityHigh: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  priorityNormal: { backgroundColor: '#FEF3C7', color: '#B45309' },
  priorityLow: { backgroundColor: '#D1FAE5', color: '#065F46' },
  priorityDefault: { backgroundColor: '#E5E7EB', color: '#4B5563' },
  statusPending: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  statusInProgress: { backgroundColor: '#FEF3C7', color: '#B45309' },
  statusCompleted: { backgroundColor: '#D1FAE5', color: '#065F46' },
  statusCancelled: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  statusDefault: { backgroundColor: '#E5E7EB', color: '#4B5563' },
});