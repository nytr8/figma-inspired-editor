
const editorState = {
  elements: [],
  selectedId: null,
  zIndexCounter: 1,
};

// ============================================
// DOM REFERENCES
// ============================================
const artBoard = document.querySelector("#artboard");
const layersDiv = document.querySelector(".layers .layers-list");
const toolsBtn = document.querySelectorAll(".tools-dock .tool-btn");

// Tool buttons
const selectMoveTool = document.querySelector('[data-tool="select"]');
const rectTool = document.querySelector('[data-tool="rect"]');
const textTool = document.querySelector('[data-tool="text"]');

// Action buttons
const sortUpBtn = document.querySelector("#sort-layers .sort-left");
const sortDownBtn = document.querySelector("#sort-layers .sort-right");
const saveBtn = document.querySelector(".top-nav .project-title .btn.primary");
const deleteBtn = document.querySelector(".top-nav .project-title .delete-btn");

// ============================================
// HELPER FUNCTIONS - DOM CREATION
// ============================================

/**
 * Creates a selection box with resize and rotate handles
 */
function createSelectionBox() {
  const selectionBox = document.createElement("div");
  selectionBox.className = "selection-box";

  // Add resize handles
  const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
  handles.forEach((pos) => {
    const handle = document.createElement("div");
    handle.className = `resize-handle handle-${pos}`;
    selectionBox.appendChild(handle);
  });

  // Add rotate handle
  const rotateHandle = document.createElement("div");
  rotateHandle.className = "rotate-handle";
  selectionBox.appendChild(rotateHandle);

  return selectionBox;
}

/**
 * Renders a DOM element from element data
 */
function renderElementDOM(elementData) {
  const element = document.createElement("div");
  element.className = `element ${elementData.type}`;
  element.id = elementData.id;
  element.style.position = "absolute";
  element.style.left = `${elementData.x}px`;
  element.style.top = `${elementData.y}px`;

  // Apply dimensions
  if (elementData.type === "text") {
    element.style.width = "auto";
    element.style.height = "auto";
    element.style.padding = "2px 5px";
    if (elementData.styles?.fontSize) {
      element.style.fontSize = elementData.styles.fontSize + "px";
    }
  } else {
    element.style.width = `${elementData.width}px`;
    element.style.height = `${elementData.height}px`;
  }

  // Apply styles
  if (elementData.styles) {
    if (elementData.styles.color && elementData.type !== "text") {
      element.style.backgroundColor = elementData.styles.color;
    }
    if (elementData.styles.rotation) {
      element.style.transform = `rotate(${elementData.styles.rotation}deg)`;
    }
    if (elementData.styles.radius) {
      element.style.borderRadius = `${elementData.styles.radius}px`;
    }
    if (elementData.styles.stroke) {
      element.style.border = `${elementData.styles.stroke}px solid white`;
    }
  }

  if (elementData.zIndex) {
    element.style.zIndex = elementData.zIndex;
  }

  // Add content for text elements
  if (elementData.type === "text") {
    const p = document.createElement("p");
    p.textContent = elementData.content;
    p.style.margin = "0";
    p.style.pointerEvents = "none";
    if (elementData.styles?.textColor) {
      p.style.color = elementData.styles.textColor;
      element.style.color = elementData.styles.textColor;
    }
    element.appendChild(p);
  }

  // Append selection box
  element.appendChild(createSelectionBox());

  return element;
}

// ============================================
// ELEMENT CREATION
// ============================================

/**
 * Creates a rectangle element
 */
function createRectElement({ type, x, y, width, height, color }) {
  const elementData = {
    id: `el-${Date.now()}`,
    type: type,
    x: x,
    y: y,
    width: width,
    height: height,
    isSelected: false,
    zIndex: editorState.elements.length + 1,
    styles: {
      rotation: 0,
      color: color,
      radius: 0,
      stroke: 0,
    },
  };

  editorState.elements.push(elementData);
  return renderElementDOM(elementData);
}

/**
 * Creates a text element
 */
