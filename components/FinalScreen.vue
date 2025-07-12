<template>
  <div class="final-screen w-full flex flex-col items-center space-y-6">
    <h1 class="text-3xl font-bold">{{ t('gameOver') }}</h1>
    <div class="score text-2xl font-bold flex items-center gap-3" :class="{'text-error': score < 0, 'text-success': score >= 0}">
      {{ t('finalScore') }}: {{ score }}
      <span v-if="isBestScore" class="badge badge-success text-white px-3 py-1 text-base font-semibold">BEST SCORE</span>
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

    <!-- Leaderboard personale -->
    <div class="mt-8 w-full flex justify-center">
      <PersonalLeaderboard :currentScore="score" />
    </div>

    <!-- Pulsanti -->
    <div class="w-full flex justify-center gap-4 mt-10">
      <button class="btn btn-primary" @click="$emit('restartGame')">{{ t('playAgain') }}</button>
      <button class="btn btn-secondary" @click="goHome">{{ t('backHome') }}</button>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

export default {
  props: ['score', 'results'],
  setup(props) {
    const { t } = useI18n();
    const router = useRouter();
    const leaderboard = ref([]);
    const isBestScore = ref(false);

    const goHome = () => {
      window.location.href = '/wikiguess/';
    };

    // Gestione leaderboard personale
    onMounted(() => {
      const key = 'wikiguess_leaderboard';
      let entries = JSON.parse(localStorage.getItem(key) || '[]');
      // Aggiungi nuovo punteggio con data
      const now = new Date();
      const formattedDate = now.toLocaleString();
      entries.push({ score: props.score, date: formattedDate });
      // Filtra solo oggetti validi
      entries = entries.filter(e => typeof e.score === 'number' && typeof e.date === 'string');
      // Ordina per punteggio decrescente
      entries = entries.sort((a, b) => b.score - a.score).slice(0, 10);
      localStorage.setItem(key, JSON.stringify(entries));
      leaderboard.value = entries;
      isBestScore.value = entries.length > 0 && props.score === entries[0].score;
    });

    return { t, goHome, leaderboard, isBestScore };
  }
};
</script>
