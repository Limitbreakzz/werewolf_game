import React, { useState } from 'react';
import {
  Copy,
  BookOpen,
  LogOut,
  Users,
  Bot,
  Crown,
  X,
  SlidersHorizontal,
  Play,
  Plus,
  Minus,
  CheckCircle2,
  Circle,
  Smartphone,
  Volume2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Save,
  Pencil,
} from 'lucide-react';
import { ROLE_ORDER, FALLBACK_ROLES, RoleIcon, PlayerAvatar } from '../lib/roleIcons.jsx';
import { QrCodeBox } from './QrCodeBox.jsx';

const DISCUSS_PRESETS = [
  { seconds: 60, label: '60 วิ', hint: 'เร็ว' },
  { seconds: 90, label: '90 วิ', hint: 'มาตรฐาน' },
  { seconds: 150, label: '150 วิ', hint: 'ถกเถียง' },
  { seconds: 240, label: '240 วิ', hint: 'วงใหญ่' },
];

const CONTROL_MODES = [
  {
    id: 'no_mod',
    title: 'No Moderator Mode (แนะนำ)',
    desc: 'เว็บแอพเป็นกรรมการอัตโนมัติ สั่นเตือนส่วนตัวเมื่อถึงตา ไม่เผยบทบาทออกลำโพง',
    Icon: Smartphone,
  },
  {
    id: 'narrator',
    title: 'เสียงบรรยายกลาง (Voice Narrator)',
    desc: 'เว็บแอพเรียก Role ตามลำดับพร้อมเสียงบรรยายภาษาไทยจากเครื่องหัวหน้าห้อง',
    Icon: Volume2,
  },
  {
    id: 'manual_mod',
    title: 'Manual Moderator Mode',
    desc: 'หัวหน้าห้องรับบทกรรมการ ควบคุมจังหวะกลางคืน ดูสถานะทุกคน และกดข้าม Role เอง',
    Icon: ShieldCheck,
  },
];

function padSeat(n) {
  return String(n).padStart(2, '0');
}

