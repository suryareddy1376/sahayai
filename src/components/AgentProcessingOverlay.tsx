import React, { useEffect, useState, useRef } from 'react';

interface PipelineStep {
  label: string;
  icon: string;
  detail: string;
  /** Optional async work to run when this step becomes active */
  work?: () => Promise<void>;
}

interface AgentProcessingOverlayProps {
  title: string;
  steps: PipelineStep[];
  /** Called when ALL steps (including their async work) are done */
  onComplete: () => void;
}

export type { PipelineStep };

export const AgentProcessingOverlay: React.FC<AgentProcessingOverlayProps> = ({
  title,
  steps,
  onComplete,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stepStatus, setStepStatus] = useState<('pending' | 'running' | 'done')[]>(
    steps.map((_, i) => (i === 0 ? 'running' : 'pending'))
  );
  const completedRef = useRef(false);

  useEffect(() => {
    if (completedRef.current) return;

    const runStep = async (idx: number) => {
      if (idx >= steps.length) {
        // All steps done
        completedRef.current = true;
        setTimeout(onComplete, 300);
        return;
      }

      // Mark current step as running
      setStepStatus((prev) => prev.map((s, i) => (i === idx ? 'running' : s)));
      setCurrentIdx(idx);

      const step = steps[idx];

      if (step.work) {
        // Run the actual agent work + ensure minimum visible time (800ms)
        const [result] = await Promise.all([
          step.work(),
          new Promise((r) => setTimeout(r, 800)),
        ]);
      } else {
        // No work — just animate for 800ms
        await new Promise((r) => setTimeout(r, 800));
      }

      // Mark step as done
      setStepStatus((prev) => prev.map((s, i) => (i === idx ? 'done' : s)));

      // Small pause before next step
      await new Promise((r) => setTimeout(r, 200));

      // Start next step
      runStep(idx + 1);
    };

    runStep(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full mx-4 space-y-5">
        {/* Title */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-500 font-medium">Processing through the agent pipeline…</p>
        </div>

        {/* Pipeline Steps */}
        <div className="space-y-2">
          {steps.map((step, idx) => {
            const status = stepStatus[idx];

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
                  status === 'done'
                    ? 'bg-emerald-50 border-emerald-200'
                    : status === 'running'
                    ? 'bg-blue-50 border-blue-300 shadow-sm'
                    : 'bg-slate-50 border-slate-100 opacity-40'
                }`}
              >
                {/* Status indicator */}
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                  {status === 'done' ? (
                    <span className="text-emerald-600 font-bold text-base">✓</span>
                  ) : status === 'running' ? (
                    <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  ) : (
                    <span className="text-slate-400 text-base">{step.icon}</span>
                  )}
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold ${
                    status === 'done' ? 'text-emerald-800' : status === 'running' ? 'text-blue-900' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-[11px] truncate ${
                    status === 'done' ? 'text-emerald-600' : status === 'running' ? 'text-blue-600' : 'text-slate-400'
                  }`}>
                    {status === 'done' ? '✓ Retrieved successfully' : status === 'pending' ? 'Waiting…' : step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIdx + (stepStatus[currentIdx] === 'done' ? 1 : 0.5)) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
