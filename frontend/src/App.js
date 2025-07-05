import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { IoBarChart, IoPlaySkipForward } from 'react-icons/io5';
import './App.css';
import { apiService } from './services/api';
import WalletButton from './components/WalletButton';

const { innerWidth: screenWidth, innerHeight: screenHeight } = window;

// Artık tamamen gerçek Polymarket verileri kullanılıyor

const SwipeCard = ({ item, onSwipeLeft, onSwipeRight, onPass, betAmount, isTop }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // ✅ Güvenli başlangıç değerleri
  const [{ x, y, rotation, opacity }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1,
    config: config.wobbly,
  }));

  // ✅ Güvenli matematik fonksiyonu
  const safeMath = (value, fallback = 0) => {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return fallback;
    }
    return value;
  };

  const bind = useDrag(
    ({ down, movement = [0, 0], velocity = [0, 0], direction = [0, 0], cancel }) => {
      if (!isTop) return;

      // ✅ Tüm değerleri güvenli hale getir
      const [mx = 0, my = 0] = movement;
      const [vx = 0, vy = 0] = velocity;
      const [xDir = 0, yDir = 0] = direction;
      
      const safeX = safeMath(mx);
      const safeMy = safeMath(my);
      const safeVelocity = safeMath(vx);
      const safeXDir = safeMath(xDir);

      const threshold = screenWidth * 0.3;
      const isGone = Math.abs(safeX) > threshold;
      const dir = safeXDir < 0 ? -1 : 1;

      if (!down && isGone) {
        cancel();
        api.start({
          x: safeMath((screenWidth + 100) * dir),
          y: safeMath(safeMy),
          rotation: safeMath(safeX / 100 + (isGone ? dir * 10 * safeVelocity : 0)),
          opacity: 0,
          config: { ...config.wobbly, velocity: safeMath(Math.abs(safeVelocity) * 0.2) },
        });
        
        setTimeout(() => {
          if (dir === -1) {
            onSwipeLeft(item);
          } else {
            onSwipeRight(item);
          }
        }, 200);
      } else {
        api.start({
          x: down ? safeMath(safeX) : 0,
          y: down ? safeMath(safeMy) : 0,
          rotation: down ? safeMath(safeX / 100) : 0,
          opacity: 1,
        });
      }
    },
    { 
      filterTaps: true,
      // ✅ Ek güvenlik ayarları
      bounds: { left: -screenWidth, right: screenWidth, top: -screenHeight, bottom: screenHeight },
      rubberband: true
    }
  );

  return (
    <animated.div
      {...bind()}
      className={`swipe-card ${isTop ? 'top-card' : ''}`}
      style={{
        x,
        y,
        transform: rotation.to((r) => {
          const safeRotation = safeMath(r);
          return `rotate(${safeRotation}deg)`;
        }),
        opacity,
        background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
        zIndex: isTop ? 2 : 1,
      }}
    >

      <div 
        className="card-content"
        style={{
          backgroundImage: `url(${item.image})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dynamic Background Overlay */}
        <animated.div
          className="background-overlay"
          style={{
            background: x.to((xVal) => {
              // ✅ Güvenli değer kontrolü
              const safeXVal = safeMath(xVal);
              const intensity = Math.min(Math.abs(safeXVal) / 120, 0.9);
              const baseOverlay = `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%)`;
              
              if (safeXVal < -40) {
                // Sola kaydırma - Kırmızı efekt
                return `linear-gradient(to bottom, rgba(255,107,107,${intensity * 0.6}) 0%, rgba(220,38,127,${intensity * 0.7}) 50%, rgba(139,69,19,${intensity * 0.9}) 100%), ${baseOverlay}`;
              } else if (safeXVal > 40) {
                // Sağa kaydırma - Yeşil efekt
                return `linear-gradient(to bottom, rgba(67,233,123,${intensity * 0.6}) 0%, rgba(56,249,215,${intensity * 0.7}) 50%, rgba(34,139,34,${intensity * 0.9}) 100%), ${baseOverlay}`;
              }
              return baseOverlay;
            }),
          }}
        />
        
        <div className="card-info-overlay">
          <div className="card-top">
            <div className="card-header">
              <span className="category-text">{item.category}</span>
              <span className="odds-text">{item.odds}</span>
            </div>
            <h2 className="title-text">{item.title}</h2>
            <div className="description-container">
              <p className={`description-text ${showFullDescription ? 'description-full' : ''}`}>
                {showFullDescription ? item.description : `${item.description?.substring(0, 50) || ''}...`}
              </p>
              {item.description && item.description.length > 50 && (
                <button 
                  className="see-description-btn" 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? 'More Less' : 'See Description'}
                </button>
              )}
            </div>
          </div>
          
          {/* Bottom Stats - Moved to bottom */}
          <div className="bottom-stats">
            <div className="stat-item-bottom">
              <IoBarChart size={18} color="rgba(255,255,255,0.9)" />
              <span className="stat-text">{item.volume}</span>
            </div>
            <div className="end-date-bottom">
              <span className="end-date-text">{item.endDate}</span>
            </div>
            <button 
              className="bet-button-bottom"
              onClick={() => {
                // Bet butonu - varsayılan olarak YES bahsi yapar
                const currentItem = markets[currentIndex];
                if (currentItem) {
                  handleSwipeRight(currentItem);
                }
              }}
            >
              <span className="bet-button-text">BET ${betAmount}</span>
            </button>
          </div>
        </div>
      </div>
    </animated.div>
  );
};

export default function App() {
  console.log('🚀 App.js loading...');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [betAmount, setBetAmount] = useState(0.01); // Ultra minimal bet: 0.01 USDC
  const [totalBets, setTotalBets] = useState(0);
  const [walletBalance, setWalletBalance] = useState(4350);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null); // YENİ: Wallet state

  const safeMath = (value, fallback = 0) => {
    return isNaN(value) || !isFinite(value) ? fallback : value;
  };

// Backend proxy ile veri çekme - CORS yok!
const fetchMarkets = async () => {
  console.log('🔄 fetchMarkets function started');
  try {
    setLoading(true);
    console.log('🔄 Backend proxy ile API çağrısı başlatılıyor...');
    
    // ✅ Backend proxy kullan - CORS problemi yok!
    const data = await apiService.polymarket.getMarkets(10);
    console.log('📊 Backend proxy response:', data);
    
    // Polymarket API response formatı kontrol et
    const markets = Array.isArray(data) ? data : data.data || [];
    
    if (markets.length === 0) {
      console.warn('⚠️ API returned empty array');
      setMarkets([]);
      return;
    }
    
    // Gradient renkleri havuzu
    const gradientPool = [
      ['#2d3561', '#3b2665'], // Mor-lacivert
      ['#5d2456', '#662648'], // Koyu pembe
      ['#1e3a5f', '#004d61'], // Koyu mavi
      ['#1a5d3a', '#1a4d4d'], // Koyu yeşil
      ['#7a2d4a', '#8a4a29'], // Kahverengi-pembe
      ['#4a1a4a', '#5d2d5d'], // Koyu mor
      ['#2d4a2d', '#3d5d3d'], // Orman yeşili
      ['#4a2d1a', '#5d3d2d'], // Kahverengi
      ['#1a2d4a', '#2d3d5d'], // Gece mavisi
      ['#4a1a2d', '#5d2d3d'], // Bordo
    ];
    
    // Kategori belirleme fonksiyonu
    const determineCategory = (market) => {
      // Question'a göre kategori belirleme
      const question = market.question?.toLowerCase() || '';
      
      if (question.includes('recession') || question.includes('economy') || question.includes('gdp')) {
        return 'Economics';
      } else if (question.includes('bitcoin') || question.includes('crypto') || question.includes('eth')) {
        return 'Crypto';
      } else if (question.includes('election') || question.includes('trump') || question.includes('biden')) {
        return 'Politics';
      } else if (question.includes('sports') || question.includes('nfl') || question.includes('nba')) {
        return 'Sports';
      } else if (question.includes('jesus') || question.includes('christ') || question.includes('gta')) {
        return 'Entertainment';
      } else if (question.includes('tech') || question.includes('ai') || question.includes('tesla')) {
        return 'Technology';
      }
      return 'Prediction';
    };
    
    // API verisini uygulama formatına çevir
    const formattedMarkets = markets.slice(0, 10).map((market, index) => {
      console.log(`🔄 Processing market ${index + 1}:`, market);
      
      // Kategori belirleme
      const category = determineCategory(market);
      
      // ✅ 1. GERÇEK API'DEN GELEN GÖRSEL KULLAN
      const imageUrl = market.image || market.icon || `https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center`;
      
      // ✅ 2. GERÇEK ODDS HESAPLAMA - outcomePrices dizisinden
let odds = '50%';

// outcomePrices string ise önce JSON.parse et
let parsedPrices = market.outcomePrices;
if (typeof market.outcomePrices === 'string') {
  try {
    parsedPrices = JSON.parse(market.outcomePrices);
    console.log('🎯 Parsed outcomePrices:', parsedPrices);
  } catch (error) {
    console.log('🎯 Parse error:', error);
    parsedPrices = [];
  }
}

if (parsedPrices && parsedPrices.length >= 2) {
  const yesPrice = parseFloat(parsedPrices[0]);
  console.log('🎯 YesPrice:', yesPrice);
  
  if (!isNaN(yesPrice) && yesPrice > 0) {
    odds = `${Math.round(yesPrice * 100)}%`;
    console.log('🎯 Final odds:', odds);
  }
}
      
      // Volume formatting - volumeNum kullan
      let volume = '$0';
      if (market.volumeNum) {
        const volumeNum = market.volumeNum;
        if (volumeNum >= 1000000) {
          volume = `$${(volumeNum / 1000000).toFixed(1)}M`;
        } else if (volumeNum >= 1000) {
          volume = `$${(volumeNum / 1000).toFixed(1)}K`;
        } else {
          volume = `$${volumeNum.toFixed(0)}`;
        }
      }
      
      // End date formatting
      let endDate = 'TBD';
      if (market.endDate) {
        endDate = new Date(market.endDate).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      }
      
      // ✅ 3. DESCRIPTION KISALTMA - maksimum 100 karakter
      const truncateDescription = (text, maxLength = 100) => {
        if (!text) return 'Make your prediction on this market';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
      };
      
      return {
        id: market.id || `market-${index}`,
        title: market.question || 'Prediction Market',
        description: truncateDescription(market.description || market.question),
        category: category,
        odds: odds, // ✅ Gerçek odds
        volume: volume,
        endDate: endDate,
        gradient: gradientPool[index % gradientPool.length],
        image: imageUrl, // ✅ Gerçek API'den gelen görsel
      };
    });
    
    setMarkets(formattedMarkets);
    console.log('✅ Polymarket verileri yüklendi:', formattedMarkets.length, 'market');
    console.log('✅ İlk market örneği:', formattedMarkets[0]);
    
  } catch (error) {
    console.error('❌ Backend proxy error:', error);
    console.log('🔄 Using fallback sample data...');
    // Fallback sample data - daha kısa description ile
    const sampleMarkets = [
      {
        id: "sample-1",
        title: "Will Bitcoin reach $100k by end of 2025?",
        description: "Bitcoin has been on a bull run. Will it hit the 100k milestone?",
        category: "Crypto",
        odds: "65%",
        volume: "$2.3M",
        endDate: "Dec 31, 2025",
        gradient: ['#2d3561', '#3b2665'],
        image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=300&fit=crop&crop=center",
      },
      {
        id: "sample-2", 
        title: "Will there be a recession in 2025?",
        description: "Economic indicators are mixed. Will the economy enter recession?",
        category: "Economics",
        odds: "38%",
        volume: "$4.1M",
        endDate: "Dec 31, 2025",
        gradient: ['#1e3a5f', '#004d61'],
        image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop&crop=center",
      },
    ];
    setMarkets(sampleMarkets);
  } finally {
    setLoading(false);
  }
};

  // Wallet değişikliği handler'ı
  const handleWalletChange = (address) => {
    setWalletAddress(address);
    console.log('🔗 Wallet changed:', address);
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('Got NaN while animating')) {
        return; // NaN warning'lerini sessizce geç
      }
      originalError.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);

  const handleSwipeLeft = async (item) => {
    // NO bet - Backend'e gönder
    try {
      console.log('🔴 NO bet placed on:', item.title);
      
      // Wallet bağlı değilse bet yapma
      if (!walletAddress) {
        console.log('⚠️ Wallet not connected, skipping bet');
        alert('Please connect your wallet to place bets!');
        nextCard();
        return;
      }
      
      const betData = {
        userId: walletAddress,
        marketId: item.id,
        outcomeIndex: 1, // NO bet
        amount: (betAmount * 1000000).toString(), // USDC decimals
        chainId: 31337 // Local Network
      };
      
      const result = await apiService.placeBet(betData);
      console.log('✅ NO bet result:', result);
      
      setTotalBets(totalBets + betAmount);
      setWalletBalance(walletBalance - betAmount);
    } catch (error) {
      console.error('❌ NO bet error:', error);
    }
    nextCard();
  };

  const handleSwipeRight = async (item) => {
    // YES bet - Backend'e gönder
    try {
      console.log('🟢 YES bet placed on:', item.title);
      
      // Wallet bağlı değilse bet yapma
      if (!walletAddress) {
        console.log('⚠️ Wallet not connected, skipping bet');
        alert('Please connect your wallet to place bets!');
        nextCard();
        return;
      }
      
      const betData = {
        userId: walletAddress,
        marketId: item.id,
        outcomeIndex: 0, // YES bet
        amount: (betAmount * 1000000).toString(), // USDC decimals
        chainId: 31337 // Local Network
      };
      
      const result = await apiService.placeBet(betData);
      console.log('✅ YES bet result:', result);
      
      setTotalBets(totalBets + betAmount);
      setWalletBalance(walletBalance - betAmount);
    } catch (error) {
      console.error('❌ YES bet error:', error);
    }
    nextCard();
  };

  const handlePassCard = (item) => {
    // Pass without betting
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < markets.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Kartlar bittiğinde otomatik olarak başa dön
      setCurrentIndex(0);
    }
  };

  return (
    <div className="app-container">
      <div className="app-background">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <h1 className="header-title">PolyMobile</h1>
            <p className="header-subtitle">Swipe to predict the future</p>
          </div>
          <div className="header-right">
            <WalletButton onWalletChange={handleWalletChange} />
          </div>
        </header>

        {/* Cards Container */}
        <div className="cards-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span className="loading-text">Loading Real Markets...</span>
            </div>
          ) : markets.length === 0 ? (
            <div className="loading-container">
              <span className="loading-text">No markets available</span>
              <button 
                className="retry-button"
                onClick={fetchMarkets}
              >
                Retry
              </button>
            </div>
          ) : (
            markets.map((item, index) => {
              if (index < currentIndex) return null;
              if (index > currentIndex + 1) return null;
              
              return (
                <SwipeCard
                  key={item.id}
                  item={item}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onPass={handlePassCard}
                  betAmount={betAmount}
                  isTop={index === currentIndex}
                />
              );
            })
          )}
        </div>

        {/* Pass Button */}
        <div className="pass-container">
          <button 
            className="pass-button"
            onClick={() => {
              const currentItem = markets[currentIndex];
              if (currentItem) {
                handlePassCard(currentItem);
              }
            }}
            disabled={loading || markets.length === 0}
          >
            <IoPlaySkipForward size={24} color="#ffd93d" />
            <span className="pass-text">PAS</span>
          </button>
        </div>

        {/* Stats */}
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-label">Total Bets</span>
            <span className="stat-value">${totalBets}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cards Left</span>
            <span className="stat-value">{Math.max(0, markets.length - currentIndex)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 