const glsl = require('glslify')
const vec3 = require('gl-vec3')
const quad = require('quads')
const subdivideQuads = require('gl-catmull-clark')

/**
 * Defining geometry in terms of quads.
 *
 *    b ---- c
 *    |      |
 *    |      |
 *    a ---- d
 *
 * Each quad can then be packed into buffers with
 * two triangles.
 */

module.exports = function main(regl) {
  const mesh = createGeometry()
  const primitive = 'triangles'

  return regl({
    vert: glsl`
      precision mediump float;
      attribute vec3 normal, position;
      uniform mat4 view, projection;
      varying vec3 vNormal;

      void main() {
        vNormal = normal;
        gl_Position = projection * view * vec4(position, 1.0);
      }
    `,
    frag: glsl`
      precision mediump float;
      #pragma glslify: matcap = require(matcap)
      uniform vec3 cameraPosition;
      uniform sampler2D matcapTexture;
      varying vec3 vNormal;

      void main() {
        vec3 normal = normalize(vNormal);
        vec2 uv = matcap(cameraPosition, normal);
        gl_FragColor = texture2D(matcapTexture, uv);
      }
    `,
    attributes: {
      position: mesh.positions,
      normal: mesh.normals
    },
    uniforms: {
      matcapTexture: regl.prop('matcapTexture')
    },
    elements: quad.elementsFromQuads(mesh, primitive),
    primitive: primitive,
    cull: { enable: true }
  })
}

function createGeometry () {
  // Create a box.
  const boxSize = 0.3;
  let mesh = quad.createBox(boxSize, boxSize, boxSize)

  // quad.extrude(
  //   mesh,
  //   cell,
  //   insetPercentage,
  //   extrudeLength
  // )

  // mesh = quad.subdivide(mesh, 1)

  return mesh
}

/**
 * This is a utility function to rotate a single quad.
 */
function rotateQuad (mesh, cell, rotate) {
  quad.extrude(mesh, cell, 0.5, 0.05)
  cell.forEach(i => {
    const position = mesh.positions[i]
    vec3.rotateY(position, position, [0, 0, 0], rotate)
  })
}
