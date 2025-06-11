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
let maxStroke = 65;
let cursorHeight = 70; // Hauteur du curseur de texte

// Constantes pour les modes de lecture
const MAX_SEQUENCES = 3; // Nombre de répétitions pour le mode 3
const MAX_SOUND_DURATION = 900000; // 15 minutes en millisecondes
const FIBONACCI_INTERVALS = [1, 2, 3, 5, 8, 13, 21];
const INACTIVITY_TIMEOUT = 900000; // 15 minutes d'inactivité avant d'arrêter tous les sons
const MAX_LETTER_SOUND_DURATION = 900000; // 15 minutes maximum par lettre
const MAX_LETTER_DURATION = 900000; // 15 minutes avant de supprimer une lettre

// Variables pour le texte
let currentWord = [];
let letterSpacing = 200; // Espacement réduit pour avoir plus de lettres par ligne
let currentX = 150; // Position X initiale décalée vers la droite
let currentY = 150; // Position Y initiale en dessous des boutons
let letterScale = 1.5; // Échelle réduite pour mieux s'adapter à l'écran
let currentLetterPoints = [];
let showTentacles = true;
let tentacleDelay = 500;
let lineProgress = 10;
let lineSpeed = 0.01;

// Variables pour le dé-morphing
let demorphingTentacles = new Set();
const DEMORPH_DURATION = 1000; // 1 seconde

// Variables pour le séquenceur de mots
let currentPlayingWordIndex = null;
let currentPlayingLetterIndex = null;

// Variables pour le contrôle de la durée des lettres et des notes
let letterStartTime = {};
let noteStartTime = {};
const MAX_NOTE_DURATION = 20000; // 20 secondes en millisecondes

// Variables pour les sons
let sounds = [];
let soundLoaded = false;
let activeSounds = new Set();
let soundStartTimes = new Map();
let isFibonacciMode = false; // Nouveau mode Fibonacci
let isSinglePlayMode = false; // Nouveau mode pour la touche 3

let audioContext;
let masterGain;
const activeNotes = new Set();

// Variables pour les couleurs
const COLORS = {
  // Couleurs de fond
  background1: [41, 97, 51], // Vert 296133
  background2: [244, 196, 250], // Violet f4c4fa
  background3: [141, 145, 68], // Vert olive 8d9144

  // Couleurs des boutons et textes
  button1: [183, 243, 225], // Vert clair b7f3e1
  button2: [235, 86, 41], // Orange eb5629
  button3: [248, 210, 71], // Jaune f8d247
};

// Variables pour le contrôle des modes
let isColorMode1 = true; // Mode couleur 1 (vert) par défaut
let currentColor = [255, 255, 255, 50]; // Couleur actuelle par défaut avec transparence

// Gamme musicale
const NOTES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
};

// Variables pour le séquenceur
let sequencer = {
  steps: [], // Tableau pour stocker les étapes de la séquence
  currentStep: 0,
  isPlaying: false,
  bpm: 120, // Tempo en battements par minute
  stepDuration: 0, // Durée d'une étape en millisecondes
  lastStepTime: 0,
  sounds: [], // Sons chargés
  activeSounds: new Set(),
  sequences: [], // Liste des séquences
};

// === Variables pour l'affichage de la lettre jouée ===
let scrollOffset = 0;
let scrollSpeed = 0.1; // Vitesse de défilement plus douce
let isScrolling = false;
let cursorBlink = 0;
let cursorVisible = true;
const INTERACTIVE_ZONE_RADIUS = 100; // Rayon de la zone interactive en pixels

// Variables pour le point de lecture
let notePlayIndicator = {
  isVisible: false,
  startTime: 0,
  duration: 200, // Durée d'affichage en millisecondes
};

// Variables pour le contrôle de l'inactivité
let lastActivityTime = Date.now();
let inactivityTimer = null;

// Variables pour le contrôle des sons
let letterSoundStartTimes = new Map(); // Pour suivre le début de lecture de chaque lettre

function initAudio() {
  if (audioContext) return;
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.4;
  masterGain.connect(audioContext.destination);
}

function playNote(frequency, type = "sine", volume = 0.4, duration = 1.0) {
  initAudio();

  if (activeNotes.has(frequency)) return;

  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.02);
  gain.gain.setValueAtTime(volume, now + duration - 0.1);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + duration);

  activeNotes.add(frequency);
  noteStartTime[frequency] = Date.now();
  setTimeout(() => {
    activeNotes.delete(frequency);
    delete noteStartTime[frequency];
  }, duration * 1000);
}

