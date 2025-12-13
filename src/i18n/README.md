# Vue I18n Setup

هذا المجلد يحتوي على إعدادات وملفات الترجمة للمشروع.

## الهيكل

```
i18n/
├── index.js              # ملف الإعدادات الرئيسي
├── locales/
│   ├── en/              # ملفات الترجمة الإنجليزية
│   │   ├── index.js
│   │   ├── common.js
│   │   ├── navigation.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── tasks.js
│   │   ├── users.js
│   │   ├── projects.js
│   │   ├── components.js
│   │   └── validation.js
│   └── ar/              # ملفات الترجمة العربية
│       └── [نفس الملفات]
└── plugins/
    └── rtl-plugin.js    # إدارة RTL/LTR
```

## الاستخدام

### في المكونات (Composition API)

```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// استخدام الترجمة
const message = t('common.buttons.save')

// تغيير اللغة
locale.value = 'ar'
</script>

<template>
  <button>{{ t('common.buttons.save') }}</button>
</template>
```

### في المكونات (Options API)

```vue
<template>
  <button>{{ $t('common.buttons.save') }}</button>
</template>

<script>
export default {
  methods: {
    changeLanguage() {
      this.$i18n.locale = 'ar'
    }
  }
}
</script>
```

### تغيير اللغة برمجياً

```javascript
import { setLocale } from '@/i18n'

// تغيير اللغة
setLocale('ar') // أو 'en'
```

## إضافة ترجمات جديدة

1. افتح الملف المناسب في `locales/en/` أو `locales/ar/`
2. أضف المفاتيح الجديدة بنفس الهيكل
3. تأكد من إضافة الترجمة في كلا اللغتين

مثال:
```javascript
// locales/en/tasks.js
export default {
  // ...
  newKey: 'New Translation'
}

// locales/ar/tasks.js
export default {
  // ...
  newKey: 'ترجمة جديدة'
}
```

## الملفات

- **common.js**: نصوص مشتركة (أزرار، رسائل عامة)
- **navigation.js**: القوائم والتنقل
- **auth.js**: صفحات تسجيل الدخول والتسجيل
- **dashboard.js**: لوحة التحكم
- **tasks.js**: المهام
- **users.js**: المستخدمين والأدوار
- **projects.js**: المشاريع
- **components.js**: نصوص المكونات المشتركة
- **validation.js**: رسائل التحقق من النماذج

