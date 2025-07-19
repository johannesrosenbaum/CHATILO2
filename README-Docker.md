# 🐳 CHATILO Docker Production Deployment

Dieser Guide erklärt, wie CHATILO mit Docker auf einem Ubuntu-Server für https://www.chatilo.de deployed wird.

## 🚀 Vorteile von Docker

- ✅ **Konsistente Umgebung** - Gleiche Umgebung überall
- ✅ **Einfache Updates** - Ein Befehl für alle Services
- ✅ **Isolation** - Jeder Service läuft in seinem Container
- ✅ **Skalierbarkeit** - Einfach horizontal skalieren
- ✅ **Backup/Restore** - Volumes für Daten-Persistenz

## 📋 Voraussetzungen

- Ubuntu Server (18.04 oder höher)
- Root-Zugriff oder sudo-Berechtigungen
- Domain: chatilo.de (DNS auf Server-IP zeigen)
- GitHub Repository: https://github.com/johannesrosenbaum/CHATILO2.git

## 🐳 Docker Services

### 1. MongoDB Container
- **Image**: mongo:6.0
- **Port**: 27017
- **Volume**: mongodb_data
- **Credentials**: admin/chatilo2024

### 2. Node.js Server Container
- **Image**: Custom (node:18-alpine)
- **Port**: 1113
- **Volume**: server/uploads, server_logs
- **Health Check**: Automatische Überwachung

### 3. React Client Container
- **Image**: Custom (nginx:alpine)
- **Port**: 80, 443
- **Volume**: client_build
- **Features**: Gzip, Caching, Security Headers

### 4. Nginx Reverse Proxy
- **Image**: nginx:alpine
- **Port**: 80, 443
- **Features**: SSL, Rate Limiting, Load Balancing

## 🚀 Schnellstart

### 1. Erste Installation

```bash
# Auf dem Ubuntu Server ausführen:
sudo su
wget https://raw.githubusercontent.com/johannesrosenbaum/CHATILO2/main/deploy-docker.sh
chmod +x deploy-docker.sh
./deploy-docker.sh
```

### 2. Konfiguration anpassen

Vor dem Deployment die E-Mail-Adresse in `deploy-docker.sh` anpassen:

```bash
SSL_EMAIL="deine-email@example.com"  # Deine E-Mail für SSL-Zertifikate
```

## 📁 Projekt-Struktur

```
/opt/chatilo/
├── docker-compose.prod.yml    # Docker Compose Konfiguration
├── .env                       # Umgebungsvariablen
├── nginx.conf                 # Nginx Konfiguration
├── ssl/                       # SSL-Zertifikate
│   ├── fullchain.pem
│   └── privkey.pem
├── server/                    # Backend Code
│   ├── Dockerfile
│   └── uploads/              # Upload-Verzeichnisse
├── client/                    # Frontend Code
│   └── Dockerfile
├── deploy-docker.sh          # Deployment-Script
└── update-docker.sh          # Update-Script
```

## 🌐 Domain-Konfiguration

Das Deployment erstellt folgende Domains:

- **https://www.chatilo.de** - Hauptwebsite (React Frontend)
- **https://api.chatilo.de** - API-Endpunkt (Node.js Backend)
- **https://chatilo.de** - Weiterleitung zu www.chatilo.de

## 🔧 Docker Commands

### Status anzeigen
```bash
# Container Status
docker-compose -f docker-compose.prod.yml ps

# Logs anzeigen
docker-compose -f docker-compose.prod.yml logs

# Spezifische Service Logs
docker-compose -f docker-compose.prod.yml logs server
docker-compose -f docker-compose.prod.yml logs client
docker-compose -f docker-compose.prod.yml logs nginx
```

### Container verwalten
```bash
# Starten
docker-compose -f docker-compose.prod.yml up -d

# Stoppen
docker-compose -f docker-compose.prod.yml down

# Neustart
docker-compose -f docker-compose.prod.yml restart

# Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Systemd Service
```bash
# Service Status
systemctl status chatilo

# Service starten
systemctl start chatilo

# Service stoppen
systemctl stop chatilo

# Service aktivieren (Auto-Start)
systemctl enable chatilo
```

## 🔄 Updates

### Automatisches Update
```bash
# Update-Script herunterladen
wget https://raw.githubusercontent.com/johannesrosenbaum/CHATILO2/main/update-docker.sh
chmod +x update-docker.sh

# Update ausführen
sudo ./update-docker.sh
```

### Manuelles Update
```bash
cd /opt/chatilo
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring

