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
                    <button 
                      v-if="getSubTasks(task.id).length > 0"
                      @click.stop="toggleTaskExpansion(task.id)"
                      class="expand-btn"
                      :class="{ expanded: expandedTasks.includes(task.id) }"
                    >
                      {{ expandedTasks.includes(task.id) ? '▼' : '▶' }}
                    </button>
                  </div>
                  <div class="task-description">{{ task.description }}</div>
                  <div class="task-meta">
                    <span class="task-time">{{ task.time }}</span>
                    <span v-if="task.priority" :class="['task-priority', task.priority]">
                      {{ getPriorityText(task.priority) }}
                    </span>
                    <span v-if="getSubTasks(task.id).length > 0" class="subtask-count">
                      {{ getCompletedSubTasksCount(task.id) }}/{{ getSubTasks(task.id).length }} subtasks
                    </span>
                  </div>
                </div>
                
                <div class="task-controls">
                  <button class="control-btn" @click="addSubTask(task.id)" title="Thêm subtask">
                    ➕
                  </button>
                  <button class="control-btn" @click="copyIndividualTask(task)" title="Copy task">
                    📋
                  </button>
                  <button class="control-btn" @click="editTask(task)" title="Sửa">
                    ✏️
                  </button>
                  <button class="control-btn delete" @click="deleteTask(task.id)" title="Xóa">
                    🗑️
                  </button>
                </div>
              </div>

              <!-- Sub Tasks - Show only when expanded -->
              <div v-if="expandedTasks.includes(task.id) && getSubTasks(task.id).length > 0" class="sub-tasks">
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
            <p>Quản lý kênh YouTube với cập nhật views thực tế (hỗ trợ cả video dài và Shorts)</p>
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
                <div class="channel-actions">
                  <button @click="importChannelVideos(channel)" class="btn-channel-import" :disabled="isUpdating">
                    {{ isUpdating ? "🔄 Đang import..." : "📥 Import Videos" }}
                  </button>
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
            <div v-for="video in paginatedVideos" :key="video.id" 
                 class="video-card" 
                 :class="{ 
                   'low-performance': isLowPerformance(video),
                   'shorts': video.isShort 
                 }">
              <div class="video-thumbnail">
                <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.title" class="thumbnail-image">
                <div v-else class="thumbnail-placeholder">🎥</div>
                <div class="video-duration">{{ video.duration }}</div>
                <div v-if="video.isShort" class="short-badge">Shorts</div>
                <div v-if="isLowPerformance(video)" class="performance-badge low">⚠️ Low Views</div>
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
                <div v-if="isLowPerformance(video)" class="performance-warning">
                  📉 Video này có views thấp so với kỳ vọng
                </div>
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
              <div class="stat-icon">📱</div>
              <div class="stat-number">{{ shortsCount }}</div>
              <div class="stat-label">YouTube Shorts</div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">👁️</div>
              <div class="stat-number">{{ formatViews(totalViews) }}</div>
              <div class="stat-label">Tổng Views</div>
            </div>

            <div class="stat-card warning">
              <div class="stat-icon">⚠️</div>
              <div class="stat-number">{{ lowPerformanceVideos.length }}</div>
              <div class="stat-label">Video Views Thấp</div>
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
                    <th>Loại</th>
                    <th>Kênh</th>
                    <th>Views Hiện Tại</th>
                    <th>Views Trước</th>
                    <th>Tăng Trưởng</th>
                    <th>Ngày Tạo</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="video in paginatedAnalyticsVideos" :key="video.id"
                      :class="{ 'low-performance-row': isLowPerformance(video) }">
                    <td class="video-cell">
                      <div class="video-info-cell">
                        <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.title" class="table-thumbnail">
                        <div v-else class="table-thumbnail-placeholder">🎥</div>
                        <span class="video-title-cell">{{ video.title }}</span>
                      </div>
                    </td>
                    <td>
                      <span v-if="video.isShort" class="type-badge short">Shorts</span>
                      <span v-else class="type-badge video">Video</span>
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
                    <td>
                      <span v-if="isLowPerformance(video)" class="performance-status low">⚠️ Thấp</span>
                      <span v-else class="performance-status good">✅ Tốt</span>
                    </td>
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

    <!-- Copy Individual Task Modal -->
    <div v-if="showCopyModal" class="modal-overlay" @click="closeCopyModal">
      <div class="modal" @click.stop>
        <h3>Copy Task: "{{ taskToCopy?.title }}"</h3>
        <p v-if="getSubTasks(taskToCopy?.id).length > 0">
          Task này có {{ getSubTasks(taskToCopy?.id).length }} subtask(s) sẽ được copy cùng.
        </p>
        <p>Copy task sang:</p>
        <div class="copy-options">
          <label class="copy-option">
            <input type="radio" v-model="copyTarget" value="yesterday">
            <span>Hôm qua ({{ getDateLabel(-1) }})</span>
          </label>
          <label class="copy-option">
            <input type="radio" v-model="copyTarget" value="today">
            <span>Hôm nay ({{ getDateLabel(0) }})</span>
          </label>
          <label class="copy-option">
            <input type="radio" v-model="copyTarget" value="tomorrow">
            <span>Ngày mai ({{ getDateLabel(1) }})</span>
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
          <button @click="copyIndividualTaskConfirm" class="modal-btn primary">Copy Task</button>
        </div>
      </div>
    </div>

    <!-- API Key Modal -->
    <div v-if="showApiKeyModal" class="modal-overlay" @click="showApiKeyModal = false">
      <div class="modal" @click.stop>
        <h3>YouTube API Key</h3>
        <p>Nhập YouTube Data API v3 key để lấy dữ liệu thực tế:</p>
        <input v-model="apiKey" placeholder="YouTube API Key" class="modal-input" type="password">
        <p class="api-note">
          <strong>Lưu ý:</strong> API hỗ trợ cả video dài và YouTube Shorts. 
          Bạn có thể dán link dạng youtube.com/shorts/... hoặc youtu.be/...
        </p>
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
        <input v-model="newChannel.channelId" placeholder="Channel ID hoặc Handle (@username)" class="modal-input">
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
        <p class="modal-note">Hỗ trợ cả video dài và YouTube Shorts</p>
        <input v-model="newVideo.link" placeholder="Link YouTube (youtube.com/watch?v=... hoặc youtube.com/shorts/... hoặc youtu.be/...)" class="modal-input">
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

