import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import api from "../lib/api";

export default function IsEmriListesi({ onNavigate, onMessage }) {
  const [emirler, setEmirler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const veriGetir = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/emirler");
      setEmirler(res.data);
    } catch (err) {
      console.error("Veri alınamadı:", err);
      setError("İş emirleri yüklenirken bir hata oluştu.");
      onMessage("İş emirleri yüklenirken bir hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    veriGetir();
  }, []);

  const handleSil = (id) => {
    Alert.alert(
      "İş Emri Silme",
      "Bu iş emrini silmek istediğinizden emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Sil",
          onPress: async () => {
            try {
              await api.delete(`/api/emirler/${id}`);
              setEmirler(emirler.filter((e) => e.id !== id));
              onMessage("İş emri başarıyla silindi!", "success");
            } catch (err) {
              console.error("Silme hatası:", err);
              const errorMessage = err.response?.data?.detail || "Silme işlemi başarısız oldu.";
              setError(errorMessage);
              onMessage(errorMessage, "error");
            }
          }
        }
      ]
    );
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return styles.statusPending;
      case "In Progress": return styles.statusInProgress;
      case "Completed": return styles.statusCompleted;
      case "Cancelled": return styles.statusCancelled;
      default: return styles.statusDefault;
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

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>İş Emirleri Listesi</Text>
      
      <Pressable
        onPress={() => onNavigate('IsEmriEkle')}
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>+ Yeni İş Emri Oluştur</Text>
      </Pressable>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={veriGetir}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </Pressable>
        </View>
      ) : emirler.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Henüz iş emri yok.</Text>
          <Text style={styles.emptySubtitle}>Başlamak için yukarıdan bir tane ekleyin.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContainer}>
          {emirler.map((emir) => (
            <Pressable
              key={emir.id}
              onPress={() => onNavigate('IsEmriDetay', emir.id)}
              style={styles.listItem}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  <Text style={styles.itemNo}>{emir.is_emri_no}</Text>
                  {emir.title}
                </Text>
                <View style={[styles.priorityBadge, getPriorityColor(emir.priority)]}>
                  <Text style={styles.priorityText}>Öncelik: {getPriorityLabel(emir.priority)}</Text>
                </View>
              </View>

              <Text style={styles.itemDescription}>{emir.description}</Text>

              <View style={styles.itemFooter}>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Durum: </Text>
                  <View style={[styles.statusBadge, getStatusColor(emir.status)]}>
                    <Text style={styles.statusText}>{getStatusLabel(emir.status)}</Text>
                  </View>
                </View>

                {emir.assigned_to_user && (
                  <View>
                    <Text style={styles.infoLabel}>Atanan: <Text style={styles.infoText}>{emir.assigned_to_user.username}</Text></Text>
                  </View>
                )}
                <View>
                  <Text style={styles.infoLabel}>Oluşturulma: <Text style={styles.infoText}>{new Date(emir.created_at).toLocaleString("tr-TR")}</Text></Text>
                </View>
                {emir.updated_at && (
                  <View>
                    <Text style={styles.infoLabel}>Güncellenme: <Text style={styles.infoText}>{new Date(emir.updated_at).toLocaleString("tr-TR")}</Text></Text>
                  </View>
                )}
              </View>

              <View style={styles.actionButtons}>
                <Pressable
                  onPress={() => onNavigate('IsEmriDuzenle', emir.id)}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>Düzenle</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleSil(emir.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Sil</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB', // bg-gray-50
  },
  headerTitle: {
    fontSize: 28, // text-3xl
    fontWeight: '800', // font-extrabold
    textAlign: 'center',
    marginBottom: 32, // mb-8
    color: '#1E40AF', // text-blue-800
  },
  createButton: {
    backgroundColor: '#16A34A', // bg-green-600
    paddingVertical: 12, // py-3
    paddingHorizontal: 24, // px-6
    borderRadius: 8, // rounded-lg
    marginBottom: 24, // mb-6
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 10,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 16,
    backgroundColor: '#FEF2F2', // bg-red-50
    borderWidth: 1,
    borderColor: '#FCA5A5', // border-red-300
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626', // text-red-600
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#EF4444', // bg-red-500
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  emptySubtitle: {
    fontSize: 16,
    marginTop: 8,
    color: '#9CA3AF',
  },
  listContainer: {
    rowGap: 16, // gap-4
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 16, // rounded-xl
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 20, // p-5
    borderLeftWidth: 8,
    borderLeftColor: '#3B82F6', // border-blue-500
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    flexShrink: 1,
    flexGrow: 1,
  },
  itemNo: {
    color: '#2563EB',
    fontFamily: 'monospace',
    marginRight: 12,
    fontSize: 18,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 8,
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  infoText: {
    fontWeight: '500',
    color: '#4B5563',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    columnGap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  editButton: {
    backgroundColor: '#DBEAFE', // bg-blue-100
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#1D4ED8', // text-blue-700
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#FEE2E2', // bg-red-100
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#B91C1C', // text-red-700
    fontSize: 14,
  },
  // Durum renkleri
  statusPending: { backgroundColor: '#FEF3C7', color: '#B45309' }, // bg-yellow-100 text-yellow-800
  statusInProgress: { backgroundColor: '#DBEAFE', color: '#1D4ED8' }, // bg-blue-100 text-blue-800
  statusCompleted: { backgroundColor: '#D1FAE5', color: '#065F46' }, // bg-green-100 text-green-800
  statusCancelled: { backgroundColor: '#FEE2E2', color: '#B91C1C' }, // bg-red-100 text-red-800
  statusDefault: { backgroundColor: '#E5E7EB', color: '#4B5563' }, // bg-gray-100 text-gray-800
  // Öncelik renkleri
  priorityHigh: { backgroundColor: '#FEE2E2', color: '#B91C1C' }, // bg-red-100 text-red-800
  priorityNormal: { backgroundColor: '#FEF3C7', color: '#B45309' }, // bg-yellow-100 text-yellow-800
  priorityLow: { backgroundColor: '#D1FAE5', color: '#065F46' }, // bg-green-100 text-green-800
  priorityDefault: { backgroundColor: '#E5E7EB', color: '#4B5563' }, // bg-gray-100 text-gray-800
  });