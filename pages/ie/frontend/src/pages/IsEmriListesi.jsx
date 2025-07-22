import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api  from "../lib/api";

export default function IsEmriListesi() {
  const [emirler, setEmirler] = useState([]);
  const [loading, setLoading] = useState(true);

  const veriGetir = async () => {
    try {
      const res = await api.get("/emirler");
      setEmirler(res.data);
    } catch (err) {
      console.error("Veri alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    veriGetir();
  }, []);

  const handleSil = async (id) => {
    if (!window.confirm("Bu iş emrini silmek istediğinizden emin misiniz?")) return;
    try {
      await api.delete(`/emirler/${id}`);
      setEmirler(emirler.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Silme işlemi başarısız oldu.");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">İş Emirleri</h1>

      <Link
        to="/ekle"
        className="block w-full text-center bg-green-600 text-white py-3 rounded-lg mb-6 hover:bg-green-700 transition"
      >
        + Yeni İş Emri Oluştur
      </Link>

      {loading ? (
        <p className="text-center text-gray-500">Yükleniyor...</p>
      ) : emirler.length === 0 ? (
        <div className="text-center text-gray-400 mt-10">
          <div className="text-6xl mb-4">📭</div>
          Henüz iş emri yok. Başlamak için yukarıdan bir tane ekleyin.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {emirler.map((emir) => (
            <div
              key={emir.id}
              className="bg-white rounded-xl shadow-md p-5 border-l-8 border-blue-500 hover:shadow-lg transition"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                    <span className="text-blue-600 font-mono mr-2">{emir.is_emri_no}</span>
                    {emir.title}
                </h2>
                <span
                  className={`mt-2 sm:mt-0 text-xs font-semibold px-3 py-1 rounded-full self-start sm:self-auto
                    ${
                      emir.priority === "Yüksek"
                        ? "bg-red-100 text-red-700"
                        : emir.priority === "Orta"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                >
                  Öncelik: {emir.priority}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-2">{emir.description}</p>

              <div className="flex flex-wrap justify-between items-center mt-3 text-sm text-gray-500">
                <span>
                  Durum:{" "}
                  <span
                    className={`font-medium ${
                      emir.status === "acik"
                        ? "text-blue-700"
                        : "text-green-700"
                    }`}
                  >
                    {emir.status === "acik" ? "Açık" : "Tamamlandı"}
                  </span>
                </span>
                <span>
                  Oluşturulma:{" "}
                  {new Date(emir.created_at).toLocaleString("tr-TR")}
                </span>
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <Link
                  to={`/duzenle/${emir.id}`}
                  className="bg-blue-100 text-blue-700 text-sm px-4 py-2 rounded hover:bg-blue-200"
                >
                  Düzenle
                </Link>
                <button
                  onClick={() => handleSil(emir.id)}
                  className="bg-red-100 text-red-700 text-sm px-4 py-2 rounded hover:bg-red-200"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
