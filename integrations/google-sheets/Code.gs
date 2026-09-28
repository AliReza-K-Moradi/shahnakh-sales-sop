/** ShahNakh SOP collector. Bind this project to the private destination spreadsheet. */
const SITE_ORIGIN = 'https://alireza-k-moradi.github.io';
const PROTOCOL = 'shahnakh-sheets-v1';
const PEOPLE = {
  mohammad: ['محمد یوسفلو', 'کارشناس فروش'],
  zahra: ['زهرا سحابی', 'کارشناس فروش'],
  amirhossein: ['امیرحسین تقی‌زاده', 'کارشناس فروش'],
  elham: ['الهام حاج‌حسینی', 'کارشناس فروش و پشتیبانی'],
  hamid: ['حمید فاطمی', 'مدیر فروش'],
  saeed: ['سعید تقی‌زاده', 'مدیرعامل در تجربه فروش'],
  test: ['آزمایش اتصال', 'سامانه']
};
const KINDS = { daily: 'گزارش روزانه', profile: 'اطلاعات فردی', kpi: 'محاسبه KPI', observation: 'ثبت یا ویرایش مشاهده', 'observation-delete': 'حذف مشاهده از دفتر', test: 'ثبت آزمایشی اتصال' };
const HEADERS = {
  'ثبت‌ها': ['زمان دریافت', 'تاریخ فعالیت', 'نام', 'سمت', 'نوع ثبت', 'بخش سایت', 'تماس ثبت‌شده', 'سرنخ جدید', 'ملاقات حضوری', 'شناسه مشاهده', 'شناسه دریافت', 'وضعیت دریافت', 'تعداد فیلد', 'شروع جزئیات', 'اثر انگشت محتوا', 'زمان ارسال کاربر'],
  'جزئیات ثبت‌ها': ['شناسه دریافت', 'زمان دریافت', 'تاریخ فعالیت', 'نام', 'نوع ثبت', 'عنوان فیلد', 'مقدار ثبت‌شده', 'کلید فیلد']
};

function setup() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error('این پروژه باید از منوی Extensions همین Google Sheet ساخته شود.');
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', book.getId());
  book.setSpreadsheetTimeZone('Asia/Tehran');
  Object.keys(HEADERS).forEach(function (name) {
    const sheet = book.getSheetByName(name) || book.insertSheet(name);
    const headers = HEADERS[name];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setBackground('#143b32').setFontColor('#ffffff').setFontWeight('bold').setWrap(true).setHorizontalAlignment('center');
    sheet.setRowHeight(1, 46);
    sheet.setFrozenRows(1);
    sheet.setRightToLeft(true);
    sheet.setHiddenGridlines(true);
    sheet.getRange(1, 1, sheet.getMaxRows(), headers.length).setFontFamily('Arial').setFontSize(11).setVerticalAlignment('middle');
    sheet.setColumnWidths(1, headers.length, 155);
    sheet.setTabColor(name === 'ثبت‌ها' ? '#143b32' : '#6f8d72');
    if (name === 'ثبت‌ها') {
      sheet.setColumnWidth(1, 180);
      sheet.setColumnWidth(4, 210);
      sheet.setColumnWidth(6, 190);
      sheet.setColumnWidth(11, 300);
      sheet.setColumnWidths(7, 3, 115);
      sheet.hideColumns(14, 2);
    } else {
      sheet.setColumnWidth(1, 300);
      sheet.setColumnWidth(6, 330);
      sheet.setColumnWidth(7, 420);
      sheet.setColumnWidth(8, 260);
      sheet.getRange(2, 6, sheet.getMaxRows() - 1, 2).setWrap(true);
    }
    if (!sheet.getFilter()) sheet.getRange(1, 1, sheet.getMaxRows(), headers.length).createFilter();
  });
  book.setActiveSheet(book.getSheetByName('ثبت‌ها'));
  SpreadsheetApp.flush();
  console.log('آماده دریافت: ' + book.getUrl());
}

