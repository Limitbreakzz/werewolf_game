import React from 'react';
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
} from 'lucide-react';
import { ROLE_ORDER, FALLBACK_ROLES, RoleIcon } from '../lib/roleIcons.jsx';
import { QrCodeBox } from './QrCodeBox.jsx';

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
}) {
  const isHost = room.hostId === room.myId;
  const me = room.players.find((p) => p.id === room.myId);
  const isManualMod = room.settings.controlMode === 'manual_mod';
  const activeCount = isManualMod ? Math.max(0, room.players.length - 1) : room.players.length;
  const canStart = activeCount >= 4;
  const catalog = room.rolesCatalog || FALLBACK_ROLES;
  const roleConfig = room.settings.roleConfig || {};
  const inviteUrl = `${window.location.origin}/?room=${room.code}`;

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
              {!isHost && me ? (
                <button
                  type="button"
                  className={`btn btn-sm ${me.ready ? 'btn-sage' : 'btn-brass'}`}
                  onClick={onToggleReady}
                >
                  {me.ready ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                  {me.ready ? 'พร้อมแล้ว' : 'กดพร้อมเล่น'}
                </button>
              ) : null}
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
                    <span className="seat-avatar" aria-hidden="true">{p.avatar}</span>
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
              {!isHost ? <span className="tag-pill">เฉพาะหัวหน้าห้องเลือกได้</span> : null}
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
                    onClick={() => onUpdateSettings({ controlMode: m.id })}
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
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={room.settings.autoRoles}
              disabled={!isHost}
              onChange={(e) => onUpdateSettings({ autoRoles: e.target.checked })}
            />
            <span>จัดสมดุลบทบาทอัตโนมัติ ({activeCount} ผู้เล่น)</span>
          </label>

          <div className="deck-list">
            {ROLE_ORDER.map((roleId) => {
              const r = catalog[roleId] || FALLBACK_ROLES[roleId];
              const count = roleConfig[roleId] || 0;
              const editable = isHost && !room.settings.autoRoles;
              return (
                <div className="deck-row" key={roleId}>
                  <div className="deck-role-label">
                    <span style={{ color: r.color || 'var(--brass)', display: 'inline-flex' }}>
                      <RoleIcon roleId={roleId} size={16} />
                    </span>
                    <span>
                      {r.nameTh}{' '}
                      <span className="subtle" style={{ fontSize: '0.8rem' }}>({r.nameEn})</span>
                    </span>
                  </div>
                  <div className="stepper">
                    <button
                      type="button"
                      disabled={!editable || count <= 0}
                      onClick={() => onUpdateSettings({ roleConfig: { [roleId]: Math.max(0, count - 1) } })}
                      aria-label={`ลดจำนวน${r.nameTh}`}
                    >
                      −
                    </button>
                    <span className="tabular">{count}</span>
                    <button
                      type="button"
                      disabled={!editable || count >= 8}
                      onClick={() => onUpdateSettings({ roleConfig: { [roleId]: Math.min(8, count + 1) } })}
                      aria-label={`เพิ่มจำนวน${r.nameTh}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginBottom: 18 }}>
            <label htmlFor="discuss-time" className="field-label">
              เวลาสนทนาตอนกลางวัน (คุยจริงหน้าโต๊ะ)
            </label>
            <select
              id="discuss-time"
              className="select-input"
              value={String(room.settings.discussSeconds)}
              disabled={!isHost}
              onChange={(e) => onUpdateSettings({ discussSeconds: Number(e.target.value) })}
            >
              <option value="60">60 วินาที (เร็ว)</option>
              <option value="90">90 วินาที (มาตรฐาน)</option>
              <option value="150">150 วินาที (ถกเถียงเต็มที่)</option>
              <option value="240">240 วินาที (วงใหญ่)</option>
            </select>
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
          ) : (
            <div className="panel-raised" style={{ padding: '12px 14px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--brass)' }}>
              รอหัวหน้าห้องกดเริ่มเกม...
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
