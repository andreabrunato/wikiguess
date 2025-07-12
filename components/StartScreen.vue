<template>

  

  <div class="start-screen flex flex-col items-center space-y-8 pt-12">
    <h1 class="text-7xl md:text-9xl font-extrabold text-primary text-center mb-4 tracking-wide">WikiGuess</h1>
    <p class="text-lg md:text-2xl text-center text-gray-500 mb-8">
      A vibe coding quiz game by <a href="https://www.linkedin.com/in/andreabrunato/" target="_blank" rel="noopener" class="underline hover:text-primary">Andrea "Bruno" Brunato</a>
    </p>
    <div class="language-selector form-control w-full max-w-xs">
      <label for="language" class="label">
        <span class="label-text">Select language:</span>
      </label>
      <select id="language" class="select select-bordered w-full" :value="language" @change="$emit('updateLanguage', $event.target.value)">
        <option value="it">Italiano</option>
        <option value="en">English</option>
      </select>
    </div>
    <button class="btn btn-primary" @click="$emit('startGame')">{{ $t('newGame') }}</button>
    <button class="btn btn-outline btn-info flex items-center gap-2 mt-2" @click="showInfo = !showInfo">
      <span class="text-xl">ℹ️</span>
      <span>Info</span>
    </button>
    <transition name="fade">
      <div v-if="showInfo" class="mt-4 p-4 rounded-xl bg-base-200 text-base-content max-w-xl text-left mx-auto shadow" v-html="$t('infoText')"></div>
    </transition>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  props: ['language'],
  data() {
    return {
      showInfo: false
    };
  },
  setup() {
    const { t } = useI18n();
    return { t };
  }
};
</script>

<style scoped>
/* Rimosso il CSS non necessario, ora utilizza solo classi di daisyUI */
</style>