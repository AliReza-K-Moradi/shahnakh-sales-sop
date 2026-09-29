import React from "react";
import {
  dayPolicy,
  weekday,
  WEEKDAY_NAMES,
  validCount,
  weeklyCallTarget,
  WEEKLY_LEAD_TARGET,
  weekSummary,
} from "../lib/schedule.js";
const fa = (n) => Number(n).toLocaleString("fa-IR");
const label = (day) =>
  new Intl.DateTimeFormat("fa-IR", { month: "long", day: "numeric" }).format(
    new Date(day + "T12:00:00"),
  );
export default function WeeklyPlan({ person, day, days, setDay }) {
  const summary = weekSummary(person, day, days);
  return (
    <section className="panel" data-testid="weekly-plan">
      <div className="section-title flex-wrap">
        <h2>برنامه و عملکرد این هفته</h2>
        <span className="badge">
          {label(summary.dates[0])} تا {label(summary.dates[6])}
        </span>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-[#f4f7ef] p-4">
          <p className="caption">تماس در یکشنبه، دوشنبه و چهارشنبه</p>
          <strong className="text-2xl" data-testid="weekly-call-total">
            {fa(summary.plannedDayCalls)} از {fa(weeklyCallTarget(person))}
          </strong>
          <p className="mt-2 text-sm">
            روز تماس تکمیل‌شده: {fa(summary.completedDays)} از{" "}
            {fa(summary.requiredDays)}
          </p>
        </div>
        <div className="rounded-xl bg-[#f4f7ef] p-4">
          <p className="caption">لید جدید هفته</p>
          <strong className="text-2xl" data-testid="weekly-lead-total">
            {fa(summary.leads)} از {fa(WEEKLY_LEAD_TARGET)}
          </strong>
          <p className="mt-2 text-sm">روز پیدا کردن لید: پنجشنبه</p>
        </div>
        <div className="rounded-xl bg-[#f4f7ef] p-4">
          <p className="caption">تمام تماس‌های واقعی هفته</p>
          <strong className="text-2xl">{fa(summary.totalCalls)}</strong>
          <p className="mt-2 text-sm">
            شامل تماس‌های پیگیری؛ جایگزین هدف هر روز تماس نمی‌شود.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        {summary.dates.map((date) => {
          const data = days[`${person.id}_${date}`] || {},
            p = dayPolicy(date, data, person),
            calls = validCount(data.calls),
            leads = validCount(data.leads);
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
              <span className="flex flex-wrap justify-between gap-2">
                <strong>{WEEKDAY_NAMES[weekday(date)]}</strong>
                <span className="caption">{label(date)}</span>
              </span>
              <span className="my-2 block text-sm">{p.label}</span>
              <span className="block font-bold">
                {calls === null ? "تماس ثبت نشده" : fa(calls) + " تماس"}
              </span>
              {p.target !== null && (
                <span className="caption">حداقل {fa(p.target)} تماس</span>
              )}
              <span className="mt-2 block text-sm">
                {leads === null ? "لید ثبت نشده" : fa(leads) + " لید جدید"}
              </span>
              {p.followup && (
                <span className="caption mt-2 block">
                  آموزش صبح · جلسات تکی
                </span>
              )}
              {p.leadDay && (
                <span className="caption mt-2 block">
                  لیدسازی · جلسه گزارش‌ها
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="local-note mt-4">
        برای ثبت یا اصلاح یک روز، کارت همان روز را انتخاب کن. جمع‌ها از داده‌های
        همین فرد در همین مرورگر محاسبه می‌شوند. تماس و لید جدید جدا هستند؛
        برنامه تماس برای هفته کامل کاری است و تعطیلی یا روز کوتاه طبق مصوبه جدا
        گزارش می‌شود.
      </p>
    </section>
  );
}
