# 🔍 التحليل الداخلي للـ Backend + مجلد Docs
## نظام إدارة المصروفات — Expense Management System

---

## 📁 مجلد `docs/` — ما يحتويه

| الملف | الحجم | المحتوى | الحالة |
|-------|-------|---------|--------|
| [routes_analysis.md](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/docs/routes_analysis.md) | 8.5 KB | خريطة 24 وجهة Frontend + مخطط Auth Flow | ✅ مكتمل ومحدث |
| [ui_analysis.md](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/docs/ui_analysis.md) | 18.7 KB | تحليل 16 صفحة + الفجوات + API Calls لكل صفحة | ✅ مكتمل |

### ما يكشفه `routes_analysis.md`

- **24 وجهة** موجودة في Next.js App Router
- **5 وجهات ديناميكية** `[id]`
- **ملاحظة حرجة:** لا يوجد تطبيق Middleware لحماية المسارات بالـ Roles — الحماية تعتمد على `useEffect` وليس Next.js Middleware، مما يتسبب في **Flash** للمحتوى قبل التوجيه
- `checkAuth` تُستدعى عند كل تغيير في `pathname` مما قد يُسبب طلبات API زائدة

### ما يكشفه `ui_analysis.md`

- صفحات **عرض فقط بدون CRUD**: beneficiaries, categories, cashboxes, payment-methods
- صفحة `/audit-logs` **placeholder بالكامل** — لا تستدعي أي API
- لا يوجد **Pagination** في أي جدول
- لا يوجد **تصدير PDF/Excel** في أي تقرير
- بعض الأخطاء تُعرض بـ `alert()` native بدلاً من UI

---

## 🔧 التحليل الداخلي للـ Backend — ملف بملف

---

### 📍 `apps/api/src/routes/index.ts` — خريطة المسارات الكاملة

```
الحجم: 61 سطر | 3.3 KB
```

#### ما هو مسجل فعلاً (60 مسار):

| القسم | المسارات المسجلة |
|-------|----------------|
| Auth | POST /login, POST /refresh, POST /logout, GET /me |
| Today | GET, GET /transactions, POST /transactions, PATCH /:id, DELETE /:id |
| Journals | GET, GET /:id, POST /:id/close, POST /:id/reopen |
| Projects | GET, POST, GET /:id, PATCH /:id, PATCH /:id/status |
| Users | GET, POST, GET /:id, PATCH /:id, PATCH /:id/status, POST /:id/reset-password |
| Beneficiaries | GET, POST |
| Categories | GET, POST |
| System Settings | GET, PATCH /expenses.project_requirement_mode |

#### ⚠️ Controllers موجودة لكن غير مسجلة في Routes:

| Controller | الدوال غير المسجلة |
|-----------|-------------------|
| `ProjectController` | archive, delete, getTransactions, getSummary, getUnits, createUnit, updateUnit, deleteUnit |
| `UserController` | logoutAllSessions, updateRoles, updateProjects, updateCashboxes, delete |
| `TransactionController` | (الدوال مكررة — نفس TodayController) |
| `BeneficiaryController` | getById, update |
| `CashboxController` | getAll, create, update (المسارات غير موجودة!) |
| `ReportController` | جميع الـ 7 تقارير |

> [!CAUTION]
> **الصناديق المالية (`/cashboxes`):** الـ Frontend يستدعي `GET /cashboxes` لكن هذا المسار غير موجود في routes! الصفحة تعرض فراغاً.
>
> **الربط الجماعي:** `PATCH /expense-transactions/bulk-assign-project` مطلوب من Frontend لكن غير موجود في Backend.

---

### 📍 طبقة Controllers — تحليل كل ملف

#### `auth.controller.ts` — 44 سطر

```typescript
// النمط: try/catch → Service → sendSuccess/next(error)
// 4 دوال: login, refresh, me, logout
```

- **login:** يستدعي `LoginSchema.parse(req.body)` (Zod) ثم `AuthService.login()`
- **refresh:** يستدعي `RefreshTokenSchema.parse(req.body)` ثم `AuthService.refreshToken()`
- **me:** يعيد بيانات المستخدم من `req.user` (يملؤها `authenticateJWT`)
- **logout:** دالة وهمية — تعيد نجاح فقط بدون أي منطق (لا تحذف Token من DB)

