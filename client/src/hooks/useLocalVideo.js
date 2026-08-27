import { useState, useRef, useEffect, useCallback } from 'react';
import { DEMO_VIDEOS } from '../utils/demoVideos';
import { generateFileFingerprint, compareFileWithRoom } from '../utils/fileFingerprint';

export function useLocalVideo({ onReportState, roomPlayback }) {
  const videoRef = useRef(null);
  const [localMovie, setLocalMovie] = useState({
    title: 'Interstellar',
    year: '2014',
    duration: 10144, // 2h 49m
    metadata: '2014 · 2h 49m · 1080p',
    filename: 'Interstellar.2014.1080p.mp4',
    size: 2450000000,
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    videoUrl: DEMO_VIDEOS[0].videoUrl,
    isLocalFile: false,
    fileObject: null,
  });

  const [currentTime, setCurrentTime] = useState(5057); // 1:24:17
  const [duration, setDuration] = useState(10144);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [movieMatchStatus, setMovieMatchStatus] = useState({ matches: true, reason: 'Ready' });

  const scheduledPlayTimerRef = useRef(null);
  const driftCorrectionIntervalRef = useRef(null);

  // File Picker Handler
  const handleSelectFile = useCallback(async (file) => {
    if (!file) return;

    // Zero-upload: Create local blob object URL
    const objectUrl = URL.createObjectURL(file);
    const fingerprint = await generateFileFingerprint(file);

    const movieData = {
      title: file.name.replace(/\.[^/.]+$/, "").replace(/[._-]/g, ' '),
      year: new Date().getFullYear().toString(),
      duration: 0,
      metadata: `Local File · ${Math.round(file.size / (1024 * 1024))} MB`,
      filename: file.name,
      size: file.size,
      posterUrl: '',
      videoUrl: objectUrl,
      isLocalFile: true,
      fileObject: file,
      fingerprint: fingerprint?.fingerprint,
    };

    setLocalMovie(movieData);

    if (videoRef.current) {
      videoRef.current.src = objectUrl;
      videoRef.current.load();
    }

    return movieData;
  }, []);

  // Load a demo video directly
  const handleSelectDemoVideo = useCallback((demoId) => {
    const demo = DEMO_VIDEOS.find(d => d.id === demoId) || DEMO_VIDEOS[0];
    const movieData = {
      ...demo,
      isLocalFile: false,
      fileObject: null,
    };
    setLocalMovie(movieData);

    if (videoRef.current) {
      videoRef.current.src = demo.videoUrl;
      videoRef.current.load();
    }

    return movieData;
  }, []);

  // Unlock browser autoplay
  const unlockAutoplay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => {
          setAutoplayBlocked(false);
          if (!isPlaying) {
            videoRef.current.pause();
          }
        })
        .catch(err => console.warn('User interaction required for autoplay:', err));
    }
  }, [isPlaying]);

  // Video Event Handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const vidDuration = videoRef.current.duration;
      if (vidDuration && !isNaN(vidDuration)) {
        setDuration(vidDuration);
        setLocalMovie(prev => ({
          ...prev,
          duration: vidDuration,
          metadata: `${prev.year || '2024'} · ${Math.floor(vidDuration / 3600)}h ${Math.floor((vidDuration % 3600) / 60)}m · ${videoRef.current.videoHeight || 1080}p`,
        }));
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // High Precision PLAY_AT handler
  const handlePlayAt = useCallback((data, clockOffset) => {
    if (scheduledPlayTimerRef.current) {
      clearTimeout(scheduledPlayTimerRef.current);
    }

    if (!videoRef.current) return;

    // Set position
    if (Math.abs(videoRef.current.currentTime - data.position) > 0.05) {
      videoRef.current.currentTime = data.position;
    }

    const nowWithOffset = Date.now() + clockOffset;
    const delayMs = Math.max(0, data.startTime - nowWithOffset);

    if (delayMs > 0) {
      scheduledPlayTimerRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play()
            .then(() => {
              setIsPlaying(true);
              setAutoplayBlocked(false);
            })
            .catch(err => {
              console.warn('Autoplay prevented:', err);
              setAutoplayBlocked(true);
            });
        }
      }, delayMs);
    } else {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(err => {
          console.warn('Autoplay prevented:', err);
          setAutoplayBlocked(true);
        });
    }
  }, []);

  // PAUSE handler
  const handlePause = useCallback((data) => {
    if (scheduledPlayTimerRef.current) {
      clearTimeout(scheduledPlayTimerRef.current);
    }

    if (videoRef.current) {
      videoRef.current.pause();
      if (data && data.position !== undefined) {
        videoRef.current.currentTime = data.position;
      }
      setIsPlaying(false);
    }
  }, []);

  // SEEK handler
  const handleSeek = useCallback((data, clockOffset) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = data.position;
    setCurrentTime(data.position);

    if (data.isPlaying) {
      handlePlayAt(data, clockOffset);
    }
  }, [handlePlayAt]);

  // Hard SYNC NOW handler
  const handleSyncNow = useCallback((data, clockOffset) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = data.position;
    setCurrentTime(data.position);

    if (data.isPlaying) {
      videoRef.current.play().catch(() => setAutoplayBlocked(true));
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Continuous Drift Correction Loop (every 2.5s)
  useEffect(() => {
    driftCorrectionIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !roomPlayback || !onReportState) return;

      const vid = videoRef.current;
      const currentPos = vid.currentTime;
      const isVidPlaying = !vid.paused;

      // Report state back to server for global sync offset calculation
      onReportState(
        currentPos,
        isVidPlaying,
        isVidPlaying ? 'Playing' : 'Paused',
        movieMatchStatus.matches
      );

      // Perform local drift correction against authoritative room state
      if (roomPlayback.isPlaying && isVidPlaying) {
        const now = Date.now();
        const baseTime = roomPlayback.scheduledStartTime || roomPlayback.lastSyncServerTime;
        const elapsedSec = Math.max(0, (now - baseTime) / 1000) * (roomPlayback.playbackRate || 1.0);
        const expectedPos = roomPlayback.position + elapsedSec;

        const driftSec = currentPos - expectedPos;
        const absDrift = Math.abs(driftSec);

        if (absDrift < 0.03) {
          // Perfectly in sync (< 30ms)
          if (vid.playbackRate !== 1.0) vid.playbackRate = 1.0;
          setPlaybackRate(1.0);
        } else if (absDrift < 0.35) {
          // Subtle drift (30ms - 350ms): Smoothly adjust playback rate without pitch shift
          const adjustment = driftSec > 0 ? 0.985 : 1.015;
          vid.playbackRate = adjustment;
          setPlaybackRate(adjustment);
        } else {
          // Major drift (> 350ms): Soft seek to align
          vid.currentTime = expectedPos;
          vid.playbackRate = 1.0;
          setPlaybackRate(1.0);
        }
      }
    }, 2500);

    return () => clearInterval(driftCorrectionIntervalRef.current);
  }, [roomPlayback, onReportState, movieMatchStatus.matches]);

  return {
    videoRef,
    localMovie,
    currentTime,
    duration,
    isPlaying,
    isBuffering,
    volume,
    isMuted,
    playbackRate,
    autoplayBlocked,
    movieMatchStatus,
    setLocalMovie,
    setVolume,
    setIsMuted,
    handleSelectFile,
    handleSelectDemoVideo,
    unlockAutoplay,
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlayAt,
    handlePause,
    handleSeek,
    handleSyncNow,
  };
}
