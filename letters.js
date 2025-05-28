// Fonction pour extraire les points d'un chemin SVG
function extractPointsFromSVG(svgPath) {
  const path = svgPath.getAttribute("d");
  const points = [];
  const commands = path.split(/(?=[MLHVCSQTAZmlhvcsqtaz])/);

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

// Fonction pour charger et traiter les SVG
async function processSVGLetters() {
  const letters = {};
  const svgFiles = await fetch("/public/letters_01/*.svg");

  for (const file of svgFiles) {
    const response = await fetch(file);
    const svgText = await response.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    const path = svgDoc.querySelector("path");

    if (path) {
      const letterName = file.split("/").pop().replace(".svg", "");
      const points = extractPointsFromSVG(path);
      const normalizedPoints = normalizeToSixPoints(points);
      letters[letterName] = normalizedPoints;
    }
  }

  return letters;
}

// Exporter les lettres
export const alphabetPoints = await processSVGLetters();

