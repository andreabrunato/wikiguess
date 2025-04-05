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
      <button @click="newGame">{{ labels.newGame }}</button>
    </div>
    <div v-else>
      <div class="scores">
        <p v-if="round < (roundTotal + 1)">{{ labels.round }}: {{ round }}/{{roundTotal}}</p>
        <p>{{ labels.score }}: {{ score }}</p>
      </div>
      <p v-if="loading">🔃 {{ labels.loading }}</p>
      <img v-if="imageUrl" :src="imageUrl" :alt="labels.imageAlt" />
      <p>{{ snippet }}</p>
      <div class="guesses" v-if="options.length && !loading && !result">
        <button v-for="option in options" :key="option" @click="checkGuess(option)">
          {{ option.replace(/_/g, ' ') }}
        </button>
      </div>
      <p v-if="result">{{ result }}</p>
      <button v-if="result && round < (roundTotal + 1)" @click="nextRound">{{ labels.nextRound }}</button>
      <button v-if="round === (roundTotal + 1)" @click="newGame">{{ labels.newGame }}</button>
      <button v-if="!result && round < (roundTotal + 1) && !loading && !imageShown" @click="showImage">{{ labels.showImage }}</button>
    </div>
  </div>
</template>

<script>
import { fetchRandomPage, fetchRelatedPages } from '../utils/api';

export default {
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
      labels: {
        newGame: 'Nuova partita',
        nextRound: 'Prossimo round',
        showImage: 'Mostra immagine',
        round: 'Round',
        score: 'Punteggio',
        loading: 'Caricamento in corso...',
        imageAlt: 'Immagine da Wikipedia'
      }
    };
  },
  methods: {
    async fetchRandomPageData() {
      this.loading = true;
      try {
        // Fetch a random page summary
        const randomPageResponse = await fetch(`https://${this.language}.wikipedia.org/api/rest_v1/page/random/summary`);
        const randomPageData = await randomPageResponse.json();
        this.correctTitle = randomPageData.title;
        this.snippet = this.replaceTitleWords(randomPageData.extract, this.correctTitle);

        // Fetch additional random pages to replace related pages
        const randomPages = [];
        for (let i = 0; i < 3; i++) {
          const randomPageResponse = await fetch(`https://${this.language}.wikipedia.org/api/rest_v1/page/random/summary`);
          const randomPageData = await randomPageResponse.json();
          randomPages.push({ title: randomPageData.title });
        }

        this.relatedPages = randomPages;

        this.createOptions();
      } catch (error) {
        console.error('Errore nel recupero della pagina Wikipedia:', error);
      } finally {
        this.loading = false;
      }
    },
    createOptions() {
      const relatedTitles = this.relatedPages
        .map(page => (page.title ? page.title.replace(/\s*\([^)]*\)/g, '') : ''))
        .filter(title => title); // Filtra eventuali stringhe vuote
      this.options = [this.correctTitle.replace(/\s*\([^)]*\)/g, ''), ...relatedTitles];

      while (this.options.length < 4) {
        this.options.push(`Risposta casuale ${this.options.length + 1}`);
      }

      this.options = this.shuffleArray(this.options);
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    replaceTitleWords(snippet, title) {
      const titleWords = title.split(' ');
      const regex = new RegExp(`\\b(${titleWords.join('|')})\\b`, 'gi');
      snippet = snippet.replace(regex, '***');
      snippet = snippet.replace(/\*{3}(\s+\*{3})+/g, '***');
      return snippet;
    },
    checkGuess(option) {
      if (option === this.correctTitle) {
        this.result = 'Corretto!';
        this.score += 1000;
      } else {
        this.result = `Sbagliato! La risposta corretta era: ${this.correctTitle}`;
        this.score -= 2000;
      }
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
    newGame() {
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
      this.fetchRandomPageData();
    },
    nextRound() {
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
        this.fetchRandomPageData();
      }
    },
    updateLanguage() {
      if (this.language === 'it') {
        this.labels = {
          newGame: 'Nuova partita',
          nextRound: 'Prossimo round',
          showImage: 'Mostra immagine',
          round: 'Round',
          score: 'Punteggio',
          loading: 'Caricamento in corso...',
          imageAlt: 'Immagine da Wikipedia'
        };
      } else if (this.language === 'en') {
        this.labels = {
          newGame: 'New Game',
          nextRound: 'Next Round',
          showImage: 'Show Image',
          round: 'Round',
          score: 'Score',
          loading: 'Loading...',
          imageAlt: 'Image from Wikipedia'
        };
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