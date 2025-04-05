<template>
  <div class="final-screen card shadow-xl p-6">
    <h1 class="card-title text-center">{{ t('gameOver') }}</h1>
    <div class="score text-center" :class="{'text-error': score < 0}">
      {{ t('finalScore') }}: {{ score }}
    </div>
    <button class="btn btn-primary w-full mt-4" @click="$emit('restartGame')">{{ t('playAgain') }}</button>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  props: ['score'],
  setup() {
    const { t } = useI18n();
    return { t };
  }
};
</script>

<style scoped>
.final-screen {
  max-width: 600px;
  margin: 40px auto;
}
.score {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>