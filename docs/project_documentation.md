# 📋 توثيق مشروع نظام إدارة المصروفات (Expense Management System)

**تاريخ التوثيق:** 22 أغسطس 2026  
**المسار:** `c:\Users\Silver_Bullet\Desktop\exoen_man`

---

## 🗺️ نظرة عامة على المشروع

نظام متكامل لإدارة المصروفات اليومية وسندات الصرف للشركات العقارية والإنشائية، بنية **Monorepo** تضم ثلاثة تطبيقات:

| التطبيق | التقنية | الوصف |
|---------|---------|-------|
| `apps/api` | Node.js + Express + TypeScript + Prisma + MySQL | الـ Backend REST API |
| `apps/web` | Next.js 14 App Router + Tailwind CSS | لوحة التحكم الويب (عربي RTL) |
| `app/` | Flutter (هيكل أساسي فقط) | تطبيق الجوال المستقبلي |

---

## 🏗️ البنية المعمارية

```
exoen_man/
├── apps/
│   ├── api/                   ← Backend (Port: 4000)
│   │   ├── src/
│   │   │   ├── app.ts         ← Entry Point
│   │   │   ├── config/        ← إعدادات البيئة + Swagger
│   │   │   ├── controllers/   ← 12 controller
│   │   │   ├── services/      ← 11 service (Business Logic)
│   │   │   ├── routes/        ← index.ts (جميع المسارات)
│   │   │   ├── middleware/    ← auth + error + upload
│   │   │   └── utils/         ← prisma + logger + response + date
│   │   ├── prisma/
│   │   │   ├── schema.prisma  ← 14 نموذج بيانات
│   │   │   └── seed.ts        ← بيانات تجريبية
│   │   └── tests/             ← Vitest + Supertest
│   │
│   └── web/                   ← Frontend (Port: 3000)
│       ├── app/               ← 14 صفحة + صفحات فرعية
│       ├── components/layout/ ← DashboardLayout, Header, Sidebar
│       ├── context/           ← AuthContext.tsx
│       └── lib/               ← axios.ts + providers.tsx
│
├── packages/shared/           ← أنواع مشتركة (TypeScript)
├── docker-compose.yml         ← MySQL 8 + phpMyAdmin
└── postman_collection.json    ← مجموعة اختبار API
```

---

## 🗄️ قاعدة البيانات (MySQL 8.x + Prisma ORM)

### نماذج البيانات (14 نموذج)

#### المجموعة 1: المستخدمون والصلاحيات (RBAC)

| النموذج | الجدول | الوصف |
|---------|--------|-------|
| `User` | `users` | المستخدمون - id, username, fullName, email, phone, passwordHash, status |
| `Role` | `roles` | الأدوار: ADMIN, CASHIER, ACCOUNTANT, MANAGER, VIEWER |
| `Permission` | `permissions` | الصلاحيات (code مثل: projects.create) |
| `RolePermission` | `role_permissions` | ربط الأدوار بالصلاحيات |
| `UserRole` | `user_roles` | ربط المستخدمين بأدوارهم |

#### المجموعة 2: ربط المستخدمين بالمشاريع والصناديق

| النموذج | الجدول | الوصف |
|---------|--------|-------|
| `UserProject` | `user_projects` | وصول المستخدم للمشاريع (accessLevel: VIEW/CREATE/MANAGE/APPROVE/FULL_ACCESS) |
| `UserCashbox` | `user_cashboxes` | صلاحيات المستخدم على الصناديق |

#### المجموعة 3: البيانات الأساسية (Master Data)

| النموذج | الجدول | الوصف |
|---------|--------|-------|
| `SystemSetting` | `system_settings` | إعدادات النظام (key-value) |
| `Cashbox` | `cashboxes` | الصناديق المالية (code, name, branchName, custodian) |
| `PaymentMethod` | `payment_methods` | طرق الدفع (CASH, BANK_TRANSFER, إلخ) |
| `ExpenseCategory` | `expense_categories` | تصنيفات المصروفات (هيكل شجري، requiresProject, requiresInvoice) |

#### المجموعة 4: المشاريع

