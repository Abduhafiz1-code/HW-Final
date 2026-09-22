<template>
  <div
    class="min-h-screen bg-gradient-to-b from-[#FFF7F0] to-[#F7F9FC] px-4 pt-6 pb-28">
    <div class="max-w-lg mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <RouterLink
          to="/"
          class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-90 transition">
          ←</RouterLink
        >
        <div>
          <h1
            class="text-xl font-black text-slate-900 flex items-center gap-1.5">
            <span
              class="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm shadow-orange-300">
              <Dices :size="18" />
            </span>
            So'z O'yinlari
          </h1>
          <p class="text-xs text-slate-500 ml-9">So'zlarni o'ynab, o'rganing</p>
        </div>
      </div>

      <!-- ============ SETUP SCREEN ============ -->
      <div v-if="screen === 'setup'" class="space-y-4">
        <!-- 🆕 Global musobaqa: Hisob Blitz (butun dunyo bilan bellashuv) -->
        <GameBlitz />
        <!-- Mode selector -->
        <div class="bg-white rounded-3xl border border-slate-200 p-2 shadow-sm">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              v-for="m in modes"
              :key="m.id"
              @click="gameMode = m.id"
              :class="
                gameMode === m.id
                  ? 'bg-gradient-to-br ' +
                    m.grad +
                    ' text-white shadow-md scale-[1.02]'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              "
              class="rounded-2xl py-3 px-1.5 flex flex-col items-center gap-1 transition-all duration-200">
              <component :is="m.icon" :size="20" />
              <span class="text-[11px] font-bold leading-tight text-center">{{
                m.label
              }}</span>
            </button>
          </div>
          <p
            class="text-xs text-slate-500 text-center mt-2 px-2 transition-all">
            {{ currentMode.hint }}
          </p>
        </div>

        <!-- Sozlamalar: fan, til juftligi, so'z soni -->
        <div
          v-if="gameMode !== 'battle'"
          class="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
          <button
            @click="showSettings = !showSettings"
            class="w-full flex items-center justify-between gap-2">
            <span
              class="text-sm font-black text-slate-800 flex items-center gap-1.5 flex-shrink-0">
              <Settings2 :size="16" class="text-orange-500" /> Sozlamalar
            </span>
            <span
              class="text-[11px] text-slate-400 font-semibold flex items-center gap-1 min-w-0 truncate">
              <span class="truncate">{{ subject }} · {{ fromLangName }} → {{ toLangName }} · {{ wordCount }} so'z</span>
              <ChevronDown
                :size="14"
                class="flex-shrink-0 transition-transform"
                :class="showSettings && 'rotate-180'" />
            </span>
          </button>

          <div v-if="showSettings" class="mt-4 space-y-4 animate-fade-in-up">
            <!-- Fan tanlash + yangi fan qo'shish -->
            <div>
              <p class="text-xs font-bold text-slate-500 mb-1.5">Fan</p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="s in subjects"
                  :key="s"
                  @click="subject = s"
                  :class="
                    subject === s
                      ? 'border-orange-400 bg-orange-50 text-orange-600 scale-105'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  "
                  class="px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all">
                  {{ s }}
                </button>
              </div>
              <!-- Fan yo'q bo'lsa — o'zi qo'shadi -->
              <div class="flex gap-2 mt-2">
                <input
                  v-model="newSubject"
                  @keydown.enter="addSubject"
                  placeholder="Kerakli fan yo'qmi? Nomini yozib qo'shing..."
                  class="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                <button
                  @click="addSubject"
                  :disabled="!newSubject.trim()"
                  class="flex-shrink-0 px-3 py-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 text-xs font-black hover:bg-orange-100 active:scale-95 transition disabled:opacity-50 flex items-center gap-1">
                  <Plus :size="14" /> Qo'shish
                </button>
              </div>
            </div>

            <!-- Til juftligi -->
            <div>
              <p class="text-xs font-bold text-slate-500 mb-1.5">
                Qaysi tildan qaysi tilga
              </p>
              <div class="flex items-center gap-2">
                <select
                  v-model="fromLang"
                  class="flex-1 min-w-0 px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-400 transition">
                  <option v-for="l in GAME_LANGS" :key="l.code" :value="l.code">
                    {{ l.name }}
                  </option>
                </select>
                <ArrowLeftRight :size="16" class="text-slate-400 flex-shrink-0" />
                <select
                  v-model="toLang"
                  class="flex-1 min-w-0 px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-400 transition">
                  <option v-for="l in GAME_LANGS" :key="l.code" :value="l.code">
                    {{ l.name }}
                  </option>
                </select>
              </div>
              <p v-if="fromLang === toLang" class="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                <X :size="12" /> Ikkala til bir xil — boshqa til tanlang
              </p>
            </div>

            <!-- So'zlar soni -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <p class="text-xs font-bold text-slate-500">So'zlar soni</p>
                <span class="text-xs font-black text-orange-500">{{ wordCount }} ta</span>
              </div>
              <input
                v-model.number="wordCount"
                type="range"
                min="4"
                max="20"
                step="1"
                class="w-full accent-orange-500 cursor-pointer" />
              <div class="flex justify-between text-[10px] text-slate-400 font-bold mt-0.5">
                <span>4</span>
                <span>20</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Word list builder (memory / quiz / type modes) -->
        <div
          v-if="gameMode !== 'battle'"
          class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <h2 class="font-black text-lg text-slate-900 mb-2">
            So'zlar kiriting
          </h2>
          <p class="text-sm text-slate-500 mb-4">
            Har bir qatorga:
            <span class="font-semibold text-orange-500">so'z = tarjima</span>
          </p>

          <div class="space-y-2 mb-4">
            <TransitionGroup name="row">
              <div
                v-for="(pair, i) in wordPairs"
                :key="i"
                class="flex items-center gap-2">
                <input
                  v-model="pair.word"
                  :placeholder="`So'z ${i + 1}`"
                  class="flex-1 min-w-0 px-3 py-2 dark:text-orange-500 rounded-xl text-slate-800 border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                <span class="text-slate-400 font-bold flex-shrink-0">=</span>
                <input
                  v-model="pair.translation"
                  :placeholder="`Tarjima ${i + 1}`"
                  class="flex-1 min-w-0 px-3 py-2 dark:text-orange-500 rounded-xl text-slate-800 border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
                <button
                  v-if="wordPairs.length > 3"
                  @click="wordPairs.splice(i, 1)"
                  class="w-7 h-7 flex-shrink-0 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 active:scale-90 transition text-xs flex items-center justify-center">
                  <X :size="14" />
                </button>
              </div>
            </TransitionGroup>
          </div>

          <button
            @click="wordPairs.push({ word: '', translation: '' })"
            class="w-full py-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-semibold hover:border-orange-300 hover:text-orange-500 active:scale-[0.98] transition mb-4">
            + So'z qo'shish
          </button>

          <Transition name="fade">
            <p v-if="wordGenError" class="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2 mb-3 flex items-center gap-1.5">
              <X :size="13" /> {{ wordGenError }}
            </p>
          </Transition>

          <div class="mb-4">
            <p
              class="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
              <Bot :size="16" /> AI dan so'rash:
            </p>
            <div class="flex gap-2">
              <input
                v-model="aiTopic"
                placeholder="Mavzu: hayvonlar, ranglar..."
                class="flex-1 min-w-0 px-3 py-2 rounded-xl dark:text-orange-500 border text-slate-800 border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
              <button
                @click="generateWords"
                :disabled="aiLoading"
                class="flex-shrink-0 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 active:scale-95 transition disabled:opacity-60 flex items-center gap-1">
                <Loader v-if="aiLoading" :size="16" class="animate-spin" />
                <template v-else> <Bot :size="16" /> AI </template>
              </button>
            </div>
          </div>

          <button
            @click="startGame"
            :disabled="validPairs.length < currentMode.minPairs"
            class="w-full py-3 bg-gradient-to-r text-white font-black rounded-2xl transition disabled:opacity-50 active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
            :class="currentMode.grad">
            <component :is="currentMode.icon" :size="18" />
            {{ currentMode.startLabel }} ({{ validPairs.length }} juft)
          </button>
          <p
            v-if="validPairs.length < currentMode.minPairs"
            class="text-xs text-red-400 text-center mt-2">
            Kamida {{ currentMode.minPairs }} ta to'liq juft kerak
          </p>
        </div>

        <!-- Team Battle config -->
        <div
          v-else
          class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div>
            <h2
              class="font-black text-lg text-slate-900 mb-1 flex items-center gap-1.5">
              <Users :size="18" class="text-red-500" /> Jamoa jangi
            </h2>
            <p class="text-sm text-slate-500">
              Mavzuni kiriting, ikki jamoa tuzing va savol-bomba kartalar bilan
              bellashing
            </p>
          </div>

          <div>
            <label class="text-xs font-bold text-slate-500 mb-1.5 block"
              >Mavzu</label
            >
            <input
              v-model="battleTopic"
              placeholder="Masalan: Tarix, Geografiya, Fan..."
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition" />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button
              @click="battleConnMode = 'offline'"
              :class="
                battleConnMode === 'offline'
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : 'border-slate-200 text-slate-500'
              "
              class="py-3 rounded-2xl border-2 text-xs sm:text-sm font-bold flex flex-col items-center gap-1 transition-all">
              <WifiOff :size="18" /> Oflayn (bitta qurilma)
            </button>
            <button
              @click="battleConnMode = 'online'"
              :class="
                battleConnMode === 'online'
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : 'border-slate-200 text-slate-500'
              "
              class="py-3 rounded-2xl border-2 text-xs sm:text-sm font-bold flex flex-col items-center gap-1 transition-all">
              <Wifi :size="18" /> Onlayn (turli qurilma)
            </button>
          </div>

          <!-- OFFLINE CONFIG -->
          <div v-if="battleConnMode === 'offline'" class="space-y-3">
            <div>
              <label class="text-xs font-bold text-slate-500 mb-1.5 block"
                >Jami o'yinchilar soni</label
              >
              <input
                v-model.number="battlePlayerCount"
                type="number"
                min="3"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition" />
            </div>
            <p
              class="text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2 leading-relaxed">
              Taqsimot: <b class="text-slate-600">1 boshlovchi</b> +
              <b class="text-blue-600">{{ battleTeamSize }} (1-guruh)</b> +
              <b class="text-rose-600">{{ battleTeamSize }} (2-guruh)</b>
              <span v-if="battleUsedPlayers < battlePlayerCount">
                — jami {{ battleUsedPlayers }} kishi ishtirok etadi (guruhlar
                teng bo'lishi uchun)</span
              >
            </p>
            <button
              @click="startBattleOffline"
              :disabled="
                battleGenerating || !battleTopic.trim() || battleTeamSize < 1
              "
              class="w-full py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition">
              <Loader v-if="battleGenerating" :size="16" class="animate-spin" />
              <template v-else> <Users :size="16" /> Jangni boshlash </template>
            </button>
          </div>

          <!-- ONLINE CONFIG -->
          <div v-else class="space-y-3">
            <button
              @click="createBattleRoom"
              :disabled="!battleTopic.trim() || battleGenerating"
              class="w-full py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition">
              <Hash :size="16" /> Xona yaratish (boshlovchi bo'lish)
            </button>
            <div class="flex items-center gap-2 text-xs text-slate-400">
              <div class="flex-1 h-px bg-slate-200"></div>
              yoki
              <div class="flex-1 h-px bg-slate-200"></div>
            </div>
            <input
              v-model="battleJoinName"
              placeholder="Ismingiz"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
            <input
              v-model="battleJoinCode"
              placeholder="Xona kodi (masalan: A1B2C)"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 uppercase tracking-widest text-center font-bold focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
            <button
              @click="joinBattleRoom"
              :disabled="!battleJoinCode.trim() || !battleJoinName.trim()"
              class="w-full py-3 bg-indigo-50 text-indigo-600 border-2 border-indigo-200 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition">
              <LogIn :size="16" /> Xonaga qo'shilish
            </button>
          </div>

          <p
            v-if="battleError"
            class="text-xs text-red-400 flex items-center gap-1">
            <X :size="12" /> {{ battleError }}
          </p>
        </div>
      </div>

      <!-- ============ MEMORY GAME ============ -->
      <div v-else-if="screen === 'memory'">
        <StatBar
          :left="{
            label: 'Juftlar',
            value: `${matchedCount}/${validPairs.length}`,
            color: 'text-green-500',
          }"
          :mid="{ label: 'Urinish', value: attempts, color: 'text-orange-500' }"
          :right="{
            label: 'Vaqt',
            value: formatTime(elapsed),
            color: 'text-indigo-500',
          }"
          @reset="resetGame"
          @exit="screen = 'setup'" />

        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="card in cards"
            :key="card.id"
            @click="flipCard(card)"
            class="aspect-square [perspective:600px]">
            <div
              class="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
              :class="{
                '[transform:rotateY(180deg)]': card.flipped || card.matched,
              }">
              <!-- back (icon side) -->
              <div
                class="absolute inset-0 rounded-2xl border-2 bg-white border-slate-200 flex items-center justify-center [backface-visibility:hidden] hover:border-orange-300 hover:shadow-md cursor-pointer transition-shadow">
                <component
                  :is="card.type === 'word' ? BookOpen : Globe"
                  :size="22"
                  class="text-slate-300" />
              </div>
              <!-- front (text side) -->
              <div
                class="absolute inset-0 rounded-2xl border-2 flex items-center justify-center text-center p-1.5 [backface-visibility:hidden] [transform:rotateY(180deg)]"
                :class="
                  card.matched
                    ? 'bg-green-50 border-green-300'
                    : 'bg-orange-500 border-orange-400'
                ">
                <Check
                  v-if="card.matched"
                  :size="14"
                  class="absolute top-1 right-1 text-green-500" />
                <span
                  :class="card.matched ? 'text-green-700' : 'text-white'"
                  class="text-[10px] sm:text-xs font-bold leading-tight break-words"
                  >{{ card.text }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ QUIZ GAME ============ -->
      <div v-else-if="screen === 'quiz'">
        <StatBar
          :left="{
            label: 'Savol',
            value: `${quizIndex + 1}/${quizQueue.length}`,
            color: 'text-indigo-500',
          }"
          :mid="{
            label: 'Streak',
            value: quizStreak,
            color: 'text-orange-500',
          }"
          :right="{
            label: 'To\'g\'ri',
            value: quizScore,
            color: 'text-green-500',
          }"
          @reset="resetGame"
          @exit="screen = 'setup'" />

        <div
          class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-5">
          <div
            class="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 transition-all duration-500 rounded-full"
            :style="{ width: `${(quizIndex / quizQueue.length) * 100}%` }" />
        </div>

        <div
          class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-center mb-4"
          :class="{ 'animate-pop': quizPopKey }"
          :key="quizPopKey">
          <p
            class="text-xs text-slate-400 font-semibold mb-2 flex items-center justify-center gap-1">
            <BookOpen :size="12" /> Bu so'zning tarjimasi?
          </p>
          <p class="text-2xl font-black text-slate-900">
            {{ quizCurrent?.word }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <button
            v-for="(opt, i) in quizOptions"
            :key="quizPopKey + '-' + i"
            @click="answerQuiz(opt)"
            :disabled="quizAnswered"
            class="py-4 px-3 rounded-2xl border-2 font-bold text-sm transition-all active:scale-95 disabled:active:scale-100"
            :class="quizOptionClass(opt)">
            {{ opt }}
          </button>
        </div>
      </div>

      <!-- ============ TYPE GAME ============ -->
      <div v-else-if="screen === 'type'">
        <StatBar
          :left="{
            label: 'So\'z',
            value: `${typeIndex + 1}/${typeQueue.length}`,
            color: 'text-indigo-500',
          }"
          :mid="{ label: 'Xato', value: typeMistakes, color: 'text-red-400' }"
          :right="{
            label: 'Vaqt',
            value: formatTime(typeElapsed),
            color: 'text-orange-500',
          }"
          @reset="resetGame"
          @exit="screen = 'setup'" />

        <div
          class="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center mb-5">
          <p
            class="text-xs text-slate-400 font-semibold mb-3 flex items-center justify-center gap-1">
            <PenLine :size="12" /> Tarjimasini yozing
          </p>
          <p class="text-3xl font-black text-slate-900">
            {{ typeCurrent?.word }}
          </p>
        </div>

        <form @submit.prevent="submitType" class="space-y-3">
          <input
            ref="typeInput"
            v-model="typeAnswer"
            autocomplete="off"
            class="w-full px-4 py-4 rounded-2xl border-2 text-center text-lg font-bold text-slate-800 bg-white focus:outline-none transition-all"
            :class="typeInputClass"
            placeholder="Javobingiz..." />
          <div class="flex gap-2">
            <button
              type="button"
              @click="revealType"
              class="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 active:scale-95 transition text-sm flex items-center justify-center gap-1">
              <Eye :size="15" /> Javobni ko'rish
            </button>
            <button
              type="submit"
              class="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl hover:opacity-90 active:scale-95 transition text-sm flex items-center justify-center gap-1">
              <Send :size="15" /> Tekshirish
            </button>
          </div>
        </form>
      </div>

      <!-- ============ TEAM BATTLE GAME ============ -->
      <div v-else-if="screen === 'battle'">
        <div
          class="flex items-center justify-between mb-4 bg-white rounded-2xl border border-slate-200 px-4 py-3">
          <button
            @click="exitBattle"
            class="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 transition text-xs flex items-center justify-center">
            ←
          </button>
          <span
            class="font-black text-sm text-slate-700 flex items-center gap-1.5">
            <Users :size="15" class="text-red-500" /> Jamoa jangi
          </span>
          <span class="w-7 h-7"></span>
        </div>

        <!-- LOBBY (online) -->
        <div v-if="battleScreen === 'lobby'" class="animate-rise">
          <div
            class="bg-white rounded-3xl border border-slate-200 p-6 text-center mb-4 shadow-sm">
            <p class="text-xs text-slate-400 font-bold mb-1">Xona kodi</p>
            <div class="flex items-center justify-center gap-2">
              <span class="text-3xl font-black tracking-[0.2em] text-red-500">{{
                battleRoomCode
              }}</span>
              <button
                @click="copyRoomCode"
                class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition active:scale-90">
                <Check v-if="codeCopied" :size="15" class="text-green-500" />
                <Copy v-else :size="15" />
              </button>
            </div>
            <p class="text-xs text-slate-400 mt-2">
              Do'stlaringizga shu kodni yuboring, ular "Xonaga qo'shilish"
              orqali kirishadi
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p
                class="text-xs font-black text-blue-600 mb-2 flex items-center gap-1">
                <Users :size="13" /> 1-guruh ({{ team1Players.length }})
              </p>
              <p
                v-for="p in team1Players"
                :key="p.id"
                class="text-xs text-slate-600 py-0.5">
                {{ p.name }}
              </p>
              <p v-if="!team1Players.length" class="text-xs text-slate-300">
                Hali hech kim yo'q
              </p>
            </div>
            <div class="bg-rose-50 rounded-2xl p-4 border border-rose-100">
              <p
                class="text-xs font-black text-rose-600 mb-2 flex items-center gap-1">
                <Users :size="13" /> 2-guruh ({{ team2Players.length }})
              </p>
              <p
                v-for="p in team2Players"
                :key="p.id"
                class="text-xs text-slate-600 py-0.5">
                {{ p.name }}
              </p>
              <p v-if="!team2Players.length" class="text-xs text-slate-300">
                Hali hech kim yo'q
              </p>
            </div>
          </div>

          <button
            v-if="battleRole === 'host'"
            @click="startBattleOnline"
            :disabled="battleLobbyPlayers.length < 2 || battleGenerating"
            class="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-black text-sm disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition">
            <Loader v-if="battleGenerating" :size="16" class="animate-spin" />
            <template v-else>
              <Users :size="16" /> Jangni boshlash ({{
                battleLobbyPlayers.length
              }}
              o'yinchi)
            </template>
          </button>
          <p
            v-else
            class="text-center text-sm text-slate-400 flex items-center justify-center gap-1.5">
            <Loader :size="14" class="animate-spin" /> Boshlovchi jangni
            boshlashini kutmoqda...
          </p>
          <p v-if="battleError" class="text-xs text-red-400 text-center mt-2">
            {{ battleError }}
          </p>
        </div>

        <!-- PLAY -->
        <div v-else-if="battleScreen === 'play'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="team in ['team1', 'team2'] as const"
              :key="team"
              class="relative overflow-hidden rounded-[2rem] border-2 p-5 shadow-lg transition-all"
              :class="[
                team === 'team1'
                  ? 'border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100/70 shadow-blue-100'
                  : 'border-rose-200 bg-gradient-to-br from-rose-50 via-white to-rose-100/70 shadow-rose-100',
                bombFlashTeam === team ? 'animate-shake' : '',
              ]">
              <div
                class="absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-40"
                :class="team === 'team1' ? 'bg-blue-200' : 'bg-rose-200'"></div>
              <div class="relative flex items-start justify-between mb-4">
                <div>
                  <span
                    class="font-black text-lg flex items-center gap-2"
                    :class="
                      team === 'team1' ? 'text-blue-800' : 'text-rose-800'
                    ">
                    <span
                      class="flex h-9 w-9 items-center justify-center rounded-2xl text-white shadow-sm"
                      :class="team === 'team1' ? 'bg-blue-500' : 'bg-rose-500'"
                      ><Users :size="18"
                    /></span>
                    {{ team === "team1" ? "1-guruh" : "2-guruh" }}
                  </span>
                  <p class="mt-1 text-xs font-semibold text-slate-500">
                    {{ teamMemberCount(team) }} a'zo •
                    {{
                      battleTeams[team].filter((card) => !card.opened).length
                    }}
                    karta qoldi
                  </p>
                </div>
                <div
                  class="rounded-2xl bg-white/90 px-3 py-2 text-right shadow-sm ring-1 ring-black/5 relative">
                  <p
                    class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Hisob
                  </p>
                  <span
                    class="text-3xl font-black leading-none tabular-nums"
                    :class="
                      team === 'team1' ? 'text-blue-600' : 'text-rose-600'
                    "
                    >{{ battleScores[team] }}</span
                  >
                  <!-- Ball o'zgarganda uchib chiqadigan +20 / -10 -->
                  <Transition name="scorepop">
                    <span
                      v-if="scoreFlash.team === team && scoreFlash.delta"
                      class="absolute -top-2 left-1/2 -translate-x-1/2 text-lg font-black px-2 py-0.5 rounded-lg shadow-lg"
                      :class="[
                        scoreFlash.delta > 0
                          ? 'text-green-600 bg-green-50'
                          : 'text-red-500 bg-red-50',
                      ]">
                      {{ scoreFlash.delta > 0 ? `+${scoreFlash.delta}` : scoreFlash.delta }}
                    </span>
                  </Transition>
                </div>
              </div>
              <div
                v-if="
                  battleActiveCard?.team === team && battleConnMode === 'online'
                "
                class="relative mb-4 rounded-2xl bg-white/80 px-3 py-2 ring-1 ring-black/5">
                <div
                  class="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Ovozlar qabul qilinmoqda</span
                  ><span
                    :class="
                      team === 'team1' ? 'text-blue-600' : 'text-rose-600'
                    "
                    >{{ activeVoteCount }}/{{ activeTeamMemberCount }}</span
                  >
                </div>
                <div
                  class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="team === 'team1' ? 'bg-blue-500' : 'bg-rose-500'"
                    :style="{ width: `${activeVoteProgress}%` }"></div>
                </div>
              </div>
              <div class="relative grid grid-cols-5 gap-2">
                <button
                  v-for="(card, idx) in battleTeams[team]"
                  :key="card.id"
                  @click="openBattleCard(team, idx)"
                  :disabled="
                    card.opened ||
                    !!battleActiveCard ||
                    !canOpenBattleTeam(team)
                  "
                  class="aspect-square min-h-12 rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 text-xs font-black shadow-sm transition-all duration-300 enabled:hover:-translate-y-0.5 enabled:hover:shadow-md enabled:active:translate-y-0 disabled:cursor-not-allowed"
                  :class="battleCardClass(card, team)">
                  <component
                    :is="
                      card.opened ? (card.kind === 'bomb' ? Bomb : Check) : Hash
                    "
                    :size="18" />
                  <span v-if="!card.opened" class="text-[10px] opacity-80">{{
                    idx + 1
                  }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Active question modal -->
          <Transition name="modal">
            <div
              v-if="battleActiveCard"
              class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
              <div
                class="bg-white rounded-[2rem] p-5 sm:p-6 max-w-md w-full shadow-2xl animate-pop">
                <div class="flex items-center justify-between gap-3 mb-4">
                  <span
                    class="text-xs font-black px-2.5 py-1 rounded-lg"
                    :class="
                      battleActiveCard.team === 'team1'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-rose-100 text-rose-600'
                    ">
                    {{
                      battleActiveCard.team === "team1" ? "1-guruh" : "2-guruh"
                    }}
                    savoli
                  </span>
                  <div class="text-right">
                    <span
                      class="flex items-center justify-end gap-1 text-xs font-black tabular-nums"
                      :class="battleTimer <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-600'"
                      ><Clock :size="14" :class="battleTimer <= 5 ? 'text-red-500' : 'text-orange-500'" />
                      {{ battleTimer }}s</span
                    ><span class="text-[10px] font-semibold text-slate-400"
                      >qolgan vaqt</span
                    >
                    <!-- Vaqt tugayotganda pulsli qizil chiziq -->
                    <div class="mt-1 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-1000 ease-linear"
                        :class="battleTimer <= 5 ? 'bg-red-500' : 'bg-orange-400'"
                        :style="{ width: `${(battleTimer / 30) * 100}%` }"></div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="battleConnMode === 'online'"
                  class="mb-4 rounded-2xl border border-orange-100 bg-orange-50 p-3">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm font-black text-slate-800">
                        Jamoaviy ovoz
                      </p>
                      <p class="mt-0.5 text-[11px] leading-snug text-slate-500">
                        Har bir a'zo faqat bir marta ovoz beradi. Barcha ovoz
                        kelganda savol yakunlanadi.
                      </p>
                    </div>
                    <span
                      class="shrink-0 rounded-xl bg-white px-2.5 py-2 text-sm font-black text-orange-600 shadow-sm"
                      >{{ activeVoteCount }}/{{ activeTeamMemberCount }}</span
                    >
                  </div>
                  <div
                    class="mt-2 h-2 overflow-hidden rounded-full bg-orange-100">
                    <div
                      class="h-full rounded-full bg-orange-500 transition-all duration-300"
                      :style="{ width: `${activeVoteProgress}%` }"></div>
                  </div>
                </div>
                <p class="font-black text-slate-900 text-lg mb-4 leading-snug">
                  {{ activeQuestion?.question }}
                </p>
                <div class="grid grid-cols-1 gap-2">
                  <button
                    v-for="(opt, i) in activeQuestion?.options"
                    :key="i"
                    @click="castBattleVote(i)"
                    :disabled="!!battleRevealResult || battleVoteDisabled"
                    class="min-h-14 py-3 px-4 text-slate-800 rounded-2xl border-2 text-left text-sm font-bold flex items-center justify-between gap-2 transition-all active:scale-[0.98] disabled:active:scale-100"
                    :class="battleOptionClass(i)">
                    <span>{{ ["A", "B", "C", "D"][i] }}. {{ opt }}</span>
                    <span
                      class="text-xs font-black text-slate-400 flex-shrink-0"
                      >{{ battleVotes[i] || 0 }}</span
                    >
                  </button>
                </div>
                <button
                  v-if="canManuallyResolve"
                  @click="resolveBattleCard"
                  class="w-full mt-4 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5 active:scale-95 transition">
                  <Send :size="14" /> O'tkazish
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- OVER -->
        <div
          v-else-if="battleScreen === 'over'"
          class="text-center py-6 animate-pop">
          <!-- Animatsiyali jamoa jangi yakuni -->
          <CelebrationOverlay :show="battleCelebrate && battleScreen === 'over'"
            :variant="
              battleScores.team1 === battleScores.team2
                ? 'tie'
                : battleScores.team1 > battleScores.team2
                  ? 'win'
                  : 'win'
            "
            :title="battleWinnerText"
            :subtitle="`1-guruh ${battleScores.team1} — 2-guruh ${battleScores.team2}`"
            :stats="[
              { label: '1-guruh', value: battleScores.team1, colorClass: 'text-blue-600' },
              { label: '2-guruh', value: battleScores.team2, colorClass: 'text-rose-600' },
            ]"
            :count-up-to="Math.max(battleScores.team1, battleScores.team2)"
            primary-label="Yangi jang"
            @primary="exitBattle" />
          <div
            class="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
            <Trophy :size="34" class="text-yellow-500" />
          </div>
          <h2 class="text-2xl font-black text-slate-900">
            {{ battleWinnerText }}
          </h2>
          <div class="flex items-center justify-center gap-8 my-5">
            <div>
              <p class="text-3xl font-black text-blue-600">
                {{ battleScores.team1 }}
              </p>
              <p class="text-xs text-slate-400 mt-1">1-guruh</p>
            </div>
            <div class="text-slate-200 text-2xl font-black">:</div>
            <div>
              <p class="text-3xl font-black text-rose-600">
                {{ battleScores.team2 }}
              </p>
              <p class="text-xs text-slate-400 mt-1">2-guruh</p>
            </div>
          </div>
          <p
            v-if="battleRole === 'host' || battleConnMode === 'offline'"
            class="flex items-center justify-center gap-1.5 text-orange-500 font-bold text-sm mb-5">
            <Flame :size="16" /> Boshlovchiga +20 tanga
          </p>
          <button
            @click="exitBattle"
            class="px-8 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 active:scale-95 transition">
            Yangi jang
          </button>
        </div>
      </div>

      <!-- ============ WIN OVERLAY (memory/quiz/type) ============ -->
      <!-- Animatsiyali CelebrationOverlay — konfeti, count-up hisob va stat chips -->
      <CelebrationOverlay :show="gameWon && !oldWinOverlay"
        :variant="'win'"
        :title="'Zo\'r! 🎉'"
        :subtitle="winSummary"
        :count-up-to="gameRewardCoins"
        :count-suffix="' tanga'"
        :stats="[
          { label: 'Tanga', value: `+${gameRewardCoins}`, colorClass: 'text-orange-500' },
          { label: 'Progress', value: '+100', colorClass: 'text-green-600' },
        ]"
        :share-text="`So'z o'yinida ${gameRewardCoins} tanga yutdim! 🎮 Sen ham o'ynab ko'r!`"
        primary-label="Qayta o'ynash"
        secondary-label="Yangi so'zlar"
        @primary="resetGame"
        @secondary="backToSetup" />
      <!-- Eski overlay (Fallback faqat celebration o'chirilganda) -->
      <Transition name="fade">
        <div
          v-if="gameWon && oldWinOverlay"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 overflow-hidden">
          <span
            v-for="n in 16"
            :key="n"
            class="confetti absolute top-0"
            :style="confettiStyle(n)">
            <component
              :is="[Star, Sparkles, Award][n % 3]"
              :size="16"
              class="text-orange-300" />
          </span>
          <div
            class="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full relative animate-pop">
            <div class="flex justify-center mb-4">
              <div
                class="w-16 h-16 rounded-2xl bg-yellow-50 flex items-center justify-center animate-bounce-slow">
                <Trophy :size="34" class="text-yellow-500" />
              </div>
            </div>
            <h2 class="text-2xl font-black text-slate-900">Zo'r!</h2>
            <p class="text-slate-500 mt-2 text-sm">{{ winSummary }}</p>
            <div
              class="flex items-center justify-center gap-1.5 mt-3 text-orange-500 font-bold text-sm">
              <Flame :size="16" /> +100 tajriba ochko
            </div>
            <div class="flex gap-3 mt-6">
              <button
                @click="resetGame"
                class="flex-1 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 active:scale-95 transition flex items-center justify-center gap-1">
                <RotateCcw :size="15" /> Qayta o'yna
              </button>
              <button
                @click="backToSetup"
                class="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 active:scale-95 transition">
                Yangi so'zlar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <OnboardingTooltip
      pageId="Game"
      title="So'z O'yini"
      description="O'yin turini tanlang, kartalarni oching yoki savollarga javob bering. AI yordamida yangi so'zlar yarating" />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  nextTick,
  onUnmounted,
  watch,
  h,
  defineComponent,
  type PropType,
} from "vue";
import { useCoinStore } from "../stores/CoinStore";
import supabase from "../supabase";
import { askAIJson } from "../lib/ai";
import { saveNotification } from "../lib/Notification";
import OnboardingTooltip from "../components/OnboardingTooltip.vue";
import CelebrationOverlay from "../components/CelebrationOverlay.vue";
import GameBlitz from "../components/GameBlitz.vue";
import { playDing, playBuzz, playClick, speak } from "../lib/sound";
import {
  Dices,
  Bot,
  Loader,
  RotateCcw,
  BookOpen,
  Globe,
  Trophy,
  Sparkles,
  Zap,
  PenLine,
  Grid3x3,
  Check,
  X,
  Star,
  Award,
  Flame,
  Eye,
  Send,
  Users,
  Bomb,
  Wifi,
  WifiOff,
  Hash,
  Copy,
  LogIn,
  Clock,
  Settings2,
  ChevronDown,
  ArrowLeftRight,
  Plus,
} from "@lucide/vue";
const coinStore = useCoinStore();

