import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { ChatRoom } from '../../types/chat';

interface ChatListProps {
  chatRooms: ChatRoom[];
  onSelectChatRoom: (chatRoomId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chatRooms, onSelectChatRoom }) => {
  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity onPress={() => onSelectChatRoom(item.id)}>
      <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
        <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
        <Text>{item.lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default ChatList;