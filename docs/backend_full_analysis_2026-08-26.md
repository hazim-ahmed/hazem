# تحليل شامل للباك اند - نظام إدارة المصروفات

تاريخ التحليل: 2026-08-26  
النطاق المعتمد: `apps/api` مع مراجعة سريعة لوجود نسخة موازية في `backend`.

## 1. الملخص التنفيذي

الباك اند مبني كـ REST API باستخدام Express وPrisma وMySQL، ويخدم نظام يوميات مصروفات تشغيلية لا نظام محاسبة مزدوج القيد. المسار الرسمي الظاهر من بنية الـ monorepo هو `apps/api`، وملفات `backend` تحتوي نسخة قريبة/مكررة من الكود؛ ملف routes متطابق بين المسارين حسب SHA256، بينما `schema.prisma` مختلف، وهذا خطر صيانة واضح لأن أي تشغيل أو نشر من المسار الخطأ قد يعطي سلوكًا مختلفًا.

النظام جيد في الأساسيات: تسجيل الدخول، JWT، يومية اليوم التلقائية، إنشاء/تعديل/حذف مصروف اليوم، إدارة مشاريع ومستخدمين وصناديق ومستفيدين وتصنيفات، تقارير تشغيلية، وتصدير Excel/PDF. لكنه غير مكتمل إنتاجيًا من ناحية التفويض الحقيقي، دورة اعتماد المحاسب، منع التلاعب بعد الإغلاق/التوثيق، الاتساق بين الـ schema والـ routes، والتحقق الموحد لكل المدخلات.

أعلى المخاطر الحالية:

1. كل routes تقريبًا تكتفي بـ `authenticateJWT` ولا تستخدم `requirePermission` أو `requireRole` رغم وجودهما.
2. لا توجد routes لاعتماد اليومية أو اعتماد سند منفرد، رغم وجود حقول approval وصلاحيات seeded وواجهة أمامية سابقة كانت تتوقعها.
3. المصروف الجديد يصبح `APPROVED` مباشرة في الخدمة، لذلك لا توجد مرحلة مراجعة فعلية.
4. توليد `systemReference` يعتمد على `count() + 1` وقد يتصادم مع الطلبات المتزامنة أو السجلات المحذوفة.
5. ترقيم اليومية الحالي `JRN-YYYYMMDD` لا يميز بين الصناديق، بينما `journalNumber` unique؛ الاختبار الفعلي أظهر فشلًا عند محاولة إنشاء يومية اليوم بسبب تصادم الرقم.
6. بعض الموارد تقبل `req.body` مباشرة أو بتحقق يدوي خفيف، خاصة المستفيدين والتصنيفات والصناديق والوحدات.
7. أسرار JWT وقاعدة البيانات لها قيم افتراضية داخل الكود، وهذا خطر عند نشر سيئ الإعداد.
8. التقارير تشغيلية وليست دفتر أستاذ؛ لا توجد قيود Debit/Credit ولا ربط حسابات كافٍ لإنتاج ميزان مراجعة موثوق.

## 2. الخريطة التقنية

### 2.1 الإطار والتشغيل

- التطبيق يبدأ من `apps/api/src/app.ts`.
- يستخدم `helmet`, `cors`, `express-rate-limit`, `express.json`, Swagger UI, وراوتر رئيسي تحت `/api/v1`.
- Health check موجود على `/health`.
- الاعتمادات الأساسية موثقة في `apps/api/package.json`: Express, Prisma Client, JWT, bcrypt, ExcelJS, Puppeteer, Vitest/Supertest.

### 2.2 قاعدة البيانات

Prisma مضبوط على MySQL. النماذج الأساسية:

- Users/RBAC: `User`, `Role`, `Permission`, `RolePermission`, `UserRole`.
- ربط المستخدم: `UserProject`, `UserCashbox`.
- إعدادات النظام: `SystemSetting`.
- البيانات المرجعية: `Cashbox`, `PaymentMethod`, `ExpenseCategory`, `Project`, `ProjectUnit`, `Beneficiary`.
- المحرك المالي التشغيلي: `ExpenseJournal`, `ExpenseTransaction`.
- المرفقات والاعتمادات والتدقيق: `TransactionAttachment`, `ExpenseApproval`, `AuditLog`.

