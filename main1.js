let points = []; // Tableau pour stocker les points et leurs tentacules
let fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
let segmentsPerTentacle = 6; // Nombre de segments par tentacule
let growthSpeed = 1 / 100; // Vitesse de croissance plus progressive
let animationSpeed = 1 / 50000; // Vitesse d'animation réduite
let maxTentacles = 1000;
let oscillators = []; // Tableau pour stocker les oscillateurs
let sizeCircle = 100;
let sizeStroke = 70;
let startStrokeSize = 0; // Taille du stroke au début de chaque segment
let endStrokeSize = 0; // Taille du stroke à la fin de chaque segment
let minStroke = 15;
let maxStroke = 50;

// Variables pour le texte
let currentWord = [];
let letterSpacing = 200; // Espacement réduit pour avoir plus de lettres par ligne
let currentX;
let currentY;
let letterScale = 1.5; // Échelle réduite pour mieux s'adapter à l'écran
let currentLetterPoints = [];
let showTentacles = true;
let tentacleDelay = 500;
let lineProgress = 10;
let lineSpeed = 0.01;

// Variables globales pour les sons
let sounds = [];
let soundLoaded = false;

// Combinaisons de sons pour chaque lettre
const letterSoundCombos = {
  a: [0, 3, 6],
  b: [1, 4, 7],
  c: [2, 5, 8],
  d: [3, 6, 9],
  e: [4, 7, 0],
  f: [5, 8, 1],
  g: [6, 9, 2],
  h: [7, 0, 3],
  i: [8, 1, 4],
  j: [9, 2, 5],
  k: [0, 4, 8],
  l: [1, 5, 9],
  m: [2, 6, 0],
  n: [3, 7, 1],
  o: [4, 8, 2],
  p: [5, 9, 3],
  q: [6, 0, 4],
  r: [7, 1, 5],
  s: [8, 2, 6],
  t: [9, 3, 7],
  u: [0, 5, 9],
  v: [1, 6, 0],
  w: [2, 7, 1],
  x: [3, 8, 2],
  y: [4, 9, 3],
  z: [5, 0, 4],
};

