/**
 * Let's do something with a plane.
 *
 * (Feel free to 👋 here)
 *
 *
 *
 */
const regl = require('regl')()
const mat4 = require('gl-mat4')
const glsl = require('glslify')

const positions = generatePlane(100, 100)

const drawPlane = regl({

  /**
   * Our vertex shader "function signature" now
   * looks like this:
   *
   *   (attributes, uniforms) => [position, varying]
   */
  vert: glsl`
    precision mediump float;
    attribute vec3 position;
    uniform mat4 view, projection;

    void main() {
      gl_Position = projection * view * vec4(position, 1);
    }
  `,

  /**
   * Our fragment shader "function signature" now
   * looks like this:
   *
   *   (varying) => color
   */
  frag: glsl`
    precision mediump float;
    void main() {
      float red = 1.0;
      float green = 0.0;
      float blue = 0.0;
      float alpha = 1.0;

      gl_FragColor = vec4(red, green, blue, alpha);
    }
  `,

  // 👋 Configure the draw command
  attributes: {
    // 👋 this converts the vertices of the mesh into
    // the position attribute
    position: positions,
  },
  count: positions.length,
  uniforms: {
    // 👋 Set up the uniforms
    view: ({time}) => {
      const t = time * 0.4
      return mat4.lookAt([],
        [2 * Math.cos(t), 1.5, 2 * Math.sin(t)],
        [0, 0, 0],
        [0, 1, 0])
    },
    time: ({time}) => time,
    projection: ({viewportWidth, viewportHeight}) => (
      mat4.perspective([],
        Math.PI / 4,
        viewportWidth / viewportHeight,
        0.01,
        1000)
      )
  }
})

function generatePlane (segmentsX, segmentsZ) {
  // 👋 MATH AHEAD!
  const positions = []
  const widthX = 1 / segmentsX
  const widthZ = 1 / segmentsZ

  // Loop through all of the segments.
  for (let x = 0; x < segmentsX; x++) {
    for (let z = 0; z < segmentsZ; z++) {
      // Build 2 triangles
      //
      //       (x0, z1)       (x1, z1)
      //              *-------*
      //              | A   / |
      //              |   /   |
      //              | /   B |
      //              *-------*
      //       (x0, z0)       (x1, z0)

      // Figure out the positions.
      const x0 = x * widthX - 0.5
      const x1 = (x + 1) * widthX - 0.5
      const z0 = z * widthZ - 0.5
      const z1 = (z + 1) * widthZ - 0.5

      // Define triangle A
      positions.push([x0, 0, z0])
      positions.push([x0, 0, z1])
      positions.push([x1, 0, z1])

      // Define triangle B
      positions.push([x1, 0, z1])
      positions.push([x1, 0, z0])
      positions.push([x0, 0, z0])
    }
  }
  return positions
}

// Run the draw code on every frame update at 60fps.
regl.frame(() => {
  regl.clear({ depth: 1, color: [0, 0, 0, 1] })
  drawPlane()
})