المخطط غني بعلاقات وحقول اعتماد، لكنه لا يحتوي على `ChartOfAccounts`, `JournalEntry`, `JournalLine`, أو `Ledger`. لذلك التقارير الحالية تجميعات تشغيلية للمصروفات وليست محاسبة دفترية كاملة.

## 3. تحليل طبقة Routes

المسارات العامة:

- Auth: `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`.
- يومية اليوم: `/today`, `/today/transactions`.
- اليوميات: `/journals`, `/journals/:id`, export Excel/PDF, close/reopen.
- عمليات المصروف: route وحيد للربط الجماعي بالمشروع.
- المشاريع والوحدات.
- المستخدمون وربط الأدوار/المشاريع/الصناديق.
- المستفيدون، التصنيفات، الصناديق، طرق الدفع، الإعدادات، التقارير، audit logs.

الملاحظة الحاسمة: جميع المسارات المحمية تقريبًا تستخدم `authenticateJWT` فقط. هذا يعني أن أي مستخدم نشط يحمل token يستطيع الوصول إلى مسارات إدارية مثل إنشاء مستخدم، تغيير أدوار، إعادة تعيين كلمة مرور، تغيير إعدادات، إغلاق/إعادة فتح يومية، أو تصدير تقارير، ما لم تكن الواجهة وحدها تمنعه. وجود `requirePermission` و`requireRole` في middleware لا يكفي لأنه غير موصول بالراوتر.

كذلك توجد دوال Controller غير موصولة:

- `TransactionController.create/update/delete` غير مرتبطة بمسارات `/expense-transactions/:id`؛ المتاح فقط bulk assign.
- `CategoryController.update` غير مرتبط في routes.
- `UserController.delete` و`logoutAllSessions` غير مرتبطين.

## 4. المصادقة والتفويض

### نقاط جيدة

- تسجيل الدخول يستخدم `LoginSchema`.
- كلمة المرور تتحقق بـ bcrypt.
- JWT access/refresh منفصلان.
- `authenticateJWT` يعيد تحميل المستخدم والأدوار والصلاحيات من قاعدة البيانات، فلا يعتمد كليًا على بيانات token القديمة.
- `requirePermission` و`requireRole` موجودان ويدعمان ADMIN override.

### فجوات

- لا توجد آلية session/token revocation؛ `/auth/logout` يرجع نجاحًا فقط ولا يبطل token.
- refresh token لا يخزن في قاعدة البيانات ولا يرتبط بجهاز/جلسة.
- `mustChangePassword` موجود في schema ويعاد ضبطه عند reset، لكن لا يوجد enforcement في login أو middleware.
- أسرار JWT الافتراضية داخل الكود (`super-secret...`) خطرة إذا تم النشر بدون env.
- لا يوجد rate limit مخصص لتسجيل الدخول؛ يوجد rate limit عام فقط.

## 5. يومية اليوم والمصروفات

### التدفق الحالي

`TodayController.createTransaction` يتحقق بـ `TodayTransactionCreateSchema` ثم يستدعي `TransactionService.createTodayTransaction`. الخدمة:

1. تنشئ أو تجلب يومية اليوم.
2. تغلق اليوميات المفتوحة السابقة.
3. تتحقق من إعداد إلزام المشروع.
4. تتحقق من المشروع إذا أرسل.
5. تولد `systemReference`.
6. تتحقق من طريقة الدفع ومرجع الدفع عند الحاجة.
7. تنشئ مستفيدًا تلقائيًا إذا أرسل الاسم بدل المعرف.
8. تنشئ المصروف بحالة `APPROVED`.
9. تسجل AuditLog.

### نقاط قوية

- طريقة الدفع إجبارية.
- مرجع الدفع مطلوب عندما `requiresReference=true`.
- تاريخ اليومية يعتمد على Asia/Riyadh.
- الإنشاء لا يسمح للفرونت بإرسال `journalId` أو `voucherDate` في مسار اليوم؛ الباك اند يحددها.
- الحذف soft delete: يضع `deletedAt` و`CANCELLED`.

### فجوات