// Points de l'alphabet
let alphabetPoints = {
  a: [
    [159.21, 73.62],
    [141.52, 77.38],
    [127.59, 89.43],
    [159.59, 106],
    [159.59, 50.65],
    [68.49, 51.03],
  ],
  b: [
    [80.15, 65.82],
    [97.8, 66.47],
    [115.87, 69.48],
    [132.06, 101.85],
    [81.23, 119.92],
    [81.23, 29.2],
  ],
  c: [
    [150.83, 115.41],
    [132.76, 117.29],
    [115.07, 117.67],
    [79.3, 109.01],
    [58.97, 58.18],
    [146.31, 35.22],
  ],
  d: [
    [153.41, 65.34],
    [134.59, 66.47],
    [117.27, 69.48],
    [101.46, 101.48],
    [152.66, 119.92],
    [152.28, 28.82],
  ],
  e: [
    [141.69, 103.36],
    [122.12, 104.87],
    [107.81, 94.7],
    [108.09, 59.63],
    [162.02, 72.49],
    [77.69, 107.12],
  ],
  f: [
    [114.91, 115.78],
    [114.91, 97.34],
    [114.91, 78.89],
    [152.18, 78.89],
    [105.5, 47.64],
    [198.11, 47.64],
  ],
  g: [
    [121.64, 84.54],
    [139.71, 84.54],
    [139.33, 102.98],
    [105.82, 116.54],
    [70.44, 75.88],
    [146.11, 27.31],
  ],
  h: [
    [110.67, 126.32],
    [110.67, 107.12],
    [110.67, 90.56],
    [78.67, 73.24],
    [63.61, 126.32],
    [63.61, 35.22],
  ],
  i: [
    [199.6, 121.71],
    [180.12, 121.71],
    [162.62, 121.71],
    [125.35, 121.71],
    [180.69, 122.07],
    [180.69, 31.85],
  ],
  j: [
    [102.09, 26.25],
    [120.73, 26.25],
    [139.08, 26.25],
    [139.08, 62.96],
    [139.08, 116.89],
    [52.4, 92.61],
  ],
  k: [
    [124.07, 125.64],
    [107.41, 117.74],
    [90.75, 109.27],
    [108.82, 78.21],
    [81.43, 125.92],
    [81.43, 35.29],
  ],
  l: [
    [161.76, 117.74],
    [144.06, 117.74],
    [125.62, 117.74],
    [162.06, 117.74],
    [107.43, 117.74],
    [107.43, 27.57],
  ],
  m: [
    [134.95, 77.83],
    [134.95, 59.2],
    [134.95, 40.37],
    [114.06, 69.55],
    [78.29, 27.38],
    [78.29, 118.3],
  ],
  n: [
    [149.77, 61.27],
    [149.77, 79.34],
    [149.77, 98.25],
    [126.05, 69.45],
    [90.76, 27.1],
    [90.76, 118.3],
  ],
  o: [
    [84.21, 118.58],
    [101.72, 112.09],
    [119.23, 105.31],
    [119.23, 69.74],
    [84.78, 27.1],
    [84.21, 118.58],
  ],
  p: [
    [68.35, 83.57],
    [85.86, 83.29],
    [103.93, 80.18],
    [119.74, 47.71],
    [68.63, 29.92],
    [68.63, 119.43],
  ],
  q: [
    [148.49, 83.57],
    [130.98, 83.29],
    [112.91, 80.18],
    [97.1, 47.71],
    [148.21, 29.92],
    [148.21, 119.43],
  ],
  r: [
    [121.43, 118.4],
    [109.75, 102.96],
    [95.45, 91.67],
    [125.57, 70.58],
    [90.55, 28.8],
    [91.31, 119.15],
  ],
  s: [
    [114.88, 19.29],
    [99.35, 27.48],
    [84.95, 39.62],
    [67.16, 69.83],
    [120.81, 69.83],
    [71.12, 145.78],
  ],
  t: [
    [124.05, 115.76],
    [124.05, 97.12],
    [124.05, 78.77],
    [124.05, 42.07],
    [160.48, 42.07],
    [70.41, 42.07],
  ],
  u: [
    [141.7, 51.67],
    [141.7, 70.11],
    [141.7, 88.18],
    [141.7, 123.57],
    [87.86, 123.57],
    [87.86, 34.16],
  ],
  v: [
    [181.31, 32.75],
    [167.83, 46.23],
    [154.91, 59.15],
    [129.48, 84.58],
    [90.8, 123.27],
    [90.8, 33.22],
  ],
  w: [
    [135.1, 61.49],
    [124.93, 76.11],
    [114.2, 91.02],
    [92.18, 61.49],
    [77.22, 115.38],
    [24.7, 40],
  ],
  x: [
    [90.25, 103.24],
    [104.65, 88.84],
    [117.07, 76.42],
    [142.91, 50.58],
    [142.91, 105.22],
    [89.4, 32.09],
  ],
  y: [
    [108.45, 31.43],
    [114.48, 48.75],
    [132.55, 50.25],
    [132.55, 16.37],
    [132.55, 69.45],
    [70.24, 131.76],
  ],
  z: [
    [73.77, 54.58],
    [92.97, 54.58],
    [111.04, 54.58],
    [146.62, 54.58],
    [109.34, 95.24],
    [200.26, 95.24],
  ],
};

let scrollOffset = 0;
let scrollSpeed = 2;
let isScrolling = false;
let cursorBlink = 0;
let cursorVisible = true;

function preload() {
  // Charger tous les sons
  for (let i = 0; i < 10; i++) {
    sounds[i] = loadSound(`soundNum/${i}.wav`);
  }
  soundLoaded = true;
}

