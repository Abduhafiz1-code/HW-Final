import { defineStore } from "pinia";
import { ref, computed } from "vue";
import supabase from "../supabase";
import { saveNotification } from "../lib/Notification";

export const useCoinStore = defineStore("coin", () => {
  const coins = ref(0);
  const progress = ref(0);
  const claimedMilestones = ref<number[]>([]);
  const loading = ref(false);

  const cyclePercent = computed(() => {
    const p = progress.value % 100;
    return p === 0 && progress.value > 0 ? 100 : p;
  });

  const canClaimMilestone = (m: number) =>
    progress.value >= m && !claimedMilestones.value.includes(m);

  // ── Fetch & streak tekshiruvi ──────────────────────────────
  const fetchCoins = async () => {
    loading.value = true;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      loading.value = false;
      return;
    }

    const { data, error } = await supabase
      .from("coins")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const today = new Date().toDateString();

    if (error || !data) {
      // Yangi foydalanuvchi
      await supabase.from("coins").insert({
        user_id: user.id,
        coins: 0,
        progress: 0,
        claimed_milestones: [],
        last_seen: today,
        streak_days: 1,
      });
      coins.value = 0;
      progress.value = 0;
      claimedMilestones.value = [];
    } else {
      coins.value = data.coins ?? 0;
      progress.value = data.progress ?? 0;
      claimedMilestones.value = data.claimed_milestones ?? [];

      // Streak tekshiruvi
      await checkStreak(user.id, data.last_seen, data.streak_days ?? 1, today);
    }

    loading.value = false;
  };

  // ── Streak: 3 kun kelmasa -15 tanga ───────────────────────
  const checkStreak = async (
    userId: string,
    lastSeen: string,
    streakDays: number,
    today: string,
  ) => {
    if (lastSeen === today) return; // Bugun allaqachon kirgan

    const last = new Date(lastSeen);
    const now = new Date(today);
    const diffDays = Math.round(
      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
    );

    let newStreak = streakDays;
    let newCoins = coins.value;
    let penaltyApplied = false;

    if (diffDays >= 3) {
      // 3 yoki undan ko'p kun kelmagan — jazo
      const penalty = 30; // 30 tanga yechiladi
      newCoins = Math.max(0, coins.value - penalty);
      newStreak = 1;
      penaltyApplied = true;
      coins.value = newCoins;
    } else if (diffDays === 1) {
      // Ketma-ket kun
      newStreak = streakDays + 1;
    } else {
      // 2 kun o'tdi lekin hali jazo yo'q
      newStreak = 1;
    }

    await supabase
      .from("coins")
      .update({
        last_seen: today,
        streak_days: newStreak,
        ...(penaltyApplied ? { coins: newCoins } : {}),
      })
      .eq("user_id", userId);

    if (penaltyApplied) {
      await saveNotification(
        userId,
        "3 kun kelmadingiz! 😔",
        `${diffDays} kun yo'q edingiz — 30 tanga yechildi`,
        "😔",
        "-30 🪙",
        "bg-red-50",
        "text-red-500",
        "bg-red-50 text-red-900",
      );
    }
  };

  // ── Progress qo'shish ──────────────────────────────────────
  const addProgress = async (amount: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const newProgress = progress.value + amount; // Cheksiz o'sadi
    progress.value = newProgress;

    await supabase
      .from("coins")
      .update({ progress: newProgress })
      .eq("user_id", user.id);
  };

  // ── Milestone olish ────────────────────────────────────────
  const claimMilestone = async (milestone: number) => {
    if (!canClaimMilestone(milestone)) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const reward = 10;
    const newCoins = coins.value + reward;
    const newClaimed = [...claimedMilestones.value, milestone];

    coins.value = newCoins;
    claimedMilestones.value = newClaimed;

    const { error } = await supabase
      .from("coins")
      .update({
        coins: newCoins,
        claimed_milestones: newClaimed,
      })
      .eq("user_id", user.id);

    if (error) {
      console.error("claimMilestone error:", error);
      return;
    }

    await saveNotification(
      user.id,
      `+10 tanga qo'lga kiritildi! 🪙`,
      `${milestone} progress milestone mukofoti`,
      "🪙",
      "+10 🪙",
      "bg-amber-50",
      "text-amber-500",
      "bg-amber-50 text-amber-600",
    );

    // 100 tanga bonusini tekshir
    await checkCoinBonus(user.id, newCoins);
  };

  // ── 100 tanga bonus (+15) ──────────────────────────────────
  const checkCoinBonus = async (userId: string, currentCoins: number) => {
    if (currentCoins < 100) return;

    const bonusKey = `coin_bonus_100_${userId}`;
    if (localStorage.getItem(bonusKey)) return;

    const bonusCoins = currentCoins + 15;
    coins.value = bonusCoins;

    await supabase
      .from("coins")
      .update({ coins: bonusCoins })
      .eq("user_id", userId);
    localStorage.setItem(bonusKey, "1");

    await saveNotification(
      userId,
      "100 tanga bonusi! 🎉",
      "Tabriklaymiz! 100 tangaga yetdingiz — sizga 15 bonus tanga!",
      "🎉",
      "+15 🪙",
      "bg-green-50",
      "text-green-500",
      "bg-green-50 text-green-600",
    );
  };

  return {
    coins,
    progress,
    claimedMilestones,
    loading,
    cyclePercent,
    canClaimMilestone,
    fetchCoins,
    addProgress,
    claimMilestone,
  };
});
