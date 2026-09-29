import React from "react";
import teamPolicy from "../data/team-policy.json";
import WeeklyPlan from "./WeeklyPlan.jsx";
import {
  isLeadRole,
  policyText,
  dayPolicy,
  workStatus,
  validCount,
  weekSummary,
  WEEKLY_LEAD_TARGET,
} from "../lib/schedule.js";

const fa = (n) => Number(n).toLocaleString("fa-IR");

export function WeeklyPolicy({ person, compact = false }) {
  return (
    <section className={compact ? "notice" : "panel"}>
      <h2 className={compact ? "mb-2 font-bold" : "section-title"}>
        برنامه جاری تیم فروش
      </h2>
      <p>{policyText(person)}</p>
      <p className="mt-3 text-sm text-muted">
        موعد توافقی مشتری در تمام روزهای کاری مقدم است. تماس، لید جدید و ملاقات
        حضوری جدا ثبت می‌شوند.
      </p>
    </section>
  );
}

export function LeadSourcesView({ person }) {
  const assigned = teamPolicy.people.find((p) => p.id === person.id);
  const people = assigned ? [assigned] : teamPolicy.people;
  return (
    <section className="panel" data-testid="lead-sources">
      <h2 className="section-title">منابع پیدا کردن لید</h2>
      <p className="mb-4 text-muted">
        لیدها پنجشنبه هر هفته پیدا می‌شوند. هدف هر یک از چهار کارشناس ۲۴۰ لید
        جدید در هفته است؛ رکورد تکراری، لید تازه محسوب نمی‌شود.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {people.map((p) => (
          <article className="rounded-xl border border-line p-4" key={p.id}>
            <h3 className="mb-3 font-bold">{p.name}</h3>
            <div className="flex flex-wrap gap-2">
              {p.sources.map((name) => (
                <span className="badge" key={name}>
                  {name}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
      <p className="caption mt-4">
        نام، راه تماس، رسته کاری، شهر، منبع لید و مالک را در CRM ثبت کن. پیش از
        افزودن، تکراری‌نبودن رکورد را بررسی و برای تکمیل اطلاعات نامعلوم اقدام
        بعدی تعیین کن.
      </p>
    </section>
  );
}

export function DayControls({ person, day, dayData, setDayData }) {
  const policy = dayPolicy(day, dayData, person);
  return (
    <div className="space-y-4 rounded-xl bg-[#f4f7ef] p-4">
      <label>
        <span className="label">نوع روز کاری</span>
        <select
          className="field"
          aria-label="نوع روز کاری"
          value={workStatus(day, dayData)}
          onChange={(e) => setDayData({ workStatus: e.target.value })}
        >
          <option value="full">روز کامل کاری</option>
          <option value="off">تعطیل یا مرخصی کامل</option>
          <option value="short">روز کوتاه مصوب</option>
        </select>
      </label>
      <p className="text-sm">
        <strong>{policy.label}: </strong>
        {policy.message}
      </p>
      {policy.followup && (
        <label>
          <span className="label">روش پیگیری امروز</span>
          <select
            className="field"
            aria-label="روش پیگیری امروز"
            value={dayData.followupMode || ""}
            onChange={(e) => setDayData({ followupMode: e.target.value })}
          >
            <option value="">انتخاب کنید</option>
            <option value="phone">تلفنی</option>
            <option value="field">میدانی و حضوری</option>
            <option value="mixed">ترکیبی</option>
          </select>
        </label>
      )}
      <label>
        <span className="label">ملاقات حضوری انجام‌شده</span>
        <input
          className="field"
          aria-label="ملاقات حضوری انجام‌شده"
          type="number"
          min="0"
          max="100000"
          step="1"
          value={dayData.visits || ""}
          onChange={(e) => setDayData({ visits: e.target.value })}
        />
      </label>
      <label>
        <span className="label">نتیجه پیگیری و اقدام بعدی</span>
        <textarea
          className="field"
          aria-label="نتیجه پیگیری و اقدام بعدی"
          rows="2"
          maxLength="2000"
          value={dayData.followupNotes || ""}
          onChange={(e) => setDayData({ followupNotes: e.target.value })}
        />
      </label>
    </div>
  );
}

export function CallCounter({ person, day, dayData, setDayData }) {
  const policy = dayPolicy(day, dayData, person),
    count = validCount(dayData.calls);
  return (
    <section className="panel">
      <h2 className="section-title">تماس‌های این روز</h2>
      <label className="label" htmlFor="daily-count">
        تماس خروجی قابل‌شمارش ثبت‌شده در CRM
      </label>
      <input
        className="field"
        id="daily-count"
        type="number"
        min="0"
        max="100000"
        step="1"
        inputMode="numeric"
        value={dayData.calls || ""}
        onChange={(e) => setDayData({ calls: e.target.value })}
      />
      <p className="mt-3 font-semibold">
        {policy.target === null
          ? policy.label
          : `حداقل این روز: ${fa(policy.target)} تماس`}
      </p>
      <p className="mt-2 text-sm" role="status">
        {count === null
          ? "تعداد واقعی را از CRM وارد کن."
          : policy.target === null
            ? `${fa(count)} تماس ثبت‌شده؛ این روز حداقل ثابت تماس ندارد.`
            : count >= policy.target
              ? "حداقل تماس این روز تکمیل شده است."
              : `${fa(policy.target - count)} تماس تا حداقل این روز باقی مانده است.`}
      </p>
      <p className="caption mt-3">
        پیگیری‌های سررسیددار در همه روزها انجام شوند. ملاقات حضوری و یافتن لید،
        تماس تلفنی محسوب نمی‌شوند.
      </p>
    </section>
  );
}

export function LeadCounter({ person, day, days, dayData, setDayData }) {
  const summary = weekSummary(person, day, days),
    count = validCount(dayData.leads);
  return (
    <section className="panel">
      <h2 className="section-title">لیدهای جدید این روز</h2>
      <label className="label" htmlFor="daily-leads">
        تعداد لید جدید و غیرتکراری ثبت‌شده در CRM
      </label>
      <input
        className="field"
        id="daily-leads"
        inputMode="numeric"
        type="number"
        min="0"
        max="100000"
        step="1"
        value={dayData.leads || ""}
        onChange={(e) => setDayData({ leads: e.target.value })}
      />
      <p className="mt-4 font-semibold" data-testid="leads-progress">
        لید جدید هفته: {fa(summary.leads)} از {fa(WEEKLY_LEAD_TARGET)}
      </p>
      <div className="my-3 h-2 overflow-hidden rounded bg-[#e9efe3]">
        <div
          className="h-full bg-[#287858]"
          style={{
            width: Math.min(summary.leads / WEEKLY_LEAD_TARGET, 1) * 100 + "%",
          }}
        />
      </div>
      <p role="status" className="text-sm">
        {count === null
          ? "تعداد واقعی این روز را وارد کن؛ خالی با صفر فرق دارد."
          : `${fa(count)} لید در تاریخ انتخاب‌شده ثبت شده است.`}
      </p>
      <p className="caption mt-3">
        پیدا کردن لید پنجشنبه انجام می‌شود. هدف ۲۴۰ لید برای الهام هم کامل است و
        فقط تعداد تماس‌های او نصف کارشناسان فروش است. مجموع نمایش‌داده‌شده از
        داده‌های همین مرورگر است.
      </p>
    </section>
  );
}

export function SampleRules() {
  return (
    <section className="panel" data-testid="sample-rules">
      <h2 className="section-title">کالیته و نمونه قواره</h2>
      <ul className="space-y-3">
        {teamPolicy.samples.map((text) => (
          <li className="rule-row" key={text}>
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MeetingRules() {
  return (
    <section className="panel" data-testid="meeting-rules">
      <h2 className="section-title">تقویم جلسات تیم</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {teamPolicy.meetings.map((meeting) => (
          <article
            className="rounded-xl border border-line p-4"
            key={meeting.title}
          >
            <h3 className="font-bold">{meeting.title}</h3>
            <p className="my-2 text-sm font-semibold text-forest">
              {meeting.frequency}
            </p>
            <p className="text-sm text-muted">{meeting.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function TeamPlan({
  person,
  day,
  setDay,
  days,
  dayData,
  setDayData,
}) {
  return (
    <div className="section-stack">
      <div>
        <p className="caption mb-2">برنامه اجرایی تیم فروش</p>
        <h1 className="title">لید، تماس، کالیته و جلسات</h1>
        <p className="mt-3 text-muted">
          برنامه جاری {person.name} و قواعد مشترک تیم.
        </p>
      </div>
      <WeeklyPolicy person={person} />
      {isLeadRole(person) && (
        <>
          <label className="panel flex flex-wrap items-center gap-3">
            <span className="label mb-0">تاریخ برنامه هفتگی</span>
            <input
              aria-label="تاریخ برنامه هفتگی"
              className="field w-auto"
              type="date"
              dir="ltr"
              value={day}
              onChange={(e) => {
                if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value))
                  setDay(e.target.value);
              }}
            />
          </label>
          <WeeklyPlan {...{ person, day, days, setDay }} />
          <DayControls {...{ person, day, dayData, setDayData }} />
          <div className="grid gap-5 xl:grid-cols-2">
            <CallCounter {...{ person, day, dayData, setDayData }} />
            <LeadCounter {...{ person, day, days, dayData, setDayData }} />
          </div>
        </>
      )}
      <LeadSourcesView person={person} />
      <SampleRules />
      <MeetingRules />
    </div>
  );
}

export function PolicyPrint({ person }) {
  const assigned = teamPolicy.people.find((p) => p.id === person.id);
  return (
    <section>
      <h2>برنامه جاری لید و تماس</h2>
      <p>{policyText(person)}</p>
      <h3>منابع پیدا کردن لید در پنجشنبه</h3>
      <ul>
        {(assigned ? [assigned] : teamPolicy.people).map((p) => (
          <li key={p.id}>
            <strong>{p.name}:</strong> {p.sources.join("، ")}
          </li>
        ))}
      </ul>
      <h3>کالیته و نمونه قواره</h3>
      <ul>
        {teamPolicy.samples.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
      <h3>جلسات تیم</h3>
      <ul>
        {teamPolicy.meetings.map((meeting) => (
          <li key={meeting.title}>
            <strong>
              {meeting.title} — {meeting.frequency}:
            </strong>{" "}
            {meeting.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
