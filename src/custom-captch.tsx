import React, { useState, useEffect, useRef } from 'react';

// Define the possible watermark shapes
type WatermarkShape = 'triangle' | 'square' | 'circle';

// Define the possible watermark colors
type WatermarkColor = 'red' | 'green' | 'blue';

// Define the CAPTCHA state
interface CaptchaState {
  videoStream: MediaStream | null;
  squarePosition: { x: number; y: number };
  capturedImage: string | null;
  watermarkShape: WatermarkShape;
  watermarkColor: WatermarkColor;
  selectedSectors: number[];
  isValidated: boolean;
  errorCount: number;
}

const CustomCaptcha: React.FC = () => {
  const [captchaState, setCaptchaState] = useState<CaptchaState>({
    videoStream: null,
    squarePosition: { x: 0, y: 0 },
    capturedImage: null,
    watermarkShape: 'triangle',
    watermarkColor: 'red',
    selectedSectors: [],
    isValidated: false,
    errorCount: 0,
  });
  console.log("🚀 ~ captchaState:", captchaState)


  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Request camera access and start video stream
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        console.log("🚀 ~ .then ~ stream:", stream)
        setCaptchaState((prevState) => ({
          ...prevState,
          videoStream: stream,
        }));
            // Set the srcObject of the video element to the stream
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
      });

    // Clean up video stream on component unmount
    return () => {
      if (captchaState.videoStream) {
        captchaState.videoStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    // Update square position every second
    const intervalRef = setInterval(() => {
      // const x = Math.floor(Math.random() * 100);
      // const y = Math.floor(Math.random() * 100);
      // const squareSize = 50; // Size of the square in pixels
      // const videoWidth = videoRef.current?.videoWidth || 640; // Default width if video not loaded
      // const videoHeight = videoRef.current?.videoHeight || 480; // Default height if video not loaded

      //       // Ensure the square stays within the video boundaries
      //       const maxX = videoWidth - squareSize;
      //       const maxY = videoHeight - squareSize;
      
      //       const x = Math.floor(Math.random() * maxX);
            // const y = Math.floor(Math.random() * maxY);

      const x = Math.floor(Math.random() * 100);
      console.log("🚀 ~ intervalRef ~ x:", x)
      const y = Math.floor(Math.random() *100);
      console.log("🚀 ~ intervalRef ~ y:", y)

      setCaptchaState((prevState) => ({
        ...prevState,
        squarePosition: { x, y},
      }));
    }, 1000);

    return () => clearInterval(intervalRef);
  }, []);

  const handleContinue = () => {
    // Capture current video frame and lock square position
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw the square on the canvas
        context.strokeStyle = 'red';
        context.lineWidth = 2;
        const squareSize = 50; // Size of the square
        const { x, y } = captchaState.squarePosition;
        context.strokeRect(
          (x / 100) * canvas.width,
          (y / 100) * canvas.height,
          squareSize,
          squareSize
        );

        const capturedImage = canvas.toDataURL();
        setCaptchaState((prevState) => ({
          ...prevState,
          capturedImage,
        }));
      }

       // Clear the interval to stop updating the square position
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    }
  };

  const handleValidate = () => {
    // Validate user's selection and update CAPTCHA state
    // ...
  };
  console.log("🚀 ~ videoRef:", videoRef)
  console.log("🚀 ~ canvasRef:", canvasRef)


  return (
    <div>
      <h1>Custom CAPTCHA</h1>
      {captchaState.videoStream && (
        <div style={{position:"relative"}}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '1000px', height: 'auto', border: '1px solid black' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none',width:"1000px",height:"auto" }} />
          <div
            style={{
              position: 'absolute',
              top: `${(captchaState.squarePosition.y / (videoRef.current?.videoHeight || 480)) * 100}%`,
              left: `${(captchaState.squarePosition.x / (videoRef.current?.videoWidth || 640)) * 100}%`,
             
              width: '20%',
              height: '20%',
              border: '2px solid red',
            }}
          />
        </div>
      )}
      <div>
        <button onClick={handleContinue}>Continue</button>
        <button onClick={handleValidate}>Validate</button>
      </div>
      {captchaState.capturedImage && (
        <img src={captchaState.capturedImage} alt="Captured" />
      )}
    </div>
  );
};

export default CustomCaptcha;