> [!NOTE]
> Logout لا ينفذ إبطالاً فعلياً للـ Token — يكفي حذف التوكن من localStorage في Frontend

#### `today.controller.ts` — 77 سطر

```typescript
// 4 دوال: getTodayOverview, getTodayTransactions, createTransaction, updateTransaction, deleteTransaction
```

- **getTodayOverview:** يستدعي `JournalService.getOrCreateTodayJournal(userId)` + `getRiyadhDateString()` لضمان التاريخ السعودي
- **createTransaction:** يمرر `req.user!.roles?.[0]` كـ `userRole` — يستخدم **أول دور فقط** من قائمة الأدوار
- **deleteTransaction:** `soft delete` — يُعيد تعيين `deletedAt` وليس حذفاً فعلياً

#### `project.controller.ts` — 149 سطر

```typescript
// 11 دالة (5 أساسية + 3 غير مسجلة + 3 وحدات)
```

**الدوال الأساسية المسجلة:**
- `getAll`: دعم فلاتر `search`, `status`, `activeOnly`
- `getById`: جلب مشروع + وحدات + مصروفات
- `create`: يستخدم `ProjectCreateSchema.parse()` + يمرر `userId` لـ AuditLog
- `update`: يستخدم `ProjectUpdateSchema.parse()` + AuditLog
- `updateStatus`: يحول `isActive` + `status` معاً

**الدوال غير المسجلة (موجودة في controller لكن بلا routes):**
- `archive` → `POST /projects/:id/archive`
- `delete` → `DELETE /projects/:id`
- `getTransactions` → `GET /projects/:id/transactions`
- `getSummary` → `GET /projects/:id/summary`
- وحدات: `getUnits`, `createUnit`, `updateUnit`, `deleteUnit`

> [!WARNING]
> صفحة `/projects/[id]` في Frontend تستدعي `/projects/:id/summary` — هذا المسار غير مسجل!

#### `user.controller.ts` — 132 سطر

```typescript
// 10 دوال (6 مسجلة + 4 غير مسجلة)
```

**المسجلة:** getAll, getById, create, update, toggleStatus, resetPassword

**غير المسجلة:**
- `logoutAllSessions` — placeholder (لا يفعل شيئاً)
- `updateRoles` → `PATCH /users/:id/roles`
- `updateProjects` → `PATCH /users/:id/projects`
- `updateCashboxes` → `PATCH /users/:id/cashboxes`
- `delete` → `DELETE /users/:id`

#### `transaction.controller.ts` — 42 سطر

```typescript
// 3 دوال: create, update, delete
```

> [!WARNING]
> هذا الـ Controller **مكرر تماماً** مع `TodayController` — كلاهما يستدعي نفس دوال `TransactionService`. لا توجد مسارات خاصة بـ `/expense-transactions/` في الـ Routes حالياً.

#### `cashbox.controller.ts` — 35 سطر

```typescript
// 3 دوال: getAll, create, update
```

- **getAll:** `CashboxService.getAll()` — جلب كل الصناديق مع بيانات `custodian`
- **create:** يتحقق من تكرار `code` قبل الإنشاء
- **update:** يدعم تحديث `custodianUserId` مع تحويل BigInt

> [!CAUTION]
> لا يوجد `import CashboxController` في `routes/index.ts` — هذا الـ Controller غير مربوط بأي مسار!

#### `beneficiary.controller.ts` — 46 سطر

```typescript
// 4 دوال: getAll, getById, create, update
```

- `getAll` و `create` مسجلان ✅
- `getById` و `update` **غير مسجلين** في routes ❌

#### `report.controller.ts` — 72 سطر

```typescript
// 7 دوال — جميعها غير مسجلة في routes
```

| الدالة | المسار المقترح |
|--------|---------------|
| getDailyExpenses | GET /reports/daily-expenses |
| getExpensesByProject | GET /reports/by-project |
| getExpensesByBeneficiary | GET /reports/by-beneficiary |
| getExpensesByCategory | GET /reports/by-category |
| getUnassignedProjectTransactions | GET /reports/unassigned-project-transactions |
| getPendingInvoices | GET /reports/pending-invoices |
| getManualVouchers | GET /reports/manual-vouchers |

---

### 📍 طبقة Services — تحليل كل ملف

#### `auth.service.ts` — 107 سطر

