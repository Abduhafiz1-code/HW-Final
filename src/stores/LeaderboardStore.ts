import { defineStore } from "pinia";
import { ref } from "vue";
import supabase from "../supabase";

export type LeaderboardPeriod = "week" | "month" | "all";

export const useLeaderboardStore = defineStore("leaderboard", () => {
  const users = ref<any[]>([]);
  const loading = ref(false);
  const period = ref<LeaderboardPeriod>("all");
  const error = ref(false);

  // Joriy foydalanuvchining o'z o'rni (top-50 dan tashqarida bo'lsa ham)
  const myRank = ref<number | null>(null);
  const myTotal = ref(0);
  const myRow = ref<any>(null);
  const myUserId = ref<string | null>(null);

  const fetchLeaderboard = async (newPeriod?: LeaderboardPeriod) => {
    if (newPeriod) period.value = newPeriod;
    loading.value = true;
    error.value = false;
    try {
      // Bitta server-side RPC chaqiruvi — avvalgi versiya har bir
      // foydalanuvchi uchun alohida `profiles` so'rovi yuborardi (1+20 ta
      // so'rov), bundan tashqari `coins` jadvalidagi RLS avval faqat
      // egasining o'z qatorini o'qishga ruxsat berardi, ya'ni boshqa
      // foydalanuvchilar reytingda umuman ko'rinmasdi. get_leaderboard()
      // RPC ikkalasini ham hal qiladi (SUPABASE_UPDATE_2.sql'ni ishga
      // tushiring).
      //
      // get_leaderboard_period (SUPABASE_UPDATE_10/13.sql): 'week' / 'month'
      // davrlari test ballari bo'yicha tartiblaydi + total_tests/avg_percent.
      let { data, error: rpcError } = await supabase.rpc(
        "get_leaderboard_period",
        {
          period: period.value,
          limit_count: 50,
        },
      );

      if (rpcError) {
        // Eski bazada yangi RPC bo'lmasa — umumiy reytingga qaytamiz
        const fallback = await supabase.rpc("get_leaderboard", {
          limit_count: 50,
        });
        if (fallback.error) throw fallback.error;
        data = fallback.data as any;
      }

      users.value = (data ?? [])
        .filter((row: any) => !isPlaceholderName(row.full_name))
        .map((row: any) => ({
          user_id: row.user_id,
          coins: row.coins ?? 0,
          diamonds: row.diamonds ?? 0,
          period_points: row.period_points ?? 0,
          // SUPABASE_UPDATE_13: test soni + o'rtacha foiz (AI + ustoz testlari JAMI)
          total_tests: row.total_tests ?? 0,
          avg_percent: row.avg_percent ?? 0,
          profiles: {
            full_name: row.full_name,
            avatar_url: row.avatar_url,
            avatar_frame: row.avatar_frame,
          },
        }));

      // ---- Mening o'rnim (SUPABASE_UPDATE_14: get_user_rank) ----
      myRank.value = null;
      myRow.value = null;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      myUserId.value = user?.id ?? null;

      if (user) {
        const inList = users.value.find((u) => u.user_id === user.id);
        try {
          const { data: rk, error: rkErr } = await supabase.rpc(
            "get_user_rank",
            { period: period.value },
          );
          if (rkErr || !rk) throw rkErr;
          myRow.value = rk;
          myRank.value = rk.rank ?? null;
          myTotal.value = rk.total_users ?? 0;
        } catch {
          // RPC bo'lmasa (eski baza) — ro'yxatdan topib taxminiy o'rin
          if (inList) {
            myRank.value = users.value.indexOf(inList) + 1;
            myTotal.value = users.value.length;
            myRow.value = inList;
          }
        }
      }
    } catch (err) {
      console.error("Leaderboard yuklanmadi:", err);
      users.value = [];
      error.value = true;
    } finally {
      loading.value = false;
    }
  };

  const isPlaceholderName = (name: string | null | undefined) => {
    const normalized = (name || "").trim().toLowerCase();
    return (
      normalized === "test" ||
      normalized.startsWith("test ") ||
      normalized.includes("asferdgt")
    );
  };

  return {
    users,
    loading,
    period,
    error,
    fetchLeaderboard,
    myRank,
    myTotal,
    myRow,
    myUserId,
  };
});
