export const vertex = /* glsl */ `#version 300 es
in vec3 position;
in vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
out vec2 vUv;
out float vFacing;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
  vFacing = abs(dot(n, normalize(-mv.xyz)));
  gl_Position = projectionMatrix * mv;
}
`

export const fragment = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
in float vFacing;
uniform sampler2D uPoster;
uniform float uHasPoster;
uniform vec3 uTint;
uniform vec3 uSignal;
uniform vec3 uPanel;
uniform vec3 uLine;
uniform vec2 uQuad;
uniform vec2 uHalf;
uniform float uDim;
uniform float uTune;
uniform float uAmp;
uniform float uPhase;
uniform float uWave;
uniform float uFromWave;
uniform float uMorph;
uniform float uOnAir;
uniform float uTime;
uniform float uLoss;
out vec4 fragColor;

const float TAU = 6.2831853;

float sdBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float g(float x, float c, float w) {
  float d = (x - c) / w;
  return exp(-d * d);
}

float wave(float kind, float s) {
  if (kind < 0.5) {
    float u = fract(s * 0.5);
    return 0.95 * g(u, 0.46, 0.018) - 0.42 * g(u, 0.51, 0.02) - 0.18 * g(u, 0.41, 0.025) + 0.2 * g(u, 0.7, 0.05);
  }
  if (kind < 1.5) return sin(TAU * s) * 0.8;
  if (kind < 2.5) {
    float q = sin(TAU * s * 0.75) * 1.5;
    return (floor(q) + smoothstep(0.4, 0.6, fract(q))) / 2.2;
  }
  if (kind < 3.5) return clamp(sin(TAU * s * 0.75) * 7.0, -1.0, 1.0) * 0.7;
  if (kind < 4.5) return 0.5 * sin(TAU * s) + 0.38 * sin(TAU * s * 2.7 + 1.3) * cos(TAU * s * 0.35);
  return (1.0 - 4.0 * abs(fract(s * 0.8 + 0.25) - 0.5)) * 0.75;
}

float trace(float x, float span) {
  float t = (x + span) / (2.0 * span);
  float env = smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.9, t);
  float s = t * 2.4 - uPhase;
  return mix(wave(uFromWave, s), wave(uWave, s), uMorph) * env * uAmp;
}

float hash(float n) {
  return fract(sin(n) * 43758.5453);
}

float line(float d, float px, float w) {
  return clamp(w * 0.5 - d / px + 0.5, 0.0, 1.0);
}

void main() {
  vec2 p = (vUv - 0.5) * uQuad;
  float px = length(fwidth(p)) * 0.7071;

  p.x += (hash(floor(p.y * 60.0) + floor(uTime * 40.0)) - 0.5) * 0.05 * uTune;

  float d = sdBox(p, uHalf, 0.045);
  float cover = clamp(0.5 - d / px, 0.0, 1.0);
  if (cover <= 0.0) discard;

  float lift = 1.0 + 0.45 * (1.0 - vFacing);
  vec3 accent = mix(uTint, uSignal, smoothstep(0.0, 0.5, uTune));
  vec3 col = uPanel * (1.0 + 0.05 * (p.y / uHalf.y));

  float inner = uHalf.x - 0.12;
  float top = uHalf.y - 0.14;

  float rules = line(abs(p.y - (top - 0.17)), px, 1.0) * step(p.x, -inner + 0.62) * step(-inner, p.x);
  rules = max(rules, line(abs(p.y - (top - 0.25)), px, 1.0) * step(p.x, -inner + 0.38) * step(-inner, p.x));
  col = mix(col, uLine, rules * mix(0.55, 0.9, uDim));

  float chip = step(sdBox(p - vec2(-inner + 0.08, top - 0.02), vec2(0.08, 0.022), 0.006), 0.0);
  col = mix(col, accent, chip * uDim);

  float base = -0.17;
  float span = inner;
  float inSpan = step(-span, p.x) * step(p.x, span);
  col = mix(col, uLine, line(abs(p.y - base), px, 1.0) * inSpan * 0.6);

  float e = px;
  float f0 = trace(p.x, span);
  float slope = (trace(p.x + e, span) - trace(p.x - e, span)) / (2.0 * e);
  float td = abs(p.y - base - f0) / sqrt(1.0 + slope * slope);
  float tr = line(td, px, 1.35 + 0.5 * uTune) * inSpan;
  col = mix(col, accent, tr * uDim);

  float dot = clamp(0.5 - (length(p - vec2(inner - 0.02, top - 0.02)) - 0.028) / px, 0.0, 1.0);
  col = mix(col, uSignal, dot * uOnAir);

  vec2 posterUv = p / (uHalf * 2.0) + 0.5;
  vec3 poster = texture(uPoster, clamp(posterUv, 0.0, 1.0)).rgb;
  float posterMix = uHasPoster * (1.0 - uTune * 0.35);
  col = mix(col, poster, posterMix * 0.92);
  // The status lamp stays readable over every recreation still.
  col = mix(col, uSignal, dot * uOnAir);

  float rim = line(abs(d + px), px, 1.0);
  vec3 rimCol = mix(uLine, accent, 0.55 + 0.45 * uTune) * lift;
  col = mix(col, rimCol, rim * mix(0.5, 1.0, uDim));

  col *= 0.985 + 0.015 * sign(fract(gl_FragCoord.y * 0.5) - 0.5);

  col = mix(col, vec3(dot(col, vec3(0.2126, 0.7152, 0.0722))), uLoss);
  float a = cover * 0.97;
  fragColor = vec4(col * a, a);
}
`
