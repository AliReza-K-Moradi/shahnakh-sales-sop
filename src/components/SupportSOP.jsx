import React, { useState } from "react";
import support from "../data/support.json";
import { validCount } from "../lib/schedule.js";

const fa = (n) => Number(n).toLocaleString("fa-IR");
const dateLabel = (day) =>
  new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(
    new Date(day + "T12:00:00"),
  );
const blocks = (items) =>
  items.map((x) => (
    <div className="rule-row" key={x.title}>
      <h3 className="mb-2 font-bold">{x.title}</h3>
      <p>{x.text}</p>
    </div>
  ));
export const SUPPORT_FIELDS = [
  ["pettyCashLimit", "سقف تنخواه و ردیف‌های هزینه مصوب"],
  ["financeContacts", "مرجع تطبیق وصول و تأیید فاکتور نهایی"],
  ["evaluationPolicy", "کارت ارزیابی و سیاست پاداش مصوب"],
];
export const SUPPORT_NAV = [
  ["overview", "SOP من", "House"],
  ["daily", "کار روزانه", "PhoneCall"],
  ["support-orders", "سفارش تا تحویل", "Route"],
  ["support-receivables", "وصول مطالبات", "Clock3"],
  ["support-cash", "تنخواه و اسناد", "NotebookPen"],
  ["support-report", "گزارش روزانه", "FilePenLine"],
  ["crm", "ثبت در CRM", "NotebookPen"],
  ["metrics", "شاخص‌های این نقش", "ChartNoAxesCombined"],
  ["profile", "اطلاعات فردی", "UserRound"],
  ["reference", "قواعد ثابت و مرجع", "BookOpen"],
];
function Intro({ title, children }) {
  return (
    <div className="mb-6">
      <p className="caption mb-2">کارشناس فروش و پشتیبانی</p>
      <h1 className="title">{title}</h1>
      {children && <p className="mt-3 text-muted">{children}</p>}
    </div>
  );
}
function DateInput({ day, setDay }) {
  return (
    <label className="flex flex-wrap items-center gap-3 text-sm">
      <span>تاریخ مرور</span>
      <input
        className="field w-auto"
        type="date"
        dir="ltr"
        aria-label="تاریخ چک‌لیست"
        value={day}
        onChange={(e) => {
          if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value))
            setDay(e.target.value);
        }}
      />
      <span className="text-muted">{dateLabel(day)}</span>
    </label>
  );
}
export default function SupportSOP({
  page,
  person,
  profile,
  day,
  setDay,
  dayData,
  setDayData,
  go,
  onSendReport,
  cloudReady,
  cloudBusy,
}) {
  const [order, setOrder] = useState(0),
    [msg, setMsg] = useState("");
  const n = validCount(dayData.leads),
    done = support.checks.filter((_, i) => dayData.checks?.[i]).length;
  const report = dayData.report || {};
  if (page === "overview")
    return (
      <div className="section-stack">
        <section className="rounded-[24px] bg-forest p-6 text-white sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="mb-2 text-sm text-[#c9debf]">
                پیوست اجرایی فروش و پشتیبانی
              </p>
              <h1 className="text-3xl font-bold sm:text-4xl">{person.name}</h1>
              <p className="mt-3 max-w-3xl text-[#d6e4da]">{support.mission}</p>
              <p className="mt-4 text-sm text-[#c9debf]" dir="ltr">
                {person.code}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-[#ffffff26] px-6 py-4">
              <strong
                className="text-6xl font-bold text-leaf"
                data-testid="role-target"
              >
                ۱۰
              </strong>
              <span className="text-sm">
                سرنخ جدید در روز
                <br />
                بدون حداقل تماس جداگانه
              </span>
            </div>
          </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["support-orders", "سفارش تا تحویل", "۶ مرحله اجرایی"],
            ["support-receivables", "مطالبات ساعت ۱۰", "پیگیری، تطبیق و ارجاع"],
            ["support-cash", "تنخواه چهارشنبه", "تحویل اسناد تا ساعت ۱۴"],
          ].map(([p, title, text]) => (
            <button className="panel text-right" key={p} onClick={() => go(p)}>
              <strong className="block">{title}</strong>
              <span className="caption">{text}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          <section className="panel">
            <div className="section-title">
              <h2>چک‌لیست اجرای امروز</h2>
              <span className="badge">{fa(done)} از ۸</span>
            </div>
            <DateInput {...{ day, setDay }} />
            <div className="mt-5 space-y-3">
              {support.checks.map((text, i) => (
                <label
                  className="flex items-start gap-3 rounded-xl border border-line p-3"
                  key={text}
                >
                  <input
                    type="checkbox"
                    checked={!!dayData.checks?.[i]}
                    onChange={(e) =>
                      setDayData({
                        checks: support.checks.map((_, j) =>
                          j === i ? e.target.checked : !!dayData.checks?.[j],
                        ),
                      })
                    }
                  />
                  <span>{text}</span>
                </label>
              ))}
            </div>
            <p className="local-note mt-4">
              چک‌لیست برای همین فرد و تاریخ در این مرورگر نگهداری می‌شود؛ سوابق
              رسمی در CRM و اسناد واحد مالی ثبت شوند.
            </p>
          </section>
          <div className="space-y-5">
            <section className="panel">
              <h2 className="section-title">سرنخ‌های جدید امروز</h2>
              <label className="label" htmlFor="daily-leads">
                تعداد سرنخ جدید ثبت‌شده در CRM
              </label>
              <input
                id="daily-leads"
                className="field"
                inputMode="numeric"
                type="number"
                min="0"
                max="100000"
                step="1"
                value={dayData.leads || ""}
                onChange={(e) => setDayData({ leads: e.target.value })}
              />
              <div className="mt-4 flex justify-between">
                <span>هدف روزانه: ۱۰ سرنخ</span>
                <strong data-testid="leads-progress">
                  {n === null ? "ثبت نشده" : fa(n) + " از ۱۰"}
                </strong>
              </div>
              <div className="my-3 h-2 overflow-hidden rounded bg-[#e9efe3]">
                <div
                  className="h-full bg-[#287858]"
                  style={{ width: Math.min((n || 0) / 10, 1) * 100 + "%" }}
                />
              </div>
              <p role="status" className="text-sm">
                {n === null
                  ? dayData.leads
                    ? "تعداد سرنخ باید عدد صحیح نامنفی باشد."
                    : "تعداد را از رکوردهای جدید و غیرتکراری CRM وارد کن."
                  : n >= 10
                    ? "هدف روزانه سرنخ جدید تکمیل شده است."
                    : fa(10 - n) + " سرنخ تا هدف امروز باقی مانده است."}
              </p>
              <p className="caption mt-4">
                سرنخ جدید با تعداد تماس متفاوت است. تماس ورودی و پیگیری مشتری
                قبلی، به‌خودی‌خود سرنخ جدید نیستند.
              </p>
            </section>
            <section className="panel">
              <h2 className="section-title">گزارش پایان روز</h2>
              <p>
                گزارش ساعت ۱۶:۳۰ شامل وضعیت سفارش، وصول، تحویل، سرنخ و تنخواه
                برای مدیر فروش و مدیرعامل است.
              </p>
              <button
                className="btn btn-primary mt-4"
                onClick={() => go("support-report")}
              >
                تکمیل گزارش روزانه
              </button>
            </section>
          </div>
        </div>
        <section className="panel">
          <h2 className="section-title">کنترل‌های اصلی این نقش</h2>
          {blocks(support.controls)}
        </section>
      </div>
    );
  if (page === "daily")
    return (
      <>
        <Intro title="ترتیب اجرای روز">{support.mission}</Intro>
        <div className="section-stack">
          <section className="panel">{blocks(support.daily)}</section>
          <section className="panel">
            <h2 className="section-title">ایجاد سرنخ و فروش مجدد</h2>
            <p>
              روزانه ۱۰ سرنخ جدید با نام تولیدکننده، راه تماس، رسته کاری، مصرف
              ماهانه و شهر ثبت کن. اطلاعات نامعلوم را حدس نزن و برای تکمیل آن
              اقدام بعدی تعیین کن.
            </p>
            <p className="mt-3">
              مشتریان بدون سفارش در بیش از ۳۰ روز را شناسایی کن؛ وضعیت خط تولید
              و نیاز تازه را بپرس و امکان رزرو ظرفیت هفته آینده را پس از تأیید
              تأمین پیگیری کن.
            </p>
            <p className="notice mt-4">
              برای این نقش حداقل تماس روزانه جداگانه تعریف نشده است. تماس‌ها و
              ورودی‌ها با زمان، نتیجه و اقدام بعدی در CRM ثبت شوند. تعهد مشتری،
              وصول و کنترل خروج بار مقدم‌اند.
            </p>
          </section>
        </div>
      </>
    );
  if (page === "support-orders")
    return (
      <>
        <Intro title="سفارش از دریافت تا تحویل">
          مشخصات، تأییدها و نتیجه هر مرحله باید در پرونده یکتای سفارش قابل
          پیگیری باشند.
        </Intro>
        <div className="section-stack">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {support.orders.map((s, i) => (
              <button
                className={"tab " + (i === order ? "tab-active" : "")}
                key={s.title}
                aria-pressed={i === order}
                onClick={() => setOrder(i)}
              >
                {s.title}
              </button>
            ))}
          </div>
          <section className="panel" aria-live="polite">
            <h2 className="section-title">{support.orders[order].title}</h2>
            <ul className="list-disc space-y-3 pr-5">
              {support.orders[order].items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
          <section className="panel">
            <h2 className="section-title">مرز اختیار و تأیید</h2>
            {blocks(support.controls)}
          </section>
        </div>
      </>
    );
  if (page === "support-receivables")
    return (
      <>
        <Intro title="مطالبات را با موعد و سند پیگیری کن">
          هر روز ساعت ۱۰، گزارش حسابداری را با پرونده مشتری تطبیق بده. وعده
          پرداخت، وصول تأییدشده محسوب نمی‌شود.
        </Intro>
        <div className="section-stack">
          <section className="panel">{blocks(support.receivables)}</section>
          <section className="panel">
            <h2 className="section-title">ثبت نتیجه هر پیگیری</h2>
            <p>
              شناسه مشتری و فاکتور، مانده، سررسید، سن بدهی، زمان تماس، پاسخ
              واقعی، مبلغ و موعد وعده پرداخت، اقدام بعدی و مرجع ارجاع را ثبت کن.
            </p>
            <p className="notice mt-4">
              پیشنهاد چک یا تضمین در مرحله وصول، مجوز خروج بار نیست. قاعده تسویه
              کامل پیش از خروج و تأیید حسابداری برقرار است.
            </p>
          </section>
        </div>
      </>
    );
  if (page === "support-cash")
    return (
      <>
        <Intro title="تنخواه با سند و مانده روشن">
          سقف تنخواه و ردیف هزینه‌ها باید مصوب باشند. اعداد ۵ یا ۱۰ میلیون در
          فایل اولیه فقط مثال‌اند و سقف این نقش تعیین نشده است.
        </Intro>
        <div className="section-stack">
          <section className="dark-card">
            <h2 className="text-xl font-bold text-leaf">
              چهارشنبه، تا ساعت ۱۴
            </h2>
            <p className="mt-2">
              فرم، اصل اسناد و مانده تنخواه برای بررسی، تسویه و شارژ مجدد به
              حسابداری و مدیر فروش تحویل شود.
            </p>
            <p className="mt-3">
              سقف مصوب: {profile.pettyCashLimit || "در انتظار تعیین و تأیید"}
            </p>
          </section>
          <section className="panel">{blocks(support.cash)}</section>
        </div>
      </>
    );
  if (page === "metrics")
    return (
      <>
        <Intro title="شاخص‌های فروش و پشتیبانی">
          هدف مشخص این نقش ۱۰ سرنخ جدید در روز است؛ کنترل سفارش، وصول، تنخواه و
          گزارش نیز جداگانه مرور می‌شوند.
        </Intro>
        <div className="section-stack">
          <section className="panel">{blocks(support.metrics)}</section>
          <section className="panel">
            <h2 className="section-title">مبنای ارزیابی ماهانه</h2>
            <p>{support.evaluation}</p>
            <button className="btn mt-4" onClick={() => go("profile")}>
              ثبت سیاست ارزیابی مصوب
            </button>
          </section>
        </div>
      </>
    );
  if (page === "support-report")
    return (
      <>
        <Intro title="گزارش روزانه ساعت ۱۶:۳۰">
          گزارش قابل مرور برای حمید فاطمی و سعید تقی‌زاده.
        </Intro>
        <section className="panel">
          <DateInput {...{ day, setDay }} />
          <p className="notice my-5">
            سرنخ جدید ثبت‌شده امروز: {n === null ? "وارد نشده" : fa(n)} از هدف
            ۱۰. پیش‌نویس در مرورگر ذخیره می‌شود. برای ثبت مرکزی، گزارش را به
            Google Sheets ارسال کن و پیام تأیید دریافت را ببین.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const reportSavedAt = new Date().toISOString();
              setDayData({ reportSavedAt });
              setMsg("گزارش در مرورگر ذخیره شد؛ در حال ارسال به شیت…");
              const result = await onSendReport({ reportSavedAt });
              setMsg(result.message);
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              {support.reportFields.map(([key, label]) => (
                <label key={key}>
                  <span className="label">{label}</span>
                  <textarea
                    className="field"
                    aria-label={label}
                    rows="3"
                    maxLength="2000"
                    value={report[key] || ""}
                    onChange={(e) => {
                      setDayData({
                        report: { ...report, [key]: e.target.value },
                      });
                      setMsg("");
                    }}
                  />
                </label>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={!cloudReady || cloudBusy}
              >
                ثبت و ارسال گزارش به شیت
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  const text = [
                    `گزارش روزانه ${person.name}`,
                    dateLabel(day),
                    `سرنخ جدید: ${n === null ? "وارد نشده" : fa(n)} / ۱۰`,
                    ...support.reportFields.map(
                      ([key, label]) =>
                        `${label}\n${report[key] || "ثبت نشده"}`,
                    ),
                  ].join("\n\n");
                  const url = URL.createObjectURL(
                    new Blob([text], { type: "text/plain;charset=utf-8" }),
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `ShahNakh-Elham-Report-${day}.txt`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
              >
                دریافت متن گزارش
              </button>
            </div>
            <p role="status" className="mt-3 text-sm">
              {msg}
            </p>
          </form>
        </section>
      </>
    );
  return null;
}
export function SupportPrint({ person, profile, fields, day, dayData }) {
  return (
    <article className="print-only" dir="rtl">
      <h1>SOP فردی {person.name}</h1>
      <p className="print-meta">
        شاه‌نخ | کارشناس فروش و پشتیبانی | نسخه ۱٫۱ | {person.code}
      </p>
      <p>
        مرجع اختصاصی: {support.source}؛ قواعد مشترک ثبت و تعهد مشتری از SOP جامع
        فروش.
      </p>
      <p>{support.mission}</p>
      <p>
        <strong>هدف روزانه ۱۰ سرنخ جدید؛ بدون حداقل تماس جداگانه.</strong>
      </p>
      <h2>اطلاعات فردی</h2>
      <table>
        <tbody>
          {fields.concat(SUPPORT_FIELDS).map(([key, label]) => (
            <tr key={key}>
              <th>{label}</th>
              <td>{profile[key] || "در انتظار تعیین و تأیید"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {[
        ["ترتیب اجرای روز", support.daily],
        ["کنترل‌ها و حدود اختیار", support.controls],
        ["وصول مطالبات ساعت ۱۰", support.receivables],
        ["تنخواه و تحویل چهارشنبه ساعت ۱۴", support.cash],
        ["شاخص‌های قابل مرور", support.metrics],
      ].map(([title, items]) => (
        <section key={title}>
          <h2>{title}</h2>
          {items.map((x) => (
            <div key={x.title}>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </div>
          ))}
        </section>
      ))}
      <h2>سفارش تا تحویل</h2>
      {support.orders.map((x) => (
        <section key={x.title}>
          <h3>{x.title}</h3>
          <ul>
            {x.items.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      ))}
      <h2>چک‌لیست روزانه</h2>
      <ul>
        {support.checks.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <h2>ثبت در CRM و سابقه تصمیم</h2>
      <p>
        شناسه پرونده، مالک، اقدام‌کننده واقعی، زمان، نتیجه، مقدار و واحد، وضعیت
        مالی، اقدام بعدی و موعد ثبت شوند. موعد اولیه پاک نشود. عکس رسید، تأیید
        وصول نیست؛ اطلاعات نامعلوم با اقدام تکمیل ثبت شوند. خطر تأخیر حداکثر ظرف
        یک ساعت کاری ارجاع شود.
      </p>
      <h2>ارزیابی ماهانه</h2>
      <p>{support.evaluation}</p>
      <h2>گزارش روزانه {dateLabel(day)}</h2>
      <p>
        سرنخ جدید ثبت‌شده:{" "}
        {validCount(dayData.leads) === null ? "ثبت نشده" : fa(dayData.leads)} از
        هدف ۱۰.
      </p>
      {support.reportFields.map(([key, label]) => (
        <section className="keep" key={key}>
          <h3>{label}</h3>
          <p className="whitespace-pre-wrap">
            {dayData.report?.[key] || "ثبت نشده"}
          </p>
        </section>
      ))}
      <p>
        اطلاعات ثبت‌شده محلی است؛ سوابق رسمی در CRM و اسناد مالی نگهداری و گزارش
        روزانه برای مدیر فروش و مدیرعامل ارسال شود.
      </p>
    </article>
  );
}
