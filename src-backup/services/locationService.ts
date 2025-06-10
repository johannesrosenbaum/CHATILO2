import { UserLocation, NearbyChatRoom } from '../types/location';

const locationService = {
    getUserLocation: async (): Promise<UserLocation> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser.'));
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve({ latitude, longitude });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    },

    findNearbyChatRooms: async (userLocation: UserLocation): Promise<NearbyChatRoom[]> => {
        // Placeholder for API call to fetch nearby chat rooms based on user location
        const response = await fetch(`/api/chatrooms?lat=${userLocation.latitude}&lon=${userLocation.longitude}`);
        if (!response.ok) {
            throw new Error('Failed to fetch nearby chat rooms');
        }
        return response.json();
    }
};

export default locationService;