// ==========================================
// ATELIER CAD
// CATALOGUE + RHINO 3DM ENGINE
// ==========================================


// ==========================================
// RHINO 3DM INITIALIZATION
// ==========================================

let rhino = null;

async function initializeRhino() {
  try {
    rhino = await rhino3dm();

    console.log("Rhino3dm ready");
  } catch (error) {
    console.error("Rhino3dm failed to load:", error);
  }
}

initializeRhino();


// ==========================================
// BASIC UI
// ==========================================

const toast = document.getElementById("toast");

function message(text) {
  if (!toast) return;

  toast.textContent = text;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}


// ==========================================
// CATEGORY CONFIGURATION
// ==========================================

const categoryConfig = {
  neckwear: {
    types: [
      "Pendant",
      "Charm",
      "Locket",
      "Necklace"
    ],

    labels: [
      "Height",
      "Width",
      "Depth"
    ],

    values: [
      "22.4",
      "13.8",
      "4.6"
    ],

    code: "PEN"
  },


  rings: {
    types: [
      "Engagement ring",
      "Band ring",
      "Signet ring",
      "Cocktail ring"
    ],

    labels: [
      "Ring size",
      "Head width",
      "Shank width"
    ],

    values: [
      "7",
      "8.2",
      "2.1"
    ],

    code: "RNG"
  },


  earrings: {
    types: [
      "Stud earring",
      "Hoop earring",
      "Drop earring",
      "Ear cuff"
    ],

    labels: [
      "Drop length",
      "Width",
      "Depth"
    ],

    values: [
      "14.0",
      "7.5",
      "3.8"
    ],

    code: "EAR"
  },


  wristwear: {
    types: [
      "Chain bracelet",
      "Bangle",
      "Cuff bracelet",
      "Tennis bracelet"
    ],

    labels: [
      "Inner length",
      "Width",
      "Depth"
    ],

    values: [
      "180",
      "4.2",
      "2.9"
    ],

    code: "BRC"
  }
};


// ==========================================
// PAGE ELEMENTS
// ==========================================

const category = document.getElementById("category");

const productType = document.getElementById("productType");

const dimensionFields =
  document.getElementById("dimensionFields");

const dimensionHeading =
  document.getElementById("dimensionHeading");

const skuInput =
  document.getElementById("sku");

const cadInput =
  document.getElementById("cadFile");

const cadAnalysis =
  document.getElementById("cadAnalysis");

const cadViewer =
  document.getElementById("cadViewer");

const displayedFileName =
  document.getElementById("fileName");

const displayedFileInfo =
  document.getElementById("fileInfo");


// ==========================================
// UPDATE CATALOGUE PREVIEW
// ==========================================

function updateSheet() {

  const type =
    productType.value || "Pendant";

  const sku =
    skuInput.value || "DRAFT";


  const values =
    [...dimensionFields.querySelectorAll("input")]
      .map(input => input.value);


  const labels =
    [...dimensionFields.querySelectorAll("label")]
      .map(label => {
        return label.childNodes[0].textContent.trim();
      });


  document.getElementById("sheetSku").textContent =
    sku;


  document.getElementById("sheetProductTitle").textContent =
    `${type} / ${sku}`;


  document.getElementById("sheetDimensions").textContent =
    labels
      .map((label, index) => {
        return `${label.toUpperCase()}: ${values[index]} MM`;
      })
      .join("  ·  ");
}


// ==========================================
// CATEGORY SWITCHING
// ==========================================

function setCategory() {

  const config =
    categoryConfig[category.value];


  productType.innerHTML =
    config.types
      .map(type => {
        return `<option>${type}</option>`;
      })
      .join("");


  dimensionHeading.textContent =
    `${productType.value} dimensions`;


  dimensionFields.innerHTML =
    config.labels
      .map((label, index) => {
        return `
          <label>
            ${label}
            <input value="${config.values[index]}" />
          </label>
        `;
      })
      .join("");


  const sku = skuInput;


  if (
    /^(PEN|RNG|EAR|BRC)-\d+$/i.test(sku.value)
  ) {
    sku.value =
      `${config.code}-214`;
  }


  addDimensionListeners();

  updateSheet();
}


// ==========================================
// DIMENSION INPUT LISTENERS
// ==========================================

function addDimensionListeners() {

  const inputs =
    dimensionFields.querySelectorAll("input");


  inputs.forEach(input => {

    input.addEventListener(
      "input",
      updateSheet
    );

  });
}


// ==========================================
// CATEGORY EVENTS
// ==========================================

category.addEventListener(
  "change",
  () => {

    setCategory();

    message(
      `${category.options[category.selectedIndex].text} selected — product types and dimensions updated.`
    );

  }
);


productType.addEventListener(
  "change",
  () => {

    dimensionHeading.textContent =
      `${productType.value} dimensions`;

    updateSheet();

  }
);


skuInput.addEventListener(
  "input",
  updateSheet
);


// Initialize category
setCategory();


// ==========================================
// CAD FILE UPLOAD
// ==========================================

