const createMessage = async (req, res) => {
  try {
    const { content, chatRoom } = req.body;
    const userId = req.user.id;

    // VALIDATION: Prüfe ob chatRoom vorhanden ist
    if (!chatRoom) {
      return res.status(400).json({ 
        error: 'ChatRoom ist erforderlich',
        details: 'chatRoom field is missing in request body'
      });
    }

    // Prüfe ob ChatRoom existiert
    const room = await ChatRoom.findById(chatRoom);
    if (!room) {
      return res.status(404).json({ error: 'ChatRoom nicht gefunden' });
    }

    const message = new Message({
      content,
      sender: userId,
      chatRoom: chatRoom, // EXPLIZIT chatRoom setzen
      timestamp: new Date()
    });

    const savedMessage = await message.save();
    
    // Populate sender und chatRoom für vollständige Antwort
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'username')
      .populate('chatRoom', 'name');

    // Socket.IO Broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(chatRoom).emit('message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('❌ Error creating message:', error);
    res.status(500).json({ 
      error: 'Fehler beim Erstellen der Nachricht',
      details: error.message 
    });
  }
};