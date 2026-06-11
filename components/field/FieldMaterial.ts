import * as THREE from 'three'

export const FIELD_THEMES = {
  dark: {
    color: 0xffffff, accent: 0xc94060, accent2: 0xd5813a,
    opacity: 0.85, blending: THREE.AdditiveBlending,
  },
  light: {
    color: 0x2c2724, accent: 0xb9314f, accent2: 0xc8601a,
    opacity: 0.6, blending: THREE.NormalBlending,
  },
} as const

const vertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uPulse; // 0..1, decays after a project card hover
  uniform int uShapeFrom;
  uniform int uShapeTo;
  uniform float uSize;
  attribute vec3 aPosTo;
  attribute float aScatter; // 0..1 per-particle random seed
  attribute float aTier;    // 0..1 size/color tier
  varying float vTier;

  // Per-shape procedural idle motion, computed on GPU so JS never touches positions.
  vec3 shapeMotion(int id, vec3 p, float t, float seed) {
    if (id == 0) {        // sphere: gentle radial shimmer
      return p * (1.0 + 0.015 * sin(t * 1.4 + seed * 6.2831));
    } else if (id == 1) { // dissolve: slow sinking drift
      return p + vec3(0.0, -0.25 * sin(t * 0.6 + seed * 6.2831), 0.0);
    } else if (id == 2) { // drift: lazy 3-axis wobble
      return p + 0.35 * vec3(sin(t * 0.5 + seed * 9.0), cos(t * 0.4 + seed * 7.0), sin(t * 0.3 + seed * 5.0));
    } else if (id == 3) { // lattice: faint pulse, amplified by uPulse on card hover (ripple)
      return p + vec3(0.0, (0.06 + 0.22 * uPulse) * sin(t * 1.2 + p.x * 0.8 + p.z * 0.8), 0.0);
    } else if (id == 4) { // wave: rolling bob travelling left to right
      return p + vec3(0.0, 0.55 * sin(t * 1.1 - p.x * 0.55 + p.z * 0.4), 0.0);
    } else {              // vortex: rotate in xy, faster near the eye
      float r = length(p.xy);
      float ang = (1.6 - r * 0.18) * t * 0.35;
      float c = cos(ang), s = sin(ang);
      return vec3(c * p.x - s * p.y, s * p.x + c * p.y, p.z);
    }
  }

  void main() {
    // Scattered per-particle start times make morphs organic instead of mechanical.
    float p = smoothstep(0.0, 1.0, clamp((uProgress - aScatter * 0.25) / 0.75, 0.0, 1.0));
    vec3 from = shapeMotion(uShapeFrom, position, uTime, aScatter);
    vec3 to   = shapeMotion(uShapeTo,   aPosTo,   uTime, aScatter);
    vec4 mv = modelViewMatrix * vec4(mix(from, to, p), 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.6 + aTier) * uPixelRatio * (30.0 / -mv.z);
    vTier = aTier;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform vec3 uAccent2;
  uniform float uOpacity;
  varying float vTier;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.15, d) * uOpacity;
    vec3 col = uColor;
    if (vTier > 0.93) col = uAccent;
    else if (vTier > 0.86) col = uAccent2;
    gl_FragColor = vec4(col, alpha);
  }
`

export function createFieldMaterial(isDark: boolean): THREE.ShaderMaterial {
  const t = isDark ? FIELD_THEMES.dark : FIELD_THEMES.light
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: t.blending,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uShapeFrom: { value: 1 }, // intro: dissolve → sphere
      uShapeTo: { value: 0 },
      uSize: { value: 0.9 },
      uPixelRatio: { value: 1 },
      uColor: { value: new THREE.Color(t.color) },
      uAccent: { value: new THREE.Color(t.accent) },
      uAccent2: { value: new THREE.Color(t.accent2) },
      uOpacity: { value: t.opacity },
    },
  })
}

export function applyFieldTheme(mat: THREE.ShaderMaterial, isDark: boolean): void {
  const t = isDark ? FIELD_THEMES.dark : FIELD_THEMES.light
  ;(mat.uniforms.uColor.value as THREE.Color).set(t.color)
  ;(mat.uniforms.uAccent.value as THREE.Color).set(t.accent)
  ;(mat.uniforms.uAccent2.value as THREE.Color).set(t.accent2)
  mat.uniforms.uOpacity.value = t.opacity
  mat.blending = t.blending
  mat.needsUpdate = true
}
