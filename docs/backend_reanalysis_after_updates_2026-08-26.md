# إعادة تحليل الباك اند بعد التعديلات

تاريخ إعادة التحليل: 2026-08-26  
النطاق: `apps/api` + `packages/shared` + اختبارات `apps/api/tests`  
سبب التقرير: المستخدم أجرى تعديلات واسعة بعد التحليل السابق وطلب إعادة التحليل.

## 1. الخلاصة التنفيذية

التعديلات حسنت الباك اند بوضوح. أهم التحسينات التي أصبحت موجودة الآن:

1. تم تركيب `requirePermission` على معظم routes الحساسة بدل الاكتفاء بـ `authenticateJWT`.
2. تم إضافة routes لاعتماد اليومية واعتماد/رفض سند الصرف.
3. تم إضافة endpoints للمرفقات: رفع، عرض، حذف.
4. تم توسيع Zod schemas للبيانات المرجعية والمشاريع والوحدات وربط المستخدمين.
5. تم حفظ حقول مهمة في المصروف اليومي: `projectUnitId`, `invoiceStatus`, `invoiceDate`, `invoiceAmount`.
6. تم التحقق أن الوحدة تتبع المشروع.
7. تم إضافة `escapeHtml` في قوالب PDF.
8. تم تحسين إعدادات الإنتاج بحيث ترفض أسرار JWT الافتراضية وغياب `DATABASE_URL` في production.
9. الاختبارات الحالية أصبحت تمر: 25/25.

لكن النظام ما زال ليس جاهزًا بالكامل كمنظومة مالية محكمة. أعلى المخاطر المتبقية بعد التعديلات:

1. مسار `PATCH /expense-transactions/bulk-assign-project` موضوع بعد `PATCH /expense-transactions/:id`، وبالتالي قد لا يصل للـ controller الصحيح في Express.
2. توليد `systemReference` ما زال غير آمن للتزامن؛ استبدل `count()` بقراءة آخر سجل، لكنه ما زال خارج آلية sequence/lock/retry.
3. المصروف الجديد ما زال ينشأ بحالة `APPROVED` مباشرة، لذلك مسار الاعتماد موجود تقنيًا لكنه ليس دورة مراجعة فعلية.
4. صلاحيات الصندوق للمستخدم غير الإداري تسمح بالمرور إذا لم توجد علاقة `UserCashbox` أصلًا؛ المنع يحدث فقط إذا وجدت علاقة لكنها غير فعالة/غير مخولة.
5. حالات اليومية والسندات لا تزال غير مضبوطة كـ state machine: يمكن اعتماد يومية دون قيود كافية، ورفض سند معتمد إذا لم تكن اليومية مغلقة.
6. `backend` الموازي خارج `apps/api` قد يظل غير متزامن مع هذه التعديلات إذا كان هو المستخدم في النشر.

## 2. ما تغير للأفضل

### 2.1 الصلاحيات على مستوى الراوتر

الراوتر الآن يستخدم `requirePermission` على اليوميات، المصروفات، المشاريع، المستخدمين، الإعدادات، التقارير، وسجل التدقيق. هذا يعالج واحدة من أخطر فجوات التحليل السابق.

أمثلة مهمة:

- `/today/transactions` يحتاج `transactions:create/read/update/cancel`.
- `/journals/:id/approve` يحتاج `journals:approve`.
- `/expense-transactions/:id/approve` يحتاج `transactions:approve`.
- `/reports/*` يحتاج `reports:view`.
- `/audit-logs` يحتاج `users.view_activity`.

هذا جيد بشرط أن تكون صلاحيات الأدوار مزروعة في قاعدة البيانات. ملف seed يحتوي الصلاحيات الأساسية مثل `transactions:approve`, `journals:approve`, `reports:view`, و`users.view_activity`.

### 2.2 الاعتماد والرفض

تمت إضافة:

- `JournalController.approve` و `JournalService.approveJournal`.
- `TransactionController.approve/reject`.
- `TransactionService.approveTransaction/rejectTransaction`.
- تسجيل في `ExpenseApproval` و `AuditLog` عند اعتماد/رفض السند.

هذا ينقل النظام من مجرد إغلاق يومية إلى وجود عمليات مراجعة محاسبية قابلة للتتبع.

### 2.3 المرفقات

تمت إضافة:

