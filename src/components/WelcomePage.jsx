import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [isVisible, setIsVisible] = useState(false); // State for page load animation

  // Trigger animation on component mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/welcome/agent-creator');
    }, 200);
  };

  return (
    <div className="container">
      {/* Background Elements */}
      <div className="background-elements">
        {/* Smooth oscillating wave patterns - top section */}
        <div className="wave-top">
          <svg
            viewBox="0 0 1200 800"
            className="wave-svg"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#ec4899" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            {Array.from({ length: 15 }, (_, i) => (
              <path
                key={i}
                d={`M 0 ${100 + i * 25} Q 300 ${50 + i * 20 + Math.sin(i * 0.5) * 30} 600 ${120 + i * 25} Q 900 ${80 + i * 20 + Math.cos(i * 0.3) * 25} 1200 ${140 + i * 25}`}
                stroke="url(#waveGradient1)"
                strokeWidth="1.5"
                fill="none"
                className="wave-flow-1"
                style={{ 
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${4 + i * 0.1}s`
                }}
              />
            ))}
          </svg>
        </div>

        {/* Smooth oscillating wave patterns - bottom section */}
        <div className="wave-bottom">
          <svg
            viewBox="0 0 1200 800"
            className="wave-svg"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            {Array.from({ length: 12 }, (_, i) => (
              <path
                key={i}
                d={`M 0 ${500 + i * 20} Q 300 ${450 + i * 15 + Math.cos(i * 0.4) * 20} 600 ${520 + i * 20} Q 900 ${480 + i * 15 + Math.sin(i * 0.6) * 15} 1200 ${540 + i * 20}`}
                stroke="url(#waveGradient2)"
                strokeWidth="1"
                fill="none"
                className="wave-flow-2"
                style={{ 
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${5 + i * 0.2}s`
                }}
              />
            ))}
          </svg>
        </div>

        {/* Central flowing waves */}
        <div className="wave-central">
          <svg
            viewBox="0 0 1200 400"
            className="wave-svg"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="centralWave" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {Array.from({ length: 10 }, (_, i) => (
              <path
                key={i}
                d={`M 0 ${150 + i * 15 + Math.sin(i * 0.3) * 20} Q 400 ${100 + i * 20 + Math.cos(i * 0.5) * 25} 800 ${180 + i * 15} Q 1000 ${120 + i * 20 + Math.sin(i * 0.7) * 15} 1200 ${200 + i * 15}`}
                stroke="url(#centralWave)"
                strokeWidth="0.8"
                fill="none"
                className="central-wave-flow"
                style={{ 
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: `${6 + i * 0.3}s`
                }}
              />
            ))}
          </svg>
        </div>

        {/* Enhanced center background glow with breathing effect */}
        <div className="glow"></div>
        
        {/* Floating animated dots with enhanced movement */}
        <div className="dot dot-1"></div>
        <div className="dot dot-2"></div>
        <div className="dot dot-3"></div>
        <div className="dot dot-4"></div>
        <div className="dot dot-5"></div>
      </div>

      {/* Hero Content */}
      <div className={`hero ${isVisible ? 'visible' : ''}`}>
        <div className="hero-content">
          <div className="hero-card">
            <h1 className="hero-title">
              Welcome to{" "}
              <span className="hero-title-highlight">
                BestWork
              </span>
            </h1>
            
            <p className="hero-subtitle">
              Click "Get Started" to<br />
              create your first AI agent
            </p>
            
            <button
              className={`hero-button ${isTransitioning ? 'transitioning' : ''}`}
              onClick={handleGetStarted}
              disabled={isTransitioning}
            >
              {isTransitioning ? 'Starting...' : 'Get started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;