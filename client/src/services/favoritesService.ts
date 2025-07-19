const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1113';

// Hilfsfunktion zum Abrufen des Auth-Tokens
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export interface FavoriteChatRoom {
  _id: string;
  name: string;
  description?: string;
  type: string;
  subType?: string;
  participants?: number;
  createdBy?: {
    _id: string;
    username: string;
  };
  location?: {
    type: string;
    coordinates: [number, number];
    address?: string;
    city?: string;
  };
  isActive?: boolean;
  createdAt?: string;
}

class FavoritesService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}/api/auth${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Alle Favoriten abrufen
  async getFavorites(): Promise<FavoriteChatRoom[]> {
    try {
      const response = await this.makeRequest('/favorites');
      return response.favorites || [];
    } catch (error) {
      console.error('Fehler beim Abrufen der Favoriten:', error);
      throw error;
    }
  }

  // Chatraum zu Favoriten hinzufügen
  async addToFavorites(roomId: string): Promise<FavoriteChatRoom[]> {
    try {
      const response = await this.makeRequest(`/favorites/${roomId}`, {
        method: 'POST',
      });
      return response.favorites || [];
    } catch (error) {
      console.error('Fehler beim Hinzufügen zu Favoriten:', error);
      throw error;
    }
  }

  // Chatraum aus Favoriten entfernen
  async removeFromFavorites(roomId: string): Promise<FavoriteChatRoom[]> {
    try {
      const response = await this.makeRequest(`/favorites/${roomId}`, {
        method: 'DELETE',
      });
      return response.favorites || [];
    } catch (error) {
      console.error('Fehler beim Entfernen aus Favoriten:', error);
      throw error;
    }
  }

  // Prüfen ob ein Chatraum in den Favoriten ist
  async isFavorite(roomId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav._id === roomId);
    } catch (error) {
      console.error('Fehler beim Prüfen der Favoriten:', error);
      return false;
    }
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService; 