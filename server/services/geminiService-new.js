const axios = require('axios');

const GEMINI_API_KEY = 'AIzaSyD_QU3qO_OxhXOJw_P-Mxd_7UNobZ4vqm4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

class GeminiService {
  async generateWelcomeMessage(locationName, nearbyPlaces = []) {
    try {
      console.log('🤖 Generating welcome message for:', locationName);
      
      const prompt = `Du bist eine coole, lockere KI für die Chatilo-App. Erstelle eine kurze, entspannte Begrüßung (max. 40 Wörter) für einen Nutzer in der Region ${locationName}. 

Schreibstil: 
- Sehr locker und entspannt ("Aloha", "Hey", "Was geht")
- Kurz und knackig
- Informativ aber chillig
- Verwende "du" 
- Keine Emojis
- Erwähne lokale Chats kurz

Nahe Orte: ${nearbyPlaces.join(', ')}

Beispiel-Ton: "Aloha! Cool, dass du aus [Ort] hier bist. Check die lokalen Chats ab und verbinde dich mit Leuten aus deiner Gegend!"`;

      console.log('🤖 Sending request to Gemini API...');

      const requestData = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 60
        }
      };

      const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('🤖 Gemini API Response Status:', response.status);
      console.log('🤖 Response Data:', JSON.stringify(response.data, null, 2));

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const message = response.data.candidates[0].content.parts[0].text.trim();
        console.log('🤖 Generated message:', message);
        return message;
      } else {
        console.log('❌ Unexpected API response format:', response.data);
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('❌ Gemini API Error:', error.response?.data || error.message);
      // Fallback message - locker und entspannter
      return `Aloha! Cool, dass du aus ${locationName} hier bist. Check die lokalen Chats ab und verbinde dich mit Leuten aus deiner Gegend!`;
    }
  }

  async generateRegionalNews(locationName, nearbyPlaces = []) {
    try {
      console.log('🤖 Generating regional news for:', locationName);
      
      const prompt = `Erstelle einen kurzen, informativen Text (max. 50 Wörter) über mögliche aktuelle Themen und Aktivitäten in der Region ${locationName}. 

Konzentriere dich auf:
- Lokale Veranstaltungen oder saisonale Aktivitäten
- Interessante Orte in der Nähe
- Community-Aktivitäten
- Regionale Besonderheiten

Nahe Orte: ${nearbyPlaces.join(', ')}

Schreibstil: Locker, interessant, auf Deutsch, ohne Emojis. Keine erfundenen spezifischen Events!`;

      const requestData = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 80
        }
      };

      const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('🤖 Regional news API Response Status:', response.status);

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const news = response.data.candidates[0].content.parts[0].text.trim();
        console.log('🤖 Generated news:', news);
        return news;
      } else {
        console.log('❌ Unexpected regional news API response format:', response.data);
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('❌ Gemini regional news API Error:', error.response?.data || error.message);
      // Fallback message - auch lockerer
      return `In ${locationName} gibt es viel zu entdecken! Check lokale Märkte und Outdoor-Spots für coole Begegnungen.`;
    }
  }
}

module.exports = new GeminiService();
