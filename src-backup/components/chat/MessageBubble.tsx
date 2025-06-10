import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Message } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
  onLike: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onLike }) => {
  const handleLike = () => {
    onLike(message.id);
  };

  return (
    <View style={{ margin: 10, padding: 10, borderRadius: 10, backgroundColor: '#f1f1f1' }}>
      {message.type === 'text' && <Text>{message.content}</Text>}
      {message.type === 'image' && <Image source={{ uri: message.content }} style={{ width: 200, height: 200 }} />}
      {message.type === 'video' && <Text>Video message (not displayed)</Text>}
      {message.type === 'audio' && <Text>Audio message (not displayed)</Text>}
      <TouchableOpacity onPress={handleLike}>
        <Text>Like ({message.likes})</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MessageBubble;