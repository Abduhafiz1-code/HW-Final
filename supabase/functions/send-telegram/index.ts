import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token",
};

// Telegram MarkdownV1 maxsus belgilarini escape qilish (xabar yuborilmay qolishining oldini oladi)
function escapeMarkdown(text: string): string {
  if (!text) return "";
  return String(text).replace(/([_*`\[])/g, "\\$1");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");
    const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET"); // Telegram setWebhook?secret_token=... bilan birga o'rnatiladi
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://gnuwumkdffpnltrglgxk.supabase.co";
    const SUPABASE_SERVICE_KEY = Deno.env.get("SERVICE_ROLE_KEY");

    const body = await req.json();

    // Service key majburiy — yo'q bo'lsa hamma DB operatsiyalari ishlamaydi
    if (!SUPABASE_SERVICE_KEY) {
      console.log("SERVICE_ROLE_KEY o'rnatilmagan!");
      return new Response(JSON.stringify({ error: "Missing SERVICE_ROLE_KEY" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // ===== FEEDBACK xabari (eng birinchi tekshiriladi!) =====
    if (body.type === "feedback") {
      const { name, email, category, message, userId } = body;

      const categoryLabels: Record<string, string> = {
        bug: "🐞 Xatolik haqida",
        feature: "💡 Taklif / yangi funksiya",
        other: "💬 Boshqa",
      };

      const tgMessage = `📝 *Yangi Feedback!*

👤 *Ism:* ${escapeMarkdown(name) || "Noma'lum"}
📧 *Email:* ${escapeMarkdown(email) || "—"}
🏷 *Turi:* ${categoryLabels[category] || escapeMarkdown(category)}
🆔 *User ID:* \`${userId || "—"}\`

✍️ *Xabar:*
${escapeMarkdown(message)}`;

      const sent = await sendTelegramMessage(BOT_TOKEN, CHAT_ID, tgMessage);
      console.log("feedback -> telegram sent:", sent);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== Test natijalarini tanlangan guruhga (Telegram kanaliga) yuborish =====
    if (body.type === "send_results") {
      const { testId, groupId } = body;
      const authHeader = req.headers.get("Authorization") || "";
      const jwt = authHeader.replace("Bearer ", "");

      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      // Chaqirgan foydalanuvchini (o'qituvchini) aniqlaymiz
      const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(jwt);
      if (userErr || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const teacherId = userData.user.id;

      // Guruh shu o'qituvchiga tegishli ekanini va Telegramga ulanganini tekshiramiz
      const { data: group } = await supabaseAdmin
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .eq("teacher_id", teacherId)
        .maybeSingle();

      if (!group) {
        return new Response(JSON.stringify({ error: "Guruh topilmadi" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (group.telegram_status !== "linked" || !group.telegram_chat_id) {
        return new Response(JSON.stringify({ error: "Guruh Telegramga ulanmagan" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: test } = await supabaseAdmin.from("tests").select("*").eq("id", testId).single();
      const { data: results } = await supabaseAdmin
        .from("test_results")
        .select("*, profiles(full_name, email)")
        .eq("test_id", testId)
        .order("percent", { ascending: false });

      if (!test || !results || results.length === 0) {
        return new Response(JSON.stringify({ error: "Natija topilmadi" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let sentCount = 0;
      for (const r of results) {
        const { data: answers } = await supabaseAdmin
          .from("test_answers")
          .select("*")
          .eq("result_id", r.id)
          .order("question_index", { ascending: true });

        const studentName = r.profiles?.full_name || r.profiles?.email || "Noma'lum";
        let msg = `📊 *${escapeMarkdown(test.title)}*\n👤 *${escapeMarkdown(studentName)}* — ${r.score}/${r.total} (${r.percent}%)\n\n`;

        for (const a of answers || []) {
          const q = test.questions[a.question_index];
          if (!q) continue;
          const chosenText = a.chosen_option != null ? q.options[a.chosen_option] : "(javob berilmagan)";
          const correctText = q.options[a.correct_option];
          const icon = a.is_correct ? "✅" : "❌";
          msg += `${icon} *${a.question_index + 1}-savol:* ${escapeMarkdown(q.question)}\n`;
          if (!a.is_correct) {
            msg += `   Tanladi: ${escapeMarkdown(chosenText)}\n   To'g'ri: ${escapeMarkdown(correctText)}\n`;
          }
          msg += `\n`;
        }

        await sendTelegramMessage(BOT_TOKEN, String(group.telegram_chat_id), msg);
        sentCount++;
      }

      return new Response(JSON.stringify({ success: true, sent: sentCount }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ===== Telegram dan kelgan webhook (bot command / kanal xabari) =====
    const incomingMsg = body.message || body.channel_post;

    if (incomingMsg) {
      // --- Xavfsizlik: Telegram webhook secret token tekshiruvi ---
      if (WEBHOOK_SECRET) {
        const incomingSecret = req.headers.get("x-telegram-bot-api-secret-token");
        if (incomingSecret !== WEBHOOK_SECRET) {
          console.log("Webhook secret mismatch, rejecting request");
          return new Response("ok"); // Telegram qayta urinishining oldini olish uchun 200 qaytaramiz
        }
      } else {
        console.log("WARNING: TELEGRAM_WEBHOOK_SECRET o'rnatilmagan, secret token tekshirilmayapti!");
      }

      let text: string = incomingMsg.text || incomingMsg.caption || "";
      const chatId = incomingMsg.chat.id;

      console.log("Incoming telegram message. chatId:", chatId, "expected CHAT_ID:", CHAT_ID, "text:", text);

      // ===== Guruhni Telegram kanaliga/guruhiga bog'lash (link_code) =====
      // Istalgan chatdan kelishi mumkin, shuning uchun CHAT_ID tekshiruvidan OLDIN turadi
      const linkMatch = text.match(/#([a-z0-9]{6})/i);
      if (linkMatch) {
        const linkCode = linkMatch[1].toLowerCase();
        const supabaseLink = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        const { data: group, error: groupErr } = await supabaseLink
          .from("groups")
          .update({ telegram_chat_id: chatId, telegram_status: "linked" })
          .eq("telegram_link_code", linkCode)
          .select()
          .maybeSingle();

        if (group) {
          await sendTelegramMessage(
            BOT_TOKEN,
            String(chatId),
            `✅ Guruh "${escapeMarkdown(group.name)}" muvaffaqiyatli ulandi! Endi natijalar shu yerga yuboriladi.`,
          );
        } else {
          console.log("link_code topilmadi yoki xato:", groupErr?.message);
        }
        return new Response("ok");
      }

      // ===== Pastdagi bot buyruqlari faqat asosiy admin chatidan qabul qilinadi =====
      if (String(chatId) !== String(CHAT_ID)) {
        console.log("chatId mismatch, rejecting (no telegram reply sent for unauthorized chat)");
        return new Response("ok"); // Telegram qayta urinishining oldini olish uchun 200 qaytaramiz
      }

      // Guruh chatlarida Telegram ba'zan "/premium@BotUsername USER_ID" formatida yuboradi.
      // @username qismini olib tashlaymiz, shunda startsWith tekshiruvlari ishlaydi.
      text = text.replace(/^(\/[a-zA-Z_]+)@\S+/, "$1");

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      if (text.startsWith("/premium ")) {
        const userId = text.replace("/premium ", "").trim();
        if (!userId) {
          await sendTelegramMessage(BOT_TOKEN, CHAT_ID, "❌ User ID kiriting!\nMasalan: /premium abc123");
          return new Response("ok");
        }

        // 1) Auth user_metadata yangilaymiz
        const { data: userData, error } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { is_premium: true },
        });

        if (error) {
          console.log("auth.admin.updateUserById error:", error.message);
          await sendTelegramMessage(BOT_TOKEN, CHAT_ID, `❌ Xatolik: ${escapeMarkdown(error.message)}`);
          return new Response("ok");
        }

        // 2) profiles jadvalini ham yangilaymiz
        const untilDate = new Date();
        untilDate.setMonth(untilDate.getMonth() + 1); // standart 1 oy

        const { error: profileError } = await supabase.from("profiles").upsert({
          id: userId,
          email: userData.user?.email,
          full_name: userData.user?.user_metadata?.full_name || "",
          role: userData.user?.user_metadata?.role || "student",
          is_premium: true,
          premium_until: untilDate.toISOString(),
        });

        if (profileError) {
          console.log("profiles upsert error:", profileError.message);
          await sendTelegramMessage(
            BOT_TOKEN,
            CHAT_ID,
            `⚠️ Auth yangilandi, lekin profiles xato: ${escapeMarkdown(profileError.message)}`,
          );
        } else {
          await sendTelegramMessage(BOT_TOKEN, CHAT_ID, `✅ Premium muvaffaqiyatli berildi!\n🆔 User: ${userId}`);
        }
      } else if (text.startsWith("/ok ")) {
        // Yangi chek-model: premium_requests dagi 'pending' so'rovlarni active qilamiz.
        // SQL trigger (SUPABASE_UPDATE_12) profiles.is_premium ni o'zi yangilaydi.
        // Avval o'qiymiz, keyin ID bo'yicha yangilaymiz — aks holda ko'p qator bo'lsa
        // "JSON object requested, multiple rows returned" xatosi chiqadi.
        const userId = text.replace("/ok ", "").trim();
        if (!userId) {
          await sendTelegramMessage(BOT_TOKEN, CHAT_ID, "❌ User ID kiriting!\nMasalan: /ok abc123");
          return new Response("ok");
        }

        const { data: pending, error: fetchErr } = await supabase
          .from("premium_requests")
          .select("id, receipt_url")
          .eq("user_id", userId)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (fetchErr) {
          await sendTelegramMessage(BOT_TOKEN, CHAT_ID, `❌ Xatolik: ${escapeMarkdown(fetchErr.message)}`);
        } else if (!pending || pending.length === 0) {
          await sendTelegramMessage(BOT_TOKEN, CHAT_ID, `⚠️ Bu user'da 'pending' premium so'rovi topilmadi.\n🆔 ${userId}`);
        } else {
          const { error: updErr } = await supabase
            .from("premium_requests")
            .update({ status: "active" })
            .in("id", pending.map((r) => r.id));
          if (updErr) {
            await sendTelegramMessage(BOT_TOKEN, CHAT_ID, `❌ Xatolik: ${escapeMarkdown(updErr.message)}`);
          } else {
            const receipt = pending[0]?.receipt_url || "—";
            await sendTelegramMessage(
              BOT_TOKEN,
              CHAT_ID,
              `✅ Premium faollashtirildi (trigger profiles'ni yangiladi)!\n🆔 User: ${userId}\n🧾 Chek: ${receipt}`,
            );
          }
        }
      } else if (text.startsWith("/gems ")) {
        // Yangi chek-model: diamond_orders dagi 'pending' buyurtmalarni active qilamiz.
        // SQL trigger coins.diamonds ga olmoslarni o'zi qo'shadi.
        // Avval o'qiymiz, keyin ID bo'yicha yangilaymiz (ko'p qator xatosiz).
        const userId = text.replace("/gems ", "").trim();
        if (!userId) {
          await sendTelegramMessage(BOT_TOKEN, CHAT_ID, "❌ User ID kiriting!\nMasalan: /gems abc123");
          return new Response("ok");
        }

        const { data: pending, error: fetchErr } = await supabase
          .from("diamond_orders")
          .select("id, diamonds, receipt_url")
          .eq("user_id", userId)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (fetchErr) {
          await sendTelegramMessage(BOT_TOKEN, CHAT_ID, `❌ Xatolik: ${escapeMarkdown(fetchErr.message)}`);
        } else if (!pending || pending.length === 0) {
          await sendTelegramMessage(BOT_TOKEN, CHAT_ID, `⚠️ Bu user'da 'pending' olmos buyurtmasi topilmadi.\n🆔 ${userId}`);
        } else {
          const { error: updErr } = await supabase
            .from("diamond_orders")
            .update({ status: "active" })
            .in("id", pending.map((o) => o.id));
          if (updErr) {
            await sendTelegramMessage(BOT_TOKEN, CHAT_ID, `❌ Xatolik: ${escapeMarkdown(updErr.message)}`);
          } else {
            const total = pending.reduce((s, o) => s + (o.diamonds || 0), 0);
            const list = pending.map((o) => `${o.diamonds} olmos`).join(" + ");
            await sendTelegramMessage(
              BOT_TOKEN,
              CHAT_ID,
              `✅ ${pending.length > 1 ? `${pending.length} ta buyurtma` : "Buyurtma"} tasdiqlandi — ${list} = jami ${total} olmos qo'shildi (trigger hisobni yangiladi)!\n🆔 User: ${userId}\n🧾 Chek: ${pending[0]?.receipt_url || "—"}`,
            );
          }
        }
      } else if (text.startsWith("/cancel ")) {
        const userId = text.replace("/cancel ", "").trim();
        if (!userId) {
          await sendTelegramMessage(BOT_TOKEN, CHAT_ID, "❌ User ID kiriting!\nMasalan: /cancel abc123");
          return new Response("ok");
        }

        const { error } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { is_premium: false },
        });

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            is_premium: false,
            premium_until: null,
          })
          .eq("id", userId);

        if (error || profileError) {
          console.log("cancel error:", error?.message, profileError?.message);
          await sendTelegramMessage(
            BOT_TOKEN,
            CHAT_ID,
            `❌ Xatolik: ${escapeMarkdown(error?.message || profileError?.message || "noma'lum xato")}`,
          );
        } else {
          await sendTelegramMessage(BOT_TOKEN, CHAT_ID, `✅ Premium bekor qilindi!\n🆔 User: ${userId}`);
        }
      } else if (text === "/help") {
        await sendTelegramMessage(
          BOT_TOKEN,
          CHAT_ID,
          `📋 *Buyruqlar:*\n\n/premium USER\\_ID — Premium berish (eski usul, profiles'ga to'g'ridan-to'g'ri)\n/ok USER\\_ID — Chekli premium so'rovini tasdiqlash (premium\\_requests → active, trigger avtomatik)\n/gems USER\\_ID — Olmos buyurtmasini tasdiqlash (diamond\\_orders → active, olmos avtomatik tushadi)\n/cancel USER\\_ID — Premiumni bekor qilish\n/help — Yordam`,
        );
      } else {
        console.log("Unknown command, ignoring:", text);
      }

      return new Response("ok");
    }

    // ===== PREMIUM / OLMOS so'rovi (ilova orqali, chek bilan) =====
    const name = String(body.name ?? "");
    const email = String(body.email ?? "");
    const phone = String(body.phone ?? "");
    const plan = String(body.plan ?? "");
    const userId = String(body.userId ?? "");

    if (!userId) {
      console.log("Premium so'rov: userId yo'q, body:", JSON.stringify(body));
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Olmos buyurtmasini Premium'dan ajratamiz (plan matni bo'yicha)
    const isDiamond = plan.toLowerCase().includes("olmos");
    const title = isDiamond ? "💎 *Yangi olmos buyurtmasi!*" : "👑 *Yangi Premium so'rov!*";

    // Chek path'i plan matnida: "... — chek: <storage path>"
    // Private bucket — admin uchun 1 soatlik signed URL yaratamiz
    let receiptLine = "\n🧾 *Chek:* yuklanmagan ❗";
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const receiptMatch = plan.match(/chek:\s*(\S+)/);
    if (receiptMatch && receiptMatch[1] !== "yuklanmadi") {
      const { data: urlData } = await supabaseAdmin.storage
        .from("receipts")
        .createSignedUrl(receiptMatch[1], 60 * 60);
      if (urlData?.signedUrl) {
        receiptLine = `\n🧾 *Chek rasmi:* [Rasmni ochish (1 soat)](${urlData.signedUrl})`;
      } else {
        receiptLine = `\n🧾 *Chek:* ${escapeMarkdown(receiptMatch[1])}`;
      }
    }

    const approveCmd = isDiamond ? `/gems ${userId}` : `/ok ${userId}`;

    const message = `${title}

👤 *Ism:* ${escapeMarkdown(name)}
📧 *Email:* ${escapeMarkdown(email)}
📱 *Telefon:* ${escapeMarkdown(phone)}
💎 *Reja:* ${escapeMarkdown(plan)}
🆔 *User ID:* \`${userId}\`
${receiptLine}

✅ *Tasdiqlash uchun:*
${approveCmd}

❌ *Bekor qilish uchun:*
/cancel ${userId}`;

    const sent = await sendTelegramMessage(BOT_TOKEN, CHAT_ID, message);
    console.log("payment request -> telegram sent:", sent);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.log("Edge function error:", error?.message);
    return new Response(JSON.stringify({ error: error?.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }
});

async function sendTelegramMessage(token: string | undefined, chatId: string | undefined, text: string) {
  if (!token || !chatId) {
    console.log("sendTelegramMessage: BOT_TOKEN yoki CHAT_ID o'rnatilmagan!");
    return { ok: false, error: "missing token/chatId" };
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
  const data = await res.json();
  if (!data.ok) {
    console.log("Telegram API error:", JSON.stringify(data));
  }
  return data;
}
