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
        <p style="text-align: center; color: var(--text-secondary); padding: 2rem;">
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
      showAddTaskModal: false,
      showCopyModal: false,
      editingTask: null,
      parentTaskId: null,
      copyTarget: 'tomorrow',
      customCopyDate: '',
      currentTime: '',
      timeInterval: null,
      searchQuery: '',
      taskFilter: 'all',
      taskForm: {
        title: '',
        description: '',
        time: '',
        priority: ''
      },
      tasks: [
        {
          id: 1,
          title: 'Wakeup',
          description: 'Early wakeup from bed and fresh',
          time: '7:00 AM',
          priority: 'high',
          date: new Date().toDateString(),
          completed: true,
          parentId: null
        },
        {
          id: 2,
          title: 'demo',
          description: '2/2 hoàn thành',
          time: '8:00 AM',
          priority: 'medium',
          date: new Date().toDateString(),
          completed: false,
          parentId: null
        },
        {
          id: 3,
          title: 'hehe',
          description: 'hehe',
          time: '9:00 AM',
          priority: 'low',
          date: new Date().toDateString(),
          completed: true,
          parentId: 2
        }
      ]
    }
  },
  computed: {
    threeDays() {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      return [yesterday, today, tomorrow];
    },
    formattedDate() {
      return this.selectedDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    },
    dateTitle() {
      if (this.selectedDateIndex === 0) return 'Yesterday';
      if (this.selectedDateIndex === 1) return 'Today';
      if (this.selectedDateIndex === 2) return 'Tomorrow';
      return 'Selected Day';
    },
    weekDays() {
      const today = new Date();
      const startOfWeek = new Date(today);
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);

      const days = [];
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        
        days.push({
          name: dayNames[i],
          number: date.getDate(),
          date: date.toDateString(),
          isToday: date.toDateString() === today.toDateString(),
          isPast: date < today && date.toDateString() !== today.toDateString(),
          isFuture: date > today && date.toDateString() !== today.toDateString(),
          fullDate: date
        });
      }
      
      return days;
    },
    selectedDayTasks() {
      return this.tasks.filter(task => task.date === this.selectedDate.toDateString());
    },
    filteredTasks() {
      let filtered = this.selectedDayTasks;
      
      if (this.searchQuery) {
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      
      if (this.taskFilter === 'completed') {
        filtered = filtered.filter(task => task.completed);
      } else if (this.taskFilter === 'pending') {
        filtered = filtered.filter(task => !task.completed);
      }
      
      return filtered;
    },
    filteredRootTasks() {
      return this.filteredTasks.filter(task => !task.parentId);
    },
    rootTasks() {
      return this.selectedDayTasks.filter(task => !task.parentId);
    },
    completedTasksCount() {
      return this.selectedDayTasks.filter(task => task.completed).length;
    },
    remainingTasksCount() {
      return this.selectedDayTasks.filter(task => !task.completed).length;
    },
    totalTasksCount() {
      return this.selectedDayTasks.length;
    },
    progressPercentage() {
      if (this.totalTasksCount === 0) return 0;
      return Math.round((this.completedTasksCount / this.totalTasksCount) * 100);
    },
    timeBasedTheme() {
      const hour = new Date().getHours();
      
      if (hour >= 6 && hour < 10) return 'morning-theme'; // 6-10h: Sáng
      if (hour >= 10 && hour < 14) return 'noon-theme'; // 10-14h: Trưa
      if (hour >= 14 && hour < 18) return 'afternoon-theme'; // 14-18h: Chiều
      if (hour >= 18 && hour < 22) return 'evening-theme'; // 18-22h: Tối (gần 8h tối)
      return 'night-theme'; // 22-6h: Đêm
    },
    timePeriodText() {
      const hour = new Date().getHours();
      
      if (hour >= 6 && hour < 10) return 'Buổi Sáng';
      if (hour >= 10 && hour < 14) return 'Buổi Trưa';
      if (hour >= 14 && hour < 18) return 'Buổi Chiều';
      if (hour >= 18 && hour < 22) return 'Buổi Tối';
      return 'Buổi Đêm';
    }
  },
  mounted() {
    const savedTasks = localStorage.getItem('dailyTasks');
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    }
    
    this.updateTime();
    this.timeInterval = setInterval(this.updateTime, 1000);
  },
  beforeDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },
  methods: {
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    },
    selectDateByIndex(index) {
      this.selectedDateIndex = index;
      this.selectedDate = this.threeDays[index];
    },
    selectDay(day) {
      this.selectedDate = day.fullDate;
      // Update selectedDateIndex if it matches one of the three days
      const dayStr = day.fullDate.toDateString();
      const todayStr = new Date().toDateString();
      const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
      const tomorrowStr = new Date(Date.now() + 86400000).toDateString();
      
      if (dayStr === yesterdayStr) this.selectedDateIndex = 0;
      else if (dayStr === todayStr) this.selectedDateIndex = 1;
      else if (dayStr === tomorrowStr) this.selectedDateIndex = 2;
      else this.selectedDateIndex = -1;
    },
    getDayTaskCount(date) {
      return this.tasks.filter(task => task.date === date.toDateString()).length;
    },
    getSubTasks(parentId) {
      return this.filteredTasks.filter(task => task.parentId === parentId);
    },
    toggleTask(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        this.saveTasks();
      }
    },
    markAllCompleted() {
      if (confirm('Bạn có chắc muốn đánh dấu tất cả công việc là đã hoàn thành?')) {
        this.selectedDayTasks.forEach(task => {
          if (!task.completed) {
            task.completed = true;
          }
        });
        this.saveTasks();
      }
    },
    exportTasks() {
      const data = {
        date: this.selectedDate.toDateString(),
        tasks: this.selectedDayTasks,
        summary: {
          total: this.totalTasksCount,
          completed: this.completedTasksCount,
          remaining: this.remainingTasksCount,
          percentage: this.progressPercentage
        }
      };
      
      const csvContent = this.generateTaskCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tasks-${this.selectedDate.toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    generateTaskCSV() {
      let csv = 'Tiêu đề,Mô tả,Thời gian,Độ ưu tiên,Trạng thái,Loại\n';
      
      this.selectedDayTasks.forEach(task => {
        const status = task.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành';
        const type = task.parentId ? 'Công việc con' : 'Công việc chính';
        const priority = task.priority ? this.getPriorityText(task.priority) : '';
        
        csv += `"${task.title}","${task.description}","${task.time}","${priority}","${status}","${type}"\n`;
      });
      
      return csv;
    },
    isOverdue(task) {
      if (task.completed) return false;
      
      const now = new Date();
      const taskDate = new Date(task.date);
      const taskTime = task.time;
      
      // Simple check if task is from past date
      if (taskDate < now && taskDate.toDateString() !== now.toDateString()) {
        return true;
      }
      
      return false;
    },
    getPriorityText(priority) {
      const priorityMap = {
        'high': 'Cao',
        'medium': 'Trung bình',
        'low': 'Thấp'
      };
      return priorityMap[priority] || '';
    },
    addSubTask(parentId) {
      this.parentTaskId = parentId;
      this.showAddTaskModal = true;
    },
    editTask(task) {
      this.editingTask = task;
      this.taskForm = {
        title: task.title,
        description: task.description,
        time: task.time,
        priority: task.priority || ''
      };
    },
    deleteTask(taskId) {
      if (confirm('Bạn có chắc muốn xóa công việc này?')) {
        // Delete task and its subtasks
        this.tasks = this.tasks.filter(t => t.id !== taskId && t.parentId !== taskId);
        this.saveTasks();
      }
    },
    saveTask() {
      if (!this.taskForm.title.trim()) return;
      
      if (this.editingTask) {
        // Update existing task
        this.editingTask.title = this.taskForm.title;
        this.editingTask.description = this.taskForm.description;
        this.editingTask.time = this.taskForm.time || '9:00 AM';
        this.editingTask.priority = this.taskForm.priority;
      } else {
        // Add new task
        const task = {
          id: Date.now(),
          title: this.taskForm.title,
          description: this.taskForm.description,
          time: this.taskForm.time || '9:00 AM',
          priority: this.taskForm.priority,
          date: this.selectedDate.toDateString(),
          completed: false,
          parentId: this.parentTaskId
        };
        this.tasks.push(task);
      }
      
      this.saveTasks();
      this.closeModal();
    },
    copyTasks() {
      let targetDate;
      const today = new Date();
      
      if (this.copyTarget === 'yesterday') {
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() - 1);
      } else if (this.copyTarget === 'tomorrow') {
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() + 1);
      } else if (this.copyTarget === 'custom' && this.customCopyDate) {
        targetDate = new Date(this.customCopyDate);
      } else {
        return;
      }
      
      const tasksTooCopy = this.selectedDayTasks.map(task => ({
        ...task,
        id: Date.now() + Math.random(),
        date: targetDate.toDateString(),
        completed: false
      }));
      
      this.tasks.push(...tasksTooCopy);
      this.saveTasks();
      this.closeCopyModal();
    },
    closeModal() {
      this.showAddTaskModal = false;
      this.editingTask = null;
      this.parentTaskId = null;
      this.taskForm = { title: '', description: '', time: '', priority: '' };
    },
    closeCopyModal() {
      this.showCopyModal = false;
      this.copyTarget = 'tomorrow';
      this.customCopyDate = '';
    },
    saveTasks() {
      localStorage.setItem('dailyTasks', JSON.stringify(this.tasks));
    }
  }
}
</script>

