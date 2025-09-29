<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">DM</div>
          <span>Daily Manager</span>
        </div>
        <div class="header-actions">
          <div class="time-display">
            {{ currentTime }}
          </div>
          <button class="theme-toggle" @click="toggleTheme">
            {{ isDark ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data() {
    return {
      currentTime: '',
      isDark: false
    }
  },
  mounted() {
    this.updateTime()
    setInterval(this.updateTime, 1000)
  },
  methods: {
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    toggleTheme() {
      this.isDark = !this.isDark
      document.body.classList.toggle('dark-theme', this.isDark)
    }
  }
}
</script>