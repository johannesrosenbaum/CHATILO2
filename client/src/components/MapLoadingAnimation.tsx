import React, { useEffect, useState } from 'react';

interface MapAnimationProps {
  targetLatitude: number;
  targetLongitude: number;
  onAnimationComplete: () => void;
  locationName?: string;
}

const MapLoadingAnimation: React.FC<MapAnimationProps> = ({
  targetLatitude,
  targetLongitude,
  onAnimationComplete,
  locationName = 'Dein Standort'
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [showLocationMarker, setShowLocationMarker] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationPhase(1), 500);
    const timer2 = setTimeout(() => setAnimationPhase(2), 1500);
    const timer3 = setTimeout(() => {
      setCurrentZoom(8);
      setAnimationPhase(3);
    }, 2500);
    const timer4 = setTimeout(() => {
      setShowLocationMarker(true);
      setAnimationPhase(4);
    }, 4000);
    const timer5 = setTimeout(() => {
      onAnimationComplete();
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onAnimationComplete]);

  const getMapStyle = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      backgroundImage: `linear-gradient(45deg, 
        #4a90e2 0%, 
        #7bb3f0 25%, 
        #a8d0f8 50%, 
        #d1e7fc 75%, 
        #ffffff 100%)`,
      position: 'relative' as const,
      overflow: 'hidden',
      transform: `scale(${currentZoom})`,
      transition: 'transform 2s cubic-bezier(0.4, 0.0, 0.2, 1)',
    };

    return baseStyle;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      {/* Hauptkarte */}
      <div style={{
        width: '90%',
        maxWidth: '600px',
        height: '60%',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        border: '3px solid #007AFF',
        opacity: animationPhase >= 1 ? 1 : 0,
        transform: animationPhase >= 1 ? 'translateY(0)' : 'translateY(50px)',
        transition: 'all 1s cubic-bezier(0.4, 0.0, 0.2, 1)'
      }}>
        <div style={getMapStyle()}>
          {/* Landkarten-Gitter */}
          <svg
            width="100%"
            height="100%"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: animationPhase >= 2 ? 0.3 : 0,
              transition: 'opacity 1s ease'
            }}
          >
            {/* Vertikale Linien */}
            {Array.from({length: 20}).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={`${i * 5}%`}
                y1="0"
                x2={`${i * 5}%`}
                y2="100%"
                stroke="#007AFF"
                strokeWidth="1"
                opacity="0.4"
              />
            ))}
            {/* Horizontale Linien */}
            {Array.from({length: 15}).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={`${i * 6.67}%`}
                x2="100%"
                y2={`${i * 6.67}%`}
                stroke="#007AFF"
                strokeWidth="1"
                opacity="0.4"
              />
            ))}
          </svg>

          {/* Geografische Features (simuliert) */}
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '30%',
            width: '40%',
            height: '20%',
            backgroundColor: '#34C759',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            opacity: animationPhase >= 2 ? 0.6 : 0,
            transition: 'opacity 1s ease',
            transform: 'rotate(15deg)'
          }} />

          {/* Fluss */}
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '10%',
            width: '80%',
            height: '8px',
            backgroundColor: '#007AFF',
            borderRadius: '4px',
            opacity: animationPhase >= 2 ? 0.8 : 0,
            transition: 'opacity 1s ease',
            transform: 'rotate(-10deg)'
          }} />

          {/* Stadt-Bereiche */}
          {animationPhase >= 2 && Array.from({length: 8}).map((_, i) => (
            <div
              key={`city-${i}`}
              style={{
                position: 'absolute',
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
                width: `${3 + Math.random() * 4}px`,
                height: `${3 + Math.random() * 4}px`,
                backgroundColor: '#FF9500',
                borderRadius: '50%',
                opacity: 0.7,
                animation: `pulse-${i} 2s infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}

          {/* Ziel-Location Marker */}
          {showLocationMarker && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 1,
              animation: 'bounce 1s ease-in-out infinite'
            }}>
              {/* Pulsierender Kreis */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#FF3B30',
                opacity: 0.3,
                animation: 'pulse-location 2s infinite'
              }} />
              
              {/* Hauptmarker */}
              <div style={{
                width: '30px',
                height: '30px',
                backgroundColor: '#FF3B30',
                borderRadius: '50%',
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(255, 59, 48, 0.4)',
                position: 'relative',
                zIndex: 10
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  📍
                </div>
              </div>
            </div>
          )}

          {/* Zoom-Rahmen */}
          {animationPhase >= 3 && (
            <div style={{
              position: 'absolute',
              top: '35%',
              left: '35%',
              width: '30%',
              height: '30%',
              border: '3px solid #FF3B30',
              borderRadius: '10px',
              opacity: 0.8,
              animation: 'zoom-focus 1s ease-in-out'
            }} />
          )}
        </div>
      </div>

      {/* Text und Loading */}
      <div style={{
        marginTop: '40px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '16px',
          opacity: animationPhase >= 1 ? 1 : 0,
          transform: animationPhase >= 1 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s ease'
        }}>
          🗺️ Entdecke Chatilo
        </h2>
        
        <p style={{
          fontSize: '18px',
          opacity: animationPhase >= 2 ? 1 : 0,
          transform: animationPhase >= 2 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s ease',
          marginBottom: '20px'
        }}>
          {animationPhase < 3 ? 'Suche nach deinem Standort...' :
           animationPhase < 4 ? 'Zoom zu deiner Region...' :
           `Willkommen in ${locationName}!`}
        </p>

        {/* Loading Dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          opacity: animationPhase < 4 ? 1 : 0,
          transition: 'opacity 0.5s ease'
        }}>
          {Array.from({length: 3}).map((_, i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#007AFF',
                animation: `loading-dot 1.4s infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS Animationen */}
      <style>{`
        @keyframes pulse-location {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.1; }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translate(-50%, -50%) translateY(0); }
          40% { transform: translate(-50%, -50%) translateY(-10px); }
          60% { transform: translate(-50%, -50%) translateY(-5px); }
        }
        
        @keyframes zoom-focus {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        
        @keyframes loading-dot {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        
        ${Array.from({length: 8}).map((_, i) => `
          @keyframes pulse-${i} {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.${3 + i}); opacity: 0.4; }
          }
        `).join('')}
      `}</style>
    </div>
  );
};

export default MapLoadingAnimation;
