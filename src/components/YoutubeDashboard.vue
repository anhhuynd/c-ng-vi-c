<template>
  <div>
    <!-- Header -->
    <div class="youtube-header">
      <h1 class="youtube-title">Quản Lý Kênh YouTube</h1>
      <button class="add-channel-btn" @click="showAddChannelModal = true">
        + Thêm Kênh
      </button>
    </div>

    <!-- Tabs -->
    <div class="youtube-tabs">
      <div 
        class="youtube-tab"
        :class="{ active: activeTab === 'channels' }"
        @click="activeTab = 'channels'"
      >
        📺 Kênh
      </div>
      <div 
        class="youtube-tab"
        :class="{ active: activeTab === 'videos' }"
        @click="activeTab = 'videos'"
      >
        🎥 Video
      </div>
      <div 
        class="youtube-tab"
        :class="{ active: activeTab === 'analytics' }"
        @click="activeTab = 'analytics'"
      >
        📊 Thống Kê
      </div>
    </div>

    <!-- Channels Tab -->
    <div v-if="activeTab === 'channels'">
      <div v-if="channels.length === 0" class="no-channels">
        <p style="text-align: center; color: var(--text-secondary); padding: 3rem;">
          Chưa có kênh YouTube nào. Hãy thêm kênh đầu tiên!
        </p>
      </div>
      
      <div v-else class="channels-grid">
        <div 
          v-for="channel in channels" 
          :key="channel.id"
          class="channel-card"
        >
          <div 
            class="channel-thumbnail"
            :style="{ background: channel.gradient }"
          >
            <div style="position: absolute; top: 10px; right: 10px; color: white; font-size: 1.2rem;">
              📺
            </div>
          </div>
          <div class="channel-info">
            <h3 class="channel-name">{{ channel.name }}</h3>
            <p class="channel-subscribers">{{ channel.subscribers }} subscribers</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Videos Tab -->
    <div v-if="activeTab === 'videos'">
      <div style="text-align: center; color: var(--text-secondary); padding: 3rem;">
        <h3>Quản Lý Video</h3>
        <p>Tính năng đang phát triển...</p>
      </div>
    </div>

    <!-- Analytics Tab -->
    <div v-if="activeTab === 'analytics'">
      <div style="text-align: center; color: var(--text-secondary); padding: 3rem;">
        <h3>Thống Kê & Phân Tích</h3>
        <p>Tính năng đang phát triển...</p>
      </div>
    </div>

    <!-- Add Channel Modal -->
    <div v-if="showAddChannelModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h3>Thêm Kênh YouTube Mới</h3>
        <input 
          v-model="newChannel.name" 
          placeholder="Tên kênh"
          class="modal-input"
        >
        <input 
          v-model="newChannel.subscribers" 
          placeholder="Số subscribers (VD: 10.5K)"
          class="modal-input"
        >
        <div class="modal-actions">
          <button @click="closeModal" class="modal-btn cancel">Hủy</button>
          <button @click="addChannel" class="modal-btn primary">Thêm Kênh</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'YouTubeDashboard',
  data() {
    return {
      activeTab: 'channels',
      showAddChannelModal: false,
      newChannel: {
        name: '',
        subscribers: ''
      },
      channels: [
        {
          id: 1,
          name: 'Tech Channel',
          subscribers: '10.5K',
          gradient: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)'
        },
        {
          id: 2,
          name: 'Coding Tutorials',
          subscribers: '25.2K',
          gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
        }
      ]
    }
  },
  mounted() {
    // Load channels from localStorage
    const savedChannels = localStorage.getItem('youtubeChannels');
    if (savedChannels) {
      this.channels = JSON.parse(savedChannels);
    }
  },
  methods: {
    addChannel() {
      if (!this.newChannel.name.trim()) return;
      
      const gradients = [
        'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #43e97b, #38f9d7)',
        'linear-gradient(135deg, #fa709a, #fee140)'
      ];
      
      const channel = {
        id: Date.now(),
        name: this.newChannel.name,
        subscribers: this.newChannel.subscribers || '0',
        gradient: gradients[Math.floor(Math.random() * gradients.length)]
      };
      
      this.channels.push(channel);
      this.saveChannels();
      this.closeModal();
    },
    closeModal() {
      this.showAddChannelModal = false;
      this.newChannel = { name: '', subscribers: '' };
    },
    saveChannels() {
      localStorage.setItem('youtubeChannels', JSON.stringify(this.channels));
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--surface);
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
}

.modal h3 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.modal-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 1rem;
  background: var(--background);
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.modal-btn.cancel {
  background: var(--background);
  color: var(--text-secondary);
}

.modal-btn.primary {
  background: var(--primary-color);
  color: white;
}
</style>