interface WordPair {
  word: string;
  translation: string;
}
interface Card {
  id: number;
  text: string;
  type: "word" | "translation";
  pairId: number;
  flipped: boolean;
  matched: boolean;
}

/* ---------------- small local stat bar component ---------------- */
interface StatValue {
  label: string;
  value: string | number;
  color: string;
}

const StatBar = defineComponent({
  props: {
    left: { type: Object as PropType<StatValue>, required: true },
    mid: { type: Object as PropType<StatValue>, required: true },
    right: { type: Object as PropType<StatValue>, required: true },
  },
  emits: ["reset", "exit"],
  setup(props, { emit }) {
    return () =>
      h(
        "div",
        {
          class:
            "flex items-center justify-between mb-4 bg-white rounded-2xl border border-slate-200 px-4 py-3",
        },
        [
          h(
            "button",
            {
              onClick: () => emit("exit"),
              class:
                "w-7 h-7 flex-shrink-0 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 transition text-xs flex items-center justify-center mr-1",
            },
            "←",
          ),
          h("div", { class: "text-center flex-1" }, [
            h("p", { class: "text-xs text-slate-500" }, props.left.label),
            h(
              "p",
              { class: "text-lg font-black " + props.left.color },
              String(props.left.value),
            ),
          ]),
          h("div", { class: "text-center flex-1" }, [
            h("p", { class: "text-xs text-slate-500" }, props.mid.label),
            h(
              "p",
              { class: "text-lg font-black " + props.mid.color },
              String(props.mid.value),
            ),
          ]),
          h("div", { class: "text-center flex-1" }, [
            h("p", { class: "text-xs text-slate-500" }, props.right.label),
            h(
              "p",
              { class: "text-lg font-black " + props.right.color },
              String(props.right.value),
            ),
          ]),
          h(
            "button",
            {
              onClick: () => emit("reset"),
              class:
                "px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 active:scale-95 transition",
            },
            [h(RotateCcw, { size: 14 })],
          ),
        ],
      );
  },
});

