const axios = require('axios');

const GEMINI_API_KEY = 'AIzaSyD_QU3qO_OxhXOJw_P-Mxd_7UNobZ4vqm4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

class GeminiService {
  async generateWelcomeMessage(locationName, nearbyPlaces = []) {
    try {
      console.log('🤖 Generating welcome message for:', locationName);
      
      const prompt = `Erstelle eine kurze, natürliche Begrüßung (max. 30 Wörter) für einen Nutzer in der Region ${locationName}. 

Schreibstil: 
- Natürlich und entspannt (nicht "jugendlich" oder gekünstelt)
- Kurz und auf den Punkt
- Erwähne einen spezifischen, interessanten Fun-Fact über die Region
- Keine Emojis oder "coole" Begriffe
- Einfach: "Hallo aus [Ort]!"
- Erwähne kurz lokale Chats

Nahe Orte: ${nearbyPlaces.join(', ')}

Beispiel-Ton: "Hallo aus ${locationName}! Wusstest du, dass [spezifischer Fun-Fact]? Schau gerne in die lokalen Chats."`;

      console.log('🤖 Sending request to Gemini API...');

      const requestData = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50
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
      // Fallback message - natürlich und entspannt
      return `Hallo aus ${locationName}! Schau gerne in die lokalen Chats und verbinde dich mit Leuten aus deiner Gegend.`;
    }
  }

  async generateRegionalNews(locationName, nearbyPlaces = []) {
    try {
      console.log('🏞️ Generating super concise regional info for:', locationName);
      
      const prompt = `Erstelle einen sehr kurzen, prägnanten Text (max. 25 Wörter) über die Region ${locationName} mit einem spezifischen, interessanten Fun-Fact! 

Fokus auf:
- Einen SEHR SPEZIFISCHEN Fun-Fact (historisch, geologisch, kulturell, kurios)
- Was macht die Gegend wirklich einzigartig
- Keine allgemeinen Aussagen

Nahe Orte: ${nearbyPlaces.join(', ')}

Schreibstil: Prägnant, faktisch, interessant, deutsch, ohne Emojis. Sehr spezifisch und überraschend!

Beispiel: "Im Trasshöhlenlabyrinth reifte einst der Käse für den deutschen Kaiser. Heute einzigartige Vulkanlandschaft mit Römerbergwerk erkunden."`;

      const requestData = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 40  // Noch kürzer für mehr Präzision!
        }
      };

      const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('🏞️ Regional info API Response Status:', response.status);

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const news = response.data.candidates[0].content.parts[0].text.trim();
        console.log('🏞️ Generated regional info:', news);
        return news;
      } else {
        console.log('❌ Unexpected regional info API response format:', response.data);
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('❌ Gemini regional info API Error:', error.response?.data || error.message);
      // Fallback message - knackig und informativ
      return `In ${locationName} gibt es viel zu entdecken! Outdoor-Aktivitäten, lokale Märkte und coole Community-Events warten auf dich.`;
    }
  }
}

module.exports = new GeminiService();
