import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './PricingPlan.css';

const PricingPlan = () => {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const navigate = useNavigate();

  const handleContinue = () => {
    try {
      localStorage.setItem('selectedPlan', selectedPlan);
      console.log('Stored selected plan in localStorage:', selectedPlan);

      if (selectedPlan === 'pro') {
        // Open Stripe link in a new window for Pro plan
        window.open('https://buy.stripe.com/6oU5kE72f8s40go0J08Ra0q', '_blank');
      } else {
        // Navigate to signup for other plans (e.g., Starter)
        navigate('/signup');
      }
    } catch (err) {
      console.error('Error storing selected plan:', err);
    }
  };

  const handleKeyDown = (e, plan) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setSelectedPlan(plan);
    }
  };

  // Animation variants for the title
  const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut', delay: i * 0.2 },
    }),
  };

  // Animation variants for features
  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: 'easeOut', delay: i * 0.1 },
    }),
  };

  // Animation variants for the button
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut', delay: 0.8 } },
  };

  return (
    <div className="pricing-container">
      <div className="pricing-content">
        <motion.h1
          className="pricing-title"
          variants={titleVariants}
          initial="hidden"
          animate="visible"
        >
          Select a plan to unlock your AI agent
        </motion.h1>

        <div className="pricing-plan-grid">
          {/* Starter Plan */}
          <motion.div
            className={`pricing-plan-card pricing-starter-plan ${
              selectedPlan === 'starter' ? 'pricing-selected' : ''
            }`}
            onClick={() => setSelectedPlan('starter')}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={0}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="pricing-plan-header">
              <h2 className="pricing-plan-title">Starter</h2>
              <div
                className={`pricing-selection ${selectedPlan === 'starter' ? 'pricing-checked' : ''}`}
                role="radio"
                aria-checked={selectedPlan === 'starter'}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, 'starter')}
              />
            </div>

            <div className="pricing-plan-details">
              <div className="pricing-price">Free</div>
              <hr className="pricing-divider" />

              <h3 className="pricing-section-title">Includes</h3>

              <div className="pricing-features">
                {[
                  '1 email agent',
                  '50 email responses',
                  'Standard AI models',
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="pricing-feature"
                    variants={featureVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                  >
                    <Check className="pricing-feature-icon" />
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            className={`pricing-plan-card pricing-pro-plan ${
              selectedPlan === 'pro' ? 'pricing-selected' : ''
            }`}
            onClick={() => setSelectedPlan('pro')}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="pricing-plan-header">
              <h2 className="pricing-plan-title">Pro</h2>
              <div
                className={`pricing-selection ${selectedPlan === 'pro' ? 'pricing-checked' : ''}`}
                role="radio"
                aria-checked={selectedPlan === 'pro'}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, 'pro')}
              />
            </div>

            <div className="pricing-plan-details">
              <div className="pricing-price-container">
                <span className="pricing-price">$19.99</span>
                <span className="pricing-price-period">/month</span>
              </div>

              <hr className="pricing-divider" />

              <h3 className="pricing-section-title">Everything in starter, plus</h3>

              <div className="pricing-features">
                {[
                  'Unlimited agents',
                  'Unlimited email responses',
                  'Access to premium models',
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="pricing-feature"
                    variants={featureVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                  >
                    <Check className="pricing-feature-icon" />
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.button
          className="pricing-cta-button"
          onClick={handleContinue}
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          whileTap={{ scale: 0.95 }}
        >
          Go to BestWork
        </motion.button>
      </div>
    </div>
  );
};

export default PricingPlan;