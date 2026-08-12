# نظام إدارة المصروفات اليومية وسندات الصرف المتكامل (Expense Management System)

نظام متكامل ومحترف لإدارة المصروفات اليومية وسندات الصرف اليدوية والآلية مع لوحة تحكم ويب تفاعلية باللغة العربية (RTL) وتصميم عصري، بالإضافة إلى REST API متكامل ومعد للاستخدام المباشر مستقبلاً من تطبيق Android.

---

## 🌟 مميزات النظام الأساسية

1. **فصل تام بين الـ Backend والـ Frontend**:
   - Backend: Node.js Express مع TypeScript وPrisma ORM وMySQL 8.x.
   - Frontend: Next.js 14 App Router مع Tailwind CSS وTanStack Query باللغة العربية واجهة RTL بالكامل.
2. **إدارة اليومية الصندوقية (Daily Journals)**:
   - ربط اليومية بتاريخ وصندوق محدد مع حساب الإجماليات تلقائياً (عدد العمليات، إجمالي المصروفات، إجمالي المعتمد، إجمالي المرفوض، إجمالي المعلق).
   - منع فتح أكثر من يومية مفتوحة لنفس الصندوق ونفس التاريخ.
   - منع إغلاق اليومية في حال وجود عمليات غير معتمدة أو غير مرتبطة بمشروع وفقاً لقواعد النظام.
3. **دعم سندات الصرف اليدوية (Manual Cash Vouchers)**:
   - توليد رقم داخلي آلي فريد (`EXP-YYYY-XXXXXX`).
   - قيد منع تكرار رقم السند اليدوي الورقي داخل نفس (الصندوق + السنة المالية + دفتر السندات).
4. **محرك وضع إلزامية ربط المشروع (Project Requirement Mode)**:
   - `OPTIONAL`: يسمح بإنشاء واعتماد العمليات وإغلاق اليومية بدون مشروع.
   - `REQUIRED_ON_APPROVAL`: يسمح بحفظ العملية بدون مشروع، ولكن يمنع اعتمادها أو إغلاق اليومية قبل الربط بمشروع.
   - `REQUIRED_ON_CREATE`: يمنع إنشاء أو حفظ العملية بدون اختيار مشروع فورياً.
   - يتم تطبيق الإلزامية في Backend وعلى مستوى قاعدة البيانات والخدمات، ويستطيع المسؤول تغيير الإعداد مباشرة من لوحة التحكم.
5. **شاشة السندات غير المرتبطة بمشاريع والربط الجماعي**:
   - شاشة مخصصة لعرض كافة السندات غير المرتبطة بمشاريع مع إمكانية تحديد عدة عمليات وربطها بمشروع واحد دفعة واحدة (`Bulk Assign`).
6. **إدارة الفواتير المرفقة والمعلقة**:
   - الدعم التلقائي لعمليات الشراء، وتأكيد وجود الفاتورة، وحفظ رقم وتاريخ الفاتورة والتنبيه التلقائي في حال تكرار رقم الفاتورة لنفس المستفيد.
7. **نظام صلاحيات متقدم (RBAC - Role-Based Access Control)**:
   - الأدوار: `ADMIN`, `CASHIER`, `ACCOUNTANT`, `MANAGER`, `VIEWER`.
8. **تأمين كامل وتوثيق شامل**:
   - حماية بواسطة Helmet وCORS وRate Limiting والتحقق عبر Zod.
   - توثيق Swagger OpenAPI تفاعلي على `/api-docs`.
   - ملف Postman Collection جاهز للاختبارات.
   - مخطط علاقات قاعدة البيانات ERD بترميز Mermaid.

---

## 📂 هيكل المشروع (Monorepo Architecture)

