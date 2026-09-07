import React from 'react';
import { Info, Lightbulb, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

export type CalloutType = 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION';

interface CalloutProps {
  type: CalloutType;
  children: React.ReactNode;
}

const config = {
  NOTE: {
    icon: Info,
    title: 'Ghi chú',
    wrapperClass: 'border-l-4 border-l-blue-500 border-y border-r border-blue-200 dark:border-blue-900/50 bg-blue-50/80 dark:bg-[#111c2e] text-blue-950 dark:text-blue-100',
    iconClass: 'text-blue-600 dark:text-blue-400',
    titleClass: 'text-blue-900 dark:text-blue-300 font-bold',
  },
  TIP: {
    icon: Lightbulb,
    title: 'Mẹo hữu ích',
    wrapperClass: 'border-l-4 border-l-emerald-500 border-y border-r border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-[#0d221c] text-emerald-950 dark:text-emerald-100',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    titleClass: 'text-emerald-900 dark:text-emerald-300 font-bold',
  },
  IMPORTANT: {
    icon: CheckCircle2,
    title: 'Lưu ý quan trọng',
    wrapperClass: 'border-l-4 border-l-purple-500 border-y border-r border-purple-200 dark:border-purple-900/50 bg-purple-50/80 dark:bg-[#1d152a] text-purple-950 dark:text-purple-100',
    iconClass: 'text-purple-600 dark:text-purple-400',
    titleClass: 'text-purple-900 dark:text-purple-300 font-bold',
  },
  WARNING: {
    icon: AlertTriangle,
    title: 'Cảnh báo',
    wrapperClass: 'border-l-4 border-l-amber-500 border-y border-r border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-[#271d12] text-amber-950 dark:text-amber-100',
    iconClass: 'text-amber-600 dark:text-amber-400',
    titleClass: 'text-amber-900 dark:text-amber-300 font-bold',
  },
  CAUTION: {
    icon: AlertOctagon,
    title: 'Nguy hiểm',
    wrapperClass: 'border-l-4 border-l-rose-500 border-y border-r border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-[#281316] text-rose-950 dark:text-rose-100',
    iconClass: 'text-rose-600 dark:text-rose-400',
    titleClass: 'text-rose-900 dark:text-rose-300 font-bold',
  },
};

export const Callout: React.FC<CalloutProps> = ({ type, children }) => {
  const current = config[type] || config.NOTE;
  const IconComponent = current.icon;

  return (
    <div className={`my-5 p-4 rounded-xl ${current.wrapperClass} shadow-sm not-prose print:border-l-4 print:border-l-black print:border print:border-zinc-300 print:bg-zinc-50 print:text-black`}>
      <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wider print:text-black">
        <IconComponent className={`w-4 h-4 ${current.iconClass} print:text-black`} />
        <span className={`${current.titleClass} print:text-black`}>{current.title}</span>
      </div>
      <div className="text-xs sm:text-sm leading-relaxed space-y-1.5 [&>p]:m-0 print:text-black">
        {children}
      </div>
    </div>
  );
};
