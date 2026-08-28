# 📘 التوثيق الشامل للباك إند وآلية المزامنة الآلية للمستودعات
**نظام إدارة المصروفات وسندات الصرف (Expense Management System)**
*التاريخ: 28 أغسطس 2026*

---

## 📑 الفهرس
1. [نظرة عامة على معمارية الباك إند](#1-نظرة-عامة-على-معمارية-الباك-إند)
2. [تقنيات العمل والمكتبات المستخدمة](#2-تقنيات-العمل-والمكتبات-المستخدمة)
3. [تحليل قاعدة البيانات والكيانات (Prisma Data Models)](#3-تحليل-قاعدة-البيانات-والكيانات-prisma-data-models)
4. [نظام الأمن والصلاحيات (Security & RBAC)](#4-نظام-الأمن-والصلاحيات-security--rbac)
5. [المحرك المالي واليومية الآلية (Financial & Auto-Journal Engine)](#5-المحرك-المالي-واليومية-الآلية-financial--auto-journal-engine)
6. [محرك التقارير السبعة والتصدير الثنائي (Reporting & Export Engine)](#6-محرك-التقارير-السبعة-والتصدير-الثنائي-reporting--export-engine)
7. [جدول المسارات والنقاط الانتهائية (API Endpoints Map)](#7-جدول-المسارات-والنقاط-الانتهائية-api-endpoints-map)
8. [توثيق المرحلة الأولى: المزامنة الآلية للمستودعات (Stage 1 Automation)](#8-توثيق-المرحلة-الأولى-المزامنة-الآلية-للمستودعات-stage-1-automation)

---

## 1. نظرة عامة على معمارية الباك إند

يعتمد الباك إند على معمارية **Monorepo** مساق بواسطة `pnpm workspaces` ومبني بنظام طبقات نظيف (Layered Architecture):

- **المسار الرئيسي للخدمة:** [`apps/api`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api)
- **الحزمة المشتركة:** [`packages/shared`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/packages/shared)
- **مبدأ الفصل بين المسؤوليات (Separation of Concerns):**
  - **Controllers:** استقبال الطلبات وتدقيق المدخلات والمخرجات.
  - **Services:** تنفيذ المنطق المحاسبي والتجاري (Business & Financial Logic).
  - **Middleware:** إدارة الأمان، المصادقة JWT، والتحقق من الصلاحيات والتحكم بالأخطاء.
  - **Prisma ORM:** استعلامات قاعدة البيانات بشكل Type-Safe وآمن.

---

## 2. تقنيات العمل والمكتبات المستخدمة

| المجال | التقنية / المكتبة | الوظيفة في النظام |
| :--- | :--- | :--- |
| **البيئة واللغة** | Node.js (v20+) + TypeScript 5.4 | بيئة التشغيل ولغة البرمجة الأساسية |
| **إطار العمل** | Express.js v4.19 | إدارة مسارات الـ RESTful API |
| **قاعدة البيانات و ORM** | MySQL 8.x (Local) / PostgreSQL (Render) + Prisma ORM v5.14 | بناء المخطط والهجرات والاستعلامات |
| **الأمان والحماية** | JWT + bcrypt + Helmet + express-rate-limit | الجلسات، تشفير كلمات المرور، وحماية الـ Rates والـ Headers |
| **تصدير PDF** | Puppeteer v25.9 | محرك المتصفح الخفي لتوليد تقارير PDF من صفحات HTML/CSS مع الهوية البصرية |
| **تصدير Excel** | ExcelJS v4.4 | إنشاء شيتات إكسل مخصصة بدعم العربي RTL والتنسيق الشرطي والألوان |
| **التوثيق (API Docs)** | Swagger UI Express | توثيق الـ APIs تفاعلياً على `/api-docs` |
| **السجلات والتتبع** | Winston Logger | تسجيل الأحداث والتنبيهات والأخطاء التشغيلية |

---

## 3. تحليل قاعدة البيانات والكيانات (Prisma Data Models)

المخطط الأساسي موثق بملف [`schema.prisma`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/prisma/schema.prisma):

### أ. المستخدمون والأمان (RBAC & User Access Scoping)
- `User`: حسابات المستخدمين مع الحالة التشغيلية وإجبارية تغيير كلمة المرور.
- `Role` & `Permission` & `RolePermission` & `UserRole`: أدوار النظام (`ADMIN`, `CASHIER`, `ACCOUNTANT`, `MANAGER`, `VIEWER`) مع الصلاحيات التفصيلية.
- `UserProject`: تحديد مستوى وصول المستخدم لمشاريع محددة (`VIEW`, `CREATE_EXPENSES`, `MANAGE_EXPENSES`, `APPROVE_EXPENSES`).
- `UserCashbox`: تحديد الصناديق والخزن المسموح للمستخدم التعامل معها وصلاحياته الشفافة عليه (`canOpenJournal`, `canCreateTransaction`, إلخ).

### ب. البيانات الأساسية (Master Data)
- `Cashbox`: صناديق الخزينة والمصروفات النثرية مع أمين الخزينة (`custodianUserId`).
- `ExpenseCategory`: هيكل تصنيفات المصروفات الشجري (Parent-Child) والكود المحاسبي وربط الإجبارية بالمشاريع أو الفواتير.
- `PaymentMethod`: طرق الدفع (نقداً، تحويل بنكي، شبكة) مع اشتراط مرجع العملية.
- `Beneficiary`: المستفيدون والموردون مع البيانات الضريبية (الرقم الضريبي والسجل التجاري) والبنكية.
- `Project` & `ProjectUnit`: المشاريع الانشائية/العقارية والوحدات التابعة ومراكز التكلفة.

### ج. المحرك المالي (Financial Core)
- `ExpenseJournal`: دفاتر اليومية اليومية لكل صندوق نقدية مع الرصيد الافتتاحي والحالات (`OPEN`, `SUBMITTED`, `APPROVED`, `CLOSED`).
- `ExpenseTransaction`: سند الصرف المالي الرئيسي مع المرجع الآلي الفريد `systemReference` ورقم السند اليدوي وحالة الفاتورة (`ISSUED`, `PENDING`, `NOT_REQUIRED`).

### د. المرفقات وسجل التدقيق (Audit Trail)
- `ExpenseApproval`: سجل إجراءات الاعتماد والرفض والملاحظات للمستويات المعتمدة.
- `AuditLog`: سجل تدقيق شامل يسجل التغيرات قبل وبعد التعديل (`oldValues` / `newValues`) مع الـ IP والـ UserAgent.
- `TransactionAttachment`: ملفات ومرفقات سندات الصرف.

---

## 4. نظام الأمن والصلاحيات (Security & RBAC)

يتم تأمين كافة طلبات الباك إند بواسطة هيدر `Authorization: Bearer <token>`:
1. **`authenticateJWT`:** يتأكد من صحة الرمز وعدم تعطيل حساب المستخدم، ويرفق بيانات الدور والمستجلبة من الجلسة في `req.user`.
2. **`requirePermission(permissionCode)`:** يتحقق من امتلاك المستخدم للصلاحية المطلوبة قبل تنفيذ الكنترولر (مع تخطي الصلاحيات التلقائي للـ ADMIN).

---

## 5. المحرك المالي واليومية الآلية (Financial & Auto-Journal Engine)

يتولى [`TodayController`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/controllers/today.controller.ts) تقديم واجهة عملية لليومية الحالية:
- إنشاء وقراءة دفتر اليومية لليوم الحالي تلقائياً دون حاجة الصراف لفتح الدفتر يدوياً.
- إمكانية إضافة سند مصروف سريع مرتبط مباشرة بالدفتر المفتوح لليوم.

---

## 6. محرك التقارير السبعة والتصدير الثنائي (Reporting & Export Engine)

يحتوي النظام في [`ReportController`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/controllers/report.controller.ts) على **7 تقارير مخصصة**:

1. **تقرير المصروفات اليومية (Daily Expenses):** متابعة حركات اليومية والصندوق.
2. **تقرير المصروفات حسب المشروع (Expenses By Project):** ربط المصروفات بالمشاريع والوحدات ومراكز التكلفة.
3. **تقرير المصروفات حسب المستفيد (Expenses By Beneficiary):** كشوفات حركات الموردين والمستفيدين.
4. **تقرير المصروفات حسب التصنيف (Expenses By Category):** توزيع المصروفات حسب التصنيفات.
5. **تقرير السندات بدون مشروع (Unassigned Transactions):** حصر السندات المعلقة لإسنادها بالجملة (`bulkAssignProject`).
6. **تقرير الفواتير المعلقة (Pending Invoices):** متابعة السندات التي تنتظر تقديم الفاتورة.
7. **تقرير السندات اليدوية (Manual Vouchers):** مطابقة حركات السندات اليدوية وسجلات الدفاتر.

---

## 7. جدول المسارات والنقاط الانتهائية (API Endpoints Map)

- `/api/v1/auth/*`: المصادقة والـ Login وحالة الجلسة.
- `/api/v1/today/*`: محرك اليومية التلقائي وتدفق حركات اليوم.
- `/api/v1/journals/*`: إدارة دفاتر اليومية (إغلاق، اعتماد، إعادة فتح، تصدير).
- `/api/v1/expense-transactions/*`: إنشاء وتعديل وإلغاء واعتماد ورفض وتنسيق المشاريع بالجملة والمرفقات.
- `/api/v1/projects/*`: المشاريع والوحدات والملخص المالي.
- `/api/v1/users/*`: المستخدمون وإدارتهم والأدوار والربط.
- `/api/v1/beneficiaries/*`: دليل المستفيدين.
- `/api/v1/expense-categories/*`: دليل تصنيفات المصروفات.
- `/api/v1/cashboxes/*`: دليل الخزن والصناديق.
- `/api/v1/reports/*`: التقارير المالية الـ 7 والتصدير لـ PDF/Excel.
- `/api/v1/audit-logs/*`: سجلات المراقبة والتدقيق.

---

## 8. توثيق المرحلة الأولى: المزامنة الآلية للمستودعات (Stage 1 Automation)

تم بناء وتطبيق نظام مزامنة آلي بين مجلدات التطوير ومجلدات الإنتاج المربوطة بمستودعات GitHub الحية:

### الملفات التي تم إنشاؤها:
1. **[`scripts/sync-repos.js`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/scripts/sync-repos.js):**
   - محرك Node.js خفيف ينقل التغيرات من `apps/api` إلى `backend/` وإلى `prodaction/note-Expenses-backend`.
   - ينقل التغيرات من `apps/web` إلى `frontend/` وإلى `prodaction/note-Expenses-frontend`.
   - يستثني تلقائياً `node_modules` و `.git` و `.next` و `dist` والملفات المؤقتة.

2. **[`sync-repos.ps1`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/sync-repos.ps1):**
   - سكريبت PowerShell لتشغيل المزامنة وعرض ملخص `git status` لكافة المستودعات الثلاثة بنقرة واحدة.

3. **تحديث [`package.json`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/package.json):**
   - إضافة الأمر `npm run sync` لسهولة التنفيذ من أي ترمينال.

### كيفية التشغيل للمزامنة:
```bash
# تشغيل المزامنة عبر npm
npm run sync

# أو عبر pnpm
pnpm sync

# أو تشغيل سكريبت PowerShell
.\sync-repos.ps1
```

---

## 9. توثيق المرحلة الثانية: التوافق المزدوج لقواعد البيانات (Stage 2: Database Compatibility)

تم تطبيق الآلية الذكية للتوافق التلقائي لقواعد البيانات المحلية والإنتاجية:

1. **الوضع التوافقي (MySQL vs PostgreSQL):**
   - بيئة التطوير المحلية (`apps/api`) تستخدم محرّك **MySQL 8.x**.
   - بيئة الإنتاج على Render (`prodaction/note-Expenses-backend`) تستخدم محرك **PostgreSQL**.

2. **محول المخطط الآلي (Automatic Schema Adapter):**
   - تم تطوير سكريبت [`scripts/sync-repos.js`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/scripts/sync-repos.js) بحيث ينسخ المخطط [`schema.prisma`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/prisma/schema.prisma) وفي نفس الوقت يقوم بتحويل حقل الـ `provider` تلقائياً إلى `"postgresql"` لمستودع الإنتاج و `"mysql"` للمستودع المحلي.
   - هذا يمنع أي عطل أو خطأ تشغيلي عند رفع المخطط إلى Render دون الحاجة للتعديل اليدوي على ملف `schema.prisma`.

3. **تسلسل الأرقام الكبيرة (BigInt Serialization):**
   - التأكد من استمرارية عمل معالج الـ JSON الخاص بـ BigInt بداخل [`apps/api/src/utils/prisma.ts`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/utils/prisma.ts) لضمان إرسال معُرفات الكيانات بدقة وبدون فقدان عبر الاستجابات لجميع أنواع قواعد البيانات.

---

## 10. توثيق المرحلة الثالثة: نظام الإشعارات والبريد الإلكتروني (Stage 3: Notification & Email Engine)

تم إنشاء وتضمين نظام إشعارات آلي وغير متزامن (Asynchronous Non-Blocking Engine):

1. **إعدادات وتكوين الإشعارات ([`apps/api/src/config/index.ts`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/config/index.ts)):**
   - إضافة قسم `config.email` لدعم إعدادات SMTP وخوادم البريد الإلكتروني مع إمكانية التفعيل/التعطيل عبر المتغير `EMAIL_NOTIFICATIONS_ENABLED`.

2. **خدمة الإشعارات المخصصة ([`apps/api/src/services/notification.service.ts`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/services/notification.service.ts)):**
   - تعمل الخدمة في الخلفية باستخدام `setImmediate` لمنع أي تأخير في الاستجابة المالية للـ APIs.
   - تقوم بالربط مع المستخدم وإرسال بريد إلكتروني وسجلات تدقيقية آلياً عند الأحداث المهمة:
     - **اعتماد سند الصرف:** إرسال إشعار لمنشئ السند برقم المرجع والمبلغ.
     - **رفض سند الصرف:** إشعار منشئ السند مع سبب الرفض المكتوب.
     - **إغلاق اليومية:** إشعار مُعد اليومية بإغلاق دفتر الصندوق بكتلة موثوقة.

3. **الربط مع الخدمات الحسابية:**
   - تم ربط إطلاق الإشعارات تلقائياً بداخل [`TransactionService`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/services/transaction.service.ts) و [`JournalService`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/services/journal.service.ts).

---

## 11. توثيق المرحلة الرابعة: إلغاء التوكن وإدارة الجلسات والأمان المتقدم (Stage 4: JWT Revocation & Security Enhancements)

تم تعزيز أمان نظام الجلسات والمصادقة وإضافة خدمة إلغاء التوكنات:

1. **خدمة القائمة السوداء للتوكنات ([`TokenBlacklistService`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/services/tokenBlacklist.service.ts)):**
   - تم بناء خدمة مخصصة لإدراج التوكنات الملغاة (Revoked Tokens) مع تتبع تاريخ الانتهاء الاصلي للتوكن (TTL).
   - تحتوي على تنظيف دوري آلي (Garbage Collection) للمفاتيح المنتهية لتفادي أي استهلاك زائد للذاكرة.

2. **الربط مع مسار تسجيل الخروج ([`AuthController.logout`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/controllers/auth.controller.ts)):**
   - عند طلب `/auth/logout` يتم استخراج توكن الجلسة (Bearer Token) و `refreshToken` فوراً وتسجيلهما كـ Revoked، مما يلغي إمكانية إعادة استخدام الرمز من أي مكان.

3. **حماية الـ Middleware ([`auth.middleware.ts`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/middleware/auth.middleware.ts)):**
   - إضافة فحص مبدئي سريع قبل فك تشفير التوكن؛ في حال كان التوكن ملغياً يتم رفض الطلب فوراً باستجابة `401 Unauthorized` ورمز الخطأ `UNAUTHORIZED`.

---

## 12. توثيق المرحلة الخامسة: نظام النسخ الاحتياطي التلقائي لقاعدة البيانات (Stage 5: Automated Database Backup Engine)

تم بناء نظام مخصص للنسخ الاحتياطي لقواعد البيانات وحفظ سلف البيانات المالية:

1. **محرك النسخ الاحتياطي ([`BackupService`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/services/backup.service.ts)):**
   - ينشئ لقطات JSON كاملة لكافة جداول النظام الرئيسية والمالية (المستخدمون، الخزن، المشاريع، التصنيفات، المستفيدون، اليوميات، وسندات الصرف المعتمدة).
   - يحفظ النسخ في المجلد المخصص `backups/` مع أختام زمنية فريدة.
   - يتضمن إدارةRetention أوتوماتيكية تعتمد الاحتفاظ بآخر 15 نسخة احتياطية وحذف النسخ القديمة لتوفير المساحة.
   - يحتوي على مؤقت دوري يومي (`Automated Daily Backup Cron/Timer`) يعمل تلقائياً بداخل الباك إند.

2. **التحكم بالنسخ الاحتياطية ([`BackupController`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/controllers/backup.controller.ts)):**
   - مسار الإنشاء الفوري للمسؤولين: `POST /api/v1/system/backups` (يتطلب دور `ADMIN`).
   - مسار استعراض وقراءة النسخ: `GET /api/v1/system/backups` (يتطلب دور `ADMIN`).

---

## 13. توثيق المرحلة السادسة: توسيع تغطية الاختبارات الآلية (Stage 6: Integration Tests Expansion)

تم توسيع مجموعة اختبارات التكامل الآلية (Vitest Test Suite):

1. **حزمة اختبارات الأمان والنسخ والتقارير ([`apps/api/tests/security_and_features.test.ts`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/tests/security_and_features.test.ts)):**
   - **اختبار إلغاء التوكنات:** التأكد من فاعلية `TokenBlacklistService` وتحديث حالة الرمز مباشرة عند حظره.
   - **اختبار محرك النسخ الاحتياطي:** التحقق من قدرة `BackupService` على توليد ملفات اللقطات وتحديث قائمة النسخ الاحتياطية.
   - **اختبار مسارات الأدمن:** فحص مسارات `/api/v1/system/backups` للتأكد من حصر الصلاحيات للـ `ADMIN`.
   - **اختبار هجائن التقارير:** التأكد من سلامة مخرجات الـ API لتقارير المصروفات اليومية والمشاريع والسندات المعلقة.

2. **تحديث المزامنة:**
   - تم تضمين مجلد `tests/` في عملية المزامنة الحية عبر `scripts/sync-repos.js` لتحديث كافة البيئات ومستودع Render تلقائياً.

---

## 14. توثيق المرحلة السابعة (الأخيرة): الفحص التشغيلي الشمولي والتكامل التوثيقي (Stage 7: Deep Diagnostics & Swagger Specs)

تم استكمال وتوثيق الجاهزية التشغيلية للباك إند بالكامل:

1. **نقطة الفحص التشغيلي المتقدمة ([`HealthController`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/controllers/health.controller.ts)):**
   - المسار `/health/deep`: يقيس جودة وسرعة استجابة قاعدة البيانات (`Database Latency`) واستهلاك الذاكرة (RSS & Heap Memory) وزمن التشغيل المترامي (`Uptime`).
   - تعيد استجابة حالة `503 Service Unavailable` في حال وجود خلل اتصال في قاعدة البيانات لحماية الخوادم.

2. **تحديث التوثيق التفاعلي Swagger ([`apps/api/src/config/swagger.ts`](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/config/swagger.ts)):**
   - إضافة كافة مسارات المرحلة الخامسة والسادسة والسابعة (النسخ الاحتياطي، إلخ) على الصفحة التفاعلية `/api-docs`.

---
*تم إنجاز وتحديث كافة المراحل السبعة بنجاح كامل.*






