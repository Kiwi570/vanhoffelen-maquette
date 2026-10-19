/* Faisceau de projecteur : cône de lumière volumétrique, poussières en suspension, réagit au curseur et à la musique. */
import { Renderer, Program, Mesh, Triangle } from '../vendor/ogl.min.mjs';

const vertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uSrc;
uniform vec2 uTarget;
uniform float uIntensity;
uniform float uLevel;
uniform float uWidth;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 src = vec2(uSrc.x * aspect, uSrc.y);
  vec2 tgt = vec2(uTarget.x * aspect, uTarget.y);
  vec2 d = p - src;
  float dist = length(d);
  vec2 dir = normalize(tgt - src);
  float c = dot(normalize(d), dir);
  float ang = acos(clamp(c, -1.0, 1.0));
  float w = uWidth * (1.0 + uLevel * 0.35);
  float cone = smoothstep(w, w * 0.05, ang);
  float core = smoothstep(w * 0.45, 0.0, ang);

  // rayons striés le long du faisceau
  float rays = noise(vec2(ang * 60.0, uTime * 0.15)) * 0.55 + 0.45;
  float fall = exp(-dist * 0.55);
  float beam = cone * fall * rays * 0.42 + core * fall * 0.18;

  // poussières
  vec2 g = p * 70.0 + vec2(uTime * 0.35, -uTime * 0.18);
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash(id);
  vec2 off = (vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5) * 0.7;
  float spark = step(0.965, h) * smoothstep(0.12, 0.0, length(f - off));
  float tw = 0.55 + 0.45 * sin(uTime * 1.3 + h * 40.0);
  float dust = spark * tw * cone * (0.6 + 0.6 * fall);

  // fumée douce
  float smoke = noise(p * 3.0 + vec2(uTime * 0.04, uTime * 0.02)) * cone * fall * 0.18;

  float flicker = 0.97 + 0.03 * sin(uTime * 5.0);
  float k = uIntensity * flicker * (1.0 + uLevel * 0.9);
  vec3 col = vec3(1.0, 0.85, 0.58) * (beam + smoke) * k + vec3(1.0, 0.93, 0.78) * dust * (0.9 + uLevel) * uIntensity;
  gl_FragColor = vec4(col, 1.0);
}`;

export function initBeam(canvas, core) {
  let renderer;
  try {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl') || probe.getContext('experimental-webgl'))) { canvas.remove(); return; }
  } catch (e) { canvas.remove(); return; }
  try {
    renderer = new Renderer({ canvas, dpr: Math.min(1, window.devicePixelRatio || 1) * 0.6, alpha: false, antialias: false, powerPreference: 'low-power' });
  } catch (e) { canvas.remove(); return; }
  const gl = renderer.gl;
  if (!gl) { canvas.remove(); return; }
  document.documentElement.classList.add('webgl');
  gl.clearColor(0, 0, 0, 1);
  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex, fragment,
    uniforms: {
      uTime: { value: 0 }, uRes: { value: [1, 1] }, uSrc: { value: [-0.08, 1.12] }, uTarget: { value: [0.7, 0.35] },
      uIntensity: { value: 1 }, uLevel: { value: 0 }, uWidth: { value: 0.2 }
    }
  });
  const mesh = new Mesh(gl, { geometry, program });
  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
  };
  window.addEventListener('resize', resize);
  resize();

  let tx = 0.7, ty = 0.35, inten = 1, running = true;
  const narrow = window.innerWidth < 760;
  program.uniforms.uWidth.value = narrow ? 0.28 : 0.2;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; });

  const frame = (t) => {
    const u = program.uniforms;
    const target = core.beam.target || [core.pointer.x, 1 - core.pointer.y];
    tx += (target[0] - tx) * 0.04; ty += (target[1] - ty) * 0.04;
    u.uTarget.value = [tx, ty];
    inten += (core.beam.intensity - inten) * 0.05;
    u.uIntensity.value = inten;
    u.uLevel.value = core.Player.sample();
    document.documentElement.style.setProperty('--level', u.uLevel.value.toFixed(3));
    u.uTime.value = t * 0.001;
    renderer.render({ scene: mesh });
  };
  if (core.calm) {
    frame(4000);
    window.addEventListener('resize', () => frame(4000));
    return;
  }
  const loop = (t) => { if (running) frame(t); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
