/**
 * How to define geometry.
 *
 *      b
 *      /\
 *     /  \
 *    /    \
 *   /      \
 *  a ------ c
 *
 */
const triangleMesh = {
  // Each position takes the form: [x, y, z]
  positions: [
    [-1, 0, 0], // Point a
    [0, 1, 0], // Point b
    [1, 0, 0], // Point c
  ],
  // Each "cell" contains indexes into the positions array.
  cells: [
    [0, 1, 2], // [a, b, c]
  ],
}

/**
 * Flatten a mesh into buffers that can be uploaded to
 * the graphics card.
 */
function flattenMeshIntoBuffers (mesh) {
  const buffers = {
    positions: new Float32Array(mesh.positions.length * 3),
    elements: new Uint32Array(mesh.cells.length * 3)
  }

  for (let i = 0; i < mesh.positions; i++) {
    // 👋 Pack our data into a buffer
    buffers.positions[i * 3 + 0] = mesh.positions[i][0]
    buffers.positions[i * 3 + 1] = mesh.positions[i][1]
    buffers.positions[i * 3 + 2] = mesh.positions[i][2]
  }

  for (let i = 0; i < mesh.cells; i++) {
    // 👋 Pack our data into a buffer
    buffers.cells[i * 3 + 0] = mesh.cells[i][0]
    buffers.cells[i * 3 + 1] = mesh.cells[i][1]
    buffers.cells[i * 3 + 2] = mesh.cells[i][2]
  }

  return buffers;
}
