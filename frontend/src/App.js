import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { IoBarChart, IoPlaySkipForward } from 'react-icons/io5';
import './App.css';
import { apiService } from './services/api';
import WalletButton from './components/WalletButton';

const { innerWidth: screenWidth, innerHeight: screenHeight } = window;

// Particle system for explosion effects
const ParticleExplosion = ({ x, y, color, onComplete }) => {
  const particles = Array.from({ length: 12 }, (_, i) => i);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete && onComplete();
    }, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  return (
    <div className="particle-explosion" style={{ left: x, top: y }}>
      {particles.map((i) => (
        <div
          key={i}
          className="particle"
          style={{
            '--delay': `${i * 0.05}s`,
            '--angle': `${i * 30}deg`,
                          '--distance': `${120 + Math.random() * 80}px`,
            '--color': color,
            '--size': `${8 + Math.random() * 16}px`,
          }}
        />
      ))}
    </div>
  );
};

// Artık tamamen gerçek Polymarket verileri kullanılıyor

// Amount Selector Component
const AmountSelector = ({ betAmount, setBetAmount }) => {
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  
  const presetAmounts = [1, 5, 10, 25, 50];
  const minAmount = 0.01;
  const maxAmount = 100;

  const handlePresetClick = (amount) => {
    setBetAmount(amount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomSubmit = () => {
    const amount = parseFloat(customAmount);
    if (amount && amount >= minAmount && amount <= maxAmount) {
      setBetAmount(amount);
      setCustomAmount('');
      setIsCustom(false);
    }
  };

  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    setBetAmount(value);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleMobileDecrease = () => {
    const newAmount = Math.max(minAmount, betAmount - 1);
    setBetAmount(newAmount);
  };

  const handleMobileIncrease = () => {
    const newAmount = Math.min(maxAmount, betAmount + 1);
    setBetAmount(newAmount);
  };

  const handleMobileInputChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= minAmount && value <= maxAmount) {
      setBetAmount(value);
    } else if (e.target.value === '') {
      setBetAmount(minAmount);
    }
  };

  return (
    <div className="amount-selector-container">
      {/* Desktop Version */}
      <div className="amount-display-section">
        <div className="amount-display">
          <span className="amount-label">Bet Amount</span>
          <span className="amount-value">${betAmount.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="amount-controls-section">
        <div className="preset-amounts">
          {presetAmounts.map((amount) => (
            <button
              key={amount}
              className={`preset-btn ${betAmount === amount ? 'active' : ''}`}
              onClick={() => handlePresetClick(amount)}
            >
              ${amount}
            </button>
          ))}
          <button
            className={`preset-btn custom-btn ${isCustom ? 'active' : ''}`}
            onClick={() => setIsCustom(!isCustom)}
          >
            CUSTOM
          </button>
        </div>

        {isCustom && (
          <div className="custom-amount-input">
            <input
              type="number"
              placeholder="Amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
              min={minAmount}
              max={maxAmount}
              step="0.01"
            />
            <button onClick={handleCustomSubmit} className="custom-submit-btn">
              SET
            </button>
          </div>
        )}

        <div className="amount-slider">
          <input
            type="range"
            min={minAmount}
            max={maxAmount}
            step="0.01"
            value={betAmount}
            onChange={handleSliderChange}
            className="slider"
          />
          <div className="slider-labels">
            <span>${minAmount}</span>
            <span>${maxAmount}</span>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="mobile-amount-selector">
        <div className="mobile-amount-title">Bet Amount</div>
        <div className="mobile-amount-controls">
          <button 
            className="mobile-amount-btn"
            onClick={handleMobileDecrease}
          >
            −
          </button>
          <input
            type="number"
            className="mobile-amount-input"
            value={betAmount}
            onChange={handleMobileInputChange}
            min={minAmount}
            max={maxAmount}
            step="1"
          />
          <button 
            className="mobile-amount-btn"
            onClick={handleMobileIncrease}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

const SwipeCard = ({ item, onSwipeLeft, onSwipeRight, onPass, betAmount, isTop, onExplosion }) => {
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
    ({ down, movement = [0, 0], velocity = [0, 0], cancel }) => {
      if (!isTop) return;

      // ✅ Tüm değerleri güvenli hale getir
      const [mx = 0, my = 0] = movement;
      const [vx = 0, vy = 0] = velocity;
      
      const safeX = safeMath(mx);
      const safeMy = safeMath(my);
      const safeVelocity = safeMath(vx);

      const threshold = screenWidth * 0.25; // Daha kolay swipe için threshold azaltıldı
      const isGone = Math.abs(safeX) > threshold;
      
      // ✅ Daha güvenilir yön hesaplama - hareket değerine göre
      const dir = safeX < 0 ? -1 : 1;

      if (!down && isGone) {
        cancel();
        
        // Trigger background explosion
        if (onExplosion) {
          onExplosion(dir === -1 ? 'left' : 'right');
        }
        
        api.start({
          x: safeMath((screenWidth + 200) * dir),
          y: safeMath(safeMy + (Math.random() - 0.5) * 100),
          rotation: safeMath(safeX / 40 + (isGone ? dir * 25 * safeVelocity : 0)),
          opacity: 0,
          config: { ...config.wobbly, velocity: safeMath(Math.abs(safeVelocity) * 0.3) },
        });
        
        setTimeout(() => {
          // ✅ Sola kaydırma = NO, Sağa kaydırma = YES
          if (dir === -1) {
            onSwipeLeft(item);   // NO
          } else {
            onSwipeRight(item);  // YES
          }
        }, 150);
      } else {
        api.start({
          x: down ? safeMath(safeX) : 0,
          y: down ? safeMath(safeMy) : 0,
          rotation: down ? safeMath(safeX / 40) : 0,
          opacity: down ? Math.max(0.7, 1 - Math.abs(safeX) / (screenWidth * 0.5)) : 1,
        });
      }
    },
    { 
      filterTaps: true,
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
        zIndex: isTop ? 3 : 2,
      }}
    >
      <div 
        className="card-content"
        style={{
          backgroundImage: `url(${item.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <animated.div
          className="background-overlay"
          style={{
            background: x.to((xVal) => {
              const safeXVal = safeMath(xVal);
              const intensity = Math.min(Math.abs(safeXVal) / 100, 0.6);
              
              const baseOverlay = `linear-gradient(to bottom, 
                rgba(0,0,0,0.3) 0%, 
                rgba(0,0,0,0.5) 50%, 
                rgba(0,0,0,0.8) 100%)`;
              
              if (safeXVal < -30) {
                // Left swipe - subtle red tint
                return `linear-gradient(to bottom, 
                  rgba(255,100,100,${intensity * 0.3}) 0%, 
                  rgba(255,50,50,${intensity * 0.4}) 50%, 
                  rgba(200,0,0,${intensity * 0.5}) 100%), ${baseOverlay}`;
              } else if (safeXVal > 30) {
                // Right swipe - subtle green tint
                return `linear-gradient(to bottom, 
                  rgba(100,255,100,${intensity * 0.3}) 0%, 
                  rgba(50,255,50,${intensity * 0.4}) 50%, 
                  rgba(0,200,0,${intensity * 0.5}) 100%), ${baseOverlay}`;
              }
              return baseOverlay;
            }),
            opacity: x.to((xVal) => {
              const safeXVal = safeMath(xVal);
              return Math.max(0.8, 1 - Math.abs(safeXVal) / 200);
            })
          }}
        />
        
        <div className="card-info-overlay">
          <div className="card-top">
            <div className="card-header">
              <div className="category-badge">
                <span className="category-text">{item.category}</span>
              </div>
              <div className="odds-badge">
                <span className="odds-text">{item.odds}</span>
              </div>
            </div>
            <h2 className="title-text">{item.title}</h2>
            <div className="description-container">
              <p className={`description-text ${showFullDescription ? 'description-full' : ''}`}>
                {showFullDescription ? item.fullDescription : item.description}
              </p>
              {!showFullDescription && item.fullDescription && item.fullDescription.length > 150 && (
                <button
                  className="see-description-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullDescription(true);
                  }}
                >
                  See More
                </button>
              )}
              {showFullDescription && (
                <button
                  className="see-description-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullDescription(false);
                  }}
                >
                  Show Less
                </button>
              )}
            </div>
          </div>

          <div className="market-stats">
            <div className="stat-item-card">
              <IoBarChart className="stat-icon" />
              <span className="stat-text">${item.volume}</span>
            </div>
          </div>

          <div className="bottom-actions">
            <div className="bet-display">
              <div className="bet-label">Your Bet</div>
              <div className="bet-amount-large">${betAmount.toFixed(2)}</div>
            </div>
            <button 
              className="pass-button-inline"
              onClick={(e) => {
                e.stopPropagation();
                onPass(item);
              }}
            >
              <span className="pass-text">PASS</span>
            </button>
          </div>
        </div>
      </div>
    </animated.div>
  );
};

export default function App() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [betAmount, setBetAmount] = useState(5);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [explosions, setExplosions] = useState([]);

  const safeMath = (value, fallback = 0) => {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return fallback;
    }
    return value;
  };

  const handleExplosion = (direction) => {
    // Show explosion on left or right side
    const explosionX = direction === 'left' ? window.innerWidth * 0.2 : window.innerWidth * 0.8;
    const explosionY = window.innerHeight * 0.5;
    const color = direction === 'left' ? '#ff0080' : '#00ff80';
    
    const newExplosion = {
      id: Date.now() + Math.random(),
      x: explosionX,
      y: explosionY,
      color
    };
    setExplosions(prev => [...prev, newExplosion]);
  };

  const removeExplosion = (id) => {
    setExplosions(prev => prev.filter(exp => exp.id !== id));
  };

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.polymarket.getMarkets();
      console.log('API Response:', response);
      
      if (response && Array.isArray(response)) {
        const marketsData = response;
        
        if (Array.isArray(marketsData) && marketsData.length > 0) {
          // Her market için kategori belirleme
          const determineCategory = (market) => {
            const question = market.question?.toLowerCase() || '';
            const title = market.title?.toLowerCase() || '';
            const description = market.description?.toLowerCase() || '';
            const text = `${question} ${title} ${description}`;
            
            if (text.includes('sports') || text.includes('football') || text.includes('basketball') || 
                text.includes('soccer') || text.includes('baseball') || text.includes('tennis')) {
              return 'Sports';
            } else if (text.includes('election') || text.includes('president') || text.includes('vote') || 
                      text.includes('political') || text.includes('trump') || text.includes('biden')) {
              return 'Politics';
            } else if (text.includes('crypto') || text.includes('bitcoin') || text.includes('ethereum') || 
                      text.includes('price') || text.includes('trading')) {
              return 'Crypto';
            } else if (text.includes('weather') || text.includes('temperature') || text.includes('climate')) {
              return 'Weather';
            } else if (text.includes('entertainment') || text.includes('movie') || text.includes('celebrity') || 
                      text.includes('music') || text.includes('oscar') || text.includes('award')) {
              return 'Entertainment';
            } else if (text.includes('tech') || text.includes('ai') || text.includes('company') || 
                      text.includes('stock') || text.includes('business')) {
              return 'Tech/Business';
            } else if (text.includes('economy') || text.includes('inflation') || text.includes('gdp') || 
                      text.includes('recession') || text.includes('market')) {
              return 'Economy';
            } else if (text.includes('health') || text.includes('covid') || text.includes('medicine') || 
                      text.includes('vaccine') || text.includes('drug')) {
              return 'Health';
            } else if (text.includes('space') || text.includes('nasa') || text.includes('rocket') || 
                      text.includes('moon') || text.includes('mars')) {
              return 'Space';
            } else if (text.includes('science') || text.includes('research') || text.includes('discovery') || 
                      text.includes('study') || text.includes('experiment')) {
              return 'Science';
            } else {
              return 'General';
            }
          };
          
          const gradients = [
            ['#ff9a9e', '#fecfef'], // pembe
            ['#ffecd2', '#fcb69f'], // turuncu
            ['#a8edea', '#fed6e3'], // turkuaz-pembe
            ['#ffd89b', '#19547b'], // sarı-mavi
            ['#89f7fe', '#66a6ff'], // açık mavi
            ['#fa709a', '#fee140'], // pembe-sarı
            ['#a1c4fd', '#c2e9fb'], // mavi
            ['#fbc2eb', '#a6c1ee'], // pembe-mor
            ['#fdbb2d', '#22c1c3'], // sarı-turkuaz
            ['#ff758c', '#ff7eb3'], // pembe tonları
            ['#667eea', '#764ba2'], // mor-mavi
            ['#f093fb', '#f5576c'], // pembe-kırmızı
            ['#4facfe', '#00f2fe'], // mavi-turkuaz
            ['#43e97b', '#38f9d7'], // yeşil-turkuaz
            ['#fa71cd', '#c471f5'], // pembe-mor
            ['#ffeaa7', '#fab1a0'], // sarı-turuncu
            ['#74b9ff', '#0984e3'], // mavi tonları
            ['#fd79a8', '#fdcb6e'], // pembe-sarı
            ['#6c5ce7', '#a29bfe'], // mor tonları
            ['#00cec9', '#55efc4'], // turkuaz-yeşil
          ];
          
          const processedMarkets = marketsData.map((market, index) => {
            const truncateDescription = (text, maxLength = 150) => {
              if (!text) return 'Predict market outcomes and win prizes';
              return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
            };
            
            const getRandomGradient = () => {
              return gradients[Math.floor(Math.random() * gradients.length)];
            };
            
            // Get image from API or use category-based fallback
            const getImageUrl = (market, category) => {
              if (market.image) return market.image;
              if (market.icon) return market.icon;
              
              // Category-based fallback images
              const categoryImages = {
                'Politics': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=600&fit=crop',
                'Crypto': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=600&fit=crop',
                'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=600&fit=crop',
                'Economy': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=600&fit=crop',
                'Tech/Business': 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=600&fit=crop',
                'Entertainment': 'https://images.unsplash.com/photo-1489599904472-9c61b7ef1f04?w=400&h=600&fit=crop',
                'Health': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=600&fit=crop',
                'Weather': 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=600&fit=crop',
                'Space': 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=600&fit=crop',
                'Science': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=600&fit=crop',
                'General': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop'
              };
              
              return categoryImages[category] || categoryImages['General'];
            };
            
            const yesPrice = safeMath(market.tokens?.[0]?.price || market.outcomeTokens?.[0]?.price || 0.5);
            const noPrice = safeMath(market.tokens?.[1]?.price || market.outcomeTokens?.[1]?.price || 0.5);
            
            const yesPercentage = safeMath(yesPrice * 100, 50);
            const noPercentage = safeMath(100 - yesPercentage, 50);
            
            const odds = `${yesPercentage.toFixed(0)}% YES`;
            
            const volume = safeMath(market.volume || market.volumeUSD || 0);
            const volumeDisplay = volume > 0 ? 
              (volume >= 1000000 ? `${(volume / 1000000).toFixed(1)}M` :
               volume >= 1000 ? `${(volume / 1000).toFixed(1)}K` : 
               volume.toFixed(0)) : 'N/A';
            
            const category = determineCategory(market);
            
            const fullDescription = market.description || market.question || 'Predict market outcomes and win prizes';
            
            return {
              id: market.id || `market-${index}`,
              title: market.question || market.title || 'Prediction Market',
              description: truncateDescription(fullDescription),
              fullDescription: fullDescription,
              category: category,
              odds: odds,
              volume: volumeDisplay,
              gradient: getRandomGradient(),
              image: getImageUrl(market, category),
              yesPrice: yesPrice,
              noPrice: noPrice,
              rawVolume: volume,
              originalData: market
            };
          });
          
          setMarkets(processedMarkets);
          setCurrentIndex(0);
        } else {
          setError('No markets found');
        }
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching markets:', err);
      setError(err.message || 'Failed to fetch markets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const handleWalletChange = (address) => {
    setConnectedWallet(address);
  };

  const handleSwipeLeft = async (item) => {
    console.log('Swipe LEFT (NO):', item);
    
    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketId: item.id,
          outcome: 'NO',
          amount: betAmount,
          wallet: connectedWallet
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to place bet');
      }
      
      const result = await response.json();
      console.log('Bet placed successfully:', result);
      
    } catch (error) {
      console.error('Error placing bet:', error);
    }
    
    nextCard();
  };

  const handleSwipeRight = async (item) => {
    console.log('Swipe RIGHT (YES):', item);
    
    try {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketId: item.id,
          outcome: 'YES',
          amount: betAmount,
          wallet: connectedWallet
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to place bet');
      }
      
      const result = await response.json();
      console.log('Bet placed successfully:', result);
      
    } catch (error) {
      console.error('Error placing bet:', error);
    }
    
    nextCard();
  };

  const handlePassCard = (item) => {
    console.log('Pass card:', item);
    nextCard();
  };

  const nextCard = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= markets.length) {
        fetchMarkets();
        return 0;
      }
      return nextIndex;
    });
  };

  const currentCard = markets[currentIndex];

  if (loading) {
    return (
      <div className="app-container">
        <div className="app-background">
          <div className="loading-container">
            <div className="loading-card">
              <div className="loading-spinner"></div>
              <h2 className="loading-title">Loading Markets...</h2>
              <p className="loading-subtitle">Fetching the latest prediction markets</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="app-background">
          <div className="loading-container">
            <div className="error-card">
              <div className="error-icon">⚠️</div>
              <h2 className="error-title">Connection Error</h2>
              <p className="error-subtitle">{error}</p>
              <button className="retry-button" onClick={fetchMarkets}>
                <span className="retry-icon">🔄</span>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-background">
        <div className="app-header">
          <div className="header-left">
            <div className="logo-section">
              <div className="logo-container">
                <div className="logo-icon">
                  <div className="logo-pulse"></div>
                  <span className="logo-symbol">PM</span>
                </div>
                <div className="logo-text">
                  <h1 className="header-title">PolyMobile</h1>
                  <p className="header-subtitle">Swipe for the future</p>
                </div>
              </div>
            </div>
          </div>
          <div className="header-right">
            <WalletButton onWalletChange={handleWalletChange} />
          </div>
        </div>

        <div className="cards-container">
          <AmountSelector 
            betAmount={betAmount} 
            setBetAmount={setBetAmount} 
          />
          
          {currentCard && (
            <SwipeCard
              key={currentCard.id}
              item={currentCard}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onPass={handlePassCard}
              onExplosion={handleExplosion}
              betAmount={betAmount}
              isTop={true}
            />
          )}
        </div>
        
        {/* Explosion effects */}
        {explosions.map((explosion) => (
          <ParticleExplosion
            key={explosion.id}
            x={explosion.x}
            y={explosion.y}
            color={explosion.color}
            onComplete={() => removeExplosion(explosion.id)}
          />
        ))}
      </div>
    </div>
  );
} 