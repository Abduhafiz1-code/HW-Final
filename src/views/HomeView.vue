<template>
  <div class="flex min-h-screen flex-col gap-4 bg-[#F7F9FC] pb-28">
    <div class="mx-4 sm:mx-5">
      <Header />
      <div
        class="mt-4 flex justify-between md:flex-row md:items-center md:justify-between">
        <Strike />
        <div class="flex items-center gap-2">
          <RouterLink
            to="/translate"
            class="flex items-center gap-1.5 font-bold text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition"
            >🌐 Tarjimon</RouterLink
          >
          <Bell />
        </div>
      </div>
      <Main />
      <div class="mt-4"><CoinProgress /></div>
      <Premium />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from "../components/Header.vue";
import Main from "../components/HeaderMain.vue";
import Strike from "../components/daily-strike.vue";
import Bell from "../components/Bell__message.vue";
// import Progress from '../components/Progress.vue';
import Premium from "../components/Premium_get.vue";
import CoinProgress from "../components/CoinProgress.vue";
</script>