/* ---------------- shared setup state ---------------- */
const modes = [
  {
    id: "memory",
    label: "Xotira",
    icon: Grid3x3,
    grad: "from-orange-500 to-orange-600",
    minPairs: 3,
    startLabel: "O'yinni boshlash",
    hint: "Kartalarni oching va juftini toping",
  },
  {
    id: "quiz",
    label: "Tezkor tanlov",
    icon: Zap,
    grad: "from-indigo-500 to-indigo-600",
    minPairs: 4,
    startLabel: "Testni boshlash",
    hint: "To'g'ri tarjimani 4 tadan birini tanlang",
  },
  {
    id: "type",
    label: "Yozib toping",
    icon: PenLine,
    grad: "from-green-500 to-green-600",
    minPairs: 3,
    startLabel: "Yozishni boshlash",
    hint: "So'zning tarjimasini o'zingiz yozing",
  },
  {
    id: "battle",
    label: "Jamoa jangi",
    icon: Users,
    grad: "from-red-500 to-rose-600",
    minPairs: 0,
    startLabel: "Jangni boshlash",
    hint: "Ikki jamoa tuzing, savol-bomba kartalar bilan bellashing",
  },
] as const;
type ModeId = (typeof modes)[number]["id"];
const gameMode = ref<ModeId>("memory");
const currentMode = computed(() => modes.find((m) => m.id === gameMode.value)!);

