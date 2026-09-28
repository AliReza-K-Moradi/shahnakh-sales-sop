import React from "react";
import {
  dayPolicy,
  weekDates,
  weekday,
  WEEKDAY_NAMES,
  validCount,
  MOHAMMAD_POLICY,
  MOHAMMAD_WEEKLY_TARGET,
} from "../lib/schedule.js";

const fa = (n) => Number(n).toLocaleString("fa-IR");
const label = (day) =>
  new Intl.DateTimeFormat("fa-IR", { month: "long", day: "numeric" }).format(
    new Date(day + "T12:00:00"),
  );
export function MohammadPolicy({ compact = false }) {
  return (
    <section className={compact ? "notice" : "panel"}>
      <h2 className={compact ? "mb-2 font-bold" : "section-title"}>
        برنامه اختصاصی محمد یوسفلو
      </h2>
      <p>{MOHAMMAD_POLICY}</p>
      <p className="mt-3 text-sm text-muted">
        موعد مشخص مشتری در تمام روزهای کاری مقدم است و به روز پیگیری بعد منتقل
        نمی‌شود. ملاقات حضوری به‌عنوان تماس تلفنی شمرده نمی‌شود.
      </p>
    </section>
  );
}
export default function WeeklyPlan({ day, days, setDay }) {
  const dates = weekDates(day);
  const total = dates.reduce(
    (sum, date) => sum + (validCount(days["mohammad_" + date]?.calls) || 0),
    0,
  );
  const recorded = dates.filter(
    (date) => validCount(days["mohammad_" + date]?.calls) !== null,
  ).length;
  return (
    <section className="panel" data-testid="weekly-plan">
      <div className="section-title flex-wrap">
        <h2>برنامه و تماس‌های این هفته</h2>
        <span className="badge">
          {label(dates[0])} تا {label(dates[6])}
        </span>
      </div>
      <div className="mb-5 flex flex-wrap items-baseline gap-3">
        <strong className="text-4xl text-[#287858]" data-testid="weekly-total">
          {fa(total)}
        </strong>
        <span>تماس ثبت‌شده از هدف حدود {fa(MOHAMMAD_WEEKLY_TARGET)} تماس</span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-[#e9efe3]">
        <div
          className="h-full bg-[#287858]"
          style={{
            width: Math.min((total / MOHAMMAD_WEEKLY_TARGET) * 100, 100) + "%",
          }}
        />
      </div>
      <p role="status" className="my-4 text-sm">
        {total < 270
          ? `${fa(270 - total)} تماس تا عدد برنامه‌ریزی ۲۷۰ باقی مانده است.`
          : "مجموع ثبت‌شده به عدد برنامه‌ریزی ۲۷۰ رسیده است."}{" "}
        داده {fa(recorded)} روز وارد شده؛ خالی بودن رکورد به معنی صفر تماس نیست.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {dates.map((date) => {
          const data = days["mohammad_" + date] || {},
            p = dayPolicy(date, data),
            n = validCount(data.calls);
          return (
            <button
              key={date}
              type="button"
              onClick={() => setDay(date)}
              aria-pressed={date === day}
              className={
                "rounded-xl border p-4 text-right " +
                (date === day
                  ? "border-forest bg-[#eaf1e4]"
                  : "border-line bg-white")
              }
            >
              <span className="flex items-center justify-between gap-2">
                <strong>{WEEKDAY_NAMES[weekday(date)]}</strong>
                <span className="caption">{label(date)}</span>
              </span>
              <span className="my-2 block text-sm">{p.label}</span>
              <span className="block text-lg font-bold">
                {n === null ? "ثبت نشده" : fa(n) + " تماس"}
              </span>
              {p.target !== null && (
                <span className="caption">
                  حداقل {fa(p.target)}
                  {n !== null && n < p.target
                    ? `؛ ${fa(p.target - n)} تماس باقی‌مانده`
                    : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="local-note mt-4">
        برای ثبت یا اصلاح هر روز، همان روز را انتخاب کن. این جمع از رکوردهای
        محلی همین مرورگر محاسبه می‌شود؛ تأیید رسمی با گزارش CRM است. حد مجاز
        اختلاف از «حدود ۲۷۰» تعیین نشده، بنابراین این بخش فقط پیشرفت برنامه را
        نشان می‌دهد.
      </p>
    </section>
  );
}
