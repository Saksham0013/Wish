import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import "./App.css";

function App() {
  const [step, setStep] = useState("letter"); // letter → countdown → birthday → messages → gallery → final
  const [countdown, setCountdown] = useState(10);
  const [candlesOn, setCandlesOn] = useState(true);
  const [flamesVisible, setFlamesVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [micStarted, setMicStarted] = useState(false);
  const [allSeen, setAllSeen] = useState(false);

  const images = [
    "/images/First.jpeg",
    "/images/Second.jpeg",
    "/images/Third.jpeg",
    "/images/Fourth.jpeg",
  ];

  // Countdown Logic
  useEffect(() => {
    if (step === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (step === "countdown" && countdown === 0) {
      setStep("birthday");
    }
  }, [step, countdown]);

  // Gallery auto-slide
  useEffect(() => {
    if (step === "gallery") {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const nextIndex = (prev + 1) % images.length;
          if (nextIndex === images.length - 1) {
            setAllSeen(true);
          }
          return nextIndex;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [step, images.length]);

  // Desktop blow detection
  useEffect(() => {
    if (step === "birthday" && candlesOn && window.innerWidth > 768) {
      let audioContext;
      let analyser;
      let microphone;
      let dataArray;
      let interval;
      let consecutiveBlows = 0;
      const REQUIRED_CONSECUTIVE = 5;
      const THRESHOLD = 35;

      const startDesktopMic = async () => {
        try {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          microphone = audioContext.createMediaStreamSource(stream);
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 512;
          dataArray = new Uint8Array(analyser.frequencyBinCount);
          microphone.connect(analyser);

          interval = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

            if (average > THRESHOLD) {
              consecutiveBlows += 1;
              if (consecutiveBlows >= REQUIRED_CONSECUTIVE) {
                setFlamesVisible(false);
                setTimeout(() => setCandlesOn(false), 1000);
                clearInterval(interval);
                audioContext.close();
              }
            } else {
              consecutiveBlows = 0;
            }
          }, 100);
        } catch (err) {
          console.error("Mic error:", err);
        }
      };

      startDesktopMic();

      return () => {
        if (interval) clearInterval(interval);
        if (audioContext && audioContext.state !== "closed") audioContext.close();
      };
    }
  }, [step, candlesOn]);

  // Countdown format
  const formatCountdown = () => {
    const hrs = Math.floor(countdown / 3600);
    const mins = Math.floor((countdown % 3600) / 60);
    const secs = countdown % 60;
    return { hrs, mins, secs };
  };
  const { hrs, mins, secs } = formatCountdown();

  // Mobile Blow Detection
  const startBlowDetectionMobile = async () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const microphone = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      microphone.connect(analyser);

      let consecutiveBlows = 0;
      const REQUIRED_CONSECUTIVE = 5;
      const THRESHOLD = 20; // lower for mobile

      const interval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

        if (average > THRESHOLD) {
          consecutiveBlows += 1;
          if (consecutiveBlows >= REQUIRED_CONSECUTIVE) {
            setFlamesVisible(false);
            setTimeout(() => setCandlesOn(false), 1000);
            clearInterval(interval);
            audioContext.close();
          }
        } else {
          consecutiveBlows = 0;
        }
      }, 100);

      setMicStarted(true);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  return (
    <div className="app-container">
      {/* Letter */}
      {step === "letter" && (
        <motion.div
          className="letter-card"
          onClick={() => setStep("countdown")}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          💌 Tap to Open My Special Letter 💌
        </motion.div>
      )}

      {/* Countdown */}
      {step === "countdown" && (
        <div className="countdown-container">
          <h2 className="section-title">⏳ Countdown Begins!</h2>
          <div className="countdown-cards">
            <div className="time-card">{hrs}h</div>
            <div className="time-card">{mins}m</div>
            <div className="time-card">{secs}s</div>
          </div>
        </div>
      )}

      {/* Birthday */}
      {step === "birthday" && (
        <div className="birthday-container">
          <Confetti />
          <h1 className="birthday-title">🎉 Happy Birthday My Love 🎉</h1>
          <p className="birthday-sub">
            Blow into the microphone to put out the candles 🎤🎂
          </p>

          <div className="cake-container">
            <div className="cake">
              <div className="candles">
                {candlesOn &&
                  [1, 2, 3].map((i) => (
                    <motion.div
                      className="candle"
                      key={i}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: flamesVisible ? 1 : 0 }}
                      transition={{ duration: 1 }}
                    >
                      <div className="flame flicker"></div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>

          {/* Mobile blow button */}
          {candlesOn && !micStarted && window.innerWidth <= 768 && (
            <button className="btn blue" onClick={startBlowDetectionMobile}>
              🎤 Start Blowing
            </button>
          )}

          {/* Next Surprise */}
          {!candlesOn && (
            <button className="btn green" onClick={() => setStep("messages")}>
              💖 Next Surprise
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      {step === "messages" && (
        <div className="messages-container">
          <h2 className="section-title">💌 My Special Messages 💌</h2>
          <div className="messages">
            <p>✨ You make my world brighter every single day.</p>
            <p>💖 Thank you for being my everything.</p>
            <p>🌸 Wishing you endless love, laughter & joy.</p>
          </div>
          <button className="btn purple" onClick={() => setStep("gallery")}>
            📸 See Our Memories
          </button>
        </div>
      )}

      {/* Gallery */}
      {step === "gallery" && (
        <div className="gallery-container">
          <h2 className="section-title">💖 Our Memories 💖</h2>
          <div className="gallery-image">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                alt={`Memory ${currentIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              />
            </AnimatePresence>
          </div>

          {!allSeen ? (
            <p className="hint-text">✨ Wait, 4 memories will appear ✨</p>
          ) : (
            <button className="btn green" onClick={() => setStep("final")}>
              🌟 Final Surprise
            </button>
          )}
        </div>
      )}

      {/* Final Note */}
      {step === "final" && (
        <div className="final-note">
          <h2 className="final-title">💍 Forever & Always 💍</h2>
          <p className="final-text">
            No matter where life takes us, my heart will always belong to you.
            You are my sunshine, my love, and my forever. 💖
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
