// --- Global Variables ---
let scene, camera, renderer, controls, customAxesGroup;
let font = null;
const tokenMeshesGroup = new THREE.Group();
const gridPlanesGroup = new THREE.Group();
const worldOrigin = new THREE.Vector3(0, 0, 0);

// Visualization constants
const TEXT_SIZE = 0.4; // Slightly smaller text for potentially complex orientations
const TEXT_HEIGHT = 0.05;
// const TEXT_Y_OFFSET = 0.4; // No longer used for direct world Y offset of text

const ARROW_LENGTH = 2.0;
const ARROW_HEAD_LENGTH_RATIO = 0.2;
const ARROW_HEAD_WIDTH_RATIO = 0.1;
const ARROW_HELPER_LINEWIDTH = 2.0;
const ORIGIN_SCALING_FACTOR = 5;
const AXIS_LINE_LENGTH = ORIGIN_SCALING_FACTOR * 1.5;
const AXIS_ARROW_LENGTH = AXIS_LINE_LENGTH * 0.15;
const AXIS_ARROW_HEAD_RATIO = 0.4;

const GRID_SIZE = AXIS_LINE_LENGTH * 2;
const GRID_DIVISIONS = Math.floor(AXIS_LINE_LENGTH);

const LINE_TO_ORIGIN_COLOR = 0xffffff;
const LINE_TO_ORIGIN_OPACITY = 0.35;
const LINE_TO_ORIGIN_LINEWIDTH = 2.5;

const GRID_PLANE_OPACITY = 0.025;
const GRID_PLANE_COLOR = 0x7f8c8d;
const GRID_LINE_COLOR_CENTER = 0xaaaaaa;
const GRID_LINE_COLOR_GRID = 0x666666;

// --- Initialization ---
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2c3e50);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(
    ORIGIN_SCALING_FACTOR * 1.5,
    ORIGIN_SCALING_FACTOR * 1.5,
    ORIGIN_SCALING_FACTOR * 3
  );

  const canvasContainer = document.getElementById("canvasContainer");
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  canvasContainer.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(10, 15, 20);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 60;
  directionalLight.shadow.camera.left = -30;
  directionalLight.shadow.camera.right = 30;
  directionalLight.shadow.camera.top = 30;
  directionalLight.shadow.camera.bottom = -30;
  scene.add(directionalLight);

  const mainGroundPlaneGeometry = new THREE.PlaneGeometry(
    GRID_SIZE * 2,
    GRID_SIZE * 2
  );
  const mainGroundPlaneMaterial = new THREE.ShadowMaterial({
    opacity: 0.15,
  });
  const mainGroundPlane = new THREE.Mesh(
    mainGroundPlaneGeometry,
    mainGroundPlaneMaterial
  );
  mainGroundPlane.rotation.x = -Math.PI / 2;
  mainGroundPlane.position.y = -AXIS_LINE_LENGTH * 1.5;
  mainGroundPlane.receiveShadow = true;
  scene.add(mainGroundPlane);

  createGridPlanes();
  scene.add(gridPlanesGroup);

  createCustomAxes();

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = true;
  controls.minDistance = 1;
  controls.maxDistance = 300;
  controls.maxPolarAngle = Math.PI;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const fontLoader = new THREE.FontLoader();
  fontLoader.load(
    "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/droid/droid_sans_mono_regular.typeface.json",
    function (loadedFont) {
      font = loadedFont;
      document.getElementById("visualizeButton").disabled = false;
      handleVisualize();
    },
    undefined,
    function (error) {
      console.error("Monospace font loading failed:", error);
      showMessage(
        "Error: Could not load 3D monospace font. Visualization unavailable.",
        true
      );
    }
  );

  scene.add(tokenMeshesGroup);

  document
    .getElementById("visualizeButton")
    .addEventListener("click", handleVisualize);
  document.getElementById("visualizeButton").disabled = true;
  window.addEventListener("resize", onWindowResize, false);

  animate();
}

