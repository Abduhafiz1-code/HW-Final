<script setup lang="ts">
// import { Users } from "@lucide/vue";
import { useAuthStore } from "../stores/AuthStore";
const authStore = useAuthStore();
</script>

<template>
    <div>
        <RouterLink v-if="!authStore.isTeacher" to="/groups">

            👥

        </RouterLink>
    </div>
</template>

<style lang="scss" scoped></style>