- `AttachmentController`.
- `AttachmentService`.
- routes للرفع/list/delete.
- استخدام `multer` مع فلترة PDF و JPG و PNG.
- تسجيل audit عند رفع وحذف المرفق.

هذا يعالج فجوة مهمة: كان Prisma يحتوي `TransactionAttachment` لكن لا يوجد API عملي لاستخدامه.

### 2.4 التحقق المشترك

تمت إضافة schemas جديدة في `packages/shared/src/schemas/index.ts`:

- `ProjectStatusUpdateSchema`.
- `ProjectUnitUpdateSchema`.
- `UserRolesUpdateSchema`.
- `UserProjectsUpdateSchema`.
- `UserCashboxesUpdateSchema`.
- `BeneficiaryCreateSchema/UpdateSchema`.
- `ExpenseCategoryCreateSchema/UpdateSchema`.
- `CashboxCreateSchema/UpdateSchema`.

كما أصبحت Controllers المستفيد/التصنيف/الصندوق/الوحدات تستخدم Zod بدل تمرير `req.body` مباشرة.

### 2.5 التقارير والتصدير

تم تحسين التقرير اليومي لاستخدام تاريخ مضبوط بصيغة `YYYY-MM-DD` وبحدود UTC مبنية من التاريخ المرسل بدل `setHours` على كائن محلي. كذلك تمت إضافة `escapeHtml` في PDF لتقليل خطر حقن HTML داخل القالب.

## 3. تحليل التدفق المالي الحالي

### 3.1 إنشاء مصروف اليوم

التدفق الحالي:

1. `TodayController.createTransaction`.
2. `TodayTransactionCreateSchema`.
3. `TransactionService.createTodayTransaction`.
4. `JournalService.getOrCreateTodayJournal`.
5. تحقق من الصندوق/المشروع/الوحدة/طريقة الدفع.
6. إنشاء transaction.
7. AuditLog.

التحسينات واضحة: التحقق من طريقة الدفع ومرجع الدفع ما زال موجودًا، وتمت إضافة تحقق أن الوحدة تتبع المشروع، وحفظ تفاصيل الفاتورة والوحدة.

الفجوة الكبيرة: السند ينشأ بحالة `APPROVED` مباشرة. هذا يعني أن مسار الاعتماد لا يمثل مراجعة قبل الاعتماد إلا إذا تم إنشاء سندات بحالة `DRAFT` أو `PENDING_REVIEW` من مسار آخر لاحقًا.

### 3.2 اعتماد السند

`approveTransaction` يرفض اعتماد السند إذا كان `APPROVED` بالفعل، ويحدث `approvedBy/approvedAt` ويضيف `ExpenseApproval`.

المشكلة: بما أن الإنشاء اليومي يضع `APPROVED` مباشرة، فإن اعتماد سند جديد مباشرة سيعطي `ALREADY_APPROVED`. الاختبار ينجح لأنه يرفض السند أولًا ثم يعتمده، وليس لأنه اختبر مسار "إنشاء -> انتظار مراجعة -> اعتماد".

### 3.3 رفض السند

`rejectTransaction` يطلب سببًا ويسجل `REJECTED` و`rejectionReason`. لكنه لا يمنع رفض سند `APPROVED` إذا كانت اليومية ليست مغلقة. هذا قد يكون مقبولًا كإجراء تصحيح، لكنه يحتاج قرارًا واضحًا: هل الرفض بعد الاعتماد مسموح، أم يجب أن يكون reversal/correction؟

### 3.4 اعتماد اليومية

`approveJournal` يضع اليومية `APPROVED` ويعتمد سندات `DRAFT` و`PENDING_REVIEW`. لكنه لا ينشئ سجل `ExpenseApproval` لليومية نفسها رغم وجود علاقة `ExpenseJournal.approvals`. كما لا توجد قيود واضحة تمنع اعتماد يومية مغلقة أو إعادة اعتماد يومية معتمدة.

## 4. مشكلة Route Order

هذه أهم مشكلة تنفيذية متبقية:

```ts
router.patch('/expense-transactions/:id', ...)
router.patch('/expense-transactions/bulk-assign-project', ...)
```

في Express، المسار الأول يمكن أن يلتقط `/expense-transactions/bulk-assign-project` باعتبار `id = "bulk-assign-project"`، وبالتالي يصل إلى `TransactionController.update` بدل `bulkAssignProject`. عندها `parseInt` ينتج `NaN` وقد يفشل عند `BigInt(NaN)`.

