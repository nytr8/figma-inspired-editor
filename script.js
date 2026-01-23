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

//whole art board
let artBoard = document.querySelector("#artboard");
//all tools btn
let toolsBtn = document.querySelectorAll(".tools-dock .tool-btn ");
//
let layersDiv = document.querySelector(".layers .layers-list ");
let layersItems = document.querySelectorAll(
  ".layers .layers-list .layer-item ",
);
let container = "";

//create items in layers
console.log(editorState.elements);
function createRectElement({ type, x, y, width, height, color }) {
  //push data into array
  let vals = {
    id: `el-${Date.now()}`, // unique id
    type: `${type}`,
    x: x,
    y: y,
    width: width,
    height: height,
    isSelected: false,
    styles: {
      rotation: 0,
      color: `${color}`,
      radius: 0,
      stroke: 0,
    },
  };
  editorState.elements.push(vals);
  // Main element
  const element = document.createElement("div");
  element.className = "element rect";
  element.id = `${vals.id}`;
  element.style.position = "absolute";
  element.style.top = `${y}px`;
  element.style.left = `${x}px`;
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  element.style.backgroundColor = color;

  // Selection box
  const selectionBox = document.createElement("div");
  selectionBox.className = "selection-box";
  selectionBox.id = "selection-box";
  selectionBox.style.position = "absolute";
  selectionBox.style.top = "0";
  selectionBox.style.left = "0";
  selectionBox.style.width = "100%";
  selectionBox.style.height = "100%";

  // Resize handles
  const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

  handles.forEach((pos) => {
    const handle = document.createElement("div");
    handle.className = `resize-handle handle-${pos}`;
    selectionBox.appendChild(handle);
  });

  // Rotate handle
  const rotateHandle = document.createElement("div");
  rotateHandle.className = "rotate-handle";
  selectionBox.appendChild(rotateHandle);

  // Append selection box to element
  element.appendChild(selectionBox);

  return element;
}
rectTool.addEventListener("click", (e) => {
  const rect = createRectElement({
    type: "rect",
    x: 60,
    y: 160,
    width: 240,
    height: 160,
    color: "var(--accent)",
  });
  //   console.log(editorState.elements);
  artBoard.appendChild(rect);
  toolsBtn.forEach((elem) => {
    // console.log(elem);
    if (elem.classList.contains("active")) {
      elem.classList.remove("active");
    }
  });
  e.currentTarget.classList.add("active");

  layersDiv.innerHTML = "";
  container = "";
  editorState.elements.forEach((elem, i) => {
    container += `
    <div id=${elem.id} class="layer-item ">
      ${
        elem.type === "rect"
          ? '<i class="ri-shape-fill layer-icon"></i>'
          : '<i class="ri-text layer-icon"></i>'
      }
      <span class="layer-name">${elem.type}-${i}</span>
      <i class="ri-eye-line layer-icon" style="font-size: 12px; margin-left: auto;"></i>
    </div>
  `;
  });

  layersDiv.innerHTML = container;
});

function createTextElement({ text, x, y }) {
  const zIndex = editorState.zIndexCounter++;
  //push data into array
  let val = {
    id: `el-${Date.now()}`, // unique id
    type: "text",
    x: x,
    y: y,
    width: 100,
    height: 200,
    content: text,
    zIndex,
    isSelected: false,
    styles: {
      rotation: 0,
      color: null,
      radius: 0,
      stroke: 0,
      fontSize: "auto",
      fontFamily: "Arial",
    },
  };
  editorState.elements.push(val);

  const element = document.createElement("div");
  element.className = "element text";
  element.id = `${val.id}`;
  element.style.position = "absolute";
  element.style.top = `${y}px`;
  element.style.left = `${x}px`;
  element.style.width = "auto";
  element.style.height = "auto";
  element.style.padding = "2px 5px";

  // Text node
  const p = document.createElement("p");
  p.textContent = text;
  p.style.margin = "0";
  p.style.pointerEvents = "none"; // important for drag/select
  element.appendChild(p);

  // Selection box
  const selectionBox = document.createElement("div");
  selectionBox.className = "selection-box";
  selectionBox.style.position = "absolute";
  selectionBox.style.top = "0";
  selectionBox.style.left = "0";
  selectionBox.style.width = "100%";
  selectionBox.style.height = "100%";

  // Resize handles
  const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
  handles.forEach((pos) => {
    const handle = document.createElement("div");
    handle.className = `resize-handle handle-${pos}`;
    selectionBox.appendChild(handle);
  });

  // Rotate handle
  const rotateHandle = document.createElement("div");
  rotateHandle.className = "rotate-handle";
  selectionBox.appendChild(rotateHandle);

  element.appendChild(selectionBox);

  return element;
}

