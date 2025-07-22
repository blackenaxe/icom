import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function Dashboard({ onNavigate }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoş Geldiniz!</Text>
      <Text style={styles.subtitle}>İşlemlerinize başlamak için aşağıdaki menüyü kullanın.</Text>
      
      <View style={styles.buttonGroup}>
        <Pressable
          onPress={() => onNavigate('IsEmriListesi')}
          style={styles.viewButton}
        >
          <Text style={styles.buttonText}>İş Emirlerini Görüntüle</Text>
        </Pressable>
        <Pressable
          onPress={() => onNavigate('IsEmriEkle')}
          style={styles.addButton}
        >
          <Text style={styles.buttonText}>Yeni İş Emri Ekle</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6', // Hafif gri arka plan
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#374151', // Koyu gri metin
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280', // Orta gri metin
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonGroup: {
    flexDirection: 'column',
    gap: 15, // Düğmeler arasında boşluk
    width: '80%', // Düğme grubunun genişliği
    maxWidth: 300, // Maksimum genişlik
  },
  viewButton: {
    backgroundColor: '#2563EB', // Mavi düğme
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', // Gölge efektleri
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButton: {
    backgroundColor: '#10B981', // Yeşil düğme
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', // Gölge efektleri
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF', // Beyaz metin
    fontSize: 18,
    fontWeight: '600',
  },
});
