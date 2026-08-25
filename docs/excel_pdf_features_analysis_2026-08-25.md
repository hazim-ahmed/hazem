# تحليل مميزات Excel و PDF

تاريخ التحليل: 2026-08-25

النطاق: تحليل وظائف التصدير والطباعة في مشروع `exoen_man` من الواجهة إلى الـ API ثم خدمة التوليد.

## الخلاصة التنفيذية

النظام يملك طبقة تصدير عملية ومستخدمة فعليا في الواجهة. Excel موجه أكثر للتحليل والمراجعة الرقمية، بينما PDF موجه للطباعة والاعتماد الإداري لأنه يتضمن قالبا عربيا وخانات توقيع. التنفيذ مركزي في `apps/api/src/services/export.service.ts`، ويتم استدعاؤه من اليوميات ومن عدة تقارير مالية.

## أماكن ظهور الميزة في الواجهة

- الداشبورد يصدّر يومية اليوم الحالية إلى Excel أو PDF عبر مسارات اليومية: `apps/web/app/dashboard/page.tsx:25` و `apps/web/app/dashboard/page.tsx:38`.
- صفحة تفاصيل اليومية توفر زري Excel و PDF لليومية المحددة: `apps/web/app/journals/[id]/page.tsx:32` و `apps/web/app/journals/[id]/page.tsx:43`.
- قائمة اليوميات تدعم تنزيل كل يومية حسب النوع المختار: `apps/web/app/journals/page.tsx:19`.
- تقرير المصروفات حسب المشروع يمرر فلتر `projectId` نفسه للتصدير: `apps/web/app/reports/by-project/page.tsx:19` و `apps/web/app/reports/by-project/page.tsx:31`.
- تقارير السندات اليدوية والفواتير المعلقة والسندات غير المربوطة توفر نفس نمط التصدير إلى Excel/PDF.
- وظيفة التنزيل العامة تستخدم `responseType: 'blob'` وتقرأ `content-disposition` لاستخراج اسم الملف من الخادم: `apps/web/lib/download.ts:3` و `apps/web/lib/download.ts:6` و `apps/web/lib/download.ts:11`.

## مسارات API المدعومة

المسارات محمية بـ `authenticateJWT`، أي أن التصدير ليس عاما:

- `/journals/:id/export/excel` و `/journals/:id/export/pdf`: `apps/api/src/routes/index.ts:41` و `apps/api/src/routes/index.ts:42`.
- `/reports/daily-expenses/export/excel` و `/reports/daily-expenses/export/pdf`: `apps/api/src/routes/index.ts:117` و `apps/api/src/routes/index.ts:118`.
- `/reports/by-project/export/excel` و `/reports/by-project/export/pdf`: `apps/api/src/routes/index.ts:121` و `apps/api/src/routes/index.ts:122`.
- `/reports/unassigned-project-transactions/export/excel` و `/reports/unassigned-project-transactions/export/pdf`: `apps/api/src/routes/index.ts:128` و `apps/api/src/routes/index.ts:129`.
- `/reports/pending-invoices/export/excel` و `/reports/pending-invoices/export/pdf`: `apps/api/src/routes/index.ts:132` و `apps/api/src/routes/index.ts:133`.
- `/reports/manual-vouchers/export/excel` و `/reports/manual-vouchers/export/pdf`: `apps/api/src/routes/index.ts:136` و `apps/api/src/routes/index.ts:137`.

## مميزات Excel

1. ملفات `.xlsx` حقيقية عبر `exceljs` وليس CSV مبسطا. الاعتماد ظاهر في `apps/api/package.json:23`.
2. دعم RTL داخل الشيت عبر `views: [{ rightToLeft: true }]`: `apps/api/src/services/export.service.ts:55` و `apps/api/src/services/export.service.ts:386`.
3. تنسيق محاسبي واضح: أعمدة محددة، عرض أعمدة، ترويسة ملونة، حدود، ومحاذاة عربية مناسبة.
4. الأعمدة الرقمية تستخدم تنسيق `#,##0.00`، وهذا يجعل المبالغ قابلة للجمع والتحليل في Excel.
5. يوجد صف إجمالي مدمج ومميز في اليومية والتقارير العامة: `apps/api/src/services/export.service.ts:125` و `apps/api/src/services/export.service.ts:438`.
6. الخدمة تدعم مولدا خاصا للمصروفات اليومية ومولدا عاما لأي تقرير بأعمدة ديناميكية: `generateExcel` في `apps/api/src/services/export.service.ts:49` و `generateGenericExcel` في `apps/api/src/services/export.service.ts:380`.
7. التصدير يتم كـ stream إلى response مباشرة عبر `workbook.xlsx.write(res)`: `apps/api/src/services/export.service.ts:166` و `apps/api/src/services/export.service.ts:474`.

أفضل استخدام عملي لـ Excel: المراجعة المالية، الفرز، التحليل، إعادة الجمع، مشاركة الجداول مع المحاسب، والتحقق من totals.

## مميزات PDF