function createTextElement({ text, x, y }) {
  const elementData = {
    id: `el-${Date.now()}`,
    type: "text",
    x: x,
    y: y,
    width: 100,
    height: 200,
    content: text,
    zIndex: editorState.elements.length + 1,
    isSelected: false,
    styles: {
      rotation: 0,
      color: null,
      radius: 0,
      stroke: 0,
      fontSize: "auto",
      fontFamily: "Arial",
      textColor: "#ffffff",
    },
  };

  editorState.elements.push(elementData);
  return renderElementDOM(elementData);
}

// ============================================
// LAYERS PANEL
// ============================================

/**
 * Renders the layers panel based on editorState.elements
 */
function renderLayersPanel() {
  let container = "";

  editorState.elements.forEach((elem, i) => {
    const icon =
      elem.type === "rect"
        ? '<i class="ri-shape-fill layer-icon"></i>'
        : '<i class="ri-text layer-icon"></i>';

    const selectedClass = elem.isSelected ? "selected" : "";

    container += `
      <div id="layer-${elem.id}" data-element-id="${elem.id}" class="layer-item ${selectedClass}">
        ${icon}
        <span class="layer-name">${elem.type}-${i}</span>
        <i class="ri-eye-line layer-icon" style="font-size: 12px; margin-left: auto;"></i>
      </div>
    `;
  });

  layersDiv.innerHTML = container;
}

/**
 * Updates z-indices for all elements
 */
function updateZIndices() {
  editorState.elements.forEach((el, index) => {
    const domEl = document.getElementById(el.id);
    if (domEl) {
      domEl.style.zIndex = index + 1;
      el.zIndex = index + 1;
    }
  });
}

/**
 * Moves a layer up or down in the stack
 */
function moveLayer(direction) {
  const selectedId = editorState.selectedId;
  if (!selectedId) return;

  const index = editorState.elements.findIndex((el) => el.id === selectedId);
  if (index === -1) return;

  if (direction === "up") {
    if (index >= editorState.elements.length - 1) return;
    [editorState.elements[index], editorState.elements[index + 1]] = [
      editorState.elements[index + 1],
      editorState.elements[index],
    ];
  } else if (direction === "down") {
    if (index <= 0) return;
    [editorState.elements[index], editorState.elements[index - 1]] = [
      editorState.elements[index - 1],
      editorState.elements[index],
    ];
  }

  updateZIndices();
  renderLayersPanel();

  const layerItem = document.getElementById(`layer-${selectedId}`);
  if (layerItem) layerItem.scrollIntoView({ block: "nearest" });
}

// ============================================
// SELECTION
// ============================================

/**
 * Handles clicking on layers panel to select elements
 */
function layersClickSelection() {
  layersDiv.addEventListener("click", (e) => {
    const clickedItem = e.target.closest(".layer-item");
    if (!clickedItem) return;

    const id = clickedItem.dataset.elementId;
    if (!id) return;

    // Clear all selections
    editorState.elements.forEach((el) => (el.isSelected = false));
    document
      .querySelectorAll(".layer-item.selected")
      .forEach((item) => item.classList.remove("selected"));
    document
      .querySelectorAll(".selection-box.active")
      .forEach((sb) => sb.classList.remove("active"));

    // Select the clicked element
    const selected = editorState.elements.find((el) => el.id === id);
    if (selected) {
      selected.isSelected = true;
    }

    clickedItem.classList.add("selected");

    const element = document.getElementById(id);
    if (element) {
      const selectionBox = element.querySelector(".selection-box");
      if (selectionBox) {
        selectionBox.classList.add("active");
      }
    }

    editorState.selectedId = id;
    if (window.updatePropertiesPanel) window.updatePropertiesPanel(selected);
  });
}

/**
 * Handles clicking on artboard elements to select them
 */