export function LobbyView({
  room,
  onCopyInvite,
  onOpenRules,
  onLeave,
  onToggleReady,
  onAddBot,
  onRemoveBot,
  onKickPlayer,
  onUpdateSettings,
  onStartGame,
  onTestNarrator,
}) {
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [editingRoles, setEditingRoles] = useState(false);
  const [draftRoles, setDraftRoles] = useState(null);
  const isHost = room.hostId === room.myId;
  const me = room.players.find((p) => p.id === room.myId);
  const isManualMod = room.settings.controlMode === 'manual_mod';
  const activeCount = isManualMod ? Math.max(0, room.players.length - 1) : room.players.length;
  const canStart = activeCount >= 4;
  const catalog = room.rolesCatalog || FALLBACK_ROLES;
  const savedRoleConfig = room.settings.roleConfig || {};
  const roleConfig = editingRoles && draftRoles ? draftRoles : savedRoleConfig;
  const totalDraftRoles = ROLE_ORDER.reduce((sum, id) => sum + (Number(roleConfig[id]) || 0), 0);
  const inviteUrl = `${window.location.origin}/?room=${room.code}`;

  const openRoleEditor = () => {
    setDraftRoles({ ...savedRoleConfig });
    setEditingRoles(true);
    setShowAllRoles(true);
  };

  const handleSaveRoles = () => {
    const toSave = draftRoles ? { ...draftRoles } : { ...savedRoleConfig };
    onUpdateSettings({ autoRoles: false, roleConfig: toSave }, 'บันทึกชุดบทบาทเรียบร้อยแล้ว');
    setEditingRoles(false);
    setDraftRoles(null);
    setShowAllRoles(false);
  };

  const handleCancelRoles = () => {
    setEditingRoles(false);
    setDraftRoles(null);
    setShowAllRoles(false);
  };

  return (
    <section className="lobby-shell">
      <header className="panel lobby-topbar">
        <div className="room-code-group">
          <QrCodeBox value={inviteUrl} size={86} />
          <div>
            <div className="subtle" style={{ fontSize: '0.8rem' }}>สแกน QR หรือกรอกรหัสห้อง</div>
            <div className="room-code-value">{room.code}</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-sm btn-surface" onClick={onCopyInvite}>
                <Copy size={15} />
                คัดลอกลิงก์ชวนเพื่อน
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-sm btn-ghost" onClick={onOpenRules}>
            <BookOpen size={15} />
            คู่มือบทบาท
          </button>
          <button type="button" className="btn btn-sm btn-danger-outline" onClick={onLeave}>
            <LogOut size={15} />
            ออกจากห้อง
          </button>
        </div>
      </header>

      {!isHost && me ? (
        <div className={`panel lobby-ready-banner ${me.ready ? 'is-ready' : 'not-ready'}`}>
          <div className="lobby-ready-copy">
            <div className="lobby-ready-title">
              {me.ready ? 'คุณพร้อมเล่นแล้ว!' : 'ยังไม่ได้กดพร้อมเล่น'}
            </div>
            <div className="lobby-ready-sub">
              {me.ready
                ? 'รอหัวหน้าห้องกดเริ่มเกม (แตะปุ่มอีกครั้งหากต้องการยกเลิก)'
                : 'กรุณากดปุ่มด้านขวาเพื่อยืนยันว่าคุณพร้อมเริ่มเกม'}
            </div>
          </div>
          <button
            type="button"
            className={`btn btn-lg btn-ready-hero ${me.ready ? 'btn-sage' : 'btn-brass'}`}
            onClick={onToggleReady}
          >
            {me.ready ? <CheckCircle2 size={20} strokeWidth={2.2} /> : <Circle size={20} strokeWidth={2.2} />}
            <span>{me.ready ? 'พร้อมเล่นแล้ว' : 'กดพร้อมเล่น'}</span>
          </button>
        </div>
      ) : null}

      <div className="lobby-grid">
        {/* Left: Village Roster & Mode Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="panel lobby-panel">
            <div className="panel-header">
              <h2>
                <Users size={18} strokeWidth={1.75} />
                ผู้เล่นในโต๊ะ
                <span className="muted tabular" style={{ fontWeight: 500, fontSize: '0.94rem' }}>
                  ({room.players.length}/16)
                </span>
              </h2>

              {isHost ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-surface"
                    onClick={onAddBot}
                    disabled={room.players.length >= 16}
                  >
                    <Plus size={15} />
                    เพิ่มบอท AI
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => onRemoveBot(null)}
                    disabled={!room.players.some((p) => p.isBot)}
                  >
                    <Minus size={15} />
                    ลบบอท
                  </button>
                </div>
              ) : null}
            </div>

            <div className="roster-grid">
              {room.players.map((p) => {
                const isMe = p.id === room.myId;
                const isModHost = isManualMod && p.isHost;
                return (
                  <div className={`roster-seat ${isMe ? 'is-me' : ''}`} key={p.id}>
                    <span className="seat-avatar-badge" aria-hidden="true">
                      <PlayerAvatar avatarId={p.avatar} size={18} />
                    </span>
                    <div className="seat-meta">
                      <div className="seat-name">
                        {isModHost ? (
                          <span className="subtle" style={{ marginRight: 5 }}>[MOD]</span>
                        ) : (
                          <span className="subtle tabular" style={{ marginRight: 5 }}>#{padSeat(p.seatNumber)}</span>
                        )}
                        {p.name}
                      </div>
                      <div className="seat-tags">
                        {p.isHost ? (
                          <span className="tag-pill brass">
                            <Crown size={11} />
                            {isModHost ? 'กรรมการ' : 'หัวหน้าห้อง'}
                          </span>
                        ) : null}
                        {p.isBot ? (
                          <span className="tag-pill">
                            <Bot size={11} />
                            AI
                          </span>
                        ) : p.ready ? (
                          <span className="tag-pill sage">พร้อม</span>
                        ) : (
                          <span className="tag-pill">รอพร้อม</span>
                        )}
                      </div>
                    </div>
                    {isHost && !isMe ? (
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ width: 28, height: 28 }}
                        title="นำออกจากห้อง"
                        onClick={() => (p.isBot ? onRemoveBot(p.id) : onKickPlayer(p.id))}
                      >
                        <X size={14} />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3 Night Control Modes */}
          <div className="panel lobby-panel">
            <div className="panel-header" style={{ marginBottom: 12 }}>
              <h2>รูปแบบการคุมเกมช่วงกลางคืน</h2>
              {!isHost ? (
                <span className="tag-pill">เฉพาะหัวหน้าห้องเลือกได้</span>
              ) : room.settings.controlMode === 'narrator' ? (
                <button type="button" className="btn btn-xs btn-surface" onClick={onTestNarrator}>
                  <Volume2 size={14} />
                  ทดสอบเสียงบรรยาย
                </button>
              ) : null}
            </div>
            <div className="mode-list" role="radiogroup" aria-label="รูปแบบการคุมเกมช่วงกลางคืน">
              {CONTROL_MODES.map((m) => {
                const Icon = m.Icon;
                const active = room.settings.controlMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={!isHost}
                    className={`mode-option ${active ? 'selected' : ''}`}
                    onClick={() => {
                      if (!isHost) return;
                      onUpdateSettings({ controlMode: m.id });
                    }}
                  >
                    <div className="mode-option-icon">
                      <Icon size={18} strokeWidth={1.75} />
                    </div>
                    <div className="mode-option-copy">
                      <div className="mode-option-title">{m.title}</div>
                      <div className="mode-option-desc">{m.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Role Deck & Settings */}
        <aside className="panel lobby-panel">
          <div className="panel-header">
            <h2>
              <SlidersHorizontal size={18} strokeWidth={1.75} />
              จัดชุดบทบาทและเวลา
            </h2>
            {!isHost ? <span className="tag-pill">เฉพาะหัวหน้าห้องตั้งค่าได้</span> : null}
          </div>

          {isHost ? (
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={room.settings.autoRoles && !editingRoles}
                onChange={(e) => {
                  if (e.target.checked) {
                    setEditingRoles(false);
                    setDraftRoles(null);
                    setShowAllRoles(false);
                    onUpdateSettings({ autoRoles: true });
                  } else {
                    openRoleEditor();
                  }
                }}
              />
              <span>จัดสมดุลบทบาทอัตโนมัติ ({activeCount} ผู้เล่น)</span>
            </label>
          ) : (
            <div className="muted" style={{ fontSize: '0.85rem' }}>
              {room.settings.autoRoles ? `จัดสมดุลบทบาทอัตโนมัติ (${activeCount} ผู้เล่น)` : 'หัวหน้าห้องจัดชุดบทบาทเอง'}
            </div>
          )}

          {!editingRoles && !showAllRoles ? (
            <div className="deck-compact-wrap">
              <div className="deck-summary-grid">
                {ROLE_ORDER.filter((id) => (savedRoleConfig[id] || 0) > 0).map((roleId) => {
                  const r = catalog[roleId] || FALLBACK_ROLES[roleId];
                  const count = savedRoleConfig[roleId] || 0;
                  return (
                    <div className="deck-summary-chip" key={roleId} title={r.shortDesc || r.description}>
                      <span style={{ color: r.color || 'var(--brass)', display: 'inline-flex', flexShrink: 0 }}>
                        <RoleIcon roleId={roleId} size={15} />
                      </span>
                      <span className="deck-summary-name">{r.nameTh}</span>
                      <span className="deck-summary-count tabular">×{count}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {isHost && !room.settings.autoRoles ? (
                  <button
                    type="button"
                    className="btn btn-xs btn-surface"
                    style={{ flex: 1 }}
                    onClick={openRoleEditor}
                  >
                    <Pencil size={13} />
                    แก้ไขชุดบทบาท
                  </button>
                ) : null}
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setShowAllRoles(true)}
                >
                  <ChevronDown size={14} />
                  ดูครบทั้ง {ROLE_ORDER.length} บทบาท
                </button>
              </div>
            </div>
          ) : (
            <div className="deck-expanded-wrap">
              <div className="deck-list">
                {ROLE_ORDER.map((roleId) => {
                  const r = catalog[roleId] || FALLBACK_ROLES[roleId];
                  const count = Number(roleConfig[roleId]) || 0;
                  const editable = isHost && editingRoles;
                  return (
                    <div className={`deck-row ${count > 0 ? 'active-role' : ''}`} key={roleId}>
                      <div className="deck-role-label">
                        <span style={{ color: r.color || 'var(--brass)', display: 'inline-flex', flexShrink: 0 }}>
                          <RoleIcon roleId={roleId} size={16} />
                        </span>
                        <div className="deck-role-text">
                          <div className="deck-role-name">
                            {r.nameTh}{' '}
                            <span className="subtle" style={{ fontSize: '0.78rem' }}>({r.nameEn})</span>
                          </div>
                          <div className="deck-role-desc">
                            {r.shortDesc || FALLBACK_ROLES[roleId]?.shortDesc || r.description}
                          </div>
                        </div>
                      </div>
                      {editable ? (
                        <div className="stepper">
                          <button
                            type="button"
                            disabled={count <= 0}
                            onClick={() =>
                              setDraftRoles((prev) => ({
                                ...(prev || savedRoleConfig),
                                [roleId]: Math.max(0, count - 1),
                              }))
                            }
                            aria-label={`ลดจำนวน${r.nameTh}`}
                          >
                            −
                          </button>
                          <span className="tabular">{count}</span>
                          <button
                            type="button"
                            disabled={count >= 8}
                            onClick={() =>
                              setDraftRoles((prev) => ({
                                ...(prev || savedRoleConfig),
                                [roleId]: Math.min(8, count + 1),
                              }))
                            }
                            aria-label={`เพิ่มจำนวน${r.nameTh}`}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="deck-summary-count tabular">×{count}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {isHost && editingRoles ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.84rem',
                      padding: '6px 10px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span className="muted">รวมบทบาทที่จัดไว้</span>
                    <span
                      className="tabular"
                      style={{
                        fontWeight: 700,
                        color:
                          totalDraftRoles === activeCount
                            ? '#7ee2b8'
                            : totalDraftRoles > activeCount
                            ? '#f2a2a2'
                            : 'var(--brass)',
                      }}
                    >
                      {totalDraftRoles} / {activeCount} คน
                      {totalDraftRoles < activeCount
                        ? ` (ขาด ${activeCount - totalDraftRoles} เติมชาวบ้าน)`
                        : totalDraftRoles > activeCount
                        ? ` (เกิน ${totalDraftRoles - activeCount})`
                        : ' (พอดี)'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-sage"
                      style={{ flex: 1, fontWeight: 700 }}
                      onClick={handleSaveRoles}
                    >
                      <Save size={15} />
                      บันทึกชุดบทบาท
                    </button>
                    <button type="button" className="btn btn-sm btn-ghost" onClick={handleCancelRoles}>
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-xs btn-ghost"
                  style={{ marginTop: 4, width: '100%' }}
                  onClick={() => setShowAllRoles(false)}
                >
                  <ChevronUp size={14} />
                  ย่อรายการบทบาท
                </button>
              )}
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <span className="field-label">เวลาสนทนาตอนกลางวัน (คุยจริงหน้าโต๊ะ)</span>
            <div className="time-preset-grid" role="radiogroup" aria-label="เวลาสนทนาตอนกลางวัน">
              {DISCUSS_PRESETS.map((preset) => {
                const active = Number(room.settings.discussSeconds) === preset.seconds;
                return (
                  <button
                    key={preset.seconds}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={!isHost}
                    className={`time-preset-btn ${active ? 'selected' : ''}`}
                    onClick={() => {
                      if (!isHost) return;
                      onUpdateSettings({ discussSeconds: preset.seconds });
                    }}
                  >
                    <span className="time-preset-val tabular">{preset.label}</span>
                    <span className="time-preset-hint">{preset.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>
            {canStart
              ? `พร้อมเริ่มเกมแล้ว (${activeCount} ผู้เล่น${isManualMod ? ' + 1 กรรมการ' : ''})`
              : `ต้องการผู้เล่นอีก ${4 - activeCount} คน หรือกดเพิ่มบอท AI`}
          </p>

          {isHost ? (
            <button
              type="button"
              className="btn btn-crimson btn-lg btn-full"
              disabled={!canStart}
              onClick={onStartGame}
            >
              <Play size={18} />
              เริ่มคืนหมาป่า
            </button>
          ) : me ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                className={`btn btn-lg btn-full btn-ready-hero ${me.ready ? 'btn-sage' : 'btn-brass'}`}
                onClick={onToggleReady}
              >
                {me.ready ? <CheckCircle2 size={20} strokeWidth={2.2} /> : <Circle size={20} strokeWidth={2.2} />}
                <span>{me.ready ? 'พร้อมเล่นแล้ว' : 'กดพร้อมเล่น'}</span>
              </button>
              <div className="muted" style={{ textAlign: 'center', fontSize: '0.84rem' }}>
                {me.ready ? 'รอหัวหน้าห้องกดเริ่มเกม...' : 'กดปุ่มด้านบนเพื่อยืนยันความพร้อม'}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
