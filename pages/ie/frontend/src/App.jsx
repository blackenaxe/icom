import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import IsEmriListesi from "./pages/IsEmriListesi";
import IsEmriEkle from "./pages/IsEmriEkle";
import IsEmriDuzenle from "./pages/IsEmriDuzenle";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/emirler" element={<IsEmriListesi />} />
        <Route path="/ekle" element={<IsEmriEkle />} />
        <Route path="/duzenle/:id" element={<IsEmriDuzenle />} />
      </Routes>
    </BrowserRouter>
  );
}