**`login(username, password)`:**
```
1. findUnique(username) + include roles + permissions
2. bcrypt.compare(password, passwordHash)
3. flatMap لجميع permissions من جميع الأدوار مع Set لإزالة التكرار
4. generateTokens({ id, username, roles })
5. يعيد: { user: {...}, tokens: { accessToken, refreshToken } }
```

**`generateTokens(user)`:**
```
accessToken: JWT signed { id, username, roles } — للاستخدام في كل طلب
refreshToken: JWT signed { id, username } فقط — بدون roles
```

**`refreshToken(refreshTokenString)`:**
```
1. jwt.verify(refreshToken, refreshSecret)
2. findUnique(payload.id) — يُعيد جلب الأدوار من DB
3. generateTokens جديدة
```

> [!NOTE]
> عند تجديد التوكن، يُعيد جلب الأدوار من DB — يضمن أن أي تغيير في الأدوار ينعكس فور تجديد التوكن

#### `journal.service.ts` — تحليل المنطق

**`getOrCreateTodayJournal(userId)`:**
```
1. autoClosePastJournals() — يُغلق اليوميات القديمة أولاً
2. يبحث عن يومية OPEN لتاريخ اليوم (بتوقيت الرياض)
3. إذا لم تجد → ينشئ يومية جديدة برقم JRN-YYYYMMDD
4. يجلب اليومية مع جميع عملياتها
```

**`autoClosePastJournals()`:**
```
1. findMany journals WHERE status=OPEN AND date < today
2. لكل يومية: updateMany status=CLOSED
3. يُسجل AuditLog لكل إغلاق تلقائي
```

**`closeJournal(id, userId)`:**
```
القواعد:
- إذا كان إعداد ProjectRequirementMode = REQUIRED_ON_APPROVAL:
  → يتحقق من عدم وجود عمليات DRAFT بدون مشروع
- يمنع إغلاق يومية تحتوي عمليات DRAFT غير معتمدة
- يُحسب: totalAmount, approvedAmount, rejectedAmount, pendingAmount
```

#### `transaction.service.ts` — تحليل المنطق

**`createTodayTransaction(data, userId, userRole)`:**
```
1. getOrCreateTodayJournal(userId) — يجلب/ينشئ اليومية
2. يتحقق من ProjectRequirementMode إذا كان REQUIRED_ON_CREATE
3. يتحقق من تكرار رقم السند اليدوي (manualVoucherNumber) داخل نفس (cashbox + year + voucherBook)
4. generateSystemReference() → EXP-YYYY-XXXXXX
5. يُنشئ ExpenseTransaction + AuditLog في Prisma Transaction
```

**`updateTodayTransaction(id, data, userId, userRole)`:**
```
1. يتحقق أن العملية لم تُحذف (deletedAt = null)
2. يتحقق أن اليومية المرتبطة OPEN
3. يمنع تعديل عملية APPROVED
4. يُسجل old/new values في AuditLog
```

**`deleteTodayTransaction(id, userId, userRole)`:**
```
Soft Delete: يضبط deletedAt = now()
يمنع حذف عملية APPROVED
يُسجل في AuditLog
```

#### `project.service.ts` — تحليل المنطق

**`getAllProjects(filters)`:**
```
where clause ديناميكي:
- search: يبحث في projectName, projectCode, costCenterCode, location
- status: تصفية حسب حالة المشروع
- activeOnly: يُضيف isActive=true
include: units (count), transactions (count + sum)
```

**`createProject(data, userId)`:**
```
1. يتحقق من uniqueness: projectCode
2. يُنشئ في prisma.$transaction مع AuditLog
```

**`updateProjectStatus(id, status, isActive, userId)`:**
```
القواعد الصارمة:
- لا يمكن أرشفة مشروع يحتوي سندات DRAFT أو APPROVED
- يمنع تفعيل مشروع مؤرشف (status=ARCHIVED)
```

**`getUnitsByProject(projectId)`:** موجود في Service ✅ لكن غير مسجل في Routes ❌

**`createUnit(projectId, data)`:** موجود في Service ✅ لكن غير مسجل في Routes ❌

#### `userService.ts` — تحليل المنطق

