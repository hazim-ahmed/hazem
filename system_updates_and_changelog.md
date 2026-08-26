# 📑 التوثيق الشامل للتحديثات والإصلاحات البرمجية (System Updates & Changelog)

**تاريخ التوثيق:** 26 أغسطس 2026  
**المشروع:** نظام إدارة المصروفات وسندات الصرف واليومية العامة (`Daily Expenses Pro`)  
**المستودعات المرتبطة:**
- **Frontend (Vercel):** `https://github.com/hazim-ahmed/note-Expenses-frontend.git`
- **Backend (Render):** `https://github.com/hazim-ahmed/note-Expenses-backend.git`
- **Monorepo (GitHub):** `https://github.com/hazim-ahmed/hazem.git`

---

## 🎯 الفهرس العام للتحسينات المنجزة

1. [دمج وضبط شعار وأيقونة النظام (Branding & Icons)](#1-دمج-وضبط-شعار-وأيقونة-النظام)
2. [حل مشكلة تشغيل وتصدير ملفات PDF على خادم Render](#2-حل-مشكلة-تشغيل-وتصدير-ملفات-pdf-على-خادم-render)
3. [إضافة عمود وشارات طريقة الدفع (كاش / بنك) في PDF](#3-إضافة-عمود-وشارات-طريقة-الدفع-كاش--بنك-في-pdf)
4. [إصلاح مظهر الجداول والتفاف نصوص أسماء المشاريع الطويلة](#4-إصلاح-مظهر-الجداول-والتفاف-نصوص-أسماء-المشاريع-الطويلة)
5. [تطوير القائمة الجانبية التفاعلية (Collapsible Sidebar - shadcn/ui)](#5-تطوير-القائمة-الجانبية-التفاعلية-collapsible-sidebar)
6. [تثبيت السايد بار وعزل منطقة التمرير (Fixed Viewport Shell)](#6-تثبيت-السايد-بار-وعزل-منطقة-التمرير)
7. [سجل الالتزامات البرمجية (Git Commits Log)](#7-سجل-الالتزامات-البرمجية-git-commits-log)

---

## 1. دمج وضبط شعار وأيقونة النظام

### 📋 التعديلات المنجزة:
- **أيقونة الموقع والمفضلة (`Favicon` & `Apple Touch Icon`):**
  - تم ربط `logo-only.png` داخل [`layout.tsx`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/layout.tsx) كأيقونة مفضلة تدعم جميع المتصفحات والهواتف.
- **صفحة تسجيل الدخول (`app/login/page.tsx`):**
  - تكبير وتوضيح أيقونة الشعار (`w-28 h-28`) بتأثير زجاجي متناسق مع النمط الداكن والفاتح.
- **ترويسة الموقع والشريط العلوي (`Header.tsx`):**
  - إضافة شارة النظام المحدثة مع الشعار ومؤشر الاتصال النشط.
- **ترويسة القائمة الجانبية (`Sidebar.tsx`):**
  - ضبط أبعاد صندوق الشعار بدقة (`w-11 h-11`) مع خلفية واضحة ومتباينة وحواف دائرية أنيقة ومؤشر الحالة النشطة (🟢).

---

## 2. حل مشكلة تشغيل وتصدير ملفات PDF على خادم Render

### 🔍 تشخيص المشكلة:
- أظهرت سجلات Render ظهور الخطأ:
  `Error: Could not find Chrome ... you did not perform an installation before running the script (e.g. npx puppeteer browsers install chrome)`
  حيث كانت أداة `Puppeteer` تفشل في العثور على متصفح Chrome في بيئة Linux السحابية، بالإضافة إلى فشل قراءة مسارات ملفات الشعار من القرص.

### 🛠️ الحل الجذري المطبق:
1. **تثبيت كاش Puppeteer على Render:**
   - إنشاء ملف التكوين [`.puppeteerrc.cjs`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/prodaction/note-Expenses-backend/.puppeteerrc.cjs):
     ```javascript
     const { join } = require('path');
     module.exports = {
       cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
     };
     ```
2. **تثبيت Chrome تلقائياً أثناء البناء:**
   - تحديث أوامر [`package.json`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/prodaction/note-Expenses-backend/package.json):
     ```json
     "build": "npx puppeteer browsers install chrome && tsc",
     "postinstall": "prisma generate && npx puppeteer browsers install chrome"
     ```
3. **تضمين الشعار كثابت Base64 مدمج بالكود:**
   - إنشاء [`logo.constant.ts`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/services/logo.constant.ts) يحتوي على ثابت `LOGO_BASE64` واستدعاؤه مباشرة في ترويسة تقارير PDF دون أي اعتماد على مسارات القرص.
4. **تفعيل وسائط التشغيل السحابية الآمنة:**
   - إضافة خيارات `--no-sandbox` و `--disable-dev-shm-usage` و `--single-process` في [`export.service.ts`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/services/export.service.ts).

---

## 3. إضافة عمود وشارات طريقة الدفع (كاش / بنك) في PDF

### 📋 ما تم تطبيقه في تقرير اليومية الرسمية:
- إضافة عمود جديد **`طريقة الدفع`** يقرأ البيانات بدقة من قاعدة البيانات ويحولها إلى شارات واضحة:
  - 🟢 **كاش:** للمدفوعات النقدية (`badge-cash`).
  - 🔵 **بنك:** للتحويلات البنكية، الشيكات، وبطاقات الدفع (`badge-bank`).
- **ترتيب الأعمدة الـ 11 في جدول التقرير المحاسبي:**
  1. `#` (م)
  2. `تاريخ المصروف`
  3. `بيان المصروف`
  4. `المستفيد`
  5. `التصنيف`
  6. `مركز التكلفة (المشروع)`
  7. **`طريقة الدفع`**
  8. `رقم السند`
  9. `رقم الفاتورة`
  10. `المبلغ`
  11. `الملاحظات`
- تحديث دالة صف الإجمالي الكلي (`total-row`) مع توسيع دمج الخلايا (`colspan="9"`).

---

## 4. إصلاح مظهر الجداول والتفاف نصوص أسماء المشاريع الطويلة

### 🔍 تشخيص المشكلة:
- عند وجود اسم مشروع مركب من عدة كلمات (مثل *"مجمع النورس"* أو *"مشروع برج الأندلس"* )، كان نص الشارة يلتف رأسياً إلى سطرين داخل الخلية وينقص السطر الأول بسبب صغر العرض وعدم تثبيت خاصية منع الالتفاف.

### 🛠️ الحل المطبق:
- **تطبيق `whitespace-nowrap` و `inline-flex`:** على شارات المشاريع وطرق الدفع وأسماء المستفيدين والمبالغ.
- **تحديد حد أدنى لعرض الجدول (`min-w-[1050px]`):** داخل [`dashboard/page.tsx`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/dashboard/page.tsx) و [`journals/[id]/page.tsx`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/journals/%5Bid%5D/page.tsx) لضمان اتساع كل عمود براحة تامة وتفعيل التمرير الأفقي السلس عند الشاشات الصغيرة.
- **إضافة نقطة تمييزية ملونة:** بجانب اسم المشروع في الشارة لتحسين القراءة والمظهر الجمالي.

---

## 5. تطوير القائمة الجانبية التفاعلية (Collapsible Sidebar)

تم تطبيق مواصفات مكتبة **shadcn/ui Aria Sidebar** القياسية مع المحافظة على الهوية الأصلية:

### ✨ المزايا المضافة:
1. **اختصار لوحة المفاتيح الفوري (`Ctrl + B` / `Cmd + B`):**
   - إمكانية فتح وإغلاق السايد بار من أي صفحة بضغطة زر.
2. **سكة الحافة التفاعلية (`SidebarRail`):**
   - خط تفاعلي ناعم على طرف السايد بار يضيء عند تمرير الفأرة ويمكن النقر عليه لتوسيع/تصغير القائمة.
3. **أزرار التبديل:**
   - زر مدمج في ترويسة السايد بار (`SidebarHeader`).
   - زر سريع في الشريط العلوي (`Header.tsx`).
4. **حفظ حالة العرض تلقائياً (`localStorage`):**
   - يتم حفظ حالة القائمة (سواء كانت مصغرة `w-20` أو موسعة `w-64`) واستعادتها تلقائياً عند إعادة فتح المتصفح.
5. **إصلاح التوهج في الوضع الداكن ومنع اقتصاص العناوين:**
   - استبدال التدرج الفاتح القديم بخلفية داكنة موحدة (`dark:bg-slate-950`).
   - تثبيت نصوص العناوين `نظام المصروفات` و `سندات الصرف واليومية Pro` بدون نقاط اختصار `...`.

---

## 6. تثبيت السايد بار وعزل منطقة التمرير (Fixed Viewport Shell)

### 🔍 تشخيص المشكلة:
- عند فتح صفحة بها جدول طويل أو بيانات كثيرة، كان السايد بار يتمدد رأسياً للأسفل وتنزلق بطاقة الحساب الشخصي خارج الشاشة مع تمرير الصفحة.

### 🛠️ الحل المطبق:
1. **قفل ارتفاع الإطار الخارجي (`h-screen overflow-hidden`):**
   - تعديل [`DashboardLayout.tsx`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/components/layout/DashboardLayout.tsx) ليصبح ارتفاع الشاشة ثابتاً ومقيداً بنافذة العرض.
2. **تثبيت السايد بار بالكامل (`sticky top-0 h-screen overflow-hidden`):**
   - السايد بار أصبح ثابتاً في مكانه ولا يتأثر مطلقاً بتمرير المحتوى.
3. **عزل منطقة التمرير للمحتوى فقط (`main flex-1 min-h-0 overflow-y-auto`):**
   - عند التمرير لأسفل (Scroll)، يتحرك محتوى الصفحة الداخلي فقط (الجداول والسندات)، بينما تظل بطاقة الحساب وترويسة السايد بار ثابتة ومرئية في مكانها دائماً.

---

## 7. سجل الالتزامات البرمجية (Git Commits Log)

| المستودع (Repo) | رقم الالتزام (Commit Hash) | وصف الالتزام |
|---|---|---|
| **Backend** | `80ebf41` | `fix: embed static LOGO_BASE64 constant directly in PDF export header` |
| **Backend** | `b802e0b` | `fix: configure puppeteer cache for Render and auto install chrome in build script` |
| **Backend** | `9d4cf7b` | `feat: add payment method column (bank/cash) with styled badge in PDF export` |
| **Frontend** | `7b78b85` | `fix: prevent bad text wrapping on project badge and optimize table cells` |
| **Frontend** | `61e9515` | `feat: add sidebar expand and collapse toggle with localStorage persistence` |
| **Frontend** | `f137bce` | `fix: remove dark mode gradient glare and prevent text truncation in sidebar header` |
| **Frontend** | `77a18bd` | `feat: implement shadcn aria sidebar patterns with Ctrl+B shortcut and SidebarRail` |
| **Frontend** | `dbdc442` | `fix: lock viewport height and make sidebar permanently fixed with sticky footer` |
| **Monorepo** | `8ba8c21` | `fix: lock viewport height and make sidebar permanently fixed with sticky footer` |

---

> ✅ **الحالة الحالية:** جميع المستودعات محدثة ومزامنة مع **GitHub** و **Vercel** و **Render** بنجاح 100%.
