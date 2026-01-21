const editorState = {
  elements: [], // all rectangles & text
  selectedId: null, // currently selected element
};

// {
//   id: "el-1",
//   type: "rect" | "text",
//   x: 120,
//   y: 80,
//   width: 200,
//   height: 120,
//   rotation: 0,
//   styles: {
//     background: "#4f8cff",
//     color: "#fff",
//   },
//   text: "Hello",
// },

let rectTool = document.querySelector(".canvas-container .tools-dock");