function doGet(event) {
  const params = event && event.parameter || {};
  if (!/^[a-zA-Z0-9-]{20,80}$/.test(params.channel || '') || params.origin !== SITE_ORIGIN) {
    return HtmlService.createHtmlOutput('<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><p>اتصال ثبت اطلاعات شاه‌نخ آماده است. ثبت اطلاعات از سایت SOP انجام می‌شود.</p></html>');
  }
  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body><script>' +
    'const protocol=' + JSON.stringify(PROTOCOL) + ', channel=' + JSON.stringify(params.channel) + ', site=' + JSON.stringify(SITE_ORIGIN) + ';' +
    'function tell(message){window.top.postMessage(Object.assign({protocol:protocol,channel:channel},message),site);}' +
    'const readyTimer=setInterval(function(){tell({type:"ready"});},800);tell({type:"ready"});' +
    'window.addEventListener("message",function(event){const data=event.data;' +
    'if(event.origin!==site||event.source!==window.top||!data||data.protocol!==protocol||data.channel!==channel)return;' +
    'if(data.type==="hello"){clearInterval(readyTimer);return;}' +
    'if(data.type!=="submit"||!data.record||data.id!==data.record.id)return;' +
    'google.script.run.withSuccessHandler(function(receipt){tell({type:"result",id:data.id,ok:true,receipt:receipt});})' +
    '.withFailureHandler(function(error){tell({type:"result",id:data.id,ok:false,error:error.message||"ثبت در شیت انجام نشد."});}).saveSubmission(data.record);' +
    '});<\/script></body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function cleanText_(value, limit) {
  if (typeof value !== 'string' || value.length > limit) throw new Error('ساختار یا طول متن معتبر نیست.');
  return value;
}
function sheetValue_(value) {
  if (typeof value === 'boolean') return value ? 'بله' : 'خیر';
  if (typeof value === 'number') return value;
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
}
function activityDate_(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text || '')) throw new Error('تاریخ فعالیت معتبر نیست.');
  const date = new Date(text + 'T12:00:00+03:30');
  if (isNaN(date.getTime()) || Utilities.formatDate(date, 'Asia/Tehran', 'yyyy-MM-dd') !== text) throw new Error('تاریخ فعالیت معتبر نیست.');
  return date;
}
function validate_(raw) {
  if (!raw || raw.schema !== 1 || typeof raw.id !== 'string' || !/^[a-zA-Z0-9-]{20,80}$/.test(raw.id)) throw new Error('شناسه یا نسخه ثبت معتبر نیست.');
  if (!Object.prototype.hasOwnProperty.call(PEOPLE, raw.personId) || !Object.prototype.hasOwnProperty.call(KINDS, raw.kind)) throw new Error('فرد یا نوع ثبت معتبر نیست.');
  if ((raw.kind === 'test') !== (raw.personId === 'test')) throw new Error('ثبت آزمایشی باید با نام آزمایش اتصال ارسال شود.');
  if ((raw.kind === 'observation' || raw.kind === 'observation-delete') && raw.personId !== 'saeed') throw new Error('مشاهده مخصوص نقش مدیرعامل است.');
  const date = activityDate_(raw.day);
  if (!Array.isArray(raw.fields) || raw.fields.length < 1 || raw.fields.length > 400) throw new Error('تعداد فیلدهای ثبت معتبر نیست.');
  const fields = raw.fields.map(function (field) {
    const value = field.value;
    if (value !== null && !['string', 'number', 'boolean'].includes(typeof value)) throw new Error('مقدار فیلد معتبر نیست.');
    if (typeof value === 'string' && value.length > 5000 || typeof value === 'number' && !Number.isFinite(value)) throw new Error('مقدار فیلد معتبر نیست.');
    return { key: cleanText_(field.key, 150), label: cleanText_(field.label, 300), value: value };
  });
  const counts = ['calls', 'leads', 'visits'].map(function (key) {
    const value = raw.summary && raw.summary[key];
    if (value === null || value === undefined || value === '') return '';
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 999999) throw new Error('تعداد فعالیت معتبر نیست.');
    return value;
  });
  const normalized = {
    id: raw.id, personId: raw.personId, day: raw.day, kind: raw.kind,
    page: cleanText_(raw.page || '', 150), recordId: cleanText_(raw.recordId || '', 100),
    clientTime: cleanText_(raw.clientTime || '', 40), fields: fields, summary: counts
  };
  const text = JSON.stringify(normalized);
  if (text.length > 150000) throw new Error('حجم ثبت بیش از ظرفیت این فرم است.');
  const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text).map(function (byte) { return ('0' + (byte & 255).toString(16)).slice(-2); }).join('');
  return { data: normalized, date: date, hash: hash };
}

