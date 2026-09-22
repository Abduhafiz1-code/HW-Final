<template>
    <div
        class="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 pt-6 px-4 pb-28 md:pb-6">
        <div class="max-w-2xl mx-auto">
            <!-- Header -->
            <div class="flex items-center gap-3 mb-8 animate-rise">
                <RouterLink to="/"
                    class="w-10 h-10 rounded-2xl flex items-center justify-center bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/20 active:scale-90 transition">
                    ←
                </RouterLink>
                <div>
                    <h1 class="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span
                            class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-sm shadow-amber-300">
                            <Crown :size="18" />
                        </span>
                        Premium
                    </h1>
                    <p class="text-xs text-slate-500 dark:text-white/60 ml-11">Barcha imkoniyatlarni oching</p>
                </div>
            </div>

            <!-- Already premium banner -->
            <div v-if="authStore.isPremium"
                class="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white flex items-center gap-3 shadow-lg shadow-amber-200 dark:shadow-amber-800/30 animate-rise">
                <Crown :size="22" />
                <div>
                    <p class="font-black text-sm">Siz allaqachon Premium foydalanuvchisiz!</p>
                    <p class="text-xs opacity-90">Barcha imkoniyatlardan bemalol foydalaning.</p>
                </div>
            </div>

            <!-- ─── So'rov holati bannerlari (chek tekshirilmoqda / rad etildi) ─── -->
            <div v-else-if="myRequestStatus === 'pending'"
                class="mb-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center gap-3 animate-rise">
                <span class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock :size="20" class="text-blue-500 animate-pulse" />
                </span>
                <div>
                    <p class="font-black text-sm text-blue-700 dark:text-blue-300">Chekingiz tekshirilmoqda</p>
                    <p class="text-xs text-blue-500/80 dark:text-blue-300/70">To'lovni tasdiqlagach Premium avtomatik faollashadi (odatda 15-30 daqiqa)</p>
                </div>
            </div>
            <div v-else-if="myRequestStatus === 'rejected'"
                class="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-center gap-3 animate-rise">
                <span class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <XCircle :size="20" class="text-red-500" />
                </span>
                <div>
                    <p class="font-black text-sm text-red-600 dark:text-red-300">So'rov rad etildi</p>
                    <p class="text-xs text-red-400 dark:text-red-300/70">Chek to'g'ri bo'lmagan bo'lishi mumkin — qayta to'lab, yangi chek yuklashingiz mumkin</p>
                </div>
            </div>

            <!-- ─── Olmos buyurtmasi tekshirilmoqda banneri ─── -->
            <div v-if="myDiamondOrderStatus === 'pending'"
                class="mb-6 p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 flex items-center gap-3 animate-rise">
                <span class="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock :size="20" class="text-cyan-500 animate-pulse" />
                </span>
                <div>
                    <p class="font-black text-sm text-cyan-700 dark:text-cyan-300">Olmos buyurtmangiz tekshirilmoqda</p>
                    <p class="text-xs text-cyan-500/80 dark:text-cyan-300/70">Admin chekni tasdiqlagach olmoslar avtomatik hisobingizga tushadi (odatda 15-30 daqiqa)</p>
                </div>
            </div>

            <!-- Plans -->
            <div class="grid grid-cols-2 gap-3 mb-8">
                <!-- Free -->
                <div class="rounded-3xl p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm animate-rise transition-transform hover:-translate-y-0.5"
                    style="animation-delay: 60ms">
                    <div class="flex items-center gap-2 mb-3">
                        <span
                            class="px-2 py-1 text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white/70 rounded-xl">Free</span>
                    </div>
                    <div class="text-2xl font-black mb-3">0 so'm</div>
                    <ul class="space-y-2 text-xs text-slate-500 dark:text-white/60">
                        <li class="flex items-center gap-2">
                            <CheckCircle :size="14" class="text-green-500 flex-shrink-0" /> Test yechish
                        </li>
                        <li class="flex items-center gap-2">
                            <CheckCircle :size="14" class="text-green-500 flex-shrink-0" /> Mashqlar
                        </li>
                        <li class="flex items-center gap-2">
                            <CheckCircle :size="14" class="text-green-500 flex-shrink-0" /> O'yinlar
                        </li>
                    </ul>
                </div>

                <!-- Premium -->
                <div class="relative rounded-3xl p-5 bg-gradient-to-br from-amber-400 to-orange-500 text-white border border-amber-300 shadow-lg shadow-amber-200/30 dark:shadow-amber-800/30 animate-rise transition-transform hover:-translate-y-0.5 overflow-hidden"
                    style="animation-delay: 120ms">
                    <div class="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full animate-pulse-slow"></div>
                    <div class="flex items-center gap-2 mb-3">
                        <span
                            class="px-2 py-1 text-xs font-bold bg-white/25 text-white rounded-xl flex items-center gap-1">
                            <Crown :size="12" /> Premium
                        </span>
                    </div>
                    <div class="text-2xl font-black mb-3">29,000 so'm <span
                            class="text-sm font-medium opacity-80">/oy</span></div>
                    <ul class="space-y-2 text-xs relative">
                        <li class="flex items-center gap-2">
                            <CheckCircle :size="14" class="flex-shrink-0" /> Barcha bepul funksiyalar
                        </li>
                        <li class="flex items-center gap-2">
                            <Zap :size="14" class="flex-shrink-0" /> Cheksiz test yaratish
                        </li>
                        <li class="flex items-center gap-2">
                            <Rocket :size="14" class="flex-shrink-0" /> AI tahlil
                        </li>
                        <li class="flex items-center gap-2">
                            <Unlock :size="14" class="flex-shrink-0" /> Maxsus test formatlari
                        </li>
                        <li class="flex items-center gap-2">
                            <Star :size="14" class="flex-shrink-0" /> Reytingda ajralib turish
                        </li>
                        <li class="flex items-center gap-2">
                            <Gem :size="14" class="flex-shrink-0" /> Maxfiy sovg'alar
                        </li>
                    </ul>
                </div>
            </div>

            <!-- CTA -->
            <div v-if="!authStore.isPremium"
                class="text-center p-8 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm animate-rise"
                style="animation-delay: 180ms">
                <h2 class="font-black text-slate-900 dark:text-white text-lg mb-2">Hoziroq yangilang!</h2>
                <p class="text-xs text-slate-500 dark:text-white/60 mb-5">29,000 so'm/oy evaziga barcha imkoniyatlarni
                    qo'lga kiriting. So'rov yuborsangiz, operator siz bilan bog'lanadi.</p>
                <button @click="openModal"
                    class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-200 dark:shadow-amber-800/30 hover:opacity-90 transition active:scale-95">
                    <Rocket :size="18" /> Premiumga o'tish
                </button>
            </div>

            <!-- ─── OLmos do'koni (pulga olmos sotib olish) ─── -->
            <div class="mt-8 animate-rise" style="animation-delay: 220ms">
                <div class="flex items-center justify-between mb-3">
                    <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <Gem :size="20" class="text-cyan-500" /> Olmos do'koni
                    </h2>
                    <span class="flex items-center gap-1 text-sm font-black text-cyan-500">
                        <Gem :size="15" /> {{ coinStore.diamonds }}
                    </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-white/60 mb-4">
                    Ramkalar va sovg'alarni ochish uchun olmos — Payme yoki Click bilan sotib oling.
                </p>
                <div class="grid grid-cols-2 gap-3">
                    <div v-for="pkg in DIAMOND_PACKAGES" :key="pkg.diamonds"
                        class="relative rounded-3xl p-4 bg-white dark:bg-white/5 border-2 transition-transform hover:-translate-y-0.5 shadow-sm animate-rise"
                        :class="[
                            pkg.popular
                                ? 'border-cyan-400 dark:border-cyan-500/60 ring-2 ring-cyan-100 dark:ring-cyan-500/20'
                                : 'border-slate-200 dark:border-white/10',
                            myDiamondOrderStatus === 'pending' ? 'opacity-60' : '',
                        ]">
                        <span v-if="pkg.popular"
                            class="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-cyan-500 text-white text-[10px] font-black rounded-full shadow-md whitespace-nowrap">
                            OMMABOP
                        </span>
                        <div class="flex justify-center mb-2">
                            <Gem :size="34" :class="pkg.popular ? 'text-cyan-500' : 'text-cyan-400/80'" />
                        </div>
                        <p class="text-center text-xl font-black text-slate-900 dark:text-white">{{ pkg.diamonds }}</p>
                        <p class="text-center text-[11px] text-slate-400 font-medium mb-3">olmos</p>
                        <button @click="openDiamondModal(pkg)"
                            :disabled="myDiamondOrderStatus === 'pending'"
                            class="w-full py-2.5 rounded-xl font-black text-xs transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                            :class="pkg.popular
                                ? 'bg-gradient-to-r from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-200 dark:shadow-none hover:opacity-90'
                                : 'bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20'">
                            {{ myDiamondOrderStatus === 'pending' ? 'Tekshirilmoqda…' : pkg.price.toLocaleString('uz-UZ') + ' so\u2019m' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Request Modal -->
        <Transition name="modal">
            <div v-if="showModal"
                class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                @click.self="closeModal">
                <div
                    class="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-slate-200 dark:border-white/10">

                    <!-- Success state -->
                    <div v-if="submitted" class="text-center py-4 animate-pop">
                        <div
                            class="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle :size="32" class="text-green-500" />
                        </div>
                        <h3 class="font-black text-slate-900 dark:text-white text-lg mb-1">So'rov yuborildi!</h3>
                        <p class="text-sm text-slate-500 dark:text-white/60 mb-5">Tez orada operator siz bilan
                            bog'lanib, to'lov va Premium faollashtirish bo'yicha yordam beradi.</p>
                        <button @click="closeModal"
                            class="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition">
                            Yopish
                        </button>
                    </div>

                    <!-- Form state -->
                    <div v-else>
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Crown :size="20" class="text-amber-500" /> Premiumga so'rov
                            </h2>
                            <button @click="closeModal"
                                class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-90 transition">
                                <X :size="16" />
                            </button>
                        </div>

                        <div
                            class="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-3 mb-4 flex items-center justify-between">
                            <span class="text-xs font-bold text-amber-700 dark:text-amber-300">Premium (oylik)</span>
                            <span class="text-sm font-black text-amber-700 dark:text-amber-300">29,000 so'm</span>
                        </div>

                        <!-- ─── 1-QADAM: Kartaga pul o'tkazing ─── -->
                        <div class="mb-4">
                            <p class="text-xs font-black text-slate-500 dark:text-white/60 mb-2 flex items-center gap-1.5">
                                <span class="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">1</span>
                                Kartaga pul o'tkazing
                            </p>
                            <button type="button" @click="copyCardNumber"
                                class="w-full bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-4 text-left active:scale-[0.98] transition group">
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Uzcard / Humo</p>
                                <p class="text-lg font-black text-white tracking-wider flex items-center gap-2">
                                    {{ formattedCard }}
                                    <Copy :size="15" class="ml-auto text-slate-400 group-hover:text-white transition" />
                                </p>
                                <p class="text-[11px] text-slate-400 mt-1">{{ CARD_HOLDER }} — bosib nusxa oling</p>
                            </button>
                            <p v-if="cardCopied" class="text-[11px] text-green-600 font-black mt-1.5 flex items-center gap-1 animate-pop">
                                <Check :size="12" /> Karta raqami nusxalandi!
                            </p>
                        </div>

                        <!-- ─── 2-QADAM: Chek skrinshotini yuklang ─── -->
                        <div class="mb-4">
                            <p class="text-xs font-black text-slate-500 dark:text-white/60 mb-2 flex items-center gap-1.5">
                                <span class="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">2</span>
                                Chek skrinshotini yuklang
                            </p>
                            <label v-if="!receiptPreview"
                                class="block border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-5 text-center cursor-pointer hover:border-amber-400 transition">
                                <input type="file" accept="image/*" class="hidden" @change="onReceiptSelected" />
                                <Camera :size="24" class="text-slate-400 mx-auto mb-2" />
                                <p class="text-xs font-bold text-slate-500 dark:text-white/60">Rasm tanlash yoki suratga olish</p>
                                <p class="text-[10px] text-slate-400 mt-0.5">Maks 5MB — chekdagi summa va sana ko'rinishi kerak</p>
                            </label>
                            <div v-else class="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/15">
                                <img :src="receiptPreview" class="w-full max-h-44 object-contain bg-slate-50 dark:bg-white/5" />
                                <button type="button" @click="removeReceipt"
                                    class="absolute top-2 right-2 w-8 h-8 rounded-xl bg-black/60 text-white flex items-center justify-center hover:bg-black/80 active:scale-90 transition">
                                    <X :size="14" />
                                </button>
                            </div>
                        </div>

                        <!-- ─── 3-QADAM: Ma'lumotlaringiz ─── -->
                        <p class="text-xs font-black text-slate-500 dark:text-white/60 mb-2 flex items-center gap-1.5">
                            <span class="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">3</span>
                            Ma'lumotlaringiz
                        </p>
                        <div class="space-y-3">
                            <div>
                                <label
                                    class="text-xs font-bold text-slate-500 dark:text-white/60 mb-1 flex items-center gap-1">
                                    <User :size="12" /> Ismingiz
                                </label>
                                <input v-model="form.name" placeholder="To'liq ismingiz"
                                    class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-500/10 transition" />
                            </div>
                            <div>
                                <label
                                    class="text-xs font-bold text-slate-500 dark:text-white/60 mb-1 flex items-center gap-1">
                                    <Phone :size="12" /> Telefon raqam
                                </label>
                                <input v-model="form.phone" type="tel" placeholder="+998 90 123 45 67"
                                    class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-500/10 transition" />
                            </div>
                        </div>

                        <p v-if="errorMsg" class="text-xs text-red-400 mt-3 flex items-center gap-1">
                            <AlertCircle :size="13" /> {{ errorMsg }}
                        </p>

                        <button @click="submitRequest"
                            :disabled="submitting || !form.name.trim() || form.phone.trim().length < 7 || !receiptFile"
                            class="w-full mt-5 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black rounded-2xl text-sm hover:opacity-90 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2">
                            <Loader v-if="submitting" :size="16" class="animate-spin" />
                            <template v-else>
                                <Rocket :size="16" /> Chek bilan yuborish
                            </template>
                        </button>
                        <p class="text-[10px] text-slate-400 dark:text-white/40 text-center mt-2">
                            Admin chekni tasdiqlagach Premium avtomatik faollashadi
                        </p>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Diamond purchase modal -->
        <Transition name="modal">
            <div v-if="diamondPkg"
                class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                @click.self="diamondPkg = null">
                <div
                    class="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-slate-200 dark:border-white/10">
                    <div v-if="diamondSubmitted" class="text-center py-4 animate-pop">
                        <div
                            class="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                            <Gem :size="32" class="text-cyan-500" />
                        </div>
                        <h3 class="font-black text-slate-900 dark:text-white text-lg mb-1">Buyurtma qabul qilindi!</h3>
                        <p class="text-sm text-slate-500 dark:text-white/60 mb-5">
                            {{ diamondPkg.diamonds }} olmos uchun to'lovni amalga oshiring — operator tasdiqlagach olmoslar
                            hisobingizga tushadi (odatda 15 daqiqa ichida).
                        </p>
                        <button @click="diamondPkg = null"
                            class="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition">
                            Yopish
                        </button>
                    </div>

                    <div v-else>
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Gem :size="20" class="text-cyan-500" /> {{ diamondPkg.diamonds }} olmos
                            </h2>
                            <button @click="diamondPkg = null"
                                class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-90 transition">
                                <X :size="16" />
                            </button>
                        </div>

                        <div
                            class="bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 rounded-2xl p-3 mb-4 flex items-center justify-between">
                            <span class="text-xs font-bold text-cyan-700 dark:text-cyan-300">Narx</span>
                            <span class="text-sm font-black text-cyan-700 dark:text-cyan-300">{{ diamondPkg.price.toLocaleString('uz-UZ') }} so'm</span>
                        </div>

                        <!-- Karta ko'rsatish -->
                        <button type="button" @click="copyCardNumber"
                            class="w-full bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-3.5 text-left active:scale-[0.98] transition mb-4">
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Shu kartaga o'tkazing</p>
                            <p class="text-base font-black text-white tracking-wider">{{ formattedCard }}</p>
                            <p class="text-[10px] text-slate-400 mt-0.5">{{ CARD_HOLDER }} — bosib nusxa oling</p>
                        </button>

                        <!-- Chek yuklash -->
                        <label v-if="!receiptPreview"
                            class="block border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl p-4 text-center cursor-pointer hover:border-cyan-400 transition mb-4">
                            <input type="file" accept="image/*" class="hidden" @change="onReceiptSelected" />
                            <Camera :size="20" class="text-slate-400 mx-auto mb-1.5" />
                            <p class="text-xs font-bold text-slate-500 dark:text-white/60">To'lov chekini yuklang</p>
                            <p class="text-[10px] text-slate-400">Maks 5MB</p>
                        </label>
                        <div v-else class="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/15 mb-4">
                            <img :src="receiptPreview" class="w-full max-h-36 object-contain bg-slate-50 dark:bg-white/5" />
                            <button type="button" @click="removeReceipt"
                                class="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 text-white flex items-center justify-center hover:bg-black/80 active:scale-90 transition">
                                <X :size="13" />
                            </button>
                        </div>

                        <div class="space-y-3">
                            <div>
                                <label class="text-xs font-bold text-slate-500 dark:text-white/60 mb-1 flex items-center gap-1">
                                    <Phone :size="12" /> Telefon raqam (to'lov uchun)
                                </label>
                                <input v-model="diamondForm.phone" type="tel" placeholder="+998 90 123 45 67"
                                    class="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-500/10 transition" />
                            </div>
                        </div>

                        <p v-if="diamondError" class="text-xs text-red-400 mt-3 flex items-center gap-1">
                            <AlertCircle :size="13" /> {{ diamondError }}
                        </p>

                        <button @click="submitDiamondOrder"
                            :disabled="diamondSubmitting || diamondForm.phone.trim().length < 7 || !receiptFile"
                            class="w-full mt-5 py-3.5 bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-black rounded-2xl text-sm hover:opacity-90 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2">
                            <Loader v-if="diamondSubmitting" :size="16" class="animate-spin" />
                            <template v-else>
                                <Wallet :size="16" /> Chek bilan buyurtma qilish
                            </template>
                        </button>
                        <p class="text-[11px] text-slate-400 dark:text-white/40 text-center mt-3">
                            Yuborganingizdan keyin modalni yopsangiz ham buyurtma saqlanadi — admin tasdiqlagach olmoslar avtomatik qo'shiladi
                        </p>
                    </div>
                </div>
            </div>
        </Transition>

        <OnboardingTooltip pageId="Premium" title="Premium" description="Premium imkoniyatlar va afzalliklar" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { Gem, Star, Rocket, CheckCircle, Crown, Unlock, Zap, X, User, Phone, Loader, AlertCircle, Wallet, Copy, Camera, Check, Clock, XCircle } from '@lucide/vue';
import supabase from '../supabase';
import { useAuthStore } from '../stores/AuthStore';
import { useCoinStore } from '../stores/CoinStore';
import OnboardingTooltip from '../components/OnboardingTooltip.vue';

const authStore = useAuthStore();
const coinStore = useCoinStore();

// ⚠️ O'z karta raqamingizni shu yerga yozing (faqat o'tkazma qabul qiladigan karta)
const CARD_NUMBER = '8600 0000 0000 0000';
const CARD_HOLDER = 'Ismingiz Familiyangiz';
const EDGE_FUNCTION_NAME = 'send-telegram';

const formattedCard = computed(() => CARD_NUMBER); // allaqachon guruhlangan
const cardCopied = ref(false);
const copyCardNumber = async () => {
    try {
        await navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, ''));
        cardCopied.value = true;
        setTimeout(() => (cardCopied.value = false), 2000);
    } catch { /* clipboard ruxsatsiz */ }
};

// ─── Foydalanuvchining so'rov holati ────────────────────────────────
const myRequestStatus = ref<'pending' | 'active' | 'rejected' | null>(null);
const myDiamondOrderStatus = ref<'pending' | 'active' | 'rejected' | null>(null);
const fetchMyRequest = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
        .from('premium_requests')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
    myRequestStatus.value = (data?.[0]?.status as any) || null;
};
// Oxirgi olmos buyurtmasi holati (takroriy buyurtmani oldini olish uchun)
const fetchMyDiamondOrder = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
        .from('diamond_orders')
        .select('status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
    myDiamondOrderStatus.value = (data?.[0]?.status as any) || null;
};
onMounted(() => {
    fetchMyRequest();
    fetchMyDiamondOrder();
});

