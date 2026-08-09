/**
 * Persian UI strings.
 *
 * The field labels and helper lines are taken from the workbook itself — the
 * `محاسبه-ساده` sheet's B (label) and D (helper) columns, and the `Data`
 * sheet's F note column — so the wording the underwriter already knows is
 * preserved. Two labels are corrected on the way in: `Data!B23` and `Data!D27`
 * carry stray maintenance labels that belong to other rows (row 23 is
 * Existing Property, not maintenance).
 */

export const L = {
  appName: 'ریسکورا',
  appTitle: 'محاسبهٔ حق‌بیمهٔ تمام‌خطر نصب (EAR)',
  appSubtitle: 'روش نرخ‌گذاری سوئیس‌ری · بومی‌سازی‌شده برای ایران',

  // --- landing ----------------------------------------------------------
  backHome: 'صفحهٔ اصلی',
  landingTitle: 'می‌خواهید چه کاری انجام دهید؟',
  landingSubtitle:
    'یکی از دو ابزار زیر را انتخاب کنید. هر دو محاسبه‌ها را به‌صورت آنی و بر مبنای ریال انجام می‌دهند.',
  toolEarTitle: 'نرخ‌دهی بیمه‌نامهٔ تمام‌خطر نصب',
  toolEarDesc:
    'محاسبهٔ نرخ فنی و حق‌بیمهٔ EAR به روش سوئیس‌ری — با جدول‌های سفید (کل پروژه) و آبی (ماشین‌آلات منفرد)، بارگذاری زلزلهٔ استاندارد ۲۸۰۰ و مسئولیت شخص ثالث.',
  toolEarCta: 'شروع نرخ‌دهی',
  toolEndorsementTitle: 'ماشین‌حساب حق‌بیمهٔ الحاقیه',
  toolEndorsementDesc:
    'محاسبهٔ حق‌بیمهٔ روزشمار برای افزایش یا کاهش سرمایه و تمدید بیمه‌نامه، بر اساس تاریخ شمسی و مدت باقی‌مانده.',
  toolEndorsementCta: 'شروع محاسبه',
  endorsementBadge: 'الحاقیه',
  endorsementSubtitle: 'محاسبهٔ حق‌بیمهٔ روزشمار — افزایش/کاهش سرمایه و تمدید',

  // --- disclaimer -------------------------------------------------------
  disclaimerTitle: 'دربارهٔ این سامانه',
  disclaimer:
    'این سامانه صرفاً راهنمای ارائهٔ نرخ است و مرجع قطعی به‌شمار نمی‌رود. ' +
    'خروجی آن جنبهٔ پیشنهادی و کارشناسی دارد و تصمیم‌گیری نهایی دربارهٔ نرخ و ' +
    'صدور بیمه‌نامه بر عهدهٔ کاربر صدور است.',
  creditsLabel: 'طراحی و توسعه',
  credits: 'حامی بذرافشان، محمد رضایی',

  // --- sections ---------------------------------------------------------
  sec1: '۱) مشخصات پروژه',
  sec2: '۲) مبلغ‌ها',
  sec3: '۳) گزینه‌های رایج',
  sec3Hint: 'بیشتر پروژه‌ها این‌ها را دارند',
  sec4: '۴) گزینه‌های تکمیلی',
  sec4Hint: 'فقط اگر پروژه دارد وارد کنید — همه به‌صورت پیش‌فرض صفر هستند',
  sec5: '۵) تنظیمات مالی',
  sec6: '۶) بلایای طبیعی برای ماشین منفرد',

  // --- block 1 ----------------------------------------------------------
  projectScope: 'دامنهٔ پروژه',
  projectScopeHelp:
    'کل پروژه = جداول سفید · ماشین‌آلات منفرد = جداول آبی (بند ۲.۵ سوئیس‌ری)',
  scopeEntire: 'کل پروژه',
  scopeMachines: 'ماشین‌آلات منفرد',
  industryGroup: 'گروه صنعتی',
  industryGroupHelp: 'از فهرست انتخاب کنید — فهرست زیرگروه را تعیین می‌کند',
  subGroup: 'زیرگروه پروژه',
  subGroupHelp: 'بر اساس گروه بالا فیلتر می‌شود · تمام نرخ‌های پایه از این ردیف می‌آید',
  machine: 'ماشین منفرد',
  machineHelp: 'از جداول آبی — ۱۰۸ ماشین، با کد EAR برای جلوگیری از هم‌نامی',
  durationMonths: 'مدت کل پروژه (ماه)',
  durationMonthsHelp: 'نصب + آزمایش، جمعاً · بازهٔ مجاز ۱ تا ۱۲۰ ماه',
  erectionMonths: 'ماه‌های نصب',
  erectionMonthsHelp: 'نرخ پایه شامل ۳ ماه است · قابل تمدید تا حداکثر ۹ ماه (بند ۲.۵)',
  testingMonths: 'ماه‌های آزمایش',
  testingMonthsHelp: 'نرخ پایه شامل ۱ ماه است · قابل تمدید تا حداکثر ۳ ماه (بند ۲.۵)',
  province: 'استان',
  provinceHelp: 'از فهرست انتخاب کنید',
  city: 'شهرستان',
  cityHelp: 'بر اساس استان فیلتر می‌شود · مبنای طبقه‌بندی: استاندارد ۲۸۰۰، ویرایش چهارم',

  // --- block 2 ----------------------------------------------------------
  sumInsured: 'مبلغ بیمه — ارزش کل پروژه (﷼)',
  sumInsuredHelp: 'مبنای اصلی محاسبهٔ حق‌بیمه',
  tplLimit: 'سقف مسئولیت شخص ثالث TPL (﷼)',
  tplLimitHelp: 'سقف غرامت مسئولیت مدنی · فقط ضریب تعدیل را تعیین می‌کند',

  // --- block 3 ----------------------------------------------------------
  tplIncluded: 'پوشش مسئولیت شخص ثالث (TPL) وجود دارد؟',
  tplIncludedHelp:
    'اگر «خیر» باشد، کل حق‌بیمهٔ TPL (پایه + مسئولیت متقابل) صفر می‌شود',
  hotTestingIncluded: 'آزمایش/راه‌اندازی گرم شامل شود؟',
  hotTestingIncludedHelp: 'اگر پروژه دورهٔ آزمایش دارد',
  maintenanceClass: 'طبقهٔ نگهداری',
  maintenanceClassHelp: 'سبک (Light) یا سنگین/شیمیایی (Heavy) — مقیاس بارگذاری نگهداری',
  visitsMaintenanceMonths: 'نگهداری ساده — مدت (ماه)',
  extendedMaintenanceMonths: 'نگهداری گسترده — مدت (ماه)',
  zeroMeansNone: '۰ یعنی ندارد',
  eqSensitivityClass: 'کلاس حساسیت تجهیزات در برابر زلزله (۱ تا ۴)',
  eqSensitivityClassHelp: '۱ = غیرحساس … ۴ = بسیار حساس (جدول E1)',
  structureClass: 'کلاس مقاومت سازهٔ ساختمان (۱ تا ۶)',
  structureClassHelp: '۱ = فولادی سبک … ۶ = بنایی آجری (جدول E2)',
  tplCategory: 'ردهٔ ریسک فنی TPL',
  tplCategoryHelp: 'سبک / متوسط / سنگین',
  tplSurroundings: 'ردهٔ محیط اطراف کارگاه (TPL)',
  tplSurroundingsHelp: 'سایت ایزوله / حومه / مرکز شهر',
  crossLiability: 'مسئولیت متقابل (Cross Liability) شامل شود؟',
  crossLiabilityHelp: '۳۵٪ اضافه بر حق‌بیمهٔ TPL',

  // --- block 4 ----------------------------------------------------------
  mrMaterial: 'ریسک سازندهٔ تجهیزات — نقص مواد/کارگری (ماه)',
  mrDesign: 'ریسک سازندهٔ تجهیزات — نقص طراحی (ماه)',
  mrHelp: '۰ = ندارد · ۵٪ (۱ تا ۳ ماه) / ۷.۵٪ (۴ تا ۶) / ۱۰٪ (۷ به بالا) از نرخ مرجع',
  expediting: 'هزینهٔ تسریع — درصد از نرخ کار (اعشاری)',
  expeditingHelp: 'مثلاً ۰.۰۷۵ برای ۷.۵٪ · ۰ = ندارد',
  riotStrikeRate: 'شورش و اعتصاب — نرخ آتش‌نشانی (‰)',
  riotStrikeRateHelp:
    'سوئیس‌ری این نرخ را جدول‌بندی نکرده — از بازار بیمهٔ آتش‌سوزی محلی بگیرید · ۰ = ندارد',
  riotStrikeBasis: 'شورش و اعتصاب — دوره',
  riotStrikeBasisHelp: 'دورهٔ آزمایش = ۱۰۰٪ نرخ · دورهٔ نصب = ۵۰٪',
  riotErection: 'دورهٔ نصب',
  riotTesting: 'دورهٔ آزمایش/راه‌اندازی',
  airFreightLimit: 'هوابرد — سقف تعهد (﷼)',
  airFreightRate: 'هوابرد — نرخ (‰)',
  airFreightRateHelp: '۵‰ زیر ۲۰۰۰ مایل، تا ۲۰‰ برای فاصلهٔ بیشتر',
  storageValue: 'انبارداری پیش از نصب — ارزش کالا (﷼)',
  storageMonths: 'انبارداری پیش از نصب — مدت (ماه)',
  storageHelp: 'حداقل ۰.۱‰ در ماه بر ارزش انبارشده · ۰ = ندارد',
  transitValue: 'ترانزیت زمینی — ارزش کالای در حال حمل (﷼)',
  transitValueHelp: 'حداقل ۱‰ بر کل ارزش حمل‌شده · ۰ = ندارد',
  debrisLimit: 'رفع نخاله — سقف هر رویداد (﷼)',
  debrisLimitHelp: 'فقط بالاتر از آستانهٔ ۱۰۰٬۰۰۰ c-unit نرخ می‌خورد · ۰ = ندارد',
  existingProperty: 'اموال مجاور — نوع پوشش',
  existingPropertyHelp: 'پوشش اموال موجود در محل کارگاه',
  existingPropertyLimit: 'اموال مجاور — سقف هر رویداد (﷼)',
  earthquakeExclusion: 'معافیت زلزله اعمال شود؟',
  earthquakeExclusionHelp: 'در صورت «بله»، بارگذاری زلزله صفر می‌شود',

  // --- block 5 ----------------------------------------------------------
  underwritingAdjustment: 'تعدیل نرخ‌گذار (اعشاری؛ منفی = تخفیف)',
  underwritingAdjustmentHelp: 'مثلاً ‎−۰.۱ برای ۱۰٪ تخفیف',
  brokerage: 'کارمزد نمایندگی (اعشاری)',
  brokerageHelp: 'مثلاً ۰.۱ برای ۱۰٪ · از حق‌بیمهٔ ناخالص پرداخت می‌شود',
  insuranceTax: 'مالیات/عوارض بیمه (اعشاری)',
  insuranceTaxHelp: 'نرخ فعلی ایران: ۰.۰۹ · بر حق‌بیمهٔ ناخالص افزوده می‌شود',

  // --- block 6 ----------------------------------------------------------
  natureRiskForMachine: 'بارگذاری بلایای طبیعی برای ماشین منفرد؟',
  natureRiskForMachineHelp:
    'طبق بند ۲.۵ پیش‌فرض «خیر» · فقط اگر دورهٔ بازگشت رویداد فاجعه‌بار کمتر از ۱۰ سال باشد «بله» کنید',

  // --- results ----------------------------------------------------------
  mdTechnicalRate: 'نرخ فنی خسارت مادی (MD)',
  tplRate: 'نرخ مسئولیت شخص ثالث (TPL)',
  ratePanelTitle: 'نرخ‌های محاسبه‌شده',
  issuesTitle: 'مواردی که باید اصلاح شود',
  mdOfficeRate: 'نرخ نهایی پس از تعدیل',
  totalPayable: 'حق‌بیمهٔ کل قابل‌پرداخت',
  grossPremium: 'حق‌بیمهٔ ناخالص',
  netToInsurer: 'خالص سهم بیمه‌گر',
  grossMDPremium: 'حق‌بیمهٔ ناخالص خسارت مادی',

  // --- breakdown --------------------------------------------------------
  breakdownTitle: 'ساختار نرخ و آبشار حق‌بیمه',
  breakdownSubtitle: 'هر جزء نرخ، از پایه تا حق‌بیمهٔ نهایی',
  rateBuildUp: 'ساخت نرخ (‰)',
  premiumWaterfall: 'آبشار حق‌بیمه (﷼)',
  effectiveErection: 'نرخ مؤثر نصب',
  bandedBase: 'نرخ پایهٔ باندبندی‌شده',
  minRateFloor: 'کف نرخ زیرگروه',
  hotTesting: 'آزمایش/راه‌اندازی گرم',
  eqLoading: 'بارگذاری زلزله',
  loadingsSubtotal: 'جمع بارگذاری‌های الحاقی',
  addOns: 'پوشش‌های الحاقی (بر مبنای سقف خودشان)',
  tplSection: 'مسئولیت شخص ثالث',

  // --- validation -------------------------------------------------------
  readyTitle: 'آمادهٔ محاسبه — همهٔ ورودی‌ها معتبرند',
  notReadyTitle: 'یکی از ورودی‌ها را اصلاح کنید',
  validationTitle: 'بررسی‌های اعتبارسنجی',
  notApplicable: 'کاربرد ندارد',

  // --- settings ---------------------------------------------------------
  settings: 'تنظیمات ارز',
  nimaRate: 'نرخ نیمایی (ریال به ازای هر دلار)',
  nimaRateHelp: 'پیش از هر محاسبه از سامانهٔ نیما/سنا به‌روزرسانی کنید',
  inflationFactor: 'ضریب تعدیل تورمی دلار (۱۹۹۷ ← ۲۰۲۶)',
  inflationFactorHelp: 'نسبت CPI-U آمریکا · مبنای تبدیل c-unit به ریال',
  rialPerCUnit: 'هر c-unit معادل',
  reset: 'بازنشانی به مقادیر پیش‌فرض',

  yes: 'بله',
  no: 'خیر',
  light: 'سبک',
  heavy: 'سنگین/شیمیایی',
} as const

