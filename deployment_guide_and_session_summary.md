# 📌 بطاقة تعريف المشروع والمستودعات (جاهزة للنسخ في أي محادثة جديدة)

إذا أردت بدء محادثة جديدة مع الذكاء الاصطناعي، **انسخ النص التالي وضعه في بداية المحادثة**:

```markdown
### 🏢 سياق المشروع والمستودعات المرتبطة (Project Repositories Context):

هذا المشروع هو **نظام إدارة المصروفات وسندات الصرف** وينقسم إلى 3 مستودعات Git مربوطة بالمجلدات المحلية التالية:

1. 🌐 **مستودع الواجهة الأمامية (Frontend - Vercel)**:
   - **المجلد المحلي**: `prodaction/note-Expenses-frontend`
   - **المستودع على GitHub**: `https://github.com/hazim-ahmed/note-Expenses-frontend.git`
   - **الرابط الحي (Vercel)**: `https://note-expenses-frontend.vercel.app`
   - **التقنيات**: Next.js 14, Tailwind CSS, TypeScript, React Query.

2. ⚙️ **مستودع الواجهة الخلفية (Backend - Render)**:
   - **المجلد المحلي**: `prodaction/note-Expenses-backend`
   - **المستودع على GitHub**: `https://github.com/hazim-ahmed/note-Expenses-backend.git`
   - **الرابط الحي (Render)**: `https://note-expenses-backend.onrender.com`
   - **قاعدة البيانات**: PostgreSQL على Render.
   - **التقنيات**: Node.js, Express, Prisma ORM, ExcelJS, Puppeteer.

3. 📦 **المستودع الرئيسي الشامل (Monorepo - GitHub)**:
   - **المجلد المحلي**: مجلد المشروع الرئيسي `exoen_man` (يحتوي على `apps/api` و `apps/web` و `backend` و `frontend`)
   - **المستودع على GitHub**: `https://github.com/hazim-ahmed/hazem.git`

---
### 🔄 قاعدة المزامنة عند إجراء أي تعديل:
عند تعديل أي ملف في الفرونت إند أو الباك إند:
1. يتم نسخ الملفات المتطابقة بين `apps/` و المجلدات الفرعية و `prodaction/`.
2. يتم عمل `git push` لمستودع الإنتاج المطلوب داخل مجلد `prodaction/` لنشره تلقائياً على Vercel أو Render.
3. يتم عمل `git push` للمستودع الرئيسي في جذر المشروع `exoen_man`.
```

---

# 📚 دليل رفع ومزامنة المستودعات والملخص الشامل لجلسة العمل
**نظام إدارة المصروفات وسندات الصرف (Expense Management System)**
*التاريخ: 26 أغسطس 2026*

---

## 📑 الفهرس
1. [خريطة المجلدات والمستودعات التفصيلية](#1-خريطة-المجلدات-والمستودعات-التفصيلية)
2. [بيانات الاستضافة وقواعد البيانات الحية](#2-بيانات-الاستضافة-وقواعد-البيانات-الحية)
3. [دليل وأوامر رفع ومزامنة المستودعات (Git Workflow)](#3-دليل-وأوامر-رفع-ومزامنة-المستودعات-git-workflow)
4. [إعدادات وتكوينات منصات الاستضافة (Render & Vercel)](#4-إعدادات-وتكوينات-منصات-الاستضافة-render--vercel)
5. [الملخص الشامل لكافة الأعمال والتحسينات المنجزة](#5-الملخص-الشامل-لكافة-الأعمال-والتحسينات-المنجزة)
6. [إرشادات حل المشكلات الشائعة (Troubleshooting)](#6-إرشادات-حل-المشكلات-الشائعة-troubleshooting)

---

## 1. خريطة المجلدات والمستودعات التفصيلية

| المجلد المحلي على جهازك | المستودع على GitHub | منصة الاستضافة | وظيفة المجلد |
| :--- | :--- | :--- | :--- |
| **`prodaction/note-Expenses-frontend`** | `https://github.com/hazim-ahmed/note-Expenses-frontend.git` | **Vercel** (نشر تلقائي للفرونت إند) | كود الواجهة الأمامية المنفصل المخصص للإنتاج |
| **`prodaction/note-Expenses-backend`** | `https://github.com/hazim-ahmed/note-Expenses-backend.git` | **Render** (نشر تلقائي للباك إند) | كود الواجهة الخلفية المنفصل المخصص للإنتاج |
| **`exoen_man` (المجلد الرئيسي بالكامل)** | `https://github.com/hazim-ahmed/hazem.git` | **GitHub Monorepo** | المستودع الشامل الذي يحتوي على جميع التطبيقات والمجلدات |

