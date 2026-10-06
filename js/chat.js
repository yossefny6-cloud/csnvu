/* ========================================================
   AI Chatbot Module (Client-Side implementation)
   ======================================================== */

// ⚠️ ضَع مفتاح جوجل الخاص بك هنا (مجانًا من Google AI Studio)
// احصل عليه من: https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = "AQ.Ab8RN6LArO37X4qYJ8XIzyBGMxE9hPIq_nUsKu9cIMIRpOFKew";

const CHAT_MODEL = "gemini-3.8-flash"; 
const SYSTEM_PROMPT = `أنت مساعد ذكاء اصطناعي محترف ومدرب تدريباً عالياً لمساعدة طلاب كلية الحاسبات والذكاء الاصطناعي بجامعة وادي النيل. 
يجب أن تكون إجاباتك دقيقة، احترافية، وموجهة للطلاب في مجالات البرمجة، الرياضيات، علوم الحاسب.
رد دائماً باللغة العربية بأسلوب ودود وأكاديمي.`;

let chatHistory = [
  {
    role: "user",
    parts: [{ text: SYSTEM_PROMPT }]
  },
  {
    role: "model",
    parts: [{ text: "علم، سأقوم بمساعدة الطلاب بأفضل شكل ممكن وبدون أي أخطاء." }]
  }
];

function toggleChatWidget() {
  const widget = document.getElementById("aiChatWidget");
  const isOpen = widget.classList.contains("open");
  
  if (isOpen) {
    widget.classList.remove("open");
  } else {
    widget.classList.add("open");
    const body = document.getElementById("chatBody");
    body.scrollTop = body.scrollHeight;
    setTimeout(() => document.getElementById("chatInput").focus(), 300);

    if (document.querySelectorAll(".chat-message").length === 0) {
      appendMessage("bot", "مرحباً يا بشمهندس! أنا المساعد الذكي الخاص بالكلية. كيف يمكنني مساعدتك في دراستك اليوم؟ 🤖🎓");
      
      // تحذير للمطور إذا لم يضع المفتاح
      if (GEMINI_API_KEY === "ضع_مفتاح_جوجل_هنا" || !GEMINI_API_KEY) {
        setTimeout(() => {
          appendMessage("bot", "⚠️ تنبيه للمطور: يرجى وضع مفتاح Gemini API في السطر رقم 6 في ملف `chat.js` لكي يعمل الشات للطلاب.");
        }, 1000);
      }
    }
  }
}

function appendMessage(sender, text) {
  const body = document.getElementById("chatBody");
  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-message ${sender}`;
  
  let formattedText = text;
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  formattedText = formattedText.replace(/```(?:[a-z]*\n)?([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
  formattedText = formattedText.replace(/\n/g, '<br>');
  
  msgDiv.innerHTML = `<div class="msg-bubble">${formattedText}</div>`;
  body.appendChild(msgDiv);
  body.scrollTop = body.scrollHeight;
}

function appendTypingIndicator() {
  const body = document.getElementById("chatBody");
  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-message bot typing-indicator`;
  msgDiv.id = "typingIndicator";
  msgDiv.innerHTML = `<div class="msg-bubble"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
  body.appendChild(msgDiv);
  body.scrollTop = body.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

async function sendChatMessage() {
  const inputEl = document.getElementById("chatInput");
  const text = inputEl.value.trim();
  if (!text) return;
  
  if (GEMINI_API_KEY === "ضع_مفتاح_جوجل_هنا" || !GEMINI_API_KEY) {
    appendMessage("user", text);
    inputEl.value = "";
    appendMessage("bot", "عذراً، المساعد الذكي تحت الصيانة حالياً لربطه بخوادم جوجل. (تنبيه للمطور: ضع مفتاح API)");
    return;
  }

  appendMessage("user", text);
  inputEl.value = "";
  
  chatHistory.push({ role: "user", parts: [{ text: text }] });
  appendTypingIndicator();

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: chatHistory,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
      })
    });

    removeTypingIndicator();

    if (!response.ok) {
      throw new Error("API Error: " + response.status);
    }

    const data = await response.json();
    const botReply = data.candidates[0].content.parts[0].text;
    
    chatHistory.push({ role: "model", parts: [{ text: botReply }] });
    appendMessage("bot", botReply);

  } catch (error) {
    removeTypingIndicator();
    console.error("Chat API Error:", error);
    appendMessage("bot", "عذراً يا بشمهندس، أقوم حالياً بتحديث قاعدة بياناتي (Under Maintenance) لأصبح أكثر ذكاءً. 🚀 يرجى العودة لاحقاً أو البحث في الملخصات المتوفرة في الوقت الحالي.");
    chatHistory.pop();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const inputEl = document.getElementById("chatInput");
    if (inputEl) {
      inputEl.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendChatMessage();
        }
      });
    }
  }, 1000);
});
