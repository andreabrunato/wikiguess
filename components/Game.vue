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
      <img v-if="imageUrl" :src="imageUrl" :alt="t('imageAlt')" />
      <p>{{ snippet }}</p>
      <div class="guesses" v-if="options.length && !loading && !result">
        <button v-for="option in options" :key="option" @click="checkGuess(option)">
          {{ option.replace(/_/g, ' ') }}
        </button>
      </div>
      <p v-if="result">{{ result }}</p>
      <button v-if="result && round < (roundTotal + 1)" @click="nextRound">{{ t('nextRound') }}</button>
      <button v-if="round === (roundTotal + 1)" @click="newGame">{{ t('newGame') }}</button>
      <button v-if="!result && round < (roundTotal + 1) && !loading && !imageShown" @click="showImage">{{ t('showImage') }}</button>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { fetchRandomPage, fetchRelatedPages } from '../utils/api';

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
      language: 'it' // Default language
    };
  },
  methods: {
    async fetchRandomPageData() {
      this.loading = true;
      try {
        const randomPageData = await fetchRandomPage(this.language);
        this.correctTitle = randomPageData.title;
        this.snippet = this.replaceTitleWords(randomPageData.extract, this.correctTitle);

        this.relatedPages = await fetchRelatedPages(this.language);
        this.createOptions();
      } catch (error) {
        console.error('Errore nel recupero della pagina Wikipedia:', error);
      } finally {
        this.loading = false;
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
      const sanitizedCorrectTitle = this.correctTitle.replace(/\s*\([^)]*\)/g, '');
      if (option === sanitizedCorrectTitle) {
        this.result = this.t('correct');
        this.score += 1000;
      } else {
        this.result = `${this.t('wrong')} ${this.correctTitle}`;
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
      this.locale = this.language; // Assegna direttamente la lingua selezionata
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