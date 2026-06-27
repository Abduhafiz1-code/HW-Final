import { defineStore } from "pinia";
import { ref } from "vue";
import supabase from "../supabase";

export const useHistoryStore = defineStore("history", () => {
  const quizHistory = ref<any[]>([]);
  const loading = ref(false);

  const fetchQuizHistory = async () => {
    loading.value = true;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        quizHistory.value = [];
        console.log("User is not authenticated");
        return;
      }

      const { data, error } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Supabase error:", error);
        throw error;
      }

      console.log("Data fetched from Supabase:", data);
      quizHistory.value = data || [];
    } catch (err) {
      console.error("History yuklanmadi:", err);
      quizHistory.value = [];
    } finally {
      loading.value = false;
    }
  };

  return {
    quizHistory,
    loading,
    fetchQuizHistory,
  };
});