### Container Health
```bash
# Health Status aller Container
docker-compose -f docker-compose.prod.yml ps

# Spezifische Container Details
docker inspect chatilo-server
docker inspect chatilo-client
docker inspect chatilo-nginx
```

### Ressourcen-Nutzung
```bash
# Container Ressourcen
docker stats

# Spezifische Container
docker stats chatilo-server chatilo-client chatilo-nginx
```

### Logs überwachen
```bash
# Live Logs
docker-compose -f docker-compose.prod.yml logs -f

# Spezifische Service Logs
docker-compose -f docker-compose.prod.yml logs -f server
```

## 🔒 SSL-Zertifikate

### Automatische Erneuerung
SSL-Zertifikate werden automatisch erneuert:
- **Cron Job**: Täglich um 12:00 Uhr
- **Let's Encrypt**: Kostenlose Zertifikate
- **Auto-Restart**: Nginx wird nach Erneuerung neu gestartet

### Manuelle Erneuerung
```bash
# Zertifikate erneuern
certbot renew --force-renewal

# Zertifikate kopieren
cp /etc/letsencrypt/live/chatilo.de/fullchain.pem /opt/chatilo/ssl/
cp /etc/letsencrypt/live/chatilo.de/privkey.pem /opt/chatilo/ssl/

# Nginx neu starten
docker-compose -f docker-compose.prod.yml restart nginx
```

## 🛠️ Troubleshooting

### Container startet nicht
```bash
# Logs prüfen
docker-compose -f docker-compose.prod.yml logs

# Container neu bauen
docker-compose -f docker-compose.prod.yml build --no-cache

# Volumes prüfen
docker volume ls
```

### Website nicht erreichbar
```bash
# Container Status
docker-compose -f docker-compose.prod.yml ps

# Nginx Logs
docker-compose -f docker-compose.prod.yml logs nginx

# Ports prüfen
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

### Datenbank-Probleme
```bash
# MongoDB Container Status
docker-compose -f docker-compose.prod.yml logs mongodb

# Datenbank verbinden
docker exec -it chatilo-mongodb mongosh -u admin -p chatilo2024

# Volumes prüfen
docker volume inspect chatilo_mongodb_data
```

### SSL-Probleme
```bash
# Zertifikat Status
certbot certificates

# Nginx SSL Test
docker exec chatilo-nginx nginx -t

# Zertifikat erneuern
certbot renew --force-renewal
```

## 📦 Backup & Restore

### Backup erstellen
```bash
# Datenbank Backup
docker exec chatilo-mongodb mongodump --out /backup

# Uploads Backup
tar -czf uploads-backup.tar.gz /opt/chatilo/server/uploads

# Volumes Backup
docker run --rm -v chatilo_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb-backup.tar.gz -C /data .
```

### Restore
```bash
# Datenbank Restore
docker exec -i chatilo-mongodb mongorestore --archive < backup.archive

# Uploads Restore
tar -xzf uploads-backup.tar.gz -C /opt/chatilo/server/

# Volumes Restore
docker run --rm -v chatilo_mongodb_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongodb-backup.tar.gz -C /data
```

## 🔐 Sicherheit

### Container Security
- ✅ Non-root User in Containern
- ✅ Read-only Root Filesystem (wo möglich)
- ✅ Security Headers in Nginx
- ✅ Rate Limiting für API
- ✅ SSL/TLS Verschlüsselung

### Network Security
- ✅ Isolated Docker Network
- ✅ Exposed Ports minimiert
- ✅ Internal Communication über Docker Network

### Data Security
- ✅ Persistent Volumes für Daten
- ✅ Backup-Strategie
- ✅ SSL-Zertifikate automatisch erneuert

## 📞 Support

Bei Problemen:

1. **Logs prüfen**: `docker-compose -f docker-compose.prod.yml logs`
2. **Status prüfen**: `docker-compose -f docker-compose.prod.yml ps`
3. **Container neu starten**: `docker-compose -f docker-compose.prod.yml restart`
4. **System neu starten**: `systemctl restart chatilo`

## 🎯 Deployment-Checkliste

- [ ] Domain DNS auf Server-IP zeigen
- [ ] Server Root-Zugriff haben
- [ ] GitHub Repository existiert
- [ ] SSL-E-Mail-Adresse konfiguriert
- [ ] Docker Deployment-Script ausgeführt
- [ ] Website erreichbar unter https://www.chatilo.de
- [ ] API erreichbar unter https://api.chatilo.de
- [ ] SSL-Zertifikate gültig
- [ ] Alle Container laufen
- [ ] Systemd Service aktiviert 