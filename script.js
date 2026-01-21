const editorState = {
  elements: [], // all rectangles & text
  selectedId: null, // currently selected element
  zIndexCounter: 1,
};

//tools
let selectMoveTool = document.querySelector('[data-tool="select"]');
let rectTool = document.querySelector('[data-tool="rect"]');
let textTool = document.querySelector('[data-tool="text"]');
let imgTool = document.querySelector('[data-tool="image"]');
//tools
let artBoard = document.querySelector("#artboard");
let toolsBtn = document.querySelectorAll(".tools-dock .tool-btn ");

// ===== CONSTANTS =====
const DEFAULT_RECT_CONFIG = {
  x: 60,
  y: 160,
  width: 240,
  height: 160,
  color: "var(--accent)",
};

const DEFAULT_TEXT_CONFIG = {
  text: "welcome to dezineX",
  x: 60,
  y: 160,
};

const RESIZE_HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

// ===== HELPER FUNCTIONS =====

/**
 * Generates a unique element ID
 */
function generateElementId() {
  return `el-${Date.now()}`;
}

/**
 * Creates default element styles
 */
function createDefaultStyles(color = null) {
  return {
    rotation: 0,
    color,
    radius: 0,
    stroke: 0,
  };
}

/**
 * Deactivates all active tool buttons
 */
function deactivateAllTools() {
  toolsBtn.forEach((btn) => btn.classList.remove("active"));
}

/**
 * Creates a selection box with resize and rotate handles
 */
function createSelectionBox() {
  const selectionBox = document.createElement("div");
  selectionBox.className = "selection-box";
  Object.assign(selectionBox.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
  });

  // Add resize handles
  RESIZE_HANDLES.forEach((position) => {
    const handle = document.createElement("div");
    handle.className = `resize-handle handle-${position}`;
    selectionBox.appendChild(handle);
  });

  // Add rotate handle
  const rotateHandle = document.createElement("div");
  rotateHandle.className = "rotate-handle";
  selectionBox.appendChild(rotateHandle);

  return selectionBox;
}

// ===== ELEMENT CREATORS =====

/**
 * Creates a rectangle element with selection controls
 * @param {Object} config - Rectangle configuration
 * @param {string} config.type - Element type
 * @param {number} config.x - X position
 * @param {number} config.y - Y position
 * @param {number} config.width - Width
 * @param {number} config.height - Height
 * @param {string} config.color - Background color
 */
function createRectElement({ type, x, y, width, height, color }) {
  const id = generateElementId();

  // Store element data
  editorState.elements.push({
    id,
    type,
    x,
    y,
    width,
    height,
    styles: createDefaultStyles(color),
  });

  // Create DOM element
  const element = document.createElement("div");
  element.className = "element rect";
  element.dataset.id = id;

  Object.assign(element.style, {
    position: "absolute",
    top: `${y}px`,
    left: `${x}px`,
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: color,
  });

  // Add selection box
  element.appendChild(createSelectionBox());

  return element;
}

/**
 * Creates a text element
 * @param {Object} config - Text configuration
 * @param {string} config.text - Text content
 * @param {number} config.x - X position
 * @param {number} config.y - Y position
 */
function createTextElement({ text, x, y }) {
  const id = generateElementId();
  const zIndex = editorState.zIndexCounter++;

  // Store element data
  editorState.elements.push({
    id,
    type: "text",
    x,
    y,
    width: 100,
    height: 200,
    content: text,
    zIndex,
    styles: {
      ...createDefaultStyles(),
      fontSize: "auto",
    },
  });

  // Create DOM element
  const element = document.createElement("div");
  element.className = "element text";
  element.dataset.id = id;
  element.textContent = text;

  Object.assign(element.style, {
    position: "absolute",
    top: `${y}px`,
    left: `${x}px`,
    width: "auto",
    height: "auto",
    zIndex,
  });

  return element;
}

// ===== EVENT HANDLERS =====

/**
 * Handles rectangle tool click
 */
function handleRectToolClick(e) {
  const rect = createRectElement({
    type: "rect",
    ...DEFAULT_RECT_CONFIG,
  });

  artBoard.appendChild(rect);

  deactivateAllTools();
  e.currentTarget.classList.add("active");

  console.log("Elements:", editorState.elements);
}

/**
 * Handles text tool click
 */
function handleTextToolClick(e) {
  const textEl = createTextElement(DEFAULT_TEXT_CONFIG);

  artBoard.appendChild(textEl);

  deactivateAllTools();
  e.currentTarget.classList.add("active");

  console.log("Elements:", editorState.elements);
  console.log("Z-Index Counter:", editorState.zIndexCounter);
}

// ===== EVENT LISTENERS =====
rectTool.addEventListener("click", handleRectToolClick);
textTool.addEventListener("click", handleTextToolClick);