cadInput.addEventListener(
  "change",
  async event => {

    const file =
      event.target.files[0];


    if (!file) {
      return;
    }


    // Update visible filename

    if (displayedFileName) {
      displayedFileName.textContent =
        file.name;
    }


    if (displayedFileInfo) {

      displayedFileInfo.textContent =
        `${(file.size / 1024 / 1024).toFixed(2)} MB · source uploaded`;

    }


    message(
      "Source geometry added. Checking CAD file..."
    );


    const lowerName =
      file.name.toLowerCase();


    // ======================================
    // 3DM
    // ======================================

    if (lowerName.endsWith(".3dm")) {

      await inspect3dm(file);

      return;
    }


    // ======================================
    // OTHER FILE TYPES
    // ======================================

    if (cadAnalysis) {

      cadAnalysis.innerHTML = `
        <strong>✓ File uploaded</strong>

        <p>
          ${escapeHTML(file.name)}
        </p>

        <p>
          CAD inspection for this format will
          be added in the next processing stage.
        </p>
      `;

    }

  }
);


// ==========================================
// READ RHINO .3DM FILE
// ==========================================

async function inspect3dm(file) {

  if (!cadAnalysis) {
    console.error(
      "cadAnalysis element was not found."
    );

    return;
  }


  // Rhino might still be loading

  if (!rhino) {

    cadAnalysis.innerHTML = `
      <strong>CAD engine is loading...</strong>

      <p>
        Please wait a moment and upload the
        file again.
      </p>
    `;

    message(
      "Rhino CAD engine is still loading."
    );

    return;
  }


  try {

    cadAnalysis.innerHTML = `
      <strong>Reading CAD geometry...</strong>

      <p>
        ${escapeHTML(file.name)}
      </p>
    `;


    // Read file into browser memory

    const buffer =
      await file.arrayBuffer();


    const bytes =
      new Uint8Array(buffer);


    // Read Rhino model

    const model =
      rhino.File3dm.fromByteArray(bytes);


    if (!model) {

      throw new Error(
        "The 3DM model could not be read."
      );

    }


    // ======================================
    // MODEL TABLES
    // ======================================

    const objects =
      model.objects();

    const layers =
      model.layers();


    const objectCount =
      objects.count;

    const layerCount =
      layers.count;


    // ======================================
    // READ LAYER NAMES
    // ======================================

    const layerNames = [];


    for (
      let i = 0;
      i < layerCount;
      i++
    ) {

      try {

        const layer =
          layers.get(i);


        if (layer && layer.name) {

          layerNames.push(
            layer.name
          );

        }

      } catch (error) {

        console.warn(
          `Could not read layer ${i}`,
          error
        );

      }

    }


    // ======================================
    // READ OBJECT INFORMATION
    // ======================================

    const objectTypes = {};

    const objectDetails = [];


    for (
      let i = 0;
      i < objectCount;
      i++
    ) {

      try {

        const object =
          objects.get(i);


        if (!object) {
          continue;
        }


        const geometry =
          object.geometry();


        const attributes =
          object.attributes();


        let geometryType =
          "Unknown";


        if (
          geometry &&
          geometry.constructor &&
          geometry.constructor.name
        ) {

          geometryType =
            geometry.constructor.name;

        }


        if (!objectTypes[geometryType]) {
          objectTypes[geometryType] = 0;
        }


        objectTypes[geometryType]++;


        objectDetails.push({

          index: i,

          name:
            attributes &&
            attributes.name
              ? attributes.name
              : `Object ${i + 1}`,

          layerIndex:
            attributes
              ? attributes.layerIndex
              : null,

          geometryType:
            geometryType

        });


      } catch (error) {

        console.warn(
          `Could not inspect object ${i}`,
          error
        );

      }

    }


    // ======================================
    // BUILD LAYER HTML
    // ======================================

    let layersHTML =
      "<em>No named layers found.</em>";


    if (layerNames.length > 0) {

      layersHTML =
        layerNames
          .map(name => {
            return `
              <span class="cad-layer">
                ${escapeHTML(name)}
              </span>
            `;
          })
          .join("");

    }


    // ======================================
    // BUILD GEOMETRY TYPE HTML
    // ======================================

    let geometryHTML =
      "<em>No geometry information found.</em>";


    const geometryEntries =
      Object.entries(objectTypes);


    if (geometryEntries.length > 0) {

      geometryHTML =
        geometryEntries
          .map(([type, count]) => {
            return `
              <div>
                ${escapeHTML(type)}:
                <strong>${count}</strong>
              </div>
            `;
          })
          .join("");

    }


    // ======================================
    // DISPLAY CAD INFORMATION
    // ======================================

    cadAnalysis.innerHTML = `

      <div class="cad-success">

        <strong>
          ✓ CAD successfully loaded
        </strong>

      </div>


      <div class="cad-info-grid">

        <div>
          <span>FILE</span>
          <strong>
            ${escapeHTML(file.name)}
          </strong>
        </div>


        <div>
          <span>OBJECTS</span>
          <strong>
            ${objectCount}
          </strong>
        </div>


        <div>
          <span>LAYERS</span>
          <strong>
            ${layerCount}
          </strong>
        </div>


        <div>
          <span>SIZE</span>
          <strong>
            ${(file.size / 1024 / 1024).toFixed(2)} MB
          </strong>
        </div>

      </div>


      <div class="cad-analysis-section">

        <strong>
          Layers
        </strong>

        <div class="cad-layer-list">
          ${layersHTML}
        </div>

      </div>


      <div class="cad-analysis-section">

        <strong>
          Geometry
        </strong>

        <div class="cad-geometry-list">
          ${geometryHTML}
        </div>

      </div>

    `;


    // ======================================
    // CONSOLE DEBUG INFORMATION
    // ======================================

    console.log(
      "======================================"
    );

    console.log(
      "3DM CAD MODEL LOADED"
    );

    console.log(
      "File:",
      file.name
    );

    console.log(
      "Objects:",
      objectCount
    );

    console.log(
      "Layers:",
      layerCount
    );

    console.log(
      "Layer names:",
      layerNames
    );

    console.log(
      "Geometry types:",
      objectTypes
    );

    console.log(
      "Object details:",
      objectDetails
    );

    console.log(
      "Rhino model:",
      model
    );

    console.log(
      "======================================"
    );


    message(
      `3DM loaded successfully — ${objectCount} objects detected.`
    );


    // Save for future 3D viewer
    window.currentRhinoModel =
      model;

    window.currentRhinoObjects =
      objectDetails;

  }


  catch (error) {

    console.error(
      "3DM read error:",
      error
    );


    cadAnalysis.innerHTML = `

      <div class="cad-error">

        <strong>
          Unable to read CAD file
        </strong>

        <p>
          ${escapeHTML(
            error.message ||
            "Unknown 3DM error."
          )}
        </p>

      </div>

    `;


    message(
      "The 3DM file could not be read."
    );

  }
}