- `userRole` يمرر للخدمة لكنه لا يستخدم في create.
- لا يوجد تحقق أن المستخدم مسموح له بالصندوق الحالي أو المشروع الحالي.
- اليومية تختار أول صندوق فعال في النظام، لا صندوق المستخدم أو الفرع.
- `systemReference = count() + 1` معرض للتصادم.
- `projectUnitId`, `invoiceDate`, `invoiceAmount` موجودة في schema لكنها غير محفوظة في create/update الحالي.
- `invoiceStatus` لا يرسل عبر Today schema، لذلك تقارير pending invoices لن تعمل طبيعيًا من إدخال اليوم إلا إذا وجدت مسارات أخرى غير مستخدمة.
- الحالة تصبح `APPROVED` مباشرة، وهذا يلغي طابور المحاسب عمليًا.

## 6. اليوميات والإغلاق

`JournalService.autoClosePastJournals` يغلق أي يومية مفتوحة بتاريخ قبل اليوم. `getOrCreateTodayJournal` يستدعيه قبل جلب/إنشاء يومية اليوم.

نقاط جيدة:

- يمنع بقاء يوميات قديمة مفتوحة.
- يوفر totalAmount وtransactionsCount.
- export Excel/PDF موجود على مستوى اليومية.

فجوات:

- الإغلاق التلقائي لا يحدد `closedBy` ولا يميز بين إغلاق نظامي ومراجعة محاسب.
- رقم اليومية يولد بصيغة `JRN-YYYYMMDD` فقط. مع وجود unique على `journalNumber` ومع بحث اليومية بواسطة `cashboxId + journalDate`، يمكن أن يفشل الإنشاء إذا وجدت يومية بنفس الرقم لصندوق/حالة أخرى. تحقق الاختبار أظهر `Unique constraint failed on expense_journals_journal_number_key`.
- لا يوجد `submittedAt` أو `approvedBy/approvedAt` في تدفق الخدمة رغم وجود الحقول.
- لا يوجد route أو service لاعتماد اليومية أو توثيقها.
- reopen مسموح لأي مستخدم authenticated، ولا يطلب ADMIN فعليًا في الراوتر.
- تعديل/حذف مصروف في يومية CLOSED ممنوع لغير ADMIN حسب أول role فقط، لكن عدم ربط `requireRole` يجعل الاعتماد على `roles?.[0]` هشًا.

## 7. التقارير والتصدير

التقارير الموجودة:

- daily expenses.
- by project.
- by beneficiary.
- by category.
- unassigned project transactions.
- pending invoices.
- manual vouchers.

التصدير:

- Excel عبر ExcelJS.
- PDF عبر Puppeteer وقوالب HTML عربية RTL.

نقاط جيدة:

- التصدير يغطي اليومية والتقارير الأساسية.
- الجداول تحتوي على طريقة الدفع والمرجع والملاحظات في تصدير اليومية واليومي.
- PDF يحتوي تواقيع واعتماد.

فجوات:

- `ReportService.getDailyExpensesReport` يستخدم `new Date(dateStr)` و`setHours` بتوقيت الخادم، بينما اليومية تستخدم Asia/Riyadh. قد تظهر فروقات يومية حول منتصف الليل أو عند اختلاف timezone.
- `generatePDF` يستورد خطوط Google من داخل HTML؛ في بيئات مقيدة الشبكة أو production بدون إنترنت قد لا تظهر الخطوط كما ينبغي.
- لا يوجد escaping لقيم HTML داخل PDF؛ أي نص مستفيد/وصف يحتوي HTML قد يدخل في القالب.
- التصدير يبث مباشرة من controller ولا يوجد تخزين/أرشفة/نسخة موقعة أو تاريخ تنزيل.
- `approvedAmount` يعتمد على status، لكن status الجديدة دائمًا APPROVED تقريبًا.

## 8. المشاريع والوحدات

نقاط جيدة:

- إنشاء المشروع يتحقق من unique projectCode.
- منع إدخال مصروف على مشروع متوقف/مؤرشف موجود في TransactionService.
- منع حذف مشروع عليه مصروفات أو وحدات.
- ملخص المشروع يحسب totalSpent/approvedSpent/budgetRemaining.

فجوات:

