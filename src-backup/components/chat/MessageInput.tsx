import React, { useState } from 'react';

const MessageInput = ({ onSend }) => {
    const [message, setMessage] = useState('');
    const [media, setMedia] = useState(null);

    const handleSend = () => {
        if (message.trim() || media) {
            onSend({ text: message, media });
            setMessage('');
            setMedia(null);
        }
    };

    const handleMediaChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setMedia(URL.createObjectURL(file));
        }
    };

    return (
        <div className="message-input">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <input
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleMediaChange}
            />
            <button onClick={handleSend}>Send</button>
        </div>
    );
};

export default MessageInput;