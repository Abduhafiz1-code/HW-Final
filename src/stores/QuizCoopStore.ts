import { defineStore } from "pinia";
import { ref } from "vue";
import supabase from "../supabase";

export interface CoopSession {
  id: string;
  host_id: string;
  guest_id?: string;
  status: "waiting" | "active" | "finished";
  current_question: number;
  host_score: number;
  guest_score: number;
  questions: any[];
}

export const useQuizCoopStore = defineStore("quizCoop", () => {
  const session = ref<CoopSession | null>(null);
  const incomingRequests = ref<any[]>([]);
  const loading = ref(false);
  const myAnswer = ref<string | null>(null);
  const partnerAnswer = ref<string | null>(null);
  const myUserId = ref<string | null>(null);

  let sessionChannel: any = null;
  let requestsChannel: any = null;

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
          session.value = payload.new;
          if (!payload.new.host_answer && !payload.new.guest_answer) {
            myAnswer.value = null;
            partnerAnswer.value = null;
          }
          syncAnswers();
        },
      )
      .subscribe();
  };

  const unsubscribeSession = () => {
    if (sessionChannel) {
      supabase.removeChannel(sessionChannel);
      sessionChannel = null;
    }
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
      .subscribe();
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
        questions: sampleQuestions,
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
    if (data) session.value = data;
  };

  const submitAnswer = async (answer: string) => {
    if (!session.value || !myUserId.value) return;
    const isHost = myUserId.value === session.value.host_id;
    const currentQ = session.value.questions[session.value.current_question];
    const isCorrect = answer === currentQ.answer;
    myAnswer.value = answer;
    const updates: any = {};
    if (isHost) {
      if (isCorrect) updates.host_score = (session.value.host_score || 0) + 1;
      updates.host_answer = answer;
    } else {
      if (isCorrect) updates.guest_score = (session.value.guest_score || 0) + 1;
      updates.guest_answer = answer;
    }
    await supabase
      .from("quiz_sessions")
      .update(updates)
      .eq("id", session.value.id);

    // Ikkalasi ham javob bergan bo'lsa, avtomatik keyingi savolga o'tadi (hostdan qat'iy nazar)
    const bothAnswered = isHost
      ? !!(session.value as any).guest_answer
      : !!(session.value as any).host_answer;
    if (bothAnswered) await nextQuestion();
  };

  const nextQuestion = async () => {
    if (!session.value) return;
    const next = session.value.current_question + 1;
    const status =
      next >= session.value.questions.length ? "finished" : "active";
    await supabase
      .from("quiz_sessions")
      .update({
        current_question: next,
        status,
        host_answer: null,
        guest_answer: null,
      })
      .eq("id", session.value.id);
    myAnswer.value = null;
    partnerAnswer.value = null;
    await loadSession(session.value.id);
  };

  const leaveSession = () => {
    unsubscribeSession();
    session.value = null;
    myAnswer.value = null;
    partnerAnswer.value = null;
  };

  return {
    session,
    incomingRequests,
    loading,
    myAnswer,
    partnerAnswer,
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
