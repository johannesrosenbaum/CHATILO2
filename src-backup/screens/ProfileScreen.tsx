import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { getUserProfile, updateUserProfile } from '../services/authService';

const ProfileScreen = () => {
    const [user, setUser] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const profile = await getUserProfile();
                setUser(profile);
            } catch (err) {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleUpdateProfile = async () => {
        try {
            await updateUserProfile(user);
            alert('Profile updated successfully');
        } catch (err) {
            setError('Failed to update profile');
        }
    };

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={user.name}
                onChangeText={(text) => setUser({ ...user, name: text })}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={user.email}
                onChangeText={(text) => setUser({ ...user, email: text })}
                keyboardType="email-address"
            />
            <Button title="Update Profile" onPress={handleUpdateProfile} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    error: {
        color: 'red',
        marginBottom: 15,
    },
});

export default ProfileScreen;