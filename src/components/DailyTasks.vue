<template>
  <div>
    <!-- Date Navigation -->
    <div class="date-navigation">
      <button 
        class="nav-btn"
        :class="{ active: selectedDateIndex === 0 }"
        @click="selectDateByIndex(0)"
      >
        Hôm qua
      </button>
      <button 
        class="nav-btn"
        :class="{ active: selectedDateIndex === 1 }"
        @click="selectDateByIndex(1)"
      >
        Hôm nay
      </button>
      <button 
        class="nav-btn"
        :class="{ active: selectedDateIndex === 2 }"
        @click="selectDateByIndex(2)"
      >
        Ngày mai
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
          class="filter-btn"
          :class="{ active: taskFilter === 'all' }"
          @click="taskFilter = 'all'"
        >
          Tất cả ({{ selectedDayTasks.length }})
        </button>
        <button 
          class="filter-btn"
          :class="{ active: taskFilter === 'completed' }"
          @click="taskFilter = 'completed'"
        >
          Đã xong ({{ completedTasksCount }})
        </button>
        <button 
          class="filter-btn"
          :class="{ active: taskFilter === 'pending' }"
          @click="taskFilter = 'pending'"
        >
          Chưa xong ({{ remainingTasksCount }})
        </button>
      </div>
      <div class="task-bulk-actions">
        <button class="bulk-btn" @click="markAllCompleted" v-if="remainingTasksCount > 0">
          ✅ Hoàn thành tất cả
        </button>
        <button class="bulk-btn" @click="exportTasks">
          📊 Xuất dữ liệu
        </button>
      </div>
    </div>

    <!-- Calendar Section -->
    <div class="calendar-section">
      <div class="date-header">
        <div class="current-date">{{ formattedDate }}</div>
        <h1 class="today-title">{{ dateTitle }}</h1>
      </div>
      
      <div class="calendar-grid">
        <div 
          v-for="day in weekDays" 
          :key="day.date"
          class="calendar-day"
          :class="{ 
            active: day.date === selectedDate.toDateString(),
            today: day.isToday,
            past: day.isPast,
            future: day.isFuture,
            'has-tasks': getDayTaskCount(day.fullDate) > 0
          }"
          @click="selectDay(day)"
        >
          <div class="day-name">{{ day.name }}</div>
          <div class="day-number">{{ day.number }}</div>
          <div v-if="getDayTaskCount(day.fullDate) > 0" class="task-count">
            {{ getDayTaskCount(day.fullDate) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Tasks Section -->
    <div class="tasks-section">
      <div class="tasks-header">
        <h3>Công việc</h3>
        <div class="task-header-actions">
          <div class="search-tasks">
            <input 
              v-model="searchQuery" 
              placeholder="🔍 Tìm kiếm công việc..."
              class="search-input"
            >
          </div>
          <button class="copy-btn" @click="showCopyModal = true" v-if="selectedDayTasks.length > 0">
            📋 Copy sang ngày khác
          </button>
        </div>
      </div>

      <div v-if="filteredTasks.length === 0" class="no-tasks">
        <p style="text-align: center; color: rgba(255, 255, 255, 0.7); padding: 2rem; font-size: 1.125rem;">
          {{ searchQuery ? 'Không tìm thấy công việc nào.' : 'Chưa có công việc nào cho ngày này' }}
        </p>
      </div>
      
      <div v-else class="tasks-list">
        <div 
          v-for="task in filteredRootTasks" 
          :key="task.id"
          class="task-group"
        >
          <!-- Parent Task -->
          <div class="task-item parent-task" :class="{ overdue: isOverdue(task) }">
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
                <span v-if="isOverdue(task)" class="overdue-badge">Quá hạn</span>
              </div>
              <div class="task-description">{{ task.description }}</div>
              <div class="task-meta">
                <span class="task-time">{{ task.time }}</span>
                <span v-if="task.priority" class="task-priority" :class="task.priority">
                  {{ getPriorityText(task.priority) }}
                </span>
              </div>
            </div>
            
            <div class="task-controls">
              <button class="control-btn" @click="addSubTask(task.id)" title="Thêm công việc con">
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
              :class="{ overdue: isOverdue(subTask) }"
            >
              <div 
                class="task-checkbox"
                :class="{ completed: subTask.completed }"
                @click="toggleTask(subTask.id)"
              ></div>
              
              <div class="task-content" @click="editTask(subTask)">
                <div 
                  class="task-title"
                  :class="{ completed: subTask.completed }"
                >
                  {{ subTask.title }}
                  <span v-if="isOverdue(subTask)" class="overdue-badge">Quá hạn</span>
                </div>
                <div class="task-description">{{ subTask.description }}</div>
                <div class="task-meta">
                  <span class="task-time">{{ subTask.time }}</span>
                  <span v-if="subTask.priority" class="task-priority" :class="subTask.priority">
                    {{ getPriorityText(subTask.priority) }}
                  </span>
                </div>
              </div>
              
              <div class="task-controls">
                <button class="control-btn" @click="editTask(subTask)" title="Sửa">
                  ✏️
                </button>
                <button class="control-btn delete" @click="deleteTask(subTask.id)" title="Xóa">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Task FAB -->
    <button class="fab" @click="showAddTaskModal = true">+</button>

    <!-- Add/Edit Task Modal -->
    <div v-if="showAddTaskModal || editingTask" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h3>{{ editingTask ? 'Sửa Công Việc' : 'Thêm Công Việc Mới' }}</h3>
        <input 
          v-model="taskForm.title" 
          placeholder="Tên công việc"
          class="modal-input"
        >
        <input 
          v-model="taskForm.description" 
          placeholder="Mô tả"
          class="modal-input"
        >
        <input 
          v-model="taskForm.time" 
          placeholder="Thời gian (VD: 7:00 AM)"
          class="modal-input"
        >
        <select v-model="taskForm.priority" class="modal-input">
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
        <h3>Copy công việc sang ngày khác</h3>
        <div class="copy-options">
          <label class="copy-option">
            <input type="radio" v-model="copyTarget" value="yesterday">
            Hôm qua
          </label>
          <label class="copy-option">
            <input type="radio" v-model="copyTarget" value="tomorrow">
            Ngày mai
          </label>
          <label class="copy-option">
            <input type="radio" v-model="copyTarget" value="custom">
            Ngày khác
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
  </div>
</template>

<script>
export default {
  name: 'DailyTasks',
  data() {
    return {
      selectedDateIndex: 1, // 0: yesterday, 1: today, 2: tomorrow
      selectedDate: new Date(),
      taskFilter: 'all',
      searchQuery: '',
      showAddTaskModal: false,
      showCopyModal: false,
      editingTask: null,
      copyTarget: 'tomorrow',
      customCopyDate: '',
      taskForm: {
        title: '',
        description: '',
        time: '',
        priority: ''
      },
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
      ]
    }
  },
  computed: {
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
    formattedDate() {
      return this.selectedDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    dateTitle() {
      if (this.selectedDateIndex === 0) return 'Hôm qua'
      if (this.selectedDateIndex === 1) return 'Hôm nay'
      return 'Ngày mai'
    },
    weekDays() {
      const days = []
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek)
        day.setDate(startOfWeek.getDate() + i)
        
        days.push({
          name: day.toLocaleDateString('vi-VN', { weekday: 'short' }),
          number: day.getDate(),
          date: day.toDateString(),
          fullDate: day,
          isToday: day.toDateString() === today.toDateString(),
          isPast: day < today && day.toDateString() !== today.toDateString(),
          isFuture: day > today
        })
      }
      return days
    },
    selectedDayTasks() {
      return this.tasks.filter(task => task.date === this.selectedDate.toDateString())
    },
    filteredRootTasks() {
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
    filteredTasks() {
      return this.selectedDayTasks.filter(task => {
        let matches = true
        
        if (this.searchQuery) {
          matches = task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                   task.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        }
        
        if (this.taskFilter === 'completed') {
          matches = matches && task.completed
        } else if (this.taskFilter === 'pending') {
          matches = matches && !task.completed
        }
        
        return matches
      })
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
    }
  },
  methods: {
    selectDateByIndex(index) {
      this.selectedDateIndex = index
      const today = new Date()
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() + (index - 1))
      this.selectedDate = targetDate
    },
    selectDay(day) {
      this.selectedDate = day.fullDate
      // Update selectedDateIndex based on the selected day
      const today = new Date()
      const diffTime = day.fullDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === -1) this.selectedDateIndex = 0
      else if (diffDays === 0) this.selectedDateIndex = 1
      else if (diffDays === 1) this.selectedDateIndex = 2
    },
    getDayTaskCount(date) {
      return this.tasks.filter(task => task.date === date.toDateString()).length
    },
    getSubTasks(parentId) {
      return this.tasks.filter(task => task.parentId === parentId)
    },
    toggleTask(taskId) {
      const task = this.tasks.find(t => t.id === taskId)
      if (task) {
        task.completed = !task.completed
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
        priority: task.priority
      }
    },
    deleteTask(taskId) {
      if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
        this.tasks = this.tasks.filter(t => t.id !== taskId && t.parentId !== taskId)
      }
    },
    saveTask() {
      if (!this.taskForm.title.trim()) return
      
      if (this.editingTask) {
        // Update existing task
        Object.assign(this.editingTask, this.taskForm)
        this.editingTask = null
      } else {
        // Add new task
        const newTask = {
          id: Date.now(),
          ...this.taskForm,
          completed: false,
          date: this.selectedDate.toDateString(),
          parentId: this.taskForm.parentId || null
        }
        this.tasks.push(newTask)
      }
      
      this.closeModal()
    },
    closeModal() {
      this.showAddTaskModal = false
      this.editingTask = null
      this.taskForm = {
        title: '',
        description: '',
        time: '',
        priority: ''
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
        const tasksTooCopy = this.selectedDayTasks.map(task => ({
          ...task,
          id: Date.now() + Math.random(),
          date: targetDate.toDateString(),
          completed: false
        }))
        
        this.tasks.push(...tasksTooCopy)
        this.closeCopyModal()
      }
    },
    markAllCompleted() {
      this.selectedDayTasks.forEach(task => {
        if (!task.completed) {
          task.completed = true
        }
      })
    },
    exportTasks() {
      const data = {
        date: this.selectedDate.toDateString(),
        tasks: this.selectedDayTasks,
        summary: {
          total: this.totalTasksCount,
          completed: this.completedTasksCount,
          remaining: this.remainingTasksCount,
          progress: this.progressPercentage
        }
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tasks-${this.selectedDate.toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
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
    }
  }
}
</script>