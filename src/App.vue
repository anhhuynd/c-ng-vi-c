<template>
  <div id="app">
    <Header />
    
    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <div class="container">
        <div class="tab-buttons">
          <button 
            class="tab-button"
            :class="{ active: activeTab === 'daily' }"
            @click="activeTab = 'daily'"
          >
            📅 CV Hàng Ngày
          </button>
          <button 
            class="tab-button"
            :class="{ active: activeTab === 'youtube' }"
            @click="activeTab = 'youtube'"
          >
            📺 YouTube Dashboard
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <DailyTasks v-if="activeTab === 'daily'" />
        <YouTubeDashboard v-if="activeTab === 'youtube'" />
      </div>
    </main>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import DailyTasks from './components/DailyTasks.vue'
import YouTubeDashboard from './components/YouTubeDashboard.vue'

export default {
  name: 'App',
  components: {
    Header,
    DailyTasks,
    YouTubeDashboard
  },
  data() {
    return {
      activeTab: 'daily'
    }
  },
  mounted() {
    // Load active tab from localStorage
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      this.activeTab = savedTab;
    }
  },
  watch: {
    activeTab(newTab) {
      localStorage.setItem('activeTab', newTab);
    }
  }
}
</script>