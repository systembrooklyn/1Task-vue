<template>
    <div>
      <!-- هنا يمكنك إضافة عناصر ثابتة، مثل Navbar, Sidebar, Footer -->
      <header>
        <h1>My App Layout</h1>
        <!-- أو استدعاء كومبوننت Navbar.vue لو لديك -->
        <!-- <Navbar /> -->
      </header>
  
      <!-- هنا سيُعرض المكوّن الابن أو المسار الابن -->
      <router-view />
    </div>
  </template>
  
  <script>
  export default {
    name: "MainLayout",
  };
  </script>
  
  <style scoped>
  /* أضف أي تنسيق (CSS) تريده للـ Layout */
  </style>
  