<template>
  <div class="start-screen flex flex-col items-center space-y-6">
    <div class="language-selector form-control w-full max-w-xs">
      <label for="language" class="label">
        <span class="label-text">LANGUAGE:</span>
      </label>
      <select id="language" class="select select-bordered w-full" :value="language" @change="$emit('update:language', $event.target.value)">
        <option value="it">🤌 Italiano</option>
        <option value="en">🇬🇧 English</option>
      </select>
    </div>
    <button class="btn btn-primary w-full" @click="$emit('startGame')">{{ t('newGame') }}</button>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  props: ['language'],
  setup() {
    const { t } = useI18n();
    return { t };
  }
};
</script>

<style scoped>
/* Rimosso il CSS non necessario, ora utilizza solo classi di daisyUI */
</style>