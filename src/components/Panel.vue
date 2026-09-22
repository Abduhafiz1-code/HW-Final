<script setup lang="ts">
import { GraduationCap } from "@lucide/vue";
</script>

<template>
  <!-- Parent (FAB) already gates visibility by role and supplies the
         circular button classes via attr fallthrough onto this root link. -->
  <RouterLink to="/teacher" class="flex items-center justify-center">
    <slot>
      <GraduationCap :size="24" />
    </slot>
  </RouterLink>
</template>