function boxAndTextSelection() {
  artBoard.addEventListener("click", (e) => {
    const element = e.target.closest(".element");

    // Clear all selections
    document
      .querySelectorAll(".selection-box")
      .forEach((sb) => sb.classList.remove("active"));
    editorState.elements.forEach((el) => (el.isSelected = false));
    document
      .querySelectorAll(".layer-item")
      .forEach((layer) => layer.classList.remove("selected"));

    // If clicked on empty space, deselect
    if (!element) {
      editorState.selectedId = null;
      if (window.updatePropertiesPanel) window.updatePropertiesPanel(null);
      return;
    }

    // Select the clicked element
    const id = element.dataset.id || element.id;
    if (!id) return;

    const selectionBox = element.querySelector(".selection-box");
    if (selectionBox) {
      selectionBox.classList.add("active");
    }

    editorState.selectedId = id;

    const selectedElement = editorState.elements.find((el) => el.id === id);
    if (selectedElement) {
      selectedElement.isSelected = true;
      if (window.updatePropertiesPanel)
        window.updatePropertiesPanel(selectedElement);
    }

    // Update layers panel
    const layerItem = document.getElementById(`layer-${id}`);
    if (layerItem) {
      layerItem.classList.add("selected");
      layerItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
}

// ============================================
// ELEMENT MANIPULATION
// ============================================

/**
 * Enables dragging elements on the artboard
 */
function moveElements() {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let selectedElement = null;

  artBoard.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("resize-handle")) return;
    if (e.target.classList.contains("rotate-handle")) return;

    const element = e.target.closest(".element");
    if (!element) return;

    const id = element.id || element.dataset.id;
    const stateElem = editorState.elements.find((el) => el.id === id);

    if (!stateElem || !stateElem.isSelected) return;

    isDragging = true;
    selectedElement = element;

    const elemRect = element.getBoundingClientRect();
    offsetX = e.clientX - elemRect.left;
    offsetY = e.clientY - elemRect.top;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging || !selectedElement) return;

    const artRect = artBoard.getBoundingClientRect();
    const elemRect = selectedElement.getBoundingClientRect();

    let x = e.clientX - artRect.left - offsetX;
    let y = e.clientY - artRect.top - offsetY;

    x = Math.max(0, Math.min(x, artRect.width - elemRect.width));
    y = Math.max(0, Math.min(y, artRect.height - elemRect.height));

    selectedElement.style.left = x + "px";
    selectedElement.style.top = y + "px";

    const stateElem = editorState.elements.find(
      (el) => el.id === selectedElement.id,
    );
    if (stateElem) {
      stateElem.x = x;
      stateElem.y = y;
      if (window.updatePropertiesPanel) window.updatePropertiesPanel(stateElem);
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    selectedElement = null;
  });
}

/**
 * Enables resizing elements
 */
function resize() {
  let isResizing = false;
  let currentElement = null;
  let currentHandle = null;
  let startX, startY, startWidth, startHeight, startLeft, startTop;

  artBoard.addEventListener("mousedown", function (e) {
    const handle = e.target;
    if (!handle.classList.contains("resize-handle")) return;

    e.stopPropagation();
    e.preventDefault();

    currentElement = handle.closest(".element");
    if (!currentElement) return;

    // Determine which handle was clicked
    const handleClasses = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
    currentHandle = handleClasses.find((h) =>
      handle.classList.contains(`handle-${h}`),
    );

    startX = e.clientX;
    startY = e.clientY;
    startWidth = currentElement.offsetWidth;
    startHeight = currentElement.offsetHeight;
    startLeft = currentElement.offsetLeft;
    startTop = currentElement.offsetTop;

    isResizing = true;
  });

  document.addEventListener("mousemove", function (e) {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;

    // Calculate new dimensions based on handle
    switch (currentHandle) {
      case "se":
        newWidth = startWidth + deltaX;
        newHeight = startHeight + deltaY;
        break;
      case "e":
        newWidth = startWidth + deltaX;
        break;
      case "s":
        newHeight = startHeight + deltaY;
        break;
      case "nw":
        newWidth = startWidth - deltaX;
        newHeight = startHeight - deltaY;
        newLeft = startLeft + deltaX;
        newTop = startTop + deltaY;
        break;
      case "n":
        newHeight = startHeight - deltaY;
        newTop = startTop + deltaY;
        break;
      case "ne":
        newWidth = startWidth + deltaX;
        newHeight = startHeight - deltaY;
        newTop = startTop + deltaY;
        break;
      case "sw":
        newWidth = startWidth - deltaX;
        newHeight = startHeight + deltaY;
        newLeft = startLeft + deltaX;
        break;
      case "w":
        newWidth = startWidth - deltaX;
        newLeft = startLeft + deltaX;
        break;
    }

    // Enforce minimum size
    newWidth = Math.max(30, newWidth);
    newHeight = Math.max(30, newHeight);

    // Keep within artboard bounds
    const artboardRect = artBoard.getBoundingClientRect();
    newWidth = Math.min(newWidth, artboardRect.width - newLeft);
    newHeight = Math.min(newHeight, artboardRect.height - newTop);
    newLeft = Math.max(0, newLeft);
    newTop = Math.max(0, newTop);

    // Apply changes
    currentElement.style.width = newWidth + "px";
    currentElement.style.height = newHeight + "px";
    currentElement.style.left = newLeft + "px";
    currentElement.style.top = newTop + "px";

    // Update font size for text elements
    if (currentElement.classList.contains("text")) {
      const fontSize = Math.max(12, Math.min(newHeight * 0.6, 200));
      currentElement.style.fontSize = fontSize + "px";

      const elementId = currentElement.id || currentElement.dataset.id;
      const elementData = editorState.elements.find(
        (el) => el.id === elementId,
      );
      if (elementData?.styles) {
        elementData.styles.fontSize = fontSize;
      }
    }

    // Update state
    const elementId = currentElement.id || currentElement.dataset.id;
    const elementData = editorState.elements.find((el) => el.id === elementId);
    if (elementData) {
      elementData.width = newWidth;
      elementData.height = newHeight;
      elementData.x = newLeft;
      elementData.y = newTop;
      if (window.updatePropertiesPanel)
        window.updatePropertiesPanel(elementData);
    }
  });

  document.addEventListener("mouseup", function () {
    isResizing = false;
    currentElement = null;
    currentHandle = null;
  });
}

