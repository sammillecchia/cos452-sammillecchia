//File for handling platform objects, the blocks that make up the world

import { translation, scaling, multiply } from "./math.js";

// Cube
export const cubeVertices = new Float32Array([
    -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
    -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
    0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5
]);

export const cubeIndices = new Uint16Array([
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // back
    8, 9, 10, 8, 10, 11,   // top
    12, 13, 14, 12, 14, 15,   // bottom
    16, 17, 18, 16, 18, 19,   // right
    20, 21, 22, 20, 22, 23    // left
]);

//Wedge
export const wedgeVertices = new Float32Array([
    -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5,
    0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5
]);

export const wedgeIndices = new Uint16Array([
    0, 1, 2, 0, 2, 3,    // top
    4, 6, 7, 4, 5, 6,    // back 
    8, 11, 10, 8, 10, 9, // bottom
    12, 13, 14,          // left 
    15, 16, 17           // right 
]);

// Class for creating platform objects that are placed in the world
export class Platform {
    //TODO: Add rotation, especially for WEDGES.
  constructor(x, y, z, width, height, depth, shape="cube", rotX = 0, rotY = 0, rotZ = 0) {
    this.position = [x, y, z];
    this.scale = [width, height, depth];
    this.shape = shape;
    this.rotation = [rotX, rotY, rotZ]; //TODO: Implement this
  }

  getMatrix() {
    const T = translation(this.position[0], this.position[1], this.position[2]);
    const S = scaling(this.scale[0], this.scale[1], this.scale[2]);

    return multiply(T, S);
  }
}

// Array of platform objects in the world
export const levelPlatforms = [
  new Platform(0, 0, 0, 120, 1, 120, "cube"), // Floor
  new Platform(0, 1, -11, 20, 2, 10, "cube"), // Top platform
  new Platform(0, 1, -4, 20, 2, 4, "wedge"), // Cool wedge 
  new Platform(-20, 3, -4, 10, 2400, 3000, "wedge"), // big wedge
  new Platform(-35, 4, -4, 10, 8, 8, "wedge"), // 90 deg wedge
  new Platform(0, 3, -25, 10, 2, 10, "cube"), // jump 1
  new Platform(20, 4, -25, 10, 2, 10, "cube"), // jump 2
  new Platform(40, 5, -25, 10, 2, 10, "cube"), // jump 3
  new Platform(60, 6, -25, 10, 2, 10, "cube"), // jump 4
  new Platform(60, 7, -5, 10, 2, 10, "cube"), // jump 5
  new Platform(60, 8, 15, 10, 2, 10, "cube"), // jump 6
  new Platform(45, 9, 35, 10, 2, 10, "cube"), // jump 7
  new Platform(30, 10, 55, 10, 2, 10, "cube"), // jump 8
  new Platform(15, 11, 60, 10, 2, 10, "cube"), // jump 9
];
