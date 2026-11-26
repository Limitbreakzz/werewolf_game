import React, { useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import { ROLE_ORDER, FALLBACK_ROLES, RoleIcon } from '../lib/roleIcons.jsx';

export function RulesModal({ open, onClose, rolesCatalog }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const catalog = rolesCatalog || FALLBACK_ROLES;

  return (
    <div className="overlay-backdrop" role="dialog" aria-modal="true" aria-label="คู่มือบทบาทและกติกา" onClick={onClose}>
      <div className="panel modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.15rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={19} strokeWidth={1.75} />
            คู่มือบทบาทและกติกาเกมหมาป่า
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="ปิดคู่มือ">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="rules-goal-box">
            <p>
              <strong style={{ color: '#7ee3b8' }}>ฝ่ายชาวบ้าน:</strong> สังเกต พูดคุย และโหวตกำจัดหมาป่าทั้งหมดออกจากหมู่บ้าน
            </p>
            <p>
              <strong style={{ color: '#f49b9b' }}>ฝ่ายหมาป่า:</strong> แฝงตัวและล่าชาวบ้านจนจำนวนหมาป่ามากกว่าหรือเท่ากับฝ่ายชาวบ้านที่เหลืออยู่
            </p>
          </div>

          <div className="rules-grid">
            {ROLE_ORDER.map((id) => {
              const r = catalog[id] || FALLBACK_ROLES[id];
              const isWolf = r.team === 'werewolf';
              return (
                <div className="rule-item" key={id}>
                  <div className="rule-item-head">
                    <div className="hud-phase-badge" style={{ color: r.color || 'var(--brass)', width: 38, height: 38 }}>
                      <RoleIcon roleId={id} size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {r.nameTh}{' '}
                        <span className="muted" style={{ fontSize: '0.82rem', fontWeight: 400 }}>
                          ({r.nameEn})
                        </span>
                      </div>
                      <span className={`tag-pill ${isWolf ? 'crimson' : 'sage'}`}>
                        {isWolf ? 'ฝ่ายหมาป่า' : 'ฝ่ายชาวบ้าน'}
                      </span>
                    </div>
                  </div>
                  <p className="muted" style={{ fontSize: '0.86rem', lineHeight: 1.55 }}>
                    {r.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
