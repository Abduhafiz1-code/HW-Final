<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-28">
    <!-- Main list view -->
    <div v-if="!activeFriend">
      <div class="px-5 pt-6 pb-4 bg-white shadow-sm">
        <h1 class="text-2xl font-black text-slate-900 flex items-center gap-2">
          <MessageCircle :size="24" /> Chat
        </h1>
        <p class="text-sm text-slate-500 mt-1">Do'stlar bilan muloqot</p>
      </div>

      <!-- Friend request banner -->
      <div v-if="chatStore.requests.length > 0" class="mx-4 mt-4">
        <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <p class="text-sm font-bold text-indigo-700 mb-2 flex items-center gap-1.5">
            <Mail :size="14" /> Do'stlik so'rovlari ({{ chatStore.requests.length }})
          </p>
          <div v-for="req in chatStore.requests" :key="req.id"
            class="flex items-center justify-between py-2 border-b border-indigo-100 last:border-0">
            <div>
              <p class="font-semibold text-slate-900 text-sm">
                {{ req.profiles?.full_name || "Noma'lum" }}
              </p>
              <p class="text-xs text-slate-500">{{ req.profiles?.email }}</p>
            </div>
            <button @click="chatStore.acceptRequest(req.id, req.user_id)"
              class="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition">
              Qabul
            </button>
          </div>
        </div>
      </div>

      <!-- Add friend -->
      <div class="mx-4 mt-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-4">
          <p class="text-sm font-bold text-slate-700 mb-2">Do'st qo'shish</p>
          <div class="flex gap-2">
            <input v-model="friendEmail" type="email" placeholder="do'st@email.com"
              class="flex-1 px-3 py-2 text-slate-800 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-orange-400" />
            <button @click="sendRequest" :disabled="sendingRequest"
              class="px-4 py-2 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition disabled:opacity-60">
              {{ sendingRequest ? "..." : "Sent" }}
            </button>
          </div>
          <p v-if="requestMsg" :class="requestMsg.success ? 'text-green-600' : 'text-red-500'"
            class="text-xs mt-2 flex items-center gap-1">
            <CheckCircle2 v-if="requestMsg.success" :size="13" />
            <XCircle v-else :size="13" />
            {{ requestMsg.text }}
          </p>
        </div>
      </div>

      <!-- Friends list -->
      <div class="mx-4 mt-4 space-y-2">
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
          Do'stlar ({{ chatStore.friends.length }})
        </p>
        <div v-if="chatStore.friends.length === 0" class="text-center py-10 text-slate-400 text-sm">
          <div class="flex justify-center mb-2">
            <Frown :size="36" />
          </div>
          Hali do'stlar yo'q. Yuqoridan qo'shing!
        </div>
        <div v-for="friend in chatStore.friends" :key="friend.id" @click="openChat(friend)"
          class="flex items-center gap-3 bg-white rounded-2xl border border-slate-200 p-4 cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition active:scale-98">
          <div
            class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-black">
            {{ friend.full_name?.charAt(0) || "?" }}
          </div>
          <div class="flex-1">
            <p class="font-bold text-slate-900">{{ friend.full_name }}</p>
            <p class="text-xs text-slate-500">{{ friend.email }}</p>
          </div>
          <div class="flex gap-2 items-center">
            <button @click.stop="inviteToQuiz(friend)"
              class="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition flex items-center gap-1">
              <Target :size="14" /> Test
            </button>
            <ArrowRight :size="18" class="text-orange-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- Chat room -->
    <div v-else class="flex flex-col h-screen">
      <!-- Header -->
      <div class="bg-white px-4 py-4 shadow-sm flex items-center gap-3 flex-shrink-0">
        <button @click="activeFriend = null"
          class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition">
          <ArrowLeft :size="18" />
        </button>
        <div
          class="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black">
          {{ activeFriend.full_name?.charAt(0) }}
        </div>
        <div>
          <p class="font-bold text-slate-900">{{ activeFriend.full_name }}</p>
          <p class="text-xs text-green-500 font-semibold">Online</p>
        </div>
        <button @click="inviteToQuiz(activeFriend)"
          class="ml-auto px-3 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition flex items-center gap-1">
          <Target :size="14" /> Birgalikda test
        </button>
      </div>

      <!-- Messages -->
      <div ref="msgContainer" class="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F7F9FC]">
        <div v-if="chatStore.messages.length === 0" class="text-center py-10 text-slate-400 text-sm">
          <div class="flex justify-center mb-2">
            <Hand :size="36" />
          </div>
          Salom yozing!
        </div>
        <div v-for="msg in chatStore.messages" :key="msg.id" :class="msg.user_id === currentUserId ? 'justify-end' : 'justify-start'
          " class="flex">
          <div :class="msg.user_id === currentUserId
            ? 'bg-orange-500 text-white rounded-br-sm'
            : 'bg-white text-slate-800 rounded-bl-sm'
            " class="max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm text-sm">
            <p>{{ msg.content }}</p>
            <p :class="msg.user_id === currentUserId
              ? 'text-orange-100'
              : 'text-slate-400'
              " class="text-[10px] mt-1">
              {{ formatTime(msg.created_at) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="bg-white px-4 py-3 flex gap-2 border-t border-slate-100 flex-shrink-0">
        <input v-model="newMsg" @keyup.enter="sendMsg" type="text" placeholder="Xabar yozing..."
          class="flex-1 px-4 py-2.5 text-slate-800 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-orange-400 transition" />
        <button @click="sendMsg" :disabled="!newMsg.trim()"
          class="w-12 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-sm transition disabled:opacity-40 active:scale-95">
          <Send :size="18" />
        </button>
      </div>
    </div>

    <!-- Quiz invite modal -->
    <div v-if="quizInviteSent" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
        <div class="flex justify-center mb-4 text-indigo-500">
          <Target :size="48" />
        </div>
        <h2 class="text-xl font-black text-slate-900">So'rov yuborildi!</h2>
        <p class="text-slate-500 text-sm mt-2">
          {{ quizInviteSent }} so'rovni qabul qilishini kutmoqda...
        </p>
        <button @click="quizInviteSent = ''"
          class="mt-4 px-6 py-2 bg-slate-100 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-200 transition">
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useChatStore } from "../stores/ChatStore";
import { useQuizCoopStore } from "../stores/QuizCoopStore";
import supabase from "../supabase";
import { MessageCircle, Mail, Target, ArrowLeft, Send, Frown, Hand, CheckCircle2, XCircle, ArrowRight } from '@lucide/vue';

const router = useRouter();
const chatStore = useChatStore();
const quizCoopStore = useQuizCoopStore();
const activeFriend = ref<any>(null);
const newMsg = ref("");
const friendEmail = ref("");
const requestMsg = ref<{ text: string; success: boolean } | null>(null);
const sendingRequest = ref(false);
const quizInviteSent = ref("");
const msgContainer = ref<HTMLElement>();
const currentUserId = ref("");

let subscription: any = null;

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  currentUserId.value = user?.id || "";
  await chatStore.fetchFriends();
  await chatStore.fetchRequests();
});