**`createUser(data, currentUserId)`:**
```
1. يتحقق من: username, email, employeeNumber (uniqueness)
2. bcrypt.hash(password, 10)
3. Prisma Transaction:
   a. إنشاء User
   b. ربط الأدوار roleIds
   c. ربط المشاريع projectIds
   d. ربط الصناديق cashboxIds
   e. AuditLog
```

**`toggleUserStatus(id, isActive, currentUserId)`:**
```
حماية مهمة:
- إذا isActive=false: يتحقق من أن هناك ADMIN آخر نشط في النظام
- يمنع تعطيل آخر ADMIN
```

**`resetPassword(id, newPassword, currentUserId)`:**
```
1. bcrypt.hash(newPassword, 10)
2. تحديث passwordHash + mustChangePassword=true
3. AuditLog يسجل: من أعاد التعيين + للمن
```

#### `systemSetting.service.ts` — 62 سطر

```typescript
// يستخدم SYSTEM_SETTINGS_KEYS من packages/shared
// أهم دالة: getProjectRequirementMode()
```

- `getProjectRequirementMode()`: يجلب الوضع من DB، القيمة الافتراضية `OPTIONAL` إذا لم يوجد إعداد
- `updateSetting()`: يستخدم `prisma.$transaction` لضمان حفظ AuditLog مع التحديث

#### `cashbox.service.ts` — 42 سطر

```typescript
// 3 دوال: getAll, create, update
```

- `getAll()`: يجلب مع `custodian` (User المرتبط) — يفشل إذا كان المسار غير مسجل
- `create()`: يتحقق من uniqueness الـ `code`
- `update()`: يدعم تحديث `custodianUserId` مع تحويل `BigInt`

#### `beneficiary.service.ts` — 60 سطر

```typescript
// 4 دوال: getAll, getById, create, update
```

- `getAll(search)`: يدعم البحث في: name, commercialName, taxNumber, commercialRegistration, phone
- `create()`: يقبل كل الحقول بدون تحقق Zod (يعتمد على Prisma فقط)

> [!WARNING]
> `BeneficiaryService.create()` لا يستخدم Zod Schema للتحقق — بخلاف UserService و ProjectService. هذا يعني إمكانية مرور بيانات غير صالحة.

#### `paymentMethod.service.ts` — 11 سطر

```typescript
// دالة واحدة فقط: getAll()
// يجلب جميع طرق الدفع مرتبة بـ code
```

> [!NOTE]
> خدمة طريقة الدفع تفتقر إلى: create, update, delete. لا يمكن إضافة طرق دفع جديدة من الواجهة.

---

### 📍 طبقة Middleware — تحليل كل ملف

#### `auth.middleware.ts`

```typescript
// authenticateJWT(req, res, next):
// 1. Authorization: Bearer <token>
// 2. jwt.verify(token, accessSecret)
// 3. findUnique(payload.id) + include roles + permissions
// 4. يملأ req.user = { id, username, roles[], permissions[] }
```

> [!IMPORTANT]
> يُعيد جلب بيانات المستخدم من DB في **كل طلب** — يضمن أن تعطيل الحساب ينعكس فوراً دون انتظار انتهاء التوكن

```typescript
// requirePermission(permCode): middleware للصلاحيات
// يتحقق من req.user.permissions.includes(permCode)
```

> [!WARNING]
> `requirePermission` مُعرَّف لكن **غير مستخدم في أي مسار** في routes/index.ts! جميع المسارات تستخدم `authenticateJWT` فقط بدون فحص صلاحيات تفصيلية.

#### `error.middleware.ts` — 42 سطر

```typescript
// errorHandler handles 3 cases:
// 1. AppError → يُعيد statusCode + errorCode من AppError
// 2. ZodError → يُحول لـ VALIDATION_ERROR مع field-level errors
// 3. غيرهما → 500 في production بدون كشف التفاصيل
```

- **`AppError`** هو الـ Exception الموحد — كل throw في Services يستخدمه
- في `production`: رسائل الخطأ العامة لا تكشف تفاصيل تقنية ✅

#### `upload.middleware.ts` — 36 سطر

```typescript
// Multer config:
// - destination: config.upload.dir (من .env)
// - filename: att-{timestamp}-{random}.{ext}
// - fileFilter: يقبل image/jpeg, image/png, application/pdf فقط
// - fileSize limit: من config.upload.maxSize
```