// ─── Chek fayli ─────────────────────────────────────────────────────
const receiptFile = ref<File | null>(null);
const receiptPreview = ref('');
const onReceiptSelected = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
        errorMsg.value = 'Chek rasmi 5MB dan kichik bo\u2019lishi kerak.';
        return;
    }
    errorMsg.value = '';
    receiptFile.value = file;
    const reader = new FileReader();
    reader.onload = () => (receiptPreview.value = reader.result as string);
    reader.readAsDataURL(file);
};
const removeReceipt = () => {
    receiptFile.value = null;
    receiptPreview.value = '';
};

// Chekni receipts bucket'ga yuklaydi → public URL emas, signed path qaytaradi
const uploadReceipt = async (userId: string, folder: string): Promise<string | null> => {
    if (!receiptFile.value) return null;
    const ext = receiptFile.value.name.split('.').pop() || 'jpg';
    const path = `${userId}/${folder}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
        .from('receipts')
        .upload(path, receiptFile.value, { contentType: receiptFile.value.type || 'image/jpeg' });
    if (error) {
        console.error('receipt upload error:', error);
        return null;
    }
    return path;
};

const showModal = ref(false);
const submitting = ref(false);
const submitted = ref(false);
const errorMsg = ref('');
const form = reactive({ name: '', phone: '' });

const openModal = () => {
    form.name = authStore.displayName || '';
    form.phone = '';
    submitted.value = false;
    errorMsg.value = '';
    removeReceipt();
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const submitRequest = async () => {
    if (!form.name.trim() || form.phone.trim().length < 7 || submitting.value) return;
    if (!receiptFile.value) {
        errorMsg.value = 'Iltimos, to\u2019lov chekining skrinshotini yuklang!';
        return;
    }
    submitting.value = true;
    errorMsg.value = '';
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('not logged in');

        // 1) Chekni storage'ga yuklaymiz
        const receiptPath = await uploadReceipt(user.id, 'premium');

        // 2) premium_requests jadvaliga yozamiz (status='pending')
        const { error: dbError } = await supabase.from('premium_requests').insert({
            user_id: user.id,
            plan: "Premium (29,000 so'm/oy)",
            receipt_url: receiptPath,
            payer_name: form.name.trim(),
            payer_phone: form.phone.trim(),
            status: 'pending',
        });
        if (dbError) throw dbError;

        // 3) Operator'ga Telegram xabar + chek linki
        await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
            body: {
                name: form.name.trim(),
                email: user.email || authStore.user?.email || '',
                phone: form.phone.trim(),
                plan: `Premium (29,000 so'm/oy) — chek: ${receiptPath || 'yuklanmadi'}`,
                userId: user.id,
            },
        });
        submitted.value = true;
        fetchMyRequest();
    } catch (e: any) {
        console.error('premium request error:', e);
        errorMsg.value = "Yuborishda xatolik yuz berdi. Qayta urinib ko'ring.";
    }
    submitting.value = false;
};

