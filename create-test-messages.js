const { MongoClient } = require('mongodb');

async function createTestMessages() {
  const uri = 'mongodb://admin:chatilo123@localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('chatilo');
    
    // Find test user
    const user = await db.collection('users').findOne({ email: 'test@chatilo.com' });
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    console.log('✅ Found test user:', user.username);

    // Find a chat room
    const room = await db.collection('chatrooms').findOne({});
    if (!room) {
      console.log('❌ No chat room found');
      return;
    }
    console.log('✅ Found chat room:', room.name);

    // Create 25 test messages to test pagination
    const messages = [];
    for (let i = 1; i <= 25; i++) {
      messages.push({
        content: `Test message ${i} - This is a longer message to test the chat pagination feature. Lorem ipsum dolor sit amet.`,
        sender: user._id,
        chatRoom: room._id.toString(),
        type: 'text',
        edited: false,
        isDeleted: false,
        likes: [],
        createdAt: new Date(Date.now() - (25 - i) * 60000), // Messages every minute
        timestamp: new Date(Date.now() - (25 - i) * 60000),
        updatedAt: new Date()
      });
    }

    // Insert all messages
    const result = await db.collection('messages').insertMany(messages);
    console.log(`✅ Created ${result.insertedCount} test messages`);

    // Verify total message count
    const totalMessages = await db.collection('messages').countDocuments({ chatRoom: room._id.toString() });
    console.log(`✅ Total messages in room: ${totalMessages}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createTestMessages();
