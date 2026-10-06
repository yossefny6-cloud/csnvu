/* ============================================
   منصة ملخصات حاسبات وذكاء اصطناعي - جامعة وادي النيل
   الأدوات المشتركة (Common Utilities & Backend Helpers)
   ============================================ */

const SITE_NAME = "ملخصات حاسبات وذكاء اصطناعي وادي النيل";

// فحص إعدادات Firebase
const isFirebaseConfigured =
  typeof firebaseConfig === "object" &&
  firebaseConfig !== null &&
  Object.values(firebaseConfig).every((v) => v && !String(v).includes("PASTE"));

let auth = null;
let db = null;

if (isFirebaseConfigured) {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  auth = firebase.auth();
  db = firebase.firestore();

  // تفعيل الكاش التلقائي للعمل حتى عند بطء الإنترنت
  try {
    db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
      if (err.code !== "failed-precondition" && err.code !== "unimplemented") {
        console.warn("Firestore persistence warning:", err);
      }
    });
  } catch (e) {
    // ignore
  }
} else {
  onReady(() => {
    const bar = document.createElement("div");
    bar.className = "config-warning";
    bar.innerHTML =
      "⚠️ المنصة لسه مش مربوطة بـ Firebase — افتح <code>js/firebase-config.js</code> وحط إعدادات مشروعك (راجع SETUP.md)";
    document.body.prepend(bar);
  });
}

function onReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

/* ---------- رسائل أخطاء Firebase بالعربي بدقة احترافية ---------- */
function authErrorMessage(err) {
  if (!err) return "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً";
  const code = err.code || err.message || "";
  const map = {
    "auth/invalid-email": "صيغة البريد الإلكتروني أو رقم الهاتف غير صحيحة",
    "auth/user-not-found": "لا يوجد حساب مسجل بهذه البيانات",
    "auth/wrong-password": "كلمة المرور غير صحيحة",
    "auth/invalid-credential": "بيانات الدخول غير صحيحة، يرجى التأكد وإعادة المحاولة",
    "auth/invalid-login-credentials": "رقم الهاتف أو كلمة المرور غير صحيحة",
    "auth/email-already-in-use": "هذا الرقم أو البريد مسجّل بالفعل مسبقاً",
    "auth/weak-password": "كلمة المرور ضعيفة (يجب أن تتكون من 6 أحرف أو أرقام على الأقل)",
    "auth/too-many-requests": "تم حظر المحاولات مؤقتاً لكثرتها، يرجى الانتظار دقيقة",
    "auth/network-request-failed": "تعذر الاتصال، يرجى التحقق من اتصالك بالإنترنت",
    "auth/operation-not-allowed": "تسجيل الدخول بالبريد غير مفعّل في Firebase Authentication",
    "auth/configuration-not-found": "خدمة Authentication غير مفعلة في مشروع Firebase",
    "auth/user-disabled": "تم تعطيل هذا الحساب من قِبل الإدارة",
    "failed-precondition": "قاعدة بيانات Firestore لم يتم تفعيلها بعد في مشروع Firebase",
    "permission-denied": "ليس لديك الصلاحيات الكافية لتنفيذ هذا الإجراء",
    "unavailable": "تعذر الاتصال بقاعدة البيانات، تحقق من اتصال الإنترنت",
  };
  console.error("Firebase Auth/DB Error:", err);
  return map[code] || (typeof err === "string" ? err : "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى");
}

/* ---------- إشعارات عصرية واحترافية (Toasts) ---------- */
function toast(text, type = "info", duration = 3200) {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "💡",
  };

  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `
    <span class="toast-icon">${icons[type] || "✨"}</span>
    <span class="toast-text">${escapeHtml(text)}</span>
  `;
  wrap.appendChild(el);

  setTimeout(() => {
    el.classList.add("hide");
    setTimeout(() => el.remove(), 320);
  }, duration);
}

/* ---------- أدوات الأمان وفلترة النصوص والروابط ---------- */
function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

// نسمح بروابط http/https فقط لمنع ثغرات XSS وروابط javascript:
function isSafeUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

