<template>
  <div class="the-game">
    <StartScreen
      v-if="!gameStarted"
      :language="language"
      @updateLanguage="updateLanguage"
      @startGame="newGame"
    />
    <GameScreen
      v-else-if="gameStarted && round <= roundTotal"
      :round="round"
      :roundTotal="roundTotal"
      :score="score"
      :loading="loading"
      :gameStarted="gameStarted"
      :result="result"
      :options="options"
      :timer="timer"
      :imageUrl="imageUrl"
      :snippet="snippet"
      :imageShown="imageShown"
      @checkGuess="checkGuess"
      @nextRound="nextRound"
      @buyImage="buyImage"
    />
    <FinalScreen
      v-else
      :score="score"
      :results="results"
      @newGame="newGame"
    />
  </div>
</template>

<script>
import StartScreen from './StartScreen.vue';
import GameScreen from './GameScreen.vue';
import FinalScreen from './FinalScreen.vue';
import { useI18n } from 'vue-i18n';

export default {
  components: {
    StartScreen,
    GameScreen,
    FinalScreen
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      snippet: '',
      correctTitle: '',
      result: '',
      moreText: '',
      imageUrl: '',
      relatedPages: [],
      options: [],
      score: 0,
      loading: false,
      gameStarted: false,
      round: 0,
      roundTotal: 10,
      imageShown: false,
      language: 'it', // Default language
      timer: 0,
      timerInterval: null,
      preloadedQuestions: [], // Array per memorizzare le domande precaricate
      results: [], // Array per memorizzare i risultati di ogni domanda
      imageLoading: false // Stato per tracciare il caricamento dell'immagine
    };
  },
  methods: {
    async fetchRandomPageData() {
      this.loading = true;
      this.stopTimer(); // Stop any previous timer
      try {
        const randomPageData = await fetchRandomPage(this.language);
        this.correctTitle = randomPageData.title;
        this.snippet = this.replaceTitleWords(randomPageData.extract, this.correctTitle);

        this.relatedPages = await fetchRelatedPages(this.language);
        this.createOptions();
        return {
          correctTitle: this.correctTitle,
          snippet: this.snippet,
          relatedPages: this.relatedPages,
          options: this.options,
        };
      } catch (error) {
        console.error('Errore nel recupero della pagina Wikipedia:', error);
      } finally {
        this.loading = false;
        if (this.options.length) {
          this.startTimer(); // Start the timer when data is ready
        }
      }
    },
    createOptions() {
      const sanitizedCorrectTitle = this.correctTitle.replace(/\s*\([^)]*\)/g, '');
      const relatedTitles = this.relatedPages
        .map(page => page.title?.replace(/\s*\([^)]*\)/g, '') || '')
        .filter(Boolean);

      this.options = [sanitizedCorrectTitle, ...relatedTitles];

      while (this.options.length < 4) {
        this.options.push(this.t('randomAnswer') + ` ${this.options.length + 1}`);
      }

      this.options = this.shuffleArray(this.options);
    },

    shuffleArray(array) {
      return array.sort(() => Math.random() - 0.5);
    },
    replaceTitleWords(snippet, title) {
      const titleWords = title.split(' ');
      const regex = new RegExp(`\\b(${titleWords.join('|')})\\b`, 'gi');
      snippet = snippet.replace(regex, '***');
      snippet = snippet.replace(/\*{3}(\s+\*{3})+/g, '***');
      return snippet;
    },
    checkGuess(option) {
      this.stopTimer();
      const sanitizedCorrectTitle = this.correctTitle.replace(/\s*\([^)]*\)/g, '');
      let points = 0;
      let bonus = 0;

      if (option === sanitizedCorrectTitle) {
        this.result = this.t('correct');
        points = 1000;

        // Calcolo del bonus se la risposta è entro 10 secondi
        if (this.timer <= 10) {
          bonus = Math.max(0, 10000 - Math.round(this.timer * 1000));
          points += bonus;
        }
      } else {
        this.result = `${this.t('wrong')} ${this.correctTitle}`;
        points = -2000;
      }

      this.score += points;

      // Salva i risultati della domanda corrente
      this.results.push({
        question: this.correctTitle.replace(/\*{3}/g, ''), // Rimuove gli asterischi
        time: this.timer,
        bonus,
        points
      });
    },
    async showImage() {
      this.loading = true;
      try {
        this.imageShown = true;
        const response = await fetch(`https://${this.language}.wikipedia.org/api/rest_v1/page/summary/${this.correctTitle}`);
        const data = await response.json();
        this.imageUrl = data.thumbnail ? data.thumbnail.source : '';
        this.score -= 500;
      } catch (error) {
        console.error('Errore nel recupero dell\'immagine:', error);
      } finally {
        this.loading = false;
      }
    },
    async buyImage() {
      this.stopTimer(); // Ferma il timer
      this.loading = true;
      this.imageLoading = true;
      const previousTime = this.timer; // Salva il tempo corrente
      try {
        this.imageShown = true;
        const response = await fetch(`https://${this.language}.wikipedia.org/api/rest_v1/page/summary/${this.correctTitle}`);
        const data = await response.json();
        this.imageUrl = data.thumbnail ? data.thumbnail.source : '';
        this.score -= 500;
      } catch (error) {
        console.error('Errore nel recupero dell\'immagine:', error);
      } finally {
        this.loading = false;
        this.imageLoading = false;
        this.startTimer(previousTime); // Riavvia il timer dal tempo precedente
      }
    },
    async newGame() {
      this.stopTimer();
      this.snippet = '';
      this.correctTitle = '';
      this.result = '';
      this.moreText = '';
      this.imageUrl = '';
      this.relatedPages = [];
      this.options = [];
      this.score = 0;
      this.round = 1;
      this.gameStarted = true;
      this.imageShown = false;
      this.loading = true; // Mostra il loading finché non sono precaricate tutte le domande
      this.preloadedQuestions = []; // Array per memorizzare le domande precaricate
      this.results = []; // Resetta i risultati

      try {
        // Precarica tutte le domande in batch
        const questions = await fetchRandomPagesBatch(this.language, this.roundTotal);
        this.preloadedQuestions = await Promise.all(
          questions.map(async ({ title, extract }) => {
            const relatedPages = await fetchRelatedPages(this.language);
            const sanitizedCorrectTitle = title.replace(/\s*\([^)]*\)/g, '');
            const relatedTitles = relatedPages
              .map(page => page.title?.replace(/\s*\([^)]*\)/g, '') || '')
              .filter(Boolean);

            const options = [sanitizedCorrectTitle, ...relatedTitles];

            while (options.length < 4) {
              options.push(this.t('randomAnswer') + ` ${options.length + 1}`);
            }

            return {
              correctTitle: title,
              snippet: this.replaceTitleWords(extract, title),
              relatedPages,
              options: this.shuffleArray(options),
            };
          })
        );

      } catch (error) {
        console.error('Errore durante la precarica delle domande:', error);
      } finally {
        this.loading = false; // Nasconde il loading una volta completata la precarica
      }

      // Imposta la prima domanda
      this.setQuestion(0);
    },

    setQuestion(index) {
      const question = this.preloadedQuestions[index];
      if (question) {
        this.correctTitle = question.correctTitle;
        this.snippet = question.snippet;
        this.relatedPages = question.relatedPages;
        this.options = question.options;
        this.startTimer(); // Azzerare e riavviare il timer per ogni nuova domanda
      }
    },

    nextRound() {
      this.stopTimer();
      this.snippet = '';
      this.correctTitle = '';
      this.result = '';
      this.moreText = '';
      this.imageUrl = '';
      this.relatedPages = [];
      this.options = [];
      this.round++;
      this.imageShown = false;
      if (this.round < (this.roundTotal + 1)) {
        this.setQuestion(this.round - 1); // Usa la domanda precaricata per il round successivo
      }
    },
    updateLanguage() {
      this.locale = this.language; // Assegna direttamente la lingua selezionata
    },
    startTimer(initialTime = 0) {
      if (this.imageLoading) return; // Non avvia il timer se l'immagine è in caricamento
      this.timer = initialTime; // Imposta il tempo iniziale
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      this.timerInterval = setInterval(() => {
        this.timer += 0.01;
      }, 10);
    },
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }
  }
};
</script>
