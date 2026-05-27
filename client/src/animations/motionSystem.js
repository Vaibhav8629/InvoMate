export const durations = {
  fast: 0.24,
  normal: 0.5,
  slow: 1.1,
};

export const easings = {
  standard: [0.22, 1, 0.36, 1],
  smooth: [0.22, 1, 0.36, 1],
};

export const transitions = {
  fast: { duration: durations.fast, ease: easings.standard },
  normal: { duration: durations.normal, ease: easings.standard },
  smooth: { duration: durations.slow, ease: easings.smooth },
};

export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: transitions.smooth },
  exit: { opacity: 0, y: -10, transition: transitions.normal },
};

export const fadeUpInView = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

export const cardHover = {
  rest: {
    y: 0,
    scale: 1,
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
  },
  hover: {
    y: -4,
    scale: 1.012,
    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.16)",
    transition: transitions.normal,
  },
};

export const buttonTap = {
  whileTap: { scale: 0.98 },
  whileHover: { scale: 1.02 },
};

export const listStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.14,
    },
  },
};

export const listItemFade = {
  hidden: { opacity: 0, y: 76 },
  visible: { opacity: 1, y: 0, transition: transitions.normal },
};