// ─── Olmos do'koni ──────────────────────────────────────────────────
const DIAMOND_PACKAGES = [
    { diamonds: 100, price: 9000, popular: false },
    { diamonds: 300, price: 24000, popular: true },
    { diamonds: 700, price: 49000, popular: false },
    { diamonds: 1500, price: 89000, popular: false },
];

const diamondPkg = ref<{ diamonds: number; price: number } | null>(null);
const diamondMethod = ref<'payme' | 'click'>('payme');
const diamondForm = reactive({ phone: '' });
const diamondSubmitting = ref(false);
const diamondSubmitted = ref(false);
const diamondError = ref('');

const openDiamondModal = (pkg: { diamonds: number; price: number }) => {
    diamondForm.phone = '';
    diamondSubmitted.value = false;
    diamondError.value = '';
    diamondMethod.value = 'payme';
    removeReceipt(); // premium modalidan qolgan eski chekni tozalaymiz
    diamondPkg.value = pkg;
};

const submitDiamondOrder = async () => {
    if (!diamondPkg.value || diamondForm.phone.trim().length < 7 || diamondSubmitting.value) return;
    if (!receiptFile.value) {
        diamondError.value = 'Iltimos, to\u2019lov chekining skrinshotini yuklang!';
        return;
    }
    diamondSubmitting.value = true;
    diamondError.value = '';
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('not logged in');
        // 1) Chekni storage'ga yuklaymiz
        const receiptPath = await uploadReceipt(user.id, `diamonds-${diamondPkg.value.diamonds}`);
        // 2) Buyurtma DB ga yoziladi (RLS: faqat o'zi ko'radi)
        const { error: dbError } = await supabase.from('diamond_orders').insert({
            user_id: user.id,
            diamonds: diamondPkg.value.diamonds,
            price_uzs: diamondPkg.value.price,
            payment_method: diamondMethod.value,
            receipt_url: receiptPath,
            status: 'pending',
        });
        if (dbError) throw dbError;
        // 3) Operator'ga Telegram xabar + chek linki
        await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
            body: {
                name: authStore.displayName || user.email,
                email: user.email || '',
                phone: diamondForm.phone.trim(),
                plan: `Olmos: ${diamondPkg.value.diamonds} ta (${diamondMethod.value}) — chek: ${receiptPath || 'yuklanmadi'}`,
                userId: user.id,
            },
        });
        diamondSubmitted.value = true;
        myDiamondOrderStatus.value = 'pending'; // darhol banner ko'rsatamiz
        fetchMyDiamondOrder();
    } catch (e: any) {
        console.error('diamond order error:', e);
        diamondError.value = "Buyurtma yuborilmadi. Qayta urinib ko'ring.";
    }
    diamondSubmitting.value = false;
};
</script>

<style scoped>
@keyframes rise {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-rise {
    animation: rise 0.45s ease-out both;
}

@keyframes pop {
    0% {
        opacity: 0;
        transform: scale(0.9);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.animate-pop {
    animation: pop 0.25s ease-out;
}

@keyframes pulseSlow {

    0%,
    100% {
        opacity: 0.5;
        transform: scale(1);
    }

    50% {
        opacity: 0.9;
        transform: scale(1.15);
    }
}

.animate-pulse-slow {
    animation: pulseSlow 3s ease-in-out infinite;
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

.modal-enter-from>div,
.modal-leave-to>div {
    transform: scale(0.94) translateY(6px);
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
</style>