import { defineStore } from "pinia";
import { ref } from "vue";
import supabase from "../supabase";
import { askAIJson } from "../lib/ai";
import {
  normalizeQuestionList,
  isOpenCorrect,
  mixedQuestionsPrompt,
} from "../lib/question";

export interface CoopSession {
  id: string;
  host_id: string;
  guest_id?: string;
  status: "waiting" | "active" | "finished";
  current_question: number;
  host_score: number;
  guest_score: number;
  questions: any[];
  host_answer?: string | null;
  guest_answer?: string | null;
}

export const useQuizCoopStore = defineStore("quizCoop", () => {
  const session = ref<CoopSession | null>(null);
  const incomingRequests = ref<any[]>([]);
  const loading = ref(false);
  const myAnswer = ref<string | null>(null);
  const partnerAnswer = ref<string | null>(null);
  const myUserId = ref<string | null>(null);
  // Sherik onlaynmi? (Supabase Realtime presence orqali)
  const partnerOnline = ref(false);
  // Realtime ishlamasa ham sessiya ishlashi uchun xavfsizlik polling'i
  const realtimeConnected = ref(false);

  let sessionChannel: any = null;
  let requestsChannel: any = null;
  let fallbackTimer: any = null;
  let requestsTimer: any = null;

  // ---- Fallback polling: postgres_changes oqmasa (masalan, realtime
  // publication'ga jadval qo'shilmagan bo'lsa) sessiya baribir yangilanadi.
  const startFallbackPolling = (sessionId: string) => {
    stopFallbackPolling();
    fallbackTimer = setInterval(async () => {
      if (!session.value) return stopFallbackPolling();
      if (session.value.status === "finished") return;
      await loadSession(sessionId);
    }, 3000);
  };
  const stopFallbackPolling = () => {
    if (fallbackTimer) {
      clearInterval(fallbackTimer);
      fallbackTimer = null;
    }
  };

  // Sessiya ID bo'yicha real-time obuna: status, savol raqami, javoblar
  // o'zgarganda ikkala tomon ham DARHOL yangilanadi (qo'lda "Yangilash" kerak emas).
  const subscribeToSession = (sessionId: string) => {
    unsubscribeSession();
    sessionChannel = supabase
      .channel(`quiz_session:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "quiz_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload: any) => {
          applySessionUpdate(payload.new);
        },
      )
      // Presence: sherik sahifada ekanini jonli ko'rsatish
      .on("presence", { event: "sync" }, () => {
        const state = sessionChannel?.presenceState?.() || {};
        const onlineIds = Object.keys(state);
        partnerOnline.value =
          !!myUserId.value &&
          onlineIds.some((id) => id !== myUserId.value);
      })
      .subscribe((status: string) => {
        realtimeConnected.value = status === "SUBSCRIBED";
        if (status === "SUBSCRIBED") {
          // O'zimni presence'ga qo'shaman — sherik menga "onlayn" ko'radi
          if (myUserId.value)
            sessionChannel?.track({ online_at: new Date().toISOString() });
          stopFallbackPolling();
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          // Realtime uzildi — polling bilan davom etamiz
          startFallbackPolling(sessionId);
        }
      });
    // Xavfsizlik: realtime kanal SUBSCRIBED bo'lsa ham, sessiya
    // "waiting"/"active" ekanida kam signalli polling oqib turadi.
    startFallbackPolling(sessionId);
  };

  // UPDATE payload'ni holatga qo'llash (realtime va polling uchun umumiy)
  const applySessionUpdate = (fresh: CoopSession) => {
    const prevQ = session.value?.current_question;
    session.value = fresh;
    if (!fresh.host_answer && !fresh.guest_answer) {
      myAnswer.value = null;
      partnerAnswer.value = null;
    }
    syncAnswers();
    // Savol o'zgarganda yangi savolni ko'rsatish uchun lokal javoblarni tozalash
    if (prevQ !== undefined && prevQ !== fresh.current_question) {
      myAnswer.value = null;
      partnerAnswer.value = null;
    }
  };

  const unsubscribeSession = () => {
    if (sessionChannel) {
      supabase.removeChannel(sessionChannel);
      sessionChannel = null;
    }
    stopFallbackPolling();
  };

  // Odam so'rov yuborgach (host), guest qabul qilganini kutayotgan payt uchun obuna.
  // Guest status'ni 'active' ga o'zgartirganda host DARHOL bilib, test avtomatik boshlanadi.
  const subscribeToIncoming = (userId: string) => {
    myUserId.value = userId;
    if (requestsChannel) supabase.removeChannel(requestsChannel);
    requestsChannel = supabase
      .channel(`quiz_incoming:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quiz_sessions",
          filter: `guest_id=eq.${userId}`,
        },
        () => fetchMyRequests(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "quiz_sessions",
          filter: `host_id=eq.${userId}`,
        },
        (payload: any) => {
          // Host: guest so'rovni qabul qilib status='active' bo'lganda avtomatik ochiladi
          if (!session.value && payload.new.status === "active") {
            session.value = payload.new;
            subscribeToSession(payload.new.id);
          }
        },
      )
      .subscribe((status: string) => {
        // Realtime oqmasa — 3 sekundda bir qo'lda so'rov yuboramiz
        if (status === "SUBSCRIBED") {
          if (requestsTimer) clearInterval(requestsTimer);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          if (!requestsTimer)
            requestsTimer = setInterval(() => fetchMyRequests(), 3000);
        }
      });
    // Har holda kam signalli zaxira polling (realtime ishlamasa ham so'rovlar ko'rinadi)
    if (!requestsTimer) requestsTimer = setInterval(() => fetchMyRequests(), 4000);
  };

  const syncAnswers = () => {
    if (!session.value || !myUserId.value) return;
    const isHost = myUserId.value === session.value.host_id;
    myAnswer.value =
      (isHost
        ? (session.value as any).host_answer
        : (session.value as any).guest_answer) ?? myAnswer.value;
    partnerAnswer.value =
      (isHost
        ? (session.value as any).guest_answer
        : (session.value as any).host_answer) ?? null;
  };

  const sampleQuestions = [
    { q: "Qaysi son tub son?", options: ["4", "6", "7", "9"], answer: "7" },
    { q: "2 + 2 = ?", options: ["3", "4", "5", "6"], answer: "4" },
    {
      q: "Suv formulasi nima?",
      options: ["H2O", "CO2", "NaCl", "O2"],
      answer: "H2O",
    },
    {
      q: "Quyosh qaysi galaktikada?",
      options: ["Andromeda", "Somon Yo'li", "Triangulum", "Sombrero"],
      answer: "Somon Yo'li",
    },
    {
      q: "Python tili kim tomonidan yaratilgan?",
      options: [
        "Linus Torvalds",
        "Guido van Rossum",
        "Dennis Ritchie",
        "James Gosling",
      ],
      answer: "Guido van Rossum",
    },
  ];

  // Har yangi sessiya uchun AI aralash (variantli + ochiq) savollar tuzadi.
  // AI ishlamasa — sifatli statik savollar zaxira sifatida ishlatiladi.
  const generateQuestions = async (): Promise<any[]> => {
    try {
      const raw = await askAIJson<any[]>(
        mixedQuestionsPrompt("umumiy bilim: matematika, tabiiy fanlar, ingliz tili", 8),
        [],
      );
      const normalized = normalizeQuestionList(raw).slice(0, 8);
      if (normalized.length >= 3) return normalized;
    } catch {
      // AI xatosi — zaxiraga o'tamiz
    }
    return sampleQuestions;
  };

  const createSession = async (guestId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    loading.value = true;
    const { data, error } = await supabase
      .from("quiz_sessions")
      .insert({
        host_id: user.id,
        guest_id: guestId,
        status: "waiting",
        current_question: 0,
        host_score: 0,
        guest_score: 0,
        questions: await generateQuestions(),
      })
      .select()
      .single();
    if (!error) {
      session.value = data;
      myUserId.value = user.id;
      subscribeToSession(data.id); // host darhol guest javobini kutadi
    }
    loading.value = false;
    return data;
  };

  const fetchMyRequests = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    myUserId.value = user.id;
    const { data } = await supabase
      .from("quiz_sessions")
      .select("*, profiles!quiz_sessions_host_id_fkey(full_name)")
      .eq("guest_id", user.id)
      .eq("status", "waiting");
    incomingRequests.value = data || [];
  };

  const acceptSession = async (sessionId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    myUserId.value = user?.id || myUserId.value;
    const { error } = await supabase
      .from("quiz_sessions")
      .update({ status: "active" })
      .eq("id", sessionId);
    if (!error) {
      await loadSession(sessionId);
      subscribeToSession(sessionId); // guest ham darhol keyingi savol/javob yangilanishlarini oladi
    }
  };

  const loadSession = async (sessionId: string) => {
    const { data } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();
    if (data) applySessionUpdate(data as CoopSession);
  };

  const submitAnswer = async (answer: string) => {
    if (!session.value || !myUserId.value) return;
    const isHost = myUserId.value === session.value.host_id;
    // Poyga xatosini oldini olish: avval bazadan ENG YANGI qatorni olib,
    // ballni shu asosda hisoblaymiz (eskirgan local holat bilan emas).
    const { data: fresh } = await supabase
      .from("quiz_sessions")
      .select("*")
      .eq("id", session.value.id)
      .single();
    if (!fresh) return;
    // Shu savolga allaqachon javob bergan bo'lsam, takror yozmaymiz
    const alreadyAnswered = isHost
      ? !!fresh.host_answer
      : !!fresh.guest_answer;
    if (alreadyAnswered) return;
    const currentQ = fresh.questions[fresh.current_question];
    if (!currentQ) return;
    const isCorrect =
      currentQ.type === "open"
        ? isOpenCorrect(answer, currentQ.teacher_answer ?? currentQ.answer)
        : answer === currentQ.answer;
    myAnswer.value = answer;
    const updates: any = {};
    if (isHost) {
      if (isCorrect) updates.host_score = (fresh.host_score || 0) + 1;
      updates.host_answer = answer;
    } else {
      if (isCorrect) updates.guest_score = (fresh.guest_score || 0) + 1;
      updates.guest_answer = answer;
    }
    const { data: updated } = await supabase
      .from("quiz_sessions")
      .update(updates)
      .eq("id", fresh.id)
      .select()
      .single();
    if (updated) applySessionUpdate({ ...fresh, ...updated });

    // Ikkalasi ham javob bergan bo'lsa — SODIQ o'yinchi keyingi savolga
    // ATOMIK o'tkazadi: WHERE current_question = hozirgi. Ikkala tomon ham
    // urinsa, faqat bittasining UPDATE'i o'tadi => savol hech qachon
    // ikki marta sakramaydi va hech qachon "qotib qolmaydi".
    const bothAnswered = isHost
      ? !!(updated as any)?.guest_answer
      : !!(updated as any)?.host_answer;
    if (bothAnswered) await advanceQuestionGuarded(fresh.id, fresh.current_question, fresh.questions.length);
  };

  // Atomic advance: faqat current_question kutayotgan qiymatda bo'lsa o'tadi
  const advanceQuestionGuarded = async (
    sessionId: string,
    expectedIdx: number,
    totalQuestions: number,
  ) => {
    const next = expectedIdx + 1;
    const status = next >= totalQuestions ? "finished" : "active";
    const { data } = await supabase
      .from("quiz_sessions")
      .update({
        current_question: next,
        status,
        host_answer: null,
        guest_answer: null,
      })
      .eq("id", sessionId)
      .eq("current_question", expectedIdx) // poyga himoyasi
      .select();
    if (data && data.length > 0) {
      applySessionUpdate(data[0] as CoopSession);
    }
    // data bo'sh => boshqa o'yinchi allaqachon o'tkazgan (realtime orqali keladi)
  };

  const nextQuestion = async () => {
    if (!session.value) return;
    await advanceQuestionGuarded(
      session.value.id,
      session.value.current_question,
      session.value.questions.length,
    );
  };

  const leaveSession = () => {
    unsubscribeSession();
    if (requestsTimer) {
      clearInterval(requestsTimer);
      requestsTimer = null;
    }
    session.value = null;
    incomingRequests.value = [];
    myAnswer.value = null;
    partnerAnswer.value = null;
    partnerOnline.value = false;
  };

  return {
    session,
    incomingRequests,
    loading,
    myAnswer,
    partnerAnswer,
    myUserId,
    partnerOnline,
    realtimeConnected,
    createSession,
    fetchMyRequests,
    acceptSession,
    loadSession,
    submitAnswer,
    nextQuestion,
    subscribeToSession,
    unsubscribeSession,
    subscribeToIncoming,
    leaveSession,
  };
});
