/**
 * Animation utility functions for mentoriaOS
 * Used for smooth transitions and effects across the app
 */

export const animationDurations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8,
}

export const easeInOutCubic = [0.645, 0.045, 0.355, 1.0]
export const easeOutQuad = [0.25, 0.46, 0.45, 0.94]
export const easeOutCubic = [0.215, 0.61, 0.355, 1.0]

/**
 * Staggered animation delays for list items
 */
export const getStaggerDelay = (index: number, baseDelay = 0.1) => {
  return index * baseDelay
}

/**
 * Calculate animation delay for fade-in effects
 */
export const getAnimationDelay = (offset = 0) => {
  return offset * 0.15
}

/**
 * Color animation presets
 */
export const colorAnimations = {
  glow: {
    initial: '#3b82f6',
    animate: '#60a5fa',
    transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' as const },
  },
  pulse: {
    initial: { opacity: 1 },
    animate: { opacity: 0.7 },
    transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' as const },
  },
}