const wordPairs = ref<WordPair[]>([
  { word: "", translation: "" },
  { word: "", translation: "" },
  { word: "", translation: "" },
]);
const aiTopic = ref("");
const aiLoading = ref(false);
const screen = ref<"setup" | ModeId>("setup");
const gameWon = ref(false);
const winSummary = ref("");

const validPairs = computed(() =>
  wordPairs.value.filter((p) => p.word.trim() && p.translation.trim()),
);

const wordGenError = ref("");

/* ---------------- Sozlamalar: fan, tillar, so'z soni ---------------- */
const GAME_LANGS = [
  { code: "en", name: "English" },
  { code: "uz", name: "O'zbek" },
  { code: "ru", name: "Rus tili" },
  { code: "tr", name: "Turk tili" },
  { code: "de", name: "Nemis tili" },
  { code: "fr", name: "Fransuz tili" },
  { code: "es", name: "Ispan tili" },
  { code: "ar", name: "Arab tili" },
  { code: "zh", name: "Xitoy tili" },
  { code: "ko", name: "Koreys tili" },
];
const langName = (c: string) => GAME_LANGS.find((l) => l.code === c)?.name || c;
const fromLangName = computed(() => langName(fromLang.value));
const toLangName = computed(() => langName(toLang.value));

const showSettings = ref(false);
const fromLang = ref(localStorage.getItem("game_fromLang") || "en");
const toLang = ref(localStorage.getItem("game_toLang") || "uz");
const wordCount = ref(Number(localStorage.getItem("game_wordCount")) || 10);

