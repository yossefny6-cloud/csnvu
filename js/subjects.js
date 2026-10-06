/*
  ✏️ المواد الست
  ---------------------------------------------
  غيّر الاسم (name) والأيقونة (icon) واللون (color) براحتك.
  ⚠️ متغيّرش الـ id بعد ما تضيف ملخصات، لأن الملخصات مربوطة بيه.
*/
const SUBJECTS = [
  { id: "sub1", name: "Calculus",                             icon: "∫",  color: "#6c63ff" },
  { id: "sub2", name: "Linear Algebra",                       icon: "🧮", color: "#00b894" },
  { id: "sub3", name: "Physics",                              icon: "⚛️", color: "#0984e3" },
  { id: "sub4", name: "Basic Electricity & Electronics",      icon: "⚡", color: "#d69e00" },
  { id: "sub5", name: "Introduction to Computer Systems",     icon: "💻", color: "#e17055" },
  { id: "sub6", name: "English",                              icon: "🔤", color: "#e84393" },
];

function getSubject(id) {
  return (
    SUBJECTS.find((s) => s.id === id) || {
      id,
      name: "غير محدد",
      icon: "📄",
      color: "#8a8aa0",
    }
  );
}