textTool.addEventListener("click", (e) => {
  const textEl = createTextElement({
    text: "welcome to dezineX",
    x: 60,
    y: 160,
  });

  artBoard.appendChild(textEl);

  //   console.log(editorState.elements);
  //   console.log(editorState.zIndexCounter);

  toolsBtn.forEach((btn) => btn.classList.remove("active"));
  e.currentTarget.classList.add("active");

  //adding elements to layers
  layersDiv.innerHTML = "";
  container = "";
  editorState.elements.forEach((elem, i) => {
    container += `
    <div id=${elem.id} class="layer-item">
      ${
        elem.type === "rect"
          ? '<i class="ri-shape-fill layer-icon"></i>'
          : '<i class="ri-text layer-icon"></i>'
      }
      <span class="layer-name">${elem.type}-${i}</span>
      <i class="ri-eye-line layer-icon" style="font-size: 12px; margin-left: auto;"></i>
    </div>
  `;
    layersDiv.innerHTML = container;
  });
});

function layersClickSelection() {
  layersDiv.addEventListener("click", (e) => {
    const clickedItem = e.target.closest(".layer-item");
    const id = clickedItem.id;
    if (!id) return;

    // reset selection
    editorState.elements.forEach((el) => {
      el.isSelected = false;
    });

    // find and select
    const selected = editorState.elements.find((el) => el.id === id);

    if (selected) {
      selected.isSelected = true;
    }
    // Remove selection from all layers
    layersDiv
      .querySelectorAll(".layer-item.selected")
      .forEach((item) => item.classList.remove("selected"));

    // Remove selection from all rects
    artBoard
      .querySelectorAll(".selection-box.active")
      .forEach((sb) => sb.classList.remove("active"));

    // Select clicked layer
    clickedItem.classList.add("selected");

    // Select matching rect
    const rect = artBoard.querySelector(
      `.element.rect[id="${clickedItem.id}"]`,
    );
    const text = artBoard.querySelector(
      `.element.text[id="${clickedItem.id}"]`,
    );

    rect?.querySelector(".selection-box")?.classList.add("active");
    text?.querySelector(".selection-box")?.classList.add("active");
  });
}

function boxAndTextSelection() {
  artBoard.addEventListener("click", (e) => {
    const layersItems = document.querySelectorAll(".layer-item");
    const element = e.target.closest(".element");

    // 1. Hide all selection boxes first
    document.querySelectorAll(".selection-box").forEach((sb) => {
      sb.classList.remove("active");
      sb.style.display = "none";
    });

    // 2. Reset all elements' selection state
    editorState.elements.forEach((el) => {
      el.isSelected = false;
    });

    // 3. Remove 'selected' class from all layers
    layersItems.forEach((layer) => {
      layer.classList.remove("selected");
    });

    // 4. If clicked on empty artboard (no element found)
    if (!element) {
      editorState.selectedId = null;
      console.log("Deselected - clicked on empty artboard");
      return;
    }

    // 5. Element was clicked - select it
    const id = element.dataset.id || element.id;

    if (!id) {
      console.warn("Element has no ID:", element);
      return;
    }

    // Show selection box for this element
    const selectionBox = element.querySelector(".selection-box");
    if (selectionBox) {
      selectionBox.style.display = "block";
      selectionBox.classList.add("active");
    }

    // Update editorState
    editorState.selectedId = id;

    const selectedElement = editorState.elements.find((el) => el.id === id);
    if (selectedElement) {
      selectedElement.isSelected = true;
    }

    // Update layers panel UI
    layersItems.forEach((layer) => {
      // Check both dataset.elementId and id attribute
      const layerId = layer.dataset.elementId || layer.id;
      if (layerId === id) {
        layer.classList.add("selected");
      }
    });

    console.log("Selected element ID:", editorState.selectedId);
    console.log("Selected element data:", selectedElement);
  });
}

