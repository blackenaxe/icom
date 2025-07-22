import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import api from "../lib/api";

export default function YeniIsEmri({ onNavigate }) {
  const [form, setForm] = useState({ title: "", description: "", priority: "Orta", assigned: "" });

  const handleChange = (name, value) => setForm({ ...form, [name]: value });

  const handleSubmit = async () => {
    try {
      await api.post("/api/emirler", form);
      onNavigate("IsEmriListesi"); // Anasayfa yerine iş emri listesine yönlendiriyoruz
    } catch (error) {
      console.error("Yeni iş emri eklenirken hata:", error);
      // Hata mesajı göstermek için onMessage prop'unu kullanabilirsiniz
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Yeni İş Emri</Text>
        <TextInput
          style={styles.input}
          name="title"
          value={form.title}
          onChangeText={(value) => handleChange("title", value)}
          placeholder="Başlık"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          name="description"
          value={form.description}
          onChangeText={(value) => handleChange("description", value)}
          placeholder="Açıklama"
          multiline
        />
        <TextInput
          style={styles.input}
          name="assigned"
          value={form.assigned}
          onChangeText={(value) => handleChange("assigned", value)}
          placeholder="Sorumlu"
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Öncelik Seçin:</Text>
          <Picker
            selectedValue={form.priority}
            onValueChange={(itemValue) => handleChange("priority", itemValue)}
            style={styles.picker}
            dropdownIconColor="#4B5563"
          >
            <Picker.Item label="Düşük" value="Düşük" />
            <Picker.Item label="Orta" value="Orta" />
            <Picker.Item label="Yüksek" value="Yüksek" />
          </Picker>
        </View>

        <Pressable onPress={handleSubmit} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Kaydet</Text>
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
    backgroundColor: '#F3F4F6', // bg-gray-100
  },
  container: {
    width: '90%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 10,
    borderRadius: 6,
    width: '100%',
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#4B5563',
    paddingLeft: 10,
    paddingTop: 8,
  },
  picker: {
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});