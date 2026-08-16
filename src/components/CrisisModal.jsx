import React from 'react';
import { ShieldAlert, PhoneCall, X, Heart, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export const CrisisModal = ({ isOpen, onClose }) => {
  const [copiedNumber, setCopiedNumber] = useState(null);

  if (!isOpen) return null;

  const helplines = [
    {
      name: 'Tele-MANAS (राष्ट्रीय मानसिक स्वास्थ्य कार्यक्रम)',
      number: '14416',
      altNumber: '1800-89-14416',
      desc: 'Govt. of India 24/7 Free Mental Health Service (20+ Indian Languages)',
      primary: true,
    },
    {
      name: 'KIRAN (सामाजिक न्याय और अधिकारिता मंत्रालय)',
      number: '1800-599-0019',
      desc: 'Mental Health Rehabilitation & 24/7 Emergency Counseling',
    },
    {
      name: 'NIMHANS Helpline',
      number: '080-46110007',
      desc: 'National Institute of Mental Health & Neurosciences Medical Advice',
    },
    {
      name: 'Vandrevala Foundation Helpline',
      number: '9999-666-555',
      desc: '24/7 Crisis & Suicide Prevention (Call & WhatsApp)',
    },
    {
      name: 'Aasra (आसरा)',
      number: '91-9820466726',
      desc: '24/7 Crisis Intervention & Suicide Prevention Services',
    },
  ];

  const handleCopy = (num) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <div className="modal-overlay animate-fadeIn">
      <div className="glass-panel p-6 max-w-2xl w-full border-rose-500/40 bg-slate-950/95 space-y-5 relative shadow-2xl shadow-rose-950/50">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-rose-900/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-700 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-rose-100">Emergency Crisis Protocol Active</h2>
                <span className="text-[10px] font-mono bg-rose-900 text-rose-200 px-2 py-0.5 rounded">
                  Section 5.2 Protocol
                </span>
              </div>
              <p className="text-xs text-rose-300/80">
                Aap akele nahi hain. Immediate confidential help is available 24/7.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Empathic Note */}
        <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl text-xs text-rose-200 leading-relaxed flex items-start gap-3">
          <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p>
            Hum samajhte hain ki abhi waqt bohot mushkil lag raha hai. Kripya neeche diye gaye kisi bhi toll-free helpline number par turant baat karein. Yeh sabhi services 100% free, confidential aur 24/7 available hain.
          </p>
        </div>

        {/* Helpline Cards */}
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {helplines.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                item.primary
                  ? 'bg-rose-950/60 border-rose-600/80 shadow-lg shadow-rose-950/50'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div>
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                  {item.name}
                  {item.primary && (
                    <span className="text-[10px] bg-rose-600 text-white px-2 py-0.2 rounded-full">
                      Primary Helpline
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${item.number}`}
                  className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {item.number}</span>
                </a>

                <button
                  onClick={() => handleCopy(item.number)}
                  className="p-2 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-xs flex items-center gap-1"
                  title="Copy Phone Number"
                >
                  {copiedNumber === item.number ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-slate-500 font-mono text-center pt-2 border-t border-slate-900">
          NVIDIA NeMo Guardrails & Safety Protocol Active | Emergency Hotline Auto-Redirection
        </div>
      </div>
    </div>
  );
};
