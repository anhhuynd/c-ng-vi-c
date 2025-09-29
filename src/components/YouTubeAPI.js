// YouTube API Class
export default class YouTubeAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    }

    async getVideoInfo(videoUrl) {
        const videoId = this.extractVideoId(videoUrl);
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }

        if (!this.apiKey) {
            // Simulate API response for demo purposes
            return {
                id: videoId,
                title: 'Demo Video Title - ' + videoId,
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                viewCount: Math.floor(Math.random() * 100000) + 1000,
                duration: '10:30',
                channelTitle: 'Demo Channel'
            };
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics,contentDetails&key=${this.apiKey}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch video data');
            }

            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                throw new Error('Video not found');
            }

            const video = data.items[0];
            const duration = this.parseDuration(video.contentDetails.duration);

            return {
                id: videoId,
                title: video.snippet.title,
                thumbnail: video.snippet.thumbnails.maxresdefault?.url || video.snippet.thumbnails.high.url,
                viewCount: parseInt(video.statistics.viewCount),
                duration: duration,
                channelTitle: video.snippet.channelTitle
            };
        } catch (error) {
            console.error('YouTube API Error:', error);
            // Fallback to demo data
            return {
                id: videoId,
                title: 'Video Title (API Error) - ' + videoId,
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                viewCount: Math.floor(Math.random() * 100000) + 1000,
                duration: '10:30',
                channelTitle: 'Unknown Channel'
            };
        }
    }

    parseDuration(duration) {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return '0:00';

        const hours = parseInt(match[1]?.replace('H', '') || '0');
        const minutes = parseInt(match[2]?.replace('M', '') || '0');
        const seconds = parseInt(match[3]?.replace('S', '') || '0');

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    async getCurrentViews(videoUrl) {
        const videoInfo = await this.getVideoInfo(videoUrl);
        return videoInfo?.viewCount || 0;
    }
}