import policy from "../data/team-policy.json";

export const WEEKLY_LEAD_TARGET = policy.weeklyLeadTarget;
export const FOLLOWUP_DAYS = policy.followupDays;
export const CALL_DAYS = policy.callDays;
export const WEEKDAY_NAMES = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];
const fa = (n) => Number(n).toLocaleString("fa-IR");
export const isLeadRole = (person) => ["rep", "support"].includes(person.kind);
export const dailyCallTarget = (person) =>
  person.kind === "support" ? policy.supportCallTarget : policy.repCallTarget;
export const weeklyCallTarget = (person) =>
  dailyCallTarget(person) * CALL_DAYS.length;
export const leadSources = (person) =>
  policy.people.find((p) => p.id === person.id)?.sources || [];
export function policyText(person) {
  if (!isLeadRole(person))
    return "برنامه لید و تماس چهار کارشناس طبق اصلاحیه جاری اجرا و مرور شود. برنامه تماس شخصی مدیر فروش و مدیرعامل روزانه ۱۲ تماس است.";
  return `شنبه و سه‌شنبه روز پیگیری‌اند. یکشنبه، دوشنبه و چهارشنبه هر روز ${fa(dailyCallTarget(person))} تماس خروجی قابل‌شمارش انجام بده؛ برنامه سه روز تماس، ${fa(weeklyCallTarget(person))} تماس در هفته کامل کاری است. پنجشنبه لیدهای هفته را پیدا و آماده کن و در جلسه گزارش‌ها شرکت کن. هدف هر کارشناس، از جمله الهام، ${fa(WEEKLY_LEAD_TARGET)} لید جدید در هفته است.`;
}
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
export function dayPolicy(day, data = {}, person = { kind: "rep" }) {
  const status = workStatus(day, data),
    index = weekday(day);
  const followup = FOLLOWUP_DAYS.includes(index),
    leadDay = index === policy.leadDay;
  if (status === "off")
    return {
      target: null,
      followup,
      leadDay,
      label: "تعطیل یا مرخصی",
      message: "حداقل تماس روزانه ندارد؛ فعالیت واقعی با همان تاریخ ثبت شود.",
    };
  if (status === "short")
    return {
      target: null,
      followup,
      leadDay,
      label: "روز کوتاه مصوب",
      message:
        "برنامه روز کوتاه از پیش تصویب و جدا گزارش شود؛ سامانه هدف تازه‌ای تعیین نمی‌کند.",
    };
  if (followup)
    return {
      target: null,
      followup,
      leadDay,
      label: "روز پیگیری",
      message:
        "پیگیری تلفنی، حضوری یا ترکیبی؛ آموزش صبح و جلسه تکی در همین روز. حداقل ثابت تماس ندارد و موعد مشتری مقدم است.",
    };
  if (leadDay)
    return {
      target: null,
      followup,
      leadDay,
      label: "لیدسازی و جلسه گزارش‌ها",
      message: `لیدها را از منابع مشخص خودت پیدا، از تکراری‌ها پاک و در CRM ثبت کن. هدف هفتگی هر نفر ${fa(WEEKLY_LEAD_TARGET)} لید جدید است؛ جلسه گزارش‌ها نیز پنجشنبه برگزار می‌شود.`,
    };
  if (!CALL_DAYS.includes(index))
    return {
      target: null,
      followup,
      leadDay,
      label: "خارج از روزهای تماس برنامه",
      message:
        "برای این روز هدف ثابت تماس تعیین نشده است؛ کار مصوب و تعهدهای مشتری با همان تاریخ ثبت شوند.",
    };
  const target = dailyCallTarget(person);
  return {
    target,
    followup,
    leadDay,
    label: "روز تماس",
    message: `حداقل ${fa(target)} تماس خروجی قابل‌شمارش در این روز کامل کاری انجام بده. تماس اضافه در روز دیگر، کسری این روز را حذف نمی‌کند.`,
  };
}
export function validCount(value) {
  if (value === "" || value === undefined || value === null) return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= 100000 ? n : null;
}
export function weekSummary(person, day, days = {}) {
  const dates = weekDates(day);
  const get = (date) => days[`${person.id}_${date}`] || {};
  const sum = (key, list) =>
    list.reduce((total, date) => total + (validCount(get(date)[key]) || 0), 0);
  const callDates = dates.filter((date) => CALL_DAYS.includes(weekday(date)));
  const requiredDates = callDates.filter(
    (date) => dayPolicy(date, get(date), person).target !== null,
  );
  return {
    dates,
    totalCalls: sum("calls", dates),
    plannedDayCalls: sum("calls", callDates),
    leads: sum("leads", dates),
    requiredDays: requiredDates.length,
    completedDays: requiredDates.filter(
      (date) => (validCount(get(date).calls) ?? -1) >= dailyCallTarget(person),
    ).length,
    recordedDays: dates.filter(
      (date) =>
        validCount(get(date).calls) !== null ||
        validCount(get(date).leads) !== null,
    ).length,
  };
}
