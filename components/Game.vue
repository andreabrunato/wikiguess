<template>
  <div class="the-game">
    <div v-if="!gameStarted">
      <div class="language-selector">
        <label for="language">LANGUAGE:</label>
        <select id="language" v-model="language" @change="updateLanguage">
          <option value="it">🤌 Italiano</option>
          <option value="en">🇬🇧 English</option>
        </select>
      </div>
      <button @click="newGame">{{ t('newGame') }}</button>
    </div>
    <div v-else>
      <div class="scores">
        <p v-if="round < (roundTotal + 1)">{{ t('round') }}: {{ round }}/{{roundTotal}}</p>
        <p>{{ t('score') }}: {{ score }}</p>
      </div>
      <p v-if="loading">🔃 {{ t('loading') }}</p>
      <div v-if="gameStarted && !loading && !result && options.length">
        <p v-if="gameStarted && !loading && !result">⏱️ {{ timer.toFixed(2) }}s</p>
        <img v-if="imageUrl" :src="imageUrl" :alt="t('imageAlt')" />
        <p>{{ snippet }}</p>
        <div class="guesses">
          <button v-for="option in options" :key="option" @click="checkGuess(option)">
            {{ option.replace(/_/g, ' ') }}
          </button>
        </div>
      </div>
      <p v-if="result">{{ result }}</p>
      <p v-if="result && timer > 0">⏱️ Tempo impiegato: {{ timer.toFixed(2) }}s</p>
      <div v-if="result">
        <p v-if="result === t('correct')">+1000 {{ t('points') }}</p>
        <p v-if="timer <= 10 && result === t('correct')">Bonus tempo: +{{ Math.max(0, 10000 - Math.round(timer * 1000)) }}</p>
        <p v-if="result !== t('correct')">-2000 {{ t('points') }}</p>
      </div>
      <button v-if="result && round < (roundTotal + 1)" @click="nextRound">{{ t('nextRound') }}</button>
      <button v-if="round === (roundTotal + 1)" @click="newGame">{{ t('newGame') }}</button>
      <button v-if="!result && round < (roundTotal + 1) && !loading && !imageShown" @click="showImage">{{ t('showImage') }}</button>
    </div>
    <div v-if="round === (roundTotal + 1)">
      <h1>{{ t('finalScore') }}: {{ score }}</h1>
      <table>
        <thead>
          <tr>
            <th>{{ t('questionText') }}</th>
            <th>{{ t('timeTaken') }}</th>
            <th>{{ t('timeBonus') }}</th>
            <th>{{ t('pointsEarned') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in results" :key="index">
            <td>{{ result.question }}</td>
            <td>{{ result.time.toFixed(2) }}s</td>
            <td>{{ result.bonus }}</td>
            <td>{{ result.points }}</td>
          </tr>
        </tbody>
      </table>
      <button @click="newGame">{{ t('newGame') }}</button>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { fetchRandomPage, fetchRelatedPages, fetchRandomPagesBatch } from '../utils/api';

export default {
  setup() {
    const { t, locale } = useI18n();
    return { t, locale };
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
      results: [] // Array per memorizzare i risultati di ogni domanda
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
    startTimer() {
      this.timer = 0;
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

<style scoped>
  :root {
    --primary-color: #0070f3;
  }
  body {
    padding: 20px;
    display: flex;
  }
  .the-game {
    font-family: sans-serif;
    font-size: 2rem;
    border: 3px solid #000;
    border-radius: 10px;
    padding: 20px;
    margin: 20px;
    max-width: 1200px;
    margin: 40px auto;
    text-align: center;
  }
  .scores {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    font-weight: bold;
    font-size: 1rem;
  }
  button {
    font-size: 1.2rem;
    font-weight: bold;
    border-radius: 50rem;
    padding: 0.5rem 1rem;
    background: var(--primary-color) !important;
    margin: 0.2rem;
  }
  .guesses {
    margin-bottom: 3rem;
  }
  .guesses button {
    min-width: calc(50% - 0.4rem);
  }
</style>