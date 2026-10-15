//http://blog.andreaskahler.com/2009/06/creating-icosphere-mesh-in-code.html#:~:text=Icospheres%20are%20a%20type%20of%20geodesic%20dome.,parameter%20to%20the%20icosphere.%20Creating%20an%20Icosahedron.
let geometry = [];
let middlePointIndexCache = new Map();
let index = 0;

export let calculatedFaces;
export let calculatedIndices;

function addVertex(x, y, z) {
    const length = Math.sqrt(x*x + y*y + z*z);
    geometry.push([x / length, y / length, z / length]);
    return index++;
}

function getMiddlePoint(p1, p2) {
    const firstIsSmaller = p1 < p2;
    const smallerIndex = firstIsSmaller ? p1 : p2;
    const greaterIndex = firstIsSmaller ? p2 : p1;
    const key = `${greaterIndex}_${smallerIndex}`;

    if (middlePointIndexCache.has(key)) {
        return middlePointIndexCache.get(key);
    }

    const point1 = geometry[p1];
    const point2 = geometry[p2];
    const middle = [
        (point1[0] + point2[0]) / 2.0, 
        (point1[1] + point2[1]) / 2.0, 
        (point1[2] + point2[2]) / 2.0
    ];
    let i = addVertex(middle[0], middle[1], middle[2]);
    middlePointIndexCache.set(key, i);
    return middlePointIndexCache.get(key);
}

function create(recursionLevel) {
    let t = (1.0 + Math.sqrt(5.0)) / 2.0;
    
    //VERTICES
    addVertex(-1,  t,  0);
    addVertex( 1,  t,  0);
    addVertex(-1, -t,  0);
    addVertex( 1, -t,  0);

    addVertex( 0, -1,  t);
    addVertex( 0,  1,  t);
    addVertex( 0, -1, -t);
    addVertex( 0,  1, -t);

    addVertex( t,  0, -1);
    addVertex( t,  0,  1);
    addVertex(-t,  0, -1);
    addVertex(-t,  0,  1);

    //TRIANGLES
    let faces = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];

    for (let i = 0; i < recursionLevel; i++) {
        const faces2 = [];
        faces.forEach(tri => {
            const a = getMiddlePoint(tri[0], tri[1]);
            const b = getMiddlePoint(tri[1], tri[2]);
            const c = getMiddlePoint(tri[2], tri[0]);

            faces2.push([tri[0], a, c]);
            faces2.push([tri[1], b, a]);
            faces2.push([tri[2], c, b]);
            faces2.push([a, b, c]);
        });
        faces = faces2;
    }

    return { positions: flattenGeometryArray(geometry), indices: flattenFacesArray(faces) };
}


function flattenGeometryArray(geometryArr) {   
    const flatGeoArr = new Float32Array(geometryArr.length * 3);

    for (let i = 0; i < flatGeoArr.length; i++) {
        flatGeoArr[i] = geometryArr[Math.floor(i / 3)][i % 3];
    }

    //wow so cool that I learn about flat() AFTER i do this
    //return flatGeoArr = new Float32Array(geometryArr.flat());

    calculatedIndices = flatGeoArr;
    return flatGeoArr;
}

function flattenFacesArray(facesArr) {
    const flatFacesArr = new Uint16Array(facesArr.length * 3);

        for (let i = 0; i < flatFacesArr.length; i++) {
        flatFacesArr[i] = facesArr[Math.floor(i / 3)][i % 3];
    }

    calculatedFaces = flatFacesArr;
    return flatFacesArr;
}

create(1);