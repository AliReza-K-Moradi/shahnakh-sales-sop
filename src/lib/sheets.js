import { useEffect, useRef, useState } from "react";
import connection from "../data/connection.json";

const OUTBOX = "shahnakh-sheets-outbox-v1";
const CHANNEL = "shahnakh-sheets-v1";
const trustedOrigin = (origin) => {
  try {
    const url = new URL(origin);
    return (
      url.protocol === "https:" &&
      (url.hostname === "script.google.com" ||
        url.hostname.endsWith(".googleusercontent.com"))
    );
  } catch {
    return false;
  }
};

export function collectVisibleFields(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll("input, textarea, select"))
    .filter(
      (element) =>
        !["file", "hidden", "password", "button", "submit"].includes(
          element.type,
        ),
    )
    .map((element, i) => {
      const label =
        element.getAttribute("aria-label") ||
        element.labels?.[0]?.querySelector(".label")?.textContent ||
        element.labels?.[0]?.textContent ||
        element.name ||
        element.id ||
        `فیلد ${i + 1}`;
      let value = element.value;
      if (element.type === "checkbox" || element.type === "radio")
        value = element.checked;
      else if (
        element.type === "number" &&
        value !== "" &&
        Number.isFinite(Number(value))
      )
        value = Number(value);
      else if (element.tagName === "SELECT")
        value = element.selectedOptions[0]?.textContent?.trim() || value;
      return {
        key: `form.${element.id || element.name || i}`,
        label: label.trim().slice(0, 300),
        value,
      };
    });
}

export class SheetsBridge {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.channel = crypto.randomUUID();
    this.peer = null;
    this.pending = new Map();
    this.waiters = [];
    this.listener = (event) => {
      const data = event.data;
      if (
        !trustedOrigin(event.origin) ||
        !data ||
        data.protocol !== CHANNEL ||
        data.channel !== this.channel
      )
        return;
      if (data.type === "ready") {
        if (this.peer && this.peer.source !== event.source) return;
        this.peer = { source: event.source, origin: event.origin };
        this.peer.source.postMessage(
          { protocol: CHANNEL, channel: this.channel, type: "hello" },
          this.peer.origin,
        );
        this.waiters.splice(0).forEach((resolve) => resolve());
      } else if (this.peer?.source === event.source && data.type === "result") {
        const task = this.pending.get(data.id);
        if (!task) return;
        clearTimeout(task.timer);
        this.pending.delete(data.id);
        if (data.ok && data.receipt?.id === data.id) task.resolve(data.receipt);
        else task.reject(new Error(data.error || "شیت ثبت را تأیید نکرد."));
      }
    };
    window.addEventListener("message", this.listener);
  }
  async connect() {
    if (this.peer) return;
    if (!this.frame) {
      const url = new URL(this.endpoint);
      if (
        url.origin !== "https://script.google.com" ||
        !url.pathname.endsWith("/exec")
      )
        throw new Error("نشانی اتصال معتبر نیست.");
      url.searchParams.set("channel", this.channel);
      url.searchParams.set("origin", window.location.origin);
      this.frame = document.createElement("iframe");
      this.frame.hidden = true;
      this.frame.title = "اتصال ثبت اطلاعات شاه‌نخ";
      this.frame.src = url.href;
      this.frame.referrerPolicy = "strict-origin-when-cross-origin";
      document.body.appendChild(this.frame);
    }
    await new Promise((resolve, reject) => {
      let timer;
      const ready = () => {
        clearTimeout(timer);
        resolve();
      };
      this.waiters.push(ready);
      timer = setTimeout(() => {
        this.waiters = this.waiters.filter((fn) => fn !== ready);
        reject(
          new Error(
            "ارتباط با شیت برقرار نشد. اتصال اینترنت را بررسی و دوباره ارسال کنید.",
          ),
        );
      }, 25000);
    });
  }
  async send(record) {
    await this.connect();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(record.id);
        reject(
          new Error(
            "پاسخ تأیید شیت دریافت نشد. این ثبت برای ارسال دوباره نگهداری شد.",
          ),
        );
      }, 35000);
      this.pending.set(record.id, { resolve, reject, timer });
      this.peer.source.postMessage(
        {
          protocol: CHANNEL,
          channel: this.channel,
          type: "submit",
          id: record.id,
          record,
        },
        this.peer.origin,
      );
    });
  }
  destroy() {
    window.removeEventListener("message", this.listener);
    this.frame?.remove();
    for (const task of this.pending.values()) {
      clearTimeout(task.timer);
      task.reject(new Error("اتصال بسته شد."));
    }
    this.pending.clear();
  }
}

