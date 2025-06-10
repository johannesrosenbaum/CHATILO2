export interface User {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: Date;
}

export interface AuthResponse {
    user: User;
    token: string;
    expiresIn: number;
}