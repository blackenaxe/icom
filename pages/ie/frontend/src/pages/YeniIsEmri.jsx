import { useState } from "react";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function YeniIsEmri() {
  const [form, setForm] = useState({ title: "", description: "", priority: "Orta", assigned: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/emir", form);
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Yeni İş Emri</h1>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Başlık" className="border p-2 w-full mb-2" />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Açıklama" className="border p-2 w-full mb-2" />
      <input name="assigned" value={form.assigned} onChange={handleChange} placeholder="Sorumlu" className="border p-2 w-full mb-2" />
      <select name="priority" value={form.priority} onChange={handleChange} className="border p-2 w-full mb-4">
        <option>Düşük</option>
        <option>Orta</option>
        <option>Yüksek</option>
      </select>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Kaydet</button>
    </form>
  );
}