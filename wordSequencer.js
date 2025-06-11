// wordSequencer.js
// Gestion des séquenceurs de mots pour tentacule_02

// Créer un objet pour stocker toutes les variables et fonctions
const WordSequencer = {
  wordSequencers: [],
  currentWordSequencer: null,
  currentWordLetters: [],
  currentWordIndex: 0,
  isPlaying: false,
  currentTimeout: null,
  FIXED_DELAY: 200, // Délai fixe entre chaque lettre

  // Initialiser un nouveau séquenceur pour un mot
  startNewWordSequencer() {
    if (this.currentWordLetters.length > 0) {
      // Ajouter le mot actuel à la liste des mots
      this.wordSequencers.push({
        letters: [...this.currentWordLetters],
        currentStep: 0,
      });
      // Réinitialiser les lettres du mot courant
      this.currentWordLetters = [];
    }
    // Créer un nouveau séquenceur pour le prochain mot
    this.currentWordSequencer = { letters: [], currentStep: 0 };
  },

  // Ajouter une lettre au séquenceur du mot courant
  addLetterToCurrentSequencer(letter) {
    this.currentWordLetters.push(letter);
  },

  // Jouer le son du mot courant, puis passer au mot suivant
  playCurrentWordSequencer(playLetterCallback) {
    if (this.wordSequencers.length === 0) return;

    // Si déjà en cours de lecture, ne rien faire
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.currentWordIndex = 0;

    const playNextWord = () => {
      if (!this.isPlaying) return;

      const sequencer = this.wordSequencers[this.currentWordIndex];
      if (!sequencer || sequencer.letters.length === 0) {
        this.isPlaying = false;
        return;
      }

      let wordIndex = this.currentWordIndex;
      let i = 0;

      const playNextLetter = () => {
        if (!this.isPlaying) return;

        if (i < sequencer.letters.length) {
          playLetterCallback(sequencer.letters[i], wordIndex, i);
          i++;
          this.currentTimeout = setTimeout(playNextLetter, this.FIXED_DELAY);
        } else {
          // Passer au mot suivant après la lecture du mot
          this.currentWordIndex++;
          if (this.currentWordIndex >= this.wordSequencers.length) {
            this.isPlaying = false;
            return;
          }
          this.currentTimeout = setTimeout(playNextWord, this.FIXED_DELAY);
        }
      };

      playNextLetter();
    };

    playNextWord();
  },

  // Réinitialiser tous les séquenceurs
  resetWordSequencers() {
    // Annuler le timeout en cours si présent
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }

    this.wordSequencers = [];
    this.currentWordLetters = [];
    this.currentWordIndex = 0;
    this.currentWordSequencer = null;
    this.isPlaying = false;
  },

  // Obtenir le nombre total de mots
  getWordCount() {
    return this.wordSequencers.length;
  },

  // Obtenir le mot actuellement joué
  getCurrentWord() {
    return this.currentWordIndex < this.wordSequencers.length
      ? this.wordSequencers[this.currentWordIndex].letters.join("")
      : "";
  },
};

// Export des fonctions
if (typeof window !== "undefined") {
  window.WordSequencer = WordSequencer;
}
