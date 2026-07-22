// "Fanlar testi — B2" event uchun 4 ta fan, har birida savollar to'plami.
export interface SubjectQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Subject {
  key: string;
  title: string;
  icon: string; // lucide icon nomi
  questions: SubjectQuestion[];
}

export const SUBJECTS_B2: Subject[] = [
  {
    key: "math",
    title: "Matematika",
    icon: "Sigma",
    questions: [
      { question: "2x + 6 = 14 bo'lsa, x = ?", options: ["2", "4", "6", "8"], correctIndex: 1 },
      { question: "5! (5 faktorial) ga teng?", options: ["20", "60", "120", "720"], correctIndex: 2 },
      { question: "Uchburchak burchaklari yig'indisi necha gradus?", options: ["90", "180", "270", "360"], correctIndex: 1 },
      { question: "√144 ga teng?", options: ["10", "11", "12", "14"], correctIndex: 2 },
      { question: "3/4 ni foizga aylantiring", options: ["34%", "43%", "75%", "80%"], correctIndex: 2 },
      { question: "Agar y = 2x^2 va x = 3 bo'lsa, y = ?", options: ["6", "9", "12", "18"], correctIndex: 3 },
      { question: "Doira maydoni formulasi qaysi?", options: ["2πr", "πr²", "πd", "r²"], correctIndex: 1 },
      { question: "15 ning 20% i nechaga teng?", options: ["2", "3", "4", "5"], correctIndex: 1 },
    ],
  },
  {
    key: "english",
    title: "Ingliz tili",
    icon: "Languages",
    questions: [
      { question: "Choose the correct form: \"She ___ to school every day.\"", options: ["go", "goes", "going", "gone"], correctIndex: 1 },
      { question: "Synonym of \"huge\"?", options: ["tiny", "enormous", "quiet", "narrow"], correctIndex: 1 },
      { question: "\"I have lived here ___ 2015.\" — fill in the blank", options: ["for", "since", "during", "at"], correctIndex: 1 },
      { question: "Past participle of \"write\"?", options: ["wrote", "writed", "written", "writing"], correctIndex: 2 },
      { question: "Which sentence is correct?", options: ["He don't like it", "He doesn't likes it", "He doesn't like it", "He not like it"], correctIndex: 2 },
      { question: "Antonym of \"generous\"?", options: ["kind", "stingy", "polite", "honest"], correctIndex: 1 },
      { question: "\"If I ___ rich, I would travel the world.\"", options: ["am", "was", "were", "be"], correctIndex: 2 },
      { question: "Which word is a conjunction?", options: ["quickly", "although", "beautiful", "table"], correctIndex: 1 },
    ],
  },
  {
    key: "programming",
    title: "Dasturlash",
    icon: "Code2",
    questions: [
      { question: "HTML nima uchun ishlatiladi?", options: ["Stilizatsiya", "Sahifa tuzilmasi", "Server mantiqi", "Ma'lumotlar bazasi"], correctIndex: 1 },
      { question: "Massiv (array) indeksi odatda nechadan boshlanadi?", options: ["-1", "0", "1", "2"], correctIndex: 1 },
      { question: "\"for\" siklining asosiy vazifasi nima?", options: ["Shart tekshirish", "Takrorlash", "Funksiya chaqirish", "Xato ushlash"], correctIndex: 1 },
      { question: "CSS nima uchun ishlatiladi?", options: ["Dizayn/stil", "Ma'lumot saqlash", "Server sozlash", "Xavfsizlik"], correctIndex: 0 },
      { question: "Git'da o'zgarishlarni saqlash buyrug'i?", options: ["git push", "git commit", "git clone", "git branch"], correctIndex: 1 },
      { question: "API nimani anglatadi?", options: ["Application Programming Interface", "Automated Process Input", "Array Program Index", "Advanced Page Integration"], correctIndex: 0 },
      { question: "JSON qanday format?", options: ["Rasm formati", "Video formati", "Ma'lumot almashish formati", "Musiqa formati"], correctIndex: 2 },
      { question: "\"function\" kalit so'zi nima uchun ishlatiladi?", options: ["O'zgaruvchi yaratish", "Funksiya e'lon qilish", "Sinf yaratish", "Fayl ochish"], correctIndex: 1 },
    ],
  },
  {
    key: "history",
    title: "Tarix",
    icon: "Landmark",
    questions: [
      { question: "Amir Temur qaysi asrda yashagan?", options: ["12-asr", "14-asr", "16-asr", "18-asr"], correctIndex: 1 },
      { question: "Ipak yo'li asosan nimani bog'lagan?", options: ["Yevropa va Amerika", "Osiyo va Yevropa", "Afrika va Avstraliya", "Shimoliy va Janubiy qutb"], correctIndex: 1 },
      { question: "O'zbekiston mustaqilligini qachon e'lon qilgan?", options: ["1989", "1991", "1993", "1995"], correctIndex: 1 },
      { question: "Sohibqiron laqabi kimga tegishli?", options: ["Ulug'bek", "Amir Temur", "Bobur", "Al-Xorazmiy"], correctIndex: 1 },
      { question: "Al-Xorazmiy qaysi soha bilan mashhur?", options: ["Tibbiyot", "Matematika/Algebra", "Musiqa", "Me'morchilik"], correctIndex: 1 },
      { question: "Birinchi Jahon urushi qaysi yilda boshlangan?", options: ["1905", "1914", "1929", "1939"], correctIndex: 1 },
      { question: "Ikkinchi Jahon urushi qachon tugagan?", options: ["1943", "1945", "1947", "1950"], correctIndex: 1 },
      { question: "Registon majmuasi qaysi shaharda joylashgan?", options: ["Buxoro", "Xiva", "Samarqand", "Termiz"], correctIndex: 2 },
    ],
  },
];