// استخراج رابط Google Drive للـ Preview أو التحميل المباشر
function parseGoogleDriveUrl(url) {
  if (!url || typeof url !== "string") return null;
  // matches drive.google.com/file/d/ID or id=ID or open?id=ID
  const match = url.match(/(?:file\/d\/|id=|open\?id=)([a-zA-Z0-9_-]{25,})/);
  if (!match) return null;
  const fileId = match[1];
  return {
    fileId,
    previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    viewUrl: `https://drive.google.com/file/d/${fileId}/view`,
  };
}

function formatDate(ts) {
  if (!ts) return "غير محدد";
  let date = null;
  if (ts.toDate) date = ts.toDate();
  else if (ts instanceof Date) date = ts;
  else if (typeof ts === "number") date = new Date(ts);
  else if (typeof ts === "string") date = new Date(ts);
  if (!date || isNaN(date.getTime())) return "غير محدد";

  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRelativeTime(ts) {
  if (!ts) return "";
  let date = null;
  if (ts.toDate) date = ts.toDate();
  else if (ts instanceof Date) date = ts;
  else if (typeof ts === "number") date = new Date(ts);
  if (!date || isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay === 0) {
    if (diffHour === 0) {
      if (diffMin <= 1) return "الآن";
      return `منذ ${diffMin} دقيقة`;
    }
    return `منذ ${diffHour} ساعة`;
  }
  if (diffDay === 1) return "أمس";
  if (diffDay === 2) return "منذ يومين";
  if (diffDay < 7) return `منذ ${diffDay} أيام`;
  return formatDate(ts);
}

function hidePageLoader() {
  const loader = document.getElementById("pageLoader");
  if (loader) {
    loader.classList.add("hidden");
    setTimeout(() => {
      if (loader.parentNode) loader.style.display = "none";
    }, 400);
  }
}

function showPageLoader() {
  const loader = document.getElementById("pageLoader");
  if (loader) {
    loader.style.display = "flex";
    loader.classList.remove("hidden");
  }
}

/* ---------- إدارة الملف الشخصي والصلاحيات ---------- */
async function getOrCreateProfile(user) {
  if (!db) return null;
  const ref = db.collection("users").doc(user.uid);
  const snap = await ref.get();
  if (snap.exists) return snap.data();

  // لو الحساب موجود في Authentication ولم يُنشأ له doc (أو كحساب جديد)
  const profile = {
    name: user.displayName || user.email.split("@")[0],
    email: user.email,
    level: "1",
    role: "student",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  try {
    await ref.set(profile);
  } catch (e) {
    console.warn("Could not auto-create profile doc:", e);
  }
  return profile;
}

// لحماية الصفحات: التحقق من تسجيل الدخول وتحديد الصلاحية
function requireAuth({ adminOnly = false } = {}) {
  return new Promise((resolve) => {
    if (!isFirebaseConfigured) {
      hidePageLoader();
      resolve({ user: null, profile: null });
      return;
    }
    const unsub = auth.onAuthStateChanged(async (user) => {
      unsub();
      if (!user) {
        location.replace("login.html");
        return;
      }
      try {
        const profile = await getOrCreateProfile(user);
        if (adminOnly && (!profile || profile.role !== "admin")) {
          toast("هذه الصفحة مخصصة للمسؤولين فقط", "warning");
          location.replace("index.html");
          return;
        }
        resolve({ user, profile });
      } catch (err) {
        hidePageLoader();
        toast(authErrorMessage(err), "error");
        resolve({ user, profile: null });
      }
    });
  });
}

// لصفحات الدخول والتسجيل: تحويل المستخدم إذا كان مسجلاً بالفعل
function redirectIfLoggedIn() {
  if (!isFirebaseConfigured) return;
  const unsub = auth.onAuthStateChanged((user) => {
    unsub();
    if (user) {
      location.replace("index.html");
    }
  });
}

function logout() {
  if (!auth) {
    location.replace("login.html");
    return;
  }
  auth.signOut().then(() => {
    toast("تم تسجيل الخروج بنجاح", "info");
    setTimeout(() => location.replace("login.html"), 200);
  });
}

// تعبئة شريط التنقل بالبيانات والروابط
function fillNavbar(profile) {
  if (!profile) return;
  const name = profile.name || "طالب";
  const el = (id) => document.getElementById(id);
  if (el("userName")) el("userName").textContent = name;
  if (el("userAvatar")) el("userAvatar").textContent = name.trim().charAt(0) || "ط";
  if (el("userRole")) {
    el("userRole").textContent = profile.role === "admin" ? "مسؤول النظام 👑" : `الفرقة ${profile.level || "الأولى"}`;
  }
  if (profile.role === "admin") {
    document.querySelectorAll(".admin-only").forEach((n) => {
      n.hidden = false;
      if (n.style.display === "none") n.style.display = "";
    });
  }
  if (el("logoutBtn")) {
    el("logoutBtn").addEventListener("click", logout);
  }
}

// تنظيف أرقام الهواتف وتحويل الأرقام العربية والفارسية إلى إنجليزية
function sanitizePhone(str) {
  if (!str) return "";
  const arabicEasternDigits = "٠١٢٣٤٥٦٧٨٩";
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  let cleaned = String(str).trim();

  // تحويل الأرقام
  cleaned = cleaned.replace(/[٠-٩]/g, (d) => arabicEasternDigits.indexOf(d));
  cleaned = cleaned.replace(/[۰-۹]/g, (d) => persianDigits.indexOf(d));

  // إزالة المسافات والشرطات والأقواس
  cleaned = cleaned.replace(/[\s\-\(\)\+]/g, "");

  // إذا بدأ بـ 0020 أو 20 (مفتاح مصر)
  if (cleaned.startsWith("0020")) cleaned = "0" + cleaned.substring(4);
  else if (cleaned.startsWith("20") && cleaned.length === 12) cleaned = "0" + cleaned.substring(2);

  return cleaned;
}

/* ---------- نظام المفضلة وحفظ الملخصات (Bookmarks & Favorites) ---------- */
const Favorites = {
  KEY: "nvu_saved_summaries",
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || "[]");
    } catch {
      return [];
    }
  },
  has(id) {
    if (!id) return false;
    return this.getAll().includes(id);
  },
  toggle(id) {
    if (!id) return false;
    let favs = this.getAll();
    const idx = favs.indexOf(id);
    let added = false;
    if (idx >= 0) {
      favs.splice(idx, 1);
      added = false;
    } else {
      favs.push(id);
      added = true;
    }
    try {
      localStorage.setItem(this.KEY, JSON.stringify(favs));
    } catch (e) {
      console.warn("Storage full", e);
    }
    return added;
  },
};

