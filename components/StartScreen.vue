<template>
  <div class="start-screen">
    <div class="language-selector">
      <label for="language">LANGUAGE:</label>
      <select id="language" :value="language" @change="$emit('update:language', $event.target.value)">
        <option value="it">🤌 Italiano</option>
        <option value="en">🇬🇧 English</option>
      </select>
    </div>
    <button @click="$emit('startGame')">{{ t('newGame') }}</button>
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
.start-screen {
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