الإصلاح: ضع route الثابت قبل route المتغير:

```ts
router.patch('/expense-transactions/bulk-assign-project', ...)
router.patch('/expense-transactions/:id', ...)
```

يفضل إضافة اختبار مباشر لهذا المسار لأن الاختبارات الحالية لا تغطيه بعد التعديل.

## 5. الصلاحيات و RBAC

التحسن كبير، لكن توجد ملاحظات:

- `requirePermission` يعتمد على بيانات permissions في DB، لذلك أي بيئة غير مزروعة أو قديمة ستبدأ بإرجاع 403 لمسارات كثيرة.
- `users/:id/status` يستخدم دائمًا `users.activate` حتى عند التعطيل؛ الأفضل التفريق بين `users.activate` و`users.deactivate`.
- تعديل أدوار المستخدم لا يمنع إزالة دور ADMIN من آخر مدير فعال.
- `mustChangePassword` لا يزال غير مفروض عند login أو middleware.
- `/auth/logout` لا يبطل token فعليًا.

## 6. الصناديق والمشاريع

تحقق المشروع والوحدة تحسن. لكن صلاحية الصندوق تحتاج ضبط:

```ts
if (userCashbox && (!userCashbox.isActive || !userCashbox.canCreateTransaction)) deny
```

هذا يعني أن المستخدم غير الإداري إذا لم يكن له سجل `UserCashbox` أصلًا، لن يتم منعه. إن كان المطلوب أن الصندوق لا يعمل إلا بتفويض صريح، يجب أن يكون الشرط:

- إذا لم توجد علاقة: deny.
- إذا وجدت لكنها غير فعالة أو لا تملك canCreateTransaction: deny.

كذلك `JournalService.getOrCreateTodayJournal` ما زال يختار أول صندوق active في النظام، لا صندوق المستخدم أو الصندوق المختار.

## 7. الترقيم

### 7.1 رقم اليومية

تحسن رقم اليومية من `JRN-YYYYMMDD` إلى `JRN-YYYYMMDD-CASHCODE`. هذا يعالج التصادم بين الصناديق بشكل أفضل، لكن لا توجد unique مركبة على `(journalDate, cashboxId)` في Prisma. الاعتماد فقط على البحث قبل الإنشاء مع unique على النص قد يكفي غالبًا، لكنه ليس مثاليًا تحت التزامن.

### 7.2 رقم المصروف

تم تغيير توليد `systemReference` إلى قراءة آخر سند في السنة واستخراج الرقم التالي. هذا أفضل من `count() + 1` في حالة الحذف، لكنه ليس "concurrency-safe" فعليًا. طلبان متزامنان قد يقرآن نفس آخر رقم وينشئان نفس المرجع.

الحل الصحيح:

- جدول sequence سنوي مع update ذري داخل transaction.
- أو unique retry loop عند Prisma `P2002`.
- أو عداد DB-level/locking مناسب لـ MySQL.

## 8. المرفقات

الـ API الجديد جيد كبداية، لكن توجد حدود إنتاجية:

- حذف المرفق يحذف صف قاعدة البيانات ثم يحاول حذف الملف من القرص. إذا فشل حذف الملف يبقى orphan file.
- لا توجد route تحميل محمية للملف؛ الموجود فقط static `/uploads` في `app.ts`.
- static `/uploads` قد يسمح بالوصول المباشر للملفات لمن يعرف الاسم، بدون تحقق صلاحية.
- نوع الملف يعتمد على `mimetype` من Multer، وليس فحص محتوى الملف.
- `attachmentType` لا يستخدم enum/Zod رغم وجود `AttachmentType` في shared constants.

## 9. التقارير والتصدير

تحسن HTML escaping. لكن بقي:

- بعض مواضع القالب لا تزال تدخل `options.title`, `options.subtitle`, `reportDate`, `cashboxName`, `journalNumber` بدون escape في `generatePDF`/`generateGenericPDF`.
- خطوط Google في PDF تعتمد على الإنترنت؛ في بيئة production مغلقة قد يسقط الخط.
- التصدير لا يخزن نسخة مؤرشفة ولا يربطها بحالة اعتماد اليومية.

## 10. البيانات المرجعية والسجل التدقيقي

تحسن واضح:

- المستفيدون يسجلون CREATE/UPDATE audit.
- التصنيفات تسجل CREATE/UPDATE audit.
- الصناديق تسجل CREATE/UPDATE audit.
- وحدات المشاريع تسجل CREATE/UPDATE/DELETE audit.

المتبقي:

- لا يوجد audit لبعض تحديثات روابط المستخدم بالمشاريع/الصناديق.
- oldValues/newValues جزئية غالبًا، وليست snapshot كاملة.
- لا توجد حماية قوية من حذف/تعديل بيانات مرجعية مستخدمة إلا في بعض الموارد.

## 11. الاختبارات والتحقق

تم تشغيل التحقق بعد التعديلات:

- `pnpm --filter @expense-system/shared build`: نجح.
- `pnpm --filter api check-types`: نجح.
- `pnpm --filter api test`: نجح، 25 اختبارًا في ملفين.

الاختبارات الآن تغطي:

- login و auth/me.
- إعدادات النظام.
- today overview/list/create/update/delete.
- منع مصروف على مشروع متوقف.
- reject/approve transaction.
- approve journal.
- missing authorization header.
- unit/project mismatch.
- حفظ حقول الفاتورة والوحدة.
- Zod validation للمستفيد.
- daily report date format.
- upload/list/delete attachments.
- audit log لإنشاء مستفيد.

فجوات الاختبار المتبقية:

- لا يوجد اختبار مباشر لمسار `bulk-assign-project` بعد تغيير ترتيب routes.
- لا يوجد اختبار لمستخدم غير ADMIN يملك/لا يملك صلاحية route.
- لا يوجد اختبار لمستخدم بلا `UserCashbox`.
- لا يوجد اختبار لتزامن `systemReference`.
- لا يوجد اختبار لتصدير Excel/PDF.
- لا يوجد اختبار لتحميل الملفات المحمي أو منع الوصول غير المصرح للمرفقات.

## 12. الجاهزية الحالية

التقييم الحالي: **أفضل بكثير من النسخة السابقة، وقابل لتجربة تشغيلية داخلية، لكنه يحتاج دورة ضبط قبل الإنتاج المالي الحقيقي.**

جاهز نسبيًا لـ:

- تسجيل مصروفات يومية.
- حفظ بيانات مشروع/وحدة/فاتورة.
- تقارير تشغيلية.
- تصدير Excel/PDF.
- مرفقات سندات.
- صلاحيات عامة على routes عند وجود seed صحيح.

غير مكتمل لـ:

- دورة محاسبية صارمة.
- اعتماد فعلي يبدأ من `PENDING_REVIEW`.
- منع التلاعب بعد الاعتماد.
- ترقيم آمن تحت التزامن.
- حماية ملفات المرفقات من الوصول المباشر.
- ميزان مراجعة أو دفتر أستاذ.
- نشر مطمئن إذا كان `backend` الموازي هو الذي يعمل بدل `apps/api`.

## 13. الأولويات المقترحة بعد التعديلات

1. إصلاح ترتيب `bulk-assign-project` قبل `/:id` وإضافة اختبار له.
2. تغيير إنشاء المصروف إلى `PENDING_REVIEW` أو تحديد سبب تجاري واضح لبقائه `APPROVED`.
3. بناء state machine واضحة للسند واليومية: مسموح/ممنوع لكل انتقال.
4. جعل ترقيم `systemReference` ذريًا مع retry أو جدول sequence.
5. جعل صلاحية الصندوق deny by default للمستخدم غير الإداري.
6. إضافة route تحميل مرفق محمية وإيقاف/تقييد static `/uploads`.
7. منع إزالة آخر ADMIN عند تعديل الأدوار، وليس فقط عند تعطيل المستخدم.
8. حسم مسار النشر: هل الإنتاج يستخدم `apps/api` أم `backend`، ثم مزامنة/إزالة الازدواج.

## 14. الحكم النهائي

التعديلات عالجت معظم النقاط الحرجة التي ظهرت في التحليل الأول: التفويض، المرفقات، الاعتماد، Zod، حقول الفاتورة والوحدة، ونتيجة الاختبارات. المتبقي الآن أعمق وأقرب إلى ضبط تشغيل مالي حقيقي: ترتيب route واحد خطر، دورة حالة محاسبية صريحة، ترقيم ذري، وحماية ملفات المرفقات.

