/**
 * VANII Deterministic Direct Media Playback Engine
 * Dynamic Song Resolution for ANY song in the world without hardcoded locks.
 * Supports dynamic rotation for "koi dusra gana" / "change song".
 */

export class DirectStreamingEngine {
  constructor() {
    this.currentTrack = {
      title: 'Trending Hindi Songs',
      artist: 'Popular Artist',
      videoId: '',
      streamUrl: '',
      isPlaying: false,
    };

    this.popularRotation = [
      { title: 'Chaleya (From "Jawan")', artist: 'Arijit Singh / Shilpa Rao', query: 'Chaleya Jawan song' },
      { title: 'Apna Bana Le (From "Bhediya")', artist: 'Arijit Singh / Sachin-Jigar', query: 'Apna Bana Le Bhediya' },
      { title: 'O Maahi (From "Dunki")', artist: 'Arijit Singh', query: 'O Maahi Dunki Arijit Singh' },
      { title: 'Satranga (From "Animal")', artist: 'Arijit Singh / Shreyas Puranik', query: 'Satranga Animal Arijit Singh' },
      { title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal / Asees Kaur', query: 'Raataan Lambiyan Shershaah' },
      { title: 'Tum Hi Ho', artist: 'Arijit Singh', query: 'Tum Hi Ho Aashiqui 2' },
      { title: 'Heeriye', artist: 'Jasleen Royal / Arijit Singh', query: 'Heeriye Jasleen Royal Arijit Singh' },
      { title: 'Pasoori Nu', artist: 'Arijit Singh / Tulsi Kumar', query: 'Pasoori Nu Satyaprem Ki Katha' },
    ];
    this.rotationIndex = 0;

    this.onTrackChangeCallback = null;
  }

  onTrackChange(cb) {
    this.onTrackChangeCallback = cb;
  }

  _notify() {
    if (this.onTrackChangeCallback) {
      this.onTrackChangeCallback({ ...this.currentTrack });
    }
  }

  getNextRotatedSong() {
    this.rotationIndex = (this.rotationIndex + 1) % this.popularRotation.length;
    return this.popularRotation[this.rotationIndex];
  }

  resolveDirectStream(query) {
    const qClean = (query || '').trim();
    const qLower = qClean.toLowerCase();

    // 1. If user requested "koi dusra gana" / "change song" / "koi aur gana"
    if (
      qLower.includes('dusra') ||
      qLower.includes('दूसरा') ||
      qLower.includes('change') ||
      qLower.includes('aur gana') ||
      qLower.includes('next') ||
      qLower.includes('badlo') ||
      qLower.includes('agla')
    ) {
      const nextSong = this.getNextRotatedSong();
      const directUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(nextSong.query)}&sp=EgIQAQ%253D%253D`;

      this.currentTrack = {
        title: nextSong.title,
        artist: nextSong.artist,
        query: nextSong.query,
        videoId: '',
        streamUrl: directUrl,
        isPlaying: true,
      };

      if (typeof window !== 'undefined') {
        try {
          window.open(directUrl, 'VANII_YOUTUBE_PLAYER');
        } catch (e) {}
      }

      this._notify();
      return {
        success: true,
        title: nextSong.title,
        artist: nextSong.artist,
        query: nextSong.query,
        url: directUrl,
      };
    }

    // 2. Resolve for ANY specific song or artist requested by the user
    let songTitle = qClean;
    let artistName = 'Artist';

    if (qLower.includes('arijit') || qLower.includes('अरिजीत')) {
      artistName = 'Arijit Singh';
    } else if (qLower.includes('jubin') || qLower.includes('जुबिन')) {
      artistName = 'Jubin Nautiyal';
    } else if (qLower.includes('sidhu') || qLower.includes('सिद्धू')) {
      artistName = 'Sidhu Moosewala';
    } else if (qLower.includes('diljit') || qLower.includes('दिलजीत')) {
      artistName = 'Diljit Dosanjh';
    } else if (qLower.includes('shreya') || qLower.includes('श्रेया')) {
      artistName = 'Shreya Ghoshal';
    } else if (qLower.includes('sonu') || qLower.includes('सोनू')) {
      artistName = 'Sonu Nigam';
    }

    if (!songTitle || songTitle === 'song' || songTitle === 'gana') {
      const nextSong = this.getNextRotatedSong();
      songTitle = nextSong.title;
      artistName = nextSong.artist;
    }

    const searchQuery = `${songTitle} ${artistName !== 'Artist' ? artistName : ''} official song`.trim();
    const directUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}&sp=EgIQAQ%253D%253D`;

    this.currentTrack = {
      title: songTitle,
      artist: artistName,
      query: searchQuery,
      videoId: '',
      streamUrl: directUrl,
      isPlaying: true,
    };

    if (typeof window !== 'undefined') {
      try {
        window.open(directUrl, 'VANII_YOUTUBE_PLAYER');
      } catch (e) {}
    }

    this._notify();

    return {
      success: true,
      title: songTitle,
      artist: artistName,
      query: searchQuery,
      url: directUrl,
    };
  }

  pauseStream() {
    this.currentTrack.isPlaying = false;
    this._notify();
    return { success: true, status: 'paused' };
  }

  resumeStream() {
    this.currentTrack.isPlaying = true;
    if (this.currentTrack.query && typeof window !== 'undefined') {
      const directUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(this.currentTrack.query)}&sp=EgIQAQ%253D%253D`;
      try {
        window.open(directUrl, 'VANII_YOUTUBE_PLAYER');
      } catch (e) {}
    }
    this._notify();
    return { success: true, status: 'playing' };
  }

  getCurrentState() {
    return { ...this.currentTrack };
  }
}

export const directStreamingInstance = new DirectStreamingEngine();
