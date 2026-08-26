# تحقق بعد تطبيق مطابقة الفرونت إند والباك إند

تاريخ التحقق: 2026-08-26  
النطاق: `apps/web`, `apps/api`, `packages/shared`

## النتيجة المختصرة

تم تطبيق الجزء الأكبر من المطابقة المطلوبة. الواجهة أصبحت تستخدم مسارات كانت ناقصة سابقًا، خصوصًا:

- اعتماد السند: `POST /expense-transactions/:id/approve`
- رفض السند: `POST /expense-transactions/:id/reject`
- اعتماد اليومية: `POST /journals/:id/approve`
- مرفقات السند: رفع، عرض، حذف
- حقول الفاتورة في إنشاء السند: `invoiceStatus`, `invoiceDate`, `invoiceAmount`
- وحدة المشروع في إنشاء السند: `projectUnitId`
- جلب وحدات المشروع: `GET /projects/:id/units`
- تحديث علاقات المستخدم: roles, projects, cashboxes

هذا يعني أن الفجوة الأساسية بين دورة الباك إند ودورة الشاشة تقلصت بشكل واضح.

## ما أصبح مطابقًا

### دورة السند واليومية

الواجهة في `apps/web/app/dashboard/page.tsx` و `apps/web/app/journals/[id]/page.tsx` أصبحت تستدعي:

- `POST /expense-transactions/:id/approve`
- `POST /expense-transactions/:id/reject`
- `POST /journals/:id/approve`

كما أصبحت تعرض حالات مثل `APPROVED` و `REJECTED` وتعرض سبب الرفض. هذا يغلق فجوة مهمة كانت موجودة في التقرير السابق.

### المرفقات

الواجهة أصبحت تستدعي:

- `GET /expense-transactions/:id/attachments`
- `POST /expense-transactions/:id/attachments`
- `DELETE /expense-transactions/attachments/:attachmentId`

والباك إند يدعم أيضًا:

- `GET /expense-transactions/attachments/:attachmentId/download`

إذًا وظيفة المرفقات أصبحت موجودة في المسار العام.

### نموذج إنشاء السند

صفحة `apps/web/app/transactions/new/page.tsx` أصبحت تستخدم:

- `GET /projects/:id/units`
- `projectUnitId`
- `invoiceStatus`
- `invoiceDate`
- `invoiceAmount`
- رفع مرفق بعد إنشاء السند

هذا يطابق إضافات الباك إند في مخططات `packages/shared/src/schemas/index.ts`.

### تعديل المستخدم

صفحة تعديل المستخدم أصبحت تستدعي:

- `PATCH /users/:id`
- `PATCH /users/:id/roles`
- `PATCH /users/:id/projects`
- `PATCH /users/:id/cashboxes`

وهذا يطابق مسارات الباك إند لإدارة علاقات المستخدم.

## ما لا يزال غير مكتمل أو يحتاج إصلاحًا

### 1. مسار `GET /roles` مستخدم في الواجهة وغير موجود في الباك إند

في `apps/web/app/users/[id]/edit/page.tsx` توجد قراءة:

```ts
api.get('/roles')
```

لكن `apps/api/src/routes/index.ts` لا يحتوي على:

```ts
router.get('/roles', ...)
```

الأثر: صفحة تعديل المستخدم قد تفشل وقت التشغيل عند تحميل الأدوار، رغم أن `web check-types` ينجح.

الإصلاح المطلوب: إما إضافة `GET /roles` في الباك إند بصلاحية مناسبة، أو جعل الواجهة تعتمد على مصدر أدوار موجود بالفعل.

### 2. تحميل المرفق من الواجهة يستخدم رابطًا مباشرًا لا يرسل Authorization

في صفحات `dashboard` و `journals/[id]` يتم عرض رابط تحميل مثل:

```tsx
href={`/api/v1/expense-transactions/attachments/${att.id}/download`}
```

هذا الرابط لا يستخدم `api.get(..., { responseType: 'blob' })` ولا يضيف ترويسة `Authorization` من axios interceptor.

الأثر: إذا كان الباك إند يعتمد على JWT في الهيدر، فتحميل المرفق قد يرجع 401 من المتصفح عند الضغط على الرابط.

الإصلاح المطلوب: استخدام `downloadFile('/expense-transactions/attachments/:id/download', filename)` بدل `href` المباشر.

### 3. مجلد `/uploads` لا يزال منشورًا كـ static

في `apps/api/src/app.ts`:

```ts
app.use('/uploads', express.static(config.upload.dir));
```

رغم وجود مسار تحميل محمي للمرفقات، نشر مجلد الرفع مباشرة يترك احتمال الوصول للملفات عبر الاسم المخزن.

الإصلاح المطلوب: إزالة static serving للمرفقات الحساسة أو فصله عن ملفات عامة غير حساسة.

### 4. واجهات تعديل البيانات الأساسية لا تزال جزئية

الواجهة ما زالت تستخدم فقط:

- `POST /beneficiaries`
- `POST /expense-categories`
- `POST /cashboxes`

بينما الباك إند يدعم:

- `PATCH /beneficiaries/:id`
- `PATCH /expense-categories/:id`
- `PATCH /cashboxes/:id`

الأثر: الإدارة تستطيع الإضافة، لكن لا يوجد مسار واجهي واضح للتعديل/التعطيل رغم توفره في الخادم.

### 5. شرط `REQUIRED_ON_APPROVAL` يحتاج تحققًا وظيفيًا

الواجهة تعرض خيار:

```text
مطلوب عند الاعتماد والإغلاق (REQUIRED_ON_APPROVAL)
```

لكن يجب التحقق من أن الباك إند يمنع فعليًا اعتماد/إغلاق السند أو اليومية عند غياب المشروع. القراءة الحالية تشير إلى أن `TransactionService.createTodayTransaction` يعالج `REQUIRED_ON_CREATE`، أما `approveTransaction` و `closeJournal` فتحتاجان اختبارًا مباشرًا أو منطقًا واضحًا لهذا الشرط.

## التحقق المنفذ

نجحت الأوامر التالية:

```powershell
pnpm --filter @expense-system/shared build
pnpm --filter api check-types
pnpm --filter web check-types
pnpm --filter api test
```

نتيجة اختبارات API:

```text
Test Files  2 passed (2)
Tests       27 passed (27)
```

## الحكم النهائي

التطبيق أنجز أغلب المطابقة المحاسبية الرئيسية. لم تعد الفجوة الكبرى هي غياب الاعتماد أو المرفقات أو حقول الفاتورة من الواجهة، لأن هذه ظهرت الآن.

لكن لا يمكن اعتبار المطابقة مكتملة 100% قبل معالجة النقاط التالية:

1. إضافة أو إصلاح `GET /roles`.
2. جعل تحميل المرفقات يمر عبر axios حتى يحمل التوكن.
3. إغلاق الوصول المباشر إلى `/uploads` إن كانت الملفات حساسة.
4. استكمال واجهات تعديل البيانات الأساسية.
5. إثبات أو تنفيذ منطق `REQUIRED_ON_APPROVAL` في الاعتماد/الإغلاق.