/**
 * Enables rotating elements
 */
function rotate() {
  let isRotating = false;
  let rotatingElement = null;
  let startAngle = 0;
  let currentRotation = 0;

  artBoard.addEventListener("mousedown", function (e) {
    const handle = e.target;
    if (!handle.classList.contains("rotate-handle")) return;

    e.stopPropagation();
    e.preventDefault();

    rotatingElement = handle.closest(".element");
    if (!rotatingElement) return;

    const rect = rotatingElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

    const elementId = rotatingElement.id || rotatingElement.dataset.id;
    const elementData = editorState.elements.find((el) => el.id === elementId);
    currentRotation = elementData?.styles?.rotation || 0;

    isRotating = true;
  });

  document.addEventListener("mousemove", function (e) {
    if (!isRotating || !rotatingElement) return;

    const rect = rotatingElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const angleDiff = currentAngle - startAngle;
    const rotationDegrees = (angleDiff * 180) / Math.PI;
    const newRotation = currentRotation + rotationDegrees;

    rotatingElement.style.transform = `rotate(${newRotation}deg)`;

    const elementId = rotatingElement.id || rotatingElement.dataset.id;
    const elementData = editorState.elements.find((el) => el.id === elementId);
    if (elementData) {
      if (!elementData.styles) elementData.styles = {};
      elementData.styles.rotation = newRotation;
      if (window.updatePropertiesPanel)
        window.updatePropertiesPanel(elementData);
    }
  });

  document.addEventListener("mouseup", function () {
    isRotating = false;
    rotatingElement = null;
  });
}

/**
 * Enables double-click text editing
 */
function enableTextEditing() {
  let isEditingText = false;

  artBoard.addEventListener("dblclick", (e) => {
    const textElement = e.target.closest(".text");
    if (!textElement || isEditingText) return;

    const pTag = textElement.querySelector("p");
    const selectionBox = textElement.querySelector(".selection-box");
    if (!pTag || !selectionBox) return;

    // Hide ALL selection boxes before editing
    document.querySelectorAll(".selection-box").forEach((sb) => {
      sb.classList.remove("active");
    });

    pTag.style.display = "none";

    const input = document.createElement("textarea");
    input.value = pTag.textContent;
    input.className = "text-editor";

    textElement.appendChild(input);
    input.focus();
    input.select();

    isEditingText = true;

    function saveText() {
      if (!isEditingText) return;

      const newText = input.value.trim();
      pTag.textContent = newText;
      pTag.style.display = "block";
      input.remove();

      const elementId = textElement.dataset.id || textElement.id;
      const elementData = editorState.elements.find(
        (el) => el.id === elementId,
      );
      if (elementData) {
        elementData.content = newText;
      }

      // Only show selection box if element is still selected
      if (elementData?.isSelected) {
        selectionBox.classList.add("active");
      }

      isEditingText = false;
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        saveText();
      }
      if (e.key === "Escape") saveText();
    });

    input.addEventListener("blur", saveText);
  });
}