// ==========================================
// SAFE HTML OUTPUT
// ==========================================

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ==========================================
// EXPORT FILE NAME
// ==========================================

function catalogueFileName(extension) {

  const safeSKU =
    skuInput.value
      .trim()
      .replace(
        /[^a-z0-9_-]/gi,
        "-"
      );


  return `${
    safeSKU || "catalogue-sheet"
  }-catalogue.${extension}`;
}


// ==========================================
// CAPTURE CATALOGUE SHEET
// ==========================================

async function captureSheet() {

  if (!window.html2canvas) {

    throw new Error(
      "The export library did not load. Check your internet connection and refresh the page."
    );

  }


  return window.html2canvas(
    document.getElementById(
      "catalogueSheet"
    ),
    {

      backgroundColor:
        "#ffffff",

      scale:
        4,

      useCORS:
        true,

      logging:
        false

    }
  );
}


// ==========================================
// EXPORT PNG / PDF
// ==========================================

async function exportSheet(format) {

  const button =
    format === "png"
      ? document.getElementById(
          "generateBtn"
        )
      : document.getElementById(
          "exportBtn"
        );


  const original =
    button.innerHTML;


  button.disabled =
    true;


  button.innerHTML =
    "<span>◌</span> Preparing download…";


  try {

    const canvas =
      await captureSheet();


    const image =
      canvas.toDataURL(
        "image/png"
      );


    // ======================================
    // PNG
    // ======================================

    if (format === "png") {

      const link =
        document.createElement("a");


      link.href =
        image;


      link.download =
        catalogueFileName("png");


      link.click();


      message(
        "Catalogue PNG downloaded."
      );

    }


    // ======================================
    // PDF
    // ======================================

    else {

      if (!window.jspdf) {

        throw new Error(
          "The PDF library did not load. Check your internet connection and refresh the page."
        );

      }


      const {
        jsPDF
      } =
        window.jspdf;


      const pdf =
        new jsPDF({

          orientation:
            "portrait",

          unit:
            "px",

          format: [
            canvas.width,
            canvas.height
          ],

          hotfixes: [
            "px_scaling"
          ]

        });


      pdf.addImage(
        image,
        "PNG",
        0,
        0,
        canvas.width,
        canvas.height
      );


      pdf.save(
        catalogueFileName("pdf")
      );


      message(
        "Print-ready catalogue PDF downloaded."
      );

    }

  }


  catch (error) {

    console.error(
      "Export error:",
      error
    );


    message(
      error.message ||
      "The export could not be created."
    );

  }


  finally {

    button.disabled =
      false;


    button.innerHTML =
      original;

  }
}


// ==========================================
// EXPORT BUTTONS
// ==========================================

document
  .getElementById("generateBtn")
  .addEventListener(
    "click",
    () => exportSheet("png")
  );


document
  .getElementById("exportBtn")
  .addEventListener(
    "click",
    () => exportSheet("pdf")
  );


// ==========================================
// READY
// ==========================================

console.log(
  "Atelier CAD application loaded."
);
