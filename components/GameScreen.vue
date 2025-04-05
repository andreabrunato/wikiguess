<template>
  <div class="game-screen w-100 flex flex-col items-center space-y-6">
    <!-- Header Section -->
    <div class="header w-full flex justify-between items-center p-4 bg-primary text-primary-content rounded-lg">
      <p>{{ t('round') }}: {{ round }}/{{ roundTotal }}</p>
      <p>{{ t('score') }}: {{ score }}</p>
    </div>

    <!-- Timer Section -->
    <div v-if="gameStarted && !loading && !result" class="timer text-lg font-bold">
      ⏱️ {{ timer.toFixed(2) }}s
    </div>

    <!-- Question Section -->
    <div v-if="gameStarted && !loading && !result && options.length" class="question-section text-center space-y-4">
      <img v-if="imageUrl" :src="imageUrl" alt="Question Image" class="rounded-lg shadow-lg" />
      <p class="text-lg">{{ snippet }}</p>
    </div>

    <!-- Options Section -->
    <div v-if="gameStarted && !loading && !result && options.length" class="options grid grid-cols-2 gap-4 w-full">
      <button v-for="option in options" :key="option" class="btn btn-primary" @click="$emit('checkGuess', option)">
        {{ option.replace(/_/g, ' ') }}
      </button>
    </div>

    <!-- Result Section -->
    <div v-if="result" class="result text-center space-y-4">
      <p class="text-lg font-bold">{{ result }}</p>
      <p v-if="result && timer > 0">⏱️ {{ t('timeTaken') }}: {{ timer.toFixed(2) }}s</p>
      <p v-if="result === t('correct')" class="text-success">+1000 {{ t('points') }}</p>
      <p v-if="timer <= 10 && result === t('correct')" class="text-success">{{ t('timeBonus') }}: +{{ Math.max(0, 10000 - Math.round(timer * 1000)) }}</p>
      <p v-if="result !== t('correct')" class="text-error">-2000 {{ t('points') }}</p>
    </div>

    <!-- Action Buttons -->
    <div class="actions flex space-x-4">
      <button class="btn btn-primary" v-if="result && round < (roundTotal + 1)" @click="$emit('nextRound')">{{ t('nextRound') }}</button>
      <button class="btn btn-primary" v-if="round === (roundTotal + 1)" @click="$emit('newGame')">{{ t('newGame') }}</button>
      <button class="btn btn-success" v-if="!result && round < (roundTotal + 1) && !loading && !imageShown && timer >= 5" @click="$emit('buyImage')">{{ t('buyImage') }}</button>
    </div>
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
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style>