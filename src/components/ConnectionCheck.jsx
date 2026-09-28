import React, { useState } from "react";
import { collectVisibleFields, useSheetSync } from "../lib/sheets.js";

// Maintenance view: test records are explicitly separated from employee activity.
export default function ConnectionCheck() {
  const sync = useSheetSync();
  const [result, setResult] = useState("");
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  async function send(event) {
    event.preventDefault();
    const fields = collectVisibleFields(event.currentTarget);
    const response = await sync.submit({
      personId: "test",
      personName: "آزمایش اتصال",
      kind: "test",
      day: today,
      page: "آزمایش اتصال سایت به شیت",
      fields,
      summary: { calls: 0, leads: null, visits: null },
    });
    setResult(response.message);
  }
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <section className="panel">
        <p className="eyebrow">شاه‌نخ · بررسی اتصال</p>
        <h1 className="mt-2 text-2xl font-bold">آزمایش ثبت در Google Sheets</h1>
        <p className="mt-3 text-muted">
          این ارسال با نام «آزمایش اتصال» ثبت می‌شود و عملکرد هیچ‌کدام از افراد
          تیم محسوب نمی‌شود.
        </p>
        <form className="mt-6 space-y-4" onSubmit={send}>
          <label className="block">
            <span className="label">شرح آزمایش</span>
            <textarea
              name="test-note"
              className="field"
              defaultValue="ثبت آزمایشی اتصال سایت شاه‌نخ به Google Sheets"
            />
          </label>
          <label className="block">
            <span className="label">صفر واقعی</span>
            <input
              name="test-zero"
              type="number"
              className="field"
              defaultValue="0"
            />
          </label>
          <label className="block">
            <span className="label">فیلد خالی</span>
            <input name="test-empty" className="field" defaultValue="" />
          </label>
          <label className="flex gap-2">
            <input name="test-check" type="checkbox" defaultChecked />
            <span className="label">تأیید چک‌لیست آزمایشی</span>
          </label>
          <label className="block">
            <span className="label">متن شبیه فرمول</span>
            <input name="test-formula" className="field" defaultValue="=1+1" />
          </label>
          <button
            className="btn btn-primary"
            disabled={!sync.ready || sync.busy}
          >
            {sync.busy ? "در حال ارسال…" : "ارسال آزمایشی به شیت"}
          </button>
        </form>
        {sync.pending > 0 && (
          <button
            className="btn mt-3"
            disabled={sync.busy}
            onClick={sync.retry}
          >
            ارسال دوباره
          </button>
        )}
        <p role="status" className="mt-4 break-words">
          {sync.message || result}
        </p>
        <a className="btn mt-6" href="./">
          بازگشت به سایت SOP
        </a>
      </section>
    </main>
  );
}
