const createBox = require('geo-3d-box')
const glsl = require('glslify')
const vec3 = require('gl-vec3')

// Define some constant magic values
const BOX_SIZE = 0.04
const BOX_MARGIN = 0.001
const BOX_MULTIPLIER = 10

module.exports = function main(regl) {
  /**
   * Generate a mesh of a box.
   *
   *           .--------.
   *          /        /|
   *         .________. |
   *  box =  |        | |
   *         |        | .
   *         |________|/
   */
  const box = createBox({size: [BOX_SIZE, BOX_SIZE, BOX_SIZE ]})

  /**
   * Duplicate the box into a 3d grid of boxes, sort of like
   * a Rubik's cube.
   *
   *               ----------------
   *              /               /|
   *             /               / |
   *            ◾ ◾ ◾ ◾ ◾ ◾ ◾ ◾ ◾  |
   *            ◾ ◾ ◾ ◾ ◾ ◾ ◾ ◾ ◾  |
   *            ◾ ◾ ◾ ◾ ◾ ◾ ◾ ◾ ◾  |
   *            ◾ ◾ ◾ ◾ ◾ ◾ ◾ ◾ ◾  |
   *            ◾ ◾ ◾ ◾ ◾ ◾ ◾ ◾ ◾ /
   *            ◾ ◾ ◾ ◾ ◾ ◾ ◾ ◾ ◾/
   */
  const gridMesh = duplicateBoxIntoAGrid(regl, box)

  return makeDrawCall(regl, gridMesh);
}

function makeDrawCall (regl, gridMesh) {
  return regl({
    vert: glsl`
      precision mediump float;

      attribute float occluded;
      attribute vec3 normal, position, boxCenter;

      uniform float time;
      uniform mat4 model, view, projection;

      varying vec3 vPosition, vNormal;
      varying float vOccluded;

      // Pull in some 4d noise
      #pragma glslify: noise4d = require(glsl-noise/simplex/4d)

      float computeBoxSize(vec3 boxCenter) {
        return 0.3;
      }

      void main() {
        vec3 modifiedPosition =
          // Move the position to be centered about the origin.
          (position - boxCenter)
          // Modify the scale.
          * computeBoxSize(boxCenter)
          // Move it back to its original location.
          + boxCenter;

        // Pass down the varyings.
        vPosition = modifiedPosition;
        vNormal = normal;
        vOccluded = occluded;

        gl_Position = projection * view * vec4(modifiedPosition, 1.0);
      }
    `,

    frag: glsl`
      precision mediump float;
      #pragma glslify: hsl2rgb = require(glsl-hsl2rgb)

      uniform vec3 cameraPosition;
      uniform float time;

      varying vec3 vPosition, vNormal;
      varying float vOccluded;

      void main() {
        vec3 normal = normalize(vNormal);

        float hue = 0.0;
        float saturation = 0.7;
        float lightness = 0.5;

        vec3 materialColor = hsl2rgb(hue, saturation, lightness);
        vec3 ambientColor = hsl2rgb(hue, saturation, 0.2);

        // Lambertian lighting model:
        vec3 lightDirection = vec3(0.0, 0.7071, 0.7071);
        float surfaceBrightness = max(0.0, dot(normal, lightDirection));

        gl_FragColor = vec4(
          ambientColor + surfaceBrightness * materialColor,
          1.0
        );
      }
    `,
    attributes: {
      position: gridMesh.positions,
      normal: gridMesh.normals,
      boxCenter: gridMesh.centers,
      occluded: gridMesh.occluded
    },
    elements: gridMesh.elements
  })
}

function duplicateBoxIntoAGrid(regl, {positions, normals, cells}) {
  // Create a bunch of buffers to store our data.
  const positionsArray = new Float32Array(positions.length * Math.pow(BOX_MULTIPLIER, 3) * 3)
  const normalsArray = new Float32Array(positionsArray.length)
  const centersArray = new Float32Array(positionsArray.length)
  const occludedArray = new Float32Array(positionsArray.length / 3)
  const elementsArray = new Uint32Array(cells.length * Math.pow(BOX_MULTIPLIER, 3) * 3)

  // 👋 Do the work to duplicate the boxes into a grid.
  const centerOffset = -BOX_MULTIPLIER * (BOX_SIZE + BOX_MARGIN) / 2
  const position = [0, 0, 0]
  const origin = [0, 0, 0]
  const normal = [0, 0, 0]
  const inverseLength = 1 / Math.pow(2, 1/3)
  const angleTurn = Math.PI * 0.25

  for (let i = 0; i < BOX_MULTIPLIER; i++) {
    for (let j = 0; j < BOX_MULTIPLIER; j++) {
      for (let k = 0; k < BOX_MULTIPLIER; k++) {
        const offset = (
          i * BOX_MULTIPLIER * BOX_MULTIPLIER +
          j * BOX_MULTIPLIER +
          k
        )

        const positionOffset = offset * positions.length * 3
        for (let l = 0; l < positions.length; l++) {
          const gridOffsetX = centerOffset + i * (BOX_SIZE + BOX_MARGIN)
          const gridOffsetY = centerOffset + j * (BOX_SIZE + BOX_MARGIN)
          const gridOffsetZ = centerOffset + k * (BOX_SIZE + BOX_MARGIN)
          vec3.copy(position, positions[l])
          vec3.copy(normal, normals[l])

          positionsArray[positionOffset + l * 3 + 0] = position[0] + gridOffsetX
          positionsArray[positionOffset + l * 3 + 1] = position[1] + gridOffsetY
          positionsArray[positionOffset + l * 3 + 2] = position[2] + gridOffsetZ
          normalsArray[positionOffset + l * 3 + 0] = normal[0]
          normalsArray[positionOffset + l * 3 + 1] = normal[1]
          normalsArray[positionOffset + l * 3 + 2] = normal[2]
          centersArray[positionOffset + l * 3 + 0] = gridOffsetX
          centersArray[positionOffset + l * 3 + 1] = gridOffsetY
          centersArray[positionOffset + l * 3 + 2] = gridOffsetZ
          occludedArray[offset * positions.length + l] = Math.pow(Math.max(
            Math.abs((i + 0.5) / BOX_MULTIPLIER - 0.5) * 2,
            Math.abs((j + 0.5) / BOX_MULTIPLIER - 0.5) * 2,
            Math.abs((k + 0.5) / BOX_MULTIPLIER - 0.5) * 2
          ), 3)
        }

        const elementOffset = offset * cells.length * 3
        for (let l = 0; l < cells.length; l++) {
          elementsArray[elementOffset + l * 3 + 0] = cells[l][0] + positionOffset / 3
          elementsArray[elementOffset + l * 3 + 1] = cells[l][1] + positionOffset / 3
          elementsArray[elementOffset + l * 3 + 2] = cells[l][2] + positionOffset / 3
        }
      }
    }
  }

  // Return the buffers in a mesh object.
  return {
    positions: regl.buffer(positionsArray),
    normals: regl.buffer(normalsArray),
    centers: regl.buffer(centersArray),
    occluded: regl.buffer(occludedArray),
    elements: regl.elements(elementsArray),
  }
}
