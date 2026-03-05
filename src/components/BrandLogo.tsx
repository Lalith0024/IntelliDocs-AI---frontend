import { motion } from 'framer-motion';

export const BrandLogo = ({ className = "w-10 h-10" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Soft Ring */}
      <motion.circle
        cx="50" cy="50" r="45"
        stroke="url(#logo-gradient)"
        strokeWidth="0.5"
        strokeOpacity="0.3"
        strokeDasharray="4 8"
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      {/* Middle Stable Ring */}
      <circle
        cx="50" cy="50" r="32"
        stroke="url(#logo-gradient)"
        strokeWidth="1.5"
        strokeOpacity="0.1"
      />

      {/* Core Intelligence Prism */}
      <motion.path
        d="M50 25 L72 38 V62 L50 75 L28 62 V38 L50 25Z"
        fill="url(#logo-gradient)"
        filter="url(#soft-glow)"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />

      {/* Inner Knowledge Dot */}
      <circle
        cx="50" cy="50" r="6"
        fill="white"
        fillOpacity="0.9"
      />
    </svg>
  </div>
);
