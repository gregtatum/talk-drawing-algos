// Create a draw command
const drawHelloWorld = regl({


  // The vertex shader moves our points:
  vert: glsl`
    precision mediump float;

    // Position data in:
    attribute vec3 position;

    void main() {
      // Position data out:
      gl_Position = vec4(position, 1.0);
    }
  `,

  // The fragment shader colors our pixels:
  frag: glsl`
    precision mediump float;

    void main() {
      // Colors are ranged 0 to 1 in value.
      float red = 1.0;
      float green = 0.0;
      float blue = 0.0;
      float alpha = 1.0;

      // Set the pixel color:
      gl_FragColor = vec4(red, blue, green, alpha);
    }
  `,
})



// Shaders are functions that run in parallel
// on the graphics card:

// Vertex shader:   (...attributes) => position
// Fragment shader: () => color












//
