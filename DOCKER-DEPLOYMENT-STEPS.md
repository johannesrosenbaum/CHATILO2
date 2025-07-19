# 🐳 CHATILO Docker Deployment - Einfache Anleitung

## 🚀 Warum Docker?

Docker macht das Deployment viel einfacher:
- ✅ **Alles in einem** - Server, Client, Datenbank in Containern
- ✅ **Einfache Updates** - Ein Befehl aktualisiert alles
- ✅ **Konsistent** - Läuft überall gleich
- ✅ **Isoliert** - Jeder Service in seinem Container

## 📋 Vorbereitung

### 1. Code auf GitHub hochladen
```bash
git add .
git commit -m "Docker production ready"
git push origin main
```

### 2. DNS-Einstellungen prüfen
- `chatilo.de` → Server-IP
- `www.chatilo.de` → Server-IP
- `api.chatilo.de` → Server-IP

## 🐳 Docker Deployment

### Schritt 1: Server vorbereiten
```bash
# Als Root anmelden
sudo su

# System updaten
apt update && apt upgrade -y
```

### Schritt 2: Docker-Script herunterladen
```bash
# Script herunterladen
wget https://raw.githubusercontent.com/johannesrosenbaum/CHATILO2/main/deploy-docker.sh

# Ausführbar machen
chmod +x deploy-docker.sh
```

### Schritt 3: E-Mail-Adresse anpassen
```bash
# Script bearbeiten
nano deploy-docker.sh

# Zeile 12 ändern:
SSL_EMAIL="deine-echte-email@example.com"
```

### Schritt 4: Deployment ausführen
```bash
# Script ausführen (kann 10-15 Minuten dauern)
./deploy-docker.sh
```

## ✅ Nach dem Deployment

### Status prüfen
```bash
# Container Status
docker-compose -f docker-compose.prod.yml ps

# Website testen
curl -I https://www.chatilo.de

# Service Status
systemctl status chatilo
```

### Logs anzeigen
```bash
# Alle Logs
docker-compose -f docker-compose.prod.yml logs

# Spezifische Logs
docker-compose -f docker-compose.prod.yml logs server
docker-compose -f docker-compose.prod.yml logs nginx
```

## 🔄 Updates in der Zukunft

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

## 🐳 Docker Container

### Was läuft in den Containern?

1. **chatilo-mongodb** - Datenbank
   - Port: 27017 (intern)
   - Daten: Persistiert in Volume

2. **chatilo-server** - Node.js Backend
   - Port: 1113 (intern)
   - Uploads: Persistiert in Volume

3. **chatilo-client** - React Frontend
   - Port: 80, 443 (extern)
   - Build: Optimiert für Produktion

4. **chatilo-nginx** - Reverse Proxy
   - Port: 80, 443 (extern)
   - SSL: Automatisch verwaltet

## 🌐 Wichtige URLs

- 🌐 **Website**: https://www.chatilo.de
- 🔌 **API**: https://api.chatilo.de
- 📊 **Docker Status**: `docker-compose -f docker-compose.prod.yml ps`

## 🛠️ Häufige Befehle

### Container verwalten
```bash
# Status anzeigen
docker-compose -f docker-compose.prod.yml ps

# Logs anzeigen
docker-compose -f docker-compose.prod.yml logs

# Neustart
docker-compose -f docker-compose.prod.yml restart

# Stoppen
docker-compose -f docker-compose.prod.yml down

# Starten
docker-compose -f docker-compose.prod.yml up -d
```

### Systemd Service
```bash
# Service Status
systemctl status chatilo

# Service starten/stoppen
systemctl start chatilo
systemctl stop chatilo

# Service aktivieren (Auto-Start)
systemctl enable chatilo
```

## 🔒 SSL-Zertifikate

SSL-Zertifikate werden automatisch verwaltet:
- ✅ **Automatische Erneuerung** - Täglich um 12:00 Uhr
- ✅ **Let's Encrypt** - Kostenlose Zertifikate
- ✅ **Auto-Restart** - Nginx wird nach Erneuerung neu gestartet

### Manuelle Erneuerung
```bash
certbot renew --force-renewal
docker-compose -f docker-compose.prod.yml restart nginx
```

## 🛠️ Troubleshooting

### Website nicht erreichbar
```bash
# Container Status prüfen
docker-compose -f docker-compose.prod.yml ps

# Nginx Logs prüfen
docker-compose -f docker-compose.prod.yml logs nginx

# Ports prüfen
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

### Container startet nicht
```bash
# Logs prüfen
docker-compose -f docker-compose.prod.yml logs

# Container neu bauen
docker-compose -f docker-compose.prod.yml build --no-cache

# Volumes prüfen
docker volume ls
```

### Datenbank-Probleme
```bash
# MongoDB Logs
docker-compose -f docker-compose.prod.yml logs mongodb

# Datenbank verbinden
docker exec -it chatilo-mongodb mongosh -u admin -p chatilo2024
```

## 📦 Backup & Restore

### Backup erstellen
```bash
# Datenbank Backup
docker exec chatilo-mongodb mongodump --out /backup

# Uploads Backup
tar -czf uploads-backup.tar.gz /opt/chatilo/server/uploads
```

### Restore
```bash
# Datenbank Restore
docker exec -i chatilo-mongodb mongorestore --archive < backup.archive

# Uploads Restore
tar -xzf uploads-backup.tar.gz -C /opt/chatilo/server/
```

## 🔐 Sicherheitshinweise

- ✅ SSL-Zertifikate werden automatisch erneuert
- ✅ Container laufen isoliert
- ✅ Non-root User in Containern
- ✅ Security Headers aktiviert
- ✅ Rate Limiting für API

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