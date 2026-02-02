# 🏎️ P&T TOWNHALL RACING GAME - FleetSight Edition

## 🎯 PERUBAHAN YANG DILAKUKAN

### ✅ Yang Ditambahkan:
**PROMOSI FLEETSIGHT MANAGEMENT** di layar Game Over

Ketika pemain selesai bermain (game over), akan muncul panel promosi **FleetSight** dengan informasi lengkap:

#### 📱 Konten Promosi FleetSight:
- **Logo**: Ikon mobil 🚗 dengan gradient biru
- **Nama**: FleetSight
- **Tagline**: "Telkomsel Fleet Management Solution"
- **Deskripsi**: Penjelasan integrasi perangkat telematika berbasis satelit
- **4 Fitur Utama**:
  1. 📍 **Pelacakan Real-Time** - Lacak lokasi kendaraan untuk keamanan aset
  2. 📊 **Analitik & Laporan** - Insight operasional untuk produktivitas maksimal
  3. 🔒 **Keamanan Aset Andal** - Pantau lokasi dan status dengan visibilitas penuh
  4. ⚙️ **Add-on Sesuai Kebutuhan** - Pemantauan aktivitas sesuai kebutuhan

### 🎨 Desain Promosi:
- Background gradient biru profesional (#00B0F0)
- Border dan glow effect cyan
- Layout rapi dengan card untuk setiap fitur
- Responsive untuk desktop dan mobile
- Animasi hover interaktif

---

## 📦 STRUKTUR FILE

```
racing_game/
│
├── app.py                    # Backend Flask (TIDAK DIUBAH ✅)
├── requirements.txt          # Dependencies Python
├── README.md                 # Dokumentasi ini
│
├── static/
│   ├── css/
│   │   └── styles.css       # CSS + FleetSight styling
│   └── js/
│       └── game.js          # Game logic (TIDAK DIUBAH ✅)
│
└── templates/
    └── index.html           # HTML dengan FleetSight promo
```

---

## 🚀 CARA INSTALL & JALANKAN

### 1️⃣ Extract File
```bash
unzip racing_game_fleetsight.zip
cd racing_game
```

### 2️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

Atau manual:
```bash
pip install Flask==3.0.0 flask-cors==4.0.0
```

### 3️⃣ Jalankan Server
```bash
python app.py
```

Server akan berjalan di: **http://localhost:5000**

### 4️⃣ Buka di Browser
```
http://localhost:5000
```

---

## 🎮 CARA MELIHAT PROMOSI FLEETSIGHT

1. ✅ Buka game di browser
2. ✅ Masukkan nama pemain di form registrasi
3. ✅ Klik "START RACING"
4. ✅ Mainkan game (gunakan ← → untuk belok, SPACE untuk nitro)
5. ✅ Tunggu sampai game over (tabrakan atau keluar jalur)
6. ✅ **PANEL FLEETSIGHT AKAN MUNCUL!** 🎉

Panel FleetSight akan tampil di bawah statistik pemain dengan 4 fitur lengkap!

---

## ✨ FITUR GAME (Tetap Ada)

- ✅ Player Registration dengan validasi
- ✅ 3D Racing menggunakan THREE.js
- ✅ Score Tracking real-time
- ✅ Leaderboard System (Top 10)
- ✅ Nitro Boost dengan visual effect
- ✅ Speedometer animasi
- ✅ Explosion effects saat tabrakan
- ✅ Mobile controls (touch buttons)
- ✅ Pause/Resume game
- ✅ Statistics (total games, highest score, dll)
- ✅ **PROMOSI FLEETSIGHT di Game Over Screen** 🚗

---

## 📱 MOBILE RESPONSIVE

Promosi FleetSight sudah dioptimasi untuk mobile:
- ✅ Font size yang sesuai
- ✅ Padding proporsional
- ✅ Layout tetap rapi di layar kecil
- ✅ Touch-friendly buttons

---

## 🎨 PREVIEW PROMOSI

**Panel FleetSight muncul setelah:**
- Statistik final score
- Distance traveled
- Top speed
- Player rank

**Design elements:**
- 🎨 Background: Gradient biru (#0F1923 → #0A0F19)
- 🔵 Border: Cyan glow effect (#00B0F0)
- 🚗 Icon: Mobil untuk fleet management
- 📋 4 Cards dengan icon dan deskripsi lengkap

---

## 🔧 TROUBLESHOOTING

### Problem: Game tidak load / stuck di 0%
**Solusi:**
1. Pastikan struktur folder benar:
   - `templates/index.html` ✅
   - `static/js/game.js` ✅
   - `static/css/styles.css` ✅
2. Refresh browser (Ctrl + F5)
3. Cek console browser (F12) untuk error

### Problem: FleetSight promo tidak muncul
**Solusi:**
1. Pastikan sudah game over (bukan pause)
2. Scroll ke bawah di layar game over
3. Clear browser cache

### Problem: Port 5000 sudah digunakan
**Solusi:**
```bash
# Ubah port di app.py baris terakhir:
app.run(debug=True, host='0.0.0.0', port=5001)
```

---

## ⚠️ CATATAN PENTING

### ✅ Yang TIDAK Diubah:
- `app.py` - Backend Flask API tetap 100% sama
- `game.js` - Logic game dan physics tetap sama
- Database JSON untuk leaderboard tetap sama

### ✏️ Yang Diubah:
- `index.html` - Hanya bagian promo panel (ganti P&T dengan FleetSight)
- `styles.css` - Tambah styling khusus FleetSight di akhir file

**Total perubahan: Hanya konten HTML dan styling CSS!** 🎯

---

## 📞 SUPPORT

Jika ada masalah saat instalasi atau running:
1. Pastikan Python 3.7+ terinstall
2. Pastikan pip up to date: `pip install --upgrade pip`
3. Cek Flask version: `flask --version`
4. Coba run di virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   pip install -r requirements.txt
   python app.py
   ```

---

## 🎉 SELAMAT BERMAIN!

Game sudah siap dengan **promosi FleetSight Management** yang muncul setiap kali game over! 🚗💨

**Powered by:**
- P&T Townhall 2026
- Telkomsel Enterprise Solutions
- FleetSight - Fleet Management with IoT