function createGridPlanes() {
  while (gridPlanesGroup.children.length > 0) {
    const obj = gridPlanesGroup.children[0];
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material.dispose();
    }
    gridPlanesGroup.remove(obj);
  }

  const planeMaterial = new THREE.MeshPhongMaterial({
    color: GRID_PLANE_COLOR,
    transparent: true,
    opacity: GRID_PLANE_OPACITY,
    side: THREE.DoubleSide,
    shininess: 10,
  });

  const xyPlaneGeom = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
  const xyPlane = new THREE.Mesh(xyPlaneGeom, planeMaterial.clone());
  xyPlane.receiveShadow = true;
  gridPlanesGroup.add(xyPlane);

  const xyGrid = new THREE.GridHelper(
    GRID_SIZE,
    GRID_DIVISIONS * 2,
    GRID_LINE_COLOR_CENTER,
    GRID_LINE_COLOR_GRID
  );
  xyGrid.rotation.x = Math.PI / 2;
  gridPlanesGroup.add(xyGrid);

  const xzPlaneGeom = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
  const xzPlane = new THREE.Mesh(xzPlaneGeom, planeMaterial.clone());
  xzPlane.rotation.x = -Math.PI / 2;
  xzPlane.receiveShadow = true;
  gridPlanesGroup.add(xzPlane);

  const xzGrid = new THREE.GridHelper(
    GRID_SIZE,
    GRID_DIVISIONS * 2,
    GRID_LINE_COLOR_CENTER,
    GRID_LINE_COLOR_GRID
  );
  gridPlanesGroup.add(xzGrid);

  const yzPlaneGeom = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
  const yzPlane = new THREE.Mesh(yzPlaneGeom, planeMaterial.clone());
  yzPlane.rotation.y = Math.PI / 2;
  yzPlane.receiveShadow = true;
  gridPlanesGroup.add(yzPlane);

  const yzGrid = new THREE.GridHelper(
    GRID_SIZE,
    GRID_DIVISIONS * 2,
    GRID_LINE_COLOR_CENTER,
    GRID_LINE_COLOR_GRID
  );
  yzGrid.rotation.z = Math.PI / 2;
  gridPlanesGroup.add(yzGrid);
}

function createCustomAxes() {
  if (customAxesGroup && customAxesGroup.parent) {
    while (customAxesGroup.children.length > 0) {
      const child = customAxesGroup.children[0];
      customAxesGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material))
          child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
      if (child instanceof THREE.ArrowHelper) {
        if (child.line && child.line.geometry) child.line.geometry.dispose();
        if (child.line && child.line.material) child.line.material.dispose();
        if (child.cone && child.cone.geometry) child.cone.geometry.dispose();
        if (child.cone && child.cone.material) child.cone.material.dispose();
      }
    }
    scene.remove(customAxesGroup);
  }
  customAxesGroup = new THREE.Group();

  const lineMaterials = {
    x: new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 }),
    y: new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 }),
    z: new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 2 }),
  };

  const lineGeometries = {
    x: new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-AXIS_LINE_LENGTH, 0, 0),
      new THREE.Vector3(AXIS_LINE_LENGTH, 0, 0),
    ]),
    y: new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -AXIS_LINE_LENGTH, 0),
      new THREE.Vector3(0, AXIS_LINE_LENGTH, 0),
    ]),
    z: new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -AXIS_LINE_LENGTH),
      new THREE.Vector3(0, 0, AXIS_LINE_LENGTH),
    ]),
  };

  customAxesGroup.add(new THREE.Line(lineGeometries.x, lineMaterials.x));
  customAxesGroup.add(new THREE.Line(lineGeometries.y, lineMaterials.y));
  customAxesGroup.add(new THREE.Line(lineGeometries.z, lineMaterials.z));

  const headLength = AXIS_ARROW_LENGTH * AXIS_ARROW_HEAD_RATIO;
  const headWidth = AXIS_ARROW_LENGTH * AXIS_ARROW_HEAD_RATIO * 0.75;

  customAxesGroup.add(
    new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(AXIS_LINE_LENGTH, 0, 0),
      AXIS_ARROW_LENGTH,
      0xff0000,
      headLength,
      headWidth
    )
  );
  customAxesGroup.add(
    new THREE.ArrowHelper(
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(-AXIS_LINE_LENGTH, 0, 0),
      AXIS_ARROW_LENGTH,
      0xff0000,
      headLength,
      headWidth
    )
  );
  customAxesGroup.add(
    new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, AXIS_LINE_LENGTH, 0),
      AXIS_ARROW_LENGTH,
      0x00ff00,
      headLength,
      headWidth
    )
  );
  customAxesGroup.add(
    new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, -AXIS_LINE_LENGTH, 0),
      AXIS_ARROW_LENGTH,
      0x00ff00,
      headLength,
      headWidth
    )
  );
  customAxesGroup.add(
    new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, AXIS_LINE_LENGTH),
      AXIS_ARROW_LENGTH,
      0x0000ff,
      headLength,
      headWidth
    )
  );
  customAxesGroup.add(
    new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0, -AXIS_LINE_LENGTH),
      AXIS_ARROW_LENGTH,
      0x0000ff,
      headLength,
      headWidth
    )
  );

  scene.add(customAxesGroup);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleVisualize() {
  if (!font) {
    showMessage("Font not loaded yet. Please wait.", true);
    return;
  }

  const sentence = document.getElementById("inputText").value.trim();
  let dModel = parseInt(document.getElementById("dModelInput").value);

  if (isNaN(dModel) || dModel < 4) dModel = 4;
  if (dModel > 256) dModel = 256;
  if (dModel % 2 !== 0) dModel = dModel < 256 ? dModel + 1 : dModel - 1;
  document.getElementById("dModelInput").value = dModel;

  if (!sentence) {
    showMessage("Input sentence cannot be empty.", true);
    clearVisualization();
    return;
  }

  const tokens = tokenize(sentence);
  if (tokens.length === 0) {
    showMessage("No tokens found in the sentence.", true);
    clearVisualization();
    return;
  }

  const peMatrix = calculatePositionalEncoding(tokens.length, dModel);
  displayPEVisualization(tokens, peMatrix, dModel);
}

