export const MOHAMMAD_WEEKLY_TARGET = 270;
export const FOLLOWUP_DAYS = [6, 2, 4];
export const WEEKDAY_NAMES = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];
export const MOHAMMAD_POLICY =
  "شنبه، سه‌شنبه و پنج‌شنبه روز پیگیری ملاقات‌ها و لیدهای خودت است؛ پیگیری می‌تواند تلفنی، میدانی یا ترکیبی باشد. در سایر روزهای کامل کاری حداقل ۴۵ تماس خروجی قابل‌شمارش الزامی است. تعداد تماس‌ها و حضور بیرون از دفتر را برای رسیدن به هدف برنامه‌ریزی حدود ۲۷۰ تماس در هفته مدیریت کن.";
export function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function weekday(day) {
  return new Date(day + "T12:00:00").getDay();
}
export function weekDates(day) {
  const date = new Date(day + "T12:00:00");
  date.setDate(date.getDate() - ((date.getDay() + 1) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(date);
    d.setDate(d.getDate() + i);
    return isoDate(d);
  });
}
export function workStatus(day, data = {}) {
  return data.workStatus || (weekday(day) === 5 ? "off" : "full");
}
export function dayPolicy(day, data = {}) {
  const status = workStatus(day, data);
  const followup = FOLLOWUP_DAYS.includes(weekday(day));
  if (status === "off")
    return {
      target: null,
      followup,
      label: "تعطیل یا مرخصی",
      message:
        "حداقل تماس روزانه ندارد؛ تماس واقعی ثبت‌شده همچنان در مجموع هفته دیده می‌شود.",
    };
  if (status === "short")
    return {
      target: null,
      followup,
      label: "روز کوتاه مصوب",
      message:
        "برنامه روز کوتاه باید از پیش تصویب و جدا گزارش شود؛ سامانه حداقل تازه‌ای تعیین نمی‌کند.",
    };
  if (followup)
    return {
      target: null,
      followup,
      label: "روز پیگیری",
      message:
        "پیگیری تلفنی یا حضوری مجاز است. حداقل ثابت روزانه ندارد؛ مجموع تماس هفته را برای هدف حدود ۲۷۰ مدیریت کن.",
    };
  return {
    target: 45,
    followup,
    label: "روز تماس الزامی",
    message:
      "حداقل ۴۵ تماس در این روز کامل کاری الزامی است؛ تماس بیشتر در روز دیگر، کسری این روز را حذف نمی‌کند.",
  };
}
export function validCount(value) {
  if (value === "" || value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= 100000 ? n : null;
}
