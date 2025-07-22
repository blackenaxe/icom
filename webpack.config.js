const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// WebpackBundleSizeAnalyzerPlugin'i şimdilik kaldırıyoruz, daha sonra eklenebilir.
// const { WebpackBundleSizeAnalyzerPlugin } = require('webpack-bundle-size-analyzer');

module.exports = {
  // Webpack'in uygulamanızı hangi dosyadan başlatacağını belirtir
  entry: path.resolve(__dirname, 'index.js'), // React Native uygulamanızın ana giriş noktası

  // Derlenmiş çıktı dosyalarının nereye kaydedileceğini belirtir
  output: {
    path: path.resolve(__dirname, 'web-build'), // Web derlemesinin kaydedileceği klasör
    filename: 'bundle.js', // Çıktı dosyasının adı
    publicPath: '/', // Geliştirme sunucusunda dosyaların nasıl servis edileceği
  },

  // Modüllerin nasıl çözümleneceğini (import/require) belirtir
  resolve: {
    // React Native'deki 'react-native' importlarını 'react-native-web' ile değiştirir
    alias: {
      'react-native$': 'react-native-web',
      // YENİ EKLEME: Belirli problematic modüller için açık alias'lar
      // '@react-native-async-storage/async-storage' için CommonJS build'ini kullanıyoruz.
      // Bu, 'Module not found' hatalarını ve içe aktarma sorunlarını çözebilir.
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'node_modules/@react-native-async-storage/async-storage/lib/commonjs/index.js'),
      // 'react-native-toast-message' için doğrudan src dosyasını kullanıyoruz.
      'react-native-toast-message': path.resolve(__dirname, 'node_modules/react-native-toast-message/lib/src/Toast.js'),
      // 'AppRegistry' uyarılarını çözmek için
      'react-native/Libraries/AppRegistry/AppRegistry': 'react-native-web/dist/exports/AppRegistry',
    },
    // Hangi dosya uzantılarının otomatik olarak aranacağını belirtir
    // .web.js, .js, .jsx gibi uzantıları önceliklendirir
    extensions: ['.web.js', '.js', '.jsx', '.json', '.web.ts', '.ts', '.tsx', '.mjs'], // .mjs eklendi
    // YENİ EKLEME: ES Modüllerinde uzantısız importlara izin verir.
    // Bu, '@react-native-async-storage/async-storage' gibi kütüphanelerin içe aktarım sorunlarını çözebilir.
    fullySpecified: false,
    // YENİ EKLEME: Paketlerin ana giriş noktalarını arama sırası
    // 'browser' web'e özgü paketleri, 'module' ES modüllerini, 'main' CommonJS modüllerini tercih eder.
    mainFields: ['browser', 'module', 'main'],
  },

  // Farklı dosya türlerinin nasıl işleneceğini belirtir
  module: {
    rules: [
      {
        // Uygulamanızın kendi dosyalarını Babel ile işler
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/, // node_modules klasörünü tamamen hariç tutar
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
            ],
            plugins: [
              ['react-native-web', {}],
            ],
            sourceType: 'unambiguous',
          },
        },
      },
      // YENİ KURAL: Belirli node_modules paketlerini Babel ile işlemek için
      {
        test: /\.(js|jsx|ts|tsx)$/,
        // Sadece bu belirtilen node_modules klasörlerini dahil et
        include: [
          path.resolve(__dirname, 'node_modules/react-native'),
          path.resolve(__dirname, 'node_modules/react-native-web'),
          path.resolve(__dirname, 'node_modules/@react-native'),
          path.resolve(__dirname, 'node_modules/@react-native-async-storage'),
          path.resolve(__dirname, 'node_modules/react-native-toast-message'),
          path.resolve(__dirname, 'node_modules/@react-native-picker'),
          // Diğer React Native ile ilgili paketler buraya eklenebilir
          // Örneğin: path.resolve(__dirname, 'node_modules/react-native-xyz'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            configFile: false,
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
            ],
            plugins: [
              ['react-native-web', {}],
            ],
            sourceType: 'unambiguous',
          },
        },
      },
      // .mjs dosyalarını işlemek için (AsyncStorage hatası için)
      {
        test: /\.mjs$/,
        include: /node_modules/, // Sadece node_modules içindeki .mjs dosyalarını hedefle
        type: 'javascript/auto', // Webpack'e bu dosyaları otomatik JavaScript olarak işlemesini söyle
      },
      // Kaynak haritalarını doğru şekilde işlemek için (şimdilik kaldırıldı)
      // {
      //   test: /\.js$/,
      //   enforce: 'pre',
      //   use: ['source-map-loader'],
      //   exclude: /node_modules\/(?!(@react-native-async-storage\/async-storage|react-native-toast-message|react-native|@react-native\/.*)\/).*/,
      // },
      // Webpack 5'te 'file-loader' yerine 'asset/resource' tipi kullanılır
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]',
        },
      },
      {
        test: /\.(ttf|otf|woff|woff2)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][ext]',
        },
      },
    ],
  },

  // Webpack eklentilerini tanımlar
  plugins: [
    // HTML dosyasını otomatik olarak oluşturur ve bundle.js'yi içine enjekte eder
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'), // Kullanılacak HTML şablonu
      filename: 'index.html', // Oluşturulacak HTML dosyasının adı
    }),
    // Bundle boyutunu analiz eklentisini şimdilik devre dışı bırakıyoruz.
    // new WebpackBundleSizeAnalyzerPlugin('report.txt'),
  ],

  // Geliştirme sunucusu ayarları
  devServer: {
    port: 3000, // Web uygulamasının çalışacağı port
    historyApiFallback: true, // React Router gibi SPA'lar için gerekli
    hot: true, // Canlı yeniden yükleme
    open: true, // Tarayıcıda otomatik açma
  },

  // Performans uyarılarını kapatır veya ayarlar
  performance: {
    hints: false, // Performans uyarılarını kapatır
  },

  // Geliştirme veya üretim modu
  mode: 'development', // Geliştirme modunda daha hızlı derleme
};