const DEFAULT_SUBJECTS = [
  "Ingliz tili",
  "Rus tili",
  "Matematika",
  "Tarix",
  "Geografiya",
  "Biologiya",
  "Umumiy",
];
const customSubjects = ref<string[]>(
  (() => {
    try {
      return JSON.parse(localStorage.getItem("game_customSubjects") || "[]");
    } catch {
      return [];
    }
  })(),
);
const subjects = computed(() => [
  ...DEFAULT_SUBJECTS,
  ...customSubjects.value,
]);
const subject = ref(localStorage.getItem("game_subject") || "Ingliz tili");
const newSubject = ref("");

const addSubject = () => {
  const s = newSubject.value.trim();
  if (!s || subjects.value.includes(s)) return;
  customSubjects.value.push(s);
  localStorage.setItem(
    "game_customSubjects",
    JSON.stringify(customSubjects.value),
  );
  subject.value = s;
  newSubject.value = "";
};

// Sozlamalarni avtomatik saqlash — keyingi kirishda eslab qoladi
watch([fromLang, toLang, wordCount, subject], () => {
  localStorage.setItem("game_fromLang", fromLang.value);
  localStorage.setItem("game_toLang", toLang.value);
  localStorage.setItem("game_wordCount", String(wordCount.value));
  localStorage.setItem("game_subject", subject.value);
});

const generateWords = async () => {
  wordGenError.value = "";
  if (!aiTopic.value.trim()) {
    wordGenError.value = "Iltimos, AI uchun mavzu kiriting (masalan: hayvonlar).";
    return;
  }
  aiLoading.value = true;
  const pairs = await askAIJson<WordPair[]>(
    `"${aiTopic.value}" mavzusida ${subject.value} faniga tegishli ${wordCount.value} ta ${fromLangName.value} tilidagi so'z va ${toLangName.value} tilidagi tarjimasi JSON: [{"word":"...","translation":"..."}]. Faqat ${fromLangName.value}→${toLangName.value} juftliklari. Boshqa hech narsa yozma.`,
    [],
  );
  const cleanedPairs = (Array.isArray(pairs) ? pairs : [])
    .filter(
      (p) =>
        p &&
        typeof p.word === "string" &&
        typeof p.translation === "string" &&
        p.word.trim() &&
        p.translation.trim(),
    )
    .slice(0, wordCount.value) as WordPair[];
  if (cleanedPairs.length) {
    wordPairs.value = cleanedPairs;
  } else {
    wordGenError.value = "AI so'z tuza olmadi. Boshqa mavzu bilan qayta urinib ko'ring.";
  }
  aiLoading.value = false;
};

const formatTime = (s: number) =>
  `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

/* completion / rewards shared helper */
// O'yin yakunida HAQIQIY mukofot beriladi: progress + tanga.
// Mukofot miqdori o'yin natijasiga bog'liq (bu o'yinlarni mazmunli qiladi).
const awardCompletion = async (
  summary: string,
  notifTitle: string,
  notifDesc: string,
  saveResult?: { pairs: number; attempts: number; time_seconds: number },
) => {
  winSummary.value = summary;
  gameWon.value = true;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && saveResult) {
    await supabase.from("game_results").insert({
      user_id: user.id,
      pairs: saveResult.pairs,
      attempts: saveResult.attempts,
      time_seconds: saveResult.time_seconds,
    });
  }

  await coinStore.fetchCoins();
  await coinStore.addProgress(100);

  // Mukofot: memory — tezlikka qarab; quiz/type — to'g'ri javoblar foiziga qarab.
  const coinsReward = gameRewardCoins.value;
  if (user && coinsReward > 0) {
    const { data: row } = await supabase
      .from("coins")
      .select("coins")
      .eq("user_id", user.id)
      .single();
    const newCoins = (row?.coins ?? 0) + coinsReward;
    await supabase.from("coins").update({ coins: newCoins }).eq("user_id", user.id);
    coinStore.coins = newCoins;
    winSummary.value = `${summary} (+${coinsReward} tanga!)`;
  }

  if (!user) return;

  await saveNotification(
    user.id,
    notifTitle,
    coinsReward > 0 ? `${notifDesc} — +${coinsReward} tanga` : notifDesc,
    "Cards",
    coinsReward > 0 ? `+${coinsReward} tanga` : "100% progress",
    "bg-purple-50",
    "text-purple-500",
    "bg-purple-50 text-purple-600",
  );
};

// Yakunlanganda hisoblanadi: memory uchun urinish tejamkorligi, quiz/type uchun aniqlik
const gameRewardCoins = ref(0);
const computeMemoryReward = (pairs: number, attempts: number) => {
  const efficiency = pairs / Math.max(attempts, 1); // 0.5 = mukammal
  return Math.max(5, Math.min(25, Math.round(efficiency * 40)));
};

const startGame = () => {
  gameWon.value = false;
  gameRewardCoins.value = 0;
  if (gameMode.value === "memory") startMemory();
  else if (gameMode.value === "quiz") startQuiz();
  else if (gameMode.value === "type") startType();
  screen.value = gameMode.value;
};

const resetGame = () => {
  gameWon.value = false;
  startGame();
};
const backToSetup = () => {
  clearAllTimers();
  gameWon.value = false;
  oldWinOverlay.value = false;
  screen.value = "setup";
};
// Eski win overlay faqat fallback sifatida (jangovar celebration bilan ustma-ust tushmasin)
const oldWinOverlay = ref(false);
let memTimer: any, typeTimer: any;
const clearAllTimers = () => {
  clearInterval(memTimer);
  clearInterval(typeTimer);
};
onUnmounted(() => {
  clearAllTimers();
  clearInterval(battleTimerInterval);
  battleChannel.value?.unsubscribe?.();
});

/* ---------------- MEMORY GAME ---------------- */
const cards = ref<Card[]>([]);
const flippedCards = ref<Card[]>([]);
const attempts = ref(0);
const matchedCount = ref(0);
const elapsed = ref(0);

const startMemory = () => {
  clearInterval(memTimer);
  const allCards: Card[] = [];
  validPairs.value.forEach((pair, i) => {
    allCards.push({
      id: i * 2,
      text: pair.word,
      type: "word",
      pairId: i,
      flipped: false,
      matched: false,
    });
    allCards.push({
      id: i * 2 + 1,
      text: pair.translation,
      type: "translation",
      pairId: i,
      flipped: false,
      matched: false,
    });
  });
  cards.value = allCards.sort(() => Math.random() - 0.5);
  flippedCards.value = [];
  attempts.value = 0;
  matchedCount.value = 0;
  elapsed.value = 0;
  memTimer = setInterval(() => elapsed.value++, 1000);
};

const flipCard = async (card: Card) => {
  if (card.matched || card.flipped || flippedCards.value.length >= 2) return;
  card.flipped = true;
  playClick(); // 🔊 karta ochilishi
  // 🔊 So'zni o'qib berish (talaffuz) — word kartasida
  if (card.type === "word") speak(card.text || "", "en");
  flippedCards.value.push(card);
  if (flippedCards.value.length === 2) {
    attempts.value++;
    const [a, b] = flippedCards.value;
    if (a.pairId === b.pairId && a.type !== b.type) {
      a.matched = b.matched = true;
      matchedCount.value++;
      playDing(); // 🔊 juftlik topildi
      flippedCards.value = [];
      if (matchedCount.value === validPairs.value.length) {
        clearInterval(memTimer);
        gameRewardCoins.value = computeMemoryReward(validPairs.value.length, attempts.value);
        await awardCompletion(
          `${validPairs.value.length} juft so'z — ${attempts.value} urinishda, ${formatTime(elapsed.value)} da yakunladingiz!`,
          "So'z o'yini yakunlandi!",
          `${validPairs.value.length} juft so'z — ${attempts.value} urinishda`,
          {
            pairs: validPairs.value.length,
            attempts: attempts.value,
            time_seconds: elapsed.value,
          },
        );
      }
    } else {
      playBuzz(); // 🔊 juftlik mos kelmadi
      setTimeout(() => {
        a.flipped = b.flipped = false;
        flippedCards.value = [];
      }, 900);
    }
  }
};