<style scoped>
.date-navigation {
  display: flex;
  gap: 8px;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.nav-btn {
  padding: 10px 20px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-secondary);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.nav-btn:not(.active):hover {
  background: var(--background);
  color: var(--text-primary);
}

/* Task Progress Styles */
.task-progress {
  background: var(--surface);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.task-progress.morning-theme {
  background: linear-gradient(135deg, #fef3c7, #fbbf24);
  color: #92400e;
}

.task-progress.noon-theme {
  background: linear-gradient(135deg, #ecfdf5, #10b981);
  color: #065f46;
}

.task-progress.afternoon-theme {
  background: linear-gradient(135deg, #fef2f2, #f59e0b);
  color: #92400e;
}

.task-progress.evening-theme {
  background: linear-gradient(135deg, #fdf2f8, #ec4899);
  color: #be185d;
}

.task-progress.night-theme {
  background: linear-gradient(135deg, #1e293b, #475569);
  color: #f1f5f9;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-weight: 600;
  margin-bottom: 1rem;
}

.time-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  opacity: 0.9;
}

.current-time {
  font-weight: 600;
  font-family: monospace;
}

.time-period {
  font-weight: 500;
}

/* Task Actions Bar */
.task-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--surface);
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.task-filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.filter-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.task-bulk-actions {
  display: flex;
  gap: 8px;
}

.bulk-btn {
  padding: 8px 16px;
  border: 1px solid var(--success-color);
  border-radius: 6px;
  background: transparent;
  color: var(--success-color);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.bulk-btn:hover {
  background: var(--success-color);
  color: white;
}

/* Calendar enhancements */
.calendar-day.has-tasks {
  border: 2px solid var(--primary-color);
}

.task-count {
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-day {
  position: relative;
}

/* Task enhancements */
.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.task-header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-tasks {
  flex: 1;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--background);
  color: var(--text-primary);
  font-size: 0.875rem;
  min-width: 200px;
}

.task-item.overdue {
  border-left: 4px solid #dc2626;
  background: #fef2f2;
}

.overdue-badge {
  background: #dc2626;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-left: 8px;
}

.task-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 4px;
}

.task-priority {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
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

.tasks-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.copy-btn {
  padding: 8px 16px;
  border: 1px solid var(--primary-color);
  border-radius: 6px;
  background: transparent;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: var(--primary-color);
  color: white;
}

.task-group {
  margin-bottom: 1rem;
}

.parent-task {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 4px;
}

.sub-task {
  margin-left: 2rem;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 6px;
  margin-bottom: 4px;
}

.task-controls {
  display: flex;
  gap: 4px;
}

.control-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: var(--background);
}

.control-btn.delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

.copy-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 1rem 0;
}

.copy-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.copy-option input[type="radio"] {
  margin: 0;
}

.calendar-day.past {
  opacity: 0.6;
}

.calendar-day.future {
  border-style: dashed;
}

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

@media (max-width: 768px) {
  .task-actions-bar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .task-header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .search-input {
    min-width: 100%;
  }
  
  .progress-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .time-indicator {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>