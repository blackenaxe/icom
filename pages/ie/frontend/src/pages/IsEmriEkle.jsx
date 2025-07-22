// src/pages/IsEmriEkle.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api  from "../lib/api";

export default function IsEmriEkle() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Orta",
    status: "acik",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/emirler", form);
      navigate("/emirler");
    } catch (error) {
      console.error("Kayıt başarısız:", error);
      alert("Ekleme başarısız oldu!");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4 text-center">Yeni İş Emri</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Başlık"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Açıklama"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300"
          rows={3}
        />
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
        >
          <option value="Düşük">Düşük</option>
          <option value="Orta">Orta</option>
          <option value="Yüksek">Yüksek</option>
        </select>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg"
        >
          <option value="acik">Açık</option>
          <option value="tamamlandi">Tamamlandı</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Kaydet
        </button>
      </form>
    </div>
  );
} 
