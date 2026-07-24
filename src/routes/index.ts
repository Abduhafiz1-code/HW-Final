import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Login.vue"),
      meta: { public: true, hideSidebar: true, hideMobileNav: true },
    },
    { path: "/", name: "home", component: HomeView },
    { path: "/map", name: "map", component: () => import("../views/Map.vue") },
    {
      path: "/feedback",
      name: "Feedback",
      component: () => import("../views/Feedback.vue"),
      meta: { hideSidebar: true, hideMobileNav: true },
    },

    {
      path: "/ai-chat",
      name: "ai-chat",
      component: () => import("../views/AIChat.vue"),
      meta: { hideSidebar: false, hideMobileNav: true },
    },
    {
      path: "/user",
      name: "user",
      component: () => import("../views/User.vue"),
    },
    {
      path: "/chat",
      name: "chat",
      component: () => import("../views/Chat.vue"),
    },
    {
      path: "/quiz-coop",
      name: "quiz-coop",
      component: () => import("../views/QuizCoop.vue"),
    },
    {
      path: "/student-quiz",
      name: "student-quiz",
      component: () => import("../views/StudentQuiz.vue"),
      meta: { hideSidebar: true, hideMobileNav: true },
    },
    {
      path: "/solo-quiz",
      name: "solo-quiz",
      component: () => import("../views/SoloQuiz.vue"),
      meta: { hideSidebar: true, hideMobileNav: true },
    },
    {
      path: "/translate",
      name: "translate",
      component: () => import("../views/Translate.vue"),
      meta: { hideSidebar: false, hideMobileNav: false },
    },
    {
      path: "/premium",
      name: "premium",
      component: () => import("../views/Premium.vue"),
      meta: { hideSidebar: true, hideMobileNav: true },
    },
    {
      path: "/game",
      name: "game",
      component: () => import("../views/Game.vue"),
      meta: { hideSidebar: true, hideMobileNav: true },
    },
    {
      path: "/practice",
      name: "practice",
      component: () => import("../views/Practice.vue"),
      meta: { hideSidebar: true, hideMobileNav: true },
    },
    {
      path: "/history",
      name: "history",
      component: () => import("../views/History.vue"),
      meta: { hideSidebar: true, hideMobileNav: true },
    },
    {
      path: "/teacher",
      name: "teacher",
      component: () => import("../views/Teacher.vue"),
    },
    {
      path: "/notifications",
      name: "notifications",
      component: () => import("../views/Notifications.vue"),
      meta: { hideSidebar: true, hideMobileNav: true },
    },
    {
      path: "/groups",
      name: "groups",
      component: () => import("../views/Groups.vue"),
      meta: { hideMobileNav: true },
    },
    {
      path: "/events",
      name: "events",
      component: () => import("../views/Events.vue"),
      meta: { hideMobileNav: true },
    },
    {
      path: "/events/vocab",
      name: "event-vocab",
      component: () => import("../views/EventVocab.vue"),
      meta: { hideSidebar: true, hideMobileNav: true },
    },
    {
      path: "/events/subjects",
      name: "event-subjects",
      component: () => import("../views/EventSubjects.vue"),
      meta: { hideSidebar: true, hideMobileNav: true },
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/Settings.vue"),
      meta: { hideSidebar: true, hideMobileNav: true },
    },
    {
      path: "/profile/edit",
      name: "profile-edit",
      component: () => import("../views/ProfileEdit.vue"),
      meta: { hideSidebar: true, hideMobileNav: true },
    },
  ],
});

router.beforeEach(async (to) => {
  const { default: supabase } = await import("../supabase");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session && !to.meta.public) return { name: "login" };
});

export default router;
