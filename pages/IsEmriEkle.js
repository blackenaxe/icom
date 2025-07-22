import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import { Picker } from '@react-native-picker/picker'; // Picker bileşeni için import
import api from "../lib/api"; // Axios API istemciniz

// Ekran boyutlarını almak için Dimensions API'yi kullanıyoruz
const { width } = Dimensions.get('window');

export default function IsEmriEkle({ onNavigate, onMessage }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Normal",
    status: "Pending",
    assigned_user_id: null,
  });

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoadingUsers(true);
    api.get('/api/users')
      .then(res => {
        setUsers(res.data);
        // İlk kullanıcıyı varsayılan olarak atayabiliriz veya null bırakabiliriz
        // Eğer atanmamış seçeneği yoksa ve kullanıcı varsa ilkini seçmek iyi bir pratik olabilir.
        if (res.data.length > 0 && form.assigned_user_id === null) {
          setForm(prevForm => ({ ...prevForm, assigned_user_id: res.data[0].id }));
        }
        setLoadingUsers(false);
      })
      .catch(err => {
        console.error("Kullanıcı listesi alınamadı:", err);
        onMessage("Kullanıcı listesi yüklenirken hata oluştu.", "warning");
        setLoadingUsers(false);
      });
  }, []);

  const handleChange = (name, value) => {
    setForm(prevForm => ({
      ...prevForm,
      [name]: value === "" ? null : value, // Boş string yerine null atama
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await api.post("/api/emirler", form);
      onMessage("Yeni iş emri başarıyla eklendi!", "success");
      onNavigate('IsEmriListesi');
    } catch (error) {
      console.error("İş emri ekleme hatası:", error.response?.data || error.message);
      // Hata mesajını daha detaylı işleyelim
      let errorMessage = "İş emri eklenirken bir hata oluştu!";
      if (error.response && error.response.data && error.response.data.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(errDetail => {
            if (errDetail && typeof errDetail.msg === 'string') {
              return errDetail.msg;
            } else {
              return JSON.stringify(errDetail);
            }
          }).join('\n');
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else {
          errorMessage = JSON.stringify(error.response.data.detail);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      onMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Yeni İş Emri Oluştur</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Başlık</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => handleChange("title", text)}
            value={form.title}
            placeholder="İş emri başlığı"
            // required prop'u React Native TextInput için doğrudan geçerli değildir,
            // ancak backend doğrulaması için önemlidir.
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
              itemStyle={styles.pickerItem}
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
              itemStyle={styles.pickerItem}
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
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Atanmamış" value={null} />
                {users.map(user => (
                  <Picker.Item key={String(user.id)} label={user.username} value={user.id} />
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

        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "İş Emri Ekleniyor..." : "İş Emri Ekle"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onNavigate('IsEmriListesi')}
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.cancelButtonText}>İptal</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1, // İçeriğin tüm dikey alanı kaplamasını sağlar
    justifyContent: 'center', // İçeriği dikeyde ortalar
    paddingVertical: 20, // Dikeyde biraz boşluk bırakır
    backgroundColor: '#F3F4F6', // Arka plan rengi ekledik
    minHeight: '100%', // ScrollView'nin en az ekran yüksekliği kadar olmasını sağlar
  },
  container: {
    width: width * 0.95, // Ekran genişliğinin %95'ini kaplar
    maxWidth: 500, // Maksimum genişliği belirler (tablet ve masaüstü için)
    alignSelf: 'center', // Yatayda ortalar
    backgroundColor: '#fff',
    borderRadius: 12, // Daha yuvarlak köşeler
    padding: 20, // İç boşlukları artırdık
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Gölgeyi belirginleştirdik
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8, // Android için gölge
    marginVertical: 20, // Dikeyde dış boşluk
  },
  headerTitle: {
    fontSize: 26, // Başlık boyutunu artırdık
    fontWeight: 'bold',
    marginBottom: 28, // Alt boşluğu artırdık
    textAlign: 'center',
    color: '#2C3E50', // Daha koyu bir renk
  },
  formGroup: {
    marginBottom: 18, // Form grupları arasındaki boşluğu ayarladık
  },
  label: {
    fontSize: 15, // Etiket boyutunu ayarladık
    fontWeight: '600',
    color: '#34495E', // Daha koyu bir renk
    marginBottom: 6, // Etiket ile input arasındaki boşluk
  },
  input: {
    width: '100%',
    padding: 14, // Input iç boşluğunu artırdık
    borderWidth: 1,
    borderColor: '#BDC3C7', // Daha yumuşak bir kenarlık rengi
    borderRadius: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  textArea: {
    height: 120, // Açıklama alanı yüksekliğini artırdık
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ECF0F1', // Picker arka plan rengi
  },
  picker: {
    width: '100%',
    height: 50,
  },
  pickerItem: {
    fontSize: 16,
    color: '#2C3E50',
  },
  loadingUsersIndicator: {
    marginTop: 10,
  },
  errorBox: {
    backgroundColor: '#FADBD8', // Daha yumuşak bir kırmızı tonu
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 5, // Sol kenarlık ekledik
    borderColor: '#C0392B', // Kırmızı kenarlık
  },
  errorText: {
    color: '#C0392B', // Kırmızı metin
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#2980B9', // Daha doygun bir mavi
    paddingVertical: 14, // Dikey boşluğu artırdık
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    marginTop: 20, // Buton üst boşluğu
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18, // Metin boyutunu artırdık
    fontWeight: '700', // Kalınlık
  },
  cancelButton: {
    width: '100%',
    backgroundColor: '#7F8C8D', // Daha yumuşak bir gri
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    marginTop: 12, // Üst boşluğu artırdık
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }], // Hafif basma efekti
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
