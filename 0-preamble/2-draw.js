// Initialize regl
const regl = require('regl')({ /* configuration options */ })

const drawSomething = regl({
  // Demo: How to work with shader source code in-line:
  frag: "Add the fragment shader source code here",
  vert: "Add the vertex shader source code here",

  attributes: { /* Pass mesh buffers here. */ },
  uniforms: { /* Define uniform values here. */ },

  // ...more configuration options.
})

// Draw one frame:
drawSomething()