/* ---------- نظام الثيمات والتأثيرات التفاعلية (Themes & Particles) ---------- */
let currentSavedTheme = localStorage.getItem("app-theme") || "navy";
let particleInterval = null;

function manageParticles(theme) {
  if (particleInterval) {
    clearInterval(particleInterval);
    particleInterval = null;
  }
  document.querySelectorAll(".sakura-petal, .matrix-bit").forEach((p) => p.remove());

  if (theme === "pink") {
    particleInterval = setInterval(() => {
      if (document.querySelectorAll(".sakura-petal").length > 15) return;
      const petal = document.createElement("div");
      petal.className = "sakura-petal";
      petal.innerText = "🌸";
      petal.style.left = Math.random() * 100 + "vw";
      petal.style.animationDuration = Math.random() * 5 + 6 + "s";
      document.body.appendChild(petal);
      setTimeout(() => petal.remove(), 12000);
    }, 700);
  } else if (theme === "dark" || theme === "cyber") {
    particleInterval = setInterval(() => {
      if (document.querySelectorAll(".matrix-bit").length > 20) return;
      const bit = document.createElement("div");
      bit.className = "matrix-bit";
      bit.innerText = Math.random() > 0.5 ? "0" : "1";
      bit.style.left = Math.random() * 100 + "vw";
      bit.style.animationDuration = Math.random() * 3 + 4 + "s";
      document.body.appendChild(bit);
      setTimeout(() => bit.remove(), 7000);
    }, 400);
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("app-theme", theme);
  currentSavedTheme = theme;
  document.querySelectorAll(".theme-btn").forEach((btn) => btn.classList.remove("active"));
  const activeBtn = document.querySelector(".theme-" + theme);
  if (activeBtn) activeBtn.classList.add("active");
  manageParticles(theme);
}

function previewTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  manageParticles(theme);
}

function restoreTheme() {
  document.documentElement.setAttribute("data-theme", currentSavedTheme);
  manageParticles(currentSavedTheme);
}

// تهيئة الثيم عند تحميل أي صفحة
onReady(() => {
  setTheme(currentSavedTheme);
});
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}