function showMessage(message, isError = false) {
  const messageBox = document.getElementById("messageBox");
  messageBox.textContent = message;
  messageBox.style.backgroundColor = isError ? "#ef4444" : "#10b981";
  messageBox.style.display = "block";
  messageBox.style.opacity = 1;
  setTimeout(() => {
    messageBox.style.opacity = 0;
    setTimeout(() => {
      messageBox.style.display = "none";
    }, 500);
  }, 3000);
}

function tokenize(sentence) {
  return sentence.split(/\s+/).filter((token) => token.length > 0);
}

function calculatePositionalEncoding(numTokens, dModel) {
  const pe = [];
  for (let pos = 0; pos < numTokens; pos++) {
    pe[pos] = [];
    for (let i = 0; i < dModel / 2; i++) {
      const divTerm = Math.pow(10000, (2 * i) / dModel);
      const angle = pos / divTerm;
      pe[pos][2 * i] = Math.sin(angle);
      if (2 * i + 1 < dModel) {
        pe[pos][2 * i + 1] = Math.cos(angle);
      }
    }
  }
  return pe;
}

function clearVisualization() {
  while (tokenMeshesGroup.children.length > 0) {
    const child = tokenMeshesGroup.children[0];
    tokenMeshesGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
    if (child instanceof THREE.ArrowHelper) {
      if (child.line && child.line.geometry) child.line.geometry.dispose();
      if (child.line && child.line.material) child.line.material.dispose();
      if (child.cone && child.cone.geometry) child.cone.geometry.dispose();
      if (child.cone && child.cone.material) child.cone.material.dispose();
    }
  }
}

