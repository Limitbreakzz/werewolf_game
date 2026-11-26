import React, { useEffect, useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import { ROLE_ORDER, ROLE_CATEGORIES, FALLBACK_ROLES, RoleIcon, getRoleImage } from '../lib/roleIcons.jsx';

export function RulesModal({ open, onClose, rolesCatalog }) {
  const [category, setCategory] = useState('all');
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
              <strong style={{ color: '#7ee3b8' }}>ฝ่ายชาวบ้าน:</strong> สังเกต พูดคุย และโหวตกำจัดมนุษย์หมาป่าทั้งหมดออกจากหมู่บ้าน
            </p>
            <p>
              <strong style={{ color: '#f49b9b' }}>ฝ่ายมนุษย์หมาป่า:</strong> แฝงตัวและล่าชาวบ้านจนจำนวนหมาป่ามากกว่าหรือเท่ากับผู้ที่เหลืออยู่
            </p>
            <p>
              <strong style={{ color: '#e5b76b' }}>ฝ่ายอิสระ (คนคลั่ง):</strong> หลอกให้หมู่บ้านโหวตประหารตัวเองตอนกลางวันเพื่อชนะคนเดียวทันที
            </p>
          </div>

          <div className="role-filter-tabs" style={{ marginBottom: 14 }} role="tablist" aria-label="หมวดหมู่บทบาท">
            {ROLE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={category === cat.id}
                className={`role-filter-pill ${category === cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="rules-grid">
            {ROLE_ORDER.filter((id) => {
              if (category === 'all') return true;
              const r = catalog[id] || FALLBACK_ROLES[id];
              return (r?.category || r?.team) === category;
            }).map((id) => {
              const r = catalog[id] || FALLBACK_ROLES[id];
              const teamCls = r.team === 'werewolf' ? 'crimson' : r.team === 'independent' ? 'brass' : 'sage';
              const teamLabel = r.team === 'werewolf' ? 'ฝ่ายมนุษย์หมาป่า' : r.team === 'independent' ? 'ฝ่ายอิสระ' : 'ฝ่ายชาวบ้าน';
              const artUrl = getRoleImage(id);
              return (
                <div className="rule-item rule-item-with-art" key={id}>
                  {artUrl ? (
                    <div className="rule-role-art">
                      <img src={artUrl} alt={r.nameTh} />
                    </div>
                  ) : null}
                  <div className="rule-item-content">
                    <div className="rule-item-head">
                      <div className="hud-phase-badge" style={{ color: r.color || 'var(--brass)', width: 32, height: 32 }}>
                        <RoleIcon roleId={id} size={15} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {r.nameTh}{' '}
                          <span className="muted" style={{ fontSize: '0.82rem', fontWeight: 400 }}>
                            ({r.nameEn})
                          </span>
                        </div>
                        <span className={`tag-pill ${teamCls}`}>{teamLabel}</span>
                      </div>
                    </div>
                    <p className="muted" style={{ fontSize: '0.84rem', lineHeight: 1.52 }}>
                      {r.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
