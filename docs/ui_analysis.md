# تحليل واجهات المستخدم (UI Analysis) — exoen_man

## 📊 ملخص إحصائي

| المؤشر | القيمة |
|--------|--------|
| إجمالي الصفحات | **16** صفحة |
| صفحات مكتملة بالكامل | **11** |
| صفحات جزئية / placeholder | **3** |
| صفحات ناقصة (مفقودة) | **2** |
| مودالات (Dialogs) | **3** |
| جداول (Tables) | **10** |
| نماذج (Forms) | **5** |
| نماذج Inline داخل صفحة | **2** |

---

## 🔐 صفحة تسجيل الدخول — `/login`

**الملف:** [login/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/login/page.tsx)

### العناصر:
- 🏷️ شعار + عنوان رئيسي: "نظام إدارة المصروفات وسندات الصرف"
- 📛 رسالة خطأ ملونة (حمراء) عند فشل تسجيل الدخول
- **حقل اسم المستخدم** — بإيقونة User (مع قيمة افتراضية `admin`)
- **حقل كلمة المرور** — بإيقونة Lock
- **زر تسجيل الدخول** — مع مؤشر Loader أثناء التحميل
- 📋 بيانات تجريبية معروضة صراحةً: `admin / AdminPass123!`

> [!WARNING]
> بيانات الدخول التجريبية مكشوفة في الكود. يجب إزالتها في بيئة الإنتاج.

---

## 🏠 لوحة المعلومات — `/dashboard`

**الملف:** [dashboard/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/dashboard/page.tsx)

### العناصر:
- 🟢 **Banner علوي** (تدرج Emerald→Teal) يعرض:
  - تاريخ الخادم بتوقيت السعودية
  - رقم يومية اليوم التلقائية
  - حالة اليومية (مفتوحة/مغلقة) مع أيقونة 🔓/🔒
  - زر "إضافة مصروف جديد" → `/transactions/new`
- 📈 **بطاقتا إحصاء** (Grid 2 أعمدة):
  - إجمالي مصروفات اليوم (ر.س) — أيقونة DollarSign خضراء
  - عدد عمليات اليوم — أيقونة ListOrdered زرقاء
- 📋 **جدول مصروفات اليوم** يحتوي على:

  | رقم السند اليدوي | المستفيد | التفاصيل | المشروع | رقم الفاتورة | المبلغ | وقت التسجيل | الإجراءات |
  |---|---|---|---|---|---|---|---|

  - لكل سطر: زر **تعديل** (أزرق) + زر **حذف** (أحمر)

- 🪟 **مودال تعديل مصروف** يحتوي:
  - حقل المبلغ (عدد)
  - حقل التفاصيل (نص)
  - حقل رقم السند اليدوي (اختياري)
  - زر حفظ + زر إلغاء

**API Calls:** `GET /today` + `GET /today/transactions` + `PATCH /today/transactions/:id` + `DELETE /today/transactions/:id`

---

## 📝 إضافة سند صرف جديد — `/transactions/new`

**الملف:** [transactions/new/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/transactions/new/page.tsx)

### العناصر:
- 📅 **Banner تحذيري** يعرض تاريخ اليومية التلقائية + زر رجوع
- 🔴 رسالة خطأ حمراء عند فشل الإدخال
- **نموذج إضافة مصروف** (Grid 2 أعمدة):

  | الحقل | النوع | إلزامي؟ |
  |-------|-------|---------|
  | رقم السند اليدوي الورقي | text | لا |
  | المستفيد | select | ✅ |
  | نوع المصروف (التصنيف) | select | ✅ |
  | المشروع | select | يُحدده الإعداد |
  | المبلغ (ر.س) | number | ✅ |
  | رقم الفاتورة | text | لا |
  | التفاصيل / بيان المصروف | text | ✅ (عرض كامل) |
  | ملاحظات إضافية | textarea | لا (عرض كامل) |

- زر **"مستفيد جديد"** بجانب حقل المستفيد لإضافة سريعة
- **مودال إضافة مستفيد سريع**: حقل نص + زر "إضافة وإختيار"

> [!IMPORTANT]
> حقل المشروع يصبح إلزامياً (ويتحول حدوده للون أصفر) إذا كان إعداد النظام = `REQUIRED_ON_CREATE`

**API Calls:** `GET /today` + `GET /beneficiaries` + `GET /expense-categories` + `GET /projects` + `GET /system-settings` + `POST /today/transactions` + `POST /beneficiaries`

---

## 📚 اليوميات اليومية — `/journals`

**الملف:** [journals/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/journals/page.tsx)

