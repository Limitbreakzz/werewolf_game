import React, { useEffect, useState } from 'react';

export function PhaseTimer({ phase, phaseEndsAt, timerOffsetMs, settings }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!phaseEndsAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [phaseEndsAt]);

  if (!phaseEndsAt) {
    return (
      <div className="timer-wrap">
        <span className="timer-readout tabular">--</span>
        <div className="timer-track">
          <div className="timer-fill" style={{ width: '100%' }} />
        </div>
      </div>
    );
  }

  const remainingMs = Math.max(0, phaseEndsAt - (now - timerOffsetMs));
  const secs = Math.ceil(remainingMs / 1000);
  const approxTotal =
    phase === 'day_discuss'
      ? settings?.discussSeconds || 75
      : phase === 'night'
      ? settings?.nightStepSeconds || 20
      : phase === 'day_vote'
      ? settings?.voteSeconds || 35
      : phase === 'day_defense'
      ? settings?.defenseSeconds || 30
      : phase === 'day_verdict'
      ? settings?.verdictSeconds || 20
      : phase === 'hunter_revenge'
      ? 20
      : 6;

  const pct = Math.max(0, Math.min(100, (remainingMs / (approxTotal * 1000)) * 100));

  return (
    <div className="timer-wrap" aria-label={`เวลาที่เหลือ ${secs} วินาที`}>
      <span className="timer-readout tabular">{secs}s</span>
      <div className="timer-track">
        <div className={`timer-fill ${secs <= 7 ? 'urgent' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