/* ---------------- QUIZ GAME ---------------- */
const quizQueue = ref<WordPair[]>([]);
const quizIndex = ref(0);
const quizScore = ref(0);
const quizStreak = ref(0);
const quizOptions = ref<string[]>([]);
const quizAnswered = ref(false);
const quizSelected = ref<string | null>(null);
const quizPopKey = ref(0);

const quizCurrent = computed(() => quizQueue.value[quizIndex.value]);

const startQuiz = () => {
  quizQueue.value = [...validPairs.value].sort(() => Math.random() - 0.5);
  quizIndex.value = 0;
  quizScore.value = 0;
  quizStreak.value = 0;
  loadQuizQuestion();
};

const loadQuizQuestion = () => {
  quizAnswered.value = false;
  quizSelected.value = null;
  quizPopKey.value++;
  const correct = quizCurrent.value.translation;
  const pool = validPairs.value
    .filter((p) => p.translation !== correct)
    .map((p) => p.translation);
  const wrongs = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  quizOptions.value = [correct, ...wrongs].sort(() => Math.random() - 0.5);
};

const answerQuiz = async (opt: string) => {
  if (quizAnswered.value) return;
  quizAnswered.value = true;
  quizSelected.value = opt;
  if (opt === quizCurrent.value.translation) {
    quizScore.value++;
    quizStreak.value++;
    playDing();
  } else {
    quizStreak.value = 0;
    playBuzz();
  }
  await new Promise((r) => setTimeout(r, 700));
  if (quizIndex.value + 1 < quizQueue.value.length) {
    quizIndex.value++;
    loadQuizQuestion();
  } else {
    gameRewardCoins.value = Math.max(5, Math.round((quizScore.value / quizQueue.value.length) * 20));
    await awardCompletion(
      `${quizQueue.value.length} ta savoldan ${quizScore.value} tasiga to'g'ri javob berdingiz!`,
      "Tezkor tanlov yakunlandi!",
      `${quizScore.value}/${quizQueue.value.length} to'g'ri javob`,
    );
  }
};

const quizOptionClass = (opt: string) => {
  if (!quizAnswered.value)
    return "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50";
  if (opt === quizCurrent.value.translation)
    return "bg-green-50 border-green-400 text-green-700 animate-pop";
  if (opt === quizSelected.value)
    return "bg-red-50 border-red-300 text-red-500 animate-shake";
  return "bg-white border-slate-100 text-slate-300";
};

/* ---------------- TYPE GAME ---------------- */
const typeQueue = ref<WordPair[]>([]);
const typeIndex = ref(0);
const typeAnswer = ref("");
const typeMistakes = ref(0);
const typeElapsed = ref(0);
const typeStatus = ref<"idle" | "correct" | "wrong">("idle");
const typeInput = ref<HTMLInputElement | null>(null);

const typeCurrent = computed(() => typeQueue.value[typeIndex.value]);
const typeInputClass = computed(() => {
  if (typeStatus.value === "correct")
    return "border-green-400 bg-green-50 animate-pop";
  if (typeStatus.value === "wrong")
    return "border-red-300 bg-red-50 animate-shake";
  return "border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100";
});

const startType = () => {
  clearInterval(typeTimer);
  typeQueue.value = [...validPairs.value].sort(() => Math.random() - 0.5);
  typeIndex.value = 0;
  typeAnswer.value = "";
  typeMistakes.value = 0;
  typeElapsed.value = 0;
  typeStatus.value = "idle";
  typeTimer = setInterval(() => typeElapsed.value++, 1000);
  nextTick(() => typeInput.value?.focus());
};

const advanceType = async () => {
  if (typeIndex.value + 1 < typeQueue.value.length) {
    typeIndex.value++;
    typeAnswer.value = "";
    typeStatus.value = "idle";
    nextTick(() => typeInput.value?.focus());
  } else {
    clearInterval(typeTimer);
    gameRewardCoins.value = Math.max(5, Math.round(((typeQueue.value.length - typeMistakes.value) / typeQueue.value.length) * 20));
    await awardCompletion(
      `${typeQueue.value.length} ta so'z, ${typeMistakes.value} ta xato, ${formatTime(typeElapsed.value)} da yakunladingiz!`,
      "Yozib topish yakunlandi!",
      `${typeQueue.value.length} so'z — ${typeMistakes.value} xato`,
    );
  }
};

const submitType = () => {
  if (typeStatus.value !== "idle" || !typeAnswer.value.trim()) return;
  const ok =
    typeAnswer.value.trim().toLowerCase() ===
    typeCurrent.value.translation.trim().toLowerCase();
  typeStatus.value = ok ? "correct" : "wrong";
  if (ok) playDing();
  else playBuzz();
  if (!ok) typeMistakes.value++;
  setTimeout(advanceType, ok ? 500 : 800);
};

const revealType = () => {
  if (typeStatus.value !== "idle") return;
  typeAnswer.value = typeCurrent.value.translation;
  typeStatus.value = "wrong";
  typeMistakes.value++;
  setTimeout(advanceType, 900);
};

/* confetti positions on win */
const confettiStyle = (n: number) => ({
  left: `${(n * 6.2) % 100}%`,
  animationDelay: `${(n % 5) * 0.15}s`,
  animationDuration: `${1.6 + (n % 4) * 0.3}s`,
});

/* =====================================================================
   TEAM BATTLE GAME
   - Offline: one device, host taps everything, unlimited taps = votes.
   - Online: Supabase Realtime broadcast channel per room code. Host is
     authoritative for scoring/timer/tie-breaks; players vote once each.
   NOTE: this uses coinStore.addProgress(20) for the host's end-game coin
   reward. If your CoinStore has a dedicated addCoins() method, swap it in.
   ===================================================================== */
type BattleTeam = "team1" | "team2";
interface BattleQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}
interface BattleCard {
  id: number;
  kind: "question" | "bomb";
  q?: BattleQuestion;
  opened: boolean;
}

const QUESTIONS_PER_TEAM = 15;
const BOMB_RATIO = 0.18;

const battleTopic = ref("");
const battleConnMode = ref<"offline" | "online">("offline");
const battleGenerating = ref(false);
const battleError = ref("");

// offline config
const battlePlayerCount = ref(10);
const battleTeamSize = computed(() =>
  Math.floor((Math.max(3, battlePlayerCount.value) - 1) / 2),
);
const battleUsedPlayers = computed(() => 1 + battleTeamSize.value * 2);

// online config / lobby
const battleRoomCode = ref("");
const battleJoinCode = ref("");
const battleJoinName = ref("");
const battleRole = ref<"host" | "player" | null>(null);
const battleMyTeam = ref<BattleTeam | null>(null);
const battleMyId = ref("");
const battleLobbyPlayers = ref<
  { id: string; name: string; team: BattleTeam }[]
>([]);
const battleChannel = ref<any>(null);
const codeCopied = ref(false);

// shared game state
const battleScreen = ref<"config" | "lobby" | "play" | "over">("config");
const battleTeams = ref<{ team1: BattleCard[]; team2: BattleCard[] }>({
  team1: [],
  team2: [],
});
const battleScores = ref({ team1: 0, team2: 0 });
const battleActiveCard = ref<{ team: BattleTeam; idx: number } | null>(null);
const battleVotes = ref<Record<number, number>>({});
const battleVotedPlayers = ref<Set<string>>(new Set());
const battleTimer = ref(30);
let battleTimerInterval: any = null;
// Jamoa hisobi o'zgarganda uchib chiqadigan +20/-10 belgisi
const scoreFlash = ref<{ team: BattleTeam | null; delta: number }>({
  team: null,
  delta: 0,
});
let scoreFlashTimeout: any = null;
const flashScore = (team: BattleTeam, delta: number) => {
  scoreFlash.value = { team, delta };
  clearTimeout(scoreFlashTimeout);
  scoreFlashTimeout = setTimeout(() => (scoreFlash.value = { team: null, delta: 0 }), 1100);
};
// Jang yakunlari uchun animatsiyali overlay
const battleCelebrate = ref(false);
const battleRevealResult = ref<{
  correct: boolean;
  chosen: number;
  correctIndex: number;
} | null>(null);
const bombFlashTeam = ref<BattleTeam | null>(null);

