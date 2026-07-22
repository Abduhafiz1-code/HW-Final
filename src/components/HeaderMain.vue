<template>
  <section class="w-full px-0 py-5">
    <div class="mx-auto max-w-5xl">
      <div class="rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden bg-white">
        <!-- Rangli qism -->
        <div class="bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-6 sm:px-8">
          <p class="text-sm font-semibold uppercase tracking-[0.35em] text-white/90 mb-2">
            Tezkor kirish
          </p>

          <h2 class="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            O'quv bo'limlari
          </h2>

          <p class="max-w-2xl text-sm text-white/90 leading-relaxed">
            Uyga vazifa, o'yin, test va reja bo'limlari bilan bilimingizni
            rivojlantiring.
          </p>
        </div>

        <!-- Oq qism -->
        <div class="bg-white">
          <div class="grid gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6">
            <RouterLink to="/history">
              <article
                class="group rounded-[1.75rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md card-hover">
                <div class="flex items-center gap-4">
                  <div class="grid h-14 w-14 place-items-center rounded-3xl bg-orange-50 dark:bg-orange-500/10 shadow-sm">
                    <Clock :size="28" class="text-orange-500" />
                  </div>

                  <div>
                    <h3 class="text-xl font-semibold text-slate-900">
                      History
                    </h3>
                    <p class="text-sm text-slate-500 mt-1">
                      Testlar va tarjima tarixingiz.
                    </p>
                  </div>
                </div>

                <div class="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 flex items-center gap-1">
                  Boshqarishga o'tish <ArrowRight :size="14" />
                </div>
              </article>
            </RouterLink>

            <RouterLink to="/game">
              <article
                class="group rounded-[1.75rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md card-hover">
                <div class="flex items-center gap-4">
                  <div class="grid h-14 w-14 place-items-center rounded-3xl bg-purple-50 dark:bg-purple-500/10 shadow-sm">
                    <Gamepad2 :size="28" class="text-purple-500" />
                  </div>

                  <div>
                    <h3 class="text-xl font-semibold text-slate-900">Game</h3>
                    <p class="text-sm text-slate-500 mt-1">
                      Karta o'yini bilan so'zlar yodla.
                    </p>
                  </div>
                </div>

                <div class="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 flex items-center gap-1">
                  O'ynashni boshlash <ArrowRight :size="14" />
                </div>
              </article>
            </RouterLink>

            <RouterLink to="/practice">
              <article
                class="group rounded-[1.75rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md card-hover">
                <div class="flex items-center gap-4">
                  <div class="grid h-14 w-14 place-items-center rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 shadow-sm">
                    <PenTool :size="28" class="text-emerald-500" />
                  </div>

                  <div>
                    <h3 class="text-xl font-semibold text-slate-900">
                      Practice
                    </h3>
                    <p class="text-sm text-slate-500 mt-1">
                      AI bilan kunlik mashqlar.
                    </p>
                  </div>
                </div>

                <div class="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 flex items-center gap-1">
                  Mashq qilish <ArrowRight :size="14" />
                </div>
              </article>
            </RouterLink>

            <RouterLink to="/quiz-coop">
              <article
                class="group rounded-[1.75rem] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md card-hover">
                <div class="flex items-center gap-4">
                  <div class="grid h-14 w-14 place-items-center rounded-3xl bg-blue-50 dark:bg-blue-500/10 shadow-sm">
                    <MessageCircleQuestion :size="28" class="text-blue-500" />
                  </div>

                  <div>
                    <h3 class="text-xl font-semibold text-slate-900">Quiz</h3>
                    <p class="text-sm text-slate-500 mt-1">
                      Do'stlar bilan birgalikda test.
                    </p>
                  </div>
                </div>

                <div class="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 flex items-center gap-1">
                  Testlarni boshlash <ArrowRight :size="14" />
                </div>
              </article>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Clock, Gamepad2, PenTool, MessageCircleQuestion, ArrowRight } from '@lucide/vue';
</script>