| النموذج | الجدول | الوصف |
|---------|--------|-------|
| `Project` | `projects` | المشاريع (projectCode, projectName, costCenterCode, estimatedBudget, status) |
| `ProjectUnit` | `project_units` | الوحدات العقارية (unitNumber, unitType, buildingNumber, floorNumber, status) |

#### المجموعة 5: المستفيدون

| النموذج | الجدول | الوصف |
|---------|--------|-------|
| `Beneficiary` | `beneficiaries` | المستفيدون (COMPANY/INDIVIDUAL, taxNumber, commercialRegistration, IBAN) |

#### المجموعة 6: المحرك المالي

| النموذج | الجدول | الوصف |
|---------|--------|-------|
| `ExpenseJournal` | `expense_journals` | اليوميات (journalNumber, journalDate, cashboxId, status: OPEN/CLOSED) |
| `ExpenseTransaction` | `expense_transactions` | السندات (systemReference: EXP-YYYY-XXXXXX, amount, status: DRAFT/APPROVED/CANCELLED) |
| `TransactionAttachment` | `transaction_attachments` | المرفقات (filePath, mimeType, fileSize) |

#### المجموعة 7: الاعتمادات والمراجعة

| النموذج | الجدول | الوصف |
|---------|--------|-------|
| `ExpenseApproval` | `expense_approvals` | سجل الاعتمادات (approvalLevel, action, comments) |
| `AuditLog` | `audit_logs` | سجل التغييرات الكامل (entityType, action, oldValues, newValues, ipAddress) |

---

## 🔧 الـ Backend (API) — تحليل تفصيلي

### المكدس التقني

```
Node.js + Express 4.x + TypeScript 5.x
Prisma ORM 5.x → MySQL 8.x
JWT (Access + Refresh Tokens)
Bcrypt (تشفير كلمات المرور)
Multer (رفع الملفات)
Swagger UI (توثيق API)
Winston (Logging)
Zod (التحقق من البيانات)
Helmet + CORS + Rate Limiting (الأمان)
Vitest + Supertest (الاختبارات)
```

### نقاط الـ API (REST Endpoints) — `/api/v1/`

#### 1. المصادقة (Auth)

| الطريقة | المسار | الوصف | مصادقة |
|---------|--------|-------|--------|
| POST | `/auth/login` | تسجيل الدخول | لا |
| POST | `/auth/refresh` | تجديد Access Token | لا |
| POST | `/auth/logout` | تسجيل الخروج | لا |
| GET | `/auth/me` | بيانات المستخدم الحالي | نعم |

#### 2. يومية اليوم التلقائية (Today's Journal Engine)

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/today` | ملخص اليوم (إجماليات، حالة اليومية، تاريخ الخادم بتوقيت السعودية) |
| GET | `/today/transactions` | قائمة مصروفات يومية اليوم |
| POST | `/today/transactions` | إضافة مصروف جديد لليومية التلقائية |
| PATCH | `/today/transactions/:id` | تعديل مصروف (يتحقق من حالة اليومية) |
| DELETE | `/today/transactions/:id` | حذف مصروف (soft delete - يضبط deletedAt) |

#### 3. اليوميات (Journals Archive)

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/journals` | قائمة جميع اليوميات مع auto-close للسابقة |
| GET | `/journals/:id` | تفاصيل يومية محددة مع السندات |
| POST | `/journals/:id/close` | إغلاق يومية يدوياً |
| POST | `/journals/:id/reopen` | إعادة فتح يومية مغلقة |

#### 4. المشاريع (Projects)

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/projects` | قائمة المشاريع (فلتر: search, status, activeOnly) |
| POST | `/projects` | إنشاء مشروع جديد (مع AuditLog) |
| GET | `/projects/:id` | تفاصيل مشروع + وحداته + مصروفاته (آخر 20) |
| PATCH | `/projects/:id` | تعديل بيانات المشروع |
| PATCH | `/projects/:id/status` | تغيير حالة المشروع (ACTIVE/SUSPENDED/ARCHIVED) |

> **ملاحظة:** دوال إدارة الوحدات العقارية موجودة في `project.service.ts` لكنها غير مُسجلة في `routes/index.ts`

#### 5. المستخدمون (Users)

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/users` | قائمة المستخدمين (فلتر: search, status, roleName) |
| POST | `/users` | إنشاء مستخدم جديد (مع ربط أدوار/مشاريع/صناديق) |
| GET | `/users/:id` | تفاصيل مستخدم + صلاحياته + مشاريعه |
| PATCH | `/users/:id` | تعديل بيانات المستخدم |
| PATCH | `/users/:id/status` | تفعيل/تعطيل الحساب (مع حماية آخر ADMIN) |
| POST | `/users/:id/reset-password` | إعادة تعيين كلمة المرور |