// ============================================
// PERSISTENCE
// ============================================

/**
 * Saves the project to localStorage
 */
function saveToLocalStorage() {
  const json = JSON.stringify(editorState);
  localStorage.setItem("dezinex-state", json);
  console.log("Project Saved!");
}

function saveProject() {
  saveToLocalStorage();
  alert("Project Saved Successfully!");
}

/**
 * Loads the project from localStorage
 */
function loadProject() {
  const json = localStorage.getItem("dezinex-state");
  if (!json) return;

  try {
    const parsedState = JSON.parse(json);
    editorState.elements = parsedState.elements || [];
    editorState.selectedId = null;
    editorState.zIndexCounter = parsedState.zIndexCounter || 1;

    artBoard.innerHTML = "";

    editorState.elements.forEach((elData) => {
      const domEl = renderElementDOM(elData);
      artBoard.appendChild(domEl);
    });

    renderLayersPanel();
    console.log("Project Loaded!");
  } catch (e) {
    console.error("Failed to load project:", e);
  }
}

/**
 * Deletes all elements from the project
 */
function deleteProject() {
  if (
    !confirm(
      "Are you sure you want to delete all elements? This cannot be undone.",
    )
  ) {
    return;
  }

  editorState.elements = [];
  editorState.selectedId = null;
  editorState.zIndexCounter = 1;

  artBoard.innerHTML = "";
  renderLayersPanel();
  localStorage.removeItem("dezinex-state");

  console.log("Project Deleted!");
  alert("All elements have been deleted.");
}

// ============================================
// PROPERTIES PANEL
// ============================================

