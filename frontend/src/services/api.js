// Backend proxy kullanarak CORS problemini çöz
const BACKEND_API = 'http://localhost:3001/api';

export const apiService = {
  // 📊 BACKEND PROXY - Polymarket verilerini backend üzerinden çek
  polymarket: {
    getMarkets: async (limit = 20) => {
      try {
        console.log('🔄 Backend proxy ile market verisi çekiliyor...');
        const response = await fetch(`${BACKEND_API}/polymarket/markets?limit=${limit}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('✅ Backend proxy başarılı:', data.length, 'markets');
        return data;
      } catch (error) {
        console.error('❌ Backend proxy error:', error);
        throw error;
      }
    },
    
    getMarket: async (id) => {
      try {
        const response = await fetch(`${BACKEND_API}/polymarket/markets/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('❌ Backend proxy error:', error);
        throw error;
      }
    }
  },
  
  // 🎯 BACKEND API - Bet işlemleri
  placeBet: async (betData) => {
    try {
      console.log('🎯 Backend\'e bet gönderiliyor:', betData);
      const response = await fetch(`${BACKEND_API}/bets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(betData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('✅ Bet başarılı:', result);
      return result;
    } catch (error) {
      console.error('❌ Bet error:', error);
      throw error;
    }
  }
}; 