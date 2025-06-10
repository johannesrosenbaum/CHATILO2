export interface UserLocation {
    latitude: number;
    longitude: number;
}

export interface NearbyChatRoom {
    id: string;
    name: string;
    distance: number; // Distance in kilometers from the user's location
    isActive: boolean; // Indicates if the chat room is currently active
}