import React from "react";

export default function SheetSubmission({
  sync,
  person,
  dayLabel,
  onSubmit,
  observationPage,
}) {
  if (person.id === "template") return null;
  return (
    <section
      className="mb-6 rounded-2xl border border-line bg-white p-4"
      aria-label="ارسال به Google Sheets"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">ثبت مرکزی {person.name}</p>
          <p className="mt-1 text-sm text-muted">
            {dayLabel} · پیش‌نویس‌ها در مرورگر می‌مانند. برای ثبت مرکزی، اطلاعات
            را ارسال کنید.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!observationPage && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!sync.ready || sync.busy}
              onClick={onSubmit}
            >
              {sync.busy ? "در حال ارسال…" : "ارسال اطلاعات به شیت"}
            </button>
          )}
          {sync.pending > 0 && (
            <button
              type="button"
              className="btn"
              disabled={sync.busy}
              onClick={sync.retry}
            >
              ارسال دوباره ({sync.pending.toLocaleString("fa-IR")})
            </button>
          )}
        </div>
      </div>
      {observationPage && (
        <p className="mt-2 text-sm text-muted">
          هر مشاهده از دکمه «ثبت و ارسال مشاهده» در فرم خودش ارسال می‌شود.
        </p>
      )}
      {!sync.ready && (
        <p className="mt-2 text-sm text-amber-800">
          ارسال مرکزی از{" "}
          <a
            className="underline"
            href="https://alireza-k-moradi.github.io/shahnakh-sales-sop/"
          >
            نسخه آنلاین سایت
          </a>{" "}
          انجام می‌شود.
        </p>
      )}
      {sync.message && (
        <p
          role="status"
          className={
            "mt-3 break-words text-sm " +
            (sync.error ? "text-amber-800" : "text-forest")
          }
        >
          {sync.message}
        </p>
      )}
    </section>
  );
}
