/**
 * Three.js utility functions for mentoriaOS
 */

import * as THREE from 'three'

/**
 * Create a gradient material with custom colors
 */
export const createGradientMaterial = (colorStart: string, colorEnd: string) => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256

  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.MeshPhongMaterial()

  const gradient = ctx.createLinearGradient(0, 0, 0, 256)
  gradient.addColorStop(0, colorStart)
  gradient.addColorStop(1, colorEnd)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)

  const texture = new THREE.CanvasTexture(canvas)
  return new THREE.MeshPhongMaterial({ map: texture })
}

/**
 * Get color for metric based on type
 */
export const getMetricColor = (metric: 'vendas' | 'leads' | 'trafego' | 'videos') => {
  const colors = {
    vendas: '#10b981',
    leads: '#3b82f6',
    trafego: '#f97316',
    videos: '#a855f7',
  }
  return colors[metric]
}

/**
 * Convert hex color to Three.js Color
 */
export const hexToThreeColor = (hex: string): THREE.Color => {
  return new THREE.Color(hex)
}

/**
 * Dispose of Three.js resources to prevent memory leaks
 */
export const disposeObject = (obj: THREE.Object3D) => {
  if (obj instanceof THREE.Mesh) {
    obj.geometry.dispose()
    if (Array.isArray(obj.material)) {
      obj.material.forEach((mat) => mat.dispose())
    } else {
      obj.material.dispose()
    }
  }

  obj.children.forEach((child) => disposeObject(child))
}