class Tentacle {
  constructor(x, y, targetPoints, letter) {
    this.baseX = x;
    this.baseY = y;
    this.segments = [];
    this.growing = true;
    this.growthProgress = 0;
    this.time = random(100);
    this.lastPlayedSegment = -1;
    this.currentSegment = 0;
    this.targetPoints = targetPoints;
    this.morphing = false;
    this.morphProgress = 0;
    this.morphSpeed = 0.005; // Vitesse de morphing ralentie
    this.letter = letter;

    // Créer l'oscillateur pour cette tentacule
    this.osc = new p5.Oscillator("sine");
    this.env = new p5.Envelope();
    this.env.setADSR(0.001, 0.2, 0.1, 0.5);
    this.env.setRange(0.5, 0);
    this.osc.start();
    this.osc.amp(0);
    oscillators.push(this.osc);

    // Créer les points avec la séquence de Fibonacci
    let currentX = x;
    let currentY = y;
    let currentAngle = 0;
    let baseRadius = 30;

    // Créer 6 points avec des distances basées sur Fibonacci
    for (let i = 0; i < 6; i++) {
      let radius = baseRadius * fibonacci[i % fibonacci.length];
      currentAngle += PI / 4;

      let nextX = currentX + cos(currentAngle) * radius;
      let nextY = currentY + sin(currentAngle) * radius;

      if (i < 5) {
        // Utiliser la combinaison de sons de la lettre
        let soundCombo = letterSoundCombos[letter] || [0, 3, 6];
        let soundIndex = soundCombo[i % soundCombo.length];

        this.segments.push({
          x1: currentX,
          y1: currentY,
          x2: nextX,
          y2: nextY,
          targetX2: nextX,
          targetY2: nextY,
          length: radius,
          angle: currentAngle,
          baseAngle: currentAngle,
          growthStart: i / 5,
          growthEnd: (i + 1) / 5,
          soundIndex: soundIndex,
          visible: true,
          morphTargetX: targetPoints[i + 1] ? targetPoints[i + 1][0] : nextX,
          morphTargetY: targetPoints[i + 1] ? targetPoints[i + 1][1] : nextY,
          soundPlayed: false,
        });
      }

      currentX = nextX;
      currentY = nextY;
    }
  }

  update() {
    this.growthProgress += growthSpeed;
    this.time += animationSpeed;

    if (this.growthProgress >= 1) {
      this.growing = false;
      if (!this.morphing) {
        this.morphing = true;
      }
    }

    // Mettre à jour la position des segments
    for (let i = 0; i < this.segments.length; i++) {
      let seg = this.segments[i];

      if (i <= this.currentSegment) {
        seg.visible = true;

        // Jouer le son quand le segment devient visible
        if (!seg.soundPlayed && soundLoaded) {
          let sound = sounds[seg.soundIndex];
          if (sound) {
            sound.play();
            sound.setVolume(0.2);
          }
          seg.soundPlayed = true;
        }
      }

      if (seg.visible) {
        // Calculer la position finale du segment
        if (this.morphing) {
          if (i === 0) {
            seg.x1 = lerp(seg.x1, this.targetPoints[0][0], this.morphProgress);
            seg.y1 = lerp(seg.y1, this.targetPoints[0][1], this.morphProgress);
          } else {
            seg.x1 = this.segments[i - 1].x2;
            seg.y1 = this.segments[i - 1].y2;
          }
          seg.x2 = lerp(seg.x2, seg.morphTargetX, this.morphProgress);
          seg.y2 = lerp(seg.y2, seg.morphTargetY, this.morphProgress);
        }
      }
    }

    // Ajouter un nouveau segment si nécessaire
    if (this.growing && this.currentSegment < this.segments.length - 1) {
      if (
        this.growthProgress >=
        (this.currentSegment + 1) / this.segments.length
      ) {
        this.currentSegment++;
      }
    }

    // Mettre à jour la progression du morphing
    if (this.morphing) {
      this.morphProgress += this.morphSpeed;
      if (this.morphProgress > 1) this.morphProgress = 1;
    }
  }

