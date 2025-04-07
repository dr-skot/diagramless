import React, { useEffect, useState } from 'react';
import '../styles/Toast.css';

interface ToastProps {
  message: string;
  duration?: number;
  onClose?: () => void;
  animationKey?: number;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose, animationKey = 0 }) => {
  const [visible, setVisible] = useState(true);
  const [animationClass, setAnimationClass] = useState('fade-in');

  // Handle initial visibility and auto-close timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Handle animation class based on animationKey changes
  useEffect(() => {
    // First render - fade in
    if (animationKey === 1) {
      setAnimationClass('fade-in');
    } 
    // Subsequent triggers - jiggle
    else if (animationKey > 1) {
      setAnimationClass('jiggle');
      
      // Reset to no animation after jiggle completes
      const timer = setTimeout(() => {
        setAnimationClass('');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [animationKey]);

  return visible ? (
    <div className={`toast-container ${animationClass}`}>
      <div className="toast-message">{message}</div>
    </div>
  ) : null;
};

export default Toast;
