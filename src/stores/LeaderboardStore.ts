import { defineStore } from "pinia";
import { ref } from "vue";
import supabase from "../supabase";

export const useLeaderboardStore = defineStore("leaderboard", () => {
  const users = ref<any[]>([]);
  const loading = ref(false);

  const fetchLeaderboard = async () => {
    loading.value = true;
    try {
      // Bitta server-side RPC chaqiruvi — avvalgi versiya har bir
      // foydalanuvchi uchun alohida `profiles` so'rovi yuborardi (1+20 ta
      // so'rov), bundan tashqari `coins` jadvalidagi RLS avval faqat
      // egasining o'z qatorini o'qishga ruxsat berardi, ya'ni boshqa
      // foydalanuvchilar reytingda umuman ko'rinmasdi. get_leaderboard()
      // RPC ikkalasini ham hal qiladi (SUPABASE_UPDATE_2.sql'ni ishga
      // tushiring).
      const { data, error } = await supabase.rpc("get_leaderboard", {
        limit_count: 20,
      });

      if (error) throw error;

      users.value = (data ?? []).map((row: any) => ({
        user_id: row.user_id,
        coins: row.coins ?? 0,
        diamonds: row.diamonds ?? 0,
        profiles: {
          full_name: row.full_name,
          avatar_url: row.avatar_url,
          avatar_frame: row.avatar_frame,
        },
      }));
    } catch (err) {
      console.error("Leaderboard yuklanmadi:", err);
      users.value = [];
    } finally {
      loading.value = false;
    }
  };

  return { users, loading, fetchLeaderboard };
});
