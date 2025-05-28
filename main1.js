let points = []; // Tableau pour stocker les points et leurs tentacules
let fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
let segmentsPerTentacle = 6; // Nombre de segments par tentacule
let growthSpeed = 1 / 100; // Vitesse de croissance des segments
let amplitude = 20;
let animationSpeed = 0.005; // Vitesse d'animation réduite
let maxTentacles = 100;
let oscillators = []; // Tableau pour stocker les oscillateurs
let sizeCircle = 100;
let sizeStroke = 50;

// Variables pour le texte
let currentWord = [];
let letterSpacing = 300; // Espacement réduit pour mieux centrer
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
    [120.0, 60.0],
    [110.0, 80.0],
    [100.0, 100.0],
    [110.0, 120.0],
    [120.0, 140.0],
    [100.0, 160.0],
  ],
  c: [
    [130.0, 70.0],
    [110.0, 60.0],
    [90.0, 80.0],
    [90.0, 120.0],
    [110.0, 140.0],
    [130.0, 130.0],
  ],
  d: [
    [80.0, 60.0],
    [80.0, 140.0],
    [110.0, 120.0],
    [120.0, 100.0],
    [110.0, 80.0],
    [80.0, 100.0],
  ],
  e: [
    [130.0, 60.0],
    [80.0, 60.0],
    [80.0, 100.0],
    [120.0, 100.0],
    [80.0, 140.0],
    [130.0, 140.0],
  ],
  f: [
    [130.0, 60.0],
    [80.0, 60.0],
    [80.0, 100.0],
    [120.0, 100.0],
    [80.0, 140.0],
    [80.0, 180.0],
  ],
  g: [
    [120.0, 60.0],
    [90.0, 50.0],
    [70.0, 80.0],
    [70.0, 120.0],
    [90.0, 150.0],
    [120.0, 120.0],
  ],
  h: [
    [70.0, 50.0],
    [70.0, 150.0],
    [70.0, 100.0],
    [120.0, 100.0],
    [120.0, 50.0],
    [120.0, 150.0],
  ],
  i: [
    [95.0, 50.0],
    [95.0, 80.0],
    [95.0, 110.0],
    [95.0, 140.0],
    [85.0, 140.0],
    [105.0, 140.0],
  ],
  j: [
    [120.0, 50.0],
    [120.0, 100.0],
    [120.0, 150.0],
    [100.0, 170.0],
    [80.0, 150.0],
    [100.0, 140.0],
  ],
  k: [
    [70.0, 50.0],
    [70.0, 150.0],
    [70.0, 100.0],
    [120.0, 50.0],
    [70.0, 100.0],
    [120.0, 150.0],
  ],
  l: [
    [70.0, 50.0],
    [70.0, 150.0],
    [90.0, 150.0],
    [110.0, 150.0],
    [130.0, 150.0],
    [130.0, 130.0],
  ],
  m: [
    [70.0, 150.0],
    [70.0, 50.0],
    [100.0, 100.0],
    [130.0, 50.0],
    [130.0, 150.0],
    [100.0, 100.0],
  ],
  n: [
    [70.0, 150.0],
    [70.0, 50.0],
    [130.0, 150.0],
    [130.0, 50.0],
    [100.0, 100.0],
    [100.0, 100.0],
  ],
  o: [
    [100.0, 50.0],
    [70.0, 80.0],
    [70.0, 120.0],
    [100.0, 150.0],
    [130.0, 120.0],
    [130.0, 80.0],
  ],
  p: [
    [70.0, 150.0],
    [70.0, 50.0],
    [110.0, 50.0],
    [130.0, 70.0],
    [110.0, 90.0],
    [70.0, 90.0],
  ],
  q: [
    [100.0, 50.0],
    [70.0, 80.0],
    [70.0, 120.0],
    [100.0, 150.0],
    [130.0, 120.0],
    [140.0, 160.0],
  ],
  r: [
    [70.0, 150.0],
    [70.0, 50.0],
    [110.0, 50.0],
    [130.0, 70.0],
    [110.0, 90.0],
    [130.0, 150.0],
  ],
  s: [
    [120.0, 60.0],
    [90.0, 50.0],
    [70.0, 80.0],
    [120.0, 120.0],
    [90.0, 150.0],
    [70.0, 140.0],
  ],
  t: [
    [70.0, 50.0],
    [130.0, 50.0],
    [100.0, 50.0],
    [100.0, 150.0],
    [90.0, 150.0],
    [110.0, 150.0],
  ],
  u: [
    [70.0, 50.0],
    [70.0, 120.0],
    [100.0, 150.0],
    [130.0, 120.0],
    [130.0, 50.0],
    [100.0, 150.0],
  ],
  v: [
    [70.0, 50.0],
    [100.0, 150.0],
    [130.0, 50.0],
    [100.0, 150.0],
    [100.0, 150.0],
    [100.0, 150.0],
  ],
  w: [
    [70.0, 50.0],
    [85.0, 150.0],
    [100.0, 100.0],
    [115.0, 150.0],
    [130.0, 50.0],
    [100.0, 100.0],
  ],
  x: [
    [70.0, 50.0],
    [130.0, 150.0],
    [100.0, 100.0],
    [130.0, 50.0],
    [70.0, 150.0],
    [100.0, 100.0],
  ],
  y: [
    [70.0, 50.0],
    [100.0, 100.0],
    [130.0, 50.0],
    [100.0, 100.0],
    [100.0, 150.0],
    [100.0, 150.0],
  ],
  z: [
    [70.0, 50.0],
    [130.0, 50.0],
    [70.0, 150.0],
    [130.0, 150.0],
    [70.0, 150.0],
    [130.0, 50.0],
  ],
};

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
    this.morphSpeed = 0.02;
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
    strokeWeight(sizeStroke);
    stroke(0, 100);

    // Dessiner les segments avec des lignes droites
    for (let i = 0; i <= this.currentSegment; i++) {
      let segment = this.segments[i];
      if (segment.visible) {
        let alpha = map(i, 0, this.segments.length, 255, 50);
        stroke(0, alpha);
        noFill();
        line(segment.x1, segment.y1, segment.x2, segment.y2);
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

  // Initialiser les positions au centre de l'écran
  currentX = width / 2 - letterSpacing;
  currentY = height / 2;
}

function draw() {
  background(220);

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
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    spacePressed();
  } else if (event.key >= "a" && event.key <= "z") {
    event.preventDefault();
    createLetterTentacle(event.key);
  } else if (event.key === "Backspace") {
    event.preventDefault();
    if (currentWord.length > 0) {
      let lastLetter = currentWord.pop();
      if (lastLetter.tentacle) {
        lastLetter.tentacle.cleanup();
      }
      let index = points.findIndex((p) => p.tentacle === lastLetter.tentacle);
      if (index !== -1) {
        points.splice(index, 1);
      }
      currentX -= letterSpacing;
      if (currentX < width / 2 - letterSpacing * 2) {
        currentX = width - 500;
        currentY -= letterSpacing;
      }
    }
  } else if (event.key === "Enter") {
    event.preventDefault();
    currentX = width / 2 - letterSpacing * 2;
    currentY += letterSpacing;
    currentWord = [];
  }
});

function spacePressed() {
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

    // Centrer les points de la lettre et appliquer l'échelle
    let centeredPoints = letterPoints.map((point) => [
      currentX + (point[0] - letterCenterX) * letterScale,
      currentY + (point[1] - letterCenterY) * letterScale,
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
    currentWord.push(newTentacle);

    // Déplacer la position X pour la prochaine lettre
    currentX += letterSpacing;

    // Si on atteint la fin de la ligne, passer à la ligne suivante
    if (currentX > width - letterSpacing) {
      currentX = width / 2 - letterSpacing;
      currentY += letterSpacing;
    }

    // Limiter le nombre de tentacules visibles
    if (points.length > maxTentacles) {
      points[0].tentacle.cleanup();
      points.shift();
    }
  }
}

// Gestionnaire d'événements pour le redimensionnement de la fenêtre
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Recentrer les lettres existantes
  if (currentWord.length > 0) {
    currentX = width / 2 - letterSpacing;
    currentY = height / 2;
    // Recréer toutes les lettres
    let letters = currentWord.map((word) => word.letter);
    currentWord = [];
    points = [];
    letters.forEach((letter) => createLetterTentacle(letter));
  }
}
