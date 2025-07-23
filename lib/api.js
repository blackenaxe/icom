    import axios from 'axios';
    import storage from "./storage"; // Platform uyumlu storage import

    // Platforma göre dinamik baseURL belirleme
    let API_BASE_URL;

    // React Native ortamında mı çalışıyoruz?
    const isReactNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

    if (isReactNative) {
      // Android emülatörü için: Host makinenizin localhost'u
      // Gerçek Android cihaz için: Bilgisayarınızın ağdaki gerçek IP adresi
      // iOS emülatörü için: localhost
      // Gerçek iOS cihaz için: Bilgisayarınızın ağdaki gerçek IP adresi
      // Geliştirme sırasında IP'niz değişirse burayı güncellemeniz gerekebilir.
      // Ya da bir .env dosyası kullanabilirsiniz.
      API_BASE_URL = 'http://192.168.1.144:8000'; // Sizin ipconfig çıktınızdaki IP
    } else {
      // Web ortamı için genellikle localhost kullanılır
      API_BASE_URL = 'http://localhost:8000'; // Webpack dev server'ınızın veya backend'inizin web URL'si
    }

    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json', 
      },
      timeout: 10000, // 10 saniye zaman aşımı
    });

    // Her istek gönderilmeden önce çalışacak interceptor
    api.interceptors.request.use(
      async (config) => {
        const token = await storage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Her yanıt alındıktan sonra çalışacak interceptor
    api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.response && error.response.status === 401) {
          await storage.removeItem('token');
          await storage.removeItem('user');
          // Bu noktada kullanıcıyı Login sayfasına yönlendirecek bir mekanizma tetiklenmeli
          // Örneğin, App.js'teki onLogout fonksiyonunu çağıran bir event emitter
          console.error("Yetkilendirme hatası: Kullanıcı çıkış yapıldı.", error);
        }
        return Promise.reject(error);
      }
    );

    export default api;
    