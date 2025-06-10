import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import MessageBubble from '../components/chat/MessageBubble';
import MessageInput from '../components/chat/MessageInput';
import { fetchMessages, sendMessage } from '../services/chatService';
import { useRoute } from '@react-navigation/native';

const ChatScreen = () => {
    const route = useRoute();
    const { chatRoomId } = route.params;
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMessages = async () => {
            const fetchedMessages = await fetchMessages(chatRoomId);
            setMessages(fetchedMessages);
            setLoading(false);
        };

        loadMessages();
    }, [chatRoomId]);

    const handleSendMessage = async (message) => {
        await sendMessage(chatRoomId, message);
        const updatedMessages = await fetchMessages(chatRoomId);
        setMessages(updatedMessages);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                renderItem={({ item }) => <MessageBubble message={item} />}
                keyExtractor={(item) => item.id}
                inverted
            />
            <MessageInput onSend={handleSendMessage} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatScreen;