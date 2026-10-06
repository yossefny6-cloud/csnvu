/* ============================================
   تأثيرات واجهة صفحات الدخول والتسجيل
   ============================================ */

const EYE_OPEN =
  '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
const EYE_CLOSED =
  '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>';

// إظهار / إخفاء كلمة المرور
function setupPasswordToggle(btn, input) {
  if (!btn || !input) return;
  const icon = btn.querySelector("svg");
  btn.addEventListener("click", () => {
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    if (icon) icon.innerHTML = show ? EYE_CLOSED : EYE_OPEN;
  });
}

// تأثير الموجة على الزر
function addRipple(btn) {
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

// اهتزاز البطاقة + رسالة خطأ
function showFormError(card, msg, text, field) {
  if (field) {
    field.classList.add("error");
    let errSpan = field.querySelector(".field-error-text");
    if (!errSpan) {
      errSpan = document.createElement("span");
      errSpan.className = "field-error-text";
      field.appendChild(errSpan);
    }
    errSpan.textContent = text;
    if (msg) msg.textContent = "";
  } else if (msg) {
    msg.className = "message";
    msg.textContent = text;
  }
  if (card) {
    card.classList.remove("shake");
    void card.offsetWidth; // إعادة تشغيل الانميشن
    card.classList.add("shake");
  }
}

function showFormSuccess(msg, text) {
  if (!msg) return;
  msg.className = "message ok";
  msg.textContent = text;
}

// إزالة حالة الخطأ عند الكتابة
function clearErrorsOnInput(form, msg) {
  if (!form) return;
  form.querySelectorAll("input, select").forEach((input) =>
    input.addEventListener("input", () => {
      const field = input.closest(".field");
      if (field) {
        field.classList.remove("error");
        const errSpan = field.querySelector(".field-error-text");
        if (errSpan) errSpan.textContent = "";
      }
      if (msg) msg.textContent = "";
    })
  );
}

function setBtnState(btn, state) {
  if (!btn) return;
  btn.classList.remove("loading", "success");
  btn.disabled = state !== "idle";
  if (state !== "idle") btn.classList.add(state);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
