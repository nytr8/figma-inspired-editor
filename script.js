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
  element.style.padding = "5px 10px";

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
    const element = e.target.closest(".rect, .text");
    if (!element) return;

    const idx = element.id;
    // Update editorState
    editorState.elements.forEach((el) => {
      el.isSelected = el.id === idx;
    });

    editorState.selectedId = idx;
    console.log("selectedId:", editorState.selectedId);

    // Sync layers UI
    layersItems.forEach((layer) => {
      layer.classList.toggle("selected", layer.id === editorState.selectedId);
    });
    console.log(layersItems);
    // 1. Hide all selection boxes
    document
      .querySelectorAll(".selection-box.active")
      .forEach((sb) => sb.classList.remove("active"));

    // 2. Reset selection state
    editorState.elements.forEach((el) => {
      el.isSelected = false;
    });

    // 3. If clicked on empty artboard
    if (!element) {
      editorState.selectedId = null;
      return;
    }

    // 4. Show selection box
    element.querySelector(".selection-box")?.classList.add("active");

    // 5. Update editorState
    const id = element.id;
    console.log(id);
    editorState.selectedId = id;

    const selectedElement = editorState.elements.find((el) => el.id === id);

    if (selectedElement) {
      selectedElement.isSelected = true;
    }
    console.log(editorState.elements);
  });
}

function moveElements() {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let selectedElement = null;

  artBoard.addEventListener("mousedown", (e) => {
    const element = e.target.closest(".rect, .text");
    if (!element) return;

    const id = element.id;
    const stateElem = editorState.elements.find((el) => el.id === id);

    if (!stateElem || !stateElem.isSelected) return;

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

moveElements();
boxAndTextSelection();
layersClickSelection();
