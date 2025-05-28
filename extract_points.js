const fs = require("fs");
const path = require("path");
const { DOMParser } = require("xmldom");

// Fonction pour extraire les points d'un chemin SVG
function extractPointsFromSVG(svgPath) {
  const points = [];
  const commands = svgPath.split(/(?=[MLHVCSQTAZmlhvcsqtaz])/);

  let currentX = 0;
  let currentY = 0;

  commands.forEach((cmd) => {
    const type = cmd[0];
    const values = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number);

    switch (type) {
      case "M": // Move to
        currentX = values[0];
        currentY = values[1];
        points.push([currentX, currentY]);
        break;
      case "L": // Line to
        currentX = values[0];
        currentY = values[1];
        points.push([currentX, currentY]);
        break;
      case "H": // Horizontal line
        currentX = values[0];
        points.push([currentX, currentY]);
        break;
      case "V": // Vertical line
        currentY = values[0];
        points.push([currentX, currentY]);
        break;
      case "C": // Cubic bezier
        currentX = values[4];
        currentY = values[5];
        points.push([currentX, currentY]);
        break;
      case "S": // Smooth cubic bezier
        currentX = values[2];
        currentY = values[3];
        points.push([currentX, currentY]);
        break;
      case "Q": // Quadratic bezier
        currentX = values[2];
        currentY = values[3];
        points.push([currentX, currentY]);
        break;
      case "T": // Smooth quadratic bezier
        currentX = values[0];
        currentY = values[1];
        points.push([currentX, currentY]);
        break;
      case "A": // Arc
        currentX = values[5];
        currentY = values[6];
        points.push([currentX, currentY]);
        break;
    }
  });

  return points;
}

// Fonction pour normaliser les points à 6 points
function normalizeToSixPoints(points) {
  if (points.length === 6) return points;

  if (points.length < 6) {
    // Si moins de 6 points, répéter le dernier point
    const lastPoint = points[points.length - 1];
    while (points.length < 6) {
      points.push(lastPoint);
    }
  } else {
    // Si plus de 6 points, sélectionner 6 points équidistants
    const step = (points.length - 1) / 5;
    const normalized = [];
    for (let i = 0; i < 6; i++) {
      const index = Math.round(i * step);
      normalized.push(points[index]);
    }
    points = normalized;
  }

  return points;
}

// Fonction pour traiter les fichiers SVG
function processSVGLetters() {
  const letters = {};
  const svgDir = path.join(__dirname, "public", "letters_01");

  // Lire tous les fichiers SVG du répertoire
  const files = fs.readdirSync(svgDir).filter((file) => file.endsWith(".svg"));

  files.forEach((file) => {
    const filePath = path.join(svgDir, file);
    const svgContent = fs.readFileSync(filePath, "utf8");
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const pathElement = svgDoc.getElementsByTagName("path")[0];

    if (pathElement) {
      const letterName = file.replace(".svg", "");
      const pathData = pathElement.getAttribute("d");
      const points = extractPointsFromSVG(pathData);
      const normalizedPoints = normalizeToSixPoints(points);
      letters[letterName] = normalizedPoints;
    }
  });

  return letters;
}

// Générer le fichier de points
const alphabetPoints = processSVGLetters();
const output = `export const alphabetPoints = ${JSON.stringify(
  alphabetPoints,
  null,
  2
)};`;
fs.writeFileSync("letters.js", output);

console.log("Points extraits avec succès !");
