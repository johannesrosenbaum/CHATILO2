const axios = require('axios');

// Base URL für die API
const BASE_URL = 'http://localhost:1113/api';
const TARGET_ROOM_ID = '68bed34802ff5e936fbbb4e2'; // Der bestehende Raum

async function loadSampleDataIntoRoom() {
  try {
    console.log(`🎯 Loading sample data into room: ${TARGET_ROOM_ID}`);

    // Erstelle einen Test-Account falls nicht vorhanden
    const testUsers = [
      { username: 'reddit_demo_user', email: 'reddit_demo@test.com', password: 'test123' },
      { username: 'tech_poster_2025', email: 'tech_poster@test.com', password: 'test123' },
      { username: 'sample_user_xyz', email: 'sample_user@test.com', password: 'test123' }
    ];

    const activeUsers = [];

    // Registriere Test-Users
    for (const userData of testUsers) {
      try {
        console.log(`👤 Registering: ${userData.username}`);
        const response = await axios.post(`${BASE_URL}/auth/register`, userData);
        activeUsers.push({
          token: response.data.token,
          user: response.data.user,
          username: userData.username
        });
        console.log(`✅ ${userData.username} registered successfully`);
      } catch (error) {
        console.log(`❌ Registration failed for ${userData.username}:`, error.response?.data || error.message);
        
        if (error.response?.status === 409) {
          // User existiert bereits - versuche Login
          console.log(`🔄 Trying to login existing user: ${userData.username}`);
          try {
            const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
              email: userData.email,
              password: userData.password
            });
            activeUsers.push({
              token: loginResponse.data.token,
              user: loginResponse.data.user,
              username: userData.username
            });
            console.log(`✅ ${userData.username} logged in successfully`);
          } catch (loginError) {
            console.log(`⚠️ Could not login ${userData.username}:`, loginError.response?.data || loginError.message);
          }
        } else if (error.code === 'ECONNREFUSED') {
          console.log(`🔌 Connection refused - is the server running on ${BASE_URL}?`);
        }
      }
    }

    if (activeUsers.length === 0) {
      console.error('❌ No users available');
      console.log('💡 Tip: You can create users manually or use existing accounts');
      console.log('💡 Try logging in with existing credentials via the web interface first');
      return;
    }

    console.log(`👥 ${activeUsers.length} users ready for posting`);

    // Reddit-Style Posts für den spezifischen Raum
    const posts = [
      {
        content: `🚀 React vs Vue im Jahr 2025 - Was ist euer Favorit?

Hey Leute! Ich starte gerade ein neues Projekt und bin hin- und hergerissen zwischen React und Vue. 

**React Pros:**
- Riesige Community und Job Market
- Viele Libraries und Tools
- Backed by Meta

**Vue Pros:** 
- Einfacher zu lernen
- Cleaner Template Syntax  
- Bessere Performance out-of-the-box

Was sind eure Erfahrungen? Besonders interessiert mich:
- Performance bei großen Apps
- Learning Curve für neue Entwickler
- Ecosystem und Third-Party Support

#react #vue #frontend #webdev`,
        user: activeUsers[0]
      },
      {
        content: `💻 TypeScript Migration - Meine Erfahrungen nach 6 Monaten

Vor einem halben Jahr habe ich unser 50k+ LOC JavaScript Projekt auf TypeScript migriert. Hier meine Learnings:

**Was gut lief:**
✅ 40% weniger Runtime Errors  
✅ Viel bessere IDE Support  
✅ Refactoring wurde zum Kinderspiel  
✅ Neue Devs verstehen den Code schneller  

**Was schwierig war:**
❌ Third-Party Library Types teilweise schlecht  
❌ Legacy Code Integration dauerte länger als gedacht  
❌ Team musste sich an strict mode gewöhnen  

**Meine Top Tipps:**
1. Startet mit \`strict: false\` und aktiviert Features schrittweise
2. Nutzt \`any\` am Anfang, aber plant deren Elimination  
3. Investiert Zeit in gute \`@types\` für eure Core Libraries
4. Automated Tests sind euer Freund während der Migration

Wer hat ähnliche Erfahrungen gemacht? #typescript #javascript #migration`,
        user: activeUsers[1]
      },
      {
        content: `🤖 KI-Tools die mein Dev-Leben revolutioniert haben

2025 ist das Jahr der KI-Tools für Entwickler! Hier meine absolute Must-Haves:

**🥇 GitHub Copilot**
- Unglaublich gut für Boilerplate Code
- Versteht Context sehr gut
- Spart mir 2-3h täglich

**🥈 ChatGPT-4o für Code Reviews**  
- Findet Bugs die ich übersehe
- Erklärt komplexe Algorithmen super
- Hilft bei Debugging von Legacy Code

**🥉 Tabnine für Auto-Complete**
- Funktioniert offline  
- Sehr schnell und präzise
- Gute Privacy (läuft lokal)

**Geheimtipp: Claude für Dokumentation** 📚
- Schreibt bessere Docs als ich
- Generiert README files automatisch  
- Code Comments werden endlich lesbar

Welche Tools nutzt ihr? Habt ihr Bedenken wegen Code-Qualität oder Abhängigkeit von KI?

#ai #github #copilot #chatgpt #productivity`,
        user: activeUsers[2]
      },
      {
        content: `😅 CSS ist manchmal wie schwarze Magie...

Wer kennt das? Du änderst eine Zeile CSS und plötzlich:
- Das Layout bricht komplett zusammen  
- Ein Element verschwindet spurlos
- Margin funktioniert in eine Richtung aber nicht in die andere
- \`position: absolute\` löst alle Probleme (oder macht sie schlimmer)

**Mein CSS-Debugging Prozess:**
1. \`border: 1px solid red;\` überall hinzufügen 🔴
2. Flexbox vs Grid googeln (zum 1000. Mal) 🔍  
3. Random Properties ausprobieren bis es funktioniert 🎲
4. Kommentar schreiben: "Keine Ahnung warum, aber funktioniert" 🤷‍♂️

\`\`\`css
.mystery-fix {
  position: relative;
  z-index: 999;
  transform: translateZ(0);
  /* Warum funktioniert das??? */
}
\`\`\`

**Question:** Ist das nur bei mir so oder kämpft ihr auch täglich mit CSS? 😂

Teilt eure besten "CSS macht keinen Sinn" Momente! 

#css #frontend #webdev #debugging #meme`,
        user: activeUsers[0]
      },
      {
        content: `🎉 Mein erstes Open Source Projekt hat 1000 Stars! 

Nach 8 Monaten harter Arbeit hat mein React Component Library endlich die 1k Stars Marke geknackt! 🌟

**Was ist es?** 
Eine Collection von accessible, themeable UI Components für React Apps.

**Tech Stack:**
- ⚛️ React 18 + TypeScript  
- 🎨 Styled Components + CSS-in-JS
- 📱 Full Responsive Design
- ♿ WCAG 2.1 AA Compliant  
- 📦 Tree-shaking optimized
- 🧪 100% Test Coverage (Jest + RTL)

**Features:**
✅ 25+ Components (Button, Modal, Table, etc.)  
✅ Dark/Light Mode built-in  
✅ Custom Theming System  
✅ SSR Support  
✅ 0 Dependencies  

**Stats nach 8 Monaten:**
- 1,024 GitHub Stars ⭐  
- 15,000 weekly npm downloads 📦
- 12 Contributors 👥  
- 95% Bundle Size Reduction vs. Material-UI 📊

**Nächste Schritte:**
- React Server Components Support
- Figma Plugin für Design Tokens  
- Vue.js Port (wenn genug Interest)

Link in Bio! Feedback und Contributions welcome! 🚀

Was war euer erstes erfolgreiches OSS Projekt? Tipps für Marketing?

#opensource #react #ui #components #typescript #github`,
        user: activeUsers[1]
      }
    ];

    const createdPosts = [];

    // Posts in den spezifischen Raum erstellen
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      try {
        console.log(`📝 Creating post ${i + 1} in room ${TARGET_ROOM_ID}: ${post.content.substring(0, 50)}...`);
        
        const response = await axios.post(
          `${BASE_URL}/chat/rooms/${TARGET_ROOM_ID}/messages`,
          { content: post.content },
          { headers: { Authorization: `Bearer ${post.user.token}` } }
        );
        
        createdPosts.push({
          ...response.data,
          authorToken: post.user.token
        });
        
        console.log(`✅ Post ${i + 1} created with ID: ${response.data._id}`);
        
        // Kurz warten zwischen Posts
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        console.log(`❌ Error creating post ${i + 1}:`, error.response?.data?.message || error.message);
      }
    }

    console.log(`\n📊 Successfully created ${createdPosts.length} posts in room ${TARGET_ROOM_ID}`);

    // Sample Comments hinzufügen
    if (createdPosts.length > 0) {
      console.log('\n💬 Adding sample comments...');
      
      const comments = [
        {
          postIndex: 0, // React vs Vue
          content: "Ich bin Team React! 🚀 Die Job-Opportunities sind einfach unschlagbar. Aber Vue ist definitiv einsteigerfreundlicher.",
          userIndex: 1
        },
        {
          postIndex: 0,
          content: "Vue 3 mit Composition API ist aber richtig nice geworden! Fast wie React Hooks aber cleaner IMO. 💚",
          userIndex: 2  
        },
        {
          postIndex: 1, // TypeScript
          content: "Super Post! 👏 Wir haben auch migriert letztes Jahr. Der Tipp mit strict: false war Gold wert!",
          userIndex: 0
        },
        {
          postIndex: 1,
          content: "Wie lange hat die Migration insgesamt gedauert? Wir überlegen auch gerade...",
          userIndex: 2
        },
        {
          postIndex: 2, // KI Tools  
          content: "GitHub Copilot ist echt crazy! 🤯 Manchmal weiß es besser was ich will als ich selbst 😅",
          userIndex: 0
        },
        {
          postIndex: 3, // CSS Meme
          content: "Hahaha so true! 😂 Ich hab mal 3 Stunden gebraucht um ein div zu zentrieren... #cssstruggle",
          userIndex: 1
        },
        {
          postIndex: 4, // Open Source
          content: "Wow congrats! 🎉 1k stars ist ein richtig nice Milestone. Werde definitiv mal reinschauen!",
          userIndex: 0
        }
      ];

      for (const comment of comments) {
        if (createdPosts[comment.postIndex] && activeUsers[comment.userIndex]) {
          try {
            const parentPost = createdPosts[comment.postIndex];
            const commentUser = activeUsers[comment.userIndex];
            
            console.log(`💬 Adding comment to post ${comment.postIndex + 1}...`);
            
            const replyResponse = await axios.post(
              `${BASE_URL}/chat/messages/${parentPost._id}/reply`,
              { content: comment.content },
              { headers: { Authorization: `Bearer ${commentUser.token}` } }
            );
            
            console.log(`✅ Comment added successfully`);
            await new Promise(resolve => setTimeout(resolve, 500));
            
          } catch (error) {
            console.log(`❌ Error adding comment:`, error.response?.data?.message || error.message);
          }
        }
      }
    }

    console.log(`\n🎉 Sample data loading completed for room ${TARGET_ROOM_ID}!`);
    console.log(`\n📍 Navigate to: http://localhost:3000/chat/room/${TARGET_ROOM_ID}`);
    console.log(`\n🌟 Test accounts created:`);
    activeUsers.forEach(user => {
      console.log(`   - ${user.username}`);
    });
    console.log(`\n✨ Features to test:`);
    console.log(`   - Reddit-style threaded discussions`);
    console.log(`   - Upvote/downvote system`); 
    console.log(`   - Nested comment replies`);
    console.log(`   - Colored thread lines`);
    console.log(`   - Post sorting (Latest/Hot/Top)`);

  } catch (error) {
    console.error('❌ Error loading sample data:', error.message);
  }
}

// Script ausführen
loadSampleDataIntoRoom();