> [!NOTE]
> `uploadMiddleware` مُعرَّف لكن **غير مستخدم في أي route** في routes/index.ts! خاصية رفع المرفقات على السندات غير مفعلة من Backend.

---

### 📍 Utilities — تحليل

#### `date.ts` — 21 سطر

```typescript
// getRiyadhDateString(): 
// - يستخدم Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' })
// - يعيد YYYY-MM-DD بتوقيت الرياض

// getRiyadhDate():
// - يعيد Date UTC midnight للتخزين في DB
```

> [!IMPORTANT]
> هذا الملف **حرج جداً** — بدونه ستُفتح يوميات بتاريخ UTC الذي قد يختلف عن تاريخ الرياض.

#### `response.ts` — 32 سطر

```typescript
// sendSuccess<T>(res, data, message, statusCode, meta)
// → { success: true, message, data, meta? }

// sendError(res, message, errorCode, statusCode, errors)
// → { success: false, message, errorCode, errors? }
```

نمط استجابة API موحد — كل الـ controllers تستخدم نفس الـ format.

---

### 📍 `packages/shared/` — الحزمة المشتركة

```
src/
├── constants/    ← SYSTEM_SETTINGS_KEYS, ProjectRequirementMode enum
├── schemas/      ← Zod Schemas المشتركة (Login, User, Project, etc.)
├── types/        ← TypeScript Types المشتركة
└── index.ts      ← يُصدر الكل
```

**Schemas موجودة في shared:**
- `LoginSchema`, `RefreshTokenSchema`
- `UserCreateSchema`, `UserUpdateSchema`, `ResetPasswordSchema`
- `ProjectCreateSchema`, `ProjectUpdateSchema`, `ProjectUnitCreateSchema`

**Constants موجودة:**
- `SYSTEM_SETTINGS_KEYS.PROJECT_REQUIREMENT_MODE`
- `ProjectRequirementMode.OPTIONAL | REQUIRED_ON_CREATE | REQUIRED_ON_APPROVAL`

---

## 📊 جدول الفجوات — Controllers vs Routes

| Controller | الدالة | في Routes؟ | ملاحظة |
|-----------|--------|-----------|--------|
| AuthController | login | ✅ | — |
| AuthController | refresh | ✅ | — |
| AuthController | logout | ✅ | دالة وهمية |
| AuthController | me | ✅ | — |
| TodayController | getTodayOverview | ✅ | — |
| TodayController | getTodayTransactions | ✅ | — |
| TodayController | createTransaction | ✅ | — |
| TodayController | updateTransaction | ✅ | — |
| TodayController | deleteTransaction | ✅ | — |
| JournalController | getAll | ✅ | — |
| JournalController | getById | ✅ | — |
| JournalController | close | ✅ | — |
| JournalController | reopen | ✅ | — |
| ProjectController | getAll | ✅ | — |
| ProjectController | getById | ✅ | — |
| ProjectController | create | ✅ | — |
| ProjectController | update | ✅ | — |
| ProjectController | updateStatus | ✅ | — |
| ProjectController | archive | ❌ | يحتاج `POST /projects/:id/archive` |
| ProjectController | delete | ❌ | يحتاج `DELETE /projects/:id` |
| ProjectController | getTransactions | ❌ | يحتاج `GET /projects/:id/transactions` |
| ProjectController | getSummary | ❌ | مطلوب من Frontend! |
| ProjectController | getUnits | ❌ | مطلوب من Frontend! |
| ProjectController | createUnit | ❌ | مطلوب من Frontend! |
| ProjectController | updateUnit | ❌ | — |
| ProjectController | deleteUnit | ❌ | — |
| UserController | getAll | ✅ | — |
| UserController | getById | ✅ | — |
| UserController | create | ✅ | — |
| UserController | update | ✅ | — |
| UserController | toggleStatus | ✅ | — |
| UserController | resetPassword | ✅ | — |
| UserController | logoutAllSessions | ❌ | دالة وهمية |
| UserController | updateRoles | ❌ | — |
| UserController | updateProjects | ❌ | — |
| UserController | updateCashboxes | ❌ | — |
| UserController | delete | ❌ | — |
| TransactionController | create | ❌ | مكرر مع TodayController |
| TransactionController | update | ❌ | مكرر مع TodayController |
| TransactionController | delete | ❌ | مكرر مع TodayController |
| BeneficiaryController | getAll | ✅ | — |
| BeneficiaryController | getById | ❌ | — |
| BeneficiaryController | create | ✅ | — |
| BeneficiaryController | update | ❌ | — |
| CategoryController | getAll | ✅ | — |
| CategoryController | create | ✅ | — |
| CashboxController | getAll | ❌ | **لا يوجد import في routes!** |
| CashboxController | create | ❌ | **لا يوجد import في routes!** |
| CashboxController | update | ❌ | **لا يوجد import في routes!** |
| SystemSettingController | getAll | ✅ | — |
| SystemSettingController | updateProjectRequirementMode | ✅ | — |
| ReportController | getDailyExpenses | ❌ | Controller جاهز |
| ReportController | getExpensesByProject | ❌ | Controller جاهز |
| ReportController | getExpensesByBeneficiary | ❌ | Controller جاهز |
| ReportController | getExpensesByCategory | ❌ | Controller جاهز |
| ReportController | getUnassignedProjectTransactions | ❌ | **مطلوب من Frontend!** |
| ReportController | getPendingInvoices | ❌ | Controller جاهز |
| ReportController | getManualVouchers | ❌ | Controller جاهز |

