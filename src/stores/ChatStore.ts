import { defineStore } from 'pinia';
import { ref } from 'vue';
import supabase from '../supabase';

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
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([]);
  const friends = ref<Friend[]>([]);
  const requests = ref<any[]>([]);
  const loading = ref(false);
  const currentRoom = ref('');

  const fetchFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('friendships')
      .select('friend_id, profiles!friendships_friend_id_fkey(id, full_name, email, avatar_url)')
      .eq('user_id', user.id)
      .eq('status', 'accepted');
    friends.value = (data || []).map((d: any) => d.profiles).filter(Boolean);
  };

  const sendFriendRequest = async (targetEmail: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not logged in' };
    const { data: target } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', targetEmail)
      .single();
    if (!target) return { error: 'User not found' };
    const { error } = await supabase.from('friendships').insert({
      user_id: user.id, friend_id: target.id, status: 'pending'
    });
    return { error: error?.message };
  };

  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('friendships')
      .select('id, user_id, profiles!friendships_user_id_fkey(full_name, email)')
      .eq('friend_id', user.id)
      .eq('status', 'pending');
    requests.value = data || [];
  };

  const acceptRequest = async (id: string, userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id);
    await supabase.from('friendships').insert({ user_id: user.id, friend_id: userId, status: 'accepted' });
    await fetchRequests();
    await fetchFriends();
  };

  const getRoomId = (uid1: string, uid2: string) =>
    [uid1, uid2].sort().join('_');

  const fetchMessages = async (friendId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    currentRoom.value = getRoomId(user.id, friendId);
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(full_name, avatar_url)')
      .eq('room_id', currentRoom.value)
      .order('created_at', { ascending: true });
    messages.value = data || [];
  };

  const sendMessage = async (content: string, friendId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const room = getRoomId(user.id, friendId);
    await supabase.from('messages').insert({ room_id: room, user_id: user.id, content });
  };

  return { messages, friends, requests, loading, currentRoom, fetchFriends, sendFriendRequest, fetchRequests, acceptRequest, fetchMessages, sendMessage, getRoomId };
});