### العناصر:
- عنوان: "أرشيف اليوميات اليومية (Daily Journals Archive)"
- **جدول اليوميات**:

  | رقم اليومية | تاريخ اليومية | الحالة | عدد العمليات | إجمالي اليومية | الإجراءات |
  |---|---|---|---|---|---|

  - لكل يومية: زر **عرض** → `/journals/:id` + زر **إعادة فتح/إغلاق يدوي**
  - الحالة تُعرض كـ badge ملون: OPEN (أخضر) / CLOSED (رمادي)

**API Calls:** `GET /journals` + `POST /journals/:id/reopen` + `POST /journals/:id/close`

---

## 📋 تفاصيل اليومية — `/journals/[id]`

**الملف:** [journals/\[id\]/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/journals/[id]/page.tsx)

### العناصر:
- **بطاقة Header** تعرض: رقم اليومية + Badge الحالة (OPEN/CLOSED/APPROVED) + التاريخ + الصندوق
- **أزرار الإجراءات** (تظهر حسب الحالة):
  - زر "إضافة سند جديد" → `/transactions/new?journalId=...`
  - زر "اعتماد اليومية" (يظهر إذا كانت OPEN فقط)
  - زر "إغلاق / إعادة فتح اليومية"
- رسالة خطأ حمراء عند فشل العمليات
- **جدول سندات الصرف** (10 أعمدة):

  | # | رقم السند اليدوي | الرقم الداخلي | المستفيد | الوصف | المشروع | رقم الفاتورة | المبلغ | الحالة | الإجراءات |
  |---|---|---|---|---|---|---|---|---|---|

  - لكل سند: زر **"اعتماد"** (إذا لم يكن APPROVED) + رابط **"ربط بمشروع"** (إذا لم يكن له مشروع)
  - المشروع يُعرض بـ badge أخضر أو "غير مربوط" بـ badge أحمر

- 🔻 **شريط إجماليات ثابت في الأسفل** (fixed bottom bar):
  - عدد العمليات | إجمالي المصروفات | إجمالي المعتمد | إجمالي المرفوض | إجمالي المعلق

**API Calls:** `GET /expense-journals/:id` + `POST /expense-journals/:id/close` + `POST /expense-journals/:id/approve` + `POST /expense-journals/:id/reopen` + `POST /expense-transactions/:id/approve`

---

## 🏗️ قائمة المشاريع — `/projects`

**الملف:** [projects/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/projects/page.tsx)

### العناصر:
- **شريط بحث** + **فلتر حسب الحالة** (ACTIVE/SUSPENDED/PLANNED/COMPLETED/ARCHIVED)
- **جدول المشاريع**:

  | رقم المشروع (Code) | اسم المشروع | مركز التكلفة | الموقع | الحالة | عدد الوحدات | عدد السندات | الإجراءات |
  |---|---|---|---|---|---|---|---|

  - الحالة: badge ملون (أخضر/أحمر/رمادي/أصفر)
  - الإجراءات: **عرض** + **تعديل** + **إيقاف/تفعيل** (toggle) + **أرشفة**
- زر "إضافة مشروع جديد" → `/projects/new`

**API Calls:** `GET /projects` + `PATCH /projects/:id/status` + `POST /projects/:id/archive`

---

## 🏠 تفاصيل مشروع — `/projects/[id]`

**الملف:** [projects/\[id\]/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/projects/[id]/page.tsx)

### العناصر:
- **Header** يعرض: اسم المشروع + كود + badge الحالة + مركز التكلفة + الموقع
- أزرار: تعديل المشروع + رجوع
- **بطاقات إحصاء مالية** (Grid 4):
  - عدد السندات | إجمالي المنصرف | إجمالي المعتمد | الميزانية التقديرية
- **قسم الوحدات العقارية**:
  - نموذج إضافة وحدة inline (رقم الوحدة + نوعها + رقم المبنى + الطابق)
  - عرض الوحدات الحالية كـ Grid بطاقات (2x4)
- **جدول مصروفات المشروع**:

  | رقم السند اليدوي | الرقم الداخلي | المستفيد | التصنيف | المبلغ | الحالة |
  |---|---|---|---|---|---|

**API Calls:** `GET /projects/:id/summary` + `POST /projects/:id/units`

---

## 👥 إدارة المستخدمين — `/users`

**الملف:** [users/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/users/page.tsx)

### العناصر:
- **شريط بحث** + **فلتر الدور** (ADMIN/CASHIER/ACCOUNTANT/MANAGER/VIEWER) + **فلتر الحالة**
- **جدول المستخدمين**:

  | رقم الموظف | اسم المستخدم | الاسم الكامل | البريد/الجوال | الأدوار Roles | الحالة | الإجراءات |
  |---|---|---|---|---|---|---|

  - الإجراءات: **عرض** + **تعديل** + **كلمة السر** (إعادة تعيين) + **تعطيل/تفعيل**
