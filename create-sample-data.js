const axios = require('axios');

// Base URL für die API
const BASE_URL = 'http://localhost:1113/api';

async function createSampleData() {
  try {
    console.log('🌱 Creating sample Reddit-style data via API...');

    // Erste Benutzer registrieren oder verwenden (falls vorhanden)
    const users = [
      { username: 'techguru', email: 'techguru@example.com', password: 'password123' },
      { username: 'codemaster', email: 'codemaster@example.com', password: 'password123' },
      { username: 'designqueen', email: 'designqueen@example.com', password: 'password123' },
      { username: 'datascientist', email: 'datascientist@example.com', password: 'password123' },
      { username: 'fullstack_dev', email: 'fullstack@example.com', password: 'password123' }
    ];

    const registeredUsers = [];

    // Benutzer registrieren
    for (const userData of users) {
      try {
        console.log(`📝 Registering user: ${userData.username}`);
        const response = await axios.post(`${BASE_URL}/auth/register`, userData);
        registeredUsers.push({
          token: response.data.token,
          user: response.data.user,
          ...userData
        });
        console.log(`✅ User ${userData.username} registered successfully`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`👤 User ${userData.username} already exists, trying to login...`);
          try {
            const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
              email: userData.email,
              password: userData.password
            });
            registeredUsers.push({
              token: loginResponse.data.token,
              user: loginResponse.data.user,
              ...userData
            });
            console.log(`✅ User ${userData.username} logged in successfully`);
          } catch (loginError) {
            console.log(`⚠️ Could not login ${userData.username}, skipping...`);
          }
        } else {
          console.log(`⚠️ Error with user ${userData.username}:`, error.response?.data || error.message);
        }
      }
    }

    if (registeredUsers.length === 0) {
      console.error('❌ No users available, cannot create posts');
      return;
    }

    console.log(`👥 Successfully prepared ${registeredUsers.length} users`);

    // Chat-Raum erstellen oder verwenden
    let roomId = 'tech_talk_room';
    console.log(`🏠 Using room: ${roomId}`);

    // Sample Posts erstellen
    const posts = [
      {
        content: `🚀 React vs Vue - Was ist besser für Anfänger?

Ich arbeite seit ein paar Monaten mit React und überlege, ob ich zu Vue wechseln sollte. Was sind eure Erfahrungen?

React hat definitiv eine größere Community und mehr Jobs, aber Vue scheint einfacher zu lernen zu sein. Was denkt ihr?

#react #vue #webdev`,
        user: registeredUsers[0]
      },
      {
        content: `💻 TypeScript ist ein Game-Changer! 

Wer von euch nutzt schon TypeScript? Ich bin gerade dabei, mein JavaScript-Projekt zu migrieren und bin begeistert von der besseren IntelliSense und Fehlerbehandlung.

Tipps für die Migration? Besonders interessiert bin ich an:
- Best Practices für Types
- Umgang mit Third-Party Libraries
- Graduelle Migration vs. Big Bang

#typescript #javascript #migration`,
        user: registeredUsers[1]
      },
      {
        content: `🤖 Welche KI-Tools nutzt ihr für die Entwicklung?

ChatGPT, GitHub Copilot, Tabnine... Es gibt so viele Optionen. Was hat euch am meisten geholfen?

Ich bin besonders interessiert an Tools für:
- Code-Reviews 
- Bug-Fixing
- Dokumentation
- Test-Generierung

Was sind eure Erfahrungen? #ai #tools #productivity`,
        user: registeredUsers[2]
      },
      {
        content: `😅 CSS ist wie Zauberei...

Es funktioniert, aber niemand weiß warum. Und wenn es kaputt geht, ändert man random Properties bis es wieder funktioniert.

\`\`\`css
.mystery {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  /* Warum funktioniert das?? */
}
\`\`\`

Wer kennt's? 🎭 #css #webdev #meme`,
        user: registeredUsers[3]
      },
      {
        content: `🎉 Mein erstes MERN-Stack Projekt ist online!

Nach 3 Monaten Learning ist meine Todo-App endlich live:
- ⚛️ React Frontend mit Hooks
- 🚀 Node.js/Express Backend  
- 🍃 MongoDB Database
- 🔄 Socket.io für Real-time Updates
- 🎨 Material-UI Design
- 🐳 Docker Deployment

Was haltet ihr davon? Feedback willkommen!

Demo: https://my-awesome-todo.herokuapp.com
GitHub: https://github.com/dev/todo-app

#mern #react #nodejs #mongodb #portfolio`,
        user: registeredUsers[4]
      }
    ];

    const createdPosts = [];

    // Posts erstellen
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      try {
        console.log(`📝 Creating post ${i + 1}: ${post.content.substring(0, 50)}...`);
        
        const response = await axios.post(
          `${BASE_URL}/chat/rooms/${roomId}/messages`,
          { content: post.content },
          { headers: { Authorization: `Bearer ${post.user.token}` } }
        );
        
        createdPosts.push(response.data);
        console.log(`✅ Post ${i + 1} created successfully`);
        
        // Kurz warten zwischen Posts
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`⚠️ Error creating post ${i + 1}:`, error.response?.data || error.message);
      }
    }

    console.log(`📊 Successfully created ${createdPosts.length} posts`);

    // Sample Kommentare hinzufügen
    const comments = [
      {
        parentIndex: 0, // React vs Vue Post
        content: "Ich würde bei React bleiben! Die Community ist einfach riesig und du findest zu jedem Problem eine Lösung auf Stack Overflow. 📚",
        user: registeredUsers[1]
      },
      {
        parentIndex: 0,
        content: "Das stimmt, aber Vue ist viel intuitiver! Ich habe mit Vue angefangen und fand es super einsteigerfreundlich. 💚",
        user: registeredUsers[2]
      },
      {
        parentIndex: 0,
        content: "Warum nicht beide lernen? 😄 Ich nutze React für große Projekte und Vue für schnelle Prototypen.",
        user: registeredUsers[3]
      },
      {
        parentIndex: 1, // TypeScript Post
        content: "Fangt mit strict: false an und aktiviert die strict-Optionen nach und nach. So ist der Übergang weniger schmerzhaft. 🎯",
        user: registeredUsers[4]
      },
      {
        parentIndex: 1,
        content: "Absolut! Und nutzt \"any\" nicht zu oft, auch wenn es verlockend ist. 😅 Lieber die Types richtig definieren.",
        user: registeredUsers[0]
      },
      {
        parentIndex: 2, // KI Tools Post
        content: "GitHub Copilot ist fantastisch für repetitive Aufgaben! Spart mir täglich Stunden. 🤖",
        user: registeredUsers[0]
      },
      {
        parentIndex: 2,
        content: "ChatGPT für Erklärungen und Debugging ist unschlagbar. Besonders bei komplexen Fehlermeldungen. 🧠",
        user: registeredUsers[4]
      },
      {
        parentIndex: 3, // CSS Meme Post
        content: "Hahaha so wahr! 😂 Flexbox hat mein Leben gerettet, aber Grid ist immer noch ein Mysterium für mich.",
        user: registeredUsers[2]
      },
      {
        parentIndex: 4, // MERN Project Post  
        content: "Sehr cool! Wie hast du das Deployment gemacht? Heroku oder was anderes? 🚀",
        user: registeredUsers[1]
      },
      {
        parentIndex: 4,
        content: "Gratulation! 🎊 Das Design sieht sehr clean aus. Hast du ein UI Framework verwendet?",
        user: registeredUsers[0]
      }
    ];

    // Kommentare erstellen
    for (const comment of comments) {
      if (createdPosts[comment.parentIndex]) {
        try {
          const parentId = createdPosts[comment.parentIndex]._id;
          console.log(`💬 Adding comment to post ${comment.parentIndex + 1}: ${comment.content.substring(0, 30)}...`);
          
          await axios.post(
            `${BASE_URL}/chat/messages/${parentId}/reply`,
            { content: comment.content },
            { headers: { Authorization: `Bearer ${comment.user.token}` } }
          );
          
          console.log(`✅ Comment added successfully`);
          
          // Kurz warten zwischen Kommentaren
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.log(`⚠️ Error adding comment:`, error.response?.data || error.message);
        }
      }
    }

    console.log('🎉 Sample data creation completed!');
    console.log(`📍 Navigate to room "${roomId}" to see the Reddit-style interface!`);
    console.log('🌟 Features to test:');
    console.log('   - Threaded comments with colored lines');
    console.log('   - Voting system (upvote/downvote)');
    console.log('   - Reply functionality');
    console.log('   - Sorting (Latest, Hot, Top)');
    console.log('   - New post creation');

  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  }
}

// Script ausführen
createSampleData();
