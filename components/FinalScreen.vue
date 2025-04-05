<template>
  <div class="final-screen w-full flex flex-col items-center space-y-6">
    <h1 class="text-3xl font-bold">{{ t('gameOver') }}</h1>
    <div class="score text-2xl font-bold" :class="{'text-error': score < 0, 'text-success': score >= 0}">
      {{ t('finalScore') }}: {{ score }}
    </div>

    <!-- Score Table -->
    <div class="score-table w-full max-w-2xl overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ t('question') }}</th>
            <th>{{ t('time') }}</th>
            <th>{{ t('bonus') }}</th>
            <th>{{ t('points') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in results" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ result.question }}</td>
            <td>{{ result.time.toFixed(2) }}s</td>
            <td>{{ result.bonus }}</td>
            <td :class="{'text-error': result.points < 0, 'text-success': result.points >= 0}">{{ result.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <button class="btn btn-primary" @click="$emit('restartGame')">{{ t('playAgain') }}</button>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  props: ['score', 'results'],
  setup() {
    const { t } = useI18n();
    return { t };
  }
};
</script>

<style scoped>
/* Rimosso il CSS non necessario, ora utilizza solo classi di daisyUI */
</style>