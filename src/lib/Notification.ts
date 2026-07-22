import supabase from "../supabase";

// `icon` — @lucide/vue component name (string), rendered dynamically in
// Notifications.vue. Keep this a plain icon name, never an emoji, so every
// notification renders consistently regardless of who triggered it.
export const saveNotification = async (
  userId: string,
  title: string,
  text: string,
  icon = "Bell",
  badge = "",
  iconBg = "bg-slate-50",
  iconColor = "text-slate-500",
  badgeClass = "bg-slate-50 text-slate-600",
) => {
  await supabase.from("notifications").insert({
    user_id: userId,
    title,
    text,
    icon,
    icon_bg: iconBg,
    icon_color: iconColor,
    badge,
    badge_class: badgeClass,
    is_read: false,
  });
};
