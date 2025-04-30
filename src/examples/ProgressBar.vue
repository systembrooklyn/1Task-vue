<template>
    <div class="progress">
      <div 
        class="progress-bar"
        :style="{ width: `${percentage}%`, backgroundColor: color }"
      >
        <span>{{ percentage }}%</span>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    percentage: Number,
    color: {
      type: String,
      default: "#4CAF50"
    }
  });
  </script>
  
  <style scoped>
  .progress {
    height: 8px;
    background-color: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-bar {
    height: 100%;
    transition: width 0.3s ease;
    position: relative;
  }
  
  .progress-bar span {
    position: absolute;
    right: -30px;
    top: -25px;
    background: rgba(0,0,0,0.7);
    padding: 5px 10px;
    border-radius: 4px;
    color: white;
  }
  </style>