#### 6. البيانات الأساسية

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/beneficiaries` | قائمة المستفيدين (فلتر: search) |
| POST | `/beneficiaries` | إنشاء مستفيد جديد |
| GET | `/expense-categories` | قائمة تصنيفات المصروفات |
| POST | `/expense-categories` | إنشاء تصنيف جديد |

#### 7. إعدادات النظام

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/system-settings` | جميع الإعدادات |
| PATCH | `/system-settings/expenses.project_requirement_mode` | تعديل وضع إلزامية ربط المشروع |

#### 8. التقارير (Reports) — ⚠️ Controller جاهز لكن غير مُسجل في Routes

| الطريقة | المسار | الوصف |
|---------|--------|-------|
| GET | `/reports/daily-expenses` | تقرير المصروفات اليومية |
| GET | `/reports/by-project` | المصروفات حسب المشروع |
| GET | `/reports/by-beneficiary` | المصروفات حسب المستفيد |
| GET | `/reports/by-category` | المصروفات حسب التصنيف |
| GET | `/reports/unassigned-project-transactions` | السندات غير المرتبطة بمشاريع |
| GET | `/reports/pending-invoices` | الفواتير المعلقة |
| GET | `/reports/manual-vouchers` | السندات اليدوية |

### الميزات الأمنية

- **JWT Tokens:** Access Token + Refresh Token منفصلان
- **RBAC:** كل طلب يمر عبر `authenticateJWT` — يجلب دور المستخدم وصلاحياته
- **حماية ADMIN:** منع تعطيل آخر ADMIN نشط في النظام
- **Rate Limiting:** 500 طلب / 15 دقيقة لكل IP
- **Helmet:** حماية HTTP headers
- **CORS:** مقيد بـ `localhost:3000` + البيئة المحددة في `.env`
- **تشفير BCrypt:** جميع كلمات المرور مشفرة (salt rounds: 10)

### منطق اليومية التلقائية (Auto Journal Engine)

1. عند أي طلب على `/today`، يتم تنفيذ `autoClosePastJournals()` أولاً
2. يغلق أي يومية بحالة `OPEN` بتاريخ أقدم من اليوم تلقائياً (بتوقيت الرياض)
3. يبحث عن يومية مفتوحة لنفس الصندوق ونفس تاريخ اليوم
4. إذا لم تجد يومية مفتوحة → تنشئ يومية جديدة برقم `JRN-YYYYMMDD`
5. كل مصروف يرتبط باليومية المفتوحة للصندوق الرئيسي تلقائياً

### وضع إلزامية المشروع (Project Requirement Mode)

| الوضع | الوصف |
|-------|-------|
| `OPTIONAL` | ربط المشروع اختياري تماماً (الافتراضي) |
| `REQUIRED_ON_CREATE` | ربط المشروع إجباري عند إنشاء السند |
| `REQUIRED_ON_APPROVAL` | ربط المشروع إجباري عند الاعتماد أو إغلاق اليومية |

---

## 🌐 الـ Frontend (Web App) — تحليل تفصيلي

### المكدس التقني

```
Next.js 14.2.3 (App Router)
React 18.3.x + TypeScript 5.4.x
Tailwind CSS 3.4.x
TanStack Query (React Query) 5.x — إدارة الحالة وطلبات API
Axios — HTTP Client مع JWT interceptor
React Hook Form + Zod — النماذج والتحقق
Lucide React — الأيقونات
```

### الصفحات المبنية

#### صفحات مكتملة بالكامل

