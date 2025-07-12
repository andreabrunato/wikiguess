<template>
  <div class="leaderboard w-full max-w-2xl">
    <h2 class="text-xl font-semibold mb-4 text-center">{{ t('personalLeaderboard') }}</h2>
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>#</th>
          <th>{{ t('date') }}</th>
          <th>{{ t('score') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(entry, idx) in leaderboard" :key="idx">
          <td>{{ idx + 1 }}</td>
          <td class="text-sm">{{ entry.date }}</td>
          <td :class="{'text-success': entry.score >= 0, 'text-error': entry.score < 0, 'font-bold': entry.score === currentScore, 'text-lg': true}">{{ entry.score }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  props: {
    currentScore: {
      type: Number,
      default: null
    }
  },
  setup(props) {
    const { t } = useI18n();
    const leaderboard = ref([]);

    onMounted(() => {
      const key = 'wikiguess_leaderboard';
      let entries = JSON.parse(localStorage.getItem(key) || '[]');
      entries = entries.filter(e => typeof e.score === 'number' && typeof e.date === 'string');
      entries = entries.sort((a, b) => b.score - a.score).slice(0, 10);
      leaderboard.value = entries;
    });

    return { t, leaderboard, currentScore: props.currentScore };
  }
};
</script>
