import { Program, Texture, type OGLRenderingContext } from 'ogl'
import { fragment, vertex } from './shaders'

/** Screen-space transmission: refract panes already drawn behind the current pane. */
export function createGlass(gl: OGLRenderingContext, base: Program) {
  const backdrop = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, flipY: false })
  const resolution = [1, 1]
  const program = new Program(gl, {
    vertex,
    fragment: fragment
      .replace('uniform float uLoss;', 'uniform float uLoss;\nuniform sampler2D uBackdrop;\nuniform vec2 uResolution;')
      .replace('  float inner =', `
  // A shallow bevel bends the view of the previously rendered panes at the glass edge.
  vec2 face = p / uHalf;
  vec2 bend = face * pow(max(abs(face.x), abs(face.y)), 6.0);
  vec2 screenUv = gl_FragCoord.xy / uResolution;
  vec2 offset = bend * (0.006 + (1.0 - vFacing) * 0.012);
  vec4 behind = texture(uBackdrop, clamp(screenUv + offset, 0.0, 1.0));
  vec3 transmitted = behind.rgb / max(behind.a, 0.001);
  col = mix(col, transmitted, behind.a * 0.38);
  float inner =`),
    transparent: true,
    depthTest: false,
    depthWrite: false,
    cullFace: false,
    uniforms: { ...base.uniforms, uBackdrop: { value: backdrop }, uResolution: { value: resolution } },
  })
  if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
    program.remove()
    gl.deleteTexture(backdrop.texture)
    throw new Error('Refraction shader could not be linked')
  }
  return {
    program,
    snapshot() {
      const width = gl.canvas.width
      const height = gl.canvas.height
      if (resolution[0] !== width || resolution[1] !== height) {
        resolution[0] = backdrop.width = width
        resolution[1] = backdrop.height = height
        backdrop.needsUpdate = true
      }
      // update() may reuse its cached binding without selecting the texture unit.
      gl.renderer.activeTexture(0)
      backdrop.update(0)
      gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, width, height)
    },
    dispose() {
      gl.deleteTexture(backdrop.texture)
      program.remove()
    },
  }
}