| الصفحة | المسار | الميزات |
|--------|--------|---------|
| تسجيل الدخول | `/login` | نموذج دخول، JWT، redirect تلقائي |
| لوحة التحكم اليومية | `/dashboard` | ملخص اليوم، جدول المصروفات، تعديل/حذف inline، حالة اليومية |
| إضافة مصروف جديد | `/transactions/new` | نموذج كامل، إضافة سريعة لمستفيد، إلزامية المشروع من الإعدادات |
| قائمة المشاريع | `/projects` | بحث، فلتر بالحالة، تفعيل/إيقاف/أرشفة |
| قائمة المستخدمين | `/users` | بحث، فلتر بالدور والحالة، إعادة تعيين كلمة المرور، تفعيل/تعطيل |
| أرشيف اليوميات | `/journals` | عرض اليوميات، إغلاق يدوي، إعادة فتح |
| السندات غير المرتبطة | `/unassigned-projects` | تحديد متعدد (Bulk Select) + ربط جماعي بمشروع |
| إعدادات النظام | `/settings` | تعديل وضع إلزامية ربط المشروع (3 أوضاع) |
| مركز التقارير | `/reports` | صفحة Hub بروابط لـ 7 تقارير |
| الصناديق المالية | `/cashboxes` | عرض بسيط ببطاقات |

#### صفحات ناقصة أو وهمية

| الصفحة | المسار | المشكلة |
|--------|--------|---------|
| سجل التعديلات | `/audit-logs` | صفحة وهمية - لا تعرض بيانات حقيقية |
| إدارة المستفيدين | `/beneficiaries` | عرض فقط، بدون إضافة/تعديل/حذف |
| تفاصيل مشروع | `/projects/[id]` | الرابط موجود في UI - الصفحة تحتاج تحقق |
| إضافة/تعديل مشروع | `/projects/new` - `/projects/[id]/edit` | الروابط موجودة - الصفحات تحتاج تحقق |
| تفاصيل مستخدم | `/users/[id]` | الرابط موجود - الصفحة تحتاج تحقق |
| إضافة/تعديل مستخدم | `/users/new` - `/users/[id]/edit` | الروابط موجودة - الصفحات تحتاج تحقق |
| تفاصيل يومية | `/journals/[id]` | الرابط موجود - الصفحة تحتاج تحقق |
| تقارير تفصيلية | `/reports/manual-vouchers` إلخ | مسارات بلا محتوى |
| إدارة التصنيفات | `/categories` | لا توجد صفحة إدارة |
| الوحدات العقارية | — | لا توجد واجهة |

### المكونات الهيكلية

```
components/layout/
├── DashboardLayout.tsx  ← المغلف الرئيسي (Sidebar + Header + محتوى)
├── Header.tsx           ← رأس الصفحة (اسم المستخدم، logout)
└── Sidebar.tsx          ← القائمة الجانبية بـ 24 وجهة

context/AuthContext.tsx  ← سياق المصادقة (user, login, logout, isAuthenticated)
lib/axios.ts             ← axios instance (baseURL, JWT interceptor, 401 handler)
lib/providers.tsx        ← QueryClientProvider + AuthProvider
```

---

## 📊 ملخص الإنجاز الحالي

### الـ Backend — الإنجاز: 90%+

| المكوّن | الحالة |
|---------|--------|
| قاعدة البيانات (14 نموذج) | ✅ مكتمل |
| نظام المصادقة (JWT + Refresh) | ✅ مكتمل |
| نظام الصلاحيات RBAC | ✅ مكتمل |
| محرك اليومية التلقائية (Auto Journal) | ✅ مكتمل |
| إدارة المشاريع والوحدات (Service) | ✅ مكتمل |
| إدارة المستخدمين | ✅ مكتمل |
| إدارة المستفيدين | ✅ مكتمل |
| إدارة التصنيفات | ✅ مكتمل |
| وضع إلزامية المشروع (3 أوضاع) | ✅ مكتمل |
| سجل التغييرات AuditLog | ✅ مكتمل |
| تقارير المصروفات - 7 تقارير (Service + Controller) | ✅ مكتمل |
| Swagger OpenAPI | ✅ موجود على `/api-docs` |
| Soft Delete للسندات | ✅ مكتمل |
| Upload Middleware | ✅ موجود |
| **مسارات التقارير في routes** | ❌ غير مُسجلة |
| **Bulk Assign API endpoint** | ❌ غير موجود |
| **Project Units API endpoints** | ❌ دوال موجودة في service، غير مُسجلة |
| **Cashboxes Routes** | ⚠️ يحتاج تحقق |

