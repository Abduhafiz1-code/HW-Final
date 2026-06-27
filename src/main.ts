import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./routes/index.ts";
import { createPinia } from "pinia";

const pinia = createPinia();
const app = createApp(App);
app.use(router).use(pinia);

// Init auth store
import { useAuthStore } from "./stores/AuthStore";
const authStore = useAuthStore(pinia);
authStore.init().then(() => app.mount("#app"));
