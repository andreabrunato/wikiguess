<template>
  <div class="game-screen">
    <div class="scores">
      <p v-if="round < (roundTotal + 1)">{{ t('round') }}: {{ round }}/{{roundTotal}}</p>
      <p>{{ t('score') }}: {{ score }}</p>
    </div>
    <p v-if="loading">🔃 {{ t('loading') }}</p>
    <div v-if="gameStarted && !loading && !result && options.length">
      <p v-if="gameStarted && !loading && !result">⏱️ {{ timer.toFixed(2) }}s</p>
      <img v-if="imageUrl" :src="imageUrl" alt="" />
      <p>{{ snippet }}</p>
      <div class="guesses grid grid-cols-2 gap-4">
        <button v-for="option in options" :key="option" class="btn btn-primary" @click="$emit('checkGuess', option)">
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
    <button class="btn btn-primary" v-if="result && round < (roundTotal + 1)" @click="$emit('nextRound')">{{ t('nextRound') }}</button>
    <button class="btn btn-primary" v-if="round === (roundTotal + 1)" @click="$emit('newGame')">{{ t('newGame') }}</button>
    <button class="btn btn-success" v-if="!result && round < (roundTotal + 1) && !loading && !imageShown && timer >= 5" @click="$emit('buyImage')">{{ t('buyImage') }}</button>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  props: ['round', 'roundTotal', 'score', 'loading', 'gameStarted', 'result', 'options', 'timer', 'imageUrl', 'snippet', 'imageShown'],
  setup() {
    const { t } = useI18n();
    return { t };
  }
};
</script>

<style scoped>
.game-screen {
  text-align: center;
  font-family: sans-serif;
  font-size: 2rem;
  border: 3px solid #000;
  border-radius: 10px;
  padding: 20px;
  margin: 20px;
  max-width: 1200px;
  margin: 40px auto;
}
</style>