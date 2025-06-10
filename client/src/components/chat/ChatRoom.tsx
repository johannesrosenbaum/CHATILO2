import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';

const ChatRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const { messages, joinRoom, sendMessage, currentRoom } = useSocket();
    const [loading, setLoading] = useState(true);
    const [inputMessage, setInputMessage] = useState('');

    useEffect(() => {
        if (roomId && roomId !== currentRoom) {
            console.log('🚪 ChatRoom component: Joining room', roomId);
            setLoading(true);
            joinRoom(roomId);
            
            const timer = setTimeout(() => {
                setLoading(false);
            }, 1000);
            
            return () => clearTimeout(timer);
        } else if (roomId === currentRoom) {
            setLoading(false);
        }
    }, [roomId, currentRoom, joinRoom]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            console.log('📤 ChatRoom: Sending message:', inputMessage);
            sendMessage(inputMessage);
            setInputMessage('');
        }
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                fontSize: '16px',
                color: '#666'
            }}>
                Lade Chat-Raum...
            </div>
        );
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '16px',
                backgroundColor: '#f5f5f5'
            }}>
                {messages && messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div key={msg._id || msg.id || index} style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                maxWidth: '70%',
                                padding: '12px 16px',
                                borderRadius: '18px',
                                backgroundColor: '#E5E5EA',
                                color: 'black'
                            }}>
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: '#666'
                                }}>
                                    {msg.user?.username || msg.username || 'Unbekannt'}
                                </div>
                                <div style={{ fontSize: '14px' }}>
                                    {msg.content}
                                </div>
                                <div style={{ 
                                    fontSize: '10px', 
                                    color: '#999', 
                                    marginTop: '4px',
                                    opacity: 0.7
                                }}>
                                    {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString('de-DE', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ 
                        textAlign: 'center', 
                        color: '#999', 
                        marginTop: '50px',
                        fontSize: '14px'
                    }}>
                        Noch keine Nachrichten. Schreibe die erste Nachricht!
                    </div>
                )}
            </div>
            
            <form onSubmit={handleSendMessage} style={{
                display: 'flex',
                padding: '16px',
                backgroundColor: 'white',
                borderTop: '1px solid #e0e0e0'
            }}>
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Nachricht schreiben..."
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '20px',
                        outline: 'none',
                        fontSize: '14px'
                    }}
                />
                <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    style={{
                        marginLeft: '8px',
                        padding: '12px 20px',
                        backgroundColor: inputMessage.trim() ? '#007AFF' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                        fontSize: '14px'
                    }}
                >
                    Senden
                </button>
            </form>
        </div>
    );
};

export default ChatRoom;
