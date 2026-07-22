<script setup lang="ts">
import { Users } from '@lucide/vue';
</script>

<template>
    <!-- Parent (FAB) already gates visibility by role and supplies the
         circular button classes via attr fallthrough onto this root link,
         so the whole circle is clickable — not just the icon. -->
    <RouterLink to="/groups" class="flex items-center justify-center">
        <Users :size="24" />
    </RouterLink>
</template>
