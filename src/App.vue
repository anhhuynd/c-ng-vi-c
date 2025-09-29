<template>
  <div class="desktop-app">
    <!-- Header Bar -->
    <div class="header-bar">
      <div class="header-left">
        <div class="window-controls">
          <div class="control-btn red"></div>
          <div class="control-btn yellow"></div>
          <div class="control-btn green"></div>
        </div>
        <h1 class="app-title">Task & YouTube Manager</h1>
      </div>
      <div class="header-right">
        <span class="current-date">{{ currentDate }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button 
          :class="['tab-btn', { active: activeTab === 'tasks' }]"
          @click="activeTab = 'tasks'"
        >
          📅 Task Manager
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'youtube' }]"
          @click="activeTab = 'youtube'"
        >
          📺 YouTube Dashboard
        </button>
      </div>

      <!-- Task Manager Tab -->
      <div v-if="activeTab === 'tasks'" class="tab-content">
        <!-- Date Navigation -->
        <div class="date-navigation">
          <button 
            v-for="(label, index) in ['Hôm qua', 'Hôm nay', 'Ngày mai']"
            :key="index"
            :class="['nav-btn', { active: selectedDateIndex === index }]"
            @click="selectDateByIndex(index)"
          >
            {{ label }}
          </button>
        </div>

        <!-- Task Progress Summary -->
        <div class="task-progress" :class="timeBasedTheme">
          <div class="progress-stats">
            <div class="stat-item">
              <div class="stat-number">{{ completedTasksCount }}</div>
              <div class="stat-label">Đã hoàn thành</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ remainingTasksCount }}</div>
              <div class="stat-label">Còn lại</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ totalTasksCount }}</div>
              <div class="stat-label">Tổng cộng</div>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div class="progress-text">
            {{ progressPercentage }}% hoàn thành
          </div>
          <div class="time-indicator">
            <span class="current-time">{{ currentTime }}</span>
            <span class="time-period">{{ timePeriodText }}</span>
          </div>
        </div>

        <!-- Task Actions -->
        <div class="task-actions-bar">
          <div class="task-filters">
            <button 
              v-for="filter in taskFilters"
              :key="filter.key"
              :class="['filter-btn', { active: taskFilter === filter.key }]"
              @click="taskFilter = filter.key"
            >
              {{ filter.label }}
            </button>
          </div>
          <div class="task-search">
            <input 
              v-model="searchQuery" 
              placeholder="🔍 Tìm kiếm công việc..."
              class="search-input"
            >
            <button class="add-task-btn" @click="showAddTaskModal = true">
              ➕ Thêm Task
            </button>
            <button class="copy-task-btn" @click="showCopyModal = true" v-if="selectedDayTasks.length > 0">
              📋 Copy Tasks
            </button>
          </div>
        </div>

        <!-- Tasks List -->
        <div class="tasks-section">
          <div v-if="filteredTasks.length === 0" class="no-tasks">
            <p>{{ searchQuery ? 'Không tìm thấy công việc nào.' : 'Chưa có công việc nào cho ngày này' }}</p>
          </div>
          
          <div v-else class="tasks-list">
            <div 
              v-for="task in filteredTasks" 
              :key="task.id"
              class="task-card"
            >
              <div class="task-item" :class="{ overdue: isOverdue(task) }">
                <div 
                  class="task-checkbox"
                  :class="{ completed: task.completed }"
                  @click="toggleTask(task.id)"
                ></div>
                
                <div class="task-content" @click="editTask(task)">
                  <div 
                    class="task-title"
                    :class="{ completed: task.completed }"
                  >
                    {{ task.title }}
                  </div>
                  <div class="task-description">{{ task.description }}</div>
                  <div class="task-meta">
                    <span class="task-time">{{ task.time }}</span>
                    <span v-if="task.priority" :class="['task-priority', task.priority]">
                      {{ getPriorityText(task.priority) }}
                    </span>
                  </div>
                </div>
                
                <div class="task-controls">
                  <button class="control-btn" @click="addSubTask(task.id)" title="Thêm subtask">
                    ➕
                  </button>
                  <button class="control-btn" @click="editTask(task)" title="Sửa">
                    ✏️
                  </button>
                  <button class="control-btn delete" @click="deleteTask(task.id)" title="Xóa">
                    🗑️
                  </button>
                </div>
              </div>

              <!-- Sub Tasks -->
              <div v-if="getSubTasks(task.id).length > 0" class="sub-tasks">
                <div 
                  v-for="subTask in getSubTasks(task.id)" 
                  :key="subTask.id"
                  class="task-item sub-task"
                >
                  <div 
                    class="task-checkbox"
                    :class="{ completed: subTask.completed }"
                    @click="toggleTask(subTask.id)"
                  ></div>
                  
                  <div class="task-content">
                    <div 
                      class="task-title"
                      :class="{ completed: subTask.completed }"
                    >
                      {{ subTask.title }}
                    </div>
                    <div class="task-description">{{ subTask.description }}</div>
                    <div class="task-meta">
                      <span class="task-time">{{ subTask.time }}</span>
                    </div>
                  </div>
                  
                  <div class="task-controls">
                    <button class="control-btn delete" @click="deleteTask(subTask.id)" title="Xóa">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- YouTube Dashboard Tab -->
      <div v-if="activeTab === 'youtube'" class="tab-content">
        <!-- YouTube Header -->
        <div class="youtube-header">
          <div class="youtube-title">
            <h2>📺 YouTube Dashboard</h2>
            <p>Quản lý kênh YouTube với cập nhật views thực tế</p>
          </div>
          <div class="youtube-actions">
            <button @click="showApiKeyModal = true" class="btn btn-outline">🔑 API Key</button>
            <button @click="updateAllViews" :disabled="isUpdating" class="btn btn-primary">
              {{ isUpdating ? "🔄 Đang cập nhật..." : "🔄 Cập nhật tất cả" }}
            </button>
          </div>
        </div>

        <!-- YouTube Tabs -->
        <div class="youtube-tabs">
          <button 
            v-for="tab in youtubeTabs"
            :key="tab.id"
            :class="['youtube-tab-btn', { active: youtubeActiveTab === tab.id }]"
            @click="youtubeActiveTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Search Bar for YouTube -->
        <div v-if="['videos', 'pending', 'analytics'].includes(youtubeActiveTab)" class="youtube-search">
          <input 
            v-model="youtubeSearchQuery" 
            placeholder="🔍 Tìm kiếm..."
            class="search-input"
          >
          <select v-model="filterChannel" class="filter-select">
            <option value="">Tất cả kênh</option>
            <option v-for="channel in channels" :key="channel.id" :value="channel.id.toString()">
              {{ channel.name }}
            </option>
          </select>
        </div>

        <!-- Channels Tab -->
        <div v-if="youtubeActiveTab === 'channels'" class="youtube-content">
          <div class="content-header">
            <h3>Quản Lý Kênh</h3>
            <button @click="showAddChannelModal = true" class="btn btn-primary">
              ➕ Thêm Kênh
            </button>
          </div>
          
          <div class="channels-grid">
            <div v-for="channel in channels" :key="channel.id" class="channel-card">
              <div class="channel-header" :style="{ background: channel.gradient }">
                <div class="channel-icon">📺</div>
                <button @click="deleteChannel(channel.id)" class="delete-channel-btn" title="Xóa kênh">
                  🗑️
                </button>
              </div>
              <div class="channel-content">
                <h4 class="channel-name">{{ channel.name }}</h4>
                <p class="channel-subscribers">{{ channel.subscribers }} subscribers</p>
                <div class="channel-stats">
                  <span>{{ getChannelVideoCount(channel.id) }} videos</span>
                  <span>{{ getChannelTotalViews(channel.id) }} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Videos Tab -->
        <div v-if="youtubeActiveTab === 'videos'" class="youtube-content">
          <div class="content-header">
            <h3>Quản Lý Video</h3>
            <button @click="showAddVideoModal = true" class="btn btn-primary">
              ➕ Thêm Video
            </button>
          </div>
          
          <div class="videos-list">
            <div v-for="video in paginatedVideos" :key="video.id" class="video-card">
              <div class="video-thumbnail">
                <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.title" class="thumbnail-image">
                <div v-else class="thumbnail-placeholder">🎥</div>
                <div class="video-duration">{{ video.duration }}</div>
              </div>
              
              <div class="video-info">
                <h4 class="video-title">{{ video.title }}</h4>
                <p class="video-channel">{{ getChannelName(video.channelId) }}</p>
                <div class="video-stats">
                  <span class="video-views">{{ formatViews(video.views) }} views</span>
                  <span :class="['growth-badge', video.viewGrowth > 0 ? 'positive' : video.viewGrowth < 0 ? 'negative' : 'neutral']">
                    {{ video.viewGrowth > 0 ? "+" : "" }}{{ video.viewGrowth }}%
                  </span>
                </div>
                <div class="video-date">{{ formatDate(video.createdAt) }}</div>
              </div>
              
              <div class="video-actions">
                <button @click="updateVideoViews(video)" class="action-btn" title="Cập nhật views">🔄</button>
                <button @click="setSelectedChartVideo(video.id)" class="action-btn" title="Xem thống kê">📊</button>
                <button @click="deleteVideo(video.id)" class="action-btn delete" title="Xóa">🗑️</button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalVideoPages > 1" class="pagination">
            <button 
              @click="currentVideoPage = Math.max(1, currentVideoPage - 1)" 
              :disabled="currentVideoPage === 1"
              class="pagination-btn"
            >
              ← Trước
            </button>
            <span class="pagination-info">
              Trang {{ currentVideoPage }} / {{ totalVideoPages }}
            </span>
            <button 
              @click="currentVideoPage = Math.min(totalVideoPages, currentVideoPage + 1)" 
              :disabled="currentVideoPage === totalVideoPages"
              class="pagination-btn"
            >
              Sau →
            </button>
          </div>
        </div>

        <!-- Pending Videos Tab -->
        <div v-if="youtubeActiveTab === 'pending'" class="youtube-content">
          <div class="content-header">
            <h3>Video Chờ Xuất Bản</h3>
            <button @click="showAddPendingVideoModal = true" class="btn btn-primary">
              ➕ Thêm Ý Tưởng
            </button>
          </div>
          
          <div class="pending-videos-list">
            <div v-for="video in filteredPendingVideos" :key="video.id" class="pending-video-card">
              <div class="pending-video-info">
                <h4 class="pending-video-title">{{ video.title }}</h4>
                <p class="pending-video-channel">{{ getChannelName(video.channelId) }}</p>
                <div class="pending-video-meta">
                  <span :class="['status-badge', getStatusClass(video.status)]">
                    {{ getStatusText(video.status) }}
                  </span>
                  <span class="expected-views">Dự kiến: {{ formatViews(video.expectedViews) }} views</span>
                </div>
                <div class="pending-video-date">{{ formatDate(video.createdAt) }}</div>
              </div>
              
              <div class="pending-video-actions">
                <button @click="deletePendingVideo(video.id)" class="action-btn delete">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Tab -->
        <div v-if="youtubeActiveTab === 'analytics'" class="youtube-content">
          <h3>Thống Kê Tổng Quan</h3>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-number">{{ channels.length }}</div>
              <div class="stat-label">Kênh</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🎥</div>
              <div class="stat-number">{{ videos.length }}</div>
              <div class="stat-label">Video Đã Xuất Bản</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">💡</div>
              <div class="stat-number">{{ pendingVideos.length }}</div>
              <div class="stat-label">Video Chờ</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">👁️</div>
              <div class="stat-number">{{ formatViews(totalViews) }}</div>
              <div class="stat-label">Tổng Views</div>
            </div>
          </div>

          <!-- Analytics Table -->
          <div class="analytics-table-container">
            <div class="table-header">
              <h4>Chi Tiết Thống Kê Video</h4>
              <div class="table-controls">
                <select v-model="sortBy" class="sort-select">
                  <option value="views">Sắp xếp theo Views</option>
                  <option value="viewGrowth">Sắp xếp theo Tăng trưởng</option>
                  <option value="createdAt">Sắp xếp theo Ngày tạo</option>
                  <option value="title">Sắp xếp theo Tên</option>
                </select>
                <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'" class="sort-btn">
                  {{ sortOrder === 'asc' ? '↑' : '↓' }}
                </button>
              </div>
            </div>
            
            <div class="analytics-table">
              <table>
                <thead>
                  <tr>
                    <th>Video</th>
                    <th>Kênh</th>
                    <th>Views Hiện Tại</th>
                    <th>Views Trước</th>
                    <th>Tăng Trưởng</th>
                    <th>Ngày Tạo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="video in paginatedAnalyticsVideos" :key="video.id">
                    <td class="video-cell">
                      <div class="video-info-cell">
                        <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.title" class="table-thumbnail">
                        <div v-else class="table-thumbnail-placeholder">🎥</div>
                        <span class="video-title-cell">{{ video.title }}</span>
                      </div>
                    </td>
                    <td>{{ getChannelName(video.channelId) }}</td>
                    <td class="views-cell">{{ formatViews(video.views) }}</td>
                    <td class="views-cell">{{ getPreviousViews(video) }}</td>
                    <td>
                      <span :class="['growth-badge-table', video.viewGrowth > 0 ? 'positive' : video.viewGrowth < 0 ? 'negative' : 'neutral']">
                        {{ video.viewGrowth > 0 ? "+" : "" }}{{ video.viewGrowth }}%
                      </span>
                    </td>
                    <td>{{ formatDate(video.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Analytics Pagination -->
            <div v-if="totalAnalyticsPages > 1" class="pagination">
              <button 
                @click="currentAnalyticsPage = Math.max(1, currentAnalyticsPage - 1)" 
                :disabled="currentAnalyticsPage === 1"
                class="pagination-btn"
              >
                ← Trước
              </button>
              <span class="pagination-info">
                Trang {{ currentAnalyticsPage }} / {{ totalAnalyticsPages }}
              </span>
              <button 
                @click="currentAnalyticsPage = Math.min(totalAnalyticsPages, currentAnalyticsPage + 1)" 
                :disabled="currentAnalyticsPage === totalAnalyticsPages"
                class="pagination-btn"
              >
                Sau →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Task Modal -->
    <div v-if="showAddTaskModal || editingTask" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h3>{{ editingTask ? 'Sửa Công Việc' : (taskForm.parentId ? 'Thêm Subtask' : 'Thêm Công Việc Mới') }}</h3>
        <input 
          v-model="taskForm.title" 
          placeholder="Tên công việc"
          class="modal-input"
        >
        <textarea 
          v-model="taskForm.description" 
          placeholder="Mô tả"
          class="modal-input"
        ></textarea>
        <input 
          v-model="taskForm.time" 
          placeholder="Thời gian (VD: 9:00 AM)"
          class="modal-input"
        >
        <select v-model="taskForm.priority" class="modal-input" v-if="!taskForm.parentId">
          <option value="">Chọn độ ưu tiên</option>
          <option value="high">Cao</option>
          <option value="medium">Trung bình</option>
          <option value="low">Thấp</option>
        </select>
        <div class="modal-actions">
          <button @click="closeModal" class="modal-btn cancel">Hủy</button>
          <button @click="saveTask" class="modal-btn primary">
            {{ editingTask ? 'Cập nhật' : 'Thêm' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Copy Tasks Modal -->
    <div v-if="showCopyModal" class="modal-overlay" @click="closeCopyModal">
      <div class="modal" @click.stop>
        <h3>Copy Tasks</h3>
        <p>Copy {{ selectedDayTasks.length }} task(s) sang:</p>
        <div class="copy-options">
          <label class="copy-option">
            <input type="radio" v-model="copyTarget" value="yesterday">
            <span>Hôm qua</span>
          </label>
          <label class="copy-option">
            <input type="radio" v-model="copyTarget" value="tomorrow">
            <span>Ngày mai</span>
          </label>
          <label class="copy-option">
            <input type="radio" v-model="copyTarget" value="custom">
            <span>Ngày khác</span>
          </label>
        </div>
        <input 
          v-if="copyTarget === 'custom'" 
          type="date" 
          v-model="customCopyDate" 
          class="modal-input"
        >
        <div class="modal-actions">
          <button @click="closeCopyModal" class="modal-btn cancel">Hủy</button>
          <button @click="copyTasks" class="modal-btn primary">Copy</button>
        </div>
      </div>
    </div>

    <!-- API Key Modal -->
    <div v-if="showApiKeyModal" class="modal-overlay" @click="showApiKeyModal = false">
      <div class="modal" @click.stop>
        <h3>YouTube API Key</h3>
        <p>Nhập YouTube Data API v3 key để lấy dữ liệu thực tế:</p>
        <input v-model="apiKey" placeholder="YouTube API Key" class="modal-input" type="password">
        <div class="modal-actions">
          <button @click="showApiKeyModal = false" class="modal-btn cancel">Hủy</button>
          <button @click="saveApiKey" class="modal-btn primary">Lưu</button>
        </div>
      </div>
    </div>

    <!-- Add Channel Modal -->
    <div v-if="showAddChannelModal" class="modal-overlay" @click="closeAddChannelModal">
      <div class="modal" @click.stop>
        <h3>Thêm Kênh YouTube Mới</h3>
        <input v-model="newChannel.name" placeholder="Tên kênh" class="modal-input">
        <input v-model="newChannel.subscribers" placeholder="Số subscribers (VD: 10.5K)" class="modal-input">
        <div class="modal-actions">
          <button @click="closeAddChannelModal" class="modal-btn cancel">Hủy</button>
          <button @click="addChannel" class="modal-btn primary">Thêm Kênh</button>
        </div>
      </div>
    </div>

    <!-- Add Video Modal -->
    <div v-if="showAddVideoModal" class="modal-overlay" @click="closeAddVideoModal">
      <div class="modal" @click.stop>
        <h3>Thêm Video từ YouTube</h3>
        <input v-model="newVideo.link" placeholder="Link YouTube" class="modal-input">
        <select v-model="newVideo.channelId" class="modal-input">
          <option value="">Chọn kênh</option>
          <option v-for="channel in channels" :key="channel.id" :value="channel.id">
            {{ channel.name }}
          </option>
        </select>
        <div class="modal-actions">
          <button @click="closeAddVideoModal" class="modal-btn cancel">Hủy</button>
          <button @click="addVideoFromYouTube" class="modal-btn primary">Thêm Video</button>
        </div>
      </div>
    </div>

    <!-- Add Pending Video Modal -->
    <div v-if="showAddPendingVideoModal" class="modal-overlay" @click="closeAddPendingVideoModal">
      <div class="modal" @click.stop>
        <h3>Thêm Ý Tưởng Video</h3>
        <input v-model="newPendingVideo.title" placeholder="Tên video" class="modal-input">
        <input v-model="newPendingVideo.expectedViews" placeholder="Dự kiến views" type="number" class="modal-input">
        <select v-model="newPendingVideo.channelId" class="modal-input">
          <option value="">Chọn kênh</option>
          <option v-for="channel in channels" :key="channel.id" :value="channel.id">
            {{ channel.name }}
          </option>
        </select>
        <select v-model="newPendingVideo.status" class="modal-input">
          <option value="idea">Ý tưởng</option>
          <option value="scripting">Viết kịch bản</option>
          <option value="filming">Đang quay</option>
          <option value="editing">Đang edit</option>
          <option value="ready">Sẵn sàng</option>
        </select>
        <div class="modal-actions">
          <button @click="closeAddPendingVideoModal" class="modal-btn cancel">Hủy</button>
          <button @click="addPendingVideo" class="modal-btn primary">Thêm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

// YouTube API utility class
class YouTubeAPI {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.baseURL = 'https://www.googleapis.com/youtube/v3'
  }

  extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  async getVideoInfo(url) {
    if (!this.apiKey) {
      throw new Error('API Key chưa được cấu hình')
    }

    const videoId = this.extractVideoId(url)
    if (!videoId) {
      throw new Error('URL YouTube không hợp lệ')
    }

    try {
      const response = await axios.get(`${this.baseURL}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoId,
          key: this.apiKey
        }
      })

      if (response.data.items.length === 0) {
        throw new Error('Không tìm thấy video')
      }

      const video = response.data.items[0]
      return {
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium.url,
        viewCount: parseInt(video.statistics.viewCount) || 0,
        duration: this.formatDuration(video.contentDetails.duration)
      }
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('API Key không hợp lệ hoặc đã hết quota')
      }
      throw new Error('Lỗi khi lấy thông tin video: ' + error.message)
    }
  }

  async getCurrentViews(url) {
    const videoId = this.extractVideoId(url)
    if (!videoId || !this.apiKey) {
      // Fallback: simulate view growth
      return Math.floor(Math.random() * 10000) + 1000
    }

    try {
      const response = await axios.get(`${this.baseURL}/videos`, {
        params: {
          part: 'statistics',
          id: videoId,
          key: this.apiKey
        }
      })

      if (response.data.items.length === 0) {
        throw new Error('Video không tồn tại')
      }

      return parseInt(response.data.items[0].statistics.viewCount) || 0
    } catch (error) {
      // Fallback on error
      return Math.floor(Math.random() * 10000) + 1000
    }
  }

  formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return '0:00'

    const hours = parseInt(match[1]) || 0
    const minutes = parseInt(match[2]) || 0
    const seconds = parseInt(match[3]) || 0

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

export default {
  name: 'TaskYouTubeManager',
  data() {
    return {
      // UI State
      activeTab: 'tasks',
      youtubeActiveTab: 'channels',
      selectedDateIndex: 1,
      selectedDate: new Date(),
      taskFilter: 'all',
      searchQuery: '',
      youtubeSearchQuery: '',
      filterChannel: '',
      isUpdating: false,
      
      // Modals
      showAddTaskModal: false,
      showAddChannelModal: false,
      showAddVideoModal: false,
      showAddPendingVideoModal: false,
      showApiKeyModal: false,
      showCopyModal: false,
      editingTask: null,
      
      // Copy functionality
      copyTarget: 'tomorrow',
      customCopyDate: '',
      
      // Pagination
      currentVideoPage: 1,
      videosPerPage: 5,
      currentAnalyticsPage: 1,
      analyticsPerPage: 10,
      
      // Sorting
      sortBy: 'views',
      sortOrder: 'desc',
      
      // API
      apiKey: '',
      youtubeAPI: null,
      
      // Forms
      taskForm: {
        title: '',
        description: '',
        time: '',
        priority: '',
        parentId: null
      },
      
      newChannel: {
        name: '',
        subscribers: ''
      },
      
      newVideo: {
        link: '',
        channelId: ''
      },
      
      newPendingVideo: {
        title: '',
        expectedViews: 0,
        channelId: '',
        status: 'idea'
      },
      
      youtubeTabs: [
        { id: 'channels', label: '📺 Kênh' },
        { id: 'videos', label: '🎥 Video' },
        { id: 'pending', label: '💡 Chờ xuất bản' },
        { id: 'analytics', label: '📊 Thống kê' }
      ],
      
      // Sample data
      tasks: [
        {
          id: 1,
          title: 'Họp team standup',
          description: 'Báo cáo tiến độ công việc tuần',
          time: '9:00 AM',
          priority: 'high',
          completed: false,
          date: new Date().toDateString(),
          parentId: null
        },
        {
          id: 2,
          title: 'Review code',
          description: 'Kiểm tra pull request từ team',
          time: '2:00 PM',
          priority: 'medium',
          completed: true,
          date: new Date().toDateString(),
          parentId: null
        }
      ],
      
      channels: [
        {
          id: 1,
          name: 'Tech Channel',
          subscribers: '10.5K',
          gradient: 'linear-gradient(135deg, #2364aa 0%, #3da5d9 100%)'
        },
        {
          id: 2,
          name: 'Gaming Channel',
          subscribers: '25.2K',
          gradient: 'linear-gradient(135deg, #297373 0%, #73bfb8 100%)'
        }
      ],
      
      videos: [
        {
          id: 1,
          title: 'Vue.js Tutorial for Beginners - Complete Guide 2024',
          channelId: 1,
          views: 15420,
          viewGrowth: 12,
          duration: '15:30',
          link: 'https://youtube.com/watch?v=example1',
          thumbnail: null,
          createdAt: new Date('2024-01-15'),
          viewHistory: [
            { date: '2024-01-15', views: 13750 },
            { date: '2024-01-16', views: 15420 }
          ]
        },
        {
          id: 2,
          title: 'Top 10 Gaming Setup 2024 - Budget Friendly',
          channelId: 2,
          views: 32100,
          viewGrowth: 25,
          duration: '18:20',
          link: 'https://youtube.com/watch?v=example2',
          thumbnail: null,
          createdAt: new Date('2024-01-20'),
          viewHistory: [
            { date: '2024-01-20', views: 25680 },
            { date: '2024-01-21', views: 32100 }
          ]
        }
      ],
      
      pendingVideos: [
        {
          id: 1,
          title: 'React Hooks Deep Dive',
          channelId: 1,
          status: 'scripting',
          expectedViews: 20000,
          createdAt: new Date('2024-01-20')
        }
      ]
    }
  },
  
  computed: {
    currentDate() {
      return new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    
    currentTime() {
      return new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    timePeriodText() {
      const hour = new Date().getHours()
      if (hour < 12) return 'Buổi sáng'
      if (hour < 18) return 'Buổi chiều'
      return 'Buổi tối'
    },
    
    timeBasedTheme() {
      const hour = new Date().getHours()
      if (hour < 6) return 'night'
      if (hour < 12) return 'morning'
      if (hour < 18) return 'afternoon'
      return 'evening'
    },
    
    selectedDayTasks() {
      return this.tasks.filter(task => task.date === this.selectedDate.toDateString())
    },
    
    completedTasksCount() {
      return this.selectedDayTasks.filter(task => task.completed).length
    },
    
    remainingTasksCount() {
      return this.selectedDayTasks.filter(task => !task.completed).length
    },
    
    totalTasksCount() {
      return this.selectedDayTasks.length
    },
    
    progressPercentage() {
      if (this.totalTasksCount === 0) return 0
      return Math.round((this.completedTasksCount / this.totalTasksCount) * 100)
    },
    
    taskFilters() {
      return [
        { key: 'all', label: `Tất cả (${this.selectedDayTasks.length})` },
        { key: 'completed', label: `Đã xong (${this.completedTasksCount})` },
        { key: 'pending', label: `Chưa xong (${this.remainingTasksCount})` }
      ]
    },
    
    filteredTasks() {
      let filtered = this.selectedDayTasks.filter(task => !task.parentId)
      
      if (this.searchQuery) {
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      if (this.taskFilter === 'completed') {
        filtered = filtered.filter(task => task.completed)
      } else if (this.taskFilter === 'pending') {
        filtered = filtered.filter(task => !task.completed)
      }
      
      return filtered
    },
    
    filteredVideos() {
      let filtered = this.videos
      
      if (this.youtubeSearchQuery) {
        filtered = filtered.filter(video =>
          video.title.toLowerCase().includes(this.youtubeSearchQuery.toLowerCase())
        )
      }
      
      if (this.filterChannel) {
        filtered = filtered.filter(video =>
          video.channelId.toString() === this.filterChannel
        )
      }
      
      return filtered
    },
    
    filteredPendingVideos() {
      let filtered = this.pendingVideos
      
      if (this.youtubeSearchQuery) {
        filtered = filtered.filter(video =>
          video.title.toLowerCase().includes(this.youtubeSearchQuery.toLowerCase())
        )
      }
      
      if (this.filterChannel) {
        filtered = filtered.filter(video =>
          video.channelId.toString() === this.filterChannel
        )
      }
      
      return filtered
    },
    
    sortedVideos() {
      return [...this.filteredVideos].sort((a, b) => {
        let aValue = a[this.sortBy]
        let bValue = b[this.sortBy]
        
        if (this.sortBy === 'createdAt') {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }
        
        if (this.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    },
    
    paginatedVideos() {
      const start = (this.currentVideoPage - 1) * this.videosPerPage
      const end = start + this.videosPerPage
      return this.filteredVideos.slice(start, end)
    },
    
    totalVideoPages() {
      return Math.ceil(this.filteredVideos.length / this.videosPerPage)
    },
    
    paginatedAnalyticsVideos() {
      const start = (this.currentAnalyticsPage - 1) * this.analyticsPerPage
      const end = start + this.analyticsPerPage
      return this.sortedVideos.slice(start, end)
    },
    
    totalAnalyticsPages() {
      return Math.ceil(this.sortedVideos.length / this.analyticsPerPage)
    },
    
    totalViews() {
      return this.videos.reduce((total, video) => total + video.views, 0)
    }
  },
  
  mounted() {
    this.loadData()
    this.setupAutoUpdate()
  },
  
  methods: {
    // Task Management
    selectDateByIndex(index) {
      this.selectedDateIndex = index
      const today = new Date()
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() + (index - 1))
      this.selectedDate = targetDate
    },
    
    getSubTasks(parentId) {
      return this.tasks.filter(task => task.parentId === parentId)
    },
    
    toggleTask(taskId) {
      const task = this.tasks.find(t => t.id === taskId)
      if (task) {
        task.completed = !task.completed
        this.saveTasks()
      }
    },
    
    addSubTask(parentId) {
      this.taskForm = {
        title: '',
        description: '',
        time: '',
        priority: '',
        parentId: parentId
      }
      this.showAddTaskModal = true
    },
    
    editTask(task) {
      this.editingTask = task
      this.taskForm = {
        title: task.title,
        description: task.description,
        time: task.time,
        priority: task.priority,
        parentId: task.parentId
      }
    },
    
    deleteTask(taskId) {
      if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
        this.tasks = this.tasks.filter(t => t.id !== taskId && t.parentId !== taskId)
        this.saveTasks()
        this.showToast('Task đã được xóa!', 'success')
      }
    },
    
    saveTask() {
      if (!this.taskForm.title.trim()) return
      
      if (this.editingTask) {
        Object.assign(this.editingTask, this.taskForm)
        this.editingTask = null
      } else {
        const newTask = {
          id: Date.now(),
          ...this.taskForm,
          completed: false,
          date: this.selectedDate.toDateString()
        }
        this.tasks.push(newTask)
      }
      
      this.saveTasks()
      this.closeModal()
      this.showToast('Task đã được lưu!', 'success')
    },
    
    closeModal() {
      this.showAddTaskModal = false
      this.editingTask = null
      this.taskForm = {
        title: '',
        description: '',
        time: '',
        priority: '',
        parentId: null
      }
    },
    
    closeCopyModal() {
      this.showCopyModal = false
      this.copyTarget = 'tomorrow'
      this.customCopyDate = ''
    },
    
    copyTasks() {
      let targetDate
      const today = new Date()
      
      if (this.copyTarget === 'yesterday') {
        targetDate = new Date(today)
        targetDate.setDate(today.getDate() - 1)
      } else if (this.copyTarget === 'tomorrow') {
        targetDate = new Date(today)
        targetDate.setDate(today.getDate() + 1)
      } else if (this.copyTarget === 'custom' && this.customCopyDate) {
        targetDate = new Date(this.customCopyDate)
      }
      
      if (targetDate) {
        const tasksToCopy = this.selectedDayTasks.map(task => ({
          ...task,
          id: Date.now() + Math.random(),
          date: targetDate.toDateString(),
          completed: false
        }))
        
        this.tasks.push(...tasksToCopy)
        this.saveTasks()
        this.closeCopyModal()
        this.showToast(`Đã copy ${tasksToCopy.length} task(s)!`, 'success')
      }
    },
    
    isOverdue(task) {
      if (!task.time || task.completed) return false
      
      const now = new Date()
      const taskDate = new Date(task.date)
      const [time, period] = task.time.split(' ')
      const [hours, minutes] = time.split(':').map(Number)
      
      let taskHours = hours
      if (period === 'PM' && hours !== 12) taskHours += 12
      if (period === 'AM' && hours === 12) taskHours = 0
      
      taskDate.setHours(taskHours, minutes || 0, 0, 0)
      
      return now > taskDate
    },
    
    getPriorityText(priority) {
      const priorities = {
        high: 'Cao',
        medium: 'Trung bình',
        low: 'Thấp'
      }
      return priorities[priority] || ''
    },
    
    // YouTube Management
    formatViews(views) {
      if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + 'M'
      } else if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'K'
      }
      return views.toString()
    },
    
    formatDate(date) {
      if (!date) return 'Không rõ'
      return new Date(date).toLocaleDateString('vi-VN')
    },
    
    getChannelName(channelId) {
      const channel = this.channels.find(c => c.id === channelId)
      return channel ? channel.name : 'Unknown Channel'
    },
    
    getChannelVideoCount(channelId) {
      return this.videos.filter(v => v.channelId === channelId).length
    },
    
    getChannelTotalViews(channelId) {
      const channelVideos = this.videos.filter(v => v.channelId === channelId)
      const totalViews = channelVideos.reduce((sum, video) => sum + video.views, 0)
      return this.formatViews(totalViews)
    },
    
    getPreviousViews(video) {
      if (!video.viewHistory || video.viewHistory.length < 2) {
        return this.formatViews(0)
      }
      const previousViews = video.viewHistory[video.viewHistory.length - 2].views
      return this.formatViews(previousViews)
    },
    
    getStatusText(status) {
      const statusMap = {
        idea: 'Ý tưởng',
        scripting: 'Viết kịch bản',
        filming: 'Đang quay',
        editing: 'Đang edit',
        ready: 'Sẵn sàng'
      }
      return statusMap[status] || status
    },
    
    getStatusClass(status) {
      const classMap = {
        idea: 'status-idea',
        scripting: 'status-scripting',
        filming: 'status-filming',
        editing: 'status-editing',
        ready: 'status-ready'
      }
      return classMap[status] || 'status-default'
    },
    
    setSelectedChartVideo(videoId) {
      this.selectedChartVideo = videoId
      this.youtubeActiveTab = 'analytics'
    },
    
    // API Key management
    saveApiKey() {
      localStorage.setItem('youtube-api-key', this.apiKey)
      this.youtubeAPI = new YouTubeAPI(this.apiKey)
      this.showApiKeyModal = false
      this.showToast('API Key đã được lưu!', 'success')
    },
    
    // Channel management
    addChannel() {
      if (!this.newChannel.name.trim()) return
      
      const gradients = [
        'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #43e97b, #38f9d7)',
        'linear-gradient(135deg, #fa709a, #fee140)'
      ]
      
      const channel = {
        id: Date.now(),
        name: this.newChannel.name,
        subscribers: this.newChannel.subscribers || '0',
        gradient: gradients[Math.floor(Math.random() * gradients.length)]
      }
      
      this.channels.push(channel)
      this.saveChannels()
      this.closeAddChannelModal()
      this.showToast('Kênh đã được thêm!', 'success')
    },
    
    deleteChannel(channelId) {
      if (confirm('Bạn có chắc muốn xóa kênh này? Tất cả video của kênh cũng sẽ bị xóa.')) {
        this.channels = this.channels.filter(c => c.id !== channelId)
        this.videos = this.videos.filter(v => v.channelId !== channelId)
        this.pendingVideos = this.pendingVideos.filter(v => v.channelId !== channelId)
        this.saveChannels()
        this.saveVideos()
        this.savePendingVideos()
        this.showToast('Kênh đã được xóa!', 'success')
      }
    },
    
    closeAddChannelModal() {
      this.showAddChannelModal = false
      this.newChannel = { name: '', subscribers: '' }
    },
    
    // Video management
    async addVideoFromYouTube() {
      if (!this.newVideo.link.trim() || !this.newVideo.channelId) {
        this.showToast('Vui lòng nhập link YouTube và chọn kênh!', 'error')
        return
      }
      
      this.isUpdating = true
      try {
        const videoInfo = await this.youtubeAPI?.getVideoInfo(this.newVideo.link)
        
        if (!videoInfo) {
          // Fallback if no API
          const videoId = this.newVideo.link.split('v=')[1] || 'unknown'
          const video = {
            id: Date.now(),
            title: `Video ${videoId}`,
            link: this.newVideo.link,
            thumbnail: null,
            views: Math.floor(Math.random() * 50000) + 1000,
            duration: '10:00',
            channelId: this.newVideo.channelId,
            viewGrowth: 0,
            createdAt: new Date(),
            viewHistory: [{
              date: new Date().toISOString().split('T')[0],
              views: Math.floor(Math.random() * 50000) + 1000
            }]
          }
          this.videos.push(video)
        } else {
          const video = {
            id: Date.now(),
            title: videoInfo.title,
            link: this.newVideo.link,
            thumbnail: videoInfo.thumbnail,
            views: videoInfo.viewCount,
            duration: videoInfo.duration,
            channelId: this.newVideo.channelId,
            viewGrowth: 0,
            createdAt: new Date(),
            viewHistory: [{
              date: new Date().toISOString().split('T')[0],
              views: videoInfo.viewCount
            }]
          }
          this.videos.push(video)
        }
        
        this.saveVideos()
        this.closeAddVideoModal()
        this.showToast('Video đã được thêm từ YouTube!', 'success')
      } catch (error) {
        this.showToast('Lỗi khi lấy thông tin video: ' + error.message, 'error')
      } finally {
        this.isUpdating = false
      }
    },
    
    async updateVideoViews(video) {
      this.isUpdating = true
      try {
        const currentViews = await this.youtubeAPI?.getCurrentViews(video.link) || 
                            Math.floor(video.views * (1 + (Math.random() * 0.2 - 0.1)))
        
        const oldViews = video.views
        const growth = oldViews > 0 ? ((currentViews - oldViews) / oldViews) * 100 : 0
        
        const updatedVideo = {
          ...video,
          views: currentViews,
          viewGrowth: parseFloat(growth.toFixed(1)),
          viewHistory: [
            ...video.viewHistory,
            {
              date: new Date().toISOString().split('T')[0],
              views: currentViews
            }
          ]
        }
        
        const index = this.videos.findIndex(v => v.id === video.id)
        if (index !== -1) {
          this.videos[index] = updatedVideo
        }
        
        this.saveVideos()
        this.showToast(`Views đã được cập nhật: ${this.formatViews(currentViews)}`, 'success')
      } catch (error) {
        this.showToast('Lỗi khi cập nhật views: ' + error.message, 'error')
      } finally {
        this.isUpdating = false
      }
    },
    
    async updateAllViews() {
      if (!confirm('Bạn có muốn cập nhật tất cả views từ YouTube?')) return
      
      this.isUpdating = true
      let successCount = 0
      
      for (const video of this.videos) {
        try {
          const currentViews = await this.youtubeAPI?.getCurrentViews(video.link) || 
                              Math.floor(video.views * (1 + (Math.random() * 0.2 - 0.1)))
          
          const oldViews = video.views
          const growth = oldViews > 0 ? ((currentViews - oldViews) / oldViews) * 100 : 0
          
          const updatedVideo = {
            ...video,
            views: currentViews,
            viewGrowth: parseFloat(growth.toFixed(1)),
            viewHistory: [
              ...video.viewHistory,
              {
                date: new Date().toISOString().split('T')[0],
                views: currentViews
              }
            ]
          }
          
          const index = this.videos.findIndex(v => v.id === video.id)
          if (index !== -1) {
            this.videos[index] = updatedVideo
          }
          successCount++
        } catch (error) {
          console.error(`Error updating video ${video.id}:`, error)
        }
      }
      
      this.saveVideos()
      this.isUpdating = false
      this.showToast(`Đã cập nhật ${successCount}/${this.videos.length} video thành công!`, 'success')
    },
    
    deleteVideo(videoId) {
      if (confirm('Bạn có chắc muốn xóa video này?')) {
        this.videos = this.videos.filter(v => v.id !== videoId)
        this.saveVideos()
        this.showToast('Video đã được xóa!', 'success')
      }
    },
    
    closeAddVideoModal() {
      this.showAddVideoModal = false
      this.newVideo = { link: '', channelId: '' }
    },
    
    // Pending video management
    addPendingVideo() {
      if (!this.newPendingVideo.title.trim() || !this.newPendingVideo.channelId) return
      
      const pendingVideo = {
        id: Date.now(),
        title: this.newPendingVideo.title,
        expectedViews: parseInt(this.newPendingVideo.expectedViews) || 0,
        channelId: this.newPendingVideo.channelId,
        status: this.newPendingVideo.status,
        createdAt: new Date()
      }
      
      this.pendingVideos.push(pendingVideo)
      this.savePendingVideos()
      this.closeAddPendingVideoModal()
      this.showToast('Ý tưởng video đã được thêm!', 'success')
    },
    
    deletePendingVideo(videoId) {
      if (confirm('Bạn có chắc muốn xóa ý tưởng video này?')) {
        this.pendingVideos = this.pendingVideos.filter(v => v.id !== videoId)
        this.savePendingVideos()
        this.showToast('Ý tưởng video đã được xóa!', 'success')
      }
    },
    
    closeAddPendingVideoModal() {
      this.showAddPendingVideoModal = false
      this.newPendingVideo = {
        title: '',
        expectedViews: 0,
        channelId: '',
        status: 'idea'
      }
    },
    
    // Storage methods
    loadData() {
      const savedApiKey = localStorage.getItem('youtube-api-key')
      if (savedApiKey) {
        this.apiKey = savedApiKey
        this.youtubeAPI = new YouTubeAPI(savedApiKey)
      }
      
      const savedTasks = localStorage.getItem('tasks')
      if (savedTasks) {
        this.tasks = JSON.parse(savedTasks)
      }
      
      const savedChannels = localStorage.getItem('youtube-channels')
      if (savedChannels) {
        this.channels = JSON.parse(savedChannels)
      }
      
      const savedVideos = localStorage.getItem('youtube-videos')
      if (savedVideos) {
        this.videos = JSON.parse(savedVideos)
      }
      
      const savedPendingVideos = localStorage.getItem('youtube-pending-videos')
      if (savedPendingVideos) {
        this.pendingVideos = JSON.parse(savedPendingVideos)
      }
    },
    
    saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(this.tasks))
    },
    
    saveChannels() {
      localStorage.setItem('youtube-channels', JSON.stringify(this.channels))
    },
    
    saveVideos() {
      localStorage.setItem('youtube-videos', JSON.stringify(this.videos))
    },
    
    savePendingVideos() {
      localStorage.setItem('youtube-pending-videos', JSON.stringify(this.pendingVideos))
    },
    
    // Auto-update setup
    setupAutoUpdate() {
      // Auto-update views every 30 minutes
      setInterval(() => {
        if (this.youtubeAPI && this.videos.length > 0) {
          this.updateAllViews()
        }
      }, 30 * 60 * 1000)
    },
    
    // Toast notification
    showToast(message, type = 'info') {
      const toast = document.createElement('div')
      toast.className = `toast toast-${type}`
      toast.textContent = message
      
      document.body.appendChild(toast)
      
      setTimeout(() => {
        toast.classList.add('toast-show')
      }, 100)
      
      setTimeout(() => {
        toast.classList.remove('toast-show')
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast)
          }
        }, 300)
      }, 3000)
    }
  }
}
</script>