### الـ Frontend — الإنجاز: 70-75%

| المكوّن | الحالة |
|---------|--------|
| نظام تسجيل الدخول والحماية | ✅ مكتمل |
| لوحة التحكم اليومية | ✅ مكتمل |
| نموذج إضافة مصروف جديد | ✅ مكتمل |
| قائمة وإدارة المشاريع | ✅ مكتمل |
| قائمة وإدارة المستخدمين | ✅ مكتمل |
| أرشيف اليوميات (فتح/إغلاق) | ✅ مكتمل |
| السندات غير المرتبطة + Bulk Assign UI | ✅ UI جاهز (API غير مسجل!) |
| إعدادات النظام | ✅ مكتمل |
| مركز التقارير (Hub) | ✅ روابط فقط |
| **سجل التعديلات (Audit Logs)** | ❌ صفحة وهمية - لا بيانات حقيقية |
| **صفحة إضافة/تعديل مشروع** | ❌ يحتاج تحقق |
| **صفحة إضافة/تعديل مستخدم** | ❌ يحتاج تحقق |
| **صفحة تفاصيل يومية** | ❌ يحتاج تحقق |
| **صفحات التقارير التفصيلية** | ❌ مسارات بلا محتوى |
| **إدارة المستفيدين CRUD كامل** | ❌ عرض فقط |
| **إدارة التصنيفات** | ❌ لا توجد صفحة |
| **إدارة الصناديق CRUD** | ❌ عرض بسيط فقط |
| **الوحدات العقارية** | ❌ لا توجد واجهة |

---

## 🔴 ما المتبقي — المشكلات الحرجة أولاً

> [!CAUTION]
> **مشكلة حرجة في الـ Backend:** صفحة `/unassigned-projects` تستدعي API `PATCH /expense-transactions/bulk-assign-project` الذي لا يوجد في `routes/index.ts` — الميزة غير عاملة حالياً!

### إصلاحات Backend الحرجة (routes/index.ts)

```typescript
// 1. تسجيل مسارات التقارير (الـ Controller جاهز):
import { ReportController } from '../controllers/report.controller';
router.get('/reports/daily-expenses', authenticateJWT, ReportController.getDailyExpenses);
router.get('/reports/by-project', authenticateJWT, ReportController.getExpensesByProject);
router.get('/reports/by-beneficiary', authenticateJWT, ReportController.getExpensesByBeneficiary);
router.get('/reports/by-category', authenticateJWT, ReportController.getExpensesByCategory);
router.get('/reports/unassigned-project-transactions', authenticateJWT, ReportController.getUnassignedProjectTransactions);
router.get('/reports/pending-invoices', authenticateJWT, ReportController.getPendingInvoices);
router.get('/reports/manual-vouchers', authenticateJWT, ReportController.getManualVouchers);

// 2. تسجيل Bulk Assign (يحتاج إنشاء الدالة في TransactionService أيضاً):
router.patch('/expense-transactions/bulk-assign-project', authenticateJWT, TransactionController.bulkAssignProject);

// 3. تسجيل مسارات الوحدات العقارية (الـ Service جاهز):
router.get('/projects/:id/units', authenticateJWT, ProjectController.getUnits);
router.post('/projects/:id/units', authenticateJWT, ProjectController.createUnit);
router.patch('/projects/:id/units/:unitId', authenticateJWT, ProjectController.updateUnit);
router.delete('/projects/:id/units/:unitId', authenticateJWT, ProjectController.deleteUnit);

// 4. تسجيل مسارات الصناديق:
router.get('/cashboxes', authenticateJWT, CashboxController.getAll);
```

### صفحات Frontend المفقودة (حسب الأولوية)