- `updateProjectStatus` يقبل أي string للحالة من `req.body` ولا يستخدم Zod enum.
- `updateUnit` يمرر `req.body` مباشرة تقريبًا ولا يستخدم `ProjectUnitCreateSchema` أو update schema.
- لا يوجد تحقق أن `projectUnitId` يتبع `projectId` عند إنشاء المصروف؛ والأصل أنه يجب ربط الوحدة بالمشروع الصحيح.
- لا توجد صلاحيات accessLevel فعلية في عمليات المشروع.

## 9. المستخدمون و RBAC

نقاط جيدة:

- إنشاء المستخدم يتحقق من username/employee/email.
- reset password يفعّل `mustChangePassword`.
- منع تعطيل آخر ADMIN موجود.
- حذف المستخدم ممنوع عند وجود روابط مالية.
- sanitize يخفي passwordHash.

فجوات:

- كل مسارات إدارة المستخدمين لا تطلب `users:*` أو دور ADMIN.
- تحديث الأدوار يحذف كل الأدوار ثم ينشئ الجديدة، ولا يمنع إزالة آخر ADMIN.
- لا يوجد تحقق كافٍ من roleIds/projectIds/cashboxIds قبل الإدخال، والاعتماد يكون على قيود قاعدة البيانات.
- status وisActive قد يتباعدان في بعض مسارات التحديث لأن updateUser لا يحدث status إلا في toggle.
- logoutAllSessions غير مطبق فعليًا وغير موصول.

## 10. البيانات المرجعية

### المستفيدون

يوجد بحث وإنشاء وتحديث. الإنشاء يتحقق فقط من الاسم؛ لا توجد Zod schema للبريد/النوع/IBAN/الضريبة. لا يوجد audit log لإنشاء/تعديل المستفيد.

### التصنيفات

يوجد create/update service، لكن update غير موصول route. لا يوجد تحقق كافٍ من `code/name/parentId/accountingAccountCode`، ولا audit log.

### الصناديق

يوجد get/create/update. لا توجد قيود تشغيلية تمنع تعطيل صندوق مرتبط بيوميات، ولا audit log، ولا صلاحيات.

### طرق الدفع

GET فقط. Seed يعرف `CASH`, `BANK_TRANSFER`, `CARD`, `CHEQUE`, `PETTY_CASH`. هذا جيد كمرجع ثابت، لكن لا توجد إدارة تشغيلية أو API update إذا تغيرت السياسات.

## 11. Audit Log

AuditLog موجود ويستخدم في إنشاء/تعديل/حذف المصروف، إغلاق/فتح اليومية، إعداد النظام، مشاريع، ومستخدمين جزئيًا.

الفجوات:

- ليس شاملًا لكل الموارد: المستفيدون، التصنيفات، الصناديق، الوحدات لا تسجل دائمًا.
- بعض الإجراءات لا تحفظ oldValues/newValues كاملة.
- route `/audit-logs` لا يفرض صلاحية خاصة.
- mapping يحول `userId` إلى Number حتى لو كان null، وهذا قد ينتج `0` بدل null في JavaScript عند `Number(null)`.

## 12. المرفقات والرفع

Prisma يحتوي `TransactionAttachment`، و`upload.middleware.ts` موجود، لكن routes الحالية لا تعرض endpoints لإرفاق فواتير/صور سندات أو ربطها بالمعاملة. لذلك نموذج المرفقات غير مستخدم عمليًا في API الحالي.

## 13. الاختبارات

يوجد ملفان:

- `apps/api/tests/api.test.ts`: تسجيل دخول، me، فشل كلمة مرور، إعدادات، مستفيدون/تصنيفات، today overview/list.
- `apps/api/tests/integration.test.ts`: login, today overview, create/update/delete transaction, إنشاء مشروع، منع مصروف على مشروع متوقف.

الفجوات:

- تعتمد على قاعدة بيانات وبيانات seed فعلية وليست isolated test DB.
- عند تشغيل الاختبارات بتاريخ 2026-08-26 نجح `check-types`، ونجح build للحزمة المشتركة، لكن `pnpm --filter api test` انتهى بـ 14/15 اختبارًا ناجحًا وفشل واحد في `GET /api/v1/today` بسبب تصادم unique في `journalNumber`.
- لا توجد اختبارات صلاحيات.
- لا توجد اختبارات طرق الدفع التي تتطلب reference.
- لا توجد اختبارات تصدير Excel/PDF.
- لا توجد اختبارات race condition للترقيم.
- `integration.test.ts` يستورد `request` من مكتبة `request` بدون استخدام، والحزمة غير موجودة في dependencies الظاهرة، ما قد يكسر typecheck/build.

