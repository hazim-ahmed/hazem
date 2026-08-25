# عقد API للفرونت - دفتر يوميات المصروفات

التاريخ: 2026-08-25  
المسار الأساسي في التطوير: `http://localhost:4000/api/v1`  
التوثيق التفاعلي: `http://localhost:4000/api-docs`

## القاعدة العامة

كل المسارات، ما عدا تسجيل الدخول، تحتاج:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

شكل النجاح:

```json
{
  "success": true,
  "message": "تمت العملية بنجاح",
  "data": {}
}
```

شكل الخطأ:

```json
{
  "success": false,
  "message": "خطأ في التحقق من البيانات المدخلة",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    { "field": "paymentMethodId", "message": "طريقة الدفع مطلوبة" }
  ]
}
```

## 1. تسجيل الدخول

`POST /auth/login`

```json
{
  "username": "admin",
  "password": "AdminPass123!"
}
```

يستخدم الفرونت `data.tokens.accessToken` في كل الطلبات التالية.

## 2. يومية اليوم التلقائية

`GET /today`

يفتح أو يجلب يومية اليوم حسب توقيت الرياض. لا يرسل الفرونت رقم اليومية.

أهم الحقول الراجعة:

```json
{
  "systemDate": "2026-08-25",
  "journalId": 12,
  "journalNumber": "JRN-20260825",
  "status": "OPEN",
  "totalAmount": 1500,
  "transactionsCount": 4
}
```

## 3. جلب مصروفات اليوم

`GET /today/transactions`

يرجع السندات مع:

- `beneficiary`
- `category`
- `project`
- `paymentMethod`
- `paymentReference`
- `notes`

يعتمد جدول اليومية في الفرونت على هذه البيانات.

## 4. تسجيل مصروف جديد

`POST /today/transactions`

الفرونت لا يرسل:

- `journalId`
- `voucherDate`
- `status`
- `createdBy`
- `systemReference`

هذه كلها يحددها الباك اند.

الطلب:

```json
{
  "manualVoucherNumber": "125",
  "beneficiaryId": 1,
  "beneficiaryName": null,
  "categoryId": 2,
  "projectId": 4,
  "projectUnitId": null,
  "paymentMethodId": 1,
  "paymentReference": null,
  "amount": 250.75,
  "description": "شراء مواد تنظيف لموقع المشروع",
  "invoiceNumber": "INV-9912",
  "invoiceDate": "2026-08-25",
  "invoiceAmount": 250.75,
  "notes": "تم الصرف بشكل عاجل بناء على طلب مشرف الموقع"
}
```

قواعد مهمة:

- يجب إرسال `beneficiaryId` أو `beneficiaryName`.
- `categoryId` إلزامي.
- `paymentMethodId` إلزامي.
- `amount` يجب أن يكون أكبر من صفر.
- `description` إلزامي.
- إذا كانت طريقة الدفع `requiresReference=true` يجب إرسال `paymentReference`.
- إذا كان إعداد النظام `expenses.project_requirement_mode = REQUIRED_ON_CREATE` يجب إرسال `projectId`.

أخطاء متوقعة:

| الحالة | errorCode |
|---|---|
| لا توجد طريقة دفع | `VALIDATION_ERROR` أو `PAYMENT_METHOD_REQUIRED` |
| طريقة دفع غير موجودة | `PAYMENT_METHOD_INVALID` |
| طريقة دفع تتطلب مرجعاً ولم يرسل | `PAYMENT_REFERENCE_REQUIRED` |
| لا يوجد مستفيد | `VALIDATION_ERROR` |
| المشروع مطلوب حسب الإعداد | `PROJECT_REQUIRED` |
| المشروع موقوف أو مؤرشف | `PROJECT_INACTIVE` |

## 5. تعديل مصروف

`PATCH /today/transactions/:id`

يرسل الفرونت الحقول المراد تعديلها فقط:

```json
{
  "amount": 300,
  "description": "تعديل البيان قبل توثيق اليومية",
  "paymentMethodId": 2,
  "paymentReference": "BANK-REF-20260825",
  "notes": "تم تعديل طريقة الدفع بناء على مراجعة المحاسب"
}
```

قواعد مهمة:

- يجب إرسال حقل واحد على الأقل.
- إذا تغيرت طريقة الدفع إلى طريقة تتطلب مرجعاً، يجب إرسال `paymentReference`.
- لا يسمح لغير المدير بتعديل سند في يومية مغلقة حسب منطق الباك الحالي.

## 6. إلغاء مصروف

`DELETE /today/transactions/:id`

الحذف الحالي Soft Delete:

- يضع `deletedAt`.
- يغير الحالة إلى `CANCELLED`.
- يسجل AuditLog.

## 7. طرق الدفع

`GET /payment-methods`

يستخدمها الفرونت في شاشة إضافة المصروف.

مثال:

```json
[
  {
    "id": 1,
    "code": "CASH",
    "name": "نقداً (كاش)",
    "requiresReference": false,
    "isActive": true
  },
  {
    "id": 2,
    "code": "BANK_TRANSFER",
    "name": "تحويل بنكي",
    "requiresReference": true,
    "isActive": true
  }
]
```

سلوك الفرونت المطلوب:

- يعرض `name`.
- يرسل `id` في `paymentMethodId`.
- إذا كانت `requiresReference=true` يظهر حقل `paymentReference` ويجعله إجبارياً.

## 8. أرشيف اليوميات

`GET /journals`

يرجع اليوميات مع إجمالي السندات والمبالغ. يستخدم في صفحة أرشيف اليوميات.

## 9. تفاصيل يومية

`GET /journals/:id`

يرجع اليومية وسنداتها، ويجب أن تعرض صفحة المحاسب:

- رقم السند اليدوي.
- الرقم الداخلي.
- المستفيد.
- البيان.
- المشروع.
- طريقة الدفع.
- مرجع الدفع عند وجوده.
- رقم الفاتورة.
- الملاحظات.
- المبلغ.
- الحالة.

## 10. إغلاق وإعادة فتح اليومية

`POST /journals/:id/close`  
`POST /journals/:id/reopen`

هذه المسارات موجودة حالياً. مرحلة التوثيق النهائية وتوليد Excel/PDF لم تنفذ بعد، وينبغي إضافتها لاحقاً كمسارات منفصلة مثل:

```http
POST /journals/:id/document
GET /journals/:id/export.xlsx
GET /journals/:id/export.pdf
```

## 11. الربط الجماعي بالمشروع

`PATCH /expense-transactions/bulk-assign-project`

```json
{
  "transactionIds": [1, 2, 3],
  "projectId": 5,
  "projectUnitId": null,
  "reason": "تصحيح ربط السندات بالمشروع بعد مراجعة المحاسب"
}
```

ملاحظة: `reason` إلزامي حتى يكون التعديل مفهومًا في AuditLog.

## ملاحظات تنفيذية للفرونت

- اعتمد على `GET /payment-methods` ولا تثبت كاش/بنك في الواجهة كقيم ثابتة.
- لا ترسل `journalId` عند تسجيل مصروف اليوم.
- لا تعتمد على أسماء الحالات في الواجهة كنصوص نهائية؛ اعرض ترجمة عربية لها.
- في نموذج الإضافة، اجعل `notes` اختيارياً لكنه واضح للمستخدم: “أي توضيح يساعد المحاسب عند وجود أمر مبهم”.
- شاشة المحاسب يجب أن تعرض `paymentMethod.name` و`paymentReference` و`notes` لأنها جزء من التوثيق اليدوي والختم.