- 🪟 **مودال إعادة تعيين كلمة المرور** يحتوي:
  - حقل كلمة المرور الجديدة
  - رسالة نجاح (خضراء) / خطأ (حمراء)
  - زر تأكيد + زر إلغاء

**API Calls:** `GET /users` + `PATCH /users/:id/status` + `POST /users/:id/reset-password`

---

## 👤 تفاصيل مستخدم — `/users/[id]`

**الملف:** [users/\[id\]/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/users/[id]/page.tsx)

### العناصر:
- **Header**: الاسم الكامل + username + badge الحالة + بيانات التواصل
- أزرار: تعديل الحساب + رجوع
- **بطاقة الأدوار (Roles)**: badges خضراء للأدوار المخصصة
- **Grid بطاقتين**:
  - المشاريع المرتبطة (مع مستوى الوصول `accessLevel`)
  - الصناديق المالية المصرح بها
- **قائمة الصلاحيات الفعلية** (Permissions Checklist): Grid 4 أعمدة من badges mono

**API Calls:** `GET /users/:id`

---

## ⚙️ إعدادات النظام — `/settings`

**الملف:** [settings/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/settings/page.tsx)

### العناصر:
- رسالة نجاح / خطأ
- **بطاقة إعداد واحدة** فقط: "وضع إلزامية ربط المصروفات بالمشاريع"
  - مفتاح النظام: `expenses.project_requirement_mode`
  - **3 خيارات radio** تُطبَّق فور النقر (بدون زر حفظ منفصل):
    1. **OPTIONAL** — اختياري (الافتراضي)
    2. **REQUIRED_ON_APPROVAL** — مطلوب عند الاعتماد/الإغلاق
    3. **REQUIRED_ON_CREATE** — مطلوب فور الإنشاء

> [!NOTE]
> هذه الصفحة بها إعداد واحد فقط. بقية الإعدادات المحتملة للنظام غير معروضة.

**API Calls:** `GET /system-settings` + `PATCH /system-settings/expenses.project_requirement_mode`

---

## 📊 مركز التقارير — `/reports`

**الملف:** [reports/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/reports/page.tsx)

### العناصر:
- **Grid بطاقات تقارير** (3 أعمدة) — 7 تقارير:

  | التقرير | الرابط |
  |---------|--------|
  | تقرير المصروفات اليومية | `/journals` |
  | السندات اليدوية | `/reports/manual-vouchers` |
  | سندات غير مرتبطة بمشروع | `/unassigned-projects` |
  | الفواتير المعلقة | `/reports/pending-invoices` |
  | المصروفات حسب المشروع | `/projects` |
  | المصروفات حسب المستفيد | `/beneficiaries` |
  | المصروفات حسب التصنيف | `/categories` |

- كل بطاقة: أيقونة + عنوان + وصف + hover effect (الأيقونة تصبح خضراء)

---

## 🔗 السندات غير المرتبطة — `/unassigned-projects`

**الملف:** [unassigned-projects/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/unassigned-projects/page.tsx)

### العناصر:
- رسالة نجاح (خضراء) / خطأ (حمراء)
- **أداة الربط الجماعي**:
  - Dropdown لاختيار المشروع المستهدف
  - حقل "سبب الربط التوثيقي" (بقيمة افتراضية)
  - زر الحفظ يُظهر عدد المحددات: "حفظ ربط (X) عملية"
- **جدول السندات غير المرتبطة** مع checkboxes:
  - Checkbox "تحديد الكل" في header الجدول
  - الصفوف المحددة تتحول للون أخضر فاتح
  - رسالة مرحة عند الجدول الفارغ: "🎉 ممتاز! جميع سندات الصرف مرتبطة بمشاريع"

**API Calls:** `GET /reports/unassigned-project-transactions` + `GET /projects` + `PATCH /expense-transactions/bulk-assign-project`

---

## 📋 تقرير السندات اليدوية — `/reports/manual-vouchers`

**الملف:** [reports/manual-vouchers/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/reports/manual-vouchers/page.tsx)

### العناصر:
جدول بسيط بدون فلاتر أو بحث:

| رقم السند اليدوي | دفتر السندات | الرقم الداخلي | التاريخ | المستفيد | المبلغ | المشروع |
|---|---|---|---|---|---|---|

> [!WARNING]
> لا يوجد بحث أو فلترة أو تصدير. يُعرض الكل مباشرة.

**API Calls:** `GET /reports/manual-vouchers`

---

## 📋 تقرير الفواتير المعلقة — `/reports/pending-invoices`

**الملف:** [reports/pending-invoices/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/reports/pending-invoices/page.tsx)

### العناصر:
جدول بسيط مع وصف:

| الرقم الداخلي | المستفيد | الوصف | المبلغ | المشروع | حالة الفاتورة |
|---|---|---|---|---|---|