## 14. الأمن والإنتاجية

المخاطر الإنتاجية:

- أسرار افتراضية في config.
- CORS يسمح localhost إضافة إلى origin من env.
- static `/uploads` مفتوح دون تحقق صلاحية.
- لا توجد سياسة تفويض routes.
- لا توجد حماية brute force مخصصة للـ login.
- لا يوجد token blacklist أو session store.
- رسائل الخطأ في non-production تعيد `err.message`، وهذا مناسب للتطوير فقط.

## 15. الفجوات المحاسبية

النظام الحالي مناسب كدفتر مصروفات تشغيلي:

- يسجل مصروفًا بمستفيد وتصنيف ومشروع وطريقة دفع.
- يجمع totals ويصدر كشوفات.
- يغلق اليوميات.

لكنه ليس جاهزًا كمحاسبة مالية كاملة:

- لا يوجد قيد مزدوج debit/credit.
- لا يوجد دفتر أستاذ عام.
- لا يوجد ربط صندوق/بنك بحساب محاسبي.
- `ExpenseCategory.accountingAccountCode` نص اختياري فقط.
- لا يوجد period lock أو reversal/correction workflow.
- لا يمكن إنتاج ميزان مراجعة موثوق من schema الحالي.

## 16. ترتيب الإصلاح المقترح

### أولوية حرجة

1. ربط `requirePermission` بكل routes الحساسة: users, settings, journals close/reopen/export, reports, master data.
2. إضافة workflow مراجعة واضح: `PENDING_REVIEW -> DOCUMENTED/APPROVED -> CLOSED/POSTED` حسب القرار التجاري.
3. إضافة routes/service لاعتماد اليومية واعتماد/رفض السند أو إزالة أزرار الواجهة التي تتوقعها.
4. استبدال `count() + 1` بآلية sequence آمنة داخل DB transaction أو جدول عدادات unique لكل سنة.
5. تعديل ترقيم اليومية ليكون فريدًا حسب التاريخ والصندوق أو إضافة unique مركب مناسب على `(journalDate, cashboxId)` مع رقم عرض آمن.
6. منع تعديل/حذف السندات بعد الاعتماد/التوثيق إلا عبر reversal/correction.

### أولوية عالية

1. توحيد Zod validation لكل الموارد: beneficiaries, categories, cashboxes, units, user role/project/cashbox assignment.
2. حفظ `projectUnitId`, `invoiceDate`, `invoiceAmount`, و`invoiceStatus` في تدفق today إذا كانت جزءًا من العقد.
3. تحقق أن الوحدة تتبع المشروع.
4. تطبيق صلاحيات الصندوق والمشروع من `UserCashbox` و`UserProject`.
5. جعل أسرار JWT وDATABASE_URL إلزامية في production.

### أولوية متوسطة

1. توحيد timezone في التقارير مع `getRiyadhDate`.
2. إضافة HTML escaping لتصدير PDF.
3. إضافة endpoints للمرفقات وربطها بالصرف.
4. توسيع AuditLog للبيانات المرجعية والوحدات والصناديق.
5. حسم ازدواجية `apps/api` و`backend` وتوثيق المسار الرسمي.

### أولوية اختبار

1. بناء shared قبل API typecheck.
2. إضافة test DB isolated أو reset بين الاختبارات.
3. اختبارات permission matrix.
4. اختبارات payment reference.
5. اختبارات close/reopen/status locking.
6. اختبارات export smoke.

## 17. الخلاصة

الباك اند الحالي صالح كنواة تشغيلية جيدة لإدخال مصروفات يومية وإصدار كشوف، لكنه ليس مكتملًا كنظام رقابة مالية/محاسبية إنتاجي. أكبر فرق بين "يعمل" و"جاهز للتشغيل الحقيقي" هو التفويض ودورة الاعتماد والتجميد والترقيم الآمن. بعد إغلاق هذه الفجوات، يصبح النظام أكثر قابلية للاعتماد اليومي أمام المحاسب والإدارة.
