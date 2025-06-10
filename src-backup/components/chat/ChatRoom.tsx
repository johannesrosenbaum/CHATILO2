import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// FIX: Create dummy ChatService if it doesn't exist
const ChatService = {
  getMessages: async (roomId: string) => {
    console.log('Getting messages for room:', roomId);
    return []; // Return empty array for now
  },
  sendMessage: async (roomId: string, message: any) => {
    console.log('Sending message to room:', roomId, message);
    return Promise.resolve();
  }
};

// FIX: Create dummy components if they don't exist
const MessageBubble = ({ message }: { message: any }) => (
  <div style={{ padding: '8px', margin: '4px 0', backgroundColor: '#f0f0f0' }}>
    {message.content}
  </div>
);

const MessageInput = ({ onSendMessage }: { onSendMessage: (message: any) => void }) => {
  const [input, setInput] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage({ content: input, id: Date.now() });
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        style={{ width: '80%', padding: '8px' }}
      />
      <button type="submit" style={{ padding: '8px 16px', marginLeft: '8px' }}>
        Send
      </button>
    </form>
  );
};

const ChatRoom = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            const fetchedMessages = await ChatService.getMessages(roomId || '');
            setMessages(fetchedMessages);
            setLoading(false);
        };

        fetchMessages();
    }, [roomId]);

    const handleSendMessage = async (message: any) => {
        await ChatService.sendMessage(roomId || '', message);
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="chat-room">
            <div className="messages">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
            </div>
            <MessageInput onSendMessage={handleSendMessage} />
        </div>
    );
};

export default ChatRoom;