function propsEditing() {
  const propertiesPanel = document.querySelector(
    ".sidebar.right .properties-content",
  );
  const getPropInput = (prop) =>
    propertiesPanel?.querySelector(`input[data-prop="${prop}"]`);

  const propertyInputs = {
    x: getPropInput("x"),
    y: getPropInput("y"),
    width: getPropInput("width"),
    height: getPropInput("height"),
    rotation: getPropInput("rotation"),
    radius: propertiesPanel
      ?.querySelectorAll(".input-group")[5]
      ?.querySelector("input"),
    fillColor: getPropInput("fill"),
    textColor: getPropInput("textColor"),
    fillPicker: document.getElementById("fill-color-picker"),
    textPicker: document.getElementById("text-color-picker"),
  };

  // Fallback for inputs without data-prop
  if (!propertyInputs.radius) {
    propertyInputs.radius =
      propertiesPanel?.querySelectorAll(".input-field")[5];
  }
  if (!propertyInputs.stroke) {
    propertyInputs.stroke =
      propertiesPanel?.querySelectorAll(".input-field")[8];
  }

  /**
   * Updates the properties panel with selected element's values
   */
  function updatePropertiesPanel(elementData) {
    if (!elementData) {
      if (propertyInputs.x) propertyInputs.x.value = "";
      if (propertyInputs.y) propertyInputs.y.value = "";
      if (propertyInputs.width) propertyInputs.width.value = "";
      if (propertyInputs.height) propertyInputs.height.value = "";
      if (propertyInputs.rotation) propertyInputs.rotation.value = "0°";
      if (propertyInputs.radius) propertyInputs.radius.value = "0";
      if (propertyInputs.fillColor) propertyInputs.fillColor.value = "";
      if (propertyInputs.textColor) propertyInputs.textColor.value = "";
      if (propertyInputs.stroke) propertyInputs.stroke.value = "0";
      return;
    }

    // Update position and size
    if (propertyInputs.x) propertyInputs.x.value = Math.round(elementData.x);
    if (propertyInputs.y) propertyInputs.y.value = Math.round(elementData.y);
    if (propertyInputs.width)
      propertyInputs.width.value = Math.round(elementData.width);
    if (propertyInputs.height)
      propertyInputs.height.value = Math.round(elementData.height);

    // Update rotation
    const rotation = elementData.styles?.rotation || 0;
    if (propertyInputs.rotation)
      propertyInputs.rotation.value = Math.round(rotation) + "°";

    // Update radius
    const radius = elementData.styles?.radius || 0;
    if (propertyInputs.radius) propertyInputs.radius.value = radius;

    // Update fill color
    const fillColor = elementData.styles?.color || "#0D99FF";
    if (propertyInputs.fillColor) propertyInputs.fillColor.value = fillColor;
    if (propertyInputs.fillPicker) propertyInputs.fillPicker.value = fillColor;

    const fillPreview = propertiesPanel?.querySelectorAll(".color-preview")[0];
    if (fillPreview) {
      fillPreview.style.backgroundColor = fillColor;
    }

    // Update text color (only for text elements)
    if (elementData.type === "text") {
      const textColor = elementData.styles?.textColor || "#FFFFFF";
      if (propertyInputs.textColor) propertyInputs.textColor.value = textColor;
      if (propertyInputs.textPicker)
        propertyInputs.textPicker.value = textColor;

      const textPreview =
        propertiesPanel?.querySelectorAll(".color-preview")[1];
      if (textPreview) {
        textPreview.style.backgroundColor = textColor;
      }

      const textColorSection = propertiesPanel?.querySelector(".textcolor-sec");
      if (textColorSection) textColorSection.style.display = "block";
    } else {
      const textColorSection = propertiesPanel?.querySelector(".textcolor-sec");
      if (textColorSection) textColorSection.style.display = "none";
    }

    // Update stroke
    const stroke = elementData.styles?.stroke || 0;
    if (propertyInputs.stroke) propertyInputs.stroke.value = stroke;
  }

  /**
   * Applies property changes to the selected element
   */
  function applyPropertyChange(property, value) {
    const selectedId = editorState.selectedId;
    if (!selectedId) return;

    const elementData = editorState.elements.find((el) => el.id === selectedId);
    const elementDOM =
      document.getElementById(selectedId) ||
      document.querySelector(`[data-id="${selectedId}"]`);

    if (!elementData || !elementDOM) return;

    switch (property) {
      case "x":
        elementData.x = parseFloat(value);
        elementDOM.style.left = value + "px";
        break;

      case "y":
        elementData.y = parseFloat(value);
        elementDOM.style.top = value + "px";
        break;

      case "width":
        elementData.width = parseFloat(value);
        elementDOM.style.width = value + "px";
        break;

      case "height":
        elementData.height = parseFloat(value);
        elementDOM.style.height = value + "px";

        if (elementData.type === "text") {
          const fontSize = Math.max(12, Math.min(parseFloat(value) * 0.6, 200));
          elementDOM.style.fontSize = fontSize + "px";
          if (elementData.styles) {
            elementData.styles.fontSize = fontSize;
          }
        }
        break;

      case "rotation":
        const rotationValue = parseFloat(value.replace("°", ""));
        if (!elementData.styles) elementData.styles = {};
        elementData.styles.rotation = rotationValue;
        elementDOM.style.transform = `rotate(${rotationValue}deg)`;
        break;

      case "radius":
        if (!elementData.styles) elementData.styles = {};
        elementData.styles.radius = parseFloat(value);
        elementDOM.style.borderRadius = value + "px";
        break;

      case "fillColor":
        if (!elementData.styles) elementData.styles = {};
        elementData.styles.color = value;
        elementDOM.style.backgroundColor = value;

        const fillPreview = document.querySelectorAll(".color-preview")[0];
        if (fillPreview) fillPreview.style.backgroundColor = value;

        if (
          propertyInputs.fillColor &&
          propertyInputs.fillColor.value !== value
        )
          propertyInputs.fillColor.value = value;
        if (
          propertyInputs.fillPicker &&
          propertyInputs.fillPicker.value !== value
        )
          propertyInputs.fillPicker.value = value;
        break;

      case "textColor":
        if (!elementData.styles) elementData.styles = {};
        elementData.styles.textColor = value;
        elementDOM.style.color = value;

        const pTag = elementDOM.querySelector("p");
        if (pTag) pTag.style.color = value;

        const textPreview = document.querySelectorAll(".color-preview")[1];
        if (textPreview) textPreview.style.backgroundColor = value;

        if (
          propertyInputs.textColor &&
          propertyInputs.textColor.value !== value
        )
          propertyInputs.textColor.value = value;
        if (
          propertyInputs.textPicker &&
          propertyInputs.textPicker.value !== value
        )
          propertyInputs.textPicker.value = value;
        break;

      case "stroke":
        if (!elementData.styles) elementData.styles = {};
        elementData.styles.stroke = parseFloat(value);
        elementDOM.style.border = `${value}px solid white`;
        break;
    }
  }

  /**
   * Initialize properties panel event listeners
   */
  function initializePropertiesPanel() {
    const addListener = (input, prop) => {
      if (input) {
        input.addEventListener("change", (e) =>
          applyPropertyChange(prop, e.target.value),
        );
        input.addEventListener("input", (e) =>
          applyPropertyChange(prop, e.target.value),
        );
      }
    };

    addListener(propertyInputs.x, "x");
    addListener(propertyInputs.y, "y");
    addListener(propertyInputs.width, "width");
    addListener(propertyInputs.height, "height");
    addListener(propertyInputs.rotation, "rotation");
    addListener(propertyInputs.radius, "radius");
    addListener(propertyInputs.fillColor, "fillColor");
    addListener(propertyInputs.textColor, "textColor");
    addListener(propertyInputs.stroke, "stroke");

    if (propertyInputs.fillPicker) {
      propertyInputs.fillPicker.addEventListener("input", (e) =>
        applyPropertyChange("fillColor", e.target.value),
      );
    }
    if (propertyInputs.textPicker) {
      propertyInputs.textPicker.addEventListener("input", (e) =>
        applyPropertyChange("textColor", e.target.value),
      );
    }

    console.log("✅ Properties panel initialized");
  }

  initializePropertiesPanel();
  window.updatePropertiesPanel = updatePropertiesPanel;
}

