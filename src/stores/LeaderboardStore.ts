import { defineStore } from "pinia";
import { ref } from "vue";
import supabase from "../supabase";

export const useLeaderboardStore = defineStore("leaderboard", () => {
  const users = ref<any[]>([]);
  const loading = ref(false);

  const fetchLeaderboard = async () => {
    loading.value = true;
    try {
      // 1. Coins jadvalidan o'qiymiz
      const { data: coinsData, error } = await supabase
        .from("coins")
        .select("user_id, coins")
        .order("coins", { ascending: false })
        .limit(20);

      if (error) throw error;

      // 2. Har bir user uchun profile olamiz
      const result = await Promise.all(
        (coinsData ?? []).map(async (coin: any) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", coin.user_id)
            .single();
          return {
            user_id: coin.user_id,
            coins: coin.coins ?? 0,
            profiles: profile ?? null,
          };
        }),
      );

      users.value = result;
    } catch (err) {
      console.error("Leaderboard yuklanmadi:", err);
      users.value = [];
    } finally {
      loading.value = false;
    }
  };

  return { users, loading, fetchLeaderboard };
});
