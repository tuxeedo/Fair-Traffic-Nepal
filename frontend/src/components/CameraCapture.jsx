import { useState, useRef, useEffect } from 'react';

export default function CameraCapture({ isOpen, onClose, onCapture }) {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('photo'); // 'photo' | 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setRecordedBlob(null);
      setIsRecording(false);
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' }, audio: true })
        .then((mediaStream) => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch((err) => {
          console.error(err);
          // Fallback to video only if audio permission fails
          navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
            .then((mediaStream) => {
              setStream(mediaStream);
              if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
              }
            })
            .catch((e) => {
              console.error(e);
              setError('Could not access camera. Please ensure permissions are granted.');
            });
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `captured_image_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          handleClose();
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const startRecording = () => {
    if (stream) {
      chunksRef.current = [];
      let options = { mimeType: 'video/webm;codecs=vp9' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }
      try {
        const recorder = new MediaRecorder(stream, options);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          setRecordedBlob(blob);
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
        setError('Failed to start video recording.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAttachVideo = () => {
    if (recordedBlob) {
      const file = new File([recordedBlob], `recorded_video_${Date.now()}.webm`, { type: 'video/webm' });
      onCapture(file);
      handleClose();
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setRecordedBlob(null);
    setIsRecording(false);
    setError(null);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.95)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 16
    }}>
      <div className="glass-card animate-slide-up" style={{
        width: '100%', maxWidth: 500, padding: 24, display: 'flex',
        flexDirection: 'column', gap: 16, textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Camera Capture</h3>
          <button className="btn btn-ghost btn-sm" onClick={handleClose} style={{ fontSize: '1.2rem', padding: 0 }}>✕</button>
        </div>

        {/* Mode Switcher */}
        {!recordedBlob && !isRecording && !error && (
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 8, gap: 4 }}>
            <button
              className="btn btn-sm"
              onClick={() => setMode('photo')}
              style={{ flex: 1, background: mode === 'photo' ? 'var(--color-primary)' : 'transparent', color: mode === 'photo' ? 'white' : 'var(--text-secondary)' }}
            >
              📸 Photo Mode
            </button>
            <button
              className="btn btn-sm"
              onClick={() => setMode('video')}
              style={{ flex: 1, background: mode === 'video' ? 'var(--color-primary)' : 'transparent', color: mode === 'video' ? 'white' : 'var(--text-secondary)' }}
            >
              🎥 Video Mode
            </button>
          </div>
        )}

        {error ? (
          <div style={{ color: 'var(--color-danger)', fontSize: '0.9rem', padding: 20 }}>
            {error}
          </div>
        ) : (
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000', aspectRatio: '4/3' }}>
            {recordedBlob ? (
              <video
                src={URL.createObjectURL(recordedBlob)}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Blinking red dot indicator during recording */}
            {isRecording && (
              <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 4, fontSize: '0.75rem', color: 'white' }}>
                <span className="blink-dot" style={{ width: 8, height: 8, background: 'red', borderRadius: '50%' }} />
                Recording...
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>

          {!error && (
            <>
              {mode === 'photo' && (
                <button className="btn btn-primary" onClick={handleCapturePhoto}>
                  📸 Capture Photo
                </button>
              )}

              {mode === 'video' && (
                <>
                  {!recordedBlob && !isRecording && (
                    <button className="btn btn-primary" onClick={startRecording}>
                      🔴 Start Recording
                    </button>
                  )}
                  {isRecording && (
                    <button className="btn btn-danger" onClick={stopRecording}>
                      ⏹️ Stop Recording
                    </button>
                  )}
                  {recordedBlob && (
                    <>
                      <button className="btn btn-ghost" onClick={() => setRecordedBlob(null)}>
                        🔄 Re-record
                      </button>
                      <button className="btn btn-success" onClick={handleAttachVideo}>
                        Attach Video
                      </button>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
