<template>
  <div>
    <!-- Calendar Section -->
    <div class="calendar-section">
      <div class="date-header">
        <div class="current-date">{{ formattedDate }}</div>
        <h1 class="today-title">Today</h1>
      </div>
      
      <div class="calendar-grid">
        <div 
          v-for="day in weekDays" 
          :key="day.date"
          class="calendar-day"
          :class="{ active: day.isToday }"
          @click="selectDay(day)"
        >
          <div class="day-name">{{ day.name }}</div>
          <div class="day-number">{{ day.number }}</div>
        </div>
      </div>
    </div>

    <!-- Tasks Section -->
    <div class="tasks-section">
      <div v-if="selectedDayTasks.length === 0" class="no-tasks">
        <p style="text-align: center; color: var(--text-secondary); padding: 2rem;">
          Chưa có công việc nào cho ngày này
        </p>
      </div>
      
      <div v-else>
        <div 
          v-for="task in selectedDayTasks" 
          :key="task.id"
          class="task-item"
        >
          <div 
            class="task-checkbox"
            :class="{ completed: task.completed }"
            @click="toggleTask(task.id)"
          ></div>
          
          <div class="task-content">
            <div 
              class="task-title"
              :class="{ completed: task.completed }"
            >
              {{ task.title }}
            </div>
            <div class="task-description">{{ task.description }}</div>
          </div>
          
          <div class="task-time">{{ task.time }}</div>
        </div>
      </div>
    </div>

    <!-- Add Task FAB -->
    <button class="fab" @click="showAddTaskModal = true">+</button>

    <!-- Add Task Modal (Simple) -->
    <div v-if="showAddTaskModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h3>Thêm Công Việc Mới</h3>
        <input 
          v-model="newTask.title" 
          placeholder="Tên công việc"
          class="modal-input"
        >
        <input 
          v-model="newTask.description" 
          placeholder="Mô tả"
          class="modal-input"
        >
        <input 
          v-model="newTask.time" 
          placeholder="Thời gian (VD: 7:00 AM)"
          class="modal-input"
        >
        <div class="modal-actions">
          <button @click="closeModal" class="modal-btn cancel">Hủy</button>
          <button @click="addTask" class="modal-btn primary">Thêm</button>
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
      selectedDate: new Date(),
      showAddTaskModal: false,
      newTask: {
        title: '',
        description: '',
        time: ''
      },
      tasks: [
        {
          id: 1,
          title: 'Wakeup',
          description: 'Early wakeup from bed and fresh',
          time: '7:00 AM',
          date: new Date().toDateString(),
          completed: true
        },
        {
          id: 2,
          title: 'demo',
          description: '2/2 hoàn thành',
          time: '8:00 AM',
          date: new Date().toDateString(),
          completed: false
        },
        {
          id: 3,
          title: 'hehe',
          description: 'hehe',
          time: '9:00 AM',
          date: new Date().toDateString(),
          completed: true
        },
        {
          id: 4,
          title: 'aaaa',
          description: '',
          time: '10:00 AM',
          date: new Date().toDateString(),
          completed: true
        },
        {
          id: 5,
          title: 'hahaha',
          description: 'aaaa',
          time: '7:30 AM',
          date: new Date().toDateString(),
          completed: false
        }
      ]
    }
  },
  computed: {
    formattedDate() {
      return this.selectedDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    },
    weekDays() {
      const today = new Date();
      const startOfWeek = new Date(today);
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
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
          fullDate: date
        });
      }
      
      return days;
    },
    selectedDayTasks() {
      return this.tasks.filter(task => task.date === this.selectedDate.toDateString());
    }
  },
  mounted() {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('dailyTasks');
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    }
  },
  methods: {
    selectDay(day) {
      this.selectedDate = day.fullDate;
    },
    toggleTask(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        this.saveTasks();
      }
    },
    addTask() {
      if (!this.newTask.title.trim()) return;
      
      const task = {
        id: Date.now(),
        title: this.newTask.title,
        description: this.newTask.description,
        time: this.newTask.time || '9:00 AM',
        date: this.selectedDate.toDateString(),
        completed: false
      };
      
      this.tasks.push(task);
      this.saveTasks();
      this.closeModal();
    },
    closeModal() {
      this.showAddTaskModal = false;
      this.newTask = { title: '', description: '', time: '' };
    },
    saveTasks() {
      localStorage.setItem('dailyTasks', JSON.stringify(this.tasks));
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