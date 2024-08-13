// src/canvas-confetti.d.ts
declare module 'canvas-confetti' {
    interface ConfettiOptions {
      particleCount?: number;
      spread?: number;
      origin?: { x: number; y: number };
      // Add more options if needed
    }
  
    function confetti(options?: ConfettiOptions): void;
  
    export default confetti;
  }
  