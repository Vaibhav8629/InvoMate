import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  buttonTap,
  cardHover,
  fadeUpInView,
  listItemFade,
  listStagger,
  pageVariants,
  transitions,
} from "../animations/motionSystem";

export const PageMotion = ({ children, className, style }) => (
  <motion.div
    className={className}
    style={style}
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {children}
  </motion.div>
);

export const CardMotion = ({ children, className, style }) => (
  <motion.div
    className={className}
    style={style}
    variants={cardHover}
    initial="rest"
    animate="rest"
    whileHover="hover"
  >
    {children}
  </motion.div>
);

export const ButtonMotion = ({ children, className, style, disabled = false }) => (
  <motion.div
    className={className}
    style={style}
    whileHover={disabled ? undefined : buttonTap.whileHover}
    whileTap={disabled ? undefined : buttonTap.whileTap}
    transition={transitions.fast}
  >
    {children}
  </motion.div>
);

export const RevealOnScroll = ({ children, className, style, amount = 0.2 }) => (
  <motion.div
    className={className}
    style={style}
    variants={fadeUpInView}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount }}
  >
    {children}
  </motion.div>
);

export const StaggerList = ({ children, className, style }) => (
  <motion.div
    className={className}
    style={style}
    variants={listStagger}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.18 }}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({ children, className, style }) => (
  <motion.div className={className} style={style} variants={listItemFade}>
    {children}
  </motion.div>
);

export const AnimatedModal = ({ open, children }) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        key="animated-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transitions.normal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 6 }}
          transition={transitions.normal}
        >
          {children}
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);