  draw() {
    push();
    stroke(0, 100);

    // Calculer la taille du stroke en fonction de la position X et Y
    let mouseXPos = constrain(mouseX, 0, width);
    let mouseYPos = constrain(mouseY, 0, height);

    // X contrôle startStrokeSize, Y contrôle endStrokeSize
    startStrokeSize = map(mouseXPos, 0, width, minStroke, maxStroke);
    endStrokeSize = map(mouseYPos, 0, height, minStroke, maxStroke);

    // Dessiner les segments avec des lignes droites
    for (let i = 0; i <= this.currentSegment; i++) {
      let segment = this.segments[i];
      if (segment.visible) {
        let alpha = map(i, 0, this.segments.length, 255, 50);
        stroke(0, alpha);
        noFill();

        // Dessiner le segment avec un dégradé de taille
        let steps = 20; // Nombre de sous-segments pour le dégradé
        for (let j = 0; j < steps; j++) {
          let t = j / steps;
          let x1 = lerp(segment.x1, segment.x2, t);
          let y1 = lerp(segment.y1, segment.y2, t);
          let x2 = lerp(segment.x1, segment.x2, (j + 1) / steps);
          let y2 = lerp(segment.y1, segment.y2, (j + 1) / steps);

          // Alterner le sens du dégradé pour chaque segment
          let strokeSize;
          if (i % 2 === 0) {
            strokeSize = lerp(startStrokeSize, endStrokeSize, t);
          } else {
            strokeSize = lerp(endStrokeSize, startStrokeSize, t);
          }
          strokeWeight(strokeSize);
          line(x1, y1, x2, y2);
        }
      }
    }
    pop();
  }

  cleanup() {
    this.osc.stop();
    const index = oscillators.indexOf(this.osc);
    if (index > -1) {
      oscillators.splice(index, 1);
    }

    // Arrêter tous les sons en cours
    for (let i = 0; i < this.segments.length; i++) {
      let seg = this.segments[i];
      if (seg.soundPlayed && soundLoaded) {
        let sound = sounds[seg.soundIndex];
        if (sound) {
          sound.stop();
        }
      }
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(220);

  // Initialiser les positions en haut à gauche de l'écran
  currentX = letterSpacing;
  currentY = letterSpacing;
}

function draw() {
  background(220);

  // Calculer le défilement automatique pour suivre la dernière lettre
  let targetScroll = Math.max(0, currentY - height + letterSpacing);
  scrollOffset = lerp(scrollOffset, targetScroll, 0.1);

  // Appliquer le défilement
  push();
  translate(0, -scrollOffset);

  // Dessiner les points verts de la lettre actuelle
  fill(0, 255, 0, 150);
  noStroke();
  for (let point of currentLetterPoints) {
    ellipse(point[0], point[1], 10, 10);
  }

  // Dessiner les lignes entre les points
  if (currentLetterPoints.length > 0) {
    stroke(0, 255, 0, 150);
    strokeWeight(2);
    noFill();

    // Calculer le nombre de lignes à dessiner
    let numLines = Math.floor(lineProgress * (currentLetterPoints.length - 1));

    // Dessiner les lignes complètes
    for (let i = 0; i < numLines; i++) {
      line(
        currentLetterPoints[i][0],
        currentLetterPoints[i][1],
        currentLetterPoints[i + 1][0],
        currentLetterPoints[i + 1][1]
      );
    }

    // Dessiner la ligne en cours
    if (numLines < currentLetterPoints.length - 1) {
      let progress = lineProgress * (currentLetterPoints.length - 1) - numLines;
      let startX = currentLetterPoints[numLines][0];
      let startY = currentLetterPoints[numLines][1];
      let endX = currentLetterPoints[numLines + 1][0];
      let endY = currentLetterPoints[numLines + 1][1];

      line(
        startX,
        startY,
        lerp(startX, endX, progress),
        lerp(startY, endY, progress)
      );
    }

    // Mettre à jour la progression des lignes
    if (lineProgress < 1) {
      lineProgress += lineSpeed;
    }
  }

  // Dessiner toutes les tentacules
  for (let point of points) {
    point.tentacle.update();
    point.tentacle.draw();
  }

  // Dessiner le curseur
  cursorBlink += 0.1;
  if (cursorBlink > 1) {
    cursorBlink = 0;
    cursorVisible = !cursorVisible;
  }

  if (cursorVisible) {
    stroke(0);
    strokeWeight(2);
    line(currentX, currentY - 20, currentX, currentY + 20);
  }

  pop();
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    currentX += letterSpacing;
    spacePressed();
  } else if (event.key >= "a" && event.key <= "z") {
    event.preventDefault();
    createLetterTentacle(event.key);
  } else if (event.key === "Enter") {
    event.preventDefault();
    currentX = letterSpacing * 2;
    currentY += letterSpacing;
    currentWord = [];
  } else if (event.key === "Backspace") {
    event.preventDefault();

    if (currentWord.length > 0) {
      // On récupère le dernier caractère
      let lastChar = currentWord[currentWord.length - 1];

      if (lastChar === " ") {
        // Si c'est un espace, on le retire simplement
        currentWord.pop();
        currentX -= letterSpacing;
      } else {
        // Si c'est une lettre, on supprime aussi la dernière tentacule si elle existe
        if (points.length > 0) {
          let lastPoint = points.pop();
          if (lastPoint.tentacle) {
            lastPoint.tentacle.cleanup();
          }
        }
        currentWord.pop();
        currentX -= letterSpacing;

        // Si on est au début d'une ligne, remonter à la ligne précédente
        if (currentX <= letterSpacing) {
          currentX = width - letterSpacing;
          currentY -= letterSpacing;
        }
      }
    }
  }
});