// ============================================
// EVENT LISTENERS - TOOLS
// ============================================

rectTool.addEventListener("click", (e) => {
  const rect = createRectElement({
    type: "rect",
    x: 60,
    y: 160,
    width: 240,
    height: 160,
    color: "var(--accent)",
  });

  artBoard.appendChild(rect);
  toolsBtn.forEach((elem) => elem.classList.remove("active"));
  e.currentTarget.classList.add("active");
  renderLayersPanel();
});

textTool.addEventListener("click", (e) => {
  const textEl = createTextElement({
    text: "welcome to dezineX",
    x: 60,
    y: 160,
  });

  artBoard.appendChild(textEl);
  toolsBtn.forEach((btn) => btn.classList.remove("active"));
  e.currentTarget.classList.add("active");
  renderLayersPanel();
});

// ============================================
// EVENT LISTENERS - ACTIONS
// ============================================

if (sortUpBtn) sortUpBtn.addEventListener("click", () => moveLayer("up"));
if (sortDownBtn) sortDownBtn.addEventListener("click", () => moveLayer("down"));
if (saveBtn) saveBtn.addEventListener("click", saveProject);
if (deleteBtn) deleteBtn.addEventListener("click", deleteProject);

// Keyboard delete functionality
document.addEventListener("keydown", (e) => {
  // Only delete if Delete or Backspace key is pressed
  if (e.key !== "Delete" && e.key !== "Backspace") return;

  // Don't delete if user is typing in an input or textarea
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

  // Don't delete if no element is selected
  if (!editorState.selectedId) return;

  e.preventDefault(); // Prevent browser back navigation on Backspace

  // Find the selected element
  const elementIndex = editorState.elements.findIndex(
    (el) => el.id === editorState.selectedId,
  );
  if (elementIndex === -1) return;

  // Remove from DOM
  const elementDOM = document.getElementById(editorState.selectedId);
  if (elementDOM) {
    elementDOM.remove();
  }

  // Remove from state
  editorState.elements.splice(elementIndex, 1);
  editorState.selectedId = null;

  // Update UI
  renderLayersPanel();
  if (window.updatePropertiesPanel) window.updatePropertiesPanel(null);

  // Save changes to localStorage
  saveToLocalStorage();

  console.log("Element deleted");
});

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener("DOMContentLoaded", loadProject);

propsEditing();
enableTextEditing();
rotate();
resize();
moveElements();
boxAndTextSelection();
layersClickSelection();
