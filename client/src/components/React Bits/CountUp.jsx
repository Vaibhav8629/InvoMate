import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'motion/react';

const CountUp = ({
  from = 0,
  to = 100,
  duration = 0.15,
  delay = 0,
  separator = ',',
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  onComplete,
  triggerOnce = true,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: triggerOnce, amount: 0.5 });
  const [hasAnimated, setHasAnimated] = useState(false);

  const springValue = useSpring(from, {
    damping: 60,
    stiffness: 100,
  });

  const display = useTransform(springValue, (current) => {
    const num = current.toFixed(decimals);
    const parts = num.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return `${prefix}${parts.join('.')}${suffix}`;
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      const timeout = setTimeout(() => {
        springValue.set(to);
        setHasAnimated(true);
        
        const completeTimeout = setTimeout(() => {
          if (onComplete) onComplete();
        }, duration * 1000);

        return () => clearTimeout(completeTimeout);
      }, delay * 1000);

      return () => clearTimeout(timeout);
    }
  }, [isInView, hasAnimated, to, delay, duration, springValue, onComplete]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
};

export default CountUp;
