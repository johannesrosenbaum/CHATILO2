# CHATILO - Lokale Chat-App

CHATILO ist eine elegante Chat-Anwendung, die es Nutzern ermöglicht, sich mit Menschen in ihrer unmittelbaren Umgebung zu verbinden. Die App bietet lokale Chaträume basierend auf dem geografischen Standort, Event-Chaträume und Bildungs-Chaträume für Schulen und Universitäten.

## ✨ Features

### 🏠 Lokale Chaträume
- **Automatische Raum-Erstellung**: Chaträume werden automatisch für Dörfer, Stadtteile und Regionen erstellt
- **Standort-basierte Zuordnung**: Nutzer werden automatisch den relevanten Chaträumen zugeordnet
- **Überregionale Chats**: Regionale Chaträume für größere Gebiete

### 🎉 Event-Chaträume
- **Temporäre Events**: Erstelle temporäre Chaträume für Festivals, Konzerte, etc.
- **Konfigurierbare Parameter**: 
  - Standort des Events
  - Radius für Teilnehmer
  - Zeitliche Verfügbarkeit
  - Maximale Teilnehmerzahl
- **Automatische Löschung**: Events werden nach Ablauf automatisch entfernt

### 🎓 Bildungs-Chaträume
- **Schulen & Universitäten**: Automatische Chaträume für Bildungseinrichtungen
- **Studenten-Netzwerk**: Verbinde dich mit Kommilitonen und Kommilitoninnen
- **Campus-Leben**: Bleibe über Campus-Events informiert

### 💬 Chat-Features
- **Multimedia-Unterstützung**: Text, Bilder, Videos, Audio und Dateien
- **Galerie pro Chatraum**: Alle Bilder aus dem Chat werden in einer Galerie gesammelt
- **Like-System**: Gefällt mir-Funktion für Nachrichten
- **Antworten**: Antworten auf spezifische Nachrichten
- **Bearbeiten & Löschen**: Nachrichten bearbeiten und löschen
- **Echtzeit-Updates**: Live-Updates über Socket.io

### 👤 Benutzer-Features
- **Profil-Management**: Vollständige Profilbearbeitung mit Bild
- **Standort-Services**: Automatische Standorterkennung
- **Privatsphäre-Einstellungen**: Konfigurierbare Sichtbarkeit
- **Benachrichtigungen**: Push-Benachrichtigungen für neue Nachrichten

### 🎨 Design
- **Elegantes Dark Mode Design**: Moderne, dunkle Benutzeroberfläche
- **Gradient-Effekte**: Schöne Farbverläufe und Transparenz-Effekte
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Smooth Animations**: Framer Motion Animationen
- **Glassmorphism**: Moderne Glasmorphismus-Effekte

## 🚀 Installation

### Voraussetzungen
- Node.js (v16 oder höher)
- npm oder yarn
- MongoDB
- Git

### 1. Repository klonen
```bash
git clone <repository-url>
cd CHATILO3/chatilo-app
```

### 2. Abhängigkeiten installieren
```bash
# Root-Abhängigkeiten
npm install

# Client-Abhängigkeiten
cd client
npm install

# Server-Abhängigkeiten
cd ../server
npm install
```

### 3. Umgebungsvariablen konfigurieren
Erstelle eine `.env` Datei im Server-Verzeichnis:

```env
# Server Configuration
PORT=1113
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/chatilo

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. MongoDB starten
```bash
# MongoDB lokal starten
mongod

# Oder mit Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Anwendung starten

#### Entwicklung
```bash
# Im Root-Verzeichnis
npm run dev
```

#### Oder separat
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm start
```

#### Produktion
```bash
# Build erstellen
npm run build

# Produktions-Server starten
npm start
```

## 📱 Verwendung

### 1. Registrierung/Anmeldung
- Besuche `http://localhost:3000`
- Registriere dich mit E-Mail oder Google-Account
- Aktiviere Standort-Services

### 2. Chaträume entdecken
- Lokale Chaträume werden automatisch basierend auf deinem Standort angezeigt
- Schulen und Universitäten in deiner Nähe werden als Chaträume angeboten
- Erstelle Events für temporäre Chaträume

### 3. Chatten
- Wähle einen Chatraum aus
- Sende Text-, Bild-, Video- oder Audionachrichten
- Nutze die Galerie um alle Bilder aus dem Chat zu sehen
- Reagiere auf Nachrichten mit Likes

### 4. Profil verwalten
- Bearbeite dein Profilbild und Informationen
- Konfiguriere Privatsphäre-Einstellungen
- Aktualisiere deinen Standort

## 🛠️ Technologie-Stack

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Material-UI** - UI Components
- **Framer Motion** - Animations
- **Socket.io Client** - Real-time Communication
- **React Router** - Navigation
- **Axios** - HTTP Client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **Socket.io** - Real-time Communication
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File Upload
- **Passport** - OAuth

### DevOps
- **Docker** - Containerization
- **Nginx** - Reverse Proxy
- **PM2** - Process Manager

## 📁 Projektstruktur

```
chatilo-app/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React Components
│   │   ├── contexts/       # React Contexts
│   │   ├── theme/          # Material-UI Theme
│   │   ├── types/          # TypeScript Types
│   │   └── App.tsx         # Main App Component
│   ├── public/             # Static Files
│   └── package.json
├── server/                 # Node.js Backend
│   ├── controllers/        # Route Controllers
│   ├── models/            # MongoDB Models
│   ├── routes/            # API Routes
│   ├── middleware/        # Express Middleware
│   ├── sockets/           # Socket.io Handlers
│   └── server.js          # Main Server File
├── uploads/               # File Uploads
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Benutzer registrieren
- `POST /api/auth/login` - Benutzer anmelden
- `GET /api/auth/me` - Aktueller Benutzer
- `PUT /api/auth/profile` - Profil aktualisieren

### Chat Rooms
- `GET /api/chat/rooms` - Alle Chaträume
- `GET /api/chat/rooms/nearby` - Nahe Chaträume
- `POST /api/chat/rooms` - Chatraum erstellen
- `POST /api/chat/rooms/:id/join` - Chatraum beitreten

### Messages
- `GET /api/chat/rooms/:id/messages` - Nachrichten laden
- `POST /api/chat/rooms/:id/messages` - Nachricht senden
- `PUT /api/chat/messages/:id` - Nachricht bearbeiten
- `DELETE /api/chat/messages/:id` - Nachricht löschen

### Events
- `POST /api/events` - Event erstellen
- `GET /api/events` - Events auflisten
- `GET /api/events/:id` - Event Details
- `POST /api/events/:id/join` - Event beitreten

## 🚀 Deployment

### Docker Deployment
```bash
# Build Images
docker-compose build

# Start Services
docker-compose up -d
```

### Manual Deployment
```bash
# Build Client
cd client
npm run build

# Start Server
cd ../server
npm start
```

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT Lizenz lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

## 🆘 Support

Bei Fragen oder Problemen:
- Erstelle ein Issue im GitHub Repository
- Kontaktiere das Entwicklungsteam
- Schaue in die Dokumentation

## 🔮 Roadmap

### Geplante Features
- [ ] Push-Benachrichtigungen
- [ ] Voice/Video Calls
- [ ] Gruppen-Chats
- [ ] Moderation Tools
- [ ] Analytics Dashboard
- [ ] Mobile App (React Native)
- [ ] Offline Support
- [ ] End-to-End Encryption

---

**Entwickelt mit ❤️ für lokale Communities**