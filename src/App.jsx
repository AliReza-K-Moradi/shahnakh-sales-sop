import React, { useEffect, useState, useRef } from "react";
import source from "./data/reference-content.json";
import roles from "./data/roles.json";
import SupportSOP, {
  SUPPORT_NAV,
  SUPPORT_FIELDS,
  SupportPrint,
} from "./components/SupportSOP.jsx";
import WeeklyPlan, { MohammadPolicy } from "./components/WeeklyPlan.jsx";
import { dayPolicy, workStatus, MOHAMMAD_POLICY } from "./lib/schedule.js";

const PEOPLE = [
  {
    id: "template",
    name: "قالب استاندارد کارشناس فروش",
    role: "قالب قابل تکثیر",
    kind: "rep",
    target: 45,
    code: "SN-SALES-TPL-01",
  },
  {
    id: "mohammad",
    name: "محمد یوسفلو",
    role: "کارشناس فروش",
    kind: "rep",
    target: 45,
    code: "SN-SALES-REP-01",
  },
  {
    id: "zahra",
    name: "زهرا سحابی",
    role: "کارشناس فروش",
    kind: "rep",
    target: 45,
    code: "SN-SALES-REP-02",
  },
  {
    id: "amirhossein",
    name: "امیرحسین تقی‌زاده",
    role: "کارشناس فروش",
    kind: "rep",
    target: 45,
    code: "SN-SALES-REP-03",
  },
  {
    id: "elham",
    name: "الهام حاج‌حسینی",
    role: "کارشناس فروش و پشتیبانی",
    kind: "support",
    target: null,
    leadTarget: 10,
    code: "SN-SALES-SUP-01",
  },
  {
    id: "hamid",
    name: "حمید فاطمی",
    role: "مدیر فروش",
    kind: "manager",
    target: 12,
    code: "SN-SALES-MGR-01",
  },
  {
    id: "saeed",
    name: "سعید تقی‌زاده",
    role: "مدیرعامل در تجربه فروش",
    kind: "ceo",
    target: 12,
    code: "SN-SALES-CEO-01",
  },
];
const fa = (n) =>
  Number(n).toLocaleString("fa-IR", { maximumFractionDigits: 2 });
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const dateLabel = (d) => {
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(
      new Date(d + "T12:00:00"),
    );
  } catch {
    return d;
  }
};
const STORAGE = "shahnakh-personal-sop-v1";
const EMPTY = {
  profiles: {},
  days: {},
  observations: [],
  selected: "mohammad",
};
const FIELDS = [
  ["period", "دوره و تاریخ شروع اجرا"],
  ["hours", "ساعت کاری مصوب"],
  ["customers", "سبد مشتری و محدوده مسئولیت"],
  ["product", "تمرکز محصول"],
  ["orders", "هدف سفارش دوره و مرجع تصویب"],
  ["visit", "روز و بازه بازدید"],
  ["backup", "جانشین و روش تحویل کار"],
  ["priority", "اولویت این دوره"],
  ["authority", "حدود اختیار و مرجع تأییدها"],
  ["development", "هدف توسعه فردی"],
  ["approval", "تأییدکننده و تاریخ تأیید"],
];
const repDaily = [
  {
    title: "مرور تعهدات در شروع روز",
    text: "۱۵ دقیقه اول، موعدهای باز و پرونده تماس‌ها را مرور کن. پیگیری سررسیددار مشتری و تعهدهای بحرانی مقدم‌اند.",
  },
  {
    title: "اجرای تماس‌ها",
    text: "حداقل ۴۵ تماس خروجی قابل‌شمارش در روز کامل؛ ترکیب پایه ۱۵ جدید، ۲۰ پیگیری و ۱۰ احیاست. با افزایش پیگیری، ابتدا سهم احیا و سپس جدید جابه‌جا می‌شود.",
  },
  {
    title: "ثبت تا پایان هر بازه",
    text: "نتیجه واقعی هر تماس، شرح کوتاه و اقدام بعدی را حداکثر تا پایان همان بازه در CRM ثبت کن. اطلاعات نامعلوم را حدس نزن.",
  },
  {
    title: "پیگیری سفارش تا دریافت",
    text: "تأمین، تأیید مالی، ارسال و تأیید دریافت را در موعدشان پیگیری کن. هر خطر تأخیر را ظرف یک ساعت کاری ارجاع بده.",
  },
  {
    title: "بستن روز",
    text: "حداقل تماس و کارهای سررسیددار را مرور کن؛ برای هر فرصت باز، مالک و اقدام بعدی با تاریخ و ساعت معتبر مشخص کن.",
  },
];
function dailyPlan(person) {
  if (person.kind !== "rep") return roles[person.kind].daily;
  if (person.id !== "mohammad") return repDaily;
  return repDaily.map((item, index) =>
    index === 1
      ? { title: "تماس و پیگیری طبق برنامه هفتگی", text: MOHAMMAD_POLICY }
      : index === 4
        ? {
            title: "بستن روز و مرور هفته",
            text: "کارهای سررسیددار، حداقل تماس روزهای الزامی و مجموع تماس‌های هفته را مرور کن. برای هر فرصت باز، مالک و اقدام بعدی با تاریخ و ساعت معتبر مشخص کن.",
          }
        : item,
  );
}
function personMetrics(person) {
  return source.metricData.map((m) =>
    person.id === "mohammad" && m.id === "calls"
      ? {
          ...m,
          desc: "رعایت حداقل ۴۵ تماس در روزهای کامل کاریِ غیر از شنبه، سه‌شنبه و پنج‌شنبه. روزهای پیگیری در مخرج این شاخص روزانه قرار نمی‌گیرند.",
          formula:
            "روزهای تماس الزامی با حداقل ۴۵ تماس ÷ تمام روزهای کامل تماس الزامی × ۱۰۰",
          target:
            "۱۰۰٪ روزهای تماس الزامی؛ هدف برنامه‌ریزی هفتگی حدود ۲۷۰ تماس جداگانه مرور شود.",
          extra:
            "تعطیلی و مرخصی کامل خارج از مخرج و روز کوتاه مصوب جدا گزارش می‌شود. تماس اضافه در روز پیگیری، کسری یک روز تماس الزامی را حذف نمی‌کند. هدف هفتگی وزن جداگانه‌ای به کارت اضافه نمی‌کند.",
        }
      : m,
  );
}
function targetSummary(person) {
  return person.kind === "support"
    ? "۱۰ سرنخ جدید در روز؛ بدون حداقل تماس جداگانه"
    : person.id === "mohammad"
      ? "حدود ۲۷۰ تماس هفتگی؛ ۴۵ تماس در روزهای کاری غیرپیگیری"
      : `حداقل ${fa(person.target)} تماس در روز کامل کاری`;
}
const fixedRules = [
  "تعریف تماس قابل‌شمارش و سقف تکرار",
  "مسیر فروش و چهار شرط سفارش معتبر",
  "اولویت موعد مشتری و حفظ موعد اولیه",
  "ثبت واقعی در CRM و تفکیک مالک از اقدام‌کننده",
  "بازدید و پوشش جانشینی طبق برنامه مصوب",
  "تعریف و فرمول KPI کارشناسان",
];
const commonBoundaries = [
  {
    title: "قیمت و تعهد",
    text: "قیمت معتبر، مهلت اعتبار، حداقل سفارش و امکان تأمین بررسی شوند. تخفیف، نمونه رایگان و وعده تأمین به تأیید مرجع مجاز نیاز دارند.",
  },
  {
    title: "سفارش و مالی",
    text: "پذیرش مشتری و تأیید داخلی باید برای همان نسخه سفارش باشند. عکس رسید، تأیید مالی نیست؛ کارشناس مجوز مالی صادر نمی‌کند.",
  },
  {
    title: "ارجاع خطر تأخیر",
    text: "خطر تأخیر ظرف یک ساعت کاری به حمید فاطمی و مسئول واحد مربوط ارجاع شود. پیش از عبور از وعده، مشتری باخبر شود.",
  },
  {
    title: "حفظ سابقه",
    text: "موعد اولیه و سوابق تغییر حفظ شوند. در جانشینی، مالک پرونده ثابت می‌ماند و فعالیت به نام اقدام‌کننده واقعی ثبت می‌شود.",
  },
];
const commonChecks = [
  "موعدهای باز و پیگیری‌های بحرانی را مرور کردم.",
  "نتیجه تماس‌ها و اقدام بعدی را در CRM کامل کردم.",
  "وضعیت پرداخت، ارسال و دریافت‌های موعددار را روشن کردم.",
  "برای فرصت‌های باز، مالک و موعد معتبر تعیین کردم.",
];
const glossary = [
  [
    "SOP",
    "دستورالعمل روشن درباره اینکه هر کار را چه کسی، چه زمانی و با چه خروجی انجام می‌دهد.",
  ],
  ["KPI", "شاخصی با تعریف و فرمول مشخص برای سنجش اجرا و نتیجه."],
  ["لید", "مخاطب بالقوه‌ای که هنوز اولین سفارش معتبرش را ثبت نکرده است."],
  [
    "فرصت واجد شرایط",
    "نیاز مرتبط، زمان خرید روشن، مسیر تصمیم‌گیری شناخته‌شده و شرایط پرداخت و تأمین سازگار دارد.",
  ],
  ["CRM", "سامانه ثبت مشتری، مذاکره، اقدام بعدی و سفارش؛ مرجع گزارش رسمی."],
  [
    "مالک و اقدام‌کننده",
    "مالک مسئول اصلی پرونده است؛ اقدام‌کننده کسی است که واقعاً فعالیت را انجام داده است.",
  ],
  [
    "موعد اولیه",
    "اولین تاریخ و ساعت ثبت‌شده برای تعهد که در تغییرهای بعدی پاک نمی‌شود.",
  ],
  [
    "سفارش معتبر خالص",
    "سفارش یکتای معتبر پس از کسر لغوهای مربوط تا زمان بسته‌شدن گزارش.",
  ],
];
function validateState(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw Error("ساختار پشتیبان معتبر نیست.");
  const out = { ...EMPTY, profiles: {}, days: {}, observations: [] };
  if (PEOPLE.some((p) => p.id === raw.selected)) out.selected = raw.selected;
  for (const p of PEOPLE) {
    const obj = raw.profiles?.[p.id];
    if (!obj || typeof obj !== "object") continue;
    out.profiles[p.id] = {};
    for (const [key] of FIELDS.concat(SUPPORT_FIELDS, [
      ["duration"],
      ["handover"],
    ]))
      if (typeof obj[key] === "string")
        out.profiles[p.id][key] = obj[key].slice(0, 1000);
  }
  if (raw.days && typeof raw.days === "object")
    for (const [key, value] of Object.entries(raw.days).slice(0, 4000)) {
      if (
        !/^(template|mohammad|zahra|amirhossein|elham|hamid|saeed)_\d{4}-\d{2}-\d{2}$/.test(
          key,
        ) ||
        !value ||
        typeof value !== "object"
      )
        continue;
      out.days[key] = {
        calls: typeof value.calls === "string" ? value.calls.slice(0, 6) : "",
        leads: typeof value.leads === "string" ? value.leads.slice(0, 6) : "",
        workStatus: ["full", "off", "short"].includes(value.workStatus)
          ? value.workStatus
          : "",
        followupMode: ["phone", "field", "mixed"].includes(value.followupMode)
          ? value.followupMode
          : "",
        followupNotes:
          typeof value.followupNotes === "string"
            ? value.followupNotes.slice(0, 2000)
            : "",
        visits:
          typeof value.visits === "string" ? value.visits.slice(0, 6) : "",
        reportSavedAt:
          typeof value.reportSavedAt === "string"
            ? value.reportSavedAt.slice(0, 40)
            : "",
        report: Object.fromEntries(
          [
            "orders",
            "production",
            "receivables",
            "shipments",
            "leads",
            "cash",
            "risks",
            "next",
          ].map((k) => [
            k,
            typeof value.report?.[k] === "string"
              ? value.report[k].slice(0, 2000)
              : "",
          ]),
        ),
        checks: Array.isArray(value.checks)
          ? value.checks.slice(0, 8).map((x) => x === true)
          : [],
      };
    }
  if (Array.isArray(raw.observations))
    out.observations = raw.observations
      .slice(0, 500)
      .filter((x) => x && typeof x === "object")
      .map((x, i) =>
        Object.fromEntries(
          [
            "id",
            "date",
            "stage",
            "record",
            "fact",
            "impact",
            "action",
            "idea",
            "decision",
            "owner",
            "due",
            "status",
          ].map((k) => [
            k,
            typeof x[k] === "string"
              ? x[k].slice(0, k === "fact" || k === "idea" ? 2000 : 1000)
              : k === "id"
                ? String(i)
                : "",
          ]),
        ),
      );
  return out;
}
function load() {
  try {
    const s = localStorage.getItem(STORAGE);
    return s ? validateState(JSON.parse(s)) : structuredClone(EMPTY);
  } catch {
    return structuredClone(EMPTY);
  }
}
function Icon({ name = "BookOpen", className = "" }) {
  return (
    <svg className={"icon " + className} aria-hidden="true">
      <use href={"#i-" + name} />
    </svg>
  );
}
function List({ items }) {
  return (
    <ul className="prose-list">
      {items.map((t, i) => (
        <li key={i}>
          <span className="mt-1 text-[#287858]">
            <Icon name="Check" />
          </span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
function Heading({ kicker, title, desc }) {
  return (
    <div className="mb-6">
      <div className="mb-1 text-sm font-semibold text-muted">{kicker}</div>
      <h2 className="title">{title}</h2>
      {desc && <p className="mt-2 max-w-4xl text-muted">{desc}</p>}
    </div>
  );
}
function Cards({ items }) {
  return (
    <div className="space-y-4">
      {items.map((x, i) => (
        <div key={i} className="rule-row">
          <h3 className="mb-2 flex items-center gap-3 text-lg font-semibold">
            <span className="step-number">{fa(i + 1)}</span>
            {x.title}
          </h3>
          <p className="text-[#35564d]">{x.text}</p>
        </div>
      ))}
    </div>
  );
}
function Accordion({ title, children }) {
  return (
    <details className="rounded-xl border border-line bg-white px-5 py-4">
      <summary className="font-semibold">{title}</summary>
      <div className="mt-3 space-y-3 text-[#35564d]">{children}</div>
    </details>
  );
}
function Checklist({ labels, values, setValues }) {
  return (
    <div className="space-y-2">
      {labels.map((x, i) => (
        <label
          key={i}
          className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#f5f8f0] p-3"
        >
          <input
            type="checkbox"
            checked={!!values[i]}
            onChange={(e) =>
              setValues(
                labels.map((_, j) =>
                  j === i ? e.target.checked : !!values[j],
                ),
              )
            }
            className="mt-1.5"
          />
          <span>{x}</span>
        </label>
      ))}
    </div>
  );
}
function download(name, text, type = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
function masterHTML() {
  return JSON.parse(document.getElementById("master-source").textContent);
}
export default function App() {
  const [state, setState] = useState(load),
    [page, setPage] = useState("overview"),
    [menu, setMenu] = useState(false),
    [gloss, setGloss] = useState(false),
    [day, setDay] = useState(today),
    [storageOK, setStorageOK] = useState(true),
    [message, setMessage] = useState("");
  const [masterOpen, setMasterOpen] = useState(false);
  const dialogRef = useRef(null),
    masterRef = useRef(null),
    fileRef = useRef(null),
    headingRef = useRef(null);
  const person = PEOPLE.find((x) => x.id === state.selected) || PEOPLE[1],
    isRep = person.kind === "rep",
    isTemplate = person.id === "template",
    content = roles[person.kind];
  const profile = state.profiles[person.id] || {},
    dayKey = person.id + "_" + day,
    dayData = state.days[dayKey] || { calls: "", checks: [] };
  const setDayData = (patch) =>
    setState((s) => ({
      ...s,
      days: {
        ...s.days,
        [dayKey]: {
          ...(s.days[dayKey] || { calls: "", checks: [] }),
          ...patch,
        },
      },
    }));
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(state));
      setStorageOK(true);
    } catch {
      setStorageOK(false);
    }
  }, [state]);
  useEffect(() => {
    const d = dialogRef.current;
    if (gloss && !d.open) d.showModal();
    if (!gloss && d.open) d.close();
  }, [gloss]);
  useEffect(() => {
    const d = masterRef.current;
    if (masterOpen && !d.open) d.showModal();
    if (!masterOpen && d.open) d.close();
  }, [masterOpen]);
  useEffect(() => {
    document.title = `${person.name} | SOP فروش شاه‌نخ`;
  }, [person.id]);
  const nav =
    person.kind === "support"
      ? SUPPORT_NAV
      : [
          ["overview", "SOP من", "House"],
          ["daily", "کار روزانه", "PhoneCall"],
          ...(isRep
            ? []
            : [
                [
                  person.kind,
                  person.kind === "manager" ? "مدیریت تیم" : "دوره تجربه فروش",
                  "Users",
                ],
              ]),
          ["journey", "مسیر مشتری", "Route"],
          ["followup", "زمان پیگیری", "Clock3"],
          ["crm", "ثبت در CRM", "NotebookPen"],
          ["field", "بازدید حضوری", "MapPinned"],
          [
            "metrics",
            isRep ? "پنج شاخص عملکرد" : "شاخص‌های این نقش",
            "ChartNoAxesCombined",
          ],
          ...(isRep ? [["calculator", "محاسبه‌گر KPI", "Calculator"]] : []),
          ...(person.kind === "ceo"
            ? [["observations", "دفتر مشاهدات", "FilePenLine"]]
            : []),
          ["profile", "اطلاعات فردی", "UserRound"],
          ["reference", "قواعد ثابت و مرجع", "BookOpen"],
        ];
  const go = (id) => {
    setPage(id);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    setTimeout(() => headingRef.current?.focus(), 0);
  };
  function choose(id) {
    setState((s) => ({ ...s, selected: id }));
    setPage("overview");
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function importFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 3000000) throw Error("اندازه فایل بیش از حد مجاز است.");
      const incoming = JSON.parse(await file.text());
      if (incoming.format !== "shahnakh-personal-sop-v1")
        throw Error("این فایل، پشتیبان SOP شاه‌نخ نیست.");
      const clean = validateState(incoming.data);
      if (
        !window.confirm(
          "پشتیبان جای اطلاعات محلی فعلی را می‌گیرد. ادامه می‌دهید؟",
        )
      )
        return;
      setState(clean);
      setMessage("پشتیبان بازیابی شد.");
      setPage("overview");
    } catch (err) {
      setMessage(err.message || "فایل قابل بازیابی نیست.");
    }
    e.target.value = "";
  }
  return (
    <>
      <div className="app-shell">
        <a href="#main" className="sr-only focus:not-sr-only">
          رفتن به محتوای SOP
        </a>
        <aside className="fixed inset-y-0 right-0 z-40 hidden w-[252px] flex-col border-l border-line bg-[#fcfdf9] p-5 lg:flex">
          <Brand />
          <p className="mb-3 mt-7 px-2 text-sm text-muted">راهنمای شخصی شما</p>
          <nav className="space-y-1 overflow-y-auto" aria-label="بخش‌های SOP">
            {nav.map(([id, label, icon]) => (
              <button
                key={id}
                onClick={() => go(id)}
                aria-current={page === id ? "page" : undefined}
                className={
                  "flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2 text-right text-sm " +
                  (page === id
                    ? "bg-forest font-semibold text-white"
                    : "hover:bg-[#edf3e7]")
                }
              >
                <Icon name={icon} />
                {label}
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-6 text-sm text-muted">
            <p>نسخه فردی ۱٫۱</p>
            <p>مرجع گزارش رسمی: CRM</p>
          </div>
        </aside>
        <div className="min-h-screen lg:mr-[252px]">
          <header className="sticky top-0 z-30 border-b border-line bg-[#f5f6f2f5] backdrop-blur">
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 py-3 sm:px-7 xl:px-10">
              <button
                className="btn px-3 lg:hidden"
                aria-label="فهرست بخش‌ها"
                aria-expanded={menu}
                aria-controls="mobile-nav"
                onClick={() => setMenu(!menu)}
              >
                <Icon name={menu ? "X" : "Menu"} />
              </button>
              <span className="flex-1 font-bold sm:hidden">شاه‌نخ</span>
              <div className="order-3 min-w-0 basis-full sm:order-none sm:flex-1 sm:basis-auto">
                <label
                  htmlFor="person"
                  className="mb-1 block text-sm text-muted"
                >
                  انتخاب نام و دستورالعمل
                </label>
                <select
                  id="person"
                  className="field min-w-0 bg-white font-semibold sm:max-w-[350px]"
                  value={person.id}
                  onChange={(e) => choose(e.target.value)}
                >
                  {PEOPLE.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn px-3"
                  onClick={() => setGloss(true)}
                  aria-label="باز کردن واژه‌نامه"
                >
                  <Icon name="BookOpen" />
                  <span className="hidden xl:inline">واژه‌نامه</span>
                </button>
                <button
                  className="btn px-3"
                  onClick={() => window.print()}
                  aria-label="چاپ کل SOP فرد انتخاب‌شده"
                >
                  <Icon name="FileText" />
                  <span className="hidden sm:inline">چاپ SOP</span>
                </button>
              </div>
            </div>
            {menu && (
              <nav
                id="mobile-nav"
                className="grid max-h-[65vh] grid-cols-2 gap-2 overflow-auto border-t border-line bg-white p-4 lg:hidden"
                aria-label="بخش‌های SOP موبایل"
              >
                {nav.map(([id, label, icon]) => (
                  <button
                    key={id}
                    onClick={() => go(id)}
                    aria-current={page === id ? "page" : undefined}
                    className={
                      "tab flex items-center gap-2 " +
                      (page === id ? "tab-active" : "")
                    }
                  >
                    <Icon name={icon} />
                    {label}
                  </button>
                ))}
              </nav>
            )}
          </header>
          <main
            id="main"
            className="mx-auto max-w-[1440px] px-4 py-6 outline-none sm:px-7 sm:py-8 xl:px-10"
            tabIndex="-1"
            ref={headingRef}
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted">
                <span>فروش شاه‌نخ</span>
                <span>/</span>
                <strong className="font-semibold text-ink">
                  {nav.find((n) => n[0] === page)?.[1]}
                </strong>
              </div>
              <span className="badge">{person.role}</span>
            </div>
            {!storageOK && (
              <p
                role="status"
                className="mb-4 rounded-xl bg-amber-50 p-3 text-sm"
              >
                مرورگر ذخیره محلی را نپذیرفت. پیش از بستن فایل، از بخش اطلاعات
                فردی پشتیبان بگیرید.
              </p>
            )}
            <div key={person.id + "-" + page} className="page-enter">
              {person.kind === "support" && (
                <SupportSOP
                  {...{
                    page,
                    person,
                    profile,
                    day,
                    setDay,
                    dayData,
                    setDayData,
                    go,
                  }}
                />
              )}
              {page === "overview" && person.kind !== "support" && (
                <Overview
                  days={state.days}
                  {...{
                    person,
                    profile,
                    isTemplate,
                    content,
                    day,
                    setDay,
                    dayData,
                    setDayData,
                    go,
                  }}
                />
              )}
              {page === "daily" && person.kind !== "support" && (
                <Daily person={person} />
              )}
              {(page === "manager" || page === "ceo") && (
                <RoleSection {...{ person, content, go }} />
              )}
              {page === "journey" && <Journey />}
              {page === "followup" && <Followup person={person} />}
              {page === "crm" && <CRM />}
              {page === "field" && <Field person={person} />}
              {page === "metrics" && person.kind !== "support" && (
                <Metrics person={person} go={go} />
              )}
              {page === "calculator" && <Calculator person={person} />}
              {page === "observations" && (
                <Observations
                  value={state.observations}
                  setValue={(v) => setState((s) => ({ ...s, observations: v }))}
                />
              )}
              {page === "profile" && (
                <Profile
                  {...{ person, profile, storageOK }}
                  onChange={(key, value) =>
                    setState((s) => ({
                      ...s,
                      profiles: {
                        ...s.profiles,
                        [person.id]: {
                          ...(s.profiles[person.id] || {}),
                          [key]: value,
                        },
                      },
                    }))
                  }
                  onExport={() => {
                    download(
                      "ShahNakh-SOP-Backup-" + today() + ".json",
                      JSON.stringify(
                        {
                          format: STORAGE,
                          exportedAt: new Date().toISOString(),
                          data: state,
                        },
                        null,
                        2,
                      ),
                    );
                    setMessage("فایل پشتیبان آماده شد.");
                  }}
                  onImport={() => fileRef.current.click()}
                />
              )}
              {page === "reference" && (
                <Reference person={person} onOpen={() => setMasterOpen(true)} />
              )}
            </div>
            <footer className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5 text-sm">
              <button
                className="btn"
                disabled={page === nav[0][0]}
                onClick={() =>
                  go(
                    nav[
                      Math.max(0, nav.findIndex((n) => n[0] === page) - 1)
                    ][0],
                  )
                }
              >
                <Icon name="ArrowRight" />
                بخش قبل
              </button>
              <span className="hidden text-muted sm:block">
                {fa(nav.findIndex((n) => n[0] === page) + 1)} از{" "}
                {fa(nav.length)}
              </span>
              <button
                className="btn btn-primary"
                onClick={() =>
                  go(
                    nav[
                      (nav.findIndex((n) => n[0] === page) + 1) % nav.length
                    ][0],
                  )
                }
              >
                {page === nav.at(-1)[0] ? "بازگشت به شروع" : "بخش بعد"}
                <Icon name="ArrowLeft" />
              </button>
            </footer>
          </main>
        </div>
        <input
          type="file"
          accept=".json,application/json"
          ref={fileRef}
          hidden
          onChange={importFile}
        />
        {message && (
          <div
            className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-xl bg-forest p-4 text-sm text-white shadow-lg sm:right-auto"
            role="status"
          >
            {message}
            <button onClick={() => setMessage("")} aria-label="بستن پیام">
              <Icon name="X" />
            </button>
          </div>
        )}
        <dialog
          ref={dialogRef}
          onClose={() => setGloss(false)}
          onCancel={() => setGloss(false)}
          className="max-h-[85vh] w-[min(720px,94vw)] rounded-2xl bg-canvas p-5 text-ink backdrop:bg-[#102d27aa] sm:p-8"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">واژه‌ها به زبان ساده</h2>
            <button
              className="btn px-3"
              onClick={() => setGloss(false)}
              aria-label="بستن واژه‌نامه"
            >
              <Icon name="X" />
            </button>
          </div>
          <dl>
            {glossary.map(([a, b]) => (
              <div className="rule-row" key={a}>
                <dt className="font-bold">{a}</dt>
                <dd className="mt-2 text-muted">{b}</dd>
              </div>
            ))}
          </dl>
        </dialog>
        <dialog
          ref={masterRef}
          onClose={() => setMasterOpen(false)}
          onCancel={() => setMasterOpen(false)}
          className="h-[92vh] max-h-none w-[96vw] max-w-none rounded-2xl bg-canvas p-3 text-ink backdrop:bg-[#102d27aa]"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">
              نسخه اصلی SOP جامع با مبنای ۴۵ تماس کارشناسان
            </span>
            <button
              className="btn px-3"
              onClick={() => setMasterOpen(false)}
              aria-label="بستن فایل مرجع"
            >
              <Icon name="X" />
            </button>
          </div>
          {masterOpen && (
            <iframe
              title="فایل اصلی SOP جامع شاه نخ"
              sandbox="allow-scripts"
              srcDoc={masterHTML()}
              className="h-[calc(100%-60px)] w-full rounded-xl border border-line"
            />
          )}
        </dialog>
      </div>
      <PrintDocument
        person={person}
        profile={profile}
        observations={state.observations}
        day={day}
        dayData={dayData}
      />
    </>
  );
}
function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest text-leaf">
        <Icon name="Layers3" />
      </div>
      <div>
        <div className="text-2xl font-extrabold">شاه‌نخ</div>
        <div className="text-sm text-muted">دستورالعمل فردی فروش</div>
      </div>
    </div>
  );
}
function Overview({
  person,
  profile,
  isTemplate,
  content,
  day,
  setDay,
  dayData,
  setDayData,
  days,
  go,
}) {
  const isRep = person.kind === "rep";
  const isMohammad = person.id === "mohammad";
  const policy = isMohammad
    ? dayPolicy(day, dayData)
    : { target: person.target };
  const labels = commonChecks.concat(
    person.kind === "manager"
      ? ["پوشش تیم، تأییدهای باز و رفع مانع‌ها را مرور کردم."]
      : person.kind === "ceo"
        ? ["مشاهده‌های مستند و مانع‌های امروز را ثبت کردم."]
        : [],
  );
  const count = Number(dayData.calls),
    hasCalls =
      dayData.calls !== "" &&
      Number.isInteger(count) &&
      count >= 0 &&
      count <= 100000,
    met = hasCalls && policy.target !== null && count >= policy.target,
    done = labels.filter((_, i) => dayData.checks[i]).length;
  return (
    <div className="section-stack">
      <section className="relative overflow-hidden rounded-[24px] bg-forest p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm text-[#c9debf]">
              {isTemplate
                ? "الگوی پیوست SOP جامع"
                : person.kind === "ceo"
                  ? "تجربه عملیاتی فروش مدیرعامل"
                  : "پیوست اجرایی SOP جامع فروش"}
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">
              {isTemplate ? "قالب استاندارد کارشناس فروش" : person.name}
            </h1>
            <p className="mt-3 text-[#d6e4da]">
              {isRep
                ? "نیازسنجی، ارتباط با مشتری، ثبت سفارش و پیگیری تعهدات تا دریافت بار."
                : person.kind === "manager"
                  ? "هماهنگی تیم، کنترل اجرای فرایند و رفع موانع، در کنار تماس‌های شخصی."
                  : "اجرای مسیر واقعی فروش و ثبت شواهد برای بهبود فرایند."}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#c9debf]">
              <span>
                {person.kind === "manager"
                  ? "گزارش به سعید تقی‌زاده"
                  : person.kind === "ceo"
                    ? "هماهنگی عملیاتی با حمید فاطمی"
                    : "گزارش به حمید فاطمی"}
              </span>
              <span dir="ltr">{person.code}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-[#ffffff26] bg-[#ffffff09] px-6 py-4">
            <strong
              className="text-6xl font-bold text-leaf"
              data-testid="role-target"
            >
              {fa(isMohammad ? 270 : person.target)}
            </strong>
            <span className="text-sm">
              {isMohammad ? "هدف حدودی تماس" : "حداقل تماس خروجی"}
              <br />
              {isMohammad ? "در هفته" : "در روز کامل کاری"}
            </span>
          </div>
        </div>
      </section>
      {isTemplate && (
        <div className="notice">
          برای ایجاد SOP کارشناس تازه، همین قالب را تکثیر و فقط بخش اطلاعات فردی
          را تکمیل کنید. قواعد مشترک و KPI از SOP جامع گرفته می‌شوند.
        </div>
      )}
      {isMohammad && <MohammadPolicy compact />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          onClick={() => go("journey")}
          className="panel flex items-center gap-4 text-right"
        >
          <Icon name="Route" />
          <div>
            <strong className="block">۶ مرحله فروش</strong>
            <span className="caption">از شناخت نیاز تا دریافت بار</span>
          </div>
        </button>
        <button
          onClick={() => go("metrics")}
          className="panel flex items-center gap-4 text-right"
        >
          <Icon name="ChartNoAxesCombined" />
          <div>
            <strong className="block">
              {isRep ? "۱۰۰ امتیاز در ۵ شاخص" : "پیگیری هدف ۱۲ تماس"}
            </strong>
            <span className="caption">
              {isRep ? "با تعریف و فرمول مرجع" : "گزارش اجرایی جداگانه"}
            </span>
          </div>
        </button>
        <button
          onClick={() => go("profile")}
          className="panel flex items-center gap-4 text-right"
        >
          <Icon name="UserRound" />
          <div>
            <strong className="block">اطلاعات این دوره</strong>
            <span className="caption">
              {profile.period || "در انتظار تعیین دوره"}
            </span>
          </div>
        </button>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <section className="panel">
          <div className="section-title">
            <h2>چک‌لیست اجرای امروز</h2>
            <span className="badge">
              {fa(done)} از {fa(labels.length)}
            </span>
          </div>
          <label className="mb-4 flex flex-wrap items-center gap-3 text-sm">
            <span>تاریخ مرور</span>
            <input
              aria-label="تاریخ چک‌لیست"
              type="date"
              value={day}
              className="field w-auto"
              dir="ltr"
              onChange={(e) => {
                if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value))
                  setDay(e.target.value);
              }}
            />
            <span className="text-muted">{dateLabel(day)}</span>
          </label>
          {isMohammad && (
            <div className="mb-5 space-y-4 rounded-xl bg-[#f4f7ef] p-4">
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
                    onChange={(e) =>
                      setDayData({ followupMode: e.target.value })
                    }
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
                  type="number"
                  min="0"
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
                  onChange={(e) =>
                    setDayData({ followupNotes: e.target.value })
                  }
                />
              </label>
            </div>
          )}
          <Checklist
            labels={labels}
            values={dayData.checks}
            setValues={(checks) => setDayData({ checks })}
          />
          <p className="local-note mt-4">
            علامت‌ها برای همین نام و تاریخ در این مرورگر نگهداری می‌شوند. ثبت
            رسمی تماس و تأییدها در CRM انجام می‌شود.
          </p>
        </section>
        <div className="space-y-5">
          <section className="panel">
            <h2 className="section-title">
              {isMohammad ? "ثبت تماس‌های این روز" : "مرور حداقل تماس امروز"}{" "}
              <Icon name="PhoneCall" />
            </h2>
            <label htmlFor="daily-count" className="label">
              تماس خروجی قابل‌شمارش ثبت‌شده در CRM
            </label>
            <input
              id="daily-count"
              type="number"
              min="0"
              max="100000"
              step="1"
              inputMode="numeric"
              placeholder="تعداد را وارد کنید"
              value={dayData.calls}
              onChange={(e) => setDayData({ calls: e.target.value })}
              className="field"
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted">
                {policy.target === null
                  ? policy.label
                  : `حداقل این روز: ${fa(policy.target)}`}
              </span>
              <strong className={met ? "text-[#287858]" : "text-muted"}>
                {hasCalls
                  ? policy.target === null
                    ? `${fa(count)} تماس`
                    : `${fa(count)} از ${fa(policy.target)}`
                  : "هنوز وارد نشده"}
              </strong>
            </div>
            {policy.target !== null && (
              <div className="mt-3 h-2 overflow-hidden rounded bg-[#e9efe3]">
                <div
                  className="h-full rounded bg-[#287858] transition-all"
                  style={{
                    width:
                      (hasCalls
                        ? Math.min(count / policy.target, 1) * 100
                        : 0) + "%",
                  }}
                />
              </div>
            )}
            <p className="mt-3 text-sm" role="status">
              {!hasCalls
                ? dayData.calls === ""
                  ? "این عدد به‌صورت دستی از CRM وارد می‌شود."
                  : "تعداد تماس باید عدد صحیح نامنفی باشد."
                : policy.target === null
                  ? policy.message
                  : met
                    ? "حداقل تماس این روز تکمیل شده است."
                    : `${fa(Math.max(policy.target - count, 0))} تماس تا حداقل روز باقی مانده است.`}
            </p>
            <button
              onClick={() => go("daily")}
              className="mt-4 text-sm font-semibold text-[#287858]"
            >
              تعریف تماس و قواعد شمارش ←
            </button>
          </section>
          <section className="panel">
            <h2 className="section-title">اولویت ثابت روز</h2>
            <p>
              تعهدهای سررسیددار و پیگیری‌های بحرانی مقدم‌اند. تماس اضافه، تأخیر
              در تعهد مشتری یا نقص کنترل‌های سفارش را جبران نمی‌کند.
            </p>
            <button
              onClick={() =>
                go(
                  person.kind === "manager"
                    ? "manager"
                    : person.kind === "ceo"
                      ? "ceo"
                      : "followup",
                )
              }
              className="btn mt-4"
            >
              {isRep ? "زمان پیگیری را ببین" : "مسئولیت‌های این نقش"}
              <Icon name="ArrowLeft" />
            </button>
          </section>
        </div>
      </div>
      {isMohammad && <WeeklyPlan {...{ day, days, setDay }} />}
      <section className="panel">
        <h2 className="section-title">ساختار سند فردی</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 font-bold text-[#287858]">قواعد ثابت</h3>
            <List items={fixedRules.slice(0, isRep ? 6 : 4)} />
          </div>
          <div>
            <h3 className="mb-3 font-bold text-[#287858]">
              بخش قابل تکمیل برای فرد
            </h3>
            <List
              items={[
                "سبد مشتری، محصول و اولویت دوره",
                "هدف سفارش و مرجع تصویب آن",
                "روز بازدید، جانشین و حدود اختیار",
                "هدف توسعه فردی و تاریخ تأیید",
              ]}
            />
            <button onClick={() => go("profile")} className="btn mt-4">
              تکمیل اطلاعات فردی
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
function Daily({ person }) {
  const isRep = person.kind === "rep";
  const isMohammad = person.id === "mohammad";
  const [follow, setFollow] = useState(20),
    [call, setCall] = useState("out");
  const newCount = Math.max(0, Math.min(15, 45 - follow)),
    revive = Math.max(0, 45 - follow - newCount),
    total = follow + newCount + revive;
  const c = source.callCases.find((x) => x[0] === call);
  return (
    <>
      <Heading
        kicker="اجرای روزانه"
        title="تماس‌ها با اولویت مشتری"
        desc={
          isMohammad
            ? MOHAMMAD_POLICY
            : `حداقل ${fa(person.target)} تماس خروجی قابل‌شمارش در هر روز کامل کاری برای ${person.name}.`
        }
      />
      <div className="section-stack">
        <div className="grid gap-5 xl:grid-cols-2">
          <section className="panel">
            {isRep ? (
              <>
                <h3 className="section-title">
                  شبیه‌ساز ترکیب تماس <span className="badge">آموزشی</span>
                </h3>
                <div className="flex items-center gap-4">
                  <strong className="text-6xl font-bold text-[#287858]">
                    {fa(total)}
                  </strong>
                  <div>
                    تماس برنامه‌ریزی‌شده
                    <p className="caption">
                      {isMohammad
                        ? "الگوی روزهای تماس الزامی؛ در روز پیگیری ترکیب انعطاف‌پذیر است"
                        : "حداقل روز کامل ۴۵ تماس"}
                    </p>
                  </div>
                </div>
                <div className="my-5 flex h-12 overflow-hidden rounded-xl text-white">
                  {[
                    [newCount, "#287858"],
                    [follow, "#257e89"],
                    [revive, "#b76c31"],
                  ].map(([n, color], i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center transition-all"
                      style={{
                        width: (n / total) * 100 + "%",
                        background: color,
                      }}
                    >
                      {n > 0 ? fa(n) : ""}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {[
                    ["جدید", newCount],
                    ["پیگیری", follow],
                    ["احیا", revive],
                  ].map(([l, n]) => (
                    <div key={l}>
                      {l}
                      <strong className="block text-2xl">{fa(n)}</strong>
                    </div>
                  ))}
                </div>
                <label htmlFor="mix" className="label mt-5">
                  پیگیری موردنیاز: {fa(follow)} تماس
                </label>
                <input
                  id="mix"
                  type="range"
                  min="20"
                  max="60"
                  step="1"
                  value={follow}
                  onChange={(e) => setFollow(+e.target.value)}
                  className="w-full"
                  dir="ltr"
                />
                <p className="caption mt-3">
                  {follow <= 20
                    ? "ترکیب پایه ۱۵ جدید، ۲۰ پیگیری و ۱۰ احیا."
                    : follow <= 30
                      ? "افزایش پیگیری از سهم احیا کم شده است؛ دلیل تغییر ترکیب ثبت شود."
                      : follow <= 45
                        ? "احیا به صفر رسیده و بخشی از سهم جدید به پیگیری منتقل شده است."
                        : "۴۵ حداقل است. برای این حجم از پیگیری، ظرفیت و کمک جانشین با مدیر فروش بررسی شود؛ موعدها خودکار عقب نروند."}
                </p>
              </>
            ) : (
              <>
                <h3 className="section-title">برنامه ۱۲ تماس شخصی</h3>
                <p>
                  این تماس‌ها را خودِ {person.name} انجام می‌دهد و فعالیت به نام
                  او در CRM ثبت می‌شود. تماس‌های کارشناسان به حساب تماس شخصی این
                  نقش اضافه نمی‌شوند.
                </p>
                <div className="notice mt-4">
                  پیگیری سررسیددار مقدم است. سهم تماس جدید، پیگیری و احیا برای
                  این نقش عدد ثابتی ندارد و متناسب با پرونده‌های تخصیص‌یافته
                  تعیین می‌شود.
                </div>
                <p className="caption mt-4">
                  تعریف تماس و سقف تکرار از SOP جامع است؛ عدد ۱۲، اصلاح اختصاصی
                  این نقش در نسخه فردی است.
                </p>
              </>
            )}
          </section>
          <section className="panel">
            <h3 className="section-title">کدام فعالیت یک تماس است؟</h3>
            <div className="flex flex-wrap gap-2">
              {source.callCases.map((x) => (
                <button
                  key={x[0]}
                  className={"tab " + (call === x[0] ? "tab-active" : "")}
                  aria-pressed={call === x[0]}
                  onClick={() => setCall(x[0])}
                >
                  {x[1]}
                </button>
              ))}
            </div>
            <div
              className={
                "mt-5 rounded-xl p-5 " +
                (c[2] ? "bg-[#eaf3e2]" : "bg-[#fff1e1]")
              }
              aria-live="polite"
            >
              <h4 className="font-bold">
                {c[3].replace(
                  "عدد ۴۵",
                  isMohammad
                    ? "مجموع تماس روزانه یا هفتگی"
                    : "عدد " + fa(person.target),
                )}
              </h4>
              <p className="mt-2">{c[4].replaceAll("۴۵", fa(person.target))}</p>
            </div>
            <p className="caption mt-4">
              تعداد تلاش خروجی با تعداد مکالمه دوطرفه متفاوت است. تا پیش از
              اتصال تلفنی، مبنا «تماس خروجی ثبت‌شده در CRM» است.
            </p>
          </section>
        </div>
        <section className="panel">
          <h3 className="section-title">ترتیب اجرای روز</h3>
          <Cards items={dailyPlan(person)} />
        </section>
        <Accordion title="روز کامل و استثناهای کاری">
          <p>
            روز کامل یعنی تمام شیفت فعال طبق برنامه مصوب. تعطیلی و مرخصی کامل از
            روزهای مشمول خارج‌اند؛ روز کوتاه رسمی باید از پیش تعریف و جدا گزارش
            شود.
          </p>
          <p>
            {isMohammad
              ? "شنبه، سه‌شنبه و پنج‌شنبه روز پیگیری با امکان تماس یا حضور میدانی‌اند و حداقل ثابت ۴۵ ندارند. در سایر روزهای کامل کاری، ۴۵ تماس الزامی است. هدف حدود ۲۷۰ تماس هفتگی با مدیریت برنامه همه روزها پیگیری می‌شود؛ کسری روز تماس الزامی جداگانه ثبت می‌شود."
              : "بازدید حضوری حداقل تماس روز کامل را کاهش نمی‌دهد. تماس اضافه فردا کسری امروز را حذف نمی‌کند."}{" "}
            برنامه ساعت کاری و استثناها در اطلاعات فردی ثبت شود.
          </p>
        </Accordion>
        <Accordion title="تماس دوم و دسته‌بندی تماس">
          <p>
            تلاش دوم همان روز فقط با درخواست مشتری، تعهد سفارش یا بی‌پاسخی در
            ساعت متفاوت شمرده می‌شود. سقف شمارش برای هر مخاطب در روز ۲ تماس است.
            اقدام ضروری بیشتر ثبت می‌شود، اما به KPI تماس اضافه نمی‌شود.
          </p>
          <p>
            هر تماس فقط یک دسته دارد. لید قدیمی با موعد امروز، «پیگیری» است؛
            احیا به دلیل مرتبط و تازه نیاز دارد. کارهای غیرتلفنی سررسیددار نیز
            در برنامه روز جا دارند.
          </p>
        </Accordion>
      </div>
    </>
  );
}
function RoleSection({ person, content, go }) {
  const [rhythm, setRhythm] = useState("weekly");
  return (
    <>
      <Heading
        kicker="پیوست اجرایی این نقش"
        title={
          person.kind === "manager"
            ? "SOP اجرایی مدیر فروش"
            : "تجربه عملیاتی فروش مدیرعامل"
        }
        desc={content.mission}
      />
      <div className="section-stack">
        {person.kind === "ceo" && (
          <section className="panel">
            <h3 className="section-title">مراحل دوره تجربه</h3>
            <Cards items={content.immersionStages} />
            <button
              className="btn btn-primary mt-5"
              onClick={() => go("observations")}
            >
              ثبت یک مشاهده
              <Icon name="FilePenLine" />
            </button>
          </section>
        )}
        <section className="panel">
          <div className="mb-5 flex gap-2">
            <button
              className={"tab " + (rhythm === "weekly" ? "tab-active" : "")}
              onClick={() => setRhythm("weekly")}
              aria-pressed={rhythm === "weekly"}
            >
              مرور هفتگی
            </button>
            <button
              className={"tab " + (rhythm === "monthly" ? "tab-active" : "")}
              onClick={() => setRhythm("monthly")}
              aria-pressed={rhythm === "monthly"}
            >
              مرور ماهانه و پایان دوره
            </button>
          </div>
          <List items={content[rhythm]} />
        </section>
        <section className="panel">
          <h3 className="section-title">مرز اختیار و مسئولیت</h3>
          <Cards items={content.boundaries} />
        </section>
        <section className="panel">
          <h3 className="section-title">چه زمانی ارجاع بدهم؟</h3>
          <Cards
            items={content.escalation.map((x) => ({
              title: x.trigger,
              text: x.action,
            }))}
          />
        </section>
        <section className="panel">
          <h3 className="section-title">خروجی مورد انتظار</h3>
          <List items={content.success} />
        </section>
        <p className="local-note">
          این بخش، تنظیم اجرایی نقش بر پایه SOP جامع است. حدود مالی و سیاست‌های
          شرکت از مرجع مصوب در اطلاعات فردی خوانده می‌شوند.
        </p>
      </div>
    </>
  );
}
function Journey() {
  const [stage, setStage] = useState(0),
    [checks, setChecks] = useState([]);
  const s = source.stages[stage];
  return (
    <>
      <Heading
        kicker="قواعد مشترک"
        title="هر مرحله، یک خروجی روشن"
        desc="مرحله پرونده را انتخاب کن تا اقدام لازم، مدرک ثبت‌شدنی و مرز اختیار را ببینی."
      />
      <div className="section-stack">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {source.stages.map((x, i) => (
            <button
              className={
                "tab flex flex-col items-center gap-2 text-center " +
                (stage === i ? "tab-active" : "")
              }
              key={i}
              onClick={() => setStage(i)}
              aria-pressed={stage === i}
            >
              <Icon name={x.icon} />
              {x.short}
            </button>
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
          <section className="panel">
            <span className="caption">مرحله {fa(stage + 1)} از ۶</span>
            <h3 className="mb-5 mt-2 text-2xl font-bold">{s.title}</h3>
            <List items={s.tasks} />
          </section>
          <section className="dark-card">
            <Icon name={s.icon} />
            <h3 className="my-3 text-xl font-bold text-leaf">{s.out}</h3>
            <p>{s.proof}</p>
            <p className="mt-5 border-t border-[#ffffff25] pt-4 text-sm">
              {s.limit}
            </p>
          </section>
        </div>
        {stage === 2 && (
          <section className="panel">
            <h3 className="section-title">
              آمادگی سفارش <span className="badge">تمرین</span>
            </h3>
            <Checklist
              labels={source.orderLabels}
              values={checks}
              setValues={setChecks}
            />
            <p className="mt-4" role="status">
              {fa(checks.filter(Boolean).length)} از ۴ شرط کامل است. شواهد و
              تأیید واقعی باید در پرونده سفارش ثبت شوند.
            </p>
          </section>
        )}
        <section className="panel">
          <h3 className="section-title">سه برچسب مستقل در CRM</h3>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              [
                "مرحله فروش",
                "پرونده در شناخت نیاز، پیشنهاد، مذاکره یا سفارش است.",
              ],
              [
                "گرمی لید",
                "داغ یعنی امکان خرید تا ۱۴ روز با نیاز و شرایط روشن.",
              ],
              ["وضعیت پرداخت", "روش موردنظر مشتری و سازگاری با سیاست مصوب."],
            ].map(([a, b]) => (
              <div key={a}>
                <h4 className="mb-2 font-bold">{a}</h4>
                <p className="text-muted">{b}</p>
              </div>
            ))}
          </div>
          <p className="notice mt-5">
            پرداخت نقدی به‌تنهایی نشانه داغ‌بودن نیست. اولین سفارش معتبر، لید
            جدید را مشتری جدید می‌کند؛ سفارش‌های بعدی فروش دوباره‌اند.
          </p>
        </section>
      </div>
    </>
  );
}
function Followup({ person }) {
  const [choice, setChoice] = useState("inbound");
  const f = source.follows.find((x) => x[0] === choice);
  return (
    <>
      <Heading
        kicker="قواعد مشترک"
        title="الان وقت کدام اقدام است؟"
        desc="موعد مشخص توافق‌شده با مشتری، بر فاصله‌های عمومی زیر مقدم است."
      />
      {person.id === "mohammad" && (
        <div className="mb-5">
          <MohammadPolicy compact />
        </div>
      )}
      <div className="section-stack">
        <div className="grid gap-5 xl:grid-cols-[240px_1fr]">
          <div className="flex flex-wrap gap-2 xl:flex-col">
            {source.follows.map((x) => (
              <button
                key={x[0]}
                className={"tab " + (choice === x[0] ? "tab-active" : "")}
                onClick={() => setChoice(x[0])}
                aria-pressed={choice === x[0]}
              >
                {x[1]}
              </button>
            ))}
          </div>
          <section className="panel flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex-1">
              <h3 className="mb-4 text-2xl font-bold">{f[4]}</h3>
              <p>{f[5]}</p>
              <p className="caption mt-4">{f[6]}</p>
            </div>
            <div className="flex h-36 w-36 shrink-0 flex-col items-center justify-center rounded-full bg-[#e9f2dc] text-[#287858]">
              <strong className="text-4xl font-bold">{f[2]}</strong>
              <span className="text-sm">{f[3]}</span>
            </div>
          </section>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <section className="panel">
            <h3 className="section-title">تغییر موعد</h3>
            <p>
              موعد اولیه را پاک نکن. تاریخ تازه، دلیل و زمان ثبت تغییر را اضافه
              کن. جابه‌جایی تاریخ، تأخیر قبلی را از گزارش حذف نمی‌کند.
            </p>
          </section>
          <section className="panel">
            <h3 className="section-title">ارتباط مرتبط و محترمانه</h3>
            <p>
              برای احیا، خبر یا محصول مرتبط داشته باش. پیام یکسان و مکرر نفرست.
              درخواست عدم تماس همان لحظه ثبت شود و بازگشت فقط با اجازه روشن و
              تازه مشتری باشد.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
function CRM() {
  const [good, setGood] = useState(true);
  return (
    <>
      <Heading
        kicker="قواعد مشترک"
        title="یک ثبت که ادامه کار را روشن کند"
        desc="این نمونه آموزشی است. نتیجه واقعی تماس باید حداکثر تا پایان همان بازه در CRM ثبت شود."
      />
      <div className="section-stack">
        <div className="grid gap-5 xl:grid-cols-2">
          <section className="panel">
            <div className="section-title">
              <h3>نمونه ثبت تماس</h3>
            </div>
            <div className="mb-3 flex gap-2">
              <button
                className={"tab " + (good ? "tab-active" : "")}
                aria-pressed={good}
                onClick={() => setGood(true)}
              >
                ثبت روشن
              </button>
              <button
                className={"tab " + (!good ? "tab-active" : "")}
                aria-pressed={!good}
                onClick={() => setGood(false)}
              >
                ثبت مبهم
              </button>
            </div>
            <dl>
              {(good ? source.recordGood : source.recordBad).map(([a, b]) => (
                <div className="rule-row" key={a}>
                  <dt className="mb-2 text-sm text-muted">{a}</dt>
                  <dd className={good ? "" : "text-[#9a5427]"}>
                    {b.split("<br>").join(" ")}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="panel">
            <h3 className="section-title">حداقل اطلاعات لازم</h3>
            <Cards
              items={[
                {
                  title: "شناسه و مسئول",
                  text: "شناسه مرتبط، مالک پرونده و اقدام‌کننده واقعی.",
                },
                {
                  title: "زمان و نوع اقدام",
                  text: "زمان واقعی، کانال، دسته تماس و نتیجه استاندارد.",
                },
                {
                  title: "اطلاعات واقعی",
                  text: "نیاز یا مانع تازه، مقدار با واحد، مشخصات محصول و شرایط پرداخت.",
                },
                {
                  title: "قدم بعدی",
                  text: "کار مشخص، مسئول، موعد اولیه با تاریخ و ساعت و زمان انجام.",
                },
              ]}
            />
          </section>
        </div>
        <div className="notice">
          در جانشینی، مالک مشتری ثابت می‌ماند؛ فعالیت به نام کسی ثبت می‌شود که
          واقعاً آن را انجام داده است.
        </div>
        <Accordion title="اطلاعات ناقص و گزارش‌گیری">
          <p>
            اطلاعات گرفته‌نشده «نامشخص» است و برای تکمیلش اقدام بعدی لازم است.
            مصرف ماهانه را از سفارش جاری جدا ثبت کن.
          </p>
          <p>
            هر فرصت باز، مالک و اقدام بعدی با موعد معتبر می‌خواهد. اگر فیلدی در
            CRM نیست، فقط همان فیلد در فهرست موقت مشترک ثبت شود. گزارش روزانه و
            هفتگی از همان ثبت‌ها ساخته شود.
          </p>
        </Accordion>
      </div>
    </>
  );
}
function Field({ person }) {
  const [split, setSplit] = useState(false),
    [checks, setChecks] = useState([]);
  const isRep = person.kind === "rep";
  if (person.id === "mohammad")
    return (
      <>
        <Heading
          kicker="برنامه اختصاصی پیگیری"
          title="پیگیری تلفنی یا حضوری لیدهای خودت"
          desc="شنبه، سه‌شنبه و پنج‌شنبه برای پیگیری ملاقات‌ها و لیدها در نظر گرفته شده‌اند. روش هر پیگیری را بر اساس نیاز پرونده و موعد مشتری انتخاب کن."
        />
        <div className="section-stack">
          <MohammadPolicy />
          <section className="panel">
            <h2 className="section-title">هماهنگی پیش از خروج</h2>
            <List
              items={[
                "در پیگیری حضوری، مقصد، مشتری، هدف ملاقات و ساعت خروج و برگشت را مشخص کن.",
                "برنامه را تا ساعت ۱۴ روز کاری قبل با حمید هماهنگ و در CRM ثبت کن؛ کارهای موعددار و جانشین دفتر روشن باشند.",
                "نتیجه واقعی هر پیگیری، کانال تلفنی یا حضوری، مالک، اقدام بعدی و موعد را ثبت کن.",
                "خلاصه ملاقات همان روز و جزئیات حداکثر تا ساعت ۱۰ روز کاری بعد ثبت شوند.",
                "خروج هم‌زمان چند کارشناس به برنامه پوشش مصوب نیاز دارد؛ روز پیگیری به‌تنهایی مجوز خروج بدون هماهنگی نیست.",
              ]}
            />
          </section>
          <section className="panel">
            <h2 className="section-title">
              آمادگی پیگیری حضوری <span className="badge">تمرین</span>
            </h2>
            <Checklist
              labels={[
                "ملاقات و هدف پیگیری تأیید شده‌اند.",
                "مسیر و ساعت خروج و برگشت روشن است.",
                "سوابق لید و کالیته مرتبط آماده است.",
                "جانشین و تعهدهای سررسیددار هماهنگ شده‌اند.",
                "توزیع تماس هفته برای هدف حدود ۲۷۰ مرور شده است.",
              ]}
              values={checks}
              setValues={setChecks}
            />
          </section>
          <p className="notice">
            پیگیری تلفنی در روزهای پیگیری مجاز است. ملاقات حضوری و تماس تلفنی در
            کانال‌های جدا ثبت می‌شوند؛ فقط تماس خروجی معتبر در مجموع هفته شمرده
            می‌شود.
          </p>
        </div>
      </>
    );
  return (
    <>
      <Heading
        kicker="بازدید و جانشینی"
        title={
          person.kind === "manager"
            ? "کنترل برنامه بازدید تیم"
            : "خروج برنامه‌دار، پیگیری منظم"
        }
        desc={
          isRep
            ? "هر کارشناس یک روز در هفته برای بازاریابی حضوری وقت دارد."
            : person.kind === "manager"
              ? "حمید برنامه و پوشش تیم را هماهنگ می‌کند؛ بازدید شخصی او در برنامه فردی تعیین می‌شود."
              : "بازدیدهای دوره تجربه با حمید هماهنگ و در برنامه فردی تعیین می‌شوند؛ استاندارد اجرای بازدید در ادامه آمده است."
        }
      />
      <div className="section-stack">
        {!isRep && (
          <p className="notice">
            الگوی یک روز و حداقل دو ملاقات زیر، استاندارد کارشناسان در SOP جامع
            است. برنامه اختصاصی این نقش باید در اطلاعات فردی تعیین شود. در روز
            کامل، حداقل {fa(person.target)} تماس این نقش پابرجاست.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            className={"tab " + (!split ? "tab-active" : "")}
            aria-pressed={!split}
            onClick={() => setSplit(false)}
          >
            یک نوبت هفتگی
          </button>
          <button
            className={"tab " + (split ? "tab-active" : "")}
            aria-pressed={split}
            onClick={() => setSplit(true)}
          >
            دو نوبت با تأیید قبلی
          </button>
        </div>
        <section className="dark-card">
          <h3 className="text-2xl font-bold text-leaf">
            {split ? "دو نوبت، هر بار ۲ تا ۳ ساعت" : "یک نوبت ۴ تا ۵ ساعته"}
          </h3>
          <p className="mt-2">
            {split
              ? "در دو روز غیرمتوالی، با تأیید قبلی مدیر فروش."
              : "در یک روز از هفته."}{" "}
            زمان شامل رفت‌وآمد و ملاقات است.
          </p>
        </section>
        <div className="grid gap-5 xl:grid-cols-2">
          <section className="panel">
            <h3 className="section-title">قبل و بعد از خروج</h3>
            <List
              items={[
                "برنامه تا ساعت ۱۴ روز کاری قبل در CRM ثبت و تأیید شود.",
                "بازه تماس و کارهای موعددار انجام و پوشش دفتر با جانشین هماهنگ شود.",
                "شخص حاضر، نیاز تازه، تصمیم ملاقات و اقدام بعدی ثبت شود.",
                "خلاصه همان روز؛ جزئیات کامل حداکثر ساعت ۱۰ روز کاری بعد.",
              ]}
            />
            <p className="notice mt-5">
              هماهنگی خروج سه کارشناس با حمید است؛ برای حفظ قاعده پوشش مرجع،
              هم‌زمان بیش از یک کارشناس خارج نباشد مگر برنامه پوشش جدید رسماً
              تصویب شود.
            </p>
            <p className="mt-4 text-sm">
              بازدید روز کامل را کوتاه نمی‌کند. حداقل تماس {isRep ? "۴۵" : "۱۲"}{" "}
              باقی می‌ماند؛ کمبود ظرفیت باید از پیش با تنظیم ساعت یا الگوی دو
              نوبتی حل شود.
            </p>
          </section>
          <section className="panel">
            <h3 className="section-title">
              {person.kind === "manager"
                ? "کنترل آمادگی بازدید کارشناسان"
                : "آمادگی خروج"}{" "}
              <span className="badge">تمرین</span>
            </h3>
            <Checklist
              labels={
                person.kind === "rep"
                  ? source.visitLabels
                  : person.kind === "manager"
                    ? [
                        "برنامه هفتگی و حداقل دو ملاقات کامل هر کارشناس کنترل شده است.",
                        "مسیر، زمان خروج و برگشت کارشناسان روشن است.",
                        "هدف ملاقات و کالیته مرتبط آماده است.",
                        "جانشین و پوشش کارهای سررسیددار تیم هماهنگ شده است.",
                        "برنامه تماس کارشناسان و تأیید خروج ثبت شده است.",
                      ]
                    : [
                        "قرارهای مصوب دوره تجربه تأیید شده‌اند.",
                        "مقصد، مسیر، ساعت خروج و برگشت مشخص است.",
                        "هدف ملاقات و کالیته مرتبط آماده است.",
                        "جانشین و کارهای سررسیددار به او تحویل شده‌اند.",
                        "برنامه تماس و تأیید لازم برای خروج ثبت شده است.",
                      ]
              }
              values={checks}
              setValues={setChecks}
            />
            <p className="mt-4 text-sm" role="status">
              {fa(checks.filter(Boolean).length)} از ۵ مورد آماده است. تأیید
              واقعی در CRM لازم است.
            </p>
          </section>
        </div>
        <section className="panel">
          <h3 className="section-title">نتیجه قابل‌شمارش بازدید کارشناس</h3>
          <p>
            حداقل ۲ ملاقات کامل در هفته. قرار لغوشده یا مراجعه بدون ملاقات شمرده
            نمی‌شود؛ قرار لغوشده در همان هفته جایگزین شود. داشتن یک قرار ذخیره
            به حفظ برنامه کمک می‌کند.
          </p>
        </section>
      </div>
    </>
  );
}
function Metrics({ person, go }) {
  const [id, setId] = useState("orders");
  const m = personMetrics(person).find((x) => x.id === id);
  if (person.kind !== "rep")
    return (
      <>
        <Heading
          kicker="گزارش اجرایی نقش"
          title="هدف تماس و کیفیت اجرای مسئولیت"
          desc={`هدف شخصی ${person.name}، روزانه ۱۲ تماس خروجی قابل‌شمارش است. کارت صد امتیازی کارشناسان به این نقش تعمیم داده نشده است.`}
        />
        <div className="section-stack">
          <section className="panel">
            <h3 className="section-title">رعایت هدف ۱۲ تماس</h3>
            <p className="formula">
              روزهای کامل با حداقل ۱۲ تماس مجاز ÷ تمام روزهای کامل مشمول × ۱۰۰
            </p>
            <p className="caption mt-3">
              هدف: ۱۰۰٪ روزهای کامل مشمول. تعطیلی و مرخصی کامل حذف؛ روز کوتاه
              رسمی جدا گزارش می‌شود. این درصد، امتیاز وزنی ندارد.
            </p>
            <OperationalCalc />
          </section>
          <section className="panel">
            <h3 className="section-title">خروجی‌های قابل مرور</h3>
            <List items={roles[person.kind].success} />
          </section>
          <section className="panel">
            <h3 className="section-title">کنترل‌های مشترک</h3>
            <p>
              قیمت و شرایط مجاز، پذیرش همان نسخه مشتری، تأیید مالی لازم، مالک و
              موعد فرصت باز و رعایت عدم تماس باید ۱۰۰٪ رعایت شوند. پیگیری
              بحرانیِ پرداخت، ارسال و خطر تأخیر نیز ۱۰۰٪ به‌موقع است.
            </p>
            <p className="mt-3">
              کیفیت ثبت و به‌موقع‌بودن پیگیری با تعاریف مشترک بررسی می‌شوند. هدف
              سفارش، در صورت تعیین، باید پیش از دوره تصویب و در اطلاعات فردی ثبت
              شود.
            </p>
          </section>
          {person.kind === "manager" && (
            <section className="panel">
              <h3 className="section-title">کارت کارشناسان برای مرور تیم</h3>
              <div className="space-y-3">
                {source.metricData.map((m) => (
                  <div
                    className="flex justify-between gap-3 border-b border-line pb-3"
                    key={m.id}
                  >
                    <span>
                      {m.name}
                      {m.id === "calls" ? " طبق برنامه اختصاصی هر کارشناس" : ""}
                    </span>
                    <strong>{fa(m.weight)} امتیاز</strong>
                  </div>
                ))}
              </div>
              <p className="caption mt-4">
                محمد: برنامه هفتگی حدود ۲۷۰ و ۴۵ تماس در روزهای کاری غیرپیگیری؛
                زهرا و امیرحسین: ۴۵ تماس روز کامل. الهام: ۱۰ سرنخ جدید روزانه و
                گزارش پشتیبانی جداگانه.
              </p>
              <p className="caption mt-4">
                برای محاسبه آموزشی کارت ۱۰۰ امتیازی، یکی از کارشناسان را در منوی
                نام انتخاب کنید. گزارش تماس شخصی حمید با مبنای ۱۲ جداست.
              </p>
            </section>
          )}
        </div>
      </>
    );
  return (
    <>
      <Heading
        kicker="مطابق SOP جامع"
        title="پنج شاخص عملکرد کارشناس"
        desc={
          person.id === "mohammad"
            ? "وزن‌های پنج شاخص مرجع حفظ شده‌اند. روزهای مشمول شاخص تماس با برنامه اختصاصی محمد تطبیق داده شده‌اند؛ هدف حدود ۲۷۰ تماس هفتگی جداگانه مرور می‌شود."
            : "وزن‌ها، تعریف و فرمول مرجع مبنا هستند. هدف سفارش باید پیش از دوره مصوب باشد."
        }
      />
      <div className="section-stack">
        <div className="grid gap-5 xl:grid-cols-[290px_1fr]">
          <section className="panel">
            <div className="mb-6 flex items-center justify-center gap-3">
              <strong className="text-5xl font-bold text-[#287858]">۱۰۰</strong>
              <span className="text-sm">
                مجموع امتیاز
                <br />
                در پنج شاخص
              </span>
            </div>
            <div className="space-y-2">
              {source.metricData.map((x) => (
                <button
                  key={x.id}
                  className={
                    "tab flex w-full items-center justify-between gap-3 " +
                    (id === x.id ? "tab-active" : "")
                  }
                  onClick={() => setId(x.id)}
                  aria-pressed={id === x.id}
                >
                  <span>{x.name}</span>
                  <strong>{fa(x.weight)}</strong>
                </button>
              ))}
            </div>
          </section>
          <section className="panel" aria-live="polite">
            <div className="mb-3 flex items-baseline gap-3">
              <strong className="text-5xl font-bold" style={{ color: m.color }}>
                {fa(m.weight)}
              </strong>
              <span className="caption">حداکثر امتیاز بخش</span>
            </div>
            <h3 className="text-2xl font-bold">{m.name}</h3>
            <p className="my-4">{m.desc}</p>
            <p className="formula">{m.formula}</p>
            <dl className="mt-5 space-y-4">
              {[
                ["هدف", m.target],
                ["منبع داده", m.source],
                ["زمان گزارش", m.when],
              ].map(([a, b]) => (
                <div key={a}>
                  <dt className="caption">{a}</dt>
                  <dd>{b}</dd>
                </div>
              ))}
            </dl>
            <p className="notice mt-4">{m.extra}</p>
            <button className="btn mt-4" onClick={() => go("calculator")}>
              محاسبه امتیاز آموزشی <Icon name="Calculator" />
            </button>
          </section>
        </div>
        <Supplemental person={person} />
        <section className="panel">
          <h3 className="section-title">مرور و ارزیابی</h3>
          <List
            items={[
              "هر روز موعدهای باز، حداقل تماس، شرح واقعی و وضعیت سفارش مرور شود.",
              "هر هفته ۱۰ فعالیت تصادفی هر نفر بررسی شود؛ اگر کمتر بود، همه.",
              "سفارش خالص ماه تا ۵ روز کاری پس از پایان ماه بسته شود.",
              "اعتراض با شناسه رکورد تا ۲ روز کاری و با حفظ سابقه اصلاح پیگیری شود.",
            ]}
          />
          <p className="notice mt-4">
            کارشناس بابت پیگیری و اطلاع‌رسانی سنجیده می‌شود. علت تولید یا حمل با
            مسئول آن بخش بررسی می‌شود. پیوند امتیاز با حقوق یا پورسانت به سیاست
            جداگانه نیاز دارد.
          </p>
        </section>
      </div>
    </>
  );
}
function Supplemental({ person }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <section className="panel">
        <h3 className="section-title">تبدیل لید در ۶۰ روز</h3>
        <p>
          لیدهای جدیدی که ظرف ۶۰ روز اولین سفارش معتبر و لغونشده دارند، تقسیم بر
          تمام لیدهای معتبر همان گروه که پنجره ۶۰ روزه‌شان کامل شده، ضربدر ۱۰۰.
        </p>
        <p className="caption mt-3">
          تکراری و مشتری قبلی حذف؛ بی‌پاسخ و باخته در مخرج باقی می‌مانند. کمتر
          از ۳۰ لید بالغ برای هر نفر فقط گزارش توصیفی دارد.
        </p>
      </section>
      <section className="panel">
        <h3 className="section-title">اثر بازدید</h3>
        <p>
          {person.id === "mohammad"
            ? "تعداد ملاقات‌های کامل طبق برنامه اختصاصی پیگیری و تبدیل ملاقات به فرصت واجد شرایط ظرف ۱۴ روز، جداگانه رصد می‌شوند. روش تلفنی یا حضوری بر اساس نیاز پرونده انتخاب می‌شود."
            : "حداقل دو ملاقات کامل هفتگی و تبدیل ملاقات به فرصت واجد شرایط ظرف ۱۴ روز، جداگانه رصد می‌شوند."}
        </p>
        <p className="notice mt-4">
          تبدیل لید و اثر ملاقات، شاخص تکمیلی‌اند و وزن اضافه‌ای در کارت ۱۰۰
          امتیازی ندارند.
        </p>
      </section>
    </div>
  );
}
function ratio(a, b) {
  if (a === "" || b === "") return { error: "داده مفقود؛ غیرقابل سنجش" };
  const n = Number(a),
    d = Number(b);
  if (
    !Number.isInteger(n) ||
    !Number.isInteger(d) ||
    n < 0 ||
    d < 0 ||
    n > 1000000 ||
    d > 1000000
  )
    return { error: "عدد صحیح نامنفی تا یک میلیون وارد کنید." };
  return { n, d };
}
export function score(id, a, b) {
  const r = ratio(a, b);
  if (r.error) return r;
  const { n, d } = r;
  if (id === "orders" && d === 0)
    return { error: "هدف سفارش باید بزرگ‌تر از صفر و مصوب باشد." };
  if (id !== "orders" && n > d)
    return { error: "صورت نمی‌تواند از کل موارد بیشتر باشد." };
  if (d === 0) return { error: "مورد واجد شرایط وجود ندارد؛ نامرتبط" };
  const m = source.metricData.find((x) => x.id === id);
  return {
    score:
      m.weight *
      Math.min(n / d / (["post", "pre", "quality"].includes(id) ? 0.95 : 1), 1),
  };
}
function OperationalCalc() {
  const [a, setA] = useState(""),
    [b, setB] = useState("");
  const r = ratio(a, b),
    err =
      r.error ||
      (r.n > r.d
        ? "روزهای موفق از روزهای مشمول بیشتر است."
        : r.d === 0
          ? "روز مشمولی وجود ندارد؛ نامرتبط"
          : "");
  return (
    <div className="mt-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="label">روزهای با حداقل ۱۲ تماس</span>
          <input
            type="number"
            min="0"
            step="1"
            className="field"
            value={a}
            onChange={(e) => setA(e.target.value)}
          />
        </label>
        <label>
          <span className="label">تمام روزهای کامل مشمول</span>
          <input
            type="number"
            min="0"
            step="1"
            className="field"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
        </label>
      </div>
      <p className="mt-4" role="status">
        {err || `رعایت حداقل تماس: ${fa((r.n / r.d) * 100)}٪`}
      </p>
      <p className="caption mt-2">
        محاسبه آموزشی؛ اعداد را از گزارش معتبر CRM بگیرید.
      </p>
    </div>
  );
}
const labels = {
  orders: ["سفارش معتبر خالص", "هدف مصوب سفارش"],
  post: ["انجام‌شده تا موعد اولیه", "همه وظایف سررسیددار"],
  pre: ["انجام‌شده تا موعد اولیه", "همه وظایف سررسیددار"],
  calls: ["روزهای با حداقل ۴۵ تماس", "روزهای کامل مشمول"],
  quality: ["رکوردهای صحیح", "کل نمونه بررسی‌شده"],
};
const samples = {
  orders: ["8", "10"],
  post: ["19", "20"],
  pre: ["18", "20"],
  calls: ["18", "20"],
  quality: ["38", "40"],
};
function Calculator({ person }) {
  const [values, setValues] = useState(samples);
  const results = source.metricData.map((m) => score(m.id, ...values[m.id])),
    valid = results.every((r) => r.score !== undefined),
    total = valid ? results.reduce((a, b) => a + b.score, 0) : null;
  return (
    <>
      <Heading
        kicker="محاسبه‌گر آموزشی کارشناسان"
        title="عددها را تغییر بده، امتیاز را ببین"
        desc="اعداد اولیه فقط مثال‌اند و گزارش واقعی هیچ فردی نیستند. این بخش اطلاعاتی در CRM ثبت نمی‌کند."
      />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="caption">هر بخش تا سقف وزن خودش امتیاز می‌گیرد.</p>
        <button className="btn" onClick={() => setValues(samples)}>
          <Icon name="RotateCcw" />
          بازگشت به مثال
        </button>
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          {source.metricData.map((m, i) => (
            <section className="panel" key={m.id}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-bold">{m.name}</h3>
                <span className="badge">وزن {fa(m.weight)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(person.id === "mohammad" && m.id === "calls"
                  ? [
                      "روزهای تماس الزامی با حداقل ۴۵ تماس",
                      "تمام روزهای کامل تماس الزامی",
                    ]
                  : labels[m.id]
                ).map((l, j) => (
                  <label key={j}>
                    <span className="label min-h-[42px]">{l}</span>
                    <input
                      type="number"
                      min="0"
                      max="1000000"
                      step="1"
                      inputMode="numeric"
                      className="field"
                      value={values[m.id][j]}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          [m.id]: v[m.id].map((x, k) =>
                            k === j ? e.target.value : x,
                          ),
                        }))
                      }
                      aria-label={m.name + "، " + l}
                    />
                  </label>
                ))}
              </div>
              <p className="mt-3 text-sm" role="status">
                {results[i].error ||
                  `${fa(results[i].score)} از ${fa(m.weight)} امتیاز`}
              </p>
            </section>
          ))}
        </div>
        <aside className="dark-card xl:sticky xl:top-32">
          <h3 className="text-xl font-bold">امتیاز مثال</h3>
          <div className="my-6 flex items-baseline gap-2">
            <strong
              className="text-6xl font-bold text-leaf"
              data-testid="total-score"
            >
              {total === null ? "—" : fa(total)}
            </strong>
            <span>از ۱۰۰</span>
          </div>
          <p className="text-sm" role="status">
            {valid
              ? "جمع پنج بخش با سقف وزن مصوب."
              : "جمع کامل آماده نیست؛ وزن‌ها بازتوزیع نشده‌اند."}
          </p>
          <p className="mt-5 border-t border-[#ffffff25] pt-4 text-sm">
            {person.id === "mohammad"
              ? "تماس با هدف ۱۰۰٪ روزهای تماس الزامی؛ شنبه، سه‌شنبه و پنج‌شنبه از مخرج شاخص روزانه خارج‌اند. هدف هفتگی حدود ۲۷۰ جداگانه مرور می‌شود."
              : "تماس با هدف ۱۰۰٪ روزهای مشمول."}{" "}
            پیگیری و کیفیت ثبت با هدف ۹۵٪؛ سفارش با هدف فردی مصوب.
          </p>
        </aside>
      </div>
      <div className="notice mt-5">
        امتیاز هر بخش = وزن × حداقلِ «نسبت عملکرد به هدف» و ۱. داده خالی غیرقابل
        سنجش است؛ مخرج صفر در شاخص نسبتی نامرتبط است. هدف سفارش صفر معتبر نیست.
      </div>
    </>
  );
}
function Profile({ person, profile, onChange, onExport, onImport, storageOK }) {
  const fields = FIELDS.concat(
    person.kind === "support" ? SUPPORT_FIELDS : [],
    person.kind === "ceo"
      ? [
          ["duration", "مدت دوره تجربه و زمان جمع‌بندی"],
          ["handover", "پوشش مسئولیت مدیرعامل و تحویل پایان دوره"],
        ]
      : [],
  );
  return (
    <>
      <Heading
        kicker="بخش قابل شخصی‌سازی"
        title="اطلاعات فردی و برنامه دوره"
        desc="اطلاعات مصوب را وارد کنید. ذخیره این فرم به‌معنای تصویب هدف، تخصیص مشتری یا اعطای اختیار نیست."
      />
      <div className="section-stack">
        <section className="panel">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="badge">{person.name}</span>
            <span className="badge">{targetSummary(person)}</span>
            <span className="caption">
              {storageOK ? "ذخیره خودکار محلی" : "ذخیره محلی در دسترس نیست"}
            </span>
          </div>
          <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            {fields.map(([key, label]) => (
              <label key={key}>
                <span className="label">{label}</span>
                <textarea
                  rows="2"
                  aria-label={label}
                  maxLength="1000"
                  className="field resize-y"
                  value={profile[key] || ""}
                  placeholder={
                    person.kind === "manager"
                      ? "در انتظار تعیین و ثبت مصوبه"
                      : "در انتظار تعیین با مدیر فروش"
                  }
                  onChange={(e) => onChange(key, e.target.value)}
                />
              </label>
            ))}
          </div>
          <p className="local-note mt-6">
            این اطلاعات برای همین فرد و همین مرورگر ذخیره می‌شود. انتخاب نام فقط
            سند را عوض می‌کند و ورود کاربری یا سطح دسترسی ایجاد نمی‌کند.
          </p>
        </section>
        <section className="panel">
          <h3 className="section-title">انتقال اطلاعات محلی</h3>
          <p>
            پشتیبان شامل فرم‌های فردی، چک‌لیست‌ها و مشاهدات ثبت‌شده در همین
            مرورگر است. برای انتقال به مرورگر یا دستگاه دیگر، فایل پشتیبان را
            بازیابی کنید.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={onExport}>
              دریافت پشتیبان
            </button>
            <button className="btn" onClick={onImport}>
              بازیابی پشتیبان
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
const emptyObservation = () => ({
  id: "",
  date: today(),
  stage: "تماس و نیازسنجی",
  record: "",
  fact: "",
  impact: "",
  action: "",
  idea: "",
  decision: "",
  owner: "",
  due: "",
  status: "باز",
});
function Observations({ value, setValue }) {
  const [draft, setDraft] = useState(emptyObservation),
    [msg, setMsg] = useState("");
  function save(e) {
    e.preventDefault();
    if (!draft.fact.trim()) {
      setMsg("مشاهده واقعی را بنویسید.");
      return;
    }
    const row = { ...draft, id: draft.id || String(Date.now()) };
    setValue(
      draft.id
        ? value.map((x) => (x.id === draft.id ? row : x))
        : [row, ...value],
    );
    setDraft(emptyObservation());
    setMsg("مشاهده در این مرورگر ذخیره شد.");
  }
  const fields = [
    ["record", "شناسه پرونده یا شاهد قابل ردیابی"],
    ["fact", "چه اتفاقی افتاد؟ مشاهده واقعی"],
    ["impact", "اثر بر مشتری، زمان یا کیفیت"],
    ["action", "اقدام موقت انجام‌شده"],
    ["idea", "پیشنهاد اصلاحی"],
    ["decision", "تصمیم و مرجع بررسی"],
    ["owner", "مسئول پیگیری"],
  ];
  return (
    <>
      <Heading
        kicker="دفتر مشاهدات سعید تقی‌زاده"
        title="از تجربه روزانه به مسئله قابل بررسی"
        desc="مشاهده واقعی، اثر و پیشنهاد را جدا بنویسید. تغییر فرایند پس از بررسی، تصویب و ثبت نسخه اجرا می‌شود."
      />
      <div className="section-stack">
        <form className="panel" onSubmit={save}>
          <h3 className="section-title">
            {draft.id ? "ویرایش مشاهده" : "ثبت مشاهده"}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="label">تاریخ</span>
              <input
                type="date"
                required
                className="field"
                dir="ltr"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              />
            </label>
            <label>
              <span className="label">مرحله</span>
              <select
                className="field"
                value={draft.stage}
                onChange={(e) => setDraft({ ...draft, stage: e.target.value })}
              >
                {[
                  "تماس و نیازسنجی",
                  "قیمت و پیشنهاد",
                  "CRM",
                  "تأمین",
                  "پرداخت",
                  "ارسال و تحویل",
                  "هماهنگی تیم",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            {fields.map(([key, label]) => (
              <label
                className={key === "fact" ? "md:col-span-2" : ""}
                key={key}
              >
                <span className="label">
                  {label}
                  {key === "fact" ? " *" : ""}
                </span>
                <textarea
                  required={key === "fact"}
                  maxLength={key === "fact" || key === "idea" ? 2000 : 1000}
                  rows={key === "fact" ? 3 : 2}
                  className="field"
                  value={draft[key]}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value })
                  }
                />
              </label>
            ))}
            <label>
              <span className="label">موعد پیگیری</span>
              <input
                type="date"
                className="field"
                dir="ltr"
                value={draft.due}
                onChange={(e) => setDraft({ ...draft, due: e.target.value })}
              />
            </label>
            <label>
              <span className="label">وضعیت</span>
              <select
                className="field"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              >
                {["باز", "در حال بررسی", "تصمیم ثبت شد", "بسته"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button className="btn btn-primary" type="submit">
              {draft.id ? "ذخیره ویرایش" : "ثبت مشاهده"}
            </button>
            {draft.id && (
              <button
                type="button"
                className="btn"
                onClick={() => setDraft(emptyObservation())}
              >
                انصراف از ویرایش
              </button>
            )}
            <span role="status" className="text-sm">
              {msg}
            </span>
          </div>
          <p className="local-note mt-4">
            این دفتر محلی است. تعهد مشتری و اقدام رسمی مرتبط، در CRM نیز ثبت
            شود.
          </p>
        </form>
        <section className="panel">
          <h3 className="section-title">
            مشاهده‌های ثبت‌شده{" "}
            <span className="badge">{fa(value.length)} مورد</span>
          </h3>
          {value.length === 0 ? (
            <p className="text-muted">هنوز مشاهده‌ای ثبت نشده است.</p>
          ) : (
            value.map((x) => (
              <article key={x.id} className="rule-row">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="badge">
                    {x.stage} · {x.status}
                  </span>
                  <span className="caption">{dateLabel(x.date)}</span>
                </div>
                <p className="whitespace-pre-wrap font-semibold">{x.fact}</p>
                {x.impact && <p className="mt-2 text-muted">اثر: {x.impact}</p>}
                {x.idea && <p className="mt-2">پیشنهاد: {x.idea}</p>}
                <p className="caption mt-2">
                  {x.record ? "پرونده: " + x.record + " | " : ""}
                  {x.owner ? "مسئول: " + x.owner + " | " : ""}
                  {x.due ? "موعد: " + dateLabel(x.due) : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    className="btn"
                    onClick={() => {
                      setDraft({ ...emptyObservation(), ...x });
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    ویرایش
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      if (window.confirm("این مشاهده از اطلاعات محلی حذف شود؟"))
                        setValue(value.filter((y) => y.id !== x.id));
                    }}
                  >
                    حذف
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </>
  );
}
function Reference({ person, onOpen }) {
  return (
    <>
      <Heading
        kicker="کنترل سند"
        title="قواعد ثابت و مرجع مشترک"
        desc="این مجموعه، پیوست فردی SOP جامع فروش شاه‌نخ است. نسخه اصلی مرجع در همین فایل نگهداری شده است."
      />
      <div className="section-stack">
        <section className="panel">
          <h3 className="section-title">دامنه نسخه فردی</h3>
          <div className="space-y-4">
            <p>
              منبع:{" "}
              <bdi className="break-all text-sm">
                ShahNakh-Sales-SOP-KPI-Interactive-FA.html
              </bdi>
            </p>
            <p>
              زهرا سحابی، امیرحسین تقی‌زاده و قالب کارشناس، حداقل ۴۵ تماس روز
              کامل دارند. محمد یوسفلو در شنبه، سه‌شنبه و پنج‌شنبه برنامه پیگیری
              تلفنی یا حضوری دارد؛ در سایر روزهای کامل کاری حداقل ۴۵ تماس و در
              هفته هدف حدود ۲۷۰ تماس را دنبال می‌کند. حمید فاطمی و سعید تقی‌زاده
              روزانه ۱۲ تماس دارند.
            </p>
            <p>
              الهام حاج‌حسینی، کارشناس فروش و پشتیبانی، بر اساس فایل اختصاصی
              «sop حاج حسینی.docx» روزانه ۱۰ سرنخ جدید ایجاد می‌کند و حداقل تماس
              جداگانه ندارد. گردش سفارش، مطالبات، تنخواه و گزارش او در بخش‌های
              اختصاصی نقش آمده‌اند.
            </p>
            <p>
              بخش‌های مدیریت تیم و تجربه مدیرعامل، تنظیم اجرایی نقش‌ها بر پایه
              قواعد مشترک‌اند. هدف سفارش، حدود اختیار و تخصیص مشتری باید در
              اطلاعات فردی با مرجع و تاریخ تأیید ثبت شوند.
            </p>
            <p>
              تیم فعلی شامل سه کارشناس فروش و یک کارشناس فروش و پشتیبانی است.
              هماهنگی خروج و پوشش جانشینی با مدیر فروش است؛ قاعده خروج یک نفر تا
              تصویب برنامه پوشش تازه حفظ می‌شود.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={onOpen}>
              مشاهده فایل اصلی مرجع
            </button>
            <button
              className="btn"
              onClick={() =>
                download(
                  "ShahNakh-Sales-SOP-KPI-Interactive-FA.html",
                  masterHTML(),
                  "text/html;charset=utf-8",
                )
              }
            >
              دریافت فایل اصلی
            </button>
          </div>
        </section>
        <section className="panel">
          <h3 className="section-title">ارجاع بخش‌ها</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["کار روزانه و تعریف تماس", "بخش ۱ مرجع"],
              ["مسیر مشتری و سفارش معتبر", "بخش ۲ مرجع"],
              ["زمان پیگیری", "بخش ۳ مرجع"],
              ["ثبت CRM", "بخش ۴ مرجع"],
              ["بازدید حضوری", "بخش ۵ مرجع"],
              ["پنج شاخص عملکرد", "بخش ۶ مرجع"],
              ["محاسبه‌گر آموزشی", "بخش ۷ مرجع"],
              ["مرور و مرز مسئولیت‌ها", "بخش ۸ مرجع"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-xl bg-[#f4f7ef] p-4">
                <strong className="block">{a}</strong>
                <span className="caption">{b}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h3 className="section-title">مرز مسئولیت مشترک</h3>
          <Cards items={commonBoundaries} />
        </section>
        <section className="panel">
          <h3 className="section-title">پیش از اجرای دوره</h3>
          <List
            items={[
              "ساعت کاری، هدف فردی سفارش، سیاست پرداخت و حداقل سفارش مشخص شوند.",
              "جانشین، سبد مشتری، مرجع تأییدها و تاریخ اجرای نسخه فردی ثبت شوند.",
              "چهار هفته اجرای آزمایشی مرجع: اندازه‌گیری زمان؛ کنترل جانشینی و کیفیت؛ اصلاح صف تماس؛ بازبینی ظرفیت و هدف دوره بعد.",
              "هر تغییر استاندارد با نسخه، تاریخ اجرا و اطلاع‌رسانی روشن ثبت شود.",
            ]}
          />
        </section>
      </div>
    </>
  );
}
function PrintDocument({ person, profile, observations, day, dayData }) {
  if (person.kind === "support")
    return (
      <SupportPrint {...{ person, profile, day, dayData }} fields={FIELDS} />
    );
  const isRep = person.kind === "rep",
    content = roles[person.kind];
  return (
    <article className="print-only" dir="rtl">
      <h1>
        {person.id === "template"
          ? "قالب SOP فردی کارشناس فروش"
          : `SOP فردی ${person.name}`}
      </h1>
      <p className="print-meta">
        شاه‌نخ | {person.role} | نسخه ۱٫۱ | {person.code}
      </p>
      <p>مرجع مشترک: ShahNakh-Sales-SOP-KPI-Interactive-FA.html</p>
      <p>
        <strong>{targetSummary(person)}</strong>
      </p>
      <p>
        {isRep
          ? "مسئولیت: نیازسنجی، ارتباط با مشتری، ثبت سفارش و پیگیری تعهدات تا دریافت بار. گزارش به حمید فاطمی."
          : content.mission}
      </p>
      <h2>اطلاعات فردی و برنامه دوره</h2>
      <table>
        <tbody>
          {FIELDS.concat(
            person.kind === "ceo"
              ? [
                  ["duration", "مدت دوره تجربه"],
                  ["handover", "تحویل و پوشش مسئولیت"],
                ]
              : [],
          ).map(([key, label]) => (
            <tr key={key}>
              <th>{label}</th>
              <td>{profile[key] || "در انتظار تعیین و تأیید"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>قواعد ثابت و بخش شخصی</h2>
      <p>
        تعریف تماس، مسیر مشتری، کنترل سفارش، قواعد پیگیری و ثبت CRM از SOP جامع
        می‌آیند. سبد مشتری، هدف سفارش، روز بازدید، جانشین، اولویت و حدود اختیار
        در فرم فردی تعیین می‌شوند. ثبت فرم، تأیید سازمانی نیست.
      </p>
      <h2>اجرای روزانه</h2>
      {dailyPlan(person).map((x) => (
        <div key={x.title}>
          <h3>{x.title}</h3>
          <p>{x.text}</p>
        </div>
      ))}
      <h3>تعریف تماس و روز مشمول</h3>
      <p>
        تلاش خروجی واقعی با مخاطب مشخص، زمان، نتیجه و شرح کوتاه در CRM. بی‌پاسخ
        واقعی شمرده می‌شود؛ پیام، جلسه، ورودی، داخلی، تکراری یا شماره‌گیری بدون
        تلاش واقعی خیر. حداکثر دو تماس هر مخاطب در روز؛ تماس دوم فقط با درخواست
        مشتری، تعهد سفارش یا بی‌پاسخی در ساعت متفاوت. هر تماس یک دسته دارد.
      </p>
      <p>
        {person.id === "mohammad"
          ? MOHAMMAD_POLICY +
            " تماس اضافه در یک روز، کسری روز تماس الزامی را حذف نمی‌کند. روزهای پیگیری حداقل ثابت روزانه ندارند."
          : "روز کامل تمام شیفت مصوب است؛ بازدید آن را کوتاه نمی‌کند. تماس اضافه فردا کسری امروز را حذف نمی‌کند."}{" "}
        تعطیلی و مرخصی کامل خارج از مخرج روزانه‌اند. روز کوتاه رسمی از پیش تعریف
        و جدا گزارش می‌شود.
      </p>
      {!isRep && (
        <>
          <h2>مرور نقش و حدود اختیار</h2>
          {["weekly", "monthly"].map((key) => (
            <div key={key}>
              <h3>
                {key === "weekly" ? "مرور هفتگی" : "مرور ماهانه و پایان دوره"}
              </h3>
              <ul>
                {content[key].map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
          {content.boundaries.map((x) => (
            <div key={x.title}>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </div>
          ))}
          <h3>ارجاع موارد</h3>
          {content.escalation.map((x) => (
            <p key={x.trigger}>
              <strong>{x.trigger}:</strong> {x.action}
            </p>
          ))}
        </>
      )}
      {person.kind === "ceo" && (
        <>
          <h2>مراحل دوره تجربه فروش</h2>
          {content.immersionStages.map((x) => (
            <div key={x.title}>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </div>
          ))}
        </>
      )}
      <h2>مسیر مشتری</h2>
      {source.stages.map((s, i) => (
        <section key={s.short}>
          <h3>
            {fa(i + 1)} {s.short}
          </h3>
          <ul>
            {s.tasks.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p>
            <strong>خروجی:</strong> {s.out}. {s.proof}
          </p>
          <p>
            <strong>مرز اختیار:</strong> {s.limit}
          </p>
        </section>
      ))}
      <h2>زمان پیگیری</h2>
      <p>
        موعد توافق‌شده مشتری مقدم است. موعد اولیه پاک نمی‌شود؛ زمان تازه، دلیل و
        زمان ثبت تغییر حفظ می‌شوند.
      </p>
      {source.follows.map((x) => (
        <p key={x[0]}>
          <strong>{x[1]}:</strong> {x[5]} {x[6]}
        </p>
      ))}
      <h2>ثبت در CRM</h2>
      <p>
        شناسه مرتبط، مالک، اقدام‌کننده واقعی، زمان، کانال، دسته، نتیجه، شرح
        واقعی نیاز یا مانع، مقدار با واحد، مشخصات محصول و پرداخت، اقدام بعدی و
        مسئول و موعد اولیه ثبت شوند. اطلاعات ناقص «نامشخص» بماند و اقدام تکمیل
        داشته باشد. مصرف ماهانه از سفارش جاری جداست. در جانشینی مالک ثابت و
        فعالیت به نام انجام‌دهنده واقعی است.
      </p>
      <h2>بازدید و جانشینی</h2>
      {person.id === "mohammad" ? (
        <p>
          شنبه، سه‌شنبه و پنج‌شنبه پیگیری ملاقات‌ها و لیدهای خودت را تلفنی،
          حضوری یا ترکیبی انجام بده. خروج حضوری با مقصد، هدف و ساعت روشن و
          هماهنگی حمید انجام شود؛ برنامه تا ساعت ۱۴ روز کاری قبل ثبت شود. خلاصه
          همان روز و جزئیات تا ساعت ۱۰ روز کاری بعد در CRM ثبت شوند. ملاقات
          حضوری به‌عنوان تماس تلفنی شمرده نمی‌شود.
        </p>
      ) : (
        <p>
          {isRep
            ? "استاندارد کارشناس:"
            : "برنامه اختصاصی این نقش در فرم فردی تعیین شود؛ استاندارد کارشناسان برای مرجع:"}{" "}
          یک نوبت ۴ تا ۵ ساعته با رفت‌وآمد، یا دو نوبت ۲ تا ۳ ساعته در روزهای
          غیرمتوالی با تأیید قبلی. دو ملاقات کامل در هفته، قرار لغوشده در همان
          هفته جایگزین شود. برنامه تا ساعت ۱۴ روز کاری قبل تأیید شود؛ خلاصه همان
          روز و جزئیات تا ساعت ۱۰ روز کاری بعد ثبت شود.
        </p>
      )}
      <p>
        جانشین و پیگیری‌های موعددار از پیش هماهنگ شوند. خروج هم‌زمان بیش از یک
        کارشناس، به تصویب برنامه پوشش تازه نیاز دارد.{" "}
        {person.id === "mohammad"
          ? "تماس‌ها و حضور میدانی برای هدف حدود ۲۷۰ تماس هفتگی مدیریت شوند؛ حداقل ۴۵ تماس روزهای کاری غیرپیگیری پابرجاست."
          : `حداقل ${fa(person.target)} تماس روز کامل این نقش پابرجاست.`}
      </p>
      <h2>شاخص‌های عملکرد</h2>
      {isRep ? (
        <>
          {personMetrics(person).map((m) => (
            <section key={m.id}>
              <h3>
                {m.name} با وزن {fa(m.weight)}
              </h3>
              <p>{m.desc}</p>
              <p>{m.formula}</p>
              <p>
                {m.target}؛ {m.when}
              </p>
              <p>
                {m.source} {m.extra}
              </p>
            </section>
          ))}
          <p>
            امتیاز بخش = وزن × حداقلِ نسبت عملکرد به هدف و ۱. داده مفقود یا
            نامرتبط، جمع کامل ندارد و وزن‌ها بازتوزیع نمی‌شوند.
          </p>
          <p>
            تبدیل لید گروه بالغ در ۶۰ روز و اثر ملاقات ظرف ۱۴ روز شاخص تکمیلی
            بدون وزن‌اند. تکراری و مشتری قبلی از گروه حذف، بی‌پاسخ و باخته باقی
            می‌مانند؛ کمتر از ۳۰ لید بالغ فقط توصیفی گزارش شود.
          </p>
        </>
      ) : (
        <>
          <p>
            رعایت تماس = روزهای کامل با حداقل ۱۲ تماس مجاز ÷ تمام روزهای کامل
            مشمول × ۱۰۰. هدف ۱۰۰٪، بدون وزن در کارت کارشناسان.
          </p>
          <ul>
            {content.success.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </>
      )}
      <p>
        کنترل‌های بحرانی ۱۰۰٪: قیمت و شرایط مجاز، پذیرش مشتری، تأیید مالی لازم،
        مالک و موعد فرصت باز و عدم تماس. پیگیری بحرانی پرداخت، ارسال و خطر تأخیر
        ۱۰۰٪ به‌موقع.
      </p>
      {person.kind === "ceo" && (
        <>
          <h2>دفتر مشاهدات دوره</h2>
          <p>
            برای هر مشاهده: تاریخ، مرحله، شناسه پرونده، واقعیت و شاهد، اثر،
            اقدام موقت، پیشنهاد، مرجع تصمیم، مسئول و موعد ثبت شود. پیشنهاد
            به‌تنهایی تغییر مصوب نیست.
          </p>
          {observations.length ? (
            observations.map((x) => (
              <section className="keep" key={x.id}>
                <h3>
                  {dateLabel(x.date)} | {x.stage}
                </h3>
                <p>
                  وضعیت: {x.status} | پرونده: {x.record || "تعیین نشده"}
                </p>
                <p>مشاهده: {x.fact}</p>
                <p>اثر: {x.impact}</p>
                <p>اقدام موقت: {x.action}</p>
                <p>پیشنهاد: {x.idea}</p>
                <p>تصمیم: {x.decision}</p>
                <p>
                  مسئول: {x.owner} | موعد:{" "}
                  {x.due ? dateLabel(x.due) : "تعیین نشده"}
                </p>
              </section>
            ))
          ) : (
            <p>هنوز مشاهده‌ای ثبت نشده است.</p>
          )}
        </>
      )}
      <h2>مرجع و کنترل تغییر</h2>
      <p>
        عدد ۱۲ فقط برای حمید فاطمی و سعید تقی‌زاده، طبق دستور اختصاصی این نسخه
        است. مبنای زهرا و امیرحسین ۴۵ تماس روز کامل است؛ محمد برنامه اختصاصی
        پیگیری و هدف حدود ۲۷۰ هفتگی دارد و الهام ۱۰ سرنخ جدید روزانه بدون حداقل
        تماس جداگانه. هر تغییر به استاندارد، نسخه و تاریخ اجرای روشن می‌خواهد.
        اطلاعات این فایل محلی است؛ مرجع رسمی گزارش و تأییدها CRM و سیاست مصوب
        شرکت است.
      </p>
    </article>
  );
}
