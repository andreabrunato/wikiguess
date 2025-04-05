<template>
  <div class="final-screen">
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
    <button @click="$emit('newGame')">{{ t('newGame') }}</button>
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
.final-screen {
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