const team1Players = computed(() =>
  battleLobbyPlayers.value.filter((p) => p.team === "team1"),
);
const team2Players = computed(() =>
  battleLobbyPlayers.value.filter((p) => p.team === "team2"),
);
const activeQuestion = computed(() => {
  if (!battleActiveCard.value) return null;
  return (
    battleTeams.value[battleActiveCard.value.team][battleActiveCard.value.idx]
      ?.q || null
  );
});
const battleWinnerText = computed(() => {
  if (battleScores.value.team1 === battleScores.value.team2) return "Durrang!";
  return battleScores.value.team1 > battleScores.value.team2
    ? "1-guruh g'alaba qozondi!"
    : "2-guruh g'alaba qozondi!";
});
const battleVoteDisabled = computed(() => {
  if (battleConnMode.value !== "online") return false;
  if (battleRole.value === "host") return true;
  return battleVotedPlayers.value.has(battleMyId.value);
});
const teamMemberCount = (team: BattleTeam) =>
  battleConnMode.value === "online"
    ? battleLobbyPlayers.value.filter((player) => player.team === team).length
    : battleTeamSize.value;
const activeTeamMemberCount = computed(() =>
  battleActiveCard.value ? teamMemberCount(battleActiveCard.value.team) : 0,
);
const activeVoteCount = computed(() => battleVotedPlayers.value.size);
const activeVoteProgress = computed(() =>
  activeTeamMemberCount.value
    ? Math.min(100, (activeVoteCount.value / activeTeamMemberCount.value) * 100)
    : 0,
);
const canManuallyResolve = computed(
  () =>
    !!battleActiveCard.value &&
    !battleRevealResult.value &&
    (battleConnMode.value === "offline" || battleRole.value === "host"),
);

const canOpenBattleTeam = (team: BattleTeam) => {
  if (battleConnMode.value === "offline") return true;
  if (battleRole.value === "host") return false;
  return battleMyTeam.value === team;
};

const battleCardClass = (card: BattleCard, team: BattleTeam) => {
  const base =
    team === "team1" ? "bg-blue-500 text-white" : "bg-rose-500 text-white";
  if (!card.opened) return base + " hover:brightness-110";
  if (card.kind === "bomb") return "bg-slate-800 text-red-300";
  return "bg-green-100 text-green-600 border border-green-200";
};

const battleOptionClass = (i: number) => {
  if (battleRevealResult.value) {
    if (i === battleRevealResult.value.correctIndex)
      return "bg-green-50 border-green-400 text-green-700";
    if (i === battleRevealResult.value.chosen)
      return "bg-red-50 border-red-300 text-red-500";
    return "bg-slate-50 border-slate-100 text-slate-300";
  }
  return "bg-white border-slate-200 hover:border-orange-300 hover:bg-orange-50";
};

const buildBattleCards = (questions: BattleQuestion[]): BattleCard[] => {
  const bombCount = Math.max(2, Math.round(questions.length * BOMB_RATIO));
  const cards: BattleCard[] = questions.map((q, i) => ({
    id: i,
    kind: "question",
    q,
    opened: false,
  }));
  for (let i = 0; i < bombCount; i++)
    cards.push({ id: 1000 + i, kind: "bomb", opened: false });
  return cards.sort(() => Math.random() - 0.5).map((c, i) => ({ ...c, id: i }));
};

const generateBattleQuestions = async (topic: string) => {
  battleGenerating.value = true;
  battleError.value = "";
  try {
    const result = await askAIJson<{ team1: any[]; team2: any[] }>(
      `Sen o'yin uchun savollar tuzuvchisan. "${topic}" mavzusida ikkita alohida jamoa uchun bittadan JSON obyekt tuzib ber. Har bir jamoa uchun aniq ${QUESTIONS_PER_TEAM} ta savol bo'lsin, ikkala jamoaning savollari bir-biridan butunlay farq qilishi kerak (bitta ham takrorlanmasin). Har bir savol {"question":"...","options":["A varianti","B varianti","C varianti","D varianti"],"correct":"A"} formatida bo'lsin (correct — to'g'ri javob harfi: A, B, C yoki D). Faqat quyidagi JSON formatda javob ber, boshqa hech narsa yozma: {"team1":[...${QUESTIONS_PER_TEAM} ta...],"team2":[...${QUESTIONS_PER_TEAM} ta...]}`,
      { team1: [], team2: [] },
    );
    const mapTeam = (arr: any[] | undefined): BattleQuestion[] =>
      (Array.isArray(arr) ? arr : [])
        .filter(
          (q) =>
            q &&
            typeof q.question === "string" &&
            Array.isArray(q.options) &&
            q.options.length === 4,
        )
        .slice(0, QUESTIONS_PER_TEAM)
        .map((q) => ({
          question: q.question,
          options: q.options,
          correctIndex: Math.max(
            0,
            ["A", "B", "C", "D"].indexOf(
              String(q.correct).trim().toUpperCase(),
            ),
          ),
        }));
    const t1 = mapTeam(result?.team1);
    const t2 = mapTeam(result?.team2);
    if (t1.length < 15 || t2.length < 15) {
      battleError.value = "AI yetarli savol tuza olmadi. Qayta urinib ko'ring.";
      return null;
    }
    return { team1: buildBattleCards(t1), team2: buildBattleCards(t2) };
  } catch (e) {
    console.error("battle question gen error", e);
    battleError.value = "Savollarni tuzishda xatolik. Qayta urinib ko'ring.";
    return null;
  } finally {
    battleGenerating.value = false;
  }
};

/* ---- OFFLINE FLOW ---- */
const startBattleOffline = async () => {
  if (!battleTopic.value.trim()) {
    battleError.value = "Mavzuni kiriting.";
    return;
  }
  if (battleTeamSize.value < 1) {
    battleError.value = "Kamida 3 ta o'yinchi kerak.";
    return;
  }
  const cards = await generateBattleQuestions(battleTopic.value.trim());
  if (!cards) return;
  battleTeams.value = cards;
  battleScores.value = { team1: 0, team2: 0 };
  battleRole.value = "host";
  battleConnMode.value = "offline";
  screen.value = "battle";
  battleScreen.value = "play";
};

/* ---- ONLINE FLOW (Supabase Realtime broadcast) ---- */
const genRoomCode = () =>
  Math.random().toString(36).substring(2, 7).toUpperCase();

const joinBattleChannel = async (code: string) => {
  battleChannel.value = supabase.channel(`battle_${code}`, {
    config: { broadcast: { self: true } },
  });
  battleChannel.value.on("broadcast", { event: "battle" }, ({ payload }: any) =>
    handleBattleEvent(payload),
  );
  await battleChannel.value.subscribe();
};

const sendBattleEvent = (payload: any) => {
  battleChannel.value?.send({ type: "broadcast", event: "battle", payload });
};

const HOST_ORIGIN_EVENTS = [
  "card_open",
  "reveal",
  "clear_active",
  "game_start",
  "game_over",
  "lobby_sync",
];

const handleBattleEvent = (payload: any) => {
  // Host already applies its own state changes locally before broadcasting,
  // so it should ignore the echo of its own host-origin events.
  if (battleRole.value === "host" && HOST_ORIGIN_EVENTS.includes(payload.type))
    return;

  switch (payload.type) {
    case "join": {
      if (battleRole.value !== "host") return;
      const t1 = battleLobbyPlayers.value.filter(
        (p) => p.team === "team1",
      ).length;
      const t2 = battleLobbyPlayers.value.filter(
        (p) => p.team === "team2",
      ).length;
      const team: BattleTeam = t1 <= t2 ? "team1" : "team2";
      battleLobbyPlayers.value.push({
        id: payload.id,
        name: payload.name,
        team,
      });
      sendBattleEvent({
        type: "lobby_sync",
        players: battleLobbyPlayers.value,
      });
      break;
    }
    case "lobby_sync": {
      battleLobbyPlayers.value = payload.players;
      const me = payload.players.find((p: any) => p.id === battleMyId.value);
      if (me) battleMyTeam.value = me.team;
      break;
    }
    case "game_start": {
      battleTeams.value = payload.teams;
      battleScores.value = { team1: 0, team2: 0 };
      battleLobbyPlayers.value = payload.players;
      const me = payload.players.find((p: any) => p.id === battleMyId.value);
      if (me) battleMyTeam.value = me.team;
      screen.value = "battle";
      battleScreen.value = "play";
      break;
    }
    case "request_open": {
      if (battleRole.value !== "host") return;
      openBattleCard(payload.team, payload.idx);
      break;
    }
    case "card_open": {
      const card = battleTeams.value[payload.team as BattleTeam][payload.idx];
      if (card) card.opened = true;
      if (payload.kind === "bomb") {
        battleScores.value = payload.scores;
        triggerBombFlash(payload.team);
        checkBattleEndForNonHost();
      } else {
        battleActiveCard.value = { team: payload.team, idx: payload.idx };
        battleVotes.value = {};
        battleVotedPlayers.value = new Set();
        battleRevealResult.value = null;
        startBattleTimer();
      }
      break;
    }
    case "vote": {
      if (!battleActiveCard.value) return;
      if (battleVotedPlayers.value.has(payload.playerId)) return;
      battleVotedPlayers.value.add(payload.playerId);
      battleVotes.value[payload.optIdx] =
        (battleVotes.value[payload.optIdx] || 0) + 1;
      if (battleRole.value === "host") {
        const teamSize = battleLobbyPlayers.value.filter(
          (p) => p.team === battleActiveCard.value!.team,
        ).length;
        if (teamSize > 0 && battleVotedPlayers.value.size >= teamSize)
          resolveBattleCard();
      }
      break;
    }
    case "reveal": {
      battleScores.value = payload.scores;
      battleRevealResult.value = {
        correct: payload.correct,
        chosen: payload.chosen,
        correctIndex: payload.correctIndex,
      };
      break;
    }
    case "clear_active": {
      battleActiveCard.value = null;
      battleRevealResult.value = null;
      checkBattleEndForNonHost();
      break;
    }
    case "game_over": {
      battleScreen.value = "over";
      break;
    }
  }
};