function spacePressed() {
  // Ajouter un espace au mot courant
  currentWord.push(" ");
  currentX += letterSpacing;

  // Si on atteint la fin de la ligne, passer à la ligne suivante
  if (currentX > width - letterSpacing) {
    currentX = letterSpacing;
    currentY += letterSpacing;
  }

  // Jouer le son pour toutes les tentacules
  for (let point of points) {
    point.tentacle.osc.amp(0.5);
    setTimeout(() => {
      point.tentacle.osc.amp(0);
    }, 200);
  }
}

function createLetterTentacle(letter) {
  if (alphabetPoints[letter]) {
    let letterPoints = alphabetPoints[letter];

    // Réinitialiser la progression des lignes
    lineProgress = 0;

    // Calculer le centre de la lettre
    let letterCenterX = 0;
    let letterCenterY = 0;
    for (let point of letterPoints) {
      letterCenterX += point[0];
      letterCenterY += point[1];
    }
    letterCenterX /= letterPoints.length;
    letterCenterY /= letterPoints.length;

    // Ajuster l'échelle pour la lettre "r"
    let scale = letter === "r" ? letterScale * 1.2 : letterScale;

    // Vérifier si on doit passer à la ligne
    if (currentX > width - letterSpacing) {
      currentX = letterSpacing;
      currentY += letterSpacing;
    }

    // Centrer les points de la lettre et appliquer l'échelle
    let centeredPoints = letterPoints.map((point) => [
      currentX + (point[0] - letterCenterX) * scale,
      currentY + (point[1] - letterCenterY) * scale,
    ]);

    // Mettre à jour les points de la lettre actuelle
    currentLetterPoints = centeredPoints;

    // Créer une tentacule à partir du premier point
    let startX = centeredPoints[0][0];
    let startY = centeredPoints[0][1];
    let newTentacle = {
      x: startX,
      y: startY,
      tentacle: new Tentacle(startX, startY, centeredPoints, letter),
    };

    points.push(newTentacle);
    currentWord.push(letter);

    // Déplacer la position X pour la prochaine lettre
    currentX += letterSpacing;

    // Si on atteint le bas de l'écran et qu'on a atteint le maximum de lettres
    if (currentY > height - letterSpacing && points.length >= maxTentacles) {
      // Supprimer toutes les lettres existantes
      for (let point of points) {
        if (point.tentacle) {
          point.tentacle.cleanup();
        }
      }
      points = [];
      currentWord = [];
      // Recommencer en haut
      currentY = letterSpacing;
    }

    // Limiter le nombre de tentacules visibles
    if (points.length > maxTentacles) {
      points[0].tentacle.cleanup();
      points.shift();
    }
  }
}

// Ajouter la gestion de la molette de la souris
function mouseWheel(event) {
  // Calculer la nouvelle position de défilement
  let newScrollOffset = scrollOffset + event.delta;

  // Limiter le défilement pour ne pas aller trop haut ou trop bas
  let maxScroll = Math.max(0, currentY - height + letterSpacing);
  scrollOffset = constrain(newScrollOffset, 0, maxScroll);

  return false; // Empêcher le défilement par défaut
}

// Modifier la fonction windowResized pour gérer le redimensionnement
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Ajuster la position de défilement
  let targetScroll = Math.max(0, currentY - height + letterSpacing);
  scrollOffset = targetScroll;
}
