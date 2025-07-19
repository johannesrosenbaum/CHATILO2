# 🚀 CHATILO Deployment - Schritt für Schritt

## Vorbereitung

1. **Code auf GitHub hochladen:**
   ```bash
   git add .
   git commit -m "Production ready version"
   git push origin main
   ```

2. **DNS-Einstellungen prüfen:**
   - `chatilo.de` → Server-IP
   - `www.chatilo.de` → Server-IP  
   - `api.chatilo.de` → Server-IP

## Deployment auf Ubuntu Server

### Schritt 1: Server vorbereiten
```bash
# Als Root anmelden
sudo su

# System updaten
apt update && apt upgrade -y
```

### Schritt 2: Deployment-Script herunterladen
```bash
# Script herunterladen
wget https://raw.githubusercontent.com/johannesrosenbaum/CHATILO2/main/deploy-to-production.sh

# Ausführbar machen
chmod +x deploy-to-production.sh
```

### Schritt 3: E-Mail-Adresse anpassen
```bash
# Script bearbeiten
nano deploy-to-production.sh

# Zeile 12 ändern:
SSL_EMAIL="deine-echte-email@example.com"
```

### Schritt 4: Deployment ausführen
```bash
# Script ausführen
./deploy-to-production.sh
```

## Nach dem Deployment

### Status prüfen
```bash
# Website testen
curl -I https://www.chatilo.de

# PM2 Status
pm2 status

# Nginx Status
systemctl status nginx
```

### Logs anzeigen
```bash
# Anwendungs-Logs
pm2 logs chatilo-server

# Nginx Logs
tail -f /var/log/nginx/access.log
```

## Updates in der Zukunft

```bash
# Update-Script herunterladen
wget https://raw.githubusercontent.com/johannesrosenbaum/CHATILO2/main/update-production.sh
chmod +x update-production.sh

# Update ausführen
sudo ./update-production.sh
```

## Wichtige URLs

- 🌐 **Website**: https://www.chatilo.de
- 🔌 **API**: https://api.chatilo.de
- 📊 **PM2 Dashboard**: `pm2 monit`

## Troubleshooting

### Website nicht erreichbar
```bash
pm2 status
systemctl status nginx
pm2 logs chatilo-server
```

### SSL-Probleme
```bash
certbot certificates
certbot renew --force-renewal
```

### Datenbank-Probleme
```bash
systemctl status mongod
systemctl start mongod
```

## 🔐 Sicherheitshinweise

- SSL-Zertifikate werden automatisch erneuert
- Firewall-Regeln sind konfiguriert
- Security Headers sind aktiviert
- Upload-Limits sind gesetzt

## 📞 Support

Bei Problemen:
1. Logs prüfen: `pm2 logs chatilo-server`
2. Status prüfen: `pm2 status`
3. Nginx testen: `nginx -t`
4. SSL prüfen: `certbot certificates` 