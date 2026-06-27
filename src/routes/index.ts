import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Login.vue"),
      meta: { public: true, hideTabBar: true },
    },
    { path: "/", name: "home", component: HomeView },
    { path: "/map", name: "map", component: () => import("../views/Map.vue") },
    { path: "/ai", name: "ai", component: () => import("../views/AI.vue") },
    {
      path: "/ai-chat",
      name: "ai-chat",
      component: () => import("../views/AIChat.vue"),
      meta: { hideTabBar: true },
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
      meta: { hideTabBar: true },
    },
    {
      path: "/solo-quiz",
      name: "solo-quiz",
      component: () => import("../views/SoloQuiz.vue"),
      meta: { hideTabBar: true },
    },
    {
      path: "/translate",
      name: "translate",
      component: () => import("../views/Translate.vue"),
    },
    {
      path: "/premium",
      name: "premium",
      component: () => import("../views/Premium.vue"),
      meta: { hideTabBar: true },
    },
    {
      path: "/game",
      name: "game",
      component: () => import("../views/Game.vue"),
      meta: { hideTabBar: true },
    },
    {
      path: "/practice",
      name: "practice",
      component: () => import("../views/Practice.vue"),
      meta: { hideTabBar: true },
    },
    {
      path: "/history",
      name: "history",
      component: () => import("../views/History.vue"),
      meta: { hideTabBar: true },
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
      meta: { hideTabBar: true },
    },
    {
      path: "/groups",
      name: "groups",
      component: () => import("../views/Groups.vue"),
      meta: { hideTabBar: true },
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
