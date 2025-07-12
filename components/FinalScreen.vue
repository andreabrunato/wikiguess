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
      <PersonalLeaderboard :currentScore="score" :leaderboard="leaderboard" />
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
import { ref, onMounted, watch } from 'vue';

export default {
  props: ['score', 'results'],
  setup(props) {
    const { t } = useI18n();
    const router = useRouter();
    // ...structure: variabili leaderboard e isBestScore...
    const leaderboard = ref([]);
    const isBestScore = ref(false);

    const goHome = () => {
      window.location.href = '/wikiguess/';
    };

    // Aggiorna leaderboard locale, salva su localStorage e notifica l'aggiornamento
    const updateLeaderboard = () => {
      const key = 'wikiguess_leaderboard';
      let entries = JSON.parse(localStorage.getItem(key) || '[]');
      const now = new Date();
      const formattedDate = now.toLocaleString();
      // Rimuovi eventuali duplicati con stesso score e data
      entries = entries.filter(e => !(e.score === props.score && e.date === formattedDate));
      entries.push({ score: props.score, date: formattedDate });
      entries = entries.filter(e => typeof e.score === 'number' && typeof e.date === 'string');
      entries = entries.sort((a, b) => b.score - a.score).slice(0, 5);
      leaderboard.value = entries;
      isBestScore.value = entries.length > 0 && props.score === entries[0].score;
      localStorage.setItem(key, JSON.stringify(entries));
      // Notifica aggiornamento leaderboard
      window.dispatchEvent(new CustomEvent('leaderboard-updated'));
    };

    onMounted(updateLeaderboard);
    watch(() => props.score, () => {
      updateLeaderboard();
    });

    return { t, goHome, isBestScore, leaderboard };
  }
};
</script>
