// "So'z yodlash — B1" event uchun 30 ta B1 darajadagi inglizcha so'z.
// Har biri: inglizcha so'z + to'g'ri tarjima + 3 ta chalg'ituvchi variant.
export interface VocabWord {
  word: string;
  correct: string;
  options: string[];
}

export const VOCAB_B1: VocabWord[] = [
  { word: "achieve", correct: "erishmoq", options: ["erishmoq", "qochmoq", "unutmoq", "kutmoq"] },
  { word: "borrow", correct: "qarzga olmoq", options: ["sotmoq", "qarzga olmoq", "sovg'a qilmoq", "yo'qotmoq"] },
  { word: "complain", correct: "shikoyat qilmoq", options: ["maqtamoq", "shikoyat qilmoq", "kulmoq", "raqsga tushmoq"] },
  { word: "decision", correct: "qaror", options: ["savol", "qaror", "taklif", "xato"] },
  { word: "environment", correct: "atrof-muhit", options: ["atrof-muhit", "bino", "transport", "ovqat"] },
  { word: "fortunately", correct: "baxtimizga", options: ["afsuski", "baxtimizga", "kamdan-kam", "tez orada"] },
  { word: "guess", correct: "taxmin qilmoq", options: ["taxmin qilmoq", "isbotlamoq", "rad etmoq", "eslamoq"] },
  { word: "habit", correct: "odat", options: ["odat", "qoida", "sabab", "natija"] },
  { word: "improve", correct: "yaxshilamoq", options: ["yomonlashtirmoq", "yaxshilamoq", "buzmoq", "to'xtatmoq"] },
  { word: "journey", correct: "sayohat", options: ["ovqat", "sayohat", "kiyim", "ish"] },
  { word: "knowledge", correct: "bilim", options: ["bilim", "pul", "vaqt", "kuch"] },
  { word: "loyal", correct: "sodiq", options: ["dangasa", "sodiq", "g'azablangan", "charchagan"] },
  { word: "manage", correct: "boshqarmoq", options: ["boshqarmoq", "unutmoq", "yashirmoq", "yo'qotmoq"] },
  { word: "necessary", correct: "zarur", options: ["zarur", "keraksiz", "qiziqarli", "arzon"] },
  { word: "opportunity", correct: "imkoniyat", options: ["muommo", "imkoniyat", "xavf", "shubha"] },
  { word: "patient", correct: "sabrli", options: ["shoshqaloq", "sabrli", "qo'rqoq", "jasur"] },
  { word: "quality", correct: "sifat", options: ["sifat", "narx", "og'irlik", "shakl"] },
  { word: "reasonable", correct: "oqilona", options: ["qimmat", "oqilona", "g'alati", "xavfli"] },
  { word: "similar", correct: "o'xshash", options: ["o'xshash", "farqli", "qarama-qarshi", "teng"] },
  { word: "trust", correct: "ishonch", options: ["shubha", "ishonch", "qo'rquv", "g'azab"] },
  { word: "unusual", correct: "g'ayrioddiy", options: ["oddiy", "g'ayrioddiy", "tanish", "arzon"] },
  { word: "valuable", correct: "qimmatli", options: ["qimmatli", "arzon", "og'ir", "yengil"] },
  { word: "wonder", correct: "hayron qolmoq", options: ["hayron qolmoq", "kulmoq", "yig'lamoq", "yugurmoq"] },
  { word: "advantage", correct: "afzallik", options: ["afzallik", "kamchilik", "xavf", "sabab"] },
  { word: "behavior", correct: "xulq-atvor", options: ["xulq-atvor", "ko'rinish", "ovoz", "his-tuyg'u"] },
  { word: "confident", correct: "o'ziga ishongan", options: ["qo'rqoq", "o'ziga ishongan", "xafa", "charchagan"] },
  { word: "encourage", correct: "rag'batlantirmoq", options: ["qo'rqitmoq", "rag'batlantirmoq", "to'xtatmoq", "unutmoq"] },
  { word: "favor", correct: "yaxshilik", options: ["yaxshilik", "yomonlik", "xato", "javob"] },
  { word: "generous", correct: "saxiy", options: ["ochko'z", "saxiy", "jahldor", "dangasa"] },
  { word: "honest", correct: "halol", options: ["halol", "yolg'onchi", "qo'rqoq", "shoshqaloq"] },
];
