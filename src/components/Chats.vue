<script setup lang="ts">
import { MessageCircle } from '@lucide/vue';
</script>

<template>
    <RouterLink to="/chat" class="flex items-center justify-center">
        <MessageCircle :size="24" />
    </RouterLink>
</template>