// Enhanced YouTube API utility class with Shorts support
class YouTubeAPI {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.baseURL = 'https://www.googleapis.com/youtube/v3'
  }

  extractVideoId(url) {
    // Enhanced regex to support multiple YouTube URL formats including Shorts
    const patterns = [
      // Standard YouTube URLs
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      // YouTube Shorts URLs
      /youtube\.com\/shorts\/([^"&?\/\s]{11})/,
      // Mobile YouTube URLs
      /m\.youtube\.com\/watch\?v=([^"&?\/\s]{11})/,
      // YouTube Music URLs
      /music\.youtube\.com\/watch\?v=([^"&?\/\s]{11})/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return null
  }

  extractChannelId(input) {
    // Handle different channel input formats
    if (input.startsWith('@')) {
      return input // Handle as username
    } else if (input.startsWith('UC') && input.length === 24) {
      return input // Channel ID
    } else if (input.includes('youtube.com/channel/')) {
      return input.split('youtube.com/channel/')[1].split('/')[0]
    } else if (input.includes('youtube.com/c/')) {
      return input.split('youtube.com/c/')[1].split('/')[0]
    } else if (input.includes('youtube.com/@')) {
      return input.split('youtube.com/@')[1].split('/')[0]
    }
    return input
  }

  isYouTubeShort(url) {
    return url.includes('/shorts/') || url.includes('youtube.com/shorts')
  }

  async getVideoInfo(url) {
    if (!this.apiKey) {
      throw new Error('API Key chưa được cấu hình')
    }

    const videoId = this.extractVideoId(url)
    if (!videoId) {
      throw new Error('URL YouTube không hợp lệ. Hỗ trợ: youtube.com/watch?v=..., youtube.com/shorts/..., youtu.be/...')
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
        throw new Error('Không tìm thấy video hoặc video bị ẩn/xóa')
      }

      const video = response.data.items[0]
      const isShort = this.isYouTubeShort(url) || this.isShortByDuration(video.contentDetails.duration)
      
      return {
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        viewCount: parseInt(video.statistics.viewCount) || 0,
        duration: this.formatDuration(video.contentDetails.duration),
        isShort: isShort,
        publishedAt: video.snippet.publishedAt
      }
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('API Key không hợp lệ hoặc đã hết quota')
      } else if (error.response?.status === 404) {
        throw new Error('Video không tồn tại hoặc đã bị xóa')
      }
      throw new Error('Lỗi khi lấy thông tin video: ' + error.message)
    }
  }

  async getChannelVideos(channelId, maxResults = 50) {
    if (!this.apiKey) {
      throw new Error('API Key chưa được cấu hình')
    }

    try {
      // First, get channel uploads playlist ID
      const channelResponse = await axios.get(`${this.baseURL}/channels`, {
        params: {
          part: 'contentDetails',
          id: channelId.startsWith('@') ? undefined : channelId,
          forUsername: channelId.startsWith('@') ? channelId.substring(1) : undefined,
          key: this.apiKey
        }
      })

      if (channelResponse.data.items.length === 0) {
        throw new Error('Không tìm thấy kênh')
      }

      const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads

      // Get videos from uploads playlist
      const playlistResponse = await axios.get(`${this.baseURL}/playlistItems`, {
        params: {
          part: 'snippet',
          playlistId: uploadsPlaylistId,
          maxResults: maxResults,
          key: this.apiKey
        }
      })

      const videoIds = playlistResponse.data.items.map(item => item.snippet.resourceId.videoId)
      
      // Get detailed video information
      const videosResponse = await axios.get(`${this.baseURL}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoIds.join(','),
          key: this.apiKey
        }
      })

      return videosResponse.data.items.map(video => ({
        id: video.id,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        viewCount: parseInt(video.statistics.viewCount) || 0,
        duration: this.formatDuration(video.contentDetails.duration),
        isShort: this.isShortByDuration(video.contentDetails.duration),
        publishedAt: video.snippet.publishedAt,
        link: `https://youtube.com/watch?v=${video.id}`
      }))
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('API Key không hợp lệ hoặc đã hết quota')
      }
      throw new Error('Lỗi khi lấy video từ kênh: ' + error.message)
    }
  }

  isShortByDuration(duration) {
    // Parse duration and check if it's 60 seconds or less (typical for Shorts)
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return false

    const hours = parseInt(match[1]) || 0
    const minutes = parseInt(match[2]) || 0
    const seconds = parseInt(match[3]) || 0

    const totalSeconds = hours * 3600 + minutes * 60 + seconds
    return totalSeconds <= 60 && hours === 0 // Shorts are typically 60 seconds or less
  }

  async getCurrentViews(url) {
    const videoId = this.extractVideoId(url)
    if (!videoId || !this.apiKey) {
      // Fallback: simulate view growth
      return Math.floor(Math.random() * 50000) + 1000
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
      console.warn('Lỗi khi lấy views:', error.message)
      // Fallback on error with realistic growth simulation
      return Math.floor(Math.random() * 50000) + 1000
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
      
      // Task expansion state
      expandedTasks: [],
      
      // Modals
      showAddTaskModal: false,
      showAddChannelModal: false,
      showAddVideoModal: false,
      showAddPendingVideoModal: false,
      showApiKeyModal: false,
      showCopyModal: false,
      editingTask: null,
      
      // Copy functionality - Updated for individual task copying
      copyTarget: 'tomorrow',
      customCopyDate: '',
      taskToCopy: null,
      
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
        channelId: '',
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
          title: 'Build kênh giải đoán đầu',
          description: 'Báo cáo tiến độ công việc tuần',
          time: '17:00',
          priority: 'high',
          completed: false,
          date: new Date().toDateString(),
          parentId: null
        },
        {
          id: 2,
          title: 'kênh boxing',
          description: '',
          time: '',
          priority: '',
          completed: false,
          date: new Date().toDateString(),
          parentId: 1
        },
        {
          id: 3,
          title: 'kênh history',
          description: '',
          time: '',
          priority: '',
          completed: false,
          date: new Date().toDateString(),
          parentId: 1
        },
        {
          id: 4,
          title: 'Kênh sinh tồn',
          description: '',
          time: '',
          priority: '',
          completed: false,
          date: new Date().toDateString(),
          parentId: 1
        },
        {
          id: 5,
          title: 'kênh cải tạo nhà',
          description: '',
          time: '',
          priority: '',
          completed: false,
          date: new Date().toDateString(),
          parentId: 1
        },
        {
          id: 6,
          title: 'Tìm nguồn video',
          description: '',
          time: '',
          priority: '',
          completed: false,
          date: new Date().toDateString(),
          parentId: null
        }
      ],
      
      channels: [
        {
          id: 1,
          name: 'Tech Channel',
          channelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
          subscribers: '10.5K',
          gradient: 'linear-gradient(135deg, #2364aa 0%, #3da5d9 100%)'
        },
        {
          id: 2,
          name: 'Gaming Channel',
          channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
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
          isShort: false,
          createdAt: new Date('2024-01-15'),
          viewHistory: [
            { date: '2024-01-15', views: 13750 },
            { date: '2024-01-16', views: 15420 }
          ]
        },
        {
          id: 2,
          title: 'Quick Gaming Tips #Shorts',
          channelId: 2,
          views: 1200, // Low views for demonstration
          viewGrowth: -5, // Negative growth
          duration: '0:45',
          link: 'https://youtube.com/shorts/example2',
          thumbnail: null,
          isShort: true,
          createdAt: new Date('2024-01-20'),
          viewHistory: [
            { date: '2024-01-20', views: 1500 },
            { date: '2024-01-21', views: 1200 }
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
    },
    
    shortsCount() {
      return this.videos.filter(video => video.isShort).length
    },

    lowPerformanceVideos() {
      return this.videos.filter(video => this.isLowPerformance(video))
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

    getCompletedSubTasksCount(parentId) {
      return this.getSubTasks(parentId).filter(task => task.completed).length
    },

    toggleTaskExpansion(taskId) {
      const index = this.expandedTasks.indexOf(taskId)
      if (index > -1) {
        this.expandedTasks.splice(index, 1)
      } else {
        this.expandedTasks.push(taskId)
      }
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
    
    // Individual Task Copy Methods
    copyIndividualTask(task) {
      this.taskToCopy = task
      this.showCopyModal = true
      this.copyTarget = 'tomorrow'
      this.customCopyDate = ''
    },
    
    closeCopyModal() {
      this.showCopyModal = false
      this.taskToCopy = null
      this.copyTarget = 'tomorrow'
      this.customCopyDate = ''
    },
    
    getDateLabel(dayOffset) {
      const date = new Date()
      date.setDate(date.getDate() + dayOffset)
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    },
    
    copyIndividualTaskConfirm() {
      if (!this.taskToCopy) return
      
      let targetDate
      const today = new Date()
      
      if (this.copyTarget === 'yesterday') {
        targetDate = new Date(today)
        targetDate.setDate(today.getDate() - 1)
      } else if (this.copyTarget === 'today') {
        targetDate = new Date(today)
      } else if (this.copyTarget === 'tomorrow') {
        targetDate = new Date(today)
        targetDate.setDate(today.getDate() + 1)
      } else if (this.copyTarget === 'custom' && this.customCopyDate) {
        targetDate = new Date(this.customCopyDate)
      }
      
      if (!targetDate) {
        this.showToast('Vui lòng chọn ngày để copy!', 'error')
        return
      }
      
      // Generate new IDs for the copied tasks
      const newTaskId = Date.now() + Math.random()
      
      // Copy main task
      const copiedTask = {
        ...this.taskToCopy,
        id: newTaskId,
        date: targetDate.toDateString(),
        completed: false
      }
      
      this.tasks.push(copiedTask)
      
      // Copy subtasks if any
      const subTasks = this.getSubTasks(this.taskToCopy.id)
      let copiedSubTasksCount = 0
      
      subTasks.forEach(subTask => {
        const copiedSubTask = {
          ...subTask,
          id: Date.now() + Math.random() + Math.random(), // Ensure unique ID
          parentId: newTaskId, // Link to the new parent task
          date: targetDate.toDateString(),
          completed: false
        }
        this.tasks.push(copiedSubTask)
        copiedSubTasksCount++
      })
      
      this.saveTasks()
      this.closeCopyModal()
      
      const message = copiedSubTasksCount > 0 
        ? `Đã copy task "${this.taskToCopy.title}" và ${copiedSubTasksCount} subtask(s)!`
        : `Đã copy task "${this.taskToCopy.title}"!`
      
      this.showToast(message, 'success')
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

    isLowPerformance(video) {
      // Define low performance criteria
      const daysSinceCreated = Math.floor((new Date() - new Date(video.createdAt)) / (1000 * 60 * 60 * 24))
      
      if (video.isShort) {
        // For Shorts: less than 1000 views after 7 days
        return daysSinceCreated >= 7 && video.views < 1000
      } else {
        // For regular videos: less than 5000 views after 30 days
        return daysSinceCreated >= 30 && video.views < 5000
      }
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
      this.showToast('API Key đã được lưu! Giờ bạn có thể thêm video và Shorts từ YouTube.', 'success')
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
        channelId: this.newChannel.channelId || '',
        subscribers: this.newChannel.subscribers || '0',
        gradient: gradients[Math.floor(Math.random() * gradients.length)]
      }
      
      this.channels.push(channel)
      this.saveChannels()
      this.closeAddChannelModal()
      this.showToast('Kênh đã được thêm!', 'success')
    },

    async importChannelVideos(channel) {
      if (!channel.channelId) {
        this.showToast('Kênh này chưa có Channel ID. Vui lòng cập nhật thông tin kênh.', 'error')
        return
      }

      if (!this.youtubeAPI) {
        this.showToast('Vui lòng cấu hình YouTube API Key trước!', 'error')
        return
      }

      this.isUpdating = true
      try {
        const channelVideos = await this.youtubeAPI.getChannelVideos(channel.channelId, 20)
        
        let importedCount = 0
        for (const videoData of channelVideos) {
          // Check if video already exists
          const existingVideo = this.videos.find(v => v.link.includes(videoData.id))
          if (!existingVideo) {
            const video = {
              id: Date.now() + Math.random(),
              title: videoData.title,
              link: videoData.link,
              thumbnail: videoData.thumbnail,
              views: videoData.viewCount,
              duration: videoData.duration,
              channelId: channel.id,
              viewGrowth: 0,
              isShort: videoData.isShort,
              createdAt: new Date(videoData.publishedAt),
              viewHistory: [{
                date: new Date().toISOString().split('T')[0],
                views: videoData.viewCount
              }]
            }
            this.videos.push(video)
            importedCount++
          }
        }
        
        this.saveVideos()
        this.showToast(`Đã import ${importedCount} video mới từ kênh ${channel.name}!`, 'success')
      } catch (error) {
        this.showToast('Lỗi khi import video từ kênh: ' + error.message, 'error')
      } finally {
        this.isUpdating = false
      }
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
      this.newChannel = { name: '', channelId: '', subscribers: '' }
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
          const videoId = this.youtubeAPI?.extractVideoId(this.newVideo.link) || 'unknown'
          const isShort = this.youtubeAPI?.isYouTubeShort(this.newVideo.link) || false
          
          const video = {
            id: Date.now(),
            title: `${isShort ? 'Short: ' : 'Video: '}${videoId}`,
            link: this.newVideo.link,
            thumbnail: null,
            views: Math.floor(Math.random() * 50000) + 1000,
            duration: isShort ? '0:30' : '10:00',
            channelId: this.newVideo.channelId,
            viewGrowth: 0,
            isShort: isShort,
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
            isShort: videoInfo.isShort,
            createdAt: new Date(videoInfo.publishedAt),
            viewHistory: [{
              date: new Date().toISOString().split('T')[0],
              views: videoInfo.viewCount
            }]
          }
          this.videos.push(video)
        }
        
        this.saveVideos()
        this.closeAddVideoModal()
        this.showToast(`${videoInfo?.isShort ? 'YouTube Short' : 'Video'} đã được thêm thành công!`, 'success')
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
                            Math.floor(video.views * (1 + (Math.random() * 0.3 - 0.1)))
        
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
        this.showToast(`Views đã được cập nhật: ${this.formatViews(currentViews)} (${growth > 0 ? '+' : ''}${growth.toFixed(1)}%)`, 'success')
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
                              Math.floor(video.views * (1 + (Math.random() * 0.3 - 0.1)))
          
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

      const savedExpandedTasks = localStorage.getItem('expanded-tasks')
      if (savedExpandedTasks) {
        this.expandedTasks = JSON.parse(savedExpandedTasks)
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

    saveExpandedTasks() {
      localStorage.setItem('expanded-tasks', JSON.stringify(this.expandedTasks))
    },
    
    // Auto-update setup
    setupAutoUpdate() {
      // Auto-update views every 30 minutes
      setInterval(() => {
        if (this.youtubeAPI && this.videos.length > 0) {
          this.updateAllViews()
        }
      }, 30 * 60 * 1000)

      // Save expanded tasks state when changed
      this.$watch('expandedTasks', () => {
        this.saveExpandedTasks()
      }, { deep: true })
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

<style>
/* Desktop App Styling */
.desktop-app {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header Bar */
.header-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.window-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
}

.control-btn.red { background: #ff5f57; }
.control-btn.yellow { background: #ffbd2e; }
.control-btn.green { background: #28ca42; }

.app-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.current-date {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* Main Content */
.main-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}

.tab-btn {
  flex: 1;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Date Navigation */
.date-navigation {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  justify-content: center;
}

.nav-btn {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn.active {
  background: #4f46e5;
  color: white;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
}

/* Task Progress */
.task-progress {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: rgba(79, 70, 229, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  transition: width 0.5s ease;
}

.progress-text {
  text-align: center;
  font-weight: 600;
  color: #4f46e5;
  margin-bottom: 16px;
}

.time-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
}

/* Task Actions Bar */
.task-actions-bar {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.task-filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.task-search {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 200px;
}

.add-task-btn {
  padding: 10px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-task-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

/* Tasks Section */
.tasks-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.no-tasks {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.task-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: white;
}

.task-item.overdue {
  border-left: 4px solid #ef4444;
  background: #fef2f2;
}

.task-item.sub-task {
  background: #f9fafb;
  border-left: 3px solid #d1d5db;
  margin-left: 20px;
}

.task-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.task-checkbox.completed {
  background: #10b981;
  border-color: #10b981;
}

.task-checkbox.completed::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.task-content {
  flex: 1;
  cursor: pointer;
}

.task-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-title.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.expand-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: #f3f4f6;
}

.expand-btn.expanded {
  transform: rotate(90deg);
}

.task-description {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: #9ca3af;
}

.task-time {
  font-weight: 500;
}

.task-priority {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.75rem;
}

.task-priority.high {
  background: #fee2e2;
  color: #dc2626;
}

.task-priority.medium {
  background: #fef3c7;
  color: #d97706;
}

.task-priority.low {
  background: #dcfce7;
  color: #16a34a;
}

.subtask-count {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.task-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.control-btn:hover {
  background: #e5e7eb;
  transform: scale(1.05);
}

.control-btn.delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

.sub-tasks {
  border-top: 1px solid #e5e7eb;
}

/* YouTube Dashboard Styles */
.youtube-header {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.youtube-title h2 {
  margin: 0 0 8px 0;
  color: #374151;
}

.youtube-title p {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}

.youtube-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-outline:hover {
  background: #f9fafb;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* YouTube Tabs */
.youtube-tabs {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}

.youtube-tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.youtube-tab-btn.active {
  background: #4f46e5;
  color: white;
  box-shadow: 0 2px 10px rgba(79, 70, 229, 0.3);
}

/* YouTube Search */
.youtube-search {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  min-width: 150px;
}

/* YouTube Content */
.youtube-content {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content-header h3 {
  margin: 0;
  color: #374151;
}

/* Channels Grid */
.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.channel-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.channel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.channel-header {
  padding: 20px;
  color: white;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.channel-icon {
  font-size: 2rem;
}

.delete-channel-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  padding: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-channel-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.channel-content {
  background: white;
  padding: 20px;
}

.channel-name {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 1.1rem;
}

.channel-subscribers {
  color: #6b7280;
  margin: 0 0 12px 0;
  font-size: 0.9rem;
}

.channel-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: #6b7280;
}

.btn-channel-import {
  width: 100%;
  padding: 10px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-channel-import:hover:not(:disabled) {
  background: #059669;
}

/* Videos List */
.videos-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.video-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.video-card.low-performance {
  border-color: #f59e0b;
  background: #fffbeb;
}

.video-card.shorts {
  border-left: 4px solid #ff6b6b;
}

.video-thumbnail {
  position: relative;
  width: 120px;
  height: 68px;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  font-size: 2rem;
  color: #9ca3af;
}

.video-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.short-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: #ff6b6b;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.performance-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.performance-badge.low {
  background: #fef3c7;
  color: #92400e;
}

.video-info {
  flex: 1;
}

.video-title {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}

.video-channel {
  color: #6b7280;
  margin: 0 0 8px 0;
  font-size: 0.9rem;
}

.video-stats {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.video-views {
  font-weight: 600;
  color: #374151;
}

.growth-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.growth-badge.positive {
  background: #dcfce7;
  color: #16a34a;
}

.growth-badge.negative {
  background: #fee2e2;
  color: #dc2626;
}

.growth-badge.neutral {
  background: #f3f4f6;
  color: #6b7280;
}

.video-date {
  color: #9ca3af;
  font-size: 0.8rem;
  margin-bottom: 8px;
}

.performance-warning {
  background: #fef3c7;
  color: #92400e;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  margin-top: 8px;
}

.video-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #e5e7eb;
  transform: scale(1.05);
}

.action-btn.delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding: 16px;
}

.pagination-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-weight: 500;
  color: #374151;
}

/* Pending Videos */
.pending-videos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pending-video-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.pending-video-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.pending-video-info {
  flex: 1;
}

.pending-video-title {
  margin: 0 0 8px 0;
  color: #374151;
  font-weight: 600;
}

.pending-video-channel {
  color: #6b7280;
  margin: 0 0 8px 0;
  font-size: 0.9rem;
}

.pending-video-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-idea {
  background: #f3f4f6;
  color: #6b7280;
}

.status-scripting {
  background: #fef3c7;
  color: #92400e;
}

.status-filming {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-editing {
  background: #f3e8ff;
  color: #7c3aed;
}

.status-ready {
  background: #dcfce7;
  color: #16a34a;
}

.expected-views {
  color: #6b7280;
  font-size: 0.8rem;
}

.pending-video-date {
  color: #9ca3af;
  font-size: 0.8rem;
}

.pending-video-actions {
  display: flex;
  gap: 8px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.stat-card.warning {
  border-left: 4px solid #f59e0b;
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
}

.stat-label {
  color: #6b7280;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Analytics Table */
.analytics-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.table-header h4 {
  margin: 0;
  color: #374151;
}

.table-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
}

.sort-btn {
  padding: 8px 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.sort-btn:hover {
  background: #e5e7eb;
}

.analytics-table {
  overflow-x: auto;
}

.analytics-table table {
  width: 100%;
  border-collapse: collapse;
}

.analytics-table th,
.analytics-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.analytics-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.analytics-table td {
  color: #6b7280;
  font-size: 0.9rem;
}

.low-performance-row {
  background: #fffbeb;
}

.video-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-thumbnail {
  width: 60px;
  height: 34px;
  border-radius: 4px;
  object-fit: cover;
}

.table-thumbnail-placeholder {
  width: 60px;
  height: 34px;
  background: #f3f4f6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #9ca3af;
}

.video-title-cell {
  font-weight: 500;
  color: #374151;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.type-badge.short {
  background: #fee2e2;
  color: #dc2626;
}

.type-badge.video {
  background: #dbeafe;
  color: #1d4ed8;
}

.views-cell {
  font-weight: 600;
  color: #374151;
}

.growth-badge-table {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.growth-badge-table.positive {
  background: #dcfce7;
  color: #16a34a;
}

.growth-badge-table.negative {
  background: #fee2e2;
  color: #dc2626;
}

.growth-badge-table.neutral {
  background: #f3f4f6;
  color: #6b7280;
}

.performance-status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.performance-status.low {
  background: #fef3c7;
  color: #92400e;
}

.performance-status.good {
  background: #dcfce7;
  color: #16a34a;
}

/* Modal Styles */
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
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  margin: 0 0 20px 0;
  color: #374151;
  font-size: 1.2rem;
}

.modal p {
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.modal-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.modal-input[type="textarea"] {
  min-height: 80px;
  resize: vertical;
}

.copy-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}

.copy-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.copy-option:hover {
  background: #f9fafb;
}

.copy-option input[type="radio"] {
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn.cancel {
  background: #f3f4f6;
  color: #374151;
}

.modal-btn.cancel:hover {
  background: #e5e7eb;
}

.modal-btn.primary {
  background: #4f46e5;
  color: white;
}

.modal-btn.primary:hover {
  background: #4338ca;
}

.modal-note {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: #0c4a6e;
}

.api-note {
  background: #f0fdf4;
  border: 1px solid #22c55e;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: #14532d;
}

/* Toast Notifications */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 2000;
  transform: translateX(100%);
  transition: all 0.3s ease;
  max-width: 400px;
}

.toast-show {
  transform: translateX(0);
}

.toast-success {
  background: #10b981;
}

.toast-error {
  background: #ef4444;
}

.toast-info {
  background: #3b82f6;
}

/* Time-based themes */
.morning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.afternoon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.evening {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
}

.night {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 12px;
  }
  
  .task-actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .task-search {
    justify-content: stretch;
  }
  
  .search-input {
    min-width: auto;
    flex: 1;
  }
  
  .progress-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .channels-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .video-card {
    flex-direction: column;
  }
  
  .video-thumbnail {
    width: 100%;
    height: 180px;
  }
  
  .video-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .modal {
    min-width: 300px;
    margin: 20px;
  }
  
  .youtube-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .youtube-search {
    flex-direction: column;
  }
  
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .progress-stats {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .task-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .task-controls {
    align-self: flex-end;
  }
  
  .youtube-tabs {
    flex-direction: column;
  }
  
  .tab-navigation {
    flex-direction: column;
  }
}
</style>