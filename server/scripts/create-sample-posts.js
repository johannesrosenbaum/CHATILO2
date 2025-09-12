const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');

// Verbindung zur MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/chatilo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function createSamplePosts() {
  try {
    console.log('🌱 Creating sample Reddit-style posts...');

    // Finde oder erstelle Beispiel-Benutzer
    let users = await User.find().limit(5);
    if (users.length === 0) {
      console.log('📝 Creating sample users...');
      users = await User.insertMany([
        { username: 'techguru', email: 'techguru@example.com', password: 'hashedpassword' },
        { username: 'codemaster', email: 'codemaster@example.com', password: 'hashedpassword' },
        { username: 'designqueen', email: 'designqueen@example.com', password: 'hashedpassword' },
        { username: 'datascientist', email: 'datascientist@example.com', password: 'hashedpassword' },
        { username: 'fullstack_dev', email: 'fullstack@example.com', password: 'hashedpassword' }
      ]);
    }

    // Finde oder erstelle einen Chat-Raum
    let room = await ChatRoom.findOne({ name: 'Tech Talk' });
    if (!room) {
      room = await ChatRoom.create({
        name: 'Tech Talk',
        description: 'Diskussionen über Technologie und Programmierung',
        participants: users.map(u => u._id)
      });
    }

    // Lösche alte Sample Posts
    await Message.deleteMany({ content: { $regex: /🌱 SAMPLE/ } });

    // Post 1: Haupt-Post über React vs Vue
    const post1 = await Message.create({
      content: `🌱 SAMPLE: React vs Vue - Was ist besser für Anfänger?

Ich arbeite seit ein paar Monaten mit React und überlege, ob ich zu Vue wechseln sollte. Was sind eure Erfahrungen?

React hat definitiv eine größere Community und mehr Jobs, aber Vue scheint einfacher zu lernen zu sein. Was denkt ihr?`,
      sender: users[0]._id,
      room: room._id,
      isPost: true,
      level: 0,
      threadId: null,
      upvotes: [users[1]._id, users[2]._id, users[3]._id],
      downvotes: [],
      score: 3,
      childrenCount: 4
    });

    // Antworten auf Post 1
    const reply1_1 = await Message.create({
      content: `🌱 SAMPLE: Ich würde bei React bleiben! Die Community ist einfach riesig und du findest zu jedem Problem eine Lösung auf Stack Overflow.`,
      sender: users[1]._id,
      room: room._id,
      isPost: false,
      level: 1,
      threadId: post1._id,
      parentMessage: post1._id,
      upvotes: [users[0]._id, users[2]._id],
      downvotes: [],
      score: 2,
      childrenCount: 2
    });

    const reply1_1_1 = await Message.create({
      content: `🌱 SAMPLE: Das stimmt, aber Vue ist viel intuitiver! Ich habe mit Vue angefangen und fand es super einsteigerfreundlich.`,
      sender: users[2]._id,
      room: room._id,
      isPost: false,
      level: 2,
      threadId: post1._id,
      parentMessage: reply1_1._id,
      upvotes: [users[3]._id],
      downvotes: [],
      score: 1,
      childrenCount: 0
    });

    const reply1_1_2 = await Message.create({
      content: `🌱 SAMPLE: @designqueen hat einen Punkt. Vue's Template-Syntax ist definitiv näher an HTML, was für Designer besser ist.`,
      sender: users[4]._id,
      room: room._id,
      isPost: false,
      level: 2,
      threadId: post1._id,
      parentMessage: reply1_1._id,
      upvotes: [users[2]._id],
      downvotes: [],
      score: 1,
      childrenCount: 0
    });

    const reply1_2 = await Message.create({
      content: `🌱 SAMPLE: Warum nicht beide lernen? 😄 Ich nutze React für große Projekte und Vue für schnelle Prototypen.`,
      sender: users[3]._id,
      room: room._id,
      isPost: false,
      level: 1,
      threadId: post1._id,
      parentMessage: post1._id,
      upvotes: [users[0]._id, users[1]._id, users[4]._id],
      downvotes: [],
      score: 3,
      childrenCount: 0
    });

    // Post 2: TypeScript Diskussion
    const post2 = await Message.create({
      content: `🌱 SAMPLE: TypeScript ist ein Game-Changer! 🚀

Wer von euch nutzt schon TypeScript? Ich bin gerade dabei, mein JavaScript-Projekt zu migrieren und bin begeistert von der besseren IntelliSense und Fehlerbehandlung.

Tipps für die Migration?`,
      sender: users[1]._id,
      room: room._id,
      isPost: true,
      level: 0,
      threadId: null,
      upvotes: [users[0]._id, users[2]._id, users[3]._id, users[4]._id],
      downvotes: [],
      score: 4,
      childrenCount: 2
    });

    const reply2_1 = await Message.create({
      content: `🌱 SAMPLE: Fangt mit strict: false an und aktiviert die strict-Optionen nach und nach. So ist der Übergang weniger schmerzhaft.`,
      sender: users[4]._id,
      room: room._id,
      isPost: false,
      level: 1,
      threadId: post2._id,
      parentMessage: post2._id,
      upvotes: [users[1]._id, users[2]._id],
      downvotes: [],
      score: 2,
      childrenCount: 0
    });

    const reply2_2 = await Message.create({
      content: `🌱 SAMPLE: Absolut! Und nutzt "any" nicht zu oft, auch wenn es verlockend ist. 😅 Lieber die Types richtig definieren.`,
      sender: users[0]._id,
      room: room._id,
      isPost: false,
      level: 1,
      threadId: post2._id,
      parentMessage: post2._id,
      upvotes: [users[1]._id, users[3]._id, users[4]._id],
      downvotes: [],
      score: 3,
      childrenCount: 0
    });

    // Post 3: AI/ML Diskussion
    const post3 = await Message.create({
      content: `🌱 SAMPLE: Welche KI-Tools nutzt ihr für die Entwicklung?

ChatGPT, GitHub Copilot, Tabnine... Es gibt so viele Optionen. Was hat euch am meisten geholfen?

Ich bin besonders interessiert an Tools für Code-Reviews und Bug-Fixing.`,
      sender: users[2]._id,
      room: room._id,
      isPost: true,
      level: 0,
      threadId: null,
      upvotes: [users[0]._id, users[4]._id],
      downvotes: [users[3]._id],
      score: 1,
      childrenCount: 3
    });

    const reply3_1 = await Message.create({
      content: `🌱 SAMPLE: GitHub Copilot ist fantastisch für repetitive Aufgaben! Spart mir täglich Stunden.`,
      sender: users[0]._id,
      room: room._id,
      isPost: false,
      level: 1,
      threadId: post3._id,
      parentMessage: post3._id,
      upvotes: [users[2]._id, users[4]._id],
      downvotes: [],
      score: 2,
      childrenCount: 1
    });

    const reply3_1_1 = await Message.create({
      content: `🌱 SAMPLE: Aber aufpassen mit der Code-Qualität! KI kann manchmal suboptimale Lösungen vorschlagen.`,
      sender: users[3]._id,
      room: room._id,
      isPost: false,
      level: 2,
      threadId: post3._id,
      parentMessage: reply3_1._id,
      upvotes: [users[1]._id, users[2]._id],
      downvotes: [],
      score: 2,
      childrenCount: 0
    });

    const reply3_2 = await Message.create({
      content: `🌱 SAMPLE: ChatGPT für Erklärungen und Debugging ist unschlagbar. Besonders bei komplexen Fehlermeldungen.`,
      sender: users[4]._id,
      room: room._id,
      isPost: false,
      level: 1,
      threadId: post3._id,
      parentMessage: post3._id,
      upvotes: [users[0]._id, users[2]._id],
      downvotes: [],
      score: 2,
      childrenCount: 0
    });

    // Post 4: Kurzer Meme-Post
    const post4 = await Message.create({
      content: `🌱 SAMPLE: CSS ist wie Zauberei... 🎭

Es funktioniert, aber niemand weiß warum. Und wenn es kaputt geht, ändert man random Properties bis es wieder funktioniert. 😅

\`\`\`css
.mystery {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  /* Warum funktioniert das?? */
}
\`\`\``,
      sender: users[3]._id,
      room: room._id,
      isPost: true,
      level: 0,
      threadId: null,
      upvotes: [users[0]._id, users[1]._id, users[2]._id, users[4]._id],
      downvotes: [],
      score: 4,
      childrenCount: 1
    });

    const reply4_1 = await Message.create({
      content: `🌱 SAMPLE: Hahaha so wahr! 😂 Flexbox hat mein Leben gerettet, aber Grid ist immer noch ein Mysterium für mich.`,
      sender: users[2]._id,
      room: room._id,
      isPost: false,
      level: 1,
      threadId: post4._id,
      parentMessage: post4._id,
      upvotes: [users[0]._id, users[3]._id],
      downvotes: [],
      score: 2,
      childrenCount: 0
    });

    // Post 5: Projekt-Showcase
    const post5 = await Message.create({
      content: `🌱 SAMPLE: Mein erstes MERN-Stack Projekt ist online! 🎉

Nach 3 Monaten Learning ist mein Todo-App endlich live:
- React Frontend
- Node.js Backend  
- MongoDB
- Socket.io für Real-time Updates

Was haltet ihr davon? Feedback willkommen!

Link: https://my-awesome-todo.herokuapp.com`,
      sender: users[4]._id,
      room: room._id,
      isPost: true,
      level: 0,
      threadId: null,
      upvotes: [users[0]._id, users[1]._id, users[2]._id],
      downvotes: [],
      score: 3,
      childrenCount: 2
    });

    const reply5_1 = await Message.create({
      content: `🌱 SAMPLE: Sehr cool! Wie hast du das Deployment gemacht? Heroku oder was anderes?`,
      sender: users[1]._id,
      room: room._id,
      isPost: false,
      level: 1,
      threadId: post5._id,
      parentMessage: post5._id,
      upvotes: [users[4]._id],
      downvotes: [],
      score: 1,
      childrenCount: 0
    });

    const reply5_2 = await Message.create({
      content: `🌱 SAMPLE: Gratulation! 🎊 Das Design sieht sehr clean aus. Hast du ein UI Framework verwendet?`,
      sender: users[0]._id,
      room: room._id,
      isPost: false,
      level: 1,
      threadId: post5._id,
      parentMessage: post5._id,
      upvotes: [users[2]._id, users[4]._id],
      downvotes: [],
      score: 2,
      childrenCount: 0
    });

    console.log('✅ Sample posts created successfully!');
    console.log(`📊 Created ${5} posts with ${11} comments`);
    console.log(`🏠 Room: ${room.name} (${room._id})`);
    console.log('🎯 Navigate to the room to see the Reddit-style interface!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample posts:', error);
    process.exit(1);
  }
}

createSamplePosts();
