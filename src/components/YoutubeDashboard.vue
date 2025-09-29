<template>
  <div class="bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="min-h-screen p-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1
              class="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent"
            >
              📺 YouTube Dashboard
            </h1>
            <p class="text-gray-600 mt-2">
              Quản lý kênh YouTube với cập nhật views thực tế
            </p>
          </div>
          <div class="flex gap-3">
            <button
              @click="showApiKeyModal = true"
              class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              🔑 API Key
            </button>
            <button
              @click="updateAllViews"
              :disabled="isUpdating"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {{ isUpdating ? "🔄 Đang cập nhật..." : "🔄 Cập nhật tất cả" }}
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div
          v-if="activeTab === 'videos' || activeTab === 'pending'"
          class="mb-6"
        >
          <div class="flex gap-4">
            <input
              v-model="searchQuery"
              placeholder="🔍 Tìm kiếm video..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              v-model="filterChannel"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-48"
            >
              <option value="">Tất cả kênh</option>
              <option
                v-for="channel in channels"
                :key="channel.id"
                :value="channel.id.toString()"
              >
                {{ channel.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex bg-white rounded-lg p-1 mb-6 shadow-sm">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 px-4 py-2 rounded-md transition-colors font-medium',
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Channels Tab -->
        <div v-if="activeTab === 'channels'">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold">Quản Lý Kênh</h2>
            <button
              @click="showAddChannelModal = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Thêm Kênh
            </button>
          </div>

          <div
            v-if="channels.length === 0"
            class="bg-white rounded-lg shadow-sm p-12 text-center"
          >
            <p class="text-gray-500">
              Chưa có kênh YouTube nào. Hãy thêm kênh đầu tiên!
            </p>
          </div>

          <div
            v-else
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div
              v-for="channel in channels"
              :key="channel.id"
              class="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div
                class="h-32 relative"
                :style="{ background: channel.gradient }"
              >
                <button
                  @click="deleteChannel(channel.id)"
                  class="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-80 hover:opacity-100"
                >
                  🗑️
                </button>
                <div class="absolute top-2 left-2 text-white text-2xl">📺</div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-lg mb-2">{{ channel.name }}</h3>
                <p class="text-gray-600 mb-3">
                  {{ channel.subscribers }} subscribers
                </p>
                <div class="flex justify-between text-sm text-gray-500">
                  <span>{{ getChannelVideoCount(channel.id) }} videos</span>
                  <span>{{ getChannelTotalViews(channel.id) }} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Videos Tab -->
        <div v-if="activeTab === 'videos'">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold">Quản Lý Video</h2>
            <button
              @click="showAddVideoModal = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Thêm Video
            </button>
          </div>

          <div
            v-if="filteredVideos.length === 0"
            class="bg-white rounded-lg shadow-sm p-12 text-center"
          >
            <p class="text-gray-500">
              {{
                searchQuery
                  ? "Không tìm thấy video nào."
                  : "Chưa có video nào. Hãy thêm video đầu tiên!"
              }}
            </p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="video in filteredVideos"
              :key="video.id"
              class="bg-white rounded-lg shadow-sm p-4"
            >
              <div class="flex gap-4">
                <div
                  class="w-32 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative"
                >
                  <img
                    v-if="video.thumbnail"
                    :src="video.thumbnail"
                    :alt="video.title"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center text-2xl"
                  >
                    🎥
                  </div>
                  <div
                    class="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded"
                  >
                    {{ video.duration }}
                  </div>
                </div>

                <div class="flex-1">
                  <h4 class="font-semibold text-lg mb-1">
                    {{ video.title }}
                  </h4>
                  <p class="text-gray-600 mb-2">
                    {{ getChannelName(video.channelId) }}
                  </p>
                  <div class="flex items-center gap-4 mb-2">
                    <span class="text-gray-600"
                      >{{ formatViews(video.views) }} views</span
                    >
                    <span
                      v-if="video.viewGrowth !== 0"
                      :class="[
                        'px-2 py-1 rounded text-xs font-medium',
                        video.viewGrowth > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800',
                      ]"
                    >
                      {{ video.viewGrowth > 0 ? "+" : ""
                      }}{{ video.viewGrowth }}%
                    </span>
                  </div>
                  <a
                    :href="video.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:underline text-sm"
                  >
                    {{ video.link }}
                  </a>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ formatDate(video.createdAt) }}
                  </p>
                </div>

                <div class="flex flex-col gap-2">
                  <button
                    @click="updateVideoViews(video)"
                    :disabled="isUpdating"
                    class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                    title="Cập nhật views"
                  >
                    🔄
                  </button>
                  <button
                    @click="setSelectedChartVideo(video.id)"
                    class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    title="Xem biểu đồ"
                  >
                    📈
                  </button>
                  <button
                    @click="deleteVideo(video.id)"
                    class="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                    title="Xóa video"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Videos Tab -->
        <div v-if="activeTab === 'pending'">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold">Video Chờ Xuất Bản</h2>
            <button
              @click="showAddPendingVideoModal = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Thêm Ý Tưởng
            </button>
          </div>

          <div
            v-if="filteredPendingVideos.length === 0"
            class="bg-white rounded-lg shadow-sm p-12 text-center"
          >
            <p class="text-gray-500">
              {{
                searchQuery
                  ? "Không tìm thấy ý tưởng video nào."
                  : "Chưa có ý tưởng video nào. Hãy thêm ý tưởng đầu tiên!"
              }}
            </p>
          </div>

          <div
            v-else
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div
              v-for="pendingVideo in filteredPendingVideos"
              :key="pendingVideo.id"
              class="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300"
            >
              <div
                class="h-32 bg-gradient-to-r from-yellow-400 to-orange-500 relative"
              >
                <div class="absolute top-2 left-2 text-white text-2xl">💡</div>
                <button
                  @click="deletePendingVideo(pendingVideo.id)"
                  class="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  🗑️
                </button>
              </div>
              <div class="p-4">
                <h4 class="font-semibold mb-2">{{ pendingVideo.title }}</h4>
                <p class="text-gray-600 mb-2">
                  {{ getChannelName(pendingVideo.channelId) }}
                </p>
                <span
                  :class="[
                    'inline-block px-2 py-1 rounded text-xs font-medium mb-2',
                    getStatusClass(pendingVideo.status),
                  ]"
                >
                  {{ getStatusText(pendingVideo.status) }}
                </span>
                <p
                  v-if="pendingVideo.expectedViews > 0"
                  class="text-sm text-gray-500"
                >
                  Dự kiến: {{ formatViews(pendingVideo.expectedViews) }} views
                </p>
                <p class="text-xs text-gray-500 mt-2">
                  {{ formatDate(pendingVideo.createdAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Tab -->
        <div v-if="activeTab === 'analytics'">
          <div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Chi Tiết Video</h2>
          </div>

          <!-- Video Statistics Table -->
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <!-- Table Header -->
            <div class="bg-gray-50 px-6 py-4">
              <div class="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700">
                <div class="col-span-5">Video</div>
                <div class="col-span-2 text-center">Lượt Xem</div>
                <div class="col-span-2 text-center">Tăng Trưởng</div>
                <div class="col-span-3 text-center">Hành Động</div>
              </div>
            </div>

            <!-- Table Body -->
            <div class="divide-y divide-gray-200">
              <div
                v-for="video in sortedVideos"
                :key="video.id"
                class="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div class="grid grid-cols-12 gap-4 items-center">
                  <!-- Video Info -->
                  <div class="col-span-5 flex items-center gap-4">
                    <div class="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        v-if="video.thumbnail"
                        :src="video.thumbnail"
                        :alt="video.title"
                        class="w-full h-full object-cover"
                      />
                      <div
                        v-else
                        class="w-full h-full flex items-center justify-center text-lg"
                      >
                        🎥
                      </div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="font-semibold text-gray-900 truncate">
                        {{ video.title }}
                      </h3>
                      <p class="text-sm text-gray-500 mt-1">
                        {{ formatDate(video.createdAt) }}
                      </p>
                    </div>
                  </div>

                  <!-- View Count -->
                  <div class="col-span-2 text-center">
                    <div class="text-lg font-bold text-gray-900">
                      {{ formatViews(video.views) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      (từ {{ getPreviousViews(video) }})
                    </div>
                  </div>

                  <!-- Growth -->
                  <div class="col-span-2 text-center">
                    <div
                      v-if="video.viewGrowth !== 0"
                      :class="[
                        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                        video.viewGrowth > 0
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800',
                      ]"
                    >
                      <span v-if="video.viewGrowth > 0" class="mr-1">↗</span>
                      <span v-else class="mr-1">↘</span>
                      {{ Math.abs(video.viewGrowth) }}%
                    </div>
                    <div v-else class="text-gray-400 text-sm">-</div>
                  </div>

                  <!-- Actions -->
                  <div class="col-span-3 text-center">
                    <button
                      @click="updateVideoViews(video)"
                      :disabled="isUpdating"
                      class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <span v-if="isUpdating" class="mr-2">🔄</span>
                      <span v-else class="mr-2">🔄</span>
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="videos.length === 0"
              class="px-6 py-12 text-center text-gray-500"
            >
              <div class="text-6xl mb-4">📊</div>
              <p class="text-lg">Chưa có video nào để hiển thị thống kê</p>
              <p class="text-sm mt-2">Hãy thêm video đầu tiên từ tab "Video"</p>
            </div>
          </div>

          <!-- Summary Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div class="bg-white rounded-lg shadow-sm p-6 text-center">
              <div class="text-3xl font-bold text-blue-600 mb-2">
                {{ channels.length }}
              </div>
              <div class="text-gray-600">Kênh</div>
            </div>

            <div class="bg-white rounded-lg shadow-sm p-6 text-center">
              <div class="text-3xl font-bold text-green-600 mb-2">
                {{ videos.length }}
              </div>
              <div class="text-gray-600">Video Đã Xuất Bản</div>
            </div>

            <div class="bg-white rounded-lg shadow-sm p-6 text-center">
              <div class="text-3xl font-bold text-yellow-600 mb-2">
                {{ pendingVideos.length }}
              </div>
              <div class="text-gray-600">Video Chờ</div>
            </div>

            <div class="bg-white rounded-lg shadow-sm p-6 text-center">
              <div class="text-3xl font-bold text-purple-600 mb-2">
                {{ formatViews(totalViews) }}
              </div>
              <div class="text-gray-600">Tổng Views</div>
            </div>
          </div>
        </div>

        <!-- Charts Tab -->
        <div v-if="activeTab === 'charts'">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold">Biểu Đồ Views Theo Thời Gian</h2>
            <select
              v-model="selectedChartVideo"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-64"
            >
              <option value="">Chọn video để xem biểu đồ</option>
              <option v-for="video in videos" :key="video.id" :value="video.id">
                {{
                  video.title.length > 30
                    ? video.title.substring(0, 30) + "..."
                    : video.title
                }}
              </option>
            </select>
          </div>

          <YouTubeChart
            :videos="videos"
            :selected-video-id="selectedChartVideo"
            :channels="channels"
          />
        </div>
      </div>

      <!-- Modals -->
      <!-- API Key Modal -->
      <div
        v-if="showApiKeyModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="showApiKeyModal = false"
      >
        <div class="bg-white rounded-lg p-6 w-full max-w-md" @click.stop>
          <h3 class="text-xl font-semibold mb-4">Cấu hình YouTube API Key</h3>
          <input
            v-model="apiKey"
            type="password"
            placeholder="Nhập YouTube Data API v3 key..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          />
          <p class="text-sm text-gray-500 mb-4">
            API key được sử dụng để lấy views thực tế từ YouTube. Nếu không có
            API key, hệ thống sẽ mô phỏng dữ liệu.
          </p>
          <div class="flex justify-end gap-2">
            <button
              @click="showApiKeyModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              @click="saveApiKey"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lưu API Key
            </button>
          </div>
        </div>
      </div>

      <!-- Add Channel Modal -->
      <div
        v-if="showAddChannelModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="showAddChannelModal = false"
      >
        <div class="bg-white rounded-lg p-6 w-full max-w-md" @click.stop>
          <h3 class="text-xl font-semibold mb-4">Thêm Kênh YouTube Mới</h3>
          <input
            v-model="newChannel.name"
            placeholder="Tên kênh"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          />
          <input
            v-model="newChannel.subscribers"
            placeholder="Số subscribers (VD: 10.5K)"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          />
          <div class="flex justify-end gap-2">
            <button
              @click="closeAddChannelModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              @click="addChannel"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thêm Kênh
            </button>
          </div>
        </div>
      </div>

      <!-- Add Video Modal -->
      <div
        v-if="showAddVideoModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="showAddVideoModal = false"
      >
        <div class="bg-white rounded-lg p-6 w-full max-w-md" @click.stop>
          <h3 class="text-xl font-semibold mb-4">Thêm Video từ YouTube</h3>
          <input
            v-model="newVideo.link"
            placeholder="Link YouTube"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          />
          <select
            v-model="newVideo.channelId"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          >
            <option value="">Chọn kênh</option>
            <option
              v-for="channel in channels"
              :key="channel.id"
              :value="channel.id"
            >
              {{ channel.name }}
            </option>
          </select>
          <div class="flex justify-end gap-2">
            <button
              @click="closeAddVideoModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              @click="addVideoFromYouTube"
              :disabled="isUpdating"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {{ isUpdating ? "Đang thêm..." : "Thêm Video" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Add Pending Video Modal -->
      <div
        v-if="showAddPendingVideoModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="showAddPendingVideoModal = false"
      >
        <div class="bg-white rounded-lg p-6 w-full max-w-md" @click.stop>
          <h3 class="text-xl font-semibold mb-4">Thêm Ý Tưởng Video</h3>
          <input
            v-model="newPendingVideo.title"
            placeholder="Tiêu đề video"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          />
          <input
            v-model="newPendingVideo.expectedViews"
            type="number"
            placeholder="Dự kiến số lượt xem"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          />
          <select
            v-model="newPendingVideo.channelId"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          >
            <option value="">Chọn kênh</option>
            <option
              v-for="channel in channels"
              :key="channel.id"
              :value="channel.id"
            >
              {{ channel.name }}
            </option>
          </select>
          <select
            v-model="newPendingVideo.status"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          >
            <option value="idea">Ý tưởng</option>
            <option value="scripting">Đang viết kịch bản</option>
            <option value="filming">Đang quay</option>
            <option value="editing">Đang edit</option>
            <option value="ready">Sẵn sàng xuất bản</option>
          </select>
          <div class="flex justify-end gap-2">
            <button
              @click="closeAddPendingVideoModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              @click="addPendingVideo"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thêm Ý Tưởng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import YouTubeAPI from './YouTubeAPI.js';
import YouTubeChart from './YouTubeChart.vue';

export default {
  components: {
    YouTubeChart
  },
  
  data() {
    return {
      activeTab: "channels",
      searchQuery: "",
      filterChannel: "",
      selectedChartVideo: null,
      isUpdating: false,

      // Modals
      showApiKeyModal: false,
      showAddChannelModal: false,
      showAddVideoModal: false,
      showAddPendingVideoModal: false,

      // Form data
      apiKey: "",
      newChannel: {
        name: "",
        subscribers: "",
      },
      newVideo: {
        link: "",
        channelId: "",
      },
      newPendingVideo: {
        title: "",
        expectedViews: 0,
        channelId: "",
        status: "idea",
      },

      // Data
      channels: [
        {
          id: 1,
          name: "Tech Channel",
          subscribers: "10.5K",
          gradient: "linear-gradient(135deg, #ff6b6b, #4ecdc4)",
        },
        {
          id: 2,
          name: "Coding Tutorials",
          subscribers: "25.2K",
          gradient: "linear-gradient(135deg, #667eea, #764ba2)",
        },
      ],

      videos: [
        {
          id: 1,
          title: "Vue.js Complete Tutorial",
          link: "https://youtube.com/watch?v=dQw4w9WgXcQ",
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
          views: 18500,
          duration: "12:30",
          channelId: 1,
          viewGrowth: 5.8,
          createdAt: new Date("2024-01-15"),
          viewHistory: [
            { date: "2024-01-15", views: 17500 },
            { date: "2024-01-16", views: 18000 },
            { date: "2024-01-17", views: 18500 },
          ],
        },
        {
          id: 2,
          title: "JavaScript ES6 Features",
          link: "https://youtube.com/watch?v=oHg5SJYRHA0",
          thumbnail: "https://img.youtube.com/vi/oHg5SJYRHA0/maxresdefault.jpg",
          views: 12700,
          duration: "18:45",
          channelId: 2,
          viewGrowth: 8.9,
          createdAt: new Date("2024-01-20"),
          viewHistory: [
            { date: "2024-01-20", views: 11700 },
            { date: "2024-01-21", views: 12200 },
            { date: "2024-01-22", views: 12700 },
          ],
        },
        {
          id: 3,
          title: "CSS Grid Layout Guide",
          link: "https://youtube.com/watch?v=example3",
          thumbnail: "https://img.youtube.com/vi/example3/maxresdefault.jpg",
          views: 14900,
          duration: "15:20",
          channelId: 1,
          viewGrowth: 2.7,
          createdAt: new Date("2024-01-25"),
          viewHistory: [
            { date: "2024-01-25", views: 14500 },
            { date: "2024-01-26", views: 14700 },
            { date: "2024-01-27", views: 14900 },
          ],
        },
        {
          id: 4,
          title: "React Hooks Explained",
          link: "https://youtube.com/watch?v=example4",
          thumbnail: "https://img.youtube.com/vi/example4/maxresdefault.jpg",
          views: 24900,
          duration: "22:15",
          channelId: 2,
          viewGrowth: 0.3,
          createdAt: new Date("2024-02-01"),
          viewHistory: [
            { date: "2024-02-01", views: 24800 },
            { date: "2024-02-02", views: 24850 },
            { date: "2024-02-03", views: 24900 },
          ],
        },
        {
          id: 5,
          title: "Node.js Backend Development",
          link: "https://youtube.com/watch?v=example5",
          thumbnail: "https://img.youtube.com/vi/example5/maxresdefault.jpg",
          views: 20100,
          duration: "28:30",
          channelId: 1,
          viewGrowth: 2.2,
          createdAt: new Date("2024-02-05"),
          viewHistory: [
            { date: "2024-02-05", views: 19600 },
            { date: "2024-02-06", views: 19850 },
            { date: "2024-02-07", views: 20100 },
          ],
        },
      ],

      pendingVideos: [
        {
          id: 1,
          title: "React Hooks Deep Dive",
          thumbnail: "",
          expectedViews: 20000,
          channelId: 1,
          status: "scripting",
          createdAt: new Date("2024-01-03"),
        },
      ],
    };
  },

  computed: {
    tabs() {
      return [
        { id: "channels", label: `📺 Kênh (${this.channels.length})` },
        { id: "videos", label: `🎥 Video (${this.filteredVideos.length})` },
        {
          id: "pending",
          label: `⏳ Chờ (${this.filteredPendingVideos.length})`,
        },
        { id: "analytics", label: "📊 Thống Kê" },
        { id: "charts", label: "📈 Biểu Đồ" },
      ];
    },

    filteredVideos() {
      return this.videos.filter((video) => {
        const matchesSearch =
          !this.searchQuery ||
          video.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          this.getChannelName(video.channelId)
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());

        const matchesChannel =
          !this.filterChannel ||
          video.channelId.toString() === this.filterChannel;

        return matchesSearch && matchesChannel;
      });
    },

    filteredPendingVideos() {
      return this.pendingVideos.filter((video) => {
        const matchesSearch =
          !this.searchQuery ||
          video.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          this.getChannelName(video.channelId)
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());

        const matchesChannel =
          !this.filterChannel ||
          video.channelId.toString() === this.filterChannel;

        return matchesSearch && matchesChannel;
      });
    },

    sortedVideos() {
      return [...this.videos].sort((a, b) => b.views - a.views);
    },

    totalViews() {
      return this.videos.reduce((sum, video) => sum + video.views, 0);
    },

    topVideos() {
      return this.videos.sort((a, b) => b.views - a.views).slice(0, 5);
    },

    youtubeAPI() {
      return new YouTubeAPI(this.apiKey);
    },
  },

  mounted() {
    // Load saved data
    const savedApiKey = localStorage.getItem("youtube-api-key");
    if (savedApiKey) {
      this.apiKey = savedApiKey;
    }

    const savedChannels = localStorage.getItem("youtube-channels");
    if (savedChannels) {
      this.channels = JSON.parse(savedChannels);
    }

    const savedVideos = localStorage.getItem("youtube-videos");
    if (savedVideos) {
      this.videos = JSON.parse(savedVideos);
    }

    const savedPendingVideos = localStorage.getItem("youtube-pending-videos");
    if (savedPendingVideos) {
      this.pendingVideos = JSON.parse(savedPendingVideos);
    }
  },

  methods: {
    // Utility methods
    formatViews(views) {
      if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + "M";
      } else if (views >= 1000) {
        return (views / 1000).toFixed(1) + "K";
      }
      return views.toString();
    },

    formatDate(date) {
      if (!date) return "Không rõ";
      return new Date(date).toLocaleDateString("vi-VN");
    },

    getChannelName(channelId) {
      const channel = this.channels.find((c) => c.id === channelId);
      return channel ? channel.name : "Unknown Channel";
    },

    getChannelVideoCount(channelId) {
      return this.videos.filter((v) => v.channelId === channelId).length;
    },

    getChannelTotalViews(channelId) {
      const channelVideos = this.videos.filter(
        (v) => v.channelId === channelId
      );
      const totalViews = channelVideos.reduce(
        (sum, video) => sum + video.views,
        0
      );
      return this.formatViews(totalViews);
    },

    getPreviousViews(video) {
      if (!video.viewHistory || video.viewHistory.length < 2) {
        return this.formatViews(0);
      }
      const previousViews = video.viewHistory[video.viewHistory.length - 2].views;
      return this.formatViews(previousViews);
    },

    getStatusText(status) {
      const statusMap = {
        idea: "Ý tưởng",
        scripting: "Viết kịch bản",
        filming: "Đang quay",
        editing: "Đang edit",
        ready: "Sẵn sàng",
      };
      return statusMap[status] || status;
    },

    getStatusClass(status) {
      const classMap = {
        idea: "bg-yellow-100 text-yellow-800",
        scripting: "bg-blue-100 text-blue-800",
        filming: "bg-pink-100 text-pink-800",
        editing: "bg-green-100 text-green-800",
        ready: "bg-purple-100 text-purple-800",
      };
      return classMap[status] || "bg-gray-100 text-gray-800";
    },

    setSelectedChartVideo(videoId) {
      this.selectedChartVideo = videoId;
      this.activeTab = "charts";
    },

    // API Key management
    saveApiKey() {
      localStorage.setItem("youtube-api-key", this.apiKey);
      this.showApiKeyModal = false;
      this.showToast("API Key đã được lưu!", "success");
    },

    // Channel management
    addChannel() {
      if (!this.newChannel.name.trim()) return;

      const gradients = [
        "linear-gradient(135deg, #ff6b6b, #4ecdc4)",
        "linear-gradient(135deg, #667eea, #764ba2)",
        "linear-gradient(135deg, #f093fb, #f5576c)",
        "linear-gradient(135deg, #4facfe, #00f2fe)",
        "linear-gradient(135deg, #43e97b, #38f9d7)",
        "linear-gradient(135deg, #fa709a, #fee140)",
      ];

      const channel = {
        id: Date.now(),
        name: this.newChannel.name,
        subscribers: this.newChannel.subscribers || "0",
        gradient: gradients[Math.floor(Math.random() * gradients.length)],
      };

      this.channels.push(channel);
      this.saveChannels();
      this.closeAddChannelModal();
      this.showToast("Kênh đã được thêm!", "success");
    },

    deleteChannel(channelId) {
      if (
        confirm(
          "Bạn có chắc muốn xóa kênh này? Tất cả video của kênh cũng sẽ bị xóa."
        )
      ) {
        this.channels = this.channels.filter((c) => c.id !== channelId);
        this.videos = this.videos.filter((v) => v.channelId !== channelId);
        this.pendingVideos = this.pendingVideos.filter(
          (v) => v.channelId !== channelId
        );
        this.saveChannels();
        this.saveVideos();
        this.savePendingVideos();
        this.showToast("Kênh đã được xóa!", "success");
      }
    },

    closeAddChannelModal() {
      this.showAddChannelModal = false;
      this.newChannel = { name: "", subscribers: "" };
    },

    // Video management
    async addVideoFromYouTube() {
      if (!this.newVideo.link.trim() || !this.newVideo.channelId) {
        this.showToast("Vui lòng nhập link YouTube và chọn kênh!", "error");
        return;
      }

      this.isUpdating = true;
      try {
        const videoInfo = await this.youtubeAPI.getVideoInfo(
          this.newVideo.link
        );
        if (!videoInfo) {
          this.showToast("Không thể lấy thông tin video!", "error");
          return;
        }

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
          viewHistory: [
            {
              date: new Date().toISOString().split("T")[0],
              views: videoInfo.viewCount,
            },
          ],
        };

        this.videos.push(video);
        this.saveVideos();
        this.closeAddVideoModal();
        this.showToast("Video đã được thêm từ YouTube!", "success");
      } catch (error) {
        this.showToast(
          "Lỗi khi lấy thông tin video: " + error.message,
          "error"
        );
      } finally {
        this.isUpdating = false;
      }
    },

    async updateVideoViews(video) {
      this.isUpdating = true;
      try {
        const currentViews = await this.youtubeAPI.getCurrentViews(video.link);
        const oldViews = video.views;
        const growth =
          oldViews > 0 ? ((currentViews - oldViews) / oldViews) * 100 : 0;

        const updatedVideo = {
          ...video,
          views: currentViews,
          viewGrowth: parseFloat(growth.toFixed(1)),
          viewHistory: [
            ...video.viewHistory,
            {
              date: new Date().toISOString().split("T")[0],
              views: currentViews,
            },
          ],
        };

        const index = this.videos.findIndex((v) => v.id === video.id);
        if (index !== -1) {
          this.videos[index] = updatedVideo;
        }

        this.saveVideos();
        this.showToast(
          `Views đã được cập nhật: ${this.formatViews(currentViews)}`,
          "success"
        );
      } catch (error) {
        this.showToast("Lỗi khi cập nhật views: " + error.message, "error");
      } finally {
        this.isUpdating = false;
      }
    },

    async updateAllViews() {
      if (!confirm("Bạn có muốn cập nhật tất cả views từ YouTube?")) return;

      this.isUpdating = true;
      let successCount = 0;

      for (const video of this.videos) {
        try {
          const currentViews = await this.youtubeAPI.getCurrentViews(
            video.link
          );
          const oldViews = video.views;
          const growth =
            oldViews > 0 ? ((currentViews - oldViews) / oldViews) * 100 : 0;

          const updatedVideo = {
            ...video,
            views: currentViews,
            viewGrowth: parseFloat(growth.toFixed(1)),
            viewHistory: [
              ...video.viewHistory,
              {
                date: new Date().toISOString().split("T")[0],
                views: currentViews,
              },
            ],
          };

          const index = this.videos.findIndex((v) => v.id === video.id);
          if (index !== -1) {
            this.videos[index] = updatedVideo;
          }
          successCount++;
        } catch (error) {
          console.error(`Error updating video ${video.id}:`, error);
        }
      }

      this.saveVideos();
      this.isUpdating = false;
      this.showToast(
        `Đã cập nhật ${successCount}/${this.videos.length} video thành công!`,
        "success"
      );
    },

    deleteVideo(videoId) {
      if (confirm("Bạn có chắc muốn xóa video này?")) {
        this.videos = this.videos.filter((v) => v.id !== videoId);
        this.saveVideos();
        this.showToast("Video đã được xóa!", "success");
      }
    },

    closeAddVideoModal() {
      this.showAddVideoModal = false;
      this.newVideo = { link: "", channelId: "" };
    },

    // Pending video management
    addPendingVideo() {
      if (!this.newPendingVideo.title.trim() || !this.newPendingVideo.channelId)
        return;

      const pendingVideo = {
        id: Date.now(),
        title: this.newPendingVideo.title,
        thumbnail: this.newPendingVideo.thumbnail,
        expectedViews: parseInt(this.newPendingVideo.expectedViews) || 0,
        channelId: this.newPendingVideo.channelId,
        status: this.newPendingVideo.status,
        createdAt: new Date(),
      };

      this.pendingVideos.push(pendingVideo);
      this.savePendingVideos();
      this.closeAddPendingVideoModal();
      this.showToast("Ý tưởng video đã được thêm!", "success");
    },

    deletePendingVideo(videoId) {
      if (confirm("Bạn có chắc muốn xóa ý tưởng video này?")) {
        this.pendingVideos = this.pendingVideos.filter((v) => v.id !== videoId);
        this.savePendingVideos();
        this.showToast("Ý tưởng video đã được xóa!", "success");
      }
    },

    closeAddPendingVideoModal() {
      this.showAddPendingVideoModal = false;
      this.newPendingVideo = {
        title: "",
        expectedViews: 0,
        channelId: "",
        status: "idea",
      };
    },

    // Storage methods
    saveChannels() {
      localStorage.setItem("youtube-channels", JSON.stringify(this.channels));
    },

    saveVideos() {
      localStorage.setItem("youtube-videos", JSON.stringify(this.videos));
    },

    savePendingVideos() {
      localStorage.setItem(
        "youtube-pending-videos",
        JSON.stringify(this.pendingVideos)
      );
    },

    // Toast notification
    showToast(message, type = "info") {
      // Simple toast implementation
      const toast = document.createElement("div");
      toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 transition-all duration-300 ${
        type === "success"
          ? "bg-green-500"
          : type === "error"
          ? "bg-red-500"
          : "bg-blue-500"
      }`;
      toast.textContent = message;

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 300);
      }, 3000);
    },
  },
};
</script>