function readQueue() {
  try {
    const raw = JSON.parse(localStorage.getItem(OUTBOX) || "[]");
    return Array.isArray(raw)
      ? raw.filter(
          (r) => r && typeof r.id === "string" && Array.isArray(r.fields),
        )
      : [];
  } catch {
    return [];
  }
}

export function useSheetSync() {
  const ready =
    Boolean(connection.endpoint) &&
    window.location.origin === connection.siteOrigin;
  const queue = useRef(null);
  if (queue.current === null) queue.current = readQueue();
  const bridge = useRef(null);
  const running = useRef(false);
  const [status, setStatus] = useState({
    busy: false,
    pending: queue.current.length,
    message: "",
    receipt: null,
    error: false,
  });
  const saveQueue = () => {
    localStorage.setItem(OUTBOX, JSON.stringify(queue.current));
    setStatus((s) => ({ ...s, pending: queue.current.length }));
  };
  async function flush() {
    if (running.current || !ready || !queue.current.length) return;
    running.current = true;
    setStatus((s) => ({
      ...s,
      busy: true,
      error: false,
      message: "در حال ارسال و دریافت تأیید شیت…",
    }));
    try {
      if (!navigator.onLine)
        throw new Error("اینترنت قطع است. ثبت برای ارسال دوباره نگهداری شد.");
      if (!bridge.current)
        bridge.current = new SheetsBridge(connection.endpoint);
      while (queue.current.length) {
        const record = queue.current[0];
        const receipt = await bridge.current.send(record);
        queue.current.shift();
        saveQueue();
        setStatus((s) => ({
          ...s,
          error: false,
          receipt,
          message: `ثبت ${record.personName} در Google Sheets تأیید شد. شناسه دریافت: ${receipt.id}`,
        }));
      }
    } catch (error) {
      bridge.current?.destroy();
      bridge.current = null;
      setStatus((s) => ({
        ...s,
        error: true,
        message: `${error.message} ${queue.current.length ? "نسخه ارسال‌نشده در صف باقی است." : ""}`,
      }));
    } finally {
      running.current = false;
      setStatus((s) => ({ ...s, busy: false, pending: queue.current.length }));
    }
  }
  async function submit(data) {
    if (!ready)
      return {
        ok: false,
        message: "ارسال مرکزی از نسخه آنلاین سایت انجام می‌شود.",
      };
    let problem = "";
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(data.day || "") ||
      Number.isNaN(new Date(data.day + "T12:00:00Z").getTime())
    )
      problem = "تاریخ فعالیت را کامل و معتبر وارد کنید.";
    else if (
      Object.values(data.summary || {}).some(
        (n) => n !== null && (!Number.isInteger(n) || n < 0 || n > 999999),
      )
    )
      problem = "تعداد تماس، سرنخ و ملاقات باید عدد صحیح و نامنفی باشد.";
    else if (
      !data.fields?.length ||
      data.fields.length > 400 ||
      data.fields.some(
        (field) => typeof field.value === "string" && field.value.length > 5000,
      )
    )
      problem =
        "متن هر فیلد باید حداکثر ۵۰۰۰ نویسه باشد. متن طولانی را کوتاه کنید و دوباره ارسال کنید.";
    if (problem) {
      setStatus((s) => ({ ...s, error: true, message: problem }));
      return { ok: false, message: problem };
    }
    const record = {
      ...data,
      id: crypto.randomUUID(),
      clientTime: new Date().toISOString(),
      schema: 1,
      version: connection.version,
    };
    queue.current.push(record);
    try {
      saveQueue();
    } catch {
      queue.current.pop();
      const message =
        "مرورگر نتوانست صف ارسال را نگه دارد. از اطلاعات پشتیبان بگیرید و پس از آزادکردن فضای مرورگر دوباره ارسال کنید.";
      setStatus((s) => ({ ...s, error: true, message }));
      return { ok: false, message };
    }
    await flush();
    const pending = queue.current.some((item) => item.id === record.id);
    return {
      ok: !pending,
      pending,
      id: record.id,
      message: pending
        ? "پیش‌نویس محفوظ است؛ ثبت در صف ارسال به شیت قرار دارد."
        : "ثبت در Google Sheets تأیید شد.",
    };
  }
  useEffect(() => {
    const online = () => {
      void flush();
    };
    window.addEventListener("online", online);
    void flush();
    return () => {
      window.removeEventListener("online", online);
      bridge.current?.destroy();
      bridge.current = null;
    };
  }, []);
  return { ...status, ready, submit, retry: flush };
}