- حالة الفاتورة: badge أصفر "ستقدم لاحقاً (PENDING)"

**API Calls:** `GET /reports/pending-invoices`

---

## 👥 المستفيدون — `/beneficiaries`

**الملف:** [beneficiaries/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/beneficiaries/page.tsx)

### العناصر:
- شريط بحث (بالاسم / الجوال / الرقم الضريبي)
- **جدول للعرض فقط** (بدون إضافة/تعديل/حذف):

  | اسم المستفيد | النوع | الرقم الضريبي | السجل التجاري | رقم الجوال | الحالة |
  |---|---|---|---|---|---|

> [!WARNING]
> ⚠️ لا يوجد زر "إضافة مستفيد جديد" في هذه الصفحة — الإضافة تتم فقط من نموذج `/transactions/new` عبر المودال السريع.

**API Calls:** `GET /beneficiaries?search=...`

---

## 🏷️ تصنيفات المصروفات — `/categories`

**الملف:** [categories/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/categories/page.tsx)

### العناصر:
جدول **عرض فقط** بدون إضافة أو تعديل:

| الكود | اسم التصنيف | يتطلب مشروع؟ | يتطلب فاتورة؟ | الحالة |
|---|---|---|---|---|

**API Calls:** `GET /expense-categories`

---

## 💰 الصناديق المالية — `/cashboxes`

**الملف:** [cashboxes/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/cashboxes/page.tsx)

### العناصر:
**Grid بطاقات** (3 أعمدة) — لكل صندوق:
- الاسم + كود (badge أزرق)
- الفرع
- اسم أمين الصندوق

> [!WARNING]
> لا يوجد إضافة أو تعديل أو حذف للصناديق من الواجهة.

**API Calls:** `GET /cashboxes`

---

## 💳 طرق الدفع — `/payment-methods`

**الملف:** [payment-methods/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/payment-methods/page.tsx)

### العناصر:
جدول **عرض فقط**:

| كود طريقة الدفع | الاسم | تتطلب رقم مرجعي؟ | الحالة |
|---|---|---|---|

**API Calls:** `GET /payment-methods`

---

## 📜 سجل التعديلات — `/audit-logs`

**الملف:** [audit-logs/page.tsx](file:///c:/Users/Silver_Bullet/Desktop/exoen_man/apps/web/app/audit-logs/page.tsx)

### العناصر:
- **رسالة إعلامية** فقط (placeholder):
  - "يتم تسجيل جميع الأحداث تلقائياً في جدول AuditLog..."
- نص رمادي: "يمكن للمسؤول استعراض أحدث السجلات..."

> [!CAUTION]
> هذه الصفحة **placeholder بالكامل** — لا تعرض أي بيانات فعلية من API ولا تستدعي أي endpoint.

---

## 🔍 الملاحظات والفجوات الإجمالية

### ❌ صفحات Placeholder (بدون بيانات حقيقية):
| الصفحة | الحالة |
|--------|--------|
| `/audit-logs` | لا تستدعي أي API — نص static فقط |

### ⚠️ صفحات تفتقر للعمليات الكاملة (CRUD ناقص):
| الصفحة | الناقص |
|--------|--------|
| `/beneficiaries` | لا يوجد إضافة / تعديل / حذف |
| `/categories` | لا يوجد إضافة / تعديل / حذف |
| `/cashboxes` | لا يوجد إضافة / تعديل / حذف |
| `/payment-methods` | لا يوجد إضافة / تعديل / حذف |
| `/reports/manual-vouchers` | لا يوجد بحث / فلترة / تصدير |
| `/reports/pending-invoices` | لا يوجد فلترة أو إجراءات لتحديث حالة الفاتورة |

### ❓ صفحات مفقودة كلياً:
| المتوقع | الملاحظة |
|---------|----------|
| `/users/new` | (موجود في الـ routing ولكن لم تُقرأ محتوياته بعد) |
| `/users/[id]/edit` | (موجود في الـ routing) |
| `/projects/new` | (موجود في الـ routing) |
| `/projects/[id]/edit` | (موجود في الـ routing) |

### 🔧 ملاحظات تقنية:
1. **جميع الصفحات** تستخدم `'use client'` — لا توجد Server Components
2. **إدارة البيانات** عبر `@tanstack/react-query` بشكل موحد
3. **الأخطاء** تُعرض بـ `alert()` native في بعض الأماكن بدلاً من UI احترافي
4. **لا يوجد تصدير PDF/Excel** في أي تقرير
5. **لا يوجد Pagination** في أي جدول
6. **شريط الإجماليات الثابت** في `/journals/[id]` يتداخل مع محتوى الصفحة بسبب `fixed bottom-0`
