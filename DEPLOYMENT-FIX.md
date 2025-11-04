# 🚨 WICHTIG: Production Server Deployment

## Problem
Der Production Server läuft mit **ALTEM CODE** ohne Distance-Filtering! Deshalb werden Koblenz-Räume statt Berlin-Räume angezeigt.

## Lösung
Der Server muss NEU GEBAUT werden mit dem aktuellen Code.

## Deployment-Schritte

### 1. Auf Production-Server einloggen
```bash
ssh root@82.165.140.194
```

### 2. Zum Chatilo-Verzeichnis wechseln
```bash
cd /root/chatilo-app
```

### 3. Neuesten Code holen
```bash
git pull origin main
```

### 4. Aktueller Commit prüfen
```bash
git log --oneline -5
```

**Erwartetes Ergebnis:** Der neueste Commit sollte sein:
- `e8a5765 Fix: Increase API timeout from 10s to 30s`
- `1436131 HOTFIX: Fix duplicate /rooms/nearby route`
- `59824f9 Feature: Schools API + Location filtering for Villages`

### 5. Server NEU BAUEN (WICHTIG!)
```bash
docker-compose up -d --build server
```

❗ **ACHTUNG:** Nicht einfach `docker-compose restart`! Das lädt KEINEN neuen Code!
Der `--build` Flag ist ZWINGEND erforderlich!

### 6. Server-Logs überprüfen
```bash
docker-compose logs -f server --tail=50
```

Warte bis du siehst:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📍 Routes registered: /api/chat/rooms/nearby
```

Drücke `Ctrl+C` um die Logs zu verlassen.

### 7. Testen ob der Fix funktioniert

Öffne in deinem Browser **mit HARD REFRESH**:
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

Navigiere zu: https://chatilo.de

**Erwartetes Ergebnis:**
- ✅ Villages Dropdown zeigt **Berlin-Räume** (Berlin-Mitte, Berlin-Kreuzberg, etc.)
- ✅ **KEINE** Koblenz-Räume mehr sichtbar
- ✅ Schools können geöffnet werden

## Warum war das Problem?

Der `/api/chat/rooms/nearby` Endpoint existiert, aber die Haversine-Distance-Berechnung wurde nicht ausgeführt. Der alte Code gab ALLE User-Räume zurück ohne Filtering.

Der neue Code (seit Commit 59824f9):
1. Berechnet Distance mit Haversine-Formel
2. Filtert Räume nach 20km Radius
3. Sortiert nach Entfernung
4. Berlin (52.5, 13.4) ist ~480km von Koblenz (50.3, 7.6) entfernt → kein Match!

## Zusätzlich: Berlin Testdaten erstellt

Ich habe 10 Berlin-Räume erstellt:
- Berlin-Mitte
- Berlin-Prenzlauer Berg
- Berlin-Kreuzberg
- Berlin-Neukölln
- Berlin-Charlottenburg
- Berlin-Friedrichshain
- Berlin-Wedding
- Berlin-Schöneberg
- Berlin-Tempelhof
- Berlin-Spandau

Diese sollten jetzt im Villages-Dropdown erscheinen (wenn du in Berlin bist)!
