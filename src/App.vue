<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import { computed } from "vue";
import Tab_Bar from "./components/Tab_Bar.vue";

const route = useRoute();
const showTabBar = computed(() => {
  // route.meta can be anything; treat truthy hideTabBar as a signal to hide
  return !(route.meta && (route.meta as any).hideTabBar);
});
</script>

<template>
  <div>
    <RouterView />
    <div v-if="showTabBar">
      <Tab_Bar class="fixed bottom-0" />
    </div>
  </div>
</template>
