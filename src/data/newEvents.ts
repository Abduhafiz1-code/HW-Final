// Yangi event'lar uchun ma'lumotlar:
//  1) "Tezkor Matematika Sprinti" — vaqtga qarshi hisoblash
//  2) "Ingliz Idiomalar Boyligi" — idiomalarning ma'nosini topish
//  3) "Doimiy Fanlar Marafoni" — fanlar aralash, daraja bosqichma-bosqich oshadi

export interface SprintTask {
  question: string;
  answer: number;
  options: number[];
}

// 20 ta tezkor hisoblash savoli (1-variant javoblari bilan)
export const MATH_SPRINT: SprintTask[] = [
  { question: "7 × 8 = ?", answer: 56, options: [54, 56, 63, 48] },
  { question: "144 ÷ 12 = ?", answer: 12, options: [11, 12, 14, 16] },
  { question: "15 + 27 = ?", answer: 42, options: [32, 42, 43, 52] },
  { question: "9² = ?", answer: 81, options: [72, 81, 89, 99] },
  { question: "√169 = ?", answer: 13, options: [11, 12, 13, 14] },
  { question: "3/5 ni foizda ifodalang", answer: 60, options: [35, 45, 60, 75] },
  { question: "12 × 12 = ?", answer: 144, options: [124, 132, 144, 156] },
  { question: "100 − 37 = ?", answer: 63, options: [53, 63, 67, 73] },
  { question: "18 + 5 × 2 = ?", answer: 28, options: [46, 28, 23, 33] },
  { question: "72 ÷ 8 = ?", answer: 9, options: [8, 9, 10, 12] },
  { question: "2⁵ = ?", answer: 32, options: [10, 16, 32, 64] },
  { question: "45 ning 20% i = ?", answer: 9, options: [4, 9, 11, 15] },
  { question: "6 × 9 = ?", answer: 54, options: [45, 54, 56, 63] },
  { question: "81 ÷ 9 = ?", answer: 9, options: [7, 8, 9, 11] },
  { question: "50% + 25% = ? (butundan)", answer: 75, options: [70, 75, 80, 85] },
  { question: "11 × 11 = ?", answer: 121, options: [111, 121, 122, 132] },
  { question: "200 ÷ 4 = ?", answer: 50, options: [40, 45, 50, 60] },
  { question: "17 − 9 = ?", answer: 8, options: [6, 7, 8, 9] },
  { question: "5! (faktorial) = ?", answer: 120, options: [60, 100, 120, 125] },
  { question: "0.5 × 24 = ?", answer: 12, options: [10, 12, 14, 24] },
];

export interface IdiomTask {
  idiom: string;
  meaning: string;
  options: string[];
}

// 15 ta inglizcha idiom + o'zbekcha ma'no
export const IDIOMS: IdiomTask[] = [
  { idiom: "Break the ice", meaning: "Muhokamani boshlamoq (noqulaylikni yo'qotmoq)", options: ["Muhokamani boshlamoq (noqulaylikni yo'qotmoq)", "Muzni sindirmoq", "Jangni boshlamoq", "Sovuq bo'lmoq"] },
  { idiom: "Piece of cake", meaning: "Juda oson ish", options: ["Shirinlik", "Juda oson ish", "Kichik bo'lak", "Bayram sovg'asi"] },
  { idiom: "Hit the books", meaning: "Qattiq o'qishni boshlamoq", options: ["Kitob tashlamoq", "Kitob o'qimoq", "Qattiq o'qishni boshlamoq", "Kitob do'koniga bormoq"] },
  { idiom: "Under the weather", meaning: "O'zini yomon his qilmoq (kasal)", options: ["Yomg'irda qolmoq", "O'zini yomon his qilmoq (kasal)", "Sovuq joyda turmoq", "Kayfiyati yuqori"] },
  { idiom: "Let the cat out of the bag", meaning: "Sirni ochib qo'ymoq", options: ["Mushukni qutqarmoq", "Sirni ochib qo'ymoq", "Xatoni tuzatmoq", "Sovg'a bermoq"] },
  { idiom: "Once in a blue moon", meaning: "Juda kamdan-kam", options: ["Har kuni", "Juda kamdan-kam", "Tun bo'yi", "Har oyda bir"] },
  { idiom: "Burn the midnight oil", meaning: "Kechagacha ishlamoq/o'qimoq", options: ["Kechagacha ishlamoq/o'qimoq", "Yoqilg'i tejamoq", "Sham yondirmoq", "Ertalab erta turmoq"] },
  { idiom: "Spill the beans", meaning: "Maxfiyotni aytib berib qo'ymoq", options: ["Yemoq-ichmoq", "Maxfiyotni aytib berib qo'ymoq", "Ovqat to'kmoq", "Yolg'on gapirmoq"] },
  { idiom: "On cloud nine", meaning: "Baxtidan osmonga sig'moq", options: ["Osmonda uchmoq", "Baxtidan osmonga sig'moq", "Uyqusiz", "Bulutli kun"] },
  { idiom: "Cost an arm and a leg", meaning: "Juda qimmat bo'lmoq", options: ["Juda qimmat bo'lmoq", "Juda arzon", "Jarohat olmoq", "Shifokorga borish"] },
  { idiom: "Keep an eye on", meaning: "Kuzatib turmoq", options: ["Ko'zini yummoq", "Kuzatib turmoq", "Ko'z yosh to'kmоq", "Birmoq"] },
  { idiom: "Call it a day", meaning: "Ishni shu kunga yakunlamoq", options: ["Kunni nomlamoq", "Ishni shu kunga yakunlamoq", "Kecha kundiz ishlamoq", "Uyga chaqirmoq"] },
  { idiom: "Get cold feet", meaning: "Jinjitib qolmoq (qarordan qaytmoq)", options: ["Muzlagan oyoq", "Jinjitib qolmoq (qarordan qaytmoq)", "Yugurmoq", "Sovuq suvda yurmоq"] },
  { idiom: "Bite the bullet", meaning: "Qiyin holatga shoshilinch munosabat bildirmoq, chidamoq", options: ["O'q yemoq", "Qiyin holatga chidamoq, qaror qabul qilmoq", "Ovqat tishlamoq", "Qo'rqoqlik bilan gapirmoq"] },
  { idiom: "The ball is in your court", meaning: "Endi qaror seni qaror — sening navbating", options: ["Tennis o'ynamoq", "Endi navbat seniki — qaror ber", "Top yo'qoldi", "Adolatsiz holat"] },
];

