<template>
    <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-black text-slate-900">
                <Ban :size="20" class="inline -mt-0.5 text-red-500" /> Bloklangan talabalar
            </h2>
            <button @click="loadBlocks" :disabled="loading"
                class="text-xs font-bold text-orange-500 hover:text-orange-600 transition disabled:opacity-50">
                <Loader v-if="loading" :size="12" class="inline animate-spin -mt-0.5" />
                {{ loading ? " Yuklanmoqda..." : "Yangilash" }}
            </button>
        </div>

        <div v-if="loading" class="text-center py-10 text-slate-400 text-sm">
            <Loader :size="20" class="inline animate-spin -mt-0.5 mr-1" /> Yuklanmoqda...
        </div>

        <div v-else-if="blocks.length === 0" class="text-center py-10">
            <div class="mb-2"><CheckCircle :size="36" class="mx-auto text-green-400" /></div>
            <p class="text-sm text-slate-500">Bloklangan talaba yo'q</p>
        </div>

        <div v-else class="space-y-3">
            <div v-for="b in blocks" :key="b.id"
                class="border border-red-200 bg-red-50 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div class="min-w-0">
                    <p class="font-bold text-sm text-slate-900 truncate">
                        {{ b.profiles?.full_name || "Noma'lum talaba" }}
                    </p>
                    <p class="text-xs text-slate-500 truncate">
                        {{ b.tests?.title || "Noma'lum test" }}
                        <span v-if="b.tests?.subject"> • {{ b.tests.subject }}</span>
                    </p>
                    <p class="text-xs text-slate-400 mt-1">
                        {{ formatDate(b.created_at) }} •
                        <span class="text-red-500 font-semibold">{{ reasonLabel(b.reason) }}</span>
                    </p>
                </div>
                <button @click="unblock(b)" :disabled="unblockingId === b.id"
                    class="flex-shrink-0 px-4 py-2 bg-green-500 text-white text-xs font-black rounded-xl hover:bg-green-600 transition active:scale-95 disabled:opacity-50">
                    <Loader v-if="unblockingId === b.id" :size="12" class="inline animate-spin -mt-0.5" />
                    <CheckCircle v-else :size="12" class="inline -mt-0.5" />
                    {{ unblockingId === b.id ? "" : " Ruxsat berish" }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Ban, CheckCircle, Loader } from '@lucide/vue';
import { ref, onMounted } from "vue";
import supabase from "../supabase";

const blocks = ref<any[]>([]);
const loading = ref(false);
const unblockingId = ref<string | null>(null);

const loadBlocks = async () => {
    loading.value = true;
    const { data, error } = await supabase
        .from("test_blocks")
        .select("*, profiles(full_name), tests(title, subject)")
        .eq("unblocked", false)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("test_blocks yuklashda xato:", error);
        blocks.value = [];
    } else {
        blocks.value = data || [];
    }
    loading.value = false;
};

const unblock = async (block: any) => {
    unblockingId.value = block.id;
    const { error } = await supabase
        .from("test_blocks")
        .update({ unblocked: true, unblocked_at: new Date().toISOString() })
        .eq("id", block.id);

    if (!error) {
        blocks.value = blocks.value.filter((b) => b.id !== block.id);
    } else {
        console.error("Ruxsat berishda xato:", error);
    }
    unblockingId.value = null;
};

const reasonLabel = (reason: string) => {
    if (reason === "left_screen") return "Ekrandan uzoqlashdi";
    return reason || "Sababsiz";
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("uz", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

onMounted(loadBlocks);

defineExpose({ loadBlocks });
</script>