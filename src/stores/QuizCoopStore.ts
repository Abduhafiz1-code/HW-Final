import { defineStore } from 'pinia';
import { ref } from 'vue';
import supabase from '../supabase';

export interface CoopSession {
  id: string;
  host_id: string;
  guest_id?: string;
  status: 'waiting' | 'active' | 'finished';
  current_question: number;
  host_score: number;
  guest_score: number;
  questions: any[];
}

export const useQuizCoopStore = defineStore('quizCoop', () => {
  const session = ref<CoopSession | null>(null);
  const incomingRequests = ref<any[]>([]);
  const loading = ref(false);
  const myAnswer = ref<string | null>(null);
  const partnerAnswer = ref<string | null>(null);

  const sampleQuestions = [
    { q: 'Qaysi son tub son?', options: ['4', '6', '7', '9'], answer: '7' },
    { q: '2 + 2 = ?', options: ['3', '4', '5', '6'], answer: '4' },
    { q: 'Suv formulasi nima?', options: ['H2O', 'CO2', 'NaCl', 'O2'], answer: 'H2O' },
    { q: 'Quyosh qaysi galaktikada?', options: ['Andromeda', 'Somon Yo\'li', 'Triangulum', 'Sombrero'], answer: 'Somon Yo\'li' },
    { q: 'Python tili kim tomonidan yaratilgan?', options: ['Linus Torvalds', 'Guido van Rossum', 'Dennis Ritchie', 'James Gosling'], answer: 'Guido van Rossum' },
  ];

  const createSession = async (guestId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    loading.value = true;
    const { data, error } = await supabase.from('quiz_sessions').insert({
      host_id: user.id,
      guest_id: guestId,
      status: 'waiting',
      current_question: 0,
      host_score: 0,
      guest_score: 0,
      questions: sampleQuestions
    }).select().single();
    if (!error) session.value = data;
    loading.value = false;
    return data;
  };

  const fetchMyRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('quiz_sessions')
      .select('*, profiles!quiz_sessions_host_id_fkey(full_name)')
      .eq('guest_id', user.id)
      .eq('status', 'waiting');
    incomingRequests.value = data || [];
  };

  const acceptSession = async (sessionId: string) => {
    const { error } = await supabase.from('quiz_sessions').update({ status: 'active' }).eq('id', sessionId);
    if (!error) await loadSession(sessionId);
  };

  const loadSession = async (sessionId: string) => {
    const { data } = await supabase.from('quiz_sessions').select('*').eq('id', sessionId).single();
    if (data) session.value = data;
  };

  const submitAnswer = async (answer: string) => {
    if (!session.value) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    myAnswer.value = answer;
    const isHost = user.id === session.value.host_id;
    const currentQ = session.value.questions[session.value.current_question];
    const isCorrect = answer === currentQ.answer;
    const updates: any = {};
    if (isHost) {
      if (isCorrect) updates.host_score = (session.value.host_score || 0) + 1;
      updates.host_answer = answer;
    } else {
      if (isCorrect) updates.guest_score = (session.value.guest_score || 0) + 1;
      updates.guest_answer = answer;
    }
    await supabase.from('quiz_sessions').update(updates).eq('id', session.value.id);
  };

  const nextQuestion = async () => {
    if (!session.value) return;
    const next = session.value.current_question + 1;
    const status = next >= session.value.questions.length ? 'finished' : 'active';
    await supabase.from('quiz_sessions').update({
      current_question: next, status, host_answer: null, guest_answer: null
    }).eq('id', session.value.id);
    myAnswer.value = null;
    partnerAnswer.value = null;
    await loadSession(session.value.id);
  };

  return { session, incomingRequests, loading, myAnswer, partnerAnswer, createSession, fetchMyRequests, acceptSession, loadSession, submitAnswer, nextQuestion };
});