export const TPL_CATEGORY_FA: Record<string, string> = {
  I: 'I — سبک',
  II: 'II — متوسط',
  III: 'III — سنگین',
}

export const TPL_SURROUNDINGS_FA: Record<string, string> = {
  a: 'a — سایت ایزوله',
  b: 'b — حومهٔ شهر (تراکم متوسط)',
  c: 'c — مرکز شهر / متراکم',
}

export const EQ_SENSITIVITY_FA: Record<number, string> = {
  1: '۱ — اقلام غیرحساس',
  2: '۲ — حساسیت کم تا متوسط',
  3: '۳ — حساس',
  4: '۴ — بسیار حساس',
}

export const STRUCTURE_FA: Record<number, string> = {
  1: '۱ — اسکلت فولادی، پوشش سبک',
  2: '۲ — اسکلت فولادی، آزبست موج‌دار',
  3: '۳ — بتن مسلح، پوشش سبک',
  4: '۴ — فولاد/بتن، دیوار برشی سخت',
  5: '۵ — بتن مسلح، دیوار آجر/بلوک',
  6: '۶ — بنایی آجری',
}

export const HAZARD_TONE: Record<string, 'danger' | 'warning' | 'accent' | 'success'> = {
  'خیلی زیاد': 'danger',
  زیاد: 'warning',
  متوسط: 'accent',
  کم: 'success',
}