| الأولوية | الصفحة | المسار | الملاحظة |
|----------|--------|--------|---------|
| 🔴 عالية | سجل التعديلات | `/audit-logs` | API موجود، واجهة وهمية |
| 🔴 عالية | تفاصيل مشروع | `/projects/[id]` | يحتاج بناء كامل مع وحدات ومصروفات |
| 🔴 عالية | إضافة/تعديل مشروع | `/projects/new` + `/projects/[id]/edit` | روابط موجودة بدون صفحات |
| 🔴 عالية | إضافة/تعديل مستخدم | `/users/new` + `/users/[id]/edit` | روابط موجودة بدون صفحات |
| 🟡 متوسطة | تفاصيل يومية | `/journals/[id]` | زر "عرض" بلا وجهة |
| 🟡 متوسطة | تقارير تفصيلية | `/reports/*` | 7 تقارير بلا صفحات |
| 🟡 متوسطة | إدارة المستفيدين CRUD | `/beneficiaries` | تحويل من عرض لإدارة كاملة |
| 🟡 متوسطة | إدارة التصنيفات | `/categories` | إنشاء صفحة جديدة |
| 🟠 منخفضة | إدارة الصناديق | `/cashboxes` | تحويل من عرض لإدارة كاملة |
| 🟠 منخفضة | الوحدات العقارية | داخل `/projects/[id]` | تبويب أو قسم منفصل |

---

## 🚀 خطة العمل المقترحة

### المرحلة الأولى — إصلاح الـ Backend (1-2 يوم)
1. تسجيل مسارات التقارير في `routes/index.ts`
2. إنشاء دالة `bulkAssignProject` في `transaction.service.ts`
3. تسجيل مسارات الوحدات العقارية والصناديق

### المرحلة الثانية — الصفحات الحرجة (3-7 أيام)
1. بناء صفحة `/projects/new` و `/projects/[id]/edit`
2. بناء صفحة `/projects/[id]` (تفاصيل + وحدات + مصروفات)
3. بناء صفحة `/users/new` و `/users/[id]/edit`
4. ربط `/audit-logs` ببيانات حقيقية من API

### المرحلة الثالثة — التقارير (8-12 يوم)
1. صفحة تقرير يومي بفلتر التاريخ
2. صفحة مصروفات حسب المشروع
3. صفحة مصروفات حسب المستفيد والتصنيف
4. صفحة الفواتير المعلقة والسندات اليدوية

### المرحلة الرابعة — الاكتمال (13-20 يوم)
1. إدارة المستفيدين CRUD كامل
2. إدارة التصنيفات والصناديق
3. الوحدات العقارية داخل تفاصيل المشروع
4. صفحة تفاصيل يومية كاملة
5. تصدير التقارير (PDF/Excel) — اختياري

---

## 🔑 معلومات التشغيل

| البيانات | القيمة |
|---------|--------|
| Backend URL | `http://localhost:4000` |
| Frontend URL | `http://localhost:3000` |
| Swagger Docs | `http://localhost:4000/api-docs` |
| phpMyAdmin | `http://localhost:8080` |
| Admin Username | `admin` |
| Admin Password | `AdminPass123!` |
| Database | MySQL 8.x (Docker: Port 3306) |

```bash
# تشغيل قاعدة البيانات
docker-compose up -d

# تثبيت التبعيات
pnpm install

# هجرة قاعدة البيانات
pnpm db:migrate

# زرع البيانات التجريبية
pnpm db:seed

# تشغيل الكل معاً
pnpm dev

# أو منفصلاً:
pnpm dev:api    # Backend على 4000
pnpm dev:web    # Frontend على 3000
```

---

## 📁 ملفات مهمة في المشروع

| الملف | الوصف |
|-------|-------|
| [schema.prisma](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/prisma/schema.prisma) | مخطط قاعدة البيانات الكامل |
| [routes/index.ts](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/routes/index.ts) | جميع مسارات API |
| [project.service.ts](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/services/project.service.ts) | منطق إدارة المشاريع والوحدات |
| [transaction.service.ts](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/services/transaction.service.ts) | منطق سندات المصروفات |
| [journal.service.ts](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/api/src/services/journal.service.ts) | محرك اليومية التلقائية |
| [postman_collection.json](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/postman_collection.json) | مجموعة اختبار API |
| [README.md](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/README.md) | دليل التشغيل |
