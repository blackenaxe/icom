import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Kayıt butonuna basıldı");
    try {
      await api.post("/register", {
        username,
        password,
      });
      alert("Kayıt başarılı! Giriş yapabilirsiniz.");
      navigate("/login");
    } catch (err) {
      console.error("Kayıt hatası:", err.response?.data || err.message);
      alert("Kayıt başarısız");
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="p-6 max-w-sm mx-auto bg-white shadow-md rounded"
    >
      <h2 className="text-2xl mb-4 font-bold text-center text-blue-700">
        Kayıt Ol
      </h2>

      <input
        type="text"
        placeholder="Kullanıcı Adı"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full mb-3 border px-3 py-2 rounded focus:outline-blue-500"
        required
      />

      <input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-3 border px-3 py-2 rounded focus:outline-blue-500"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Kayıt Ol
      </button>
    </form>
  );
}
