import { defineStore } from "pinia";
import { ref, computed } from "vue";
import supabase from "../supabase";

export const useProgressStore = defineStore("progress", () => {
  // ── State ──────────────────────────────
  const totalLessons = ref(0);
  const completedLessons = ref(0);
  const totalQuizzes = ref(0);
  const passedQuizzes = ref(0);
  const loading = ref(false);

  // ── Computed ───────────────────────────
  const progressPercent = computed(() => {
    if (totalLessons.value === 0) return 0;
    const lessonScore = (completedLessons.value / totalLessons.value) * 60;
    const quizScore = totalQuizzes.value
      ? (passedQuizzes.value / totalQuizzes.value) * 40
      : 0;
    return Math.round(lessonScore + quizScore);
  });

  // ── Actions ────────────────────────────
  const fetchProgress = async () => {
    loading.value = true;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      totalLessons.value = data.total_lessons;
      completedLessons.value = data.completed_lessons;
      totalQuizzes.value = data.total_quizzes;
      passedQuizzes.value = data.passed_quizzes;
    } catch (err) {
      console.error("Progress yuklanmadi:", err);
    } finally {
      loading.value = false;
    }
  };

  return {
    totalLessons,
    completedLessons,
    totalQuizzes,
    passedQuizzes,
    loading,
    progressPercent,
    fetchProgress,
  };
});
