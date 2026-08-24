# 📜 وثيقة المواصفات والتصميم الفني لشريط التنقل (Navbar) للهواتف والأجهزة اللوحية

تحدد هذه الوثيقة التفاصيل الكاملة لتصميم وتطوير **شريط التنقل العائم (Floating Bottom Navigation Dock & Top Brand Badge)** المخصص للهواتف المحمولة والأجهزة اللوحية (Mobile & Tablet Navigation System)، تمهيداً لإعادة استخدامه وتنفيذه في مشاريع أخرى بنفس الهوية والجودة.

---

## 📐 1. الفلسفة العامة والمفهوم التصميمي (Design Concept)

تعتمد المحاذاة والتجربة على **نظام ثنائي التثبيت (Dual-Position Floating Layout)**:

1. **الشعار العلوي العائم (Mobile Top Floating Brand Badge):**
   - يُثبت في أعلى الشاشة بشكل عائم لإبراز هوية الشركة والشعار، مع الاستجابة للتمرير (Scroll Shift).
2. **شريط التنقل السفلي التفاعلي (Mobile Bottom Navigation Dock):**
   - يُثبت في أسفل الشاشة بتصميم زجاجي فاخر (Luxury Glassmorphic Floating Dock)، مستوحى من نظام iOS Docks.
   - يتضمن حركة توسّع ديناميكية (Dynamic Expanding Accordion Tab) للعنصر النشط (Active Tab).

---

## 🎨 2. لوحة الألوان والنمط البصري (Color Palette & Theme Tokens)

| العنصر | اللون / القيمة | الكود (Hex / RGBA) | الوصف |
| :--- | :--- | :--- | :--- |
| **اللون الرئيسي (Navy Dark)** | كحلي داكن فاخر | `#182536` | الخلفية الأساسية للشريط والشعار |
| **التدرج السفلي (Gradient)** | تدرج كحلي عميق | `#182536` ➔ `#0E1724` | خلفية الشريط السفلي التفاعلي |
| **اللون الثانوي (Gold Accent)** | ذهبي ملكي | `#C7A35A` | الأيقونات، الزخارف، والعنصر النشط |
| **الذهبي الفاتح (Light Gold)** | ذهبي ملائم للهوفر | `#DFC889` | حالات التفاعل والتألق |
| **الحدود (Borders)** | ذهبي شفاف | `rgba(199, 163, 90, 0.3)` | الحدود الزجاجية الفاخرة |
| **خلفية العنصر النشط** | ذهبي شفاف مع توهج | `rgba(199, 163, 90, 0.15)` | إبراز الصفحة الحالية |
| **النصوص غير النشطة** | رمادي رماد | `text-zinc-300` | حالات السكون |

---

## 📱 3. الشعار العلوي العائم (Top Floating Badge)

### 🔹 المواصفات الهيكلية والتصميمية:
- **الموقع:** تثبيت علوي عائم `fixed top-0 left-0 right-0 z-[100] md:hidden`.
- **الخلفية والزجاج:** `bg-[#182536]/90` مع مؤثر ضبابية خلفي `backdrop-blur-md` وحواف دائرية `rounded-xl`.
- **الحدود الفاخرة:** زوايا ذهبية مرسومة بدقة في **الأعلى لليمين** و **الأسفل لليسار**:
  - الزاوية العليا اليمنى: `border-t-[2.5px] border-r-[2.5px] border-[#C7A35A] rounded-tr-xl`.
  - الزاوية السفلى اليسرى: `border-b-[2.5px] border-l-[2.5px] border-[#C7A35A] rounded-bl-xl`.
- **مؤثرات التمرير (Scroll Dynamics):**
  - عند التمرير لأسفل (Scroll > 60px): يتقلص الحجم بنسبة `scale(0.94)` مع تصغير الشفافية `opacity: 0.85` وارتفاع طفيف `translateY(-6px)` لتوفير مساحة أكبر للمحتوى.
- **خط التزيين السفلي:** خط ذهبي متمدد سمك `2px` أسفل البادج يتمدد من `0px` إلى `40px` عند تحميل الصفحة.

---

## 🚤 4. شريط التنقل السفلي (Bottom Floating Dock)

### 🔹 المواصفات الهيكلية والأبعاد:
- **الموقع والتمركز:** `fixed inset-x-0 mx-auto z-[100] w-[94%] max-w-md md:hidden`.
- **دعم الأجهزة الحديثة (iOS Safe Area):**
  - الحاشية السفلية: `bottom: calc(0.75rem + env(safe-area-inset-bottom))` لضمان عدم تعارض الشريط مع شريط التنقل الخاص بنظام iOS أو Android.