function ensureRows_(sheet, last) {
  if (last > sheet.getMaxRows()) {
    sheet.insertRowsAfter(sheet.getMaxRows(), last - sheet.getMaxRows() + 200);
    const filter = sheet.getFilter();
    if (filter) { filter.remove(); sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getLastColumn()).createFilter(); }
  }
}

function saveSubmission(raw) {
  const checked = validate_(raw);
  const data = checked.data;
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const properties = PropertiesService.getScriptProperties();
    const bookId = properties.getProperty('SPREADSHEET_ID');
    if (!bookId) throw new Error('راه‌اندازی شیت کامل نشده است.');
    const book = SpreadsheetApp.openById(bookId);
    const log = book.getSheetByName('ثبت‌ها');
    const details = book.getSheetByName('جزئیات ثبت‌ها');
    if (!log || !details) throw new Error('برگه دریافت یا جزئیات موجود نیست.');
    const found = log.getLastRow() > 1 ? log.getRange(2, 11, log.getLastRow() - 1, 1).createTextFinder(data.id).matchEntireCell(true).findNext() : null;
    let row, start, received;
    if (found) {
      row = found.getRow();
      const stored = log.getRange(row, 1, 1, 16).getValues()[0];
      if (stored[14] !== checked.hash) throw new Error('این شناسه دریافت برای محتوای دیگری استفاده شده است.');
      received = stored[0];
      if (stored[11] === 'ثبت شد') return { id: data.id, receivedAt: received.toISOString(), duplicate: true };
      start = Number(stored[13]);
    } else {
      row = log.getLastRow() + 1;
      start = Math.max(details.getLastRow() + 1, Number(properties.getProperty('NEXT_DETAIL_ROW') || 2));
      properties.setProperty('NEXT_DETAIL_ROW', String(start + data.fields.length));
      received = new Date();
      ensureRows_(log, row);
      log.getRange(row, 1, 1, 16).setValues([[
        received, checked.date, PEOPLE[data.personId][0], PEOPLE[data.personId][1], KINDS[data.kind], sheetValue_(data.page),
        data.summary[0], data.summary[1], data.summary[2], sheetValue_(data.recordId), data.id, 'در حال ثبت', data.fields.length,
        start, checked.hash, sheetValue_(data.clientTime)
      ]]);
    }
    ensureRows_(details, start + data.fields.length - 1);
    const values = data.fields.map(function (field) {
      return [data.id, received, checked.date, PEOPLE[data.personId][0], KINDS[data.kind], sheetValue_(field.label), sheetValue_(field.value), sheetValue_(field.key)];
    });
    details.getRange(start, 1, values.length, 8).setValues(values).setVerticalAlignment('top');
    details.getRange(start, 2, values.length, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    details.getRange(start, 3, values.length, 1).setNumberFormat('yyyy-mm-dd');
    details.getRange(start, 6, values.length, 2).setWrap(true);
    log.getRange(row, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    log.getRange(row, 2).setNumberFormat('yyyy-mm-dd');
    SpreadsheetApp.flush();
    log.getRange(row, 12).setValue('ثبت شد');
    SpreadsheetApp.flush();
    return { id: data.id, receivedAt: received.toISOString(), duplicate: false };
  } finally { lock.releaseLock(); }
}
