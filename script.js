// This is your playground!
// Add functionality to your html controls, play with cytoscape's events and make those magic lenses!

/* global fetch, cytoscape */
import _style from "/style.js";

// returns true if the point "p" is inside the circle defined by "c" (center) and "r" (radius)
function isInCircle(c, r, p) {
  return Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2) <= Math.pow(r, 2);
}
const rangeSelector = document.getElementById("rangeSelector");
const lens = document.getElementById("lens");
let radius = 40;
let radiusMultiplier = 0;
let changeNodeShape = false;
let highlightEdge = false;
let lenseBehavoirSelect = document.getElementById("lenseBehavoirSelect");

lenseBehavoirSelect.addEventListener("change", (e) => {
  let selectedValue = Number(e.target.value);
  if (selectedValue === 1) {
    changeNodeShape = true;
    highlightEdge = false;
  } else if (selectedValue === 2) {
    changeNodeShape = false;
    highlightEdge = true;
  }
});
if (rangeSelector) {
  rangeSelector.addEventListener("change", (e) => {
    radiusMultiplier = e.target.value;
    radius = 40 + 40 * radiusMultiplier;
    lens.setAttribute("r", radius);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "+") {
    radiusMultiplier += 0.2;
    radius = 40 + 40 * radiusMultiplier;
    lens.setAttribute("r", radius);
  } else if (event.key === "-") {
    radiusMultiplier -= 0.2;
    radius = 40 + 40 * radiusMultiplier;
    if (radius >= 40) {
      lens.setAttribute("r", radius);
    }
  }
});
fetch("data/data.json")
  .then((res) => res.json())
  .then((data) => {
    const cy = cytoscape({
      container: document.getElementById("cy"),
      style: _style,
      elements: data,
      layout: {
        name: "cola",
        nodeSpacing: 5,
        edgeLength: 200,
        animate: true,
        randomize: false,
        maxSimulationTime: 1500,
      },
    });

    cy.on("mousemove", function (e) {
      /* 

      Your code goes here! 

      HINTs: 
        1. use the "isInCircle" function defined above to calculate whether a node is inside the lens! 
        2. if you experience performance issues, use cy.startBatch() and cy.endBatch() to avoid unnecessary canvas redraws. See https://js.cytoscape.org/#cy.batch for more
        3. see below how to get the mouse and node positions
      */

      const mouse = { x: e.originalEvent.x, y: e.originalEvent.y };
      // console.log(`Mouse position: [x: ${mouse.x}, y: ${mouse.y}]`);
      if (lens) {
        lens.setAttribute("cx", mouse.x);
        lens.setAttribute("cy", mouse.y);
      }
      cy.nodes().forEach((n) => {
        cy.startBatch();
        const node = n.renderedPosition(); // Careful: other position functions may invoke different coordinate systems
        let getNode = cy.$(`#${n.id()}`);
        if (isInCircle(mouse, radius, node)) {
          if (!!getNode) {
            if (changeNodeShape) {
              getNode.addClass("magic");
            }
            if (highlightEdge) {
              let edges = getNode.connectedEdges();
              edges.forEach((e) => {
                let edge = cy.$(`#${e.id()}`);
                if (!!edge) {
                  edge.addClass("magic");
                }
              });
            }
          }
        } else {
          if (changeNodeShape) {
            getNode.removeClass("magic");
          }
          if (highlightEdge) {
            let edges = getNode.connectedEdges();
            edges.forEach((e) => {
              let edge = cy.$(`#${e.id()}`);
              if (!!edge) {
                edge.removeClass("magic");
              }
            });
          }
        }
        cy.endBatch();
        // console.log(`Node position: [x: ${node.x}, y: ${node.y}]`);
      });
    });
  });
