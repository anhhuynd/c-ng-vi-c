<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div v-if="!selectedVideoId" class="text-center py-12">
      <div class="text-6xl mb-4">📊</div>
      <p class="text-gray-500 text-lg">Chọn một video để xem biểu đồ views theo thời gian</p>
    </div>
    
    <div v-else-if="selectedVideo">
      <div class="mb-6">
        <h3 class="text-xl font-semibold mb-2">{{ selectedVideo.title }}</h3>
        <p class="text-gray-600">{{ getChannelName(selectedVideo.channelId) }}</p>
      </div>
      
      <div class="mb-4">
        <canvas ref="chartCanvas" class="w-full" style="max-height: 400px;"></canvas>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div class="bg-blue-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ formatViews(selectedVideo.views) }}</div>
          <div class="text-sm text-gray-600">Tổng Views</div>
        </div>
        
        <div class="bg-green-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-green-600">
            {{ selectedVideo.viewGrowth > 0 ? '+' : '' }}{{ selectedVideo.viewGrowth }}%
          </div>
          <div class="text-sm text-gray-600">Tăng Trưởng</div>
        </div>
        
        <div class="bg-purple-50 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-purple-600">{{ viewHistoryDays }}</div>
          <div class="text-sm text-gray-600">Ngày Theo Dõi</div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-12">
      <div class="text-6xl mb-4">❌</div>
      <p class="text-gray-500">Không tìm thấy video được chọn</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'YouTubeChart',
  props: {
    videos: {
      type: Array,
      required: true
    },
    selectedVideoId: {
      type: [String, Number],
      default: null
    },
    channels: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      chart: null
    }
  },
  
  computed: {
    selectedVideo() {
      if (!this.selectedVideoId) return null;
      return this.videos.find(video => video.id.toString() === this.selectedVideoId.toString());
    },
    
    viewHistoryDays() {
      if (!this.selectedVideo || !this.selectedVideo.viewHistory) return 0;
      return this.selectedVideo.viewHistory.length;
    }
  },
  
  watch: {
    selectedVideoId: {
      handler() {
        this.$nextTick(() => {
          this.renderChart();
        });
      },
      immediate: true
    }
  },
  
  mounted() {
    this.loadChartJS();
  },
  
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  
  methods: {
    formatViews(views) {
      if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + 'M';
      } else if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'K';
      }
      return views.toString();
    },
    
    getChannelName(channelId) {
      const channel = this.channels.find(c => c.id === channelId);
      return channel ? channel.name : `Channel ${channelId}`;
    },
    
    async loadChartJS() {
      // Load Chart.js from CDN
      if (window.Chart) {
        this.renderChart();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
      script.onload = () => {
        this.renderChart();
      };
      document.head.appendChild(script);
    },
    
    renderChart() {
      if (!window.Chart || !this.selectedVideo || !this.$refs.chartCanvas) {
        return;
      }
      
      // Destroy existing chart
      if (this.chart) {
        this.chart.destroy();
      }
      
      const ctx = this.$refs.chartCanvas.getContext('2d');
      const viewHistory = this.selectedVideo.viewHistory || [];
      
      // Prepare data for chart
      const labels = viewHistory.map(entry => {
        const date = new Date(entry.date);
        return date.toLocaleDateString('vi-VN', { 
          month: 'short', 
          day: 'numeric' 
        });
      });
      
      const data = viewHistory.map(entry => entry.views);
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
      
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Views',
            data: data,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                title: function(context) {
                  return `Ngày: ${context[0].label}`;
                },
                label: function(context) {
                  return `Views: ${this.formatViews(context.parsed.y)}`;
                }.bind(this)
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              border: {
                display: false
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size: 12
                }
              }
            },
            y: {
              grid: {
                color: 'rgba(107, 114, 128, 0.1)'
              },
              border: {
                display: false
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size: 12
                },
                callback: function(value) {
                  return this.formatViews(value);
                }.bind(this)
              }
            }
          },
          elements: {
            point: {
              hoverBackgroundColor: 'rgb(59, 130, 246)',
              hoverBorderColor: '#ffffff'
            }
          }
        }
      });
    }
  }
}
</script>

<style scoped>
canvas {
  max-width: 100%;
  height: auto;
}

.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.bg-purple-50 {
  background-color: #faf5ff;
}

.text-blue-600 {
  color: #2563eb;
}

.text-green-600 {
  color: #16a34a;
}

.text-purple-600 {
  color: #9333ea;
}
</style>