const openChat = async (friend: any) => {
  activeFriend.value = friend;
  await chatStore.fetchMessages(friend.id);
  scrollBottom();
  if (subscription) subscription.unsubscribe();
  const room = chatStore.getRoomId(currentUserId.value, friend.id);
  subscription = supabase
    .channel(`room:${room}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `room_id=eq.${room}`,
      },
      (payload) => {
        // To'liq tarixni qayta so'rov qilish o'rniga, faqat yangi xabarni qo'shamiz -> darhol ko'rinadi
        const msg = payload.new as any;
        if (!chatStore.messages.some((m) => m.id === msg.id)) {
          chatStore.messages.push(msg);
        }
        scrollBottom();
      },
    )
    .subscribe();
};

const sendMsg = async () => {
  if (!newMsg.value.trim() || !activeFriend.value) return;
  const content = newMsg.value.trim();
  newMsg.value = "";
  await chatStore.sendMessage(content, activeFriend.value.id);
  // Real-time subscription orqali xabar allaqachon qo'shiladi, qayta fetch shart emas
  scrollBottom();
};

const sendRequest = async () => {
  sendingRequest.value = true;
  requestMsg.value = null;
  const result = await chatStore.sendFriendRequest(friendEmail.value);
  requestMsg.value = result.error
    ? { text: result.error, success: false }
    : { text: "So'rov yuborildi!", success: true };
  if (!result.error) friendEmail.value = "";
  sendingRequest.value = false;
  setTimeout(() => (requestMsg.value = null), 3000);
};

const inviteToQuiz = async (friend: any) => {
  const session = await quizCoopStore.createSession(friend.id);
  if (session) {
    quizInviteSent.value = friend.full_name;
    setTimeout(() => router.push("/quiz-coop"), 1500);
  }
};

const scrollBottom = () =>
  nextTick(() => {
    if (msgContainer.value)
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
  });
const formatTime = (t: string) =>
  new Date(t).toLocaleTimeString("uz", { hour: "2-digit", minute: "2-digit" });
</script>
