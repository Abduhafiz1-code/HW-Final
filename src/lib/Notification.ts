import supabase from "../supabase";

export const saveNotification = async (
  userId: string,
  title: string,
  text: string,
  icon = "🔔",
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