function playSound(segment) {
  if (!soundLoaded) return;
  resetInactivityTimer();

  const soundIndex = segment.soundIndex % sounds.length;
  if (activeSounds.has(soundIndex)) return;

  // Vérifier si la lettre a dépassé sa durée maximale
  const letterKey = this.letter;
  const letterStartTime = letterSoundStartTimes.get(letterKey);
  if (
    letterStartTime &&
    Date.now() - letterStartTime > MAX_LETTER_SOUND_DURATION
  ) {
    console.log(`⏱️ Durée maximale dépassée pour la lettre: ${letterKey}`);
    return;
  }

  const sound = sounds[soundIndex];
  if (sound) {
    const startTime = Date.now();
    soundStartTimes.set(soundIndex, startTime);
    letterSoundStartTimes.set(letterKey, startTime);

    // Jouer le son initial
    sound.play();
    sound.setVolume(0.3);
    activeSounds.add(soundIndex);

    // Log pour le son initial
    console.log(
      `🎵 Son créé - Lettre: ${this.letter}, Mode: ${
        isFibonacciMode ? "Fibonacci" : "Séquentiel"
      }, Volume: 0.3`
    );

    // Activer l'état de lecture
    this.isPlaying = true;
    this.playStartTime = startTime;

    // Activer l'indicateur de lecture
    notePlayIndicator.isVisible = true;
    notePlayIndicator.startTime = startTime;

    if (isFibonacciMode) {
      // Mode Fibonacci
      let currentInterval = 0;
      const playNext = () => {
        // Vérifier si la durée maximale est dépassée
        if (Date.now() - startTime >= MAX_LETTER_SOUND_DURATION) {
          sound.stop();
          activeSounds.delete(soundIndex);
          soundStartTimes.delete(soundIndex);
          letterSoundStartTimes.delete(letterKey);
          this.isPlaying = false;
          console.log(
            `🔇 Son arrêté - Lettre: ${this.letter}, Durée maximale atteinte`
          );
          return;
        }

        if (currentInterval < FIBONACCI_INTERVALS.length) {
          sound.play();
          sound.setVolume(0.3);
          console.log(
            `🔄 Répétition Fibonacci - Lettre: ${this.letter}, Intervalle: ${
              FIBONACCI_INTERVALS[currentInterval] * 100
            }ms`
          );
          // Réactiver l'indicateur pour chaque répétition
          notePlayIndicator.isVisible = true;
          notePlayIndicator.startTime = Date.now();
          setTimeout(playNext, FIBONACCI_INTERVALS[currentInterval] * 100);
          currentInterval++;
        }
      };

      // Démarrer la séquence de répétition Fibonacci
      setTimeout(playNext, FIBONACCI_INTERVALS[0] * 100);
    } else {
      // Mode normal
      setTimeout(() => {
        sound.stop();
        activeSounds.delete(soundIndex);
        soundStartTimes.delete(soundIndex);
        letterSoundStartTimes.delete(letterKey);
        this.isPlaying = false;
        console.log(`🔇 Son arrêté - Lettre: ${this.letter}, Mode normal`);
      }, MAX_SOUND_DURATION);
    }
  }
}

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