function moveElements() {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let selectedElement = null;

  artBoard.addEventListener("mousedown", (e) => {
    // IMPORTANT: Don't start dragging if clicking on handles
    if (e.target.classList.contains("resize-handle")) return;
    if (e.target.classList.contains("rotate-handle")) return;

    // Find the element - check if we clicked directly on it or inside it
    let element = null;
    if (e.target.classList.contains("element")) {
      element = e.target;
    } else {
      element = e.target.closest(".element");
    }

    if (!element) return;

    console.log("Clicked on element:", element);

    const id = element.id || element.dataset.id;
    const stateElem = editorState.elements.find((el) => el.id === id);

    console.log("Element ID:", id, "State Element:", stateElem);

    if (!stateElem) return;
    if (!stateElem.isSelected) {
      console.log("Element not selected, cannot drag");
      return;
    }

    isDragging = true;
    selectedElement = element;

    const elemRect = element.getBoundingClientRect();

    // cursor offset INSIDE the element
    offsetX = e.clientX - elemRect.left;
    offsetY = e.clientY - elemRect.top;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging || !selectedElement) return;

    const artRect = artBoard.getBoundingClientRect();
    const elemRect = selectedElement.getBoundingClientRect();

    let x = e.clientX - artRect.left - offsetX;
    let y = e.clientY - artRect.top - offsetY;

    // Clamp inside artboard
    x = Math.max(0, Math.min(x, artRect.width - elemRect.width));
    y = Math.max(0, Math.min(y, artRect.height - elemRect.height));

    selectedElement.style.left = x + "px";
    selectedElement.style.top = y + "px";

    // Sync editorState
    const stateElem = editorState.elements.find(
      (el) => el.id === selectedElement.id,
    );

    if (stateElem) {
      stateElem.x = x;
      stateElem.y = y;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    selectedElement = null;
  });
}
function resize() {
  // ===== SIMPLE RESIZE LOGIC =====

  // Variables to track resize
  let isResizing = false;
  let currentElement = null;
  let currentHandle = null;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  let startLeft = 0;
  let startTop = 0;

  // ===== STEP 1: When user clicks on a resize handle =====
  artBoard.addEventListener("mousedown", function (e) {
    // Check if clicked on a resize handle
    const handle = e.target;
    if (!handle.classList.contains("resize-handle")) return;

    // IMPORTANT: Stop the event from bubbling up to prevent dragging
    e.stopPropagation();
    e.preventDefault();

    // Find which element this handle belongs to
    currentElement = handle.closest(".element");
    if (!currentElement) return;

    // Remember which handle was clicked (nw, n, ne, e, se, s, sw, w)
    if (handle.classList.contains("handle-nw")) currentHandle = "nw";
    else if (handle.classList.contains("handle-n")) currentHandle = "n";
    else if (handle.classList.contains("handle-ne")) currentHandle = "ne";
    else if (handle.classList.contains("handle-e")) currentHandle = "e";
    else if (handle.classList.contains("handle-se")) currentHandle = "se";
    else if (handle.classList.contains("handle-s")) currentHandle = "s";
    else if (handle.classList.contains("handle-sw")) currentHandle = "sw";
    else if (handle.classList.contains("handle-w")) currentHandle = "w";

    // Save starting mouse position
    startX = e.clientX;
    startY = e.clientY;

    // Save starting element size and position
    startWidth = currentElement.offsetWidth;
    startHeight = currentElement.offsetHeight;
    startLeft = currentElement.offsetLeft;
    startTop = currentElement.offsetTop;

    // Start resizing
    isResizing = true;

    console.log("Started resizing:", currentHandle);
  });

  // ===== STEP 2: When user moves mouse while resizing =====
  document.addEventListener("mousemove", function (e) {
    if (!isResizing) return; // Only run if we're resizing

    // Calculate how far the mouse moved
    let deltaX = e.clientX - startX;
    let deltaY = e.clientY - startY;

    // New values (we'll change these based on handle)
    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;

    // Different logic for each handle
    if (currentHandle === "se") {
      // Bottom-right corner: increase width and height
      newWidth = startWidth + deltaX;
      newHeight = startHeight + deltaY;
    } else if (currentHandle === "e") {
      // Right side: only increase width
      newWidth = startWidth + deltaX;
    } else if (currentHandle === "s") {
      // Bottom side: only increase height
      newHeight = startHeight + deltaY;
    } else if (currentHandle === "nw") {
      // Top-left corner: change width, height AND move position
      newWidth = startWidth - deltaX;
      newHeight = startHeight - deltaY;
      newLeft = startLeft + deltaX;
      newTop = startTop + deltaY;
    } else if (currentHandle === "n") {
      // Top side: change height and move up/down
      newHeight = startHeight - deltaY;
      newTop = startTop + deltaY;
    } else if (currentHandle === "ne") {
      // Top-right corner
      newWidth = startWidth + deltaX;
      newHeight = startHeight - deltaY;
      newTop = startTop + deltaY;
    } else if (currentHandle === "sw") {
      // Bottom-left corner
      newWidth = startWidth - deltaX;
      newHeight = startHeight + deltaY;
      newLeft = startLeft + deltaX;
    } else if (currentHandle === "w") {
      // Left side: change width and move left/right
      newWidth = startWidth - deltaX;
      newLeft = startLeft + deltaX;
    }

    // Don't let it get too small
    if (newWidth < 30) newWidth = 30;
    if (newHeight < 30) newHeight = 30;

    // Don't let it go outside artboard boundaries
    const artboardRect = artBoard.getBoundingClientRect();
    const artboardWidth = artboardRect.width;
    const artboardHeight = artboardRect.height;

    // Check right boundary
    if (newLeft + newWidth > artboardWidth) {
      newWidth = artboardWidth - newLeft;
    }

    // Check bottom boundary
    if (newTop + newHeight > artboardHeight) {
      newHeight = artboardHeight - newTop;
    }

    // Check left boundary (when resizing from left side)
    if (newLeft < 0) {
      newWidth = newWidth + newLeft; // Reduce width by overflow amount
      newLeft = 0;
    }

    // Check top boundary (when resizing from top)
    if (newTop < 0) {
      newHeight = newHeight + newTop; // Reduce height by overflow amount
      newTop = 0;
    }

    // Apply the new size and position
    currentElement.style.width = newWidth + "px";
    currentElement.style.height = newHeight + "px";
    currentElement.style.left = newLeft + "px";
    currentElement.style.top = newTop + "px";

    // If it's a text element, adjust font size
    if (currentElement.classList.contains("text")) {
      // Calculate font size based on height (you can adjust this formula)
      const fontSize = Math.max(12, Math.min(newHeight * 0.6, 200)); // Min 12px, max 200px
      currentElement.style.fontSize = fontSize + "px";

      // Update in editorState
      const elementId = currentElement.id || currentElement.dataset.id;
      const elementData = editorState.elements.find(
        (el) => el.id === elementId,
      );

      if (elementData && elementData.styles) {
        elementData.styles.fontSize = fontSize;
      }
    }

    // Update editorState
    const elementId = currentElement.id || currentElement.dataset.id;
    const elementData = editorState.elements.find((el) => el.id === elementId);

    if (elementData) {
      elementData.width = newWidth;
      elementData.height = newHeight;
      elementData.x = newLeft;
      elementData.y = newTop;
    }
  });

  // ===== STEP 3: When user releases mouse button =====
  document.addEventListener("mouseup", function () {
    if (!isResizing) return;

    // Stop resizing
    isResizing = false;
    currentElement = null;
    currentHandle = null;

    console.log("Stopped resizing");
    console.log("Updated elements:", editorState.elements);
  });

  console.log("✅ Simple resize ready!");
}
function rotate() {
  // ===== SIMPLE ROTATION LOGIC =====

  // Variables to track rotation
  let isRotating = false;
  let rotatingElement = null;
  let startAngle = 0;
  let currentRotation = 0;

  // ===== STEP 1: When user clicks on rotate handle =====
  artBoard.addEventListener("mousedown", function (e) {
    // Check if clicked on rotate handle
    const handle = e.target;
    if (!handle.classList.contains("rotate-handle")) return;

    // Stop event from triggering drag
    e.stopPropagation();
    e.preventDefault();

    // Find which element this handle belongs to
    rotatingElement = handle.closest(".element");
    if (!rotatingElement) return;

    // Get element's center point
    const rect = rotatingElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate angle from center to mouse
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    startAngle = Math.atan2(mouseY - centerY, mouseX - centerX);

    // Get current rotation from editorState
    const elementId = rotatingElement.id || rotatingElement.dataset.id;
    const elementData = editorState.elements.find((el) => el.id === elementId);

    if (elementData && elementData.styles) {
      currentRotation = elementData.styles.rotation || 0;
    } else {
      currentRotation = 0;
    }

    // Start rotating
    isRotating = true;

    console.log("Started rotating");
  });

  // ===== STEP 2: When user moves mouse while rotating =====
  document.addEventListener("mousemove", function (e) {
    if (!isRotating || !rotatingElement) return;

    // Get element's center point
    const rect = rotatingElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate current angle from center to mouse
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const currentAngle = Math.atan2(mouseY - centerY, mouseX - centerX);

    // Calculate rotation difference
    const angleDiff = currentAngle - startAngle;

    // Convert from radians to degrees
    const rotationDegrees = (angleDiff * 180) / Math.PI;

    // Add to previous rotation
    const newRotation = currentRotation + rotationDegrees;

    // Apply rotation
    rotatingElement.style.transform = `rotate(${newRotation}deg)`;

    // Update editorState
    const elementId = rotatingElement.id || rotatingElement.dataset.id;
    const elementData = editorState.elements.find((el) => el.id === elementId);

    if (elementData) {
      if (!elementData.styles) {
        elementData.styles = {};
      }
      elementData.styles.rotation = newRotation;
    }

    console.log("Rotating:", Math.round(newRotation) + "°");
  });

  // ===== STEP 3: When user releases mouse button =====
  document.addEventListener("mouseup", function () {
    if (!isRotating) return;

    // Stop rotating
    isRotating = false;

    // Save final rotation
    if (rotatingElement) {
      const elementId = rotatingElement.id || rotatingElement.dataset.id;
      const elementData = editorState.elements.find(
        (el) => el.id === elementId,
      );

      if (elementData && elementData.styles) {
        console.log(
          "Final rotation:",
          Math.round(elementData.styles.rotation) + "°",
        );
      }
    }

    rotatingElement = null;

    console.log("Stopped rotating");
  });

  console.log(" Rotation functionality ready!");
}

// ===== TEXT EDITING ON DOUBLE CLICK =====

let isEditingText = false;
function enableTextEditing() {
  artBoard.addEventListener("dblclick", (e) => {
    const textElement = e.target.closest(".text");
    if (!textElement || isEditingText) return;

    const pTag = textElement.querySelector("p");
    const selectionBox = textElement.querySelector(".selection-box");
    if (!pTag || !selectionBox) return;

    // hide
    pTag.style.display = "none";
    selectionBox.style.display = "none";

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

      // 1️⃣ Update DOM
      pTag.textContent = newText;
      pTag.style.display = "block";

      input.remove();

      // 2️⃣ Update editorState (THIS WAS MISSING)
      const elementId = textElement.dataset.id || textElement.id;
      const elementData = editorState.elements.find(
        (el) => el.id === elementId,
      );

      if (elementData) {
        elementData.content = newText;
      }

      // 3️⃣ Restore selection visuals
      selectionBox.style.display = "block";
      if (elementData?.isSelected) {
        selectionBox.classList.add("active");
      }

      isEditingText = false;

      console.log("Text updated in editorState:", elementData);
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

// Initialize text editing
enableTextEditing();

rotate();
resize();
moveElements();

boxAndTextSelection();
layersClickSelection();
