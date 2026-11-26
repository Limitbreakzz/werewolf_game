import React from 'react';
import { Moon, Users, Zap, DoorOpen, BookOpen } from 'lucide-react';
import { AVATAR_CRESTS, ROLE_ORDER, FALLBACK_ROLES, RoleIcon } from '../lib/roleIcons.jsx';

export function HomeView({
  playerName,
  setPlayerName,
  avatar,
  setAvatar,
  roomCodeInput,
  setRoomCodeInput,
  onCreateRoom,
  onQuickSolo,
  onJoinRoom,
  onOpenRules,
}) {
  const handleJoinSubmit = (e) => {
    e.preventDefault();
    onJoinRoom();
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
            <div className="role-strip" style={{ marginTop: 16 }}>
              {ROLE_ORDER.map((id) => {
                const role = FALLBACK_ROLES[id];
                return (
                  <span className="role-chip" key={id}>
                    <RoleIcon roleId={id} size={14} />
                    {role.nameTh}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="panel identity-panel">
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

            <div>
              <span className="field-label">ตราสัญลักษณ์ประจำตัว</span>
              <div className="avatar-grid" role="radiogroup" aria-label="เลือกตราสัญลักษณ์ประจำตัว">
                {AVATAR_CRESTS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={avatar === id}
                    aria-label={label}
                    title={label}
                    className={`avatar-btn ${avatar === id ? 'selected' : ''}`}
                    onClick={() => setAvatar(id)}
                  >
                    <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right Decisive Actions */}
        <aside className="panel actions-column">
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