**إجمالي:** 26 دالة مسجلة ✅ | 22 دالة غير مسجلة ❌

---

## 🎯 أنماط البرمجة المستخدمة (Design Patterns)

| النمط | الاستخدام |
|-------|---------|
| **Service Layer** | كل منطق العمل في `services/` — Controllers تُفوّض فقط |
| **Repository Pattern** | Prisma مباشرة في Services — لا abstraction منفصل |
| **Error Boundary** | `AppError` موحد + `errorHandler` middleware |
| **DTO + Validation** | Zod Schemas في `packages/shared` للـ input validation |
| **Audit Trail** | كل عملية حساسة تُسجل في `audit_logs` |
| **Soft Delete** | `deletedAt` timestamp بدلاً من الحذف الفعلي |
| **Database Transaction** | `prisma.$transaction` لضمان atomicity في عمليات متعددة |
| **Singleton Prisma** | `utils/prisma.ts` يُصدر instance واحد |

---

## ⚠️ المشاكل التقنية الموجودة

| المشكلة | الملف | الأثر |
|---------|-------|-------|
| `requirePermission` غير مستخدم | routes/index.ts | RBAC على مستوى permissions غير مطبق |
| `uploadMiddleware` غير مستخدم | routes/index.ts | رفع المرفقات غير مفعل |
| `CashboxController` غير مستورد | routes/index.ts | GET /cashboxes يفشل |
| `ReportController` غير مستورد | routes/index.ts | جميع التقارير لا تعمل |
| Logout وهمي | auth.controller.ts | لا يُبطل التوكن فعلياً |
| `BeneficiaryService.create` بدون Zod | beneficiary.service.ts | بيانات غير موثوقة |
| `TransactionController` مكرر | transaction.controller.ts | dead code |
| `logoutAllSessions` وهمية | user.controller.ts | لا تفعل شيئاً |
| BigInt في جميع الـ IDs | كل ملفات Services | يجب التحويل الدقيق عند التمرير |
| لا Pagination في أي Service | جميع getAll() | مشكلة أداء عند نمو البيانات |

---

## ✅ إيجابيات قوية في الكود

| الإيجابية | التفاصيل |
|----------|---------|
| **حماية آخر ADMIN** | `UserService.toggleUserStatus` يمنع تعطيل النظام |
| **تاريخ الرياض** | `date.ts` يضمن اليوميات بالتوقيت الصحيح |
| **AuditLog شامل** | كل تغيير حساس يُسجل مع oldValues/newValues |
| **Prisma Transactions** | عمليات متعددة atomic بدون تناقض |
| **زرع البيانات** | seed.ts يُنشئ بيانات تجريبية واقعية |
| **منع تكرار السندات** | رقم السند اليدوي فريد لكل (cashbox + year + voucherBook) |
| **Auto-close اليوميات** | يُغلق تلقائياً بدون تدخل يدوي |
| **BigInt handling** | تحويل دقيق بين DB BigInt و JS Number |
| **Error Messages بالعربية** | رسائل خطأ واضحة لفريق العمل |
| **TypeScript strict** | typing قوي في Controllers و Services |
