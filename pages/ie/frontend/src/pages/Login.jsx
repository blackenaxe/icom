import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../lib/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const data = new URLSearchParams();
    data.append("username", username);
    data.append("password", password);

    try {
      const res = await api.post("/login", data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const token = res.data.access_token;
      setAuthToken(token);
      alert("Giriş başarılı!");
      navigate("/emirler");
    } catch (err) {
      console.error("Giriş başarısız:", err.response?.data || err.message);
      alert("Giriş başarısız");
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-6 max-w-sm mx-auto">
      <h2 className="text-2xl mb-4 font-bold">Giriş Yap</h2>

      <input
        type="text"
        placeholder="Kullanıcı Adı"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full mb-3 border px-3 py-2 rounded"
        required
      />

      <input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-3 border px-3 py-2 rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Giriş
      </button>
    </form>
  );
}
