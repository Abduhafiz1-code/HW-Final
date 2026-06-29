<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 pb-28">
    <div class="max-w-7xl mx-auto px-4 md:px-8 py-4">

      <Header />

      <!-- Strike alohida qatorda -->




      <!-- Tugmalar alohida qatorda, o'ngga -->
      <div class="mt-2 flex items-center justify-between gap-2">
        <Strike />




        <Bell />

      </div>

      <div class="mt-6">
        <Main />
      </div>

      <div class="mt-6 grid grid-cols-1 gap-6">
        <CoinProgress />
        <Premium />
      </div>

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
