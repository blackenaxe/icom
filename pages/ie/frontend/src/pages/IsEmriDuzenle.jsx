import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";

export default function IsEmriDuzenle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Orta",
    status: "acik",
    assigned: "",
  });

  useEffect(() => {
    api.get(`/emirler/${id}`)
      .then(res => setForm(res.data))
      .catch(err => {
        console.error("Veri alınamadı:", err);
        alert("İş emri bulunamadı");
        navigate("/");
      });
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/emirler/${id}`, form);
      navigate("/emirler");
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Güncelleme başarısız oldu!");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4 text-center">İş Emrini Düzenle</h1>
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