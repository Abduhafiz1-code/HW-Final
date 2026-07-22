import { defineStore } from "pinia";
import { ref } from "vue";
import supabase from "../supabase";
import { saveNotification } from "../lib/Notification";
import { useCoinStore } from "./CoinStore";
import { getEventTier } from "../lib/eventTiers";

export const useEventStore = defineStore("event", () => {
  const events = ref<any[]>([]);
  // event_id -> { reward_claimed, score_percent }
  const myParticipation = ref<Record<string, { reward_claimed: boolean; score_percent: number | null }>>({});
  const loading = ref(false);

  // ── Faol event'larni yuklash ───────────────────────────────
  const fetchEvents = async () => {
    loading.value = true;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order("starts_at", { ascending: false });

    events.value = !error && data ? data : [];

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && events.value.length) {
      const { data: parts } = await supabase
        .from("event_participants")
        .select("event_id, reward_claimed, score_percent")
        .eq("user_id", user.id);

      const map: Record<string, { reward_claimed: boolean; score_percent: number | null }> = {};
      (parts ?? []).forEach((p: any) => {
        map[p.event_id] = { reward_claimed: p.reward_claimed, score_percent: p.score_percent ?? null };
      });
      myParticipation.value = map;
    }

    loading.value = false;
  };

  // ── Test/o'yinni yakunlagach, natija foiziga qarab mukofot berish ──
  // percent >= 40 bo'lsa mukofot beriladi va bir marta "tugallangan" deb
  // belgilanadi (qayta urinib, qayta mukofot olib bo'lmaydi). 40% dan
  // past bo'lsa hech narsa yozilmaydi — foydalanuvchi qayta urinishi mumkin.
  const completeEvent = async (eventId: string, percent: number) => {
    const tier = getEventTier(percent);
    if (!tier) return { ok: false as const, reason: "low_score" as const };

    if (myParticipation.value[eventId]?.reward_claimed) {
      return { ok: false as const, reason: "already_claimed" as const };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, reason: "no_user" as const };

    const event = events.value.find((e) => e.id === eventId);

    const { error: upsertError } = await supabase
      .from("event_participants")
      .upsert(
        { event_id: eventId, user_id: user.id, reward_claimed: true, score_percent: Math.round(percent) },
        { onConflict: "event_id,user_id" },
      );

    if (upsertError) {
      console.error("completeEvent error:", upsertError);
      return { ok: false as const, reason: "db_error" as const };
    }

    myParticipation.value = {
      ...myParticipation.value,
      [eventId]: { reward_claimed: true, score_percent: Math.round(percent) },
    };

    const coinStore = useCoinStore();
    const { data: coinRow } = await supabase
      .from("coins")
      .select("coins, diamonds")
      .eq("user_id", user.id)
      .single();

    const newDiamonds = (coinRow?.diamonds ?? 0) + tier.diamonds;
    const newCoins = (coinRow?.coins ?? 0) + tier.coins;
    await supabase
      .from("coins")
      .update({ diamonds: newDiamonds, coins: newCoins })
      .eq("user_id", user.id);
    coinStore.diamonds = newDiamonds;
    coinStore.coins = newCoins;

    await saveNotification(
      user.id,
      "Event mukofoti!",
      `"${event?.title ?? "Event"}" — natija: ${Math.round(percent)}% (${tier.label})`,
      "Gem",
      `+${tier.diamonds} olmos, +${tier.coins} tanga`,
      "bg-cyan-50",
      "text-cyan-500",
      "bg-cyan-50 text-cyan-600",
    );

    return { ok: true as const, tier };
  };

  // ── Event haqida fikr qoldirish (masalan "Fanlar testi" tugagach) ──
  const submitFeedback = async (eventId: string, rating: number, comment: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("event_feedback")
      .upsert(
        { event_id: eventId, user_id: user.id, rating, comment: comment.trim() || null },
        { onConflict: "event_id,user_id" },
      );

    if (error) console.error("submitFeedback error:", error);
    return !error;
  };

  return {
    events,
    myParticipation,
    loading,
    fetchEvents,
    completeEvent,
    submitFeedback,
  };
});