1. ملفات PDF تولد من HTML عربي باستخدام Puppeteer، والاعتماد ظاهر في `apps/api/package.json:29`.
2. القالب مضبوط باتجاه `rtl` ولغة عربية ويستخدم CSS للطباعة.
3. PDF يحتوي ترويسة تقرير، تاريخ التقرير، عدد السجلات، جدول بيانات، وصف إجمالي، وخانات توقيع واعتماد.
4. خانات التوقيع موجودة صراحة في القالب: `apps/api/src/services/export.service.ts:268` و `apps/api/src/services/export.service.ts:329`، وكذلك في المولد العام: `apps/api/src/services/export.service.ts:546` و `apps/api/src/services/export.service.ts:575`.
5. يدعم خلفيات الطباعة ومقاس A4 وهوامش مناسبة: `apps/api/src/services/export.service.ts:353` و `apps/api/src/services/export.service.ts:599`.
6. يستعمل `Content-Type: application/pdf` و `Content-Length` لإرسال ملف قابل للتنزيل: `apps/api/src/services/export.service.ts:365` و `apps/api/src/services/export.service.ts:606`.
7. PDF مناسب للإجراءات الورقية: اعتماد الإدارة، توقيع المشرف، إرفاق التقرير بملف يومية، أو أرشفته.

أفضل استخدام عملي لـ PDF: الطباعة، الاعتماد، الأرشفة الرسمية، وإرسال نسخة ثابتة لا يراد تعديلها.

## التقارير المغطاة

- اليومية المحددة واليومية الحالية.
- تقرير المصروفات اليومية.
- تقرير المصروفات حسب المشروع.
- تقرير السندات اليدوية.
- تقرير الفواتير المعلقة.
- تقرير السندات غير المرتبطة بمشاريع.

ملاحظة: يوجد تقريران للعرض فقط بدون تصدير ظاهر في الـ routes الحالية: المصروفات حسب المستفيد والمصروفات حسب التصنيف. مسارات العرض موجودة في `apps/api/src/routes/index.ts:124` و `apps/api/src/routes/index.ts:125`، لكن لا توجد لهما مسارات `/export/excel` أو `/export/pdf`.

## نقاط قوة التصميم

- مركزية التوليد تقلل تكرار تنسيق الملفات.
- نفس البيانات التي تعرضها التقارير يتم استخدامها في التصدير من الكونترولرز.
- فصل جيد بين جلب البيانات `ReportService` وتجهيز الملف `ExportService`.
- الواجهة تقدم حالة تحميل مستقلة لكل زر، فلا يختلط تنزيل Excel بتنزيل PDF.
- أسماء الملفات تأتي من الخادم عند توفر `Content-Disposition`، مع fallback من الواجهة.

## ملاحظات ومخاطر

1. قوالب PDF تدرج قيم النصوص داخل HTML مباشرة. إذا احتوت البيانات على رموز HTML، فهناك خطر تشويه القالب أو HTML injection داخل ملف PDF. الأفضل إضافة escape موحد لكل قيم النص.
2. PDF يستورد خط Cairo من Google Fonts داخل HTML. في بيئة إنتاج بدون إنترنت أو بسياسات شبكة مغلقة، قد لا يحمل الخط، فيتغير شكل العربية. الأفضل تضمين خط محلي أو الاعتماد على خط مثبت داخل صورة Docker.
3. Puppeteer يفتح متصفحا لكل ملف PDF. هذا عملي للتقارير الصغيرة والمتوسطة، لكنه قد يصبح مكلفا مع ضغط استخدام عال أو تقارير كبيرة.
4. Excel يرسل الملف مباشرة إلى response. هذا جيد، لكن لا توجد حدود واضحة لحجم التقرير أو pagination للتصدير.
5. `Content-Disposition` يستخدم `filename` فقط مع `encodeURIComponent`. بعض المتصفحات تتعامل أفضل مع `filename*` للترميز العربي والرموز.
6. صفحة تفاصيل اليومية تستورد `openPdfInNewTab` لكنها لا تستخدمه فعليا، إذ يتم تنزيل PDF مثل باقي الملفات: `apps/web/app/journals/[id]/page.tsx:7`.
7. تقرير اليومية في Excel لا يتضمن كل الحقول الظاهرة في واجهة اليومية مثل المشروع، رقم الفاتورة، الملاحظات، ومرجع الدفع. الحقول الحالية تركز على: نوع الدفع، رقم السند، التاريخ، المستفيد، التفاصيل، المبلغ.

## توصيات تحسين مختصرة

- إضافة دالة escape HTML قبل بناء أي PDF.
- تضمين خط عربي محلي داخل التطبيق أو Docker image.
- إضافة تصدير Excel/PDF لتقريري المستفيد والتصنيف إن كانا مطلوبين تشغيليا.
- توسيع أعمدة يومية Excel/PDF لتشمل المشروع ورقم الفاتورة والملاحظات إذا كانت نسخة الاعتماد يجب أن تطابق شاشة اليومية.
- إضافة اختبارات smoke لمسارات التصدير تتحقق من `Content-Type` وبداية ملف PDF وصحة فتح workbook.
- تحسين `Content-Disposition` بإضافة `filename*` بجانب `filename`.

## الحكم النهائي

ميزة Excel ناضجة بما يكفي للمراجعة والتحليل المالي اليومي، وميزة PDF ناضجة كنسخة طباعة واعتماد. أقوى جزء في التنفيذ هو مركزية `ExportService` ودعم RTL والتواقيع. أكبر فجوة عملية ليست في وجود الميزة، بل في حماية HTML داخل PDF، واعتمادية خط خارجي، وعدم تغطية بعض التقارير أو بعض حقول شاشة اليومية في التصدير.
