<template>
  <div class="min-h-screen bg-[#F7F9FC] dark:bg-slate-900 pb-28">
    <!-- Main list view -->
    <div v-if="!activeFriend">
      <!-- Header with online count -->
      <div
        class="px-5 pt-6 pb-5 bg-white dark:bg-slate-800 shadow-sm rounded-b-3xl">
        <div class="flex items-center justify-between">
          <div>
            <h1
              class="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span
                class="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200 dark:shadow-none">
                <MessageCircle :size="18" class="text-white" />
              </span>
              Chat
            </h1>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
              <span
                class="inline-flex items-center gap-1 font-bold text-green-500">
                <span
                  class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                {{ onlineFriendsCount }} onlayn
              </span>
              · {{ chatStore.friends.length }} do'st
            </p>
          </div>
          <Transition name="pop">
            <div
              v-if="chatStore.requests.length"
              class="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center relative animate-pop">
              <Mail :size="20" class="text-indigo-500" />
              <span
                class="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pop"
                >{{ chatStore.requests.length }}</span
              >
            </div>
          </Transition>
        </div>
      </div>

      <!-- Friend requests (animated expand) -->
      <Transition name="slide-down">
        <div v-if="chatStore.requests.length" class="mx-4 mt-4">
          <div
            class="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/50 rounded-3xl p-4 shadow-sm">
            <p
              class="text-sm font-black text-indigo-700 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
              <Mail :size="14" /> Do'stlik so'rovlari ({{
                chatStore.requests.length
              }})
            </p>
            <TransitionGroup name="list" tag="div">
              <div
                v-for="req in chatStore.requests"
                :key="req.id"
                class="flex items-center justify-between py-2.5 border-b border-indigo-50 dark:border-indigo-900/30 last:border-0">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div
                    class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {{ (req.profiles?.full_name || "?").charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <p
                      class="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {{ req.profiles?.full_name || "Noma'lum" }}
                    </p>
                    <p
                      class="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {{ req.profiles?.email }}
                    </p>
                  </div>
                </div>
                <button
                  @click="acceptRequest(req)"
                  :disabled="acceptingId === req.id"
                  class="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xs font-bold rounded-xl hover:opacity-90 transition active:scale-95 shadow-md shadow-indigo-100 dark:shadow-none flex-shrink-0 ml-2 disabled:opacity-60">
                  {{ acceptingId === req.id ? "..." : "Qabul" }}
                </button>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </Transition>

      <!-- Add friend: ism YOKI email bilan qidirish -->
      <div class="mx-4 mt-4">
        <div
          class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <p
            class="text-sm font-black text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
            <UserPlus :size="15" class="text-orange-500" /> Do'st qo'shish
          </p>
          <div class="relative">
            <Search
              :size="15"
              class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="friendQuery"
              @input="onSearchInput"
              type="text"
              placeholder="Ism yoki email bilan qidiring..."
              class="w-full pl-10 pr-4 py-2.5 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 transition" />
          </div>

          <!-- Qidiruv natijalari -->
          <div v-if="searchResults.length" class="mt-3 space-y-2">
            <p
              class="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Topildi ({{ searchResults.length }})
            </p>
            <div
              v-for="u in searchResults"
              :key="u.id"
              class="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-2.5">
              <div
                class="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                :class="avatarClass(u.id)">
                <img
                  v-if="u.avatar_url"
                  :src="u.avatar_url"
                  :alt="u.full_name"
                  class="h-full w-full object-cover" />
                <span v-else>{{ u.full_name?.charAt(0) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {{ u.full_name }}
                </p>
                <p
                  v-if="u.email"
                  class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {{ u.email }}
                </p>
              </div>
              <button
                @click="sendRequestTo(u)"
                :disabled="
                  sendingRequest || requestedIds.has(u.id) || friendIds.has(u.id)
                "
                class="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-black rounded-xl hover:opacity-90 transition active:scale-95 shadow-md shadow-orange-100 dark:shadow-none disabled:opacity-50 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none flex-shrink-0">
                {{
                  friendIds.has(u.id)
                    ? "Do'stingiz"
                    : requestedIds.has(u.id)
                      ? "Yuborildi ✓"
                      : "+ Qo'shish"
                }}
              </button>
            </div>
          </div>
          <p v-else-if="searching" class="text-xs text-slate-400 mt-2 animate-pulse">
            Qidirilmoqda...
          </p>

          <Transition name="slide-down">
            <p
              v-if="requestMsg"
              :class="requestMsg.success ? 'text-green-600' : 'text-red-500'"
              class="text-xs mt-2 flex items-center gap-1 font-semibold animate-pop">
              <CheckCircle2 v-if="requestMsg.success" :size="13" />
              <XCircle v-else :size="13" />
              {{ requestMsg.text }}
            </p>
          </Transition>
        </div>
      </div>

      <!-- Friends list -->
      <div class="mx-4 mt-5">
        <p
          class="text-xs font-black uppercase tracking-widest text-slate-400 px-1 mb-2">
          Do'stlar ({{ chatStore.friends.length }})
        </p>
        <TransitionGroup name="list" tag="div" class="space-y-2.5">
          <div
            v-for="friend in chatStore.sortedFriends"
            :key="friend.id"
            @click="openChat(friend)"
            class="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:bg-orange-50/60 dark:hover:bg-slate-700/60 hover:border-orange-200 dark:hover:border-orange-900/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] shadow-sm">
            <div class="relative flex-shrink-0">
              <div
                class="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center text-white text-xl font-black shadow-md"
                :class="avatarClass(friend.id)">
                <img
                  v-if="friend.avatar_url"
                  :src="friend.avatar_url"
                  :alt="friend.full_name"
                  class="h-full w-full object-cover" />
                <span v-else>{{ friend.full_name?.charAt(0) || "?" }}</span>
              </div>
              <span
                v-if="friend.online"
                class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-800 animate-pulse"></span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-slate-900 dark:text-white truncate">
                {{ friend.full_name }}
              </p>
              <p
                class="text-xs truncate"
                :class="
                  friend.online
                    ? 'text-green-600 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                ">
                {{
                  friend.last_message || (friend.online ? "Onlayn" : "Oflayn")
                }}
              </p>
            </div>
            <div class="flex gap-2 items-center flex-shrink-0">
              <Transition name="pop">
                <span
                  v-if="chatStore.unreadByFriend[friend.id]"
                  class="min-w-6 h-6 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center animate-pop">
                  {{ chatStore.unreadByFriend[friend.id] }}
                </span>
              </Transition>
              <button
                @click.stop="inviteToQuiz(friend)"
                class="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition active:scale-95 flex items-center gap-1 flex-shrink-0">
                <Target :size="14" /> <span class="hidden sm:inline">Birga yechish</span><span class="sm:hidden">Test</span>
              </button>
              <ArrowRight :size="17" class="text-orange-400 hidden sm:block" />
            </div>
          </div>
        </TransitionGroup>
        <div
          v-if="chatStore.friends.length === 0"
          class="text-center py-12 text-slate-400 dark:text-slate-500 text-sm animate-fade-in-up">
          <div class="flex justify-center mb-3">
            <span
              class="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Frown :size="28" />
            </span>
          </div>
          Hali do'stlar yo'q. Yuqoridan qo'shing!
        </div>
      </div>
    </div>

    <!-- Chat room: mobileda tab bar (64px) uchun joy qoldiramiz -->
    <div v-else class="flex flex-col h-[calc(100dvh-4rem)] md:h-screen">
      <!-- Header -->
      <div
        class="bg-white dark:bg-slate-800 px-4 py-3.5 shadow-sm flex items-center gap-3 flex-shrink-0 rounded-b-2xl">
        <button
          @click="closeChat"
          class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition active:scale-90">
          <ArrowLeft :size="18" />
        </button>
        <div class="relative">
          <div
            class="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black shadow-md">
            {{ activeFriend.full_name?.charAt(0) }}
          </div>
          <span
            v-if="friendOnline"
            class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-800 animate-pulse"></span>
        </div>
        <div class="min-w-0">
          <p class="font-black text-slate-900 dark:text-white truncate">
            {{ activeFriend.full_name }}
          </p>
          <p
            class="text-xs font-semibold"
            :class="friendOnline ? 'text-green-500' : 'text-slate-400'">
            {{ friendOnline ? "Onlayn" : "Oflayn" }}
          </p>
        </div>
        <button
          @click="inviteToQuiz(activeFriend)"
          class="ml-auto px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition active:scale-95 flex items-center gap-1 flex-shrink-0">
          <Target :size="14" />
          <span class="hidden sm:inline">Birgalikda</span> Test
        </button>
      </div>

      <!-- Messages -->
      <div
        ref="msgContainer"
        class="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 bg-[#F7F9FC] dark:bg-slate-900">
        <div
          v-if="chatStore.messages.length === 0"
          class="text-center py-16 text-slate-400 dark:text-slate-500 text-sm animate-fade-in-up">
          <div class="flex justify-center mb-3">
            <span
              class="w-16 h-16 rounded-3xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center animate-bounce-slow">
              <Hand :size="30" class="text-orange-400" />
            </span>
          </div>
          <p class="font-bold text-slate-500 dark:text-slate-400">
            Salom yozing! 👋
          </p>
          <p class="text-xs mt-1">Birinchi xabarni yuboring</p>
        </div>
        <TransitionGroup name="msg">
          <div
            v-for="msg in chatStore.messages"
            :key="msg.id"
            :class="isMine(msg) ? 'justify-end' : 'justify-start'"
            class="flex items-end gap-1.5">
            <!-- Read avatar for partner messages -->
            <div
              v-if="!isMine(msg)"
              class="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mb-0.5">
              {{ activeFriend.full_name?.charAt(0) }}
            </div>
            <div
              :class="
                isMine(msg)
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md shadow-md shadow-orange-100 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-md shadow-sm border border-slate-100 dark:border-slate-700'
              "
              class="max-w-[75%] px-4 py-2.5 rounded-3xl text-sm">
              <p class="break-words leading-snug">{{ msg.content }}</p>
              <p
                :class="isMine(msg) ? 'text-orange-100/90' : 'text-slate-400'"
                class="text-[10px] mt-1 flex items-center gap-1 justify-end">
                {{ formatTime(msg.created_at) }}
                <CheckCheck v-if="isMine(msg)" :size="12" class="opacity-80" />
              </p>
            </div>
          </div>
        </TransitionGroup>

        <!-- Typing indicator -->
        <div v-if="partnerTyping" class="flex items-end gap-1.5">
          <div
            class="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
            {{ activeFriend.full_name?.charAt(0) }}
          </div>
          <div
            class="bg-white dark:bg-slate-800 rounded-3xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
            <span
              v-for="d in 3"
              :key="d"
              class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-500 animate-bounce-dot"
              :style="{ animationDelay: `${(d - 1) * 0.18}s` }"></span>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div
        class="bg-white dark:bg-slate-800 px-4 py-3 flex gap-2 border-t border-slate-100 dark:border-slate-700 flex-shrink-0 rounded-t-2xl shadow-sm">
        <input
          v-model="newMsg"
          @keyup.enter="sendMsg"
          @input="notifyTyping"
          type="text"
          placeholder="Xabar yozing..."
          class="flex-1 px-4 py-3 text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 transition" />
        <button
          @click="sendMsg"
          :disabled="!newMsg.trim()"
          class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 hover:opacity-90 text-white flex items-center justify-center shadow-md shadow-orange-200 dark:shadow-none transition disabled:opacity-40 active:scale-90 flex-shrink-0">
          <Send :size="18" />
        </button>
      </div>
    </div>

    <!-- Quiz invite modal -->
    <Transition name="pop">
      <div
        v-if="quizInviteSent"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div
          class="bg-white dark:bg-slate-800 rounded-3xl p-7 w-full max-w-sm shadow-2xl text-center animate-pop">
          <div class="flex justify-center mb-4">
            <span
              class="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none animate-bounce-slow">
              <Target :size="30" class="text-white" />
            </span>
          </div>
          <h2 class="text-xl font-black text-slate-900 dark:text-white">
            So'rov yuborildi!
          </h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-2">
            {{ quizInviteSent }} so'rovni qabul qilishini kutmoqda...
          </p>
          <div class="flex justify-center gap-1.5 mt-4">
            <span
              v-for="d in 3"
              :key="d"
              class="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
              :style="{ animationDelay: `${(d - 1) * 0.15}s` }"></span>
          </div>
          <button
            @click="quizInviteSent = ''"
            class="mt-5 w-full px-6 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition">
            Kutishni to'xtatish
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { useChatStore, type Friend } from "../stores/ChatStore";
import { useQuizCoopStore } from "../stores/QuizCoopStore";
import supabase from "../supabase";
import {
  MessageCircle,
  Mail,
  Target,
  ArrowLeft,
  Send,
  Frown,
  Hand,
  CheckCircle2,
  XCircle,
  ArrowRight,
  UserPlus,
  CheckCheck,
  Search,
} from "@lucide/vue";

const router = useRouter();
const chatStore = useChatStore();
const quizCoopStore = useQuizCoopStore();
const activeFriend = ref<Friend | null>(null);
const newMsg = ref("");
const friendQuery = ref("");
const searchResults = ref<any[]>([]);
const searching = ref(false);
const requestedIds = ref<Set<string>>(new Set());
const requestMsg = ref<{ text: string; success: boolean } | null>(null);
const sendingRequest = ref(false);
const acceptingId = ref<string | null>(null);
const quizInviteSent = ref("");
const msgContainer = ref<HTMLElement>();
const currentUserId = ref("");
const partnerTyping = ref(false);

let subscription: any = null;
let requestSubscription: any = null;
let typingChannel: any = null;
let typingTimeout: any = null;
let typingResetTimeout: any = null;

const onlineFriendsCount = computed(
  () => chatStore.friends.filter((f) => f.online).length,
);
const friendOnline = computed(
  () => !!activeFriend.value && chatStore.onlineIds.has(activeFriend.value.id),
);

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  currentUserId.value = user?.id || "";
  await chatStore.fetchFriends();
  await chatStore.fetchRequests();
  // Real-time presence + o'qilmagan xabarlar + kiruvchi do'stlik so'rovlari
  if (currentUserId.value) {
    chatStore.subscribePresence(currentUserId.value);
    chatStore.subscribeUnread(currentUserId.value);
    subscribeToRequests();
  }
});

onUnmounted(() => {
  if (subscription) subscription.unsubscribe();
  if (requestSubscription) supabase.removeChannel(requestSubscription);
  if (typingChannel) supabase.removeChannel(typingChannel);
  chatStore.unsubscribePresence();
});

// Do'stlik so'rovi kelganda DARHOL ko'rinadi (realtime)
const subscribeToRequests = () => {
  requestSubscription = supabase
    .channel(`chat_requests:${currentUserId.value}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "friendships",
        filter: `friend_id=eq.${currentUserId.value}`,
      },
      () => chatStore.fetchRequests(),
    )
    .subscribe();
};

const openChat = async (friend: Friend) => {
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
        const msg = payload.new as any;
        if (!chatStore.messages.some((m) => m.id === msg.id)) {
          chatStore.messages.push(msg);
        }
        scrollBottom();
      },
    )
    .subscribe();
  // Typing indicator: o'zaro broadcast kanal
  typingChannel = supabase.channel(`typing:${room}`, {
    config: { broadcast: { self: false } },
  });
  typingChannel
    .on("broadcast", { event: "typing" }, () => {
      partnerTyping.value = true;
      clearTimeout(typingResetTimeout);
      typingResetTimeout = setTimeout(
        () => (partnerTyping.value = false),
        2200,
      );
    })
    .subscribe();
};

const closeChat = () => {
  activeFriend.value = null;
  partnerTyping.value = false;
  if (subscription) {
    subscription.unsubscribe();
    subscription = null;
  }
  if (typingChannel) {
    supabase.removeChannel(typingChannel);
    typingChannel = null;
  }
};

const notifyTyping = () => {
  if (!typingChannel) return;
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typingChannel?.send({ type: "broadcast", event: "typing" });
  }, 350);
};

const sendMsg = async () => {
  if (!newMsg.value.trim() || !activeFriend.value) return;
  const content = newMsg.value.trim();
  newMsg.value = "";
  await chatStore.sendMessage(content, activeFriend.value.id);
  scrollBottom();
};

// ── Ism/email bilan qidirish (debounce bilan) ─────────────────────
let searchTimeout: any = null;
const onSearchInput = () => {
  clearTimeout(searchTimeout);
  if (friendQuery.value.trim().length < 2) {
    searchResults.value = [];
    return;
  }
  searchTimeout = setTimeout(async () => {
    searching.value = true;
    searchResults.value = await chatStore.searchUsers(friendQuery.value);
    searching.value = false;
  }, 350);
};

// Mavjud do'stlar va yuborilgan so'rovlarni belgilaymiz
const friendIds = computed(
  () => new Set(chatStore.friends.map((f) => f.id)),
);

const sendRequestTo = async (u: any) => {
  sendingRequest.value = true;
  requestMsg.value = null;
  if (await chatStore.existingFriendship(u.id)) {
    requestedIds.value = new Set([...requestedIds.value, u.id]);
    requestMsg.value = { text: "Bu user bilan allaqachon aloqangiz bor", success: false };
    sendingRequest.value = false;
    return;
  }
  const result = await chatStore.sendFriendRequestById(u.id);
  requestMsg.value = result.error
    ? { text: result.error, success: false }
    : { text: `${u.full_name} ga so'rov yuborildi! 🎉`, success: true };
  if (!result.error) requestedIds.value = new Set([...requestedIds.value, u.id]);
  sendingRequest.value = false;
  setTimeout(() => (requestMsg.value = null), 3000);
};

const acceptRequest = async (req: any) => {
  acceptingId.value = req.id;
  await chatStore.acceptRequest(req.id, req.user_id);
  acceptingId.value = null;
};

const inviteToQuiz = async (friend: Friend) => {
  const session = await quizCoopStore.createSession(friend.id);
  if (session) {
    quizInviteSent.value = friend.full_name;
    setTimeout(() => router.push("/quiz-coop"), 1500);
  }
};

const isMine = (msg: any) => msg.user_id === currentUserId.value;

const scrollBottom = () =>
  nextTick(() => {
    if (msgContainer.value)
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
  });

watch(() => chatStore.messages.length, scrollBottom);

const formatTime = (t: string) =>
  new Date(t).toLocaleTimeString("uz", { hour: "2-digit", minute: "2-digit" });

const avatarClass = (id: string) => {
  const colors = [
    "bg-gradient-to-br from-orange-400 to-orange-600",
    "bg-gradient-to-br from-cyan-400 to-blue-600",
    "bg-gradient-to-br from-emerald-400 to-teal-600",
    "bg-gradient-to-br from-violet-400 to-purple-600",
  ];
  return colors[id.charCodeAt(0) % colors.length];
};
</script>

<style scoped>
/* Yangi xabar kirganda uchib keladi */
.msg-enter-active {
  transition: all 0.28s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.msg-leave-active {
  transition: all 0.15s ease;
}

.msg-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.92);
}

.msg-leave-to {
  opacity: 0;
}

/* Ro'yxat elementlari */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.list-move {
  transition: transform 0.3s ease;
}

/* Slide down (bannerlar) */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Pop (badge, modal) */
.pop-enter-active,
.pop-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.6);
}

/* Typing dots */
@keyframes bounceDot {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }

  30% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

.animate-bounce-dot {
  animation: bounceDot 1.1s ease-in-out infinite;
}
</style>