### المجلدات الداخلية التابعة للمستودع الرئيسي (`hazem`):
- `apps/web/` و `frontend/`: نسخ كود الفرونت إند داخل المستودع الشامل.
- `apps/api/` و `backend/`: نسخ كود الباك إند داخل المستودع الشامل.

---

## 2. بيانات الاستضافة وقواعد البيانات الحية

* **الواجهة الأمامية (Frontend App)**:
  * الرابط الحي: [https://note-expenses-frontend.vercel.app](https://note-expenses-frontend.vercel.app)
  * المنصة: **Vercel**
  * الفرع المراقب: `main`
* **الواجهة الخلفية (Backend REST API)**:
  * الرابط الحي: [https://note-expenses-backend.onrender.com](https://note-expenses-backend.onrender.com)
  * المنصة: **Render (Web Service)**
  * الفرع المراقب: `main`
* **قاعدة البيانات (Production Database)**:
  * النوع: **PostgreSQL (Render Managed Database)**
  * اسم القاعدة: `note_expenses`
  * رابط الاتصال الداخلي على Render:
    `postgresql://hazem7755:zXuLBGpQsEkSZoDcz0i8lqZLsjZNqcTF@dpg-da5u8obtqb8s7393rj90-a/note_expenses`

---

## 3. دليل وأوامر رفع ومزامنة المستودعات (Git Workflow)

عند إجراء أي تعديل برمجي أو تحسين في التصميم، يتم تطبيق التعديل ومزامنته ورفعه على المستودعات الثلاثة باتباع الخطوات التالية:

### الخطوة 1: نسخ التعديلات بين مجلدات المشروع (PowerShell Sync)
```powershell
# نسخ ملفات الباك إند
Copy-Item apps/api/src/services/export.service.ts backend/src/services/export.service.ts
Copy-Item apps/api/src/services/export.service.ts prodaction/note-Expenses-backend/src/services/export.service.ts

# نسخ ملفات الفرونت إند
Copy-Item prodaction/note-Expenses-frontend/app/journals/[id]/page.tsx apps/web/app/journals/[id]/page.tsx
Copy-Item prodaction/note-Expenses-frontend/app/journals/[id]/page.tsx frontend/app/journals/[id]/page.tsx
Copy-Item prodaction/note-Expenses-frontend/app/globals.css apps/web/app/globals.css
Copy-Item prodaction/note-Expenses-frontend/app/globals.css frontend/app/globals.css
```

### الخطوة 2: الرفع على مستودع الفرونت إند (note-Expenses-frontend)
```powershell
git -C prodaction/note-Expenses-frontend add .
git -C prodaction/note-Expenses-frontend commit -m "feat: your update description"
git -C prodaction/note-Expenses-frontend push origin main
```
> بمجرد تنفيذ هذا الأمر، يقوم **Vercel** تلقائياً باكتشاف الالتزام وبناء النسخة الجديدة ونشرها خلال 60 ثانية.

### الخطوة 3: الرفع على مستودع الباك إند (note-Expenses-backend)
```powershell
git -C prodaction/note-Expenses-backend add .
git -C prodaction/note-Expenses-backend commit -m "feat: your update description"
git -C prodaction/note-Expenses-backend push origin main
```
> بمجرد تنفيذ هذا الأمر، يقوم **Render** تلقائياً بإعادة تشغيل أمر البناء والتشغيل `npm run build && npm start`.

### الخطوة 4: الرفع على المستودع الرئيسي الشامل (hazem)
```powershell
git add .
git commit -m "feat: sync all changes across workspace"
git push origin main
```

---

## 4. إعدادات وتكوينات منصات الاستضافة (Render & Vercel)

### إعدادات الباك إند على Render:
* **Root Directory**: فارغ (جذر المستودع)
* **Environment**: `Node`
* **Node Version**: `20.x` أو أعلى
* **Build Command**:
  ```bash
  npm install --include=dev && npx prisma generate && npm run build
  ```
* **Start Command**:
  ```bash
  npm start
  ```
* **Environment Variables**:
  * `DATABASE_URL`: رابط اتصال قاعدة بيانات PostgreSQL على Render.
  * `PORT`: `10000` (أو القيمة الافتراضية لـ Render).
  * `NODE_ENV`: `production`

### إعدادات الفرونت إند على Vercel:
* **Framework Preset**: `Next.js`
* **Build Command**: `npm run build` أو `next build`
* **Environment Variables**:
  * `NEXT_PUBLIC_API_URL`: `https://note-expenses-backend.onrender.com/api`

---

## 5. الملخص الشامل لكافة الأعمال والتحسينات المنجزة

خلال جلسة العمل الحالية، تم إنجاز وتطوير التالي بنجاح:

### 1. إصلاح أخطاء النشر على Render و Vercel:
* **Render**: تم حل مشكلة غياب مكتبات `exceljs` و `puppeteer` من ملف `package.json` في مستودع الباك إند، وحل مشكلة مسارات الاستيراد `@expense-system/shared` باستبدالها بمسارات نسبية تناسب بيئة الإنتاج الموحدة، مما جعل خادم الباك إند يعمل بنجاح بنسبة 100% (`Build successful & Service is live 🎉`).
* **Vercel**: تم تنظيف `package.json` الخاص بالفرونت إند من اعتمادات الـ Monorepo الداخلية (`workspace:*`) لتمرير البناء السحابي النظيف.

### 2. ترقية وتطوير تصدير ملفات Excel (.xlsx):
* إنشاء ملف Excel ثنائي حقيقي معتمد (`.xlsx`) تم توليده عبر مكتبة `exceljs`.
* توسيع الأعمدة لتشمل **15 حقلاً محاسبياً متكاملاً** (م، الرقم المرجعي، رقم السند، دفتر السند، التاريخ، المستفيد، التصنيف، المشروع/مركز التكلفة، طريقة الدفع، مرجع الدفع، رقم الفاتورة، حالة الفاتورة، البيان، الملاحظات، المبلغ).
* تنسيق الورقة من اليمين لليسار (`RTL`)، مع ترويسة كحلية أنيقة، وحدود خلايا واضحة، وتنسيق أرقام بفواصل الآلاف (`#,##0.00`)، وصف إجمالي مدمج ومبرز.

### 3. تطوير وضبط نموذج «دفتر المصروفات» للـ PDF والطباعة:
* **الاتجاه والمقاس**: مقاس `A4 Landscape` أفقي مع هوامش متوازنة `12mm - 15mm` لمنع خروج النصوص خارج حدود الصفحة.
* **الخطوط**: اعتماد خطوط عربية رسمية (`IBM Plex Sans Arabic`, `Noto Sans Arabic`, `Cairo`, `Tahoma`) متناسقة الأحجام.
* **الترويسة الرسمية**: ترويسة شركة متكاملة باليمين (اسم الشركة، إدارة الشؤون المالية، السجل التجاري، الرقم الضريبي)، وعنوان رسمي مبرز بالمنتصف: **« دفتر المصروفات »**، وجدول التاريخ ورقم الكشف باليسار.
* **ملخص الكشف المالي**: بطاقات مؤطرة أعلى الجدول توضح: الصندوق المالي، تاريخ الفترة، عدد السندات، وإجمالي المصروفات.
* **جدول المصروفات الرسمي**:
  * تصميم كلاسيكي أبيض وأسود نظيف (`Black & White Formal Design`) مع حدود واضحة بلون أسود دقيق.
  * إخفاء عمود "الإجراءات" وأزرار التعديل من الـ PDF والطباعة نهائياً (`print:hidden`).
  * تكرار رأس الجدول تلقائياً في كل صفحة عند تعدد الصفحات (`thead { display: table-header-group; }`).
  * منع انقسام صف المصروف الواحد عبر الصفحات (`page-break-inside: avoid;`).
  * استبدال الخلايا الفارغة برمز الشرطة المحاسبية `—`.
  * إخفاء بطاقة الملخص الملونة السفلية للويب من شاشة الطباعة.
* **تكبير خط المبالغ**: تكبير خط مبالغ السندات والإجمالي الكلي بالخط العريض (`font-black`) مع محاذاة يسارية للأرقام وفواصل الآلاف بالريال السعودي (`ر.س`).
* **تذييل التواقيع والاعتمادات**: إضافة خانتين رسميتين مغلقتين أسفل التقرير:
  1. **توقيع المشرف / المسؤول** (الاسم / التوقيع / التاريخ).
  2. **توقيع واعتماد الإدارة** (الاعتماد / الختم الرسمي / التاريخ).

---

## 6. إرشادات حل المشكلات الشائعة (Troubleshooting)

1. **ظهور نسخة قديمة في المتصفح بعد الرفع**:
   * قم بعمل تحديث إجباري للمتصفح بالضغط على **`Ctrl + Shift + R`** لتجاوز الكاش (Cache).
2. **عند إضافة مكتبة جديدة (npm package)**:
   * يجب تثبيتها داخل مجلد المشروع ومجلد الإنتاج المقابل في `prodaction/`، ثم رفع الـ `package.json` إلى GitHub لتقوم منصة الاستضافة بتثبيتها تلقائياً.
3. **عند تعديل بنية قاعدة البيانات (Prisma Schema)**:
   * قم بتشغيل الأمر:
     ```powershell
     npx prisma migrate dev --name <migration_name>
     npx prisma generate
     ```
   * وتأكد من تحديث `DATABASE_URL` برابط Render PostgreSQL.

---
*تم إنشاء هذا الدليل ليكون مرجعاً تقنياً دائماً للمشروع.* 🚀
