import { defineStore } from "pinia";
import { ref, computed } from "vue";
import supabase from "../supabase";

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { full_name: string; avatar_url?: string };
}

export interface Friend {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  status?: string;
  last_message?: string;
  last_message_at?: string;
  unread?: number;
  online?: boolean;
}

export const useChatStore = defineStore("chat", () => {
  const messages = ref<ChatMessage[]>([]);
  const friends = ref<Friend[]>([]);
  const requests = ref<any[]>([]);
  const loading = ref(false);
  const currentRoom = ref("");
  // Haqiqiy onlayn holat: Supabase Realtime presence orqali (friend.id -> true)
  const onlineIds = ref<Set<string>>(new Set());

  /* ---------------- Realtime presence: kim onlayn? ---------------- */
  let presenceChannel: any = null;

  const subscribePresence = async (myUserId: string) => {
    if (presenceChannel) return;
    presenceChannel = supabase.channel("online-users", {
      config: { presence: { key: myUserId } },
    });
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const ids = new Set<string>(Object.keys(state));
        onlineIds.value = ids;
        // Do'stlarga onlayn belgisini yozamiz
        friends.value = friends.value.map((f) => ({
          ...f,
          online: ids.has(f.id),
        }));
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });
  };

  const unsubscribePresence = () => {
    if (presenceChannel) {
      supabase.removeChannel(presenceChannel);
      presenceChannel = null;
    }
  };

  /* ---------------- O'qilmagan xabarlar (realtime) ---------------- */
  // Barcha room'larimizga INSERT tinglaymiz — do'st yozsa badge darhol ko'rinadi.
  let unreadChannel: any = null;
  const unreadByFriend = ref<Record<string, number>>({});

  const subscribeUnread = (myUserId: string) => {
    if (unreadChannel) supabase.removeChannel(unreadChannel);
    unreadChannel = supabase
      .channel(`chat_unread:${myUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: any) => {
          const msg = payload.new as ChatMessage;
          // O'zim yozgan xabar hisobga olinmaydi
          if (msg.user_id === myUserId) return;
          // Hozir ochiq chat bo'lsa — hisobga olinmaydi (o'qilgan bo'ladi)
          if (msg.room_id === currentRoom.value) return;
          // Bu xabar qaysi do'stdan? room_id: "uidA_uidB"
          const [a, b] = msg.room_id.split("_");
          const friendId = a === myUserId ? b : a;
          unreadByFriend.value = {
            ...unreadByFriend.value,
            [friendId]: (unreadByFriend.value[friendId] || 0) + 1,
          };
        },
      )
      .subscribe();
  };

  const clearUnread = (friendId: string) => {
    if (unreadByFriend.value[friendId]) {
      const next = { ...unreadByFriend.value };
      delete next[friendId];
      unreadByFriend.value = next;
    }
  };

  /* ---------------- CRUD ---------------- */
  const fetchFriends = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("friendships")
      .select(
        "friend_id, profiles!friendships_friend_id_fkey(id, full_name, email, avatar_url)",
      )
      .eq("user_id", user.id)
      .eq("status", "accepted");
    const profiles = (data || []).map((d: any) => d.profiles).filter(Boolean);
    const rooms = profiles.map((profile: any) =>
      getRoomId(user.id, profile.id),
    );
    const { data: recentMessages } = rooms.length
      ? await supabase
          .from("messages")
          .select("room_id, content, created_at")
          .in("room_id", rooms)
          .order("created_at", { ascending: false })
      : { data: [] };
    const latestByRoom = new Map<string, any>();
    (recentMessages || []).forEach((message: any) => {
      if (!latestByRoom.has(message.room_id))
        latestByRoom.set(message.room_id, message);
    });
    friends.value = profiles.map((profile: any) => {
      const latest = latestByRoom.get(getRoomId(user.id, profile.id));
      return {
        ...profile,
        last_message: latest?.content || "",
        last_message_at: latest?.created_at,
        online: onlineIds.value.has(profile.id),
      };
    });
  };  const sendFriendRequest = async (targetEmail: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };

    const { data: target } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", targetEmail)
      .single();
    if (!target) return { error: "User not found" };
    if (target.id === user.id)
      return { error: "O'zingizga so'rov yubora olmaysiz" };
    const { error } = await supabase.from("friendships").insert({
      user_id: user.id,
      friend_id: target.id,
      status: "pending",
    });
    return { error: error?.message };
  };

  // Ism yoki email bilan user qidirish → do'stlik so'rovi yuborish uchun
  const searchUsers = async (query: string) => {
    const q = query.trim();
    if (q.length < 2) return [];
    const { data, error } = await supabase.rpc("search_users_by_name", {
      search_query: q,
      limit_count: 8,
    });
    if (error) {
      console.error("search_users_by_name xato:", error.message);
      return [];
    }
    const { data: { user: me } } = await supabase.auth.getUser();
    return (data || []).filter((u: any) => u.id !== me?.id);
  };

  // ID bilan to'g'ridan-to'g'ri do'stlik so'rovi (ism qidiruvidan topilgan userga)
  const sendFriendRequestById = async (targetId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };
    if (targetId === user.id)
      return { error: "O'zingizga so'rov yubora olmaysiz" };
    const { error } = await supabase.from("friendships").insert({
      user_id: user.id,
      friend_id: targetId,
      status: "pending",
    });
    return { error: error?.message };
  };

  // Bir xil do'stlik so'rovini qayta yubormaslik uchun tekshiruv
  const existingFriendship = async (targetId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return true;
    const { data } = await supabase
      .from("friendships")
      .select("id, status, user_id, friend_id")
      .or(
        `and(user_id.eq.${user.id},friend_id.eq.${targetId}),and(user_id.eq.${targetId},friend_id.eq.${user.id})`,
      )
      .limit(1);
    return !!data && data.length > 0;
  };

  const fetchRequests = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("friendships")
      .select(
        "id, user_id, profiles!friendships_user_id_fkey(full_name, email)",
      )
      .eq("friend_id", user.id)
      .eq("status", "pending");
    requests.value = data || [];
  };

  const acceptRequest = async (id: string, userId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", id);
    await supabase
      .from("friendships")
      .insert({ user_id: user.id, friend_id: userId, status: "accepted" });
    await fetchRequests();
    await fetchFriends();
  };

  const getRoomId = (uid1: string, uid2: string) =>
    [uid1, uid2].sort().join("_");

  // Ro'yxat tartibi: 1) onlaynlar tepada, 2) yangi xabar kelganlar,
  // 3) oxirgi xabar vaqti bo'yicha, 4) keyin alfavit
  const sortedFriends = computed(() =>
    [...friends.value].sort((a, b) => {
      if (!!a.online !== !!b.online) return a.online ? -1 : 1;
      const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      if (ta !== tb) return tb - ta;
      return (a.full_name || "").localeCompare(b.full_name || "");
    }),
  );

  const fetchMessages = async (friendId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    currentRoom.value = getRoomId(user.id, friendId);
    const { data } = await supabase
      .from("messages")
      .select("*, profiles(full_name, avatar_url)")
      .eq("room_id", currentRoom.value)
      .order("created_at", { ascending: true });
    messages.value = data || [];
    clearUnread(friendId);
  };

  const sendMessage = async (content: string, friendId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const room = getRoomId(user.id, friendId);
    await supabase
      .from("messages")
      .insert({ room_id: room, user_id: user.id, content });
  };

  return {
    messages,
    friends,
    sortedFriends,
    requests,
    loading,
    currentRoom,
    onlineIds,
    unreadByFriend,
    fetchFriends,
    sendFriendRequest,
    searchUsers,
    existingFriendship,
    sendFriendRequestById,
    fetchRequests,
    acceptRequest,
    fetchMessages,
    sendMessage,
    getRoomId,
    subscribePresence,
    unsubscribePresence,
    subscribeUnread,
    clearUnread,
  };
});
