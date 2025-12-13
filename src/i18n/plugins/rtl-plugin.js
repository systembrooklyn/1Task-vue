/**
 * RTL Plugin for Vue I18n
 * يدير تغيير اتجاه الصفحة (RTL/LTR) عند تغيير اللغة
 */

export const rtlPlugin = {
  install(app, { i18n }) {
    // مراقبة تغيير اللغة
    i18n.global.locale.value = i18n.global.locale.value || 'en'
    
    // دالة لتحديث اتجاه الصفحة
    const updateDirection = (locale) => {
      const isRTL = locale === 'ar'
      
      // تحديث HTML attributes
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', locale)
        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
        
        // تحديث class على #app
        const appElement = document.querySelector('#app')
        if (appElement) {
          appElement.classList.toggle('rtl', isRTL)
          appElement.classList.toggle('ltr', !isRTL)
        }
        
        // تحديث body class
        document.body.classList.toggle('rtl', isRTL)
        document.body.classList.toggle('ltr', !isRTL)
      }
    }
    
    // تحديث الاتجاه عند التحميل الأولي
    updateDirection(i18n.global.locale.value)
    
    // مراقبة تغييرات اللغة
    const watchLocale = () => {
      // استخدام watch من Vue
      import('vue').then(({ watch }) => {
        watch(
          () => i18n.global.locale.value,
          (newLocale) => {
            updateDirection(newLocale)
          }
        )
      })
    }
    
    watchLocale()
    
    // توفير دالة عامة لتغيير الاتجاه
    app.config.globalProperties.$updateDirection = updateDirection
  }
}

export default rtlPlugin

