import React, { useState } from 'react';
import { HeartPulse, Bell, Activity, ArrowDown, ShieldAlert, Sparkles } from 'lucide-react';

export const ProactiveWellness = ({ onTriggerCheckIn }) => {
  const [notificationSent, setNotificationSent] = useState(false);

  // Simulated 7-day prosodic acoustic trend metrics ($F_0$ drop, tempo decline)
  const acousticTrends = [
    { day: 'Mon', f0: 210, energy: 0.18, status: 'Normal' },
    { day: 'Tue', f0: 205, energy: 0.16, status: 'Normal' },
    { day: 'Wed', f0: 195, energy: 0.14, status: 'Mild Fatigue' },
    { day: 'Thu', f0: 175, energy: 0.10, status: 'Low Energy' },
    { day: 'Fri', f0: 160, energy: 0.07, status: 'Isolation Signs' },
    { day: 'Sat', f0: 152, energy: 0.05, status: 'Depression Indicator' },
    { day: 'Sun', f0: 148, energy: 0.04, status: 'Proactive Alert' },
  ];

  const handleSimulateProactiveCheckIn = () => {
    setNotificationSent(true);
    if (onTriggerCheckIn) {
      onTriggerCheckIn(
        'Suno... maine pichhle kuch dino se aapki voice me thodi thakavat aur udaasi notice ki hai. Kya sab theek hai? Main yahan aapse baat karne ke liye hoon.'
      );
    }
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-950 border border-pink-800 flex items-center justify-center text-pink-400">
            <HeartPulse className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">4.2 Proactive Mental Health & Wellness Companion</h3>
            <p className="text-xs text-slate-400">Asynchronous Prosodic Trend Analysis Background Worker</p>
          </div>
        </div>

        <button
          onClick={handleSimulateProactiveCheckIn}
          className="btn-secondary text-xs border-pink-700/50 text-pink-300 hover:bg-pink-950"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Simulate Proactive Check-In</span>
        </button>
      </div>

      {/* Acoustic Metrics Trend Grid */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-slate-300 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-pink-400" />
            7-Day Acoustic F0 Contour & Energy Decline Trend
          </span>
          <span className="text-[10px] text-pink-400 font-mono flex items-center gap-1">
            <ArrowDown className="w-3 h-3" /> F0 Pitch Drop (-29.5%)
          </span>
        </div>

        {/* Bar Chart Visualizer */}
        <div className="grid grid-cols-7 gap-2 items-end h-28 pt-2">
          {acousticTrends.map((t, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${
                  idx >= 4 ? 'bg-pink-500 shadow-lg shadow-pink-500/30' : 'bg-cyan-500/70'
                }`}
                style={{ height: `${(t.f0 / 220) * 100}%` }}
              />
              <span className="text-[10px] font-mono text-slate-400">{t.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Proactive Notification Banner */}
      {notificationSent && (
        <div className="bg-pink-950/80 border border-pink-700 p-3 rounded-xl flex items-center justify-between text-xs text-pink-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-pink-400 animate-bounce" />
            <span>Proactive Voice Note & Notification Pushed to User Device</span>
          </div>
          <span className="text-[10px] font-mono bg-pink-900 px-2 py-0.5 rounded">Sent just now</span>
        </div>
      )}
    </div>
  );
};
