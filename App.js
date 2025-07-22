import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import Toast from './lib/toast';
import storage from './lib/storage'; // ✅ platform uyumlu storage
import api from './lib/api';

// Sayfaları import ediyoruz
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IsEmriListesi from './pages/IsEmriListesi';
import IsEmriEkle from './pages/IsEmriEkle';
import IsEmriDuzenle from './pages/IsEmriDuzenle';
import IsEmriDetay from './pages/IsEmriDetay';
import Register from './pages/Register';

export default function App() {
  const [currentPage, setCurrentPage] = useState('Login');
  const [currentWorkOrderId, setCurrentWorkOrderId] = useState(null);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);

  const handleLogin = async (userData) => {
    setUser(userData);
    await storage.setItem('user', JSON.stringify(userData));
    setCurrentPage('Dashboard');
    fetchNotifications();
  };

  const handleLogout = async () => {
    await storage.removeItem('token');
    await storage.removeItem('user');
    setUser(null);
    setCurrentPage('Login');
  };

  const handleNavigate = (page, id = null) => {
    console.log(`Navigating to: ${page}`);
    setCurrentPage(page);
    setCurrentWorkOrderId(id);
    if (user) fetchNotifications();
  };

  const onMessage = (message, type) => {
    let parsedMessage = 'Bilinmeyen bir hata oluştu.';

    if (typeof message === 'object' && message !== null) {
      if (message.detail) {
        if (Array.isArray(message.detail)) {
          parsedMessage = message.detail.map((e) =>
            typeof e === 'object' && e.msg ? e.msg : JSON.stringify(e)
          ).join('\n');
        } else {
          parsedMessage = message.detail;
        }
      } else {
        parsedMessage = JSON.stringify(message);
      }
    } else if (typeof message === 'string') {
      parsedMessage = message;
    }

    Toast.show({ type, text1: parsedMessage });
  };

  const fetchNotifications = async () => {
    try {
      const token = await storage.getItem('token');
      if (!token) return;

      const res = await api.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Bildirimler alınamadı:', err);
      onMessage(err.response?.data || err.message, 'error');
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = await storage.getItem('token');
      if (!token) return;

      await api.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error('Bildirim okundu hatası:', err);
      onMessage(err.response?.data || err.message, 'error');
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = await storage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setCurrentPage('Dashboard');
        fetchNotifications();
      }
    };
    checkUser();
  }, []);

  const unseenNotificationsCount = notifications.filter(n => !n.is_read).length;

  const renderPage = () => {
    const props = { onNavigate: handleNavigate, onMessage };
    switch (currentPage) {
      case 'Login':
        return <Login {...props} onLogin={handleLogin} />;
      case 'Dashboard':
        return <Dashboard {...props} />;
      case 'IsEmriListesi':
        return <IsEmriListesi {...props} />;
      case 'IsEmriEkle':
        return <IsEmriEkle {...props} />;
      case 'IsEmriDuzenle':
        return <IsEmriDuzenle workOrderId={currentWorkOrderId} {...props} />;
      case 'IsEmriDetay':
        return <IsEmriDetay workOrderId={currentWorkOrderId} {...props} />;
      case 'Register':
        return <Register {...props} />;
      default:
        return <Login {...props} onLogin={handleLogin} />;
    }
  };

  return (
    <View style={styles.appContainer}>
      {user && (
        <View style={styles.header}>
          <View style={styles.navContainer}>
            <Text style={styles.title}>İş Emri Yönetimi</Text>
            <View style={styles.buttonContainer}>
              <View style={styles.relativeView}>
                <Pressable onPress={() => setIsNotificationMenuOpen(true)} style={styles.bellButton}>
                  <Text style={styles.iconPlaceholder}>🔔</Text>
                </Pressable>
                {unseenNotificationsCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationCount}>{unseenNotificationsCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.welcomeText}>Hoş Geldin, {user.username}</Text>
              <Pressable onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent
        visible={isNotificationMenuOpen}
        onRequestClose={() => setIsNotificationMenuOpen(false)}
      >
        <View style={styles.modalOverlay} onTouchStart={() => setIsNotificationMenuOpen(false)}>
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bildirimler</Text>
              <Pressable onPress={() => setIsNotificationMenuOpen(false)}>
                <Text style={styles.modalCloseButton}>X</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.notificationList}>
              {notifications.length ? (
                notifications.map(n => (
                  <Pressable
                    key={n.id}
                    onPress={() => {
                      markNotificationAsRead(n.id);
                      setIsNotificationMenuOpen(false);
                    }}
                    style={n.is_read ? styles.readNotification : styles.unreadNotification}
                  >
                    <Text style={n.is_read ? styles.readText : styles.unreadText}>{n.message}</Text>
                    <Text style={styles.notificationDate}>{new Date(n.created_at).toLocaleString("tr-TR")}</Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.noNotificationText}>Yeni bildiriminiz yok.</Text>
              )}
            </ScrollView>
          </Pressable>
        </View>
      </Modal>

      <View style={styles.mainContent}>{renderPage()}</View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: '#fff' },
  navContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2563EB' },
  buttonContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  relativeView: { position: 'relative' },
  bellButton: {
    padding: 8, borderRadius: 9999, backgroundColor: '#fff',
  },
  iconPlaceholder: { fontSize: 18 },
  notificationBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#DC2626', borderRadius: 9999,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  notificationCount: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  welcomeText: { color: '#4B5563', fontSize: 14 },
  logoutButton: {
    backgroundColor: '#E5E7EB', paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 8,
  },
  logoutButtonText: { color: '#4B5563', fontSize: 14 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    width: '90%', maxWidth: 400, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  modalCloseButton: { fontSize: 20, color: '#6B7280' },
  notificationList: { paddingVertical: 8 },
  readNotification: {
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  unreadNotification: {
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  readText: { color: '#6B7280' },
  unreadText: { fontWeight: 'bold', color: '#1F2937' },
  notificationDate: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  noNotificationText: {
    padding: 16, textAlign: 'center', color: '#6B7280',
  },
  mainContent: { flex: 1 },
});
<Toast />