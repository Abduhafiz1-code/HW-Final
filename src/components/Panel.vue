<script setup lang="ts">
import { useAuthStore } from "../stores/AuthStore";
const authStore = useAuthStore();
</script>

<template>
    <div>
        <router-link v-if="authStore.isTeacher" to="/teacher">
            🧑🏻‍🏫
        </router-link>
    </div>
</template>

<style lang="scss" scoped></style>