import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import './BorderGlow.css';

const BorderGlow = ({ 
  children, 
  color = '#3b82f6',
  glowSize = 200,
  borderWidth = 2,
  borderRadius = 16,
  className = ''
}) => {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      className={`border-glow-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        borderRadius: `${borderRadius}px`,
        position: 'relative',
      }}
    >
      <motion.div
        className="border-glow-effect"
        style={{
          background: `radial-gradient(${glowSize}px circle at var(--mouse-x) var(--mouse-y), ${color}, transparent 80%)`,
          '--mouse-x': useTransform(x, (val) => `${val}px`),
          '--mouse-y': useTransform(y, (val) => `${val}px`),
          borderRadius: `${borderRadius}px`,
        }}
      />
      <div
        className="border-glow-content"
        style={{
          borderRadius: `${borderRadius}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;