const createBattleRoom = async () => {
  if (!battleTopic.value.trim()) {
    battleError.value = "Mavzuni kiriting.";
    return;
  }
  battleRoomCode.value = genRoomCode();
  battleRole.value = "host";
  battleMyId.value = "host-" + Math.random().toString(36).slice(2, 8);
  battleLobbyPlayers.value = [];
  battleConnMode.value = "online";
  battleError.value = "";
  await joinBattleChannel(battleRoomCode.value);
  screen.value = "battle";
  battleScreen.value = "lobby";
};

const joinBattleRoom = async () => {
  if (!battleJoinCode.value.trim() || !battleJoinName.value.trim()) {
    battleError.value = "Kod va ismingizni kiriting.";
    return;
  }
  battleRole.value = "player";
  battleMyId.value = "p-" + Math.random().toString(36).slice(2, 8);
  battleRoomCode.value = battleJoinCode.value.trim().toUpperCase();
  battleConnMode.value = "online";
  battleError.value = "";
  await joinBattleChannel(battleRoomCode.value);
  sendBattleEvent({
    type: "join",
    id: battleMyId.value,
    name: battleJoinName.value.trim(),
  });
  screen.value = "battle";
  battleScreen.value = "lobby";
};

const startBattleOnline = async () => {
  if (battleLobbyPlayers.value.length < 2) {
    battleError.value = "Kamida 2 o'yinchi qo'shilishi kerak.";
    return;
  }
  const cards = await generateBattleQuestions(battleTopic.value.trim());
  if (!cards) return;
  battleTeams.value = cards;
  battleScores.value = { team1: 0, team2: 0 };
  sendBattleEvent({
    type: "game_start",
    teams: cards,
    players: battleLobbyPlayers.value,
  });
  battleScreen.value = "play";
};

const copyRoomCode = async () => {
  try {
    await navigator.clipboard.writeText(battleRoomCode.value);
    codeCopied.value = true;
    setTimeout(() => {
      codeCopied.value = false;
    }, 1500);
  } catch {
    /* clipboard unavailable, ignore */
  }
};

/* ---- shared play logic (offline host + online host) ---- */
const triggerBombFlash = (team: BattleTeam) => {
  bombFlashTeam.value = team;
  setTimeout(() => {
    bombFlashTeam.value = null;
  }, 600);
};

const openBattleCard = (team: BattleTeam, idx: number) => {
  if (battleActiveCard.value) return;
  const card = battleTeams.value[team][idx];
  if (!card || card.opened) return;

  if (battleConnMode.value === "online" && battleRole.value !== "host") {
    sendBattleEvent({
      type: "request_open",
      team,
      idx,
      playerId: battleMyId.value,
    });
    return;
  }

  card.opened = true;
  if (card.kind === "bomb") {
    battleScores.value[team] -= 10;
    flashScore(team, -10);
    triggerBombFlash(team);
    if (battleConnMode.value === "online")
      sendBattleEvent({
        type: "card_open",
        team,
        idx,
        kind: "bomb",
        scores: { ...battleScores.value },
      });
    checkBattleEnd();
    return;
  }

  battleActiveCard.value = { team, idx };
  battleVotes.value = {};
  battleVotedPlayers.value = new Set();
  battleRevealResult.value = null;
  if (battleConnMode.value === "online")
    sendBattleEvent({ type: "card_open", team, idx, kind: "question" });
  startBattleTimer();
};

const castBattleVote = (optIdx: number) => {
  if (!battleActiveCard.value || battleRevealResult.value) return;
  if (battleConnMode.value === "online") {
    if (battleRole.value === "host") return; // host only watches
    if (battleMyTeam.value !== battleActiveCard.value.team) return;
    sendBattleEvent({ type: "vote", optIdx, playerId: battleMyId.value });
    return;
  }
  // offline: unrestricted, any number of taps counts as votes
  battleVotes.value[optIdx] = (battleVotes.value[optIdx] || 0) + 1;
};

const startBattleTimer = () => {
  battleTimer.value = 30;
  clearInterval(battleTimerInterval);
  battleTimerInterval = setInterval(() => {
    battleTimer.value--;
    if (battleTimer.value <= 0) resolveBattleCard();
  }, 1000);
};

const resolveBattleCard = () => {
  if (!battleActiveCard.value) return;
  if (battleConnMode.value === "online" && battleRole.value !== "host") return;
  clearInterval(battleTimerInterval);
  const { team, idx } = battleActiveCard.value;
  const card = battleTeams.value[team][idx];
  if (!card?.q) return;

  const entries = Object.entries(battleVotes.value);
  let chosen: number;
  if (entries.length === 0) {
    chosen = Math.floor(Math.random() * 4);
  } else {
    const max = Math.max(...entries.map(([, v]) => v));
    const top = entries.filter(([, v]) => v === max).map(([k]) => Number(k));
    chosen = top[Math.floor(Math.random() * top.length)];
  }
  const correct = chosen === card.q.correctIndex;
  if (correct) {
    battleScores.value[team] += 20;
    flashScore(team, 20);
  }
  battleRevealResult.value = {
    correct,
    chosen,
    correctIndex: card.q.correctIndex,
  };

  if (battleConnMode.value === "online") {
    sendBattleEvent({
      type: "reveal",
      scores: { ...battleScores.value },
      correct,
      chosen,
      correctIndex: card.q.correctIndex,
    });
  }

  setTimeout(() => {
    battleActiveCard.value = null;
    battleRevealResult.value = null;
    if (battleConnMode.value === "online")
      sendBattleEvent({ type: "clear_active" });
    checkBattleEnd();
  }, 1800);
};

const battleAllOpened = () => {
  const done = (arr: BattleCard[]) => arr.every((c) => c.opened);
  return done(battleTeams.value.team1) && done(battleTeams.value.team2);
};

const checkBattleEnd = async () => {
  if (!battleAllOpened()) return;
  if (battleConnMode.value === "online" && battleRole.value !== "host") return;
  battleScreen.value = "over";
  battleCelebrate.value = true; // animatsiyali yakun ekrani
  if (battleConnMode.value === "online") sendBattleEvent({ type: "game_over" });
  await coinStore.fetchCoins();
  await coinStore.addProgress(20); // host reward — swap to coinStore.addCoins(20) if that method exists
};

const checkBattleEndForNonHost = () => {
  if (
    battleConnMode.value === "online" &&
    battleRole.value !== "host" &&
    battleAllOpened()
  ) {
    battleScreen.value = "over";
    battleCelebrate.value = true;
  }
};

const exitBattle = () => {
  clearInterval(battleTimerInterval);
  battleCelebrate.value = false;
  battleChannel.value?.unsubscribe?.();
  battleChannel.value = null;
  battleScreen.value = "config";
  battleActiveCard.value = null;
  battleRevealResult.value = null;
  battleTeams.value = { team1: [], team2: [] };
  battleScores.value = { team1: 0, team2: 0 };
  battleLobbyPlayers.value = [];
  battleRole.value = null;
  battleMyTeam.value = null;
  battleRoomCode.value = "";
  battleError.value = "";
  screen.value = "setup";
};
</script>

<style scoped>
@keyframes pop {
  0% {
    transform: scale(0.9);
  }

  60% {
    transform: scale(1.04);
  }

  100% {
    transform: scale(1);
  }
}

.animate-pop {
  animation: pop 0.28s ease-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-6px);
  }

  40% {
    transform: translateX(6px);
  }

  60% {
    transform: translateX(-4px);
  }

  80% {
    transform: translateX(4px);
  }
}

.animate-shake {
  animation: shake 0.35s ease-in-out;
}

@keyframes bounceSlow {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

.animate-bounce-slow {
  animation: bounceSlow 1.6s ease-in-out infinite;
}

@keyframes confettiFall {
  0% {
    transform: translateY(-40px) rotate(0deg);
    opacity: 1;
  }

  100% {
    transform: translateY(110vh) rotate(360deg);
    opacity: 0;
  }
}

.confetti {
  animation-name: confettiFall;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-rise {
  animation: rise 0.35s ease-out both;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active {
  transition: all 0.25s ease-out;
}

.modal-leave-active {
  transition: all 0.15s ease-in;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.row-enter-active,
.row-leave-active {
  transition: all 0.25s ease;
}

.row-enter-from,
.row-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
