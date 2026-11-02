import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Volume2 } from 'lucide-react';

interface CaptchaBoxProps {
  onCaptchaChange: (code: string) => void;
}

export const CaptchaBox: React.FC<CaptchaBoxProps> = ({ onCaptchaChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [isRotating, setIsRotating] = useState<boolean>(false);

  // Generate random 6-character string avoiding ambiguous chars (0, O, 1, I, l)
  const generateCaptchaText = (): string => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient with light official slate-tint
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#f1f5f9');
    bgGrad.addColorStop(0.5, '#e2e8f0');
    bgGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw random noise dots
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, 0.3)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw random interference lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 180)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 180)}, 0.45)`;
      ctx.lineWidth = Math.random() * 1.5 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
      );
      ctx.stroke();
    }

    // Render characters with distortion, skew and distinct government security colors
    const colors = ['#0f172a', '#1e3a8a', '#991b1b', '#065f46', '#581c87', '#9a3412'];
    const charSpacing = width / (text.length + 1);

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      ctx.save();
      const x = (i + 1) * charSpacing;
      const y = height / 2 + Math.random() * 6 - 3;

      ctx.translate(x, y);
      const angle = (Math.random() * 36 - 18) * (Math.PI / 180);
      ctx.rotate(angle);

      ctx.font = `bold ${Math.floor(Math.random() * 5 + 23)}px 'JetBrains Mono', 'Courier New', monospace`;
      ctx.fillStyle = colors[i % colors.length];
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      // Drop shadow for security watermark effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    setIsRotating(true);
    const newCode = generateCaptchaText();
    setCaptchaCode(newCode);
    drawCaptcha(newCode);
    onCaptchaChange(newCode);
    setTimeout(() => setIsRotating(false), 400);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  // Web Speech accessibility readout
  const speakCaptcha = () => {
    if ('speechSynthesis' in window && captchaCode) {
      window.speechSynthesis.cancel();
      const spelled = captchaCode.split('').join(' . ');
      const utterance = new SpeechSynthesisUtterance(`Verification code: ${spelled}`);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Canvas Display */}
      <div className="relative rounded-xl border border-slate-300 shadow-inner overflow-hidden bg-slate-100 flex-shrink-0">
        <canvas
          ref={canvasRef}
          width={180}
          height={46}
          className="block cursor-pointer select-none"
          onClick={refreshCaptcha}
          title="Click to reload CAPTCHA"
        />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={refreshCaptcha}
          className="p-2 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Reload CAPTCHA image"
        >
          <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
        </button>
        <button
          type="button"
          onClick={speakCaptcha}
          className="p-2 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Audio Accessibility Readout"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