function preload() {
  // Charger tous les sons
  const letters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
  ];

  // Charger le son spécial pour l'espace
  sounds[0] = loadSound("sound/00_.wav");

  // Charger les sons des lettres
  for (let i = 0; i < letters.length; i++) {
    sounds[i + 1] = loadSound(`sound/${letters[i]}.wav`);
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
    this.morphSpeed = 0.005;
    this.letter = letter;
    this.isDemorphing = false;
    this.demorphStartTime = 0;
    this.demorphProgress = 0;
    this.isPlaying = false;
    this.playStartTime = 0;
    this.color = isColorMode1 ? [0, 255, 0] : [0, 0, 255]; // Définir la couleur en fonction du mode

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
        // Utiliser directement l'index de la lettre pour le son
        let soundIndex = letter.toUpperCase().charCodeAt(0) - 64; // 'A' = 1, 'B' = 2, etc.

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
          originalX2: nextX,
          originalY2: nextY,
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

    // Gérer le dé-morphing
    if (this.isDemorphing) {
      let elapsedTime = Date.now() - this.demorphStartTime;
      this.demorphProgress = map(elapsedTime, 0, DEMORPH_DURATION, 0, 1);

      if (elapsedTime >= DEMORPH_DURATION) {
        this.isDemorphing = false;
        this.morphing = true;
        this.morphProgress = 0;
        this.demorphProgress = 0;
      }
    }

    // Mettre à jour la position des segments
    for (let i = 0; i < this.segments.length; i++) {
      let seg = this.segments[i];

      if (i <= this.currentSegment) {
        seg.visible = true;
        this.playSound(seg);
      }

      if (seg.visible) {
        if (i === 0) {
          seg.x1 = lerp(seg.x1, this.targetPoints[0][0], this.morphProgress);
          seg.y1 = lerp(seg.y1, this.targetPoints[0][1], this.morphProgress);
        } else {
          seg.x1 = this.segments[i - 1].x2;
          seg.y1 = this.segments[i - 1].y2;
        }

        if (this.isDemorphing) {
          // Pendant le dé-morphing, interpoler entre la position morphée et la position originale
          seg.x2 = lerp(seg.morphTargetX, seg.originalX2, this.demorphProgress);
          seg.y2 = lerp(seg.morphTargetY, seg.originalY2, this.demorphProgress);
        } else {
          // Morphing normal
          seg.x2 = lerp(seg.x2, seg.morphTargetX, this.morphProgress);
          seg.y2 = lerp(seg.y2, seg.morphTargetY, this.morphProgress);
        }
      }
    }

    if (this.growing && this.currentSegment < this.segments.length - 1) {
      if (
        this.growthProgress >=
        (this.currentSegment + 1) / this.segments.length
      ) {
        this.currentSegment++;
      }
    }

    if (this.morphing && !this.isDemorphing) {
      this.morphProgress += this.morphSpeed;
      if (this.morphProgress > 1) this.morphProgress = 1;
    }
  }

  draw() {
    push();
    // Utiliser la couleur stockée pour les strokes
    if (this.isPlaying) {
      let elapsedTime = Date.now() - this.playStartTime;
      let alpha = map(elapsedTime, 0, 500, 255, 0);
      stroke(this.color[0], this.color[1], this.color[2], alpha);
    } else {
      stroke(this.color[0], this.color[1], this.color[2], 100);
    }

    // Calculer la taille du stroke en fonction de la position X et Y
    let mouseXPos = constrain(mouseX, 0, width);
    let mouseYPos = constrain(mouseY, 0, height);

    // Trouver la lettre la plus proche
    let closestDistance = Infinity;
    let closestTentacle = null;

    for (let point of points) {
      if (point.tentacle) {
        let dx = mouseX - point.tentacle.baseX;
        let dy = mouseY - point.tentacle.baseY;
        let distance = sqrt(dx * dx + dy * dy);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestTentacle = point.tentacle;
        }
      }
    }

    // Calculer l'influence de la proximité sur les tailles
    let proximityInfluence = 0;
    if (closestDistance < INTERACTIVE_ZONE_RADIUS) {
      proximityInfluence = map(
        closestDistance,
        0,
        INTERACTIVE_ZONE_RADIUS,
        1,
        0
      );
    }

    // Calculer les tailles de stroke avec l'influence de la proximité
    let baseStartSize = map(mouseXPos, 0, width, minStroke, maxStroke);
    let baseEndSize = map(mouseYPos, 0, height, minStroke, maxStroke);

    // Mélanger les tailles en fonction de la proximité
    startStrokeSize = lerp(
      baseStartSize,
      (minStroke + maxStroke) / 2,
      proximityInfluence
    );
    endStrokeSize = lerp(
      baseEndSize,
      (minStroke + maxStroke) / 2,
      proximityInfluence
    );

    // Dessiner les segments avec des lignes droites
    for (let i = 0; i <= this.currentSegment; i++) {
      let segment = this.segments[i];
      if (segment.visible) {
        let alpha = map(i, 0, this.segments.length, 255, 50);
        stroke(this.color[0], this.color[1], this.color[2], alpha);
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

  playSound(segment) {
    if (!soundLoaded) return;

    const soundIndex = segment.soundIndex % sounds.length;
    if (activeSounds.has(soundIndex)) return;

    const sound = sounds[soundIndex];
    if (sound) {
      const startTime = Date.now();
      soundStartTimes.set(soundIndex, startTime);

      // Jouer le son initial
      sound.play();
      sound.setVolume(0.3);
      activeSounds.add(soundIndex);

      // Log pour le son initial
      console.log(
        `🎵 Son créé - Lettre: ${this.letter}, Mode: ${
          isFibonacciMode ? "Fibonacci" : "Séquentiel"
        }, Volume: 0.3`
      );

      // Activer l'état de lecture
      this.isPlaying = true;
      this.playStartTime = startTime;

      // Activer l'indicateur de lecture
      notePlayIndicator.isVisible = true;
      notePlayIndicator.startTime = startTime;

      if (isFibonacciMode) {
        // Mode Fibonacci
        let currentInterval = 0;
        const playNext = () => {
          if (Date.now() - startTime >= MAX_SOUND_DURATION) {
            sound.stop();
            activeSounds.delete(soundIndex);
            soundStartTimes.delete(soundIndex);
            this.isPlaying = false;
            console.log(
              `🔇 Son arrêté - Lettre: ${this.letter}, Durée maximale atteinte`
            );
            return;
          }

          if (currentInterval < FIBONACCI_INTERVALS.length) {
            sound.play();
            sound.setVolume(0.3);
            console.log(
              `🔄 Répétition Fibonacci - Lettre: ${this.letter}, Intervalle: ${
                FIBONACCI_INTERVALS[currentInterval] * 100
              }ms`
            );
            // Réactiver l'indicateur pour chaque répétition
            notePlayIndicator.isVisible = true;
            notePlayIndicator.startTime = Date.now();
            setTimeout(playNext, FIBONACCI_INTERVALS[currentInterval] * 100);
            currentInterval++;
          }
        };

        // Démarrer la séquence de répétition Fibonacci
        setTimeout(playNext, FIBONACCI_INTERVALS[0] * 100);
      } else {
        // Mode normal
        setTimeout(() => {
          sound.stop();
          activeSounds.delete(soundIndex);
          soundStartTimes.delete(soundIndex);
          this.isPlaying = false;
          console.log(`🔇 Son arrêté - Lettre: ${this.letter}, Mode normal`);
        }, MAX_SOUND_DURATION);
      }
    }
  }
}

function initSequencer() {
  sequencer.stepDuration = (60 / sequencer.bpm) * 1000; // Convertir BPM en millisecondes
  sequencer.lastStepTime = Date.now();
}

function addSoundToSequencer(soundIndex) {
  if (!soundLoaded) return;

  // Ajouter le son à la séquence actuelle
  sequencer.steps.push({
    soundIndex: soundIndex,
    time: Date.now(),
  });

  // Limiter la séquence à 16 étapes
  if (sequencer.steps.length > 16) {
    sequencer.steps.shift();
  }
}

function playSequencerStep() {
  if (!sequencer.isPlaying) return;

  const currentTime = Date.now();

  // Jouer la séquence principale
  if (currentTime - sequencer.lastStepTime >= sequencer.stepDuration) {
    // Jouer le son de l'étape actuelle
    const step = sequencer.steps[sequencer.currentStep];
    if (step && !sequencer.activeSounds.has(step.soundIndex)) {
      const sound = sounds[step.soundIndex];
      if (sound) {
        sound.play();
        sound.setVolume(0.3);
        sequencer.activeSounds.add(step.soundIndex);

        // Arrêter le son après 10 secondes
        setTimeout(() => {
          sound.stop();
          sequencer.activeSounds.delete(step.soundIndex);
        }, MAX_SOUND_DURATION);
      }
    }

    // Passer à l'étape suivante
    sequencer.currentStep =
      (sequencer.currentStep + 1) % Math.max(1, sequencer.steps.length);
    sequencer.lastStepTime = currentTime;
  }

  // Jouer toutes les séquences supplémentaires
  if (sequencer.sequences) {
    for (let sequence of sequencer.sequences) {
      if (
        sequence.isPlaying &&
        currentTime - sequence.lastStepTime >= sequence.stepDuration
      ) {
        // Jouer le son de l'étape actuelle
        const step = sequence.steps[sequence.currentStep];
        if (step && !sequence.activeSounds.has(step.soundIndex)) {
          const sound = sounds[step.soundIndex];
          if (sound) {
            sound.play();
            sound.setVolume(0.2); // Volume plus bas pour les séquences secondaires
            sequence.activeSounds.add(step.soundIndex);

            // Arrêter le son après 10 secondes
            setTimeout(() => {
              sound.stop();
              sequence.activeSounds.delete(step.soundIndex);
            }, MAX_SOUND_DURATION);
          }
        }

        // Passer à l'étape suivante
        sequence.currentStep =
          (sequence.currentStep + 1) % Math.max(1, sequence.steps.length);
        sequence.lastStepTime = currentTime;
      }
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(220);

  // Initialiser les positions en haut à gauche de l'écran
  currentX = 150; // Position X initiale décalée vers la droite
  currentY = 150; // Position Y initiale en dessous des boutons
  initAudio();
  initSequencer();
  sequencer.isPlaying = true; // Démarrer le séquenceur automatiquement
}

function draw() {
  // Effacer le canvas
  clear();

  // Dessiner un rectangle plein écran avec la couleur de fond appropriée
  noStroke();
  if (isColorMode1) {
    fill(COLORS.background1[0], COLORS.background1[1], COLORS.background1[2]);
  } else if (isSinglePlayMode) {
    fill(COLORS.background3[0], COLORS.background3[1], COLORS.background3[2]);
  } else {
    fill(COLORS.background2[0], COLORS.background2[1], COLORS.background2[2]);
  }
  rect(0, 0, width, height);

  // Vérifier l'inactivité
  if (Date.now() - lastActivityTime > INACTIVITY_TIMEOUT) {
    stopAllSounds();
  }

  // Dessiner les boutons sans stroke
  noStroke();
  let buttonWidth = 250;
  let buttonHeight = 70;
  let buttonSpacing = 40;
  let buttonRadius = 15;
  let strokeSizeSelected = 5;
  let totalWidth = buttonWidth * 3 + buttonSpacing * 2;
  let startX = (width - totalWidth) / 2;

  // Bouton Play (Mode 1)
  if (isColorMode1) {
    stroke(255);
    strokeWeight(strokeSizeSelected);
  } else {
    noStroke();
  }
  fill(COLORS.button1[0], COLORS.button1[1], COLORS.button1[2]);
  rect(startX, 20, buttonWidth, buttonHeight, buttonRadius);

  // Bouton Fibonacci (Mode 2)
  if (!isColorMode1 && !isSinglePlayMode) {
    stroke(255);
    strokeWeight(strokeSizeSelected);
  } else {
    noStroke();
  }
  fill(COLORS.button2[0], COLORS.button2[1], COLORS.button2[2]);
  rect(
    startX + buttonWidth + buttonSpacing,
    20,
    buttonWidth,
    buttonHeight,
    buttonRadius
  );

  // Bouton Beat (Mode 3)
  if (isSinglePlayMode) {
    stroke(255);
    strokeWeight(strokeSizeSelected);
  } else {
    noStroke();
  }
  fill(COLORS.button3[0], COLORS.button3[1], COLORS.button3[2]);
  rect(
    startX + (buttonWidth + buttonSpacing) * 2,
    20,
    buttonWidth,
    buttonHeight,
    buttonRadius
  );

  // Ajouter le texte sur les boutons
  noStroke();
  fill(255, 255, 255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("Play", startX + buttonWidth / 2, 20 + buttonHeight / 2);
  text(
    "Fibonacci",
    startX + buttonWidth + buttonSpacing + buttonWidth / 2,
    20 + buttonHeight / 2
  );
  text(
    "Beat",
    startX + (buttonWidth + buttonSpacing) * 2 + buttonWidth / 2,
    20 + buttonHeight / 2
  );

  // Ajouter les touches sous les boutons
  textSize(16);
  fill(COLORS.button1[0], COLORS.button1[1], COLORS.button1[2]);
  text("T. 1", startX + buttonWidth - 30, 20 + buttonHeight - 12);

  fill(COLORS.button2[0], COLORS.button2[1], COLORS.button2[2]);
  text(
    "T. 2",
    startX + buttonWidth + buttonSpacing + buttonWidth - 30,
    20 + buttonHeight - 12
  );
  text(
    "T. 3",
    startX + (buttonWidth + buttonSpacing) * 2 + buttonWidth - 30,
    20 + buttonHeight - 12
  );

  // Dessiner l'indicateur de lecture de note
  if (notePlayIndicator.isVisible) {
    let elapsedTime = Date.now() - notePlayIndicator.startTime;
    let alpha = map(elapsedTime, 0, notePlayIndicator.duration, 255, 0);
    fill(currentColor[0], currentColor[1], currentColor[2], alpha);
    noStroke();
    ellipse(width - 30, 30, 20, 20);

    // Désactiver l'indicateur après la durée spécifiée
    if (elapsedTime > notePlayIndicator.duration) {
      notePlayIndicator.isVisible = false;
    }
  }

  // Vérifier et arrêter les sons qui dépassent 20 secondes
  const currentTime = Date.now();
  for (let [soundIndex, startTime] of soundStartTimes.entries()) {
    if (currentTime - startTime >= MAX_SOUND_DURATION) {
      if (sounds[soundIndex]) {
        sounds[soundIndex].stop();
      }
      activeSounds.delete(soundIndex);
      soundStartTimes.delete(soundIndex);
    }
  }

  // Dessiner la zone interactive (optionnel, pour le debug)
  noFill();
  stroke(255, 0, 0, 50);
  strokeWeight(1);
  ellipse(mouseX, mouseY, INTERACTIVE_ZONE_RADIUS * 2);

  // Vérifier si le bouton de la souris est maintenu enfoncé
  if (mouseIsPressed) {
    // Activer le dé-morphing uniquement pour les tentacules dans la zone interactive
    for (let point of points) {
      if (point.tentacle) {
        // Calculer la distance entre la souris et le point de base de la tentacule
        let dx = mouseX - point.tentacle.baseX;
        let dy = mouseY - point.tentacle.baseY;
        let distance = sqrt(dx * dx + dy * dy);

        // Si la tentacule est dans la zone interactive et en dessous des boutons
        if (distance < INTERACTIVE_ZONE_RADIUS && mouseY > 100) {
          // Activer le dé-morphing
          point.tentacle.isDemorphing = true;
          point.tentacle.demorphStartTime = Date.now();
          point.tentacle.demorphProgress = 0;
        }
      }
    }
  }

  // Jouer le séquenceur de mots
  WordSequencer.playCurrentWordSequencer((letter, wordIndex, letterIndex) => {
    // Jouer le son de la lettre
    if (soundLoaded && sounds.length > 0) {
      let soundIndex = letter.toUpperCase().charCodeAt(0) - 64;
      if (sounds[soundIndex]) {
        sounds[soundIndex].play();
        sounds[soundIndex].setVolume(0.3);
      }
    }
  });

  // Calculer le défilement automatique pour suivre la dernière lettre
  let maxScroll = Math.max(0, currentY - height + letterSpacing * 2);
  let targetScroll = Math.min(maxScroll, currentY - height / 2);

  // Appliquer le défilement avec une interpolation plus douce
  scrollOffset = lerp(scrollOffset, targetScroll, scrollSpeed);

  // Appliquer le défilement
  push();
  translate(0, -scrollOffset);

  // Dessiner les points verts de la lettre actuelle
  fill(COLORS.button1[0], COLORS.button1[1], COLORS.button1[2], 150);
  noStroke();
  for (let point of currentLetterPoints) {
    ellipse(point[0], point[1], 10, 10);
  }

  // Dessiner les lignes entre les points
  if (currentLetterPoints.length > 0) {
    stroke(COLORS.button1[0], COLORS.button1[1], COLORS.button1[2], 150);
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
    stroke(255); // Curseur en blanc
    strokeWeight(2);
    line(currentX, currentY - cursorHeight, currentX, currentY + cursorHeight);
  }

  pop();

  cleanupExpiredLetters();
  playSequencerStep(); // Jouer les étapes du séquenceur
}

function drawColorButtons() {
  // Bouton Vert (Mode 1)
  fill(
    isColorMode1
      ? COLORS.button1
      : [COLORS.button1[0], COLORS.button1[1], COLORS.button1[2], 200]
  );
  stroke(0);
  strokeWeight(2);
  rect(20, 20, 100, 40, 10);
  fill(0);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  text("Mode 1", 70, 40);

  // Bouton Bleu (Mode 2)
  fill(
    !isColorMode1 && !isSinglePlayMode
      ? COLORS.button2
      : [COLORS.button2[0], COLORS.button2[1], COLORS.button2[2], 200]
  );
  stroke(0);
  strokeWeight(2);
  rect(140, 20, 100, 40, 10);
  fill(0);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  text("Mode 2", 190, 40);

  // Bouton Rouge (Mode 3)
  fill(isSinglePlayMode ? [255, 0, 0] : [200, 0, 0]);
  stroke(0);
  strokeWeight(2);
  rect(260, 20, 100, 40, 10);
  fill(0);
  noStroke();
  textSize(16);
  textAlign(CENTER, CENTER);
  text("Mode 3", 310, 40);
}

function mousePressed() {
  resetInactivityTimer();

  // Vérifier si on clique sur les boutons
  if (mouseX > 20 && mouseX < 120 && mouseY > 20 && mouseY < 60) {
    // Bouton Mode 1
    isColorMode1 = true;
    isSinglePlayMode = false;
    currentColor = COLORS.button1; // Vert clair b7f3e1
    // Mettre à jour la couleur de toutes les tentacules existantes
    for (let point of points) {
      if (point.tentacle) {
        point.tentacle.color = COLORS.button1;
      }
    }
  } else if (mouseX > 140 && mouseX < 240 && mouseY > 20 && mouseY < 60) {
    // Bouton Mode 2
    isColorMode1 = false;
    isSinglePlayMode = false;
    currentColor = COLORS.button2; // Orange eb5629
    // Mettre à jour la couleur de toutes les tentacules existantes
    for (let point of points) {
      if (point.tentacle) {
        point.tentacle.color = COLORS.button2;
      }
    }
  } else if (mouseX > 260 && mouseX < 360 && mouseY > 20 && mouseY < 60) {
    // Bouton Mode 3
    isColorMode1 = false;
    isSinglePlayMode = true;
    currentColor = COLORS.button3; // Rouge e93323
    // Mettre à jour la couleur de toutes les tentacules existantes
    for (let point of points) {
      if (point.tentacle) {
        point.tentacle.color = COLORS.button3;
      }
    }
  } else {
    // Chercher la lettre la plus proche du clic
    let closestPoint = null;
    let minDistance = Infinity;

    for (let point of points) {
      const d = dist(mouseX, mouseY, point.x, point.y);
      if (d < minDistance) {
        minDistance = d;
        closestPoint = point;
      }
    }

    // Si on a trouvé un point proche (dans un rayon de 50 pixels)
    if (closestPoint && minDistance < 50) {
      // Créer un nouveau point à la position du clic avec la même lettre
      const newPoint = new Point(mouseX, mouseY, closestPoint.letter);
      points.push(newPoint);
      letterStartTime[newPoint.letter] = Date.now();
      console.log(
        `🎯 Point créé - Lettre: ${newPoint.letter}, Position: (${mouseX}, ${mouseY})`
      );
    } else {
      // Si aucun point n'est proche, créer un nouveau point avec une lettre aléatoire
      const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const point = new Point(mouseX, mouseY, letter);
      points.push(point);
      letterStartTime[letter] = Date.now();
      console.log(
        `🎯 Point créé - Lettre: ${letter}, Position: (${mouseX}, ${mouseY})`
      );
    }
  }
}

function keyPressed() {
  resetInactivityTimer();
  if (key === "1") {
    console.log("🎹 Mode 1 activé - Lecture séquentielle");
    isFibonacciMode = false;
    isSinglePlayMode = false;
    isColorMode1 = true;
    currentColor = COLORS.button1; // Vert clair b7f3e1
    // Mettre à jour la couleur de toutes les tentacules existantes
    for (let point of points) {
      if (point.tentacle) {
        point.tentacle.color = COLORS.button1;
      }
    }
    // Arrêter tous les sons en cours
    for (let sound of sounds) {
      if (sound) sound.stop();
    }
    activeSounds.clear();
    soundStartTimes.clear();

    // Jouer les lettres dans l'ordre
    let currentIndex = 0;
    const playNextLetter = () => {
      if (currentIndex < points.length) {
        const point = points[currentIndex];
        if (point.tentacle) {
          // Jouer le son de la lettre
          const soundIndex =
            point.tentacle.letter.toUpperCase().charCodeAt(0) - 64;
          if (sounds[soundIndex]) {
            sounds[soundIndex].play();
            sounds[soundIndex].setVolume(0.3);

            // Activer l'état de lecture de la tentacule
            point.tentacle.isPlaying = true;
            point.tentacle.playStartTime = Date.now();

            // Arrêter le son après 200ms
            setTimeout(() => {
              sounds[soundIndex].stop();
              point.tentacle.isPlaying = false;
            }, 200);
          }
        }
        currentIndex++;
        // Jouer la prochaine lettre après 250ms
        setTimeout(playNextLetter, 250);
      }
    };

    // Démarrer la séquence
    playNextLetter();
  } else if (key === "2") {
    console.log("🎹 Mode 2 activé - Mode Fibonacci");
    isFibonacciMode = true;
    isSinglePlayMode = false;
    isColorMode1 = false;
    currentColor = COLORS.button2; // Orange eb5629
    // Mettre à jour la couleur de toutes les tentacules existantes
    for (let point of points) {
      if (point.tentacle) {
        point.tentacle.color = COLORS.button2;
      }
    }
    // Arrêter tous les sons en cours
    for (let sound of sounds) {
      if (sound) sound.stop();
    }
    activeSounds.clear();
    soundStartTimes.clear();
  } else if (key === "3") {
    console.log("🎹 Mode 3 activé - Lecture unique x5");
    isFibonacciMode = false;
    isSinglePlayMode = true;
    isColorMode1 = false;
    currentColor = COLORS.button3; // Rouge e93323
    // Mettre à jour la couleur de toutes les tentacules existantes
    for (let point of points) {
      if (point.tentacle) {
        point.tentacle.color = COLORS.button3;
      }
    }
    // Arrêter tous les sons en cours
    for (let sound of sounds) {
      if (sound) sound.stop();
    }
    activeSounds.clear();
    soundStartTimes.clear();

    let sequenceCount = 0;

    const playSequence = () => {
      console.log(`🔄 Séquence ${sequenceCount + 1}/${MAX_SEQUENCES}`);
      let currentIndex = 0;

      const playNextLetter = () => {
        if (currentIndex < points.length) {
          const point = points[currentIndex];
          if (point.tentacle) {
            // Jouer le son de la lettre
            const soundIndex =
              point.tentacle.letter.toUpperCase().charCodeAt(0) - 64;
            if (sounds[soundIndex]) {
              sounds[soundIndex].play();
              sounds[soundIndex].setVolume(0.3);

              // Activer l'état de lecture de la tentacule
              point.tentacle.isPlaying = true;
              point.tentacle.playStartTime = Date.now();

              // Arrêter le son après 200ms
              setTimeout(() => {
                sounds[soundIndex].stop();
                point.tentacle.isPlaying = false;
              }, 200);
            }
          }
          currentIndex++;
          // Jouer la prochaine lettre après 250ms
          setTimeout(playNextLetter, 250);
        } else {
          // Une séquence est terminée
          sequenceCount++;
          if (sequenceCount < MAX_SEQUENCES) {
            // Attendre 500ms avant de commencer la prochaine séquence
            setTimeout(playSequence, 500);
          } else {
            console.log("✅ Toutes les séquences sont terminées");
          }
        }
      };

      // Démarrer la séquence
      playNextLetter();
    };

    // Démarrer la première séquence
    playSequence();
  } else if (key === "r") {
    console.log("🔄 Réinitialisation du séquenceur");
    // R pour réinitialiser
    sequencer.steps = [];
    sequencer.currentStep = 0;
    WordSequencer.resetWordSequencers();
    // Supprimer toutes les séquences supplémentaires
    if (sequencer.sequences) {
      sequencer.sequences = [];
    }
  } else if (key === "+") {
    // + pour augmenter le tempo
    sequencer.bpm = Math.min(200, sequencer.bpm + 10);
    initSequencer();
    // Mettre à jour le tempo de toutes les séquences
    if (sequencer.sequences) {
      for (let sequence of sequencer.sequences) {
        sequence.bpm = sequencer.bpm;
        sequence.stepDuration = 60000 / sequencer.bpm;
      }
    }
  } else if (key === "-") {
    // - pour diminuer le tempo
    sequencer.bpm = Math.max(60, sequencer.bpm - 10);
    initSequencer();
    // Mettre à jour le tempo de toutes les séquences
    if (sequencer.sequences) {
      for (let sequence of sequencer.sequences) {
        sequence.bpm = sequencer.bpm;
        sequence.stepDuration = 60000 / sequencer.bpm;
      }
    }
  }
}

// Ajouter la fonction pour jouer le séquenceur de mots
function playWordSequencer() {
  // Arrêter tous les séquenceurs en cours
  WordSequencer.resetWordSequencers();

  // Créer un nouveau séquenceur avec tous les mots actuels
  let allLetters = [];
  for (let point of points) {
    if (point.tentacle) {
      allLetters.push(point.tentacle.letter);
    }
  }

  // Ajouter les lettres au séquenceur
  for (let letter of allLetters) {
    WordSequencer.addLetterToCurrentSequencer(letter);
  }

  // Démarrer la lecture
  WordSequencer.playCurrentWordSequencer((letter, wordIndex, letterIndex) => {
    // Jouer le son de la lettre et activer l'état de lecture de la tentacule correspondante
    if (soundLoaded && sounds.length > 0) {
      let soundIndex = letter.toUpperCase().charCodeAt(0) - 64;
      if (sounds[soundIndex]) {
        sounds[soundIndex].play();
        sounds[soundIndex].setVolume(0.3);

        // Trouver et activer la tentacule correspondante
        for (let point of points) {
          if (point.tentacle && point.tentacle.letter === letter) {
            point.tentacle.isPlaying = true;
            point.tentacle.playStartTime = Date.now();
            break;
          }
        }
      }
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    // Ne pas ajouter d'espace si on est en train de jouer le séquenceur
    if (!WordSequencer.isPlaying) {
      currentX += letterSpacing;
      // Ajouter l'espace au séquenceur de mots
      WordSequencer.addLetterToCurrentSequencer(" ");
      // Ajouter l'espace au mot courant
      currentWord.push(" ");
      // Jouer le son d'espace
      if (soundLoaded && sounds[0]) {
        try {
          sounds[0].play();
          sounds[0].setVolume(0.2);
        } catch (error) {
          console.error("Erreur lors de la lecture du son d'espace:", error);
        }
      }
    }
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

function createLetterTentacle(letter) {
  resetInactivityTimer();
  if (letter === " ") {
    return;
  }

  if (alphabetPoints[letter]) {
    console.log(`📝 Création d'une nouvelle lettre: ${letter.toUpperCase()}`);

    // Ajouter la lettre au séquenceur de mots
    WordSequencer.addLetterToCurrentSequencer(letter);

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

    // Définir la couleur de la tentacule en fonction du mode
    if (isSinglePlayMode) {
      newTentacle.tentacle.color = COLORS.button3; // Rouge e93323 pour le mode 3
    } else if (isColorMode1) {
      newTentacle.tentacle.color = COLORS.button1; // Vert clair b7f3e1 pour le mode 1
    } else {
      newTentacle.tentacle.color = COLORS.button2; // Orange eb5629 pour le mode 2
    }

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

    // Jouer le son de la lettre
    if (soundLoaded && sounds.length > 0) {
      let soundIndex = letter.toUpperCase().charCodeAt(0) - 64;
      if (sounds[soundIndex]) {
        sounds[soundIndex].play();
        sounds[soundIndex].setVolume(0.3);
        console.log(
          `🎵 Son initial joué - Lettre: ${letter.toUpperCase()}, Volume: 0.3`
        );

        // Si en mode Fibonacci, configurer la répétition uniquement pour la nouvelle lettre
        if (isFibonacciMode) {
          const startTime = Date.now();
          soundStartTimes.set(soundIndex, startTime);
          activeSounds.add(soundIndex);
          console.log(
            `🎼 Mode Fibonacci activé pour la lettre: ${letter.toUpperCase()}`
          );

          let currentInterval = 0;
          const playNext = () => {
            if (Date.now() - startTime >= MAX_SOUND_DURATION) {
              sounds[soundIndex].stop();
              activeSounds.delete(soundIndex);
              soundStartTimes.delete(soundIndex);
              console.log(
                `🔇 Son Fibonacci arrêté - Lettre: ${letter.toUpperCase()}, Durée maximale atteinte`
              );
              return;
            }

            if (currentInterval < FIBONACCI_INTERVALS.length) {
              sounds[soundIndex].play();
              sounds[soundIndex].setVolume(0.3);
              console.log(
                `🔄 Répétition Fibonacci - Lettre: ${letter.toUpperCase()}, Intervalle: ${
                  FIBONACCI_INTERVALS[currentInterval] * 100
                }ms`
              );
              setTimeout(playNext, FIBONACCI_INTERVALS[currentInterval] * 100);
              currentInterval++;
            }
          };

          setTimeout(playNext, FIBONACCI_INTERVALS[0] * 100);
        } else if (isSinglePlayMode) {
          // En mode lecture unique, arrêter le son après 200ms
          setTimeout(() => {
            sounds[soundIndex].stop();
          }, 200);
        }
      }
    }
  }
}

// Modifier la gestion de la molette de la souris
function mouseWheel(event) {
  // Calculer la nouvelle position de défilement
  let newScrollOffset = scrollOffset + event.delta * 0.5; // Réduire la sensibilité

  // Limiter le défilement
  let maxScroll = Math.max(0, currentY - height + letterSpacing * 2);
  scrollOffset = constrain(newScrollOffset, 0, maxScroll);

  return false; // Empêcher le défilement par défaut
}

// Modifier la fonction windowResized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Ajuster la position de défilement lors du redimensionnement
  let maxScroll = Math.max(0, currentY - height + letterSpacing * 2);
  let targetScroll = Math.min(maxScroll, currentY - height / 2);
  scrollOffset = targetScroll;
}

// Fonction pour nettoyer les lettres expirées
function cleanupExpiredLetters() {
  const currentTime = Date.now();

  // Nettoyer les temps de début des lettres expirées
  for (let [letter, startTime] of letterSoundStartTimes.entries()) {
    if (currentTime - startTime > MAX_LETTER_SOUND_DURATION) {
      letterSoundStartTimes.delete(letter);
    }
  }

  // Nettoyer les lettres expirées
  for (let letter in letterStartTime) {
    if (currentTime - letterStartTime[letter] > MAX_LETTER_DURATION) {
      delete letterStartTime[letter];
    }
  }

  // Vérifier l'inactivité
  if (currentTime - lastActivityTime > INACTIVITY_TIMEOUT) {
    stopAllSounds();
  }
}

function stopAllSounds() {
  console.log("🔇 Arrêt de tous les sons - Inactivité détectée");
  // Arrêter tous les sons
  for (let sound of sounds) {
    if (sound) sound.stop();
  }
  activeSounds.clear();
  soundStartTimes.clear();
  letterSoundStartTimes.clear(); // Nettoyer aussi les temps de début des lettres

  // Réinitialiser les états de lecture des tentacules
  for (let point of points) {
    if (point.tentacle) {
      point.tentacle.isPlaying = false;
    }
  }
}

function resetInactivityTimer() {
  lastActivityTime = Date.now();
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  inactivityTimer = setTimeout(stopAllSounds, INACTIVITY_TIMEOUT);
}