function displayPEVisualization(tokens, peMatrix, dModel) {
  clearVisualization();
  const tokenOrigins = [];

  tokens.forEach((token, pos) => {
    const peVector = peMatrix[pos];

    const originX = (peVector[0] || 0) * ORIGIN_SCALING_FACTOR;
    const originY = (peVector[1] || 0) * ORIGIN_SCALING_FACTOR;
    const originZ =
      peVector.length > 2 && peVector[2] !== undefined
        ? peVector[2] * ORIGIN_SCALING_FACTOR
        : 0;
    const arrowOrigin = new THREE.Vector3(originX, originY, originZ);
    tokenOrigins.push(arrowOrigin.clone());

    // --- Text Mesh Setup ---
    const textMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x111111,
    });
    const textGeometry = new THREE.TextGeometry(token, {
      font: font,
      size: TEXT_SIZE,
      height: TEXT_HEIGHT,
      curveSegments: 1,
      bevelEnabled: false,
    });
    textGeometry.computeBoundingBox(); // Needed for textWidth
    const textWidth =
      textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;

    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // --- Arrow Direction ---
    const dirX = peVector[0] || 0;
    const dirY = peVector[1] || 0;
    const dirZ =
      peVector.length > 2 && peVector[2] !== undefined ? peVector[2] : 0;

    const direction = new THREE.Vector3(dirX, dirY, dirZ);
    if (direction.lengthSq() === 0) {
      direction.set(0, 0.01, 0); // Avoid zero vector for normalization, use a tiny non-zero vector
    }
    direction.normalize();

    // --- Text Alignment and Positioning ---
    // 1. Position text mesh's origin at the arrow's origin initially.
    textMesh.position.copy(arrowOrigin);

    // 2. Align text's local X-axis (baseline) with the arrow's direction.
    const xAxis = new THREE.Vector3(1, 0, 0); // TextGeometry's baseline is along its local X.
    textMesh.quaternion.setFromUnitVectors(xAxis, direction.clone());

    // 3. Center the text along its length with respect to the arrowOrigin.
    // Shift it backward along its new X-axis (which is 'direction') by half its width.
    textMesh.position.addScaledVector(direction, -textWidth / 2);

    // 4. Offset the text slightly "upwards" relative to its new orientation.
    // This uses the text's local Y-axis after rotation.
    const textLocalUp = new THREE.Vector3(0, 1, 0).applyQuaternion(
      textMesh.quaternion
    );
    const perpendicularOffsetAmount = TEXT_SIZE * 0.6; // Adjust this factor for desired spacing
    textMesh.position.addScaledVector(textLocalUp, perpendicularOffsetAmount);

    textMesh.castShadow = true;
    tokenMeshesGroup.add(textMesh);

    // --- Arrow Helper ---
    let r = 0.5 + (peVector[0] || 0) * 0.5;
    let g = 0.5 + (peVector[1] || 0) * 0.5;
    let b =
      peVector.length > 2 && peVector[2] !== undefined
        ? 0.5 + peVector[2] * 0.5
        : 0.5;
    const arrowColor = new THREE.Color(r, g, b).getHex();

    const arrowHelper = new THREE.ArrowHelper(
      direction, // Normalized direction
      arrowOrigin,
      ARROW_LENGTH,
      arrowColor,
      ARROW_LENGTH * ARROW_HEAD_LENGTH_RATIO,
      ARROW_LENGTH * ARROW_HEAD_WIDTH_RATIO
    );
    if (arrowHelper.line && arrowHelper.line.material) {
      arrowHelper.line.material.linewidth = ARROW_HELPER_LINEWIDTH;
    }
    arrowHelper.line.castShadow = true;
    arrowHelper.cone.castShadow = true;
    tokenMeshesGroup.add(arrowHelper);

    // --- Line to Origin ---
    const arrowTipPosition = new THREE.Vector3()
      .copy(arrowOrigin)
      .addScaledVector(direction, ARROW_LENGTH);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      arrowTipPosition,
      worldOrigin,
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: LINE_TO_ORIGIN_COLOR,
      transparent: true,
      opacity: LINE_TO_ORIGIN_OPACITY,
      linewidth: LINE_TO_ORIGIN_LINEWIDTH,
    });
    const lineToOrigin = new THREE.Line(lineGeometry, lineMaterial);
    tokenMeshesGroup.add(lineToOrigin);
  });

  // Camera Adjustment
  if (tokenOrigins.length > 0) {
    const boundingBox = new THREE.Box3();
    tokenOrigins.forEach((o) => boundingBox.expandByPoint(o));
    // Also expand by a bit more to account for text and arrow lengths
    const expansion = Math.max(ARROW_LENGTH, TEXT_SIZE * 5); // Heuristic
    boundingBox.expandByScalar(expansion);
    boundingBox.expandByPoint(worldOrigin);

    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    controls.target.copy(center);

    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, AXIS_LINE_LENGTH); // Ensure axes are somewhat visible

    const fov = camera.fov * (Math.PI / 180);
    let cameraDist = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
    cameraDist = Math.max(cameraDist, AXIS_LINE_LENGTH * 1.2); // Min distance based on axis length
    cameraDist *= 2.0; // Increased padding for better overview

    const camDir = new THREE.Vector3();
    const currentCamDir = new THREE.Vector3();
    camera.getWorldDirection(currentCamDir);
    if (currentCamDir.lengthSq() === 0) {
      camDir.set(0.5, 0.5, 1).normalize();
    } else {
      camDir.copy(currentCamDir).multiplyScalar(-1);
    }

    camera.position.copy(center).addScaledVector(camDir, cameraDist);

    if (
      isNaN(camera.position.x) ||
      isNaN(camera.position.y) ||
      isNaN(camera.position.z) ||
      camera.position.distanceTo(controls.target) < AXIS_LINE_LENGTH * 0.5
    ) {
      camera.position.set(
        center.x + maxDim * 0.7,
        center.y + maxDim * 0.7,
        center.z + maxDim * 1.5 + ARROW_LENGTH
      );
    }
  } else {
    controls.target.set(0, 0, 0);
    camera.position.set(0, AXIS_LINE_LENGTH * 0.5, AXIS_LINE_LENGTH * 1.5);
  }
  controls.update();
}

// --- Start ---
if (typeof THREE === "undefined") {
  showMessage("Error: Three.js library not loaded. Cannot initialize.", true);
} else if (
  typeof THREE.FontLoader === "undefined" ||
  typeof THREE.TextGeometry === "undefined" ||
  typeof THREE.OrbitControls === "undefined"
) {
  showMessage("Error: Required Three.js components not loaded.", true);
} else {
  init();
}
