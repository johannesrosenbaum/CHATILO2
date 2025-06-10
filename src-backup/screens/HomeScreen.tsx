import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getNearbyChatRooms } from '../services/chatService';
import Sidebar from '../components/navigation/Sidebar';

const HomeScreen = () => {
    const [chatRooms, setChatRooms] = useState([]);

    useEffect(() => {
        const fetchChatRooms = async () => {
            const rooms = await getNearbyChatRooms();
            setChatRooms(rooms);
        };

        fetchChatRooms();
    }, []);

    const renderChatRoom = ({ item }) => (
        <View style={styles.chatRoom}>
            <Text style={styles.chatRoomName}>{item.name}</Text>
            <Text style={styles.chatRoomDescription}>{item.description}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Sidebar />
            <FlatList
                data={chatRooms}
                renderItem={renderChatRoom}
                keyExtractor={(item) => item.id}
                style={styles.chatRoomList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    chatRoomList: {
        flex: 1,
        padding: 10,
    },
    chatRoom: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    chatRoomName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    chatRoomDescription: {
        fontSize: 14,
        color: '#666',
    },
});

export default HomeScreen;