export interface MarathonQuestion {
  question: string;
  options: string[];
  answer: string;
  stage: number; // 1..3 — bosqich qiyinligi
  subject: string;
}

// 24 savol: 3 bosqich (1-easy, 2-o'rta, 3-qiyin) × 8 ta fan aralash
export const MARATHON: MarathonQuestion[] = [
  // Bosqich 1
  { question: "2 + 2 × 3 = ?", options: ["8", "10", "12", "6"], answer: "8", stage: 1, subject: "Matematika" },
  { question: "Suvning kimyoviy formulasi?", options: ["H2O", "CO2", "O2", "NaCl"], answer: "H2O", stage: 1, subject: "Kimyo" },
  { question: "\"Book\" so'zining tarjimasi?", options: ["Daftar", "Kitob", "Qalam", "Stol"], answer: "Kitob", stage: 1, subject: "Ingliz tili" },
  { question: "Quyosh sistemasidagi eng katta planeta?", options: ["Yer", "Mars", "Yupiter", "Venera"], answer: "Yupiter", stage: 1, subject: "Fizika" },
  { question: "O'zbekiston poytaxti?", options: ["Samarqand", "Buxoro", "Toshkent", "Xiva"], answer: "Toshkent", stage: 1, subject: "Geografiya" },
  { question: "Kvadratning tomonlari nechta?", options: ["3", "4", "5", "6"], answer: "4", stage: 1, subject: "Matematika" },
  { question: "Fotosintez qaysi organda kechadi?", options: ["Ildiz", "Poya", "Barg", "Gul"], answer: "Barg", stage: 1, subject: "Biologiya" },
  { question: "1 kilogramm necha gramm?", options: ["10", "100", "1000", "10000"], answer: "1000", stage: 1, subject: "Fizika" },
  // Bosqich 2
  { question: "12 ning 25% i nechaga teng?", options: ["2", "3", "4", "6"], answer: "3", stage: 2, subject: "Matematika" },
  { question: "\"She ___ to school every day\" — to'ldirish", options: ["go", "goes", "going", "gone"], answer: "goes", stage: 2, subject: "Ingliz tili" },
  { question: "Amir Temur qaysi asrda yashagan?", options: ["XIII", "XIV", "XV", "XVI"], answer: "XIV", stage: 2, subject: "Tarix" },
  { question: "Yer Quyosh atrofini necha kunda aylanib chiqadi?", options: ["1 kun", "30 kun", "365 kun", "1000 kun"], answer: "365 kun", stage: 2, subject: "Geografiya" },
  { question: "Tenglamani yeching: 3x = 27", options: ["6", "8", "9", "12"], answer: "9", stage: 2, subject: "Matematika" },
  { question: "Inson yurakda nechta bo'luqcha (kamera) bor?", options: ["2", "3", "4", "5"], answer: "4", stage: 2, subject: "Biologiya" },
  { question: "Elektr tokini o'tkazmaydigan modda?", options: ["Mis", "Izolyator", "Aluminiy", "Kumush"], answer: "Izolyator", stage: 2, subject: "Fizika" },
  { question: "\"Library\" so'zi nimani anglatadi?", options: ["Kitob do'koni", "Kutubxona", "O'quv xonasi", "Labaratoriya"], answer: "Kutubxona", stage: 2, subject: "Ingliz tili" },
  // Bosqich 3
  { question: "Agar y = 2x² va x = 5 bo'lsa, y = ?", options: ["20", "25", "50", "100"], answer: "50", stage: 3, subject: "Matematika" },
  { question: "Past Simple'da \"write\" fe'lining 2-formasi?", options: ["writed", "wrote", "written", "writing"], answer: "wrote", stage: 3, subject: "Ingliz tili" },
  { question: "Temirning kimyoviy belgisi?", options: ["Fe", "Au", "Ag", "Cu"], answer: "Fe", stage: 3, subject: "Kimyo" },
  { question: "144 ni ildiz ostidan chiqaring", options: ["11", "12", "13", "14"], answer: "12", stage: 3, subject: "Matematika" },
  { question: "Amir Temur davlati poytaxti?", options: ["Samarqand", "Buxoro", "Xiva", "Qo'qon"], answer: "Samarqand", stage: 3, subject: "Tarix" },
  { question: "DNK turgan joy (hujayrada)?", options: ["Sitoplazma", "Yadro", "Ribosoma", "Vakuol"], answer: "Yadro", stage: 3, subject: "Biologiya" },
  { question: "Tezlik formulasi qaysi?", options: ["v = s/t", "v = s·t", "v = t/s", "v = s + t"], answer: "v = s/t", stage: 3, subject: "Fizika" },
  { question: "Eng uzun daryo dunyoda?", options: ["Amudaryo", "Nil", "Sirdaryo", "Yangizej"], answer: "Nil", stage: 3, subject: "Geografiya" },
];
