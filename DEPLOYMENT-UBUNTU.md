# 🚀 Ubuntu Production Deployment - Reddit-Style Interface

## Quick Deployment Steps

### 1. Pull Latest Changes
```bash
cd /path/to/your/chatilo
git pull origin main
```

### 2. Rebuild Containers
```bash
# Stop current containers
docker-compose down

# Rebuild with latest changes (no cache)
docker-compose build --no-cache

# Start containers
docker-compose up -d
```

### 3. Verify Deployment
```bash
# Check container status
docker-compose ps

# Check logs if needed
docker-compose logs client
docker-compose logs server
```

### 4. Access the Application
- **Main App**: http://your-domain.com
- **Test Room**: http://your-domain.com/chat/room/68bed34802ff5e936fbbb4e2

## ✨ New Reddit-Style Features

### 🎯 What's New:
- **Reddit-style threaded discussions** with visual tree lines
- **Upvote/downvote system** with real-time vote counts  
- **Nested comment replies** up to 10 levels deep
- **Post sorting options** (Latest/Hot/Top)
- **Modern Material-UI design** with responsive layout
- **Colored thread indicators** for better visual hierarchy

### 🧪 Test Accounts (if sample data was loaded):
- `reddit_demo_user` / `test123`
- `tech_poster_2025` / `test123` 
- `sample_user_xyz` / `test123`

### 📱 Features to Test:
1. **Create Posts**: Rich content with markdown-like formatting
2. **Vote System**: Upvote/downvote posts and comments
3. **Comment Threading**: Reply to posts and nested replies
4. **Sorting**: Switch between Latest/Hot/Top views
5. **Responsive Design**: Test on mobile and desktop

## 🛠 Troubleshooting

### If build fails:
```bash
# Clear everything and rebuild
docker system prune -f
docker-compose build --no-cache --pull
docker-compose up -d
```

### If client won't start:
```bash
# Check client logs
docker-compose logs client

# Rebuild only client
docker-compose build client
docker-compose up -d
```

### If database issues:
```bash
# Check server logs
docker-compose logs server

# Restart server
docker-compose restart server
```

## 🎉 Success Indicators

✅ All containers running (`docker-compose ps`)  
✅ Client accessible on port 80/443  
✅ Server responding on API endpoints  
✅ Reddit-style interface loads correctly  
✅ Voting and commenting works  

**🚀 Your Reddit-style chat interface is now live!**