```
expense-management-system/
├── apps/
│   ├── api/                     # Node.js Express TypeScript REST API
│   │   ├── src/
│   │   │   ├── config/          # إعدادات البيئة و Swagger
│   │   │   ├── controllers/     # المتحكمات
│   │   │   ├── services/        # منطق العمليات المالية
│   │   │   ├── routes/          # مسارات API v1
│   │   │   ├── middleware/      # المصادقة والصلاحيات ورفع الملفات
│   │   │   └── app.ts           # التطبيق الرئيسي
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # مخطط قاعدة البيانات
│   │   │   └── seed.ts          # البيانات التجريبية
│   │   └── tests/               # اختبارات Vitest و Supertest
│   │
│   └── web/                     # Next.js 14 App Router لوحة التحكم بالعربية
│       ├── app/                 # صفحات التطبيق (اليوميات، السندات، الإعدادات...)
│       ├── components/          # المكونات الهيكلية والقوائم
│       ├── lib/                 # عميل Axios و Providers
│       └── public/
│
├── packages/
│   └── shared/                  # الحزم المشتركة للأنواع والمخططات والأنماط
│
├── docker-compose.yml           # تشغيل MySQL 8 و phpMyAdmin
├── pnpm-workspace.yaml          # إعدادات PNPM Monorepo
├── postman_collection.json      # مجموعة Postman
├── .env.example                 # نموذج ملف متغيرات البيئة
└── README.md
```

---

## 🚀 متطلبات التثبيت والتشغيل

### 1. المتطلبات الأساسية
- Node.js إصدار LTS (نسخة v18 أو v20 أو أحدث).
- pnpm: قم بتثبيته عبر الأمر `npm install -g pnpm`.
- Docker & Docker Compose (لتشغيل MySQL 8.0).

### 2. إعداد بيئة العمل والمتغيرات

قم بنسخ ملف `.env.example` إلى `.env`:
```bash
cp .env.example .env
```

محتوى ملف `.env`:
```env
NODE_ENV=development
API_PORT=4000
WEB_PORT=3000
DATABASE_URL="mysql://root:rootpassword@localhost:3306/expense_db"
MYSQL_DATABASE=expense_db
MYSQL_USER=expense_user
MYSQL_PASSWORD=expense_pass
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_PORT=3306
JWT_ACCESS_SECRET=super-secret-access-token-key-2026
JWT_REFRESH_SECRET=super-secret-refresh-token-key-2026
CORS_ORIGIN=http://localhost:3000
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=AdminPass123!
```

---

## 📦 خطوات التشغيل المباشرة

### الخطوة الأولى: تشغيل قاعدة البيانات (MySQL عبر Docker)
```bash
pnpm docker:up
# أو
docker-compose up -d
```
> سيتم تشغيل MySQL على المنفذ `3306` و phpMyAdmin على المنفذ `http://localhost:8080`.

### الخطوة الثانية: تثبيت التبعيات وبناء الحزم المشتركة
```bash
pnpm install
pnpm build
```

### الخطوة الثالثة: تشغيل الهجرة والبيانات التجريبية (Migrations & Seed)
```bash
# إنشاء جداول قاعدة البيانات
pnpm db:migrate

# زرع البيانات التجريبية (المدير الافتراضي، المشاريع 112 و 113، يومية 04 أغسطس 2026 بإجمالي 3819 ريال)
pnpm db:seed
```

### الخطوة الرابعة: تشغيل التطبيقات في بيئة التطوير
```bash
# تشغيل الـ Backend والـ Frontend بالتوازي
pnpm dev

# أو تشغيل كل تطبيق على حدة:
pnpm dev:api    # يشغل الـ REST API على http://localhost:4000
pnpm dev:web    # يشغل لوحة التحكم على http://localhost:3000
```

---

## 🔑 بيانات الدخول التجريبية

- **رابط لوحة التحكم**: `http://localhost:3000/login`
- **اسم المستخدم**: `admin`
- **كلمة المرور**: `AdminPass123!`

---

## 📚 التوثيق واختبارات الـ REST API

- **توثيق Swagger OpenAPI التفاعلي**:
  `http://localhost:4000/api-docs`
- **ملف Postman Collection**:
  موجود في الجذر باسم `postman_collection.json`.
- **تشغيل الاختبارات التلقائية**:
  ```bash
  pnpm test
  ```

---

## ⚙️ كيفية تغيير وضع إلزامية المشروع

1. سجّل الدخول بصلاحية `ADMIN`.
2. اذهب إلى قائمة **إعدادات النظام** (`http://localhost:3000/settings`).
3. اختار أحد الأوضاع الثلاثة:
   - **OPTIONAL**: اختياري عند الإنشاء والاعتماد.
   - **REQUIRED_ON_APPROVAL**: اختياري عند الإنشاء ومطلوب عند الاعتماد والإغلاق.
   - **REQUIRED_ON_CREATE**: إجباري فور الإنشاء.
4. يتم تطبيق الإعداد فورياً داخل الـ Backend وسيرفض أي عملية تخالف هذا الخيار.
#   h j h h h  
 