- **الأبعاد والزجاج:**
  - الارتفاع الأدنى: `min-height: 62px`.
  - انحناء الحواف: `rounded-2xl`.
  - خلفية التدرج والضبابية: `linear-gradient(135deg, #182536 0%, #0E1724 100%)` مع `backdrop-blur-2xl`.
  - الظل والتوهج: `box-shadow: 0 16px 40px -14px rgba(14, 23, 36, 0.75), 0 0 20px -5px rgba(199, 163, 90, 0.2)`.

### 🔹 سلوك العناصر والأيقونات (Tab Item Dynamics):

#### 1. العنصر غير النشط (Inactive Tab):
- **الوزن والمرونة:** `flex: 1`.
- **الأيقونة:** بحجم `20px × 20px` وسمك خط (Stroke Width) = `2`.
- **اللون:** `text-zinc-300`.
- **النص:** مخفي تماماً (`maxWidth: 0px`, `opacity: 0`, `overflow: hidden`).

#### 2. العنصر النشط (Active Dynamic Tab):
- **الوزن والمرونة:** يتوسع تلقائياً لـ `flex: 1.5` مستحوذاً على مساحة أكبر بسلاسة.
- **الخلفية والإطار:** 
  - خلفية: `rgba(199, 163, 90, 0.15)`.
  - إطار: `1px solid rgba(199, 163, 90, 0.4)` مع انحناء `rounded-xl`.
  - توهج داخلي وخارجي: `boxShadow: 0 4px 20px -4px rgba(199, 163, 90, 0.35), inset 0 1px 1px rgba(255,255,255,0.2)`.
- **الأيقونة:** باللون الذهبي `#C7A35A` وسمك خط `2.5`.
- **النص:** يظهر بانسيابية عبر انزلاق السعة (`maxWidth: 90px`, `opacity: 1`, `fontSize: 12px`, `fontWeight: 800`, `color: #C7A35A`).

---

## 🔗 5. قائمة الرابط والأيقونات المستخدمة (Navigation Links)

| اسم الرابط | المسار (Href) | الأيقونة (Lucide Icon) |
| :--- | :--- | :--- |
| **الرئيسية** | `/` | `Home` |
| **من نحن** | `/about` | `UserRound` |
| **مشاريعنا** | `/projects` | `LayoutGrid` |
| **تواصل معنا** | `/contact` | `MessagesSquare` |

---

## 🛠️ 6. المتطلبات البرمجية والتقنية (Technical Requirements)

### 🔹 الحزم والمكتبات المطلوبة (Dependencies):
1. **Next.js (App Router):** `Link`, `usePathname`.
2. **React Hooks:** `useState`, `useEffect`, `useRef`.
3. **Lucide React Icons:** `Home`, `UserRound`, `LayoutGrid`, `MessagesSquare`, `Phone`.
4. **Tailwind CSS:** دعم الكلاسات الإضافية `backdrop-blur`, `flex-1`, `border`, `shadow`.

### 🔹 خوارزمية تحديد الصفحة النشطة (Active State Matching):
```typescript
const isActive = (href: string) => {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
};
```

### 🔹 التحسينات والأداء (Performance & UX):
- استخدام `requestAnimationFrame` لتحديث قيمة التمرير بدون إجهاد المعالج (60fps Scroll Performance).
- تفعيل تسريع كارت الشاشة `transform-gpu` و `will-change-transform` لحركات في غاية النعومة.
- دعم الاتجاهات من اليمين لليسار (**RTL**) للغة العربية.
- مراعاة ميزات تقليل الحركة للأشخاص ذوي الإعاقة (`prefers-reduced-motion`).

---

## 💻 7. كود المكون الجاهز للاستخدام (React Component Code)

```tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  UserRound, 
  LayoutGrid, 
  MessagesSquare 
} from "lucide-react";

export default function MobileNavigation() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const ticking = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentProgress = Math.min(window.scrollY / 60, 1);
          setScrollProgress(currentProgress);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "الرئيسية", href: "/", icon: Home },
    { label: "من نحن", href: "/about", icon: UserRound },
    { label: "مشاريعنا", href: "/projects", icon: LayoutGrid },
    { label: "تواصل معنا", href: "/contact", icon: MessagesSquare },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isMobileScrolled = scrollProgress === 1;

  return (
    <>
      {/* Top Floating Logo Badge */}
      <div 
        className="fixed top-0 left-0 right-0 z-[100] md:hidden pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          transform: isMobileScrolled ? "translateY(-6px) scale(0.94)" : "translateY(0) scale(1)",
          opacity: isMobileScrolled ? 0.85 : 1,
        }}
      >
        <div className="pt-5 sm:pt-6 flex justify-center pointer-events-auto">
          <div 
            className="relative flex items-center justify-center px-6 py-2 rounded-xl bg-[#182536]/90 backdrop-blur-md shadow-lg border border-[#C7A35A]/30 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "scaleX(1) translateY(0)" : "scaleX(0.75) translateY(-8px)"
            }}
          >
            <div className="absolute -top-[2px] -right-[2px] w-6 h-6 border-t-[2.5px] border-r-[2.5px] border-[#C7A35A] rounded-tr-xl pointer-events-none" />
            <div className="absolute -bottom-[2px] -left-[2px] w-6 h-6 border-b-[2.5px] border-l-[2.5px] border-[#C7A35A] rounded-bl-xl pointer-events-none" />

            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C7A35A] text-[#182536] font-black text-base shadow-sm">
                أ
              </span>
              <span className="text-sm font-black text-white tracking-tight">
                أبراج الرفاهية
              </span>
            </Link>

            <div 
              className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 h-[2px] bg-[#C7A35A] rounded-full transition-all duration-1000 ease-out"
              style={{ width: mounted ? "40px" : "0px" }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Floating Navigation Dock */}
      <nav
        className="md:hidden fixed inset-x-0 mx-auto z-[100] w-[94%] max-w-md pointer-events-auto"
        style={{
          bottom: "calc(0.75rem + env(safe-area-inset-bottom))",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0) scale(1)" : "translateY(30px) scale(0.96)",
          transition: "opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          className="flex items-center gap-1.5 px-2 py-2 rounded-2xl border border-[#C7A35A]/30 backdrop-blur-2xl"
          style={{
            background: "linear-gradient(135deg, #182536 0%, #0E1724 100%)",
            boxShadow: "0 16px 40px -14px rgba(14, 23, 36, 0.75), 0 0 20px -5px rgba(199, 163, 90, 0.2)",
            minHeight: "62px",
          }}
        >
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const IconComponent = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl select-none ${
                  active ? "text-[#C7A35A]" : "text-zinc-300 hover:text-white active:scale-95"
                }`}
                style={
                  active
                    ? {
                        flex: "1.5",
                        minHeight: "44px",
                        background: "rgba(199, 163, 90, 0.15)",
                        boxShadow: "0 4px 20px -4px rgba(199, 163, 90, 0.35), inset 0 1px 1px rgba(255,255,255,0.2)",
                        border: "1px solid rgba(199, 163, 90, 0.4)",
                        borderRadius: "0.75rem",
                        transition: "flex 500ms cubic-bezier(0.22,1,0.36,1)",
                      }
                    : {
                        flex: "1",
                        minHeight: "44px",
                        transition: "flex 500ms cubic-bezier(0.22,1,0.36,1), color 200ms",
                      }
                }
              >
                <IconComponent
                  className="shrink-0"
                  style={{
                    width: "20px",
                    height: "20px",
                    strokeWidth: active ? 2.5 : 2,
                    color: active ? "#C7A35A" : "currentColor",
                    transition: "stroke-width 300ms, color 300ms",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    maxWidth: active ? "90px" : "0px",
                    opacity: active ? 1 : 0,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    display: "inline-block",
                    fontWeight: "800",
                    color: "#C7A35A",
                    transition: "max-width 500ms cubic-bezier(0.22,1,0.36,1), opacity 350ms ease",
                  }}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
```

---

## 📌 8. ملخص الإرشادات لنقل الكود لمشروع آخر:
1. انسخ ملف المكون أعلاه واطبقه داخل مجلد `components/layout/MobileNavigation.tsx`.
2. تأكد من تثبيت مكتبة `lucide-react` لمطابقة الأيقونات المستخدمة.
3. تأكد من تفعيل دعم `tailwind.config.js` أو ملف الـ CSS لقيم `backdrop-blur`.
4. يمكنك تغيير مصفوفة `navLinks` وتعديل مسارات وصفحات المشروع الجديد بحرية مع الحفاظ على نفس التأثيرات البصرية والأنيميشن.
