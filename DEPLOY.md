# 🚀 Panduan Deploy ke Fly.io

## Persiapan

### 1. Install Fly.io CLI
```bash
# Windows (PowerShell)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Atau download installer dari: https://fly.io/docs/hands-on/install-flyctl/
```

### 2. Login ke Fly.io
```bash
fly auth login
```

### 3. Buat Aplikasi di Fly.io
```bash
# Di folder project
fly launch --no-deploy

# Ikuti instruksi:
# - Pilih nama app (atau gunakan yang sudah di fly.toml: telkomsel-racing)
# - Pilih region: Singapore (sin) - recommended untuk Indonesia
# - Jangan deploy dulu
```

### 4. Buat Volume untuk Persistent Storage
```bash
# Volume untuk menyimpan data game scores
fly volumes create telkomsel_racing_data --region sin --size 1
```

### 5. Deploy Aplikasi
```bash
fly deploy
```

### 6. Buka Aplikasi
```bash
fly open
```

## Monitoring & Management

### Cek Status
```bash
fly status
```

### Lihat Logs
```bash
fly logs
```

### SSH ke Container
```bash
fly ssh console
```

### Scale Resources
```bash
# Ubah memory/CPU jika diperlukan
fly scale memory 512  # Naikkan memory ke 512MB
fly scale count 2     # Jalankan 2 instances
```

### Update Aplikasi
```bash
# Setelah ada perubahan code
fly deploy
```

## Konfigurasi Domain Custom (Opsional)

### Tambah Domain
```bash
fly certs add your-domain.com
```

### Cek Certificate Status
```bash
fly certs show your-domain.com
```

## Environment Variables (Jika Diperlukan)

### Set Environment Variable
```bash
fly secrets set SECRET_KEY=your-secret-key
```

### List Secrets
```bash
fly secrets list
```

## Troubleshooting

### Jika Deploy Gagal
1. Cek logs: `fly logs`
2. Pastikan Dockerfile berjalan lokal: `docker build -t test .`
3. Cek fly.toml configuration

### Jika App Tidak Bisa Diakses
1. Cek status: `fly status`
2. Restart app: `fly apps restart`
3. Cek logs untuk error: `fly logs`

### Jika Data Hilang
- Pastikan volume sudah dibuat: `fly volumes list`
- Data tersimpan di `/data/game_scores.json` dalam volume

## Biaya

Fly.io menawarkan free tier dengan:
- 3 shared-cpu-1x 256MB VMs
- 160GB bandwidth/month
- 3GB persistent volume storage

Aplikasi ini sudah dikonfigurasi untuk menggunakan resources minimal yang masuk dalam free tier.

## URL Aplikasi

Setelah deploy, aplikasi bisa diakses di:
- https://telkomsel-racing.fly.dev (sesuai nama app)
- Atau domain custom yang Anda set

## Support

Dokumentasi Fly.io: https://fly.io/docs/
