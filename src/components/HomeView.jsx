import React, { useRef } from 'react';
import { Moon, Users, Zap, DoorOpen, BookOpen, Upload, Trash2, RotateCcw, X } from 'lucide-react';
import { ROLE_ORDER, FALLBACK_ROLES, RoleIcon, PlayerAvatar } from '../lib/roleIcons.jsx';
import { compressAvatarFile } from '../lib/imageUtils.js';

export function HomeView({
  playerName,
  setPlayerName,
  avatar,
  setAvatar,
  roomCodeInput,
  setRoomCodeInput,
  savedSession,
  onRejoinSaved,
  onDismissSaved,
  onCreateRoom,
  onQuickSolo,
  onJoinRoom,
  onOpenRules,
  onError,
}) {
  const fileInputRef = useRef(null);
  const hasPhoto = typeof avatar === 'string' && avatar.startsWith('data:image/');

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    onJoinRoom();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await compressAvatarFile(file, 128, 0.78);
      setAvatar(dataUrl);
    } catch (err) {
      onError?.(err.message || 'อัปโหลดรูปไม่สำเร็จ');
    }
  };

  return (
    <main className="home-shell">
      <header className="home-header">
        <div className="brand-mark">
          <Moon size={18} strokeWidth={1.75} />
          <span>Werewolf Online</span>
        </div>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onOpenRules}>
          <BookOpen size={16} />
          คู่มือบทบาทและกติกา
        </button>
      </header>

      <div className="home-grid">
        {/* Left Editorial Hero & Identity */}
        <section className="hero-column">
          <div>
            <h1 className="hero-title">คืนหมาป่าแห่งหมู่บ้าน</h1>
            <p className="hero-lead" style={{ marginTop: 12 }}>
              เกมสืบสวนและหักเหลี่ยมแบบเรียลไทม์ เล่นออนไลน์พร้อมเพื่อนผ่านรหัสห้อง 4 หลัก หรือเปิดโต๊ะเล่นกับบอท AI ได้ทันที
            </p>
            <div className="role-strip" style={{ marginTop: 14 }}>
              {['werewolf', 'seer', 'doctor', 'witch'].map((id) => {
                const role = FALLBACK_ROLES[id];
                return (
                  <span className="role-chip" key={id}>
                    <RoleIcon roleId={id} size={14} />
                    {role.nameTh}
                  </span>
                );
              })}
              <button
                type="button"
                className="role-chip"
                style={{ cursor: 'pointer', color: 'var(--brass)', borderColor: 'rgba(214, 163, 84, 0.35)' }}
                onClick={onOpenRules}
              >
                +{ROLE_ORDER.length - 4} บทบาท
              </button>
            </div>
          </div>

          <div className="panel identity-panel">
            <div className="profile-upload-row">
              <button
                type="button"
                className="profile-photo-preview"
                onClick={() => fileInputRef.current?.click()}
                title="แตะเพื่อเลือกรูปโปรไฟล์"
                aria-label="เลือกรูปโปรไฟล์"
              >
                <PlayerAvatar avatarId={hasPhoto ? avatar : ''} size={28} />
              </button>

              <div className="profile-upload-meta">
                <span className="field-label" style={{ marginBottom: 4 }}>รูปโปรไฟล์ของคุณ</span>
                <p className="subtle" style={{ fontSize: '0.82rem', marginBottom: 10 }}>
                  เลือกรูปจากมือถือหรือคอมพิวเตอร์ (ไม่ใส่ก็ได้)
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-surface"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={15} />
                    {hasPhoto ? 'เปลี่ยนรูป' : 'เลือกรูปภาพ'}
                  </button>
                  {hasPhoto ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => setAvatar('')}
                    >
                      <Trash2 size={15} />
                      ลบรูป
                    </button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="player-name" className="field-label">
                ชื่อของคุณในหมู่บ้าน
              </label>
              <input
                id="player-name"
                className="text-input"
                type="text"
                maxLength={18}
                placeholder="เช่น นายพราน, แม่มดน้อย..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
        </section>

        {/* Right Decisive Actions */}
        <aside className="panel actions-column">
          {savedSession?.roomCode ? (
            <>
              <div className="action-block" style={{ gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <h2 style={{ color: 'var(--brass)', margin: 0 }}>กลับเข้าเกมที่เล่นค้างไว้</h2>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={onDismissSaved}
                    title="ล้างห้องเดิม"
                    aria-label="ล้างห้องเดิม"
                  >
                    <X size={15} />
                  </button>
                </div>
                <p>คุณมีห้องเดิมรหัส <strong>{savedSession.roomCode}</strong> ที่กำลังเล่นอยู่ แตะเพื่อกลับเข้าที่นั่งและบทบาทเดิมทันที</p>
                <button type="button" className="btn btn-brass btn-lg btn-full" onClick={onRejoinSaved}>
                  <RotateCcw size={17} />
                  กลับเข้าห้อง {savedSession.roomCode}
                </button>
              </div>
              <div className="divider-line" />
            </>
          ) : null}

          <div className="action-block">
            <h2>เปิดห้องเล่นใหม่</h2>
            <p>สร้างห้องส่วนตัวสำหรับ 4–16 คน เชิญเพื่อนด้วยลิงก์ หรือเติมบอท AI เข้าโต๊ะได้ตามต้องการ</p>
            <button type="button" className="btn btn-crimson btn-lg btn-full" onClick={onCreateRoom}>
              <Users size={18} />
              สร้างห้องเล่นกับเพื่อน
            </button>
            <button type="button" className="btn btn-brass btn-full" onClick={onQuickSolo}>
              <Zap size={17} />
              เล่นด่วนคนเดียวกับบอท AI (7 คน)
            </button>
          </div>

          <div className="divider-line" />

          <form className="action-block" onSubmit={handleJoinSubmit}>
            <h2>เข้าร่วมห้องที่มีอยู่</h2>
            <p>กรอกรหัสห้อง 4 ตัวอักษรจากหัวหน้าห้องเพื่อเข้าสู่โต๊ะ</p>
            <div className="join-form">
              <input
                type="text"
                maxLength={4}
                placeholder="ABCD"
                className="text-input code-input"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                aria-label="รหัสห้อง 4 ตัวอักษร"
                autoComplete="off"
              />
              <button type="submit" className="btn btn-surface">
                <DoorOpen size={17} />
                เข้าร่วม
              </button>
            </div>
          </form>
        </aside>
      </div>
    </main>
  );
}
