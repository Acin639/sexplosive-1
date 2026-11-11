import { useEffect, useRef, useState } from "react";

type Facing = "user" | "environment";

/** Requests the real device camera and binds the stream to a <video> ref. */
export function useCamera(enabled: boolean, facing: Facing = "user", audio = true) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const stop = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setReady(false);
    };

    if (!enabled || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      stop();
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing }, audio })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setError(null);
        setReady(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Camera unavailable");
      });

    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled, facing, audio]);

  const setMuted = (muted: boolean) => {
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !muted));
  };

  return { videoRef, error, ready, setMuted };
}
