<template>
  <div class="start-screen card shadow-xl p-6">
    <div class="language-selector form-control mb-4">
      <label for="language" class="label">
        <span class="label-text">LANGUAGE:</span>
      </label>
      <select id="language" class="select select-bordered" :value="language" @change="$emit('update:language', $event.target.value)">
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
.start-screen {
  max-width: 600px;
  margin: 40px auto;
}
</style>