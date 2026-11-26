import React, { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from './lib/socket.js';
import { soundFX } from './lib/sound.js';
import { speakThai, unlockSpeech, NARRATOR_SCRIPTS, NARRATOR_SLEEP } from './lib/feedback.js';
import { AVATARS } from './lib/roleIcons.jsx';
import { HomeView } from './components/HomeView.jsx';
import { LobbyView } from './components/LobbyView.jsx';
import { GameView } from './components/GameView.jsx';
import { RulesModal } from './components/RulesModal.jsx';

const SESSION_KEY = 'werewolf_session';

export function App() {
  const [room, setRoom] = useState(null);
  const [timerOffsetMs, setTimerOffsetMs] = useState(0);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('werewolf_name') || '');
  const [avatar, setAvatar] = useState(() => {
    const saved = localStorage.getItem('werewolf_avatar') || '';
    return saved.startsWith('data:image/') ? saved : '';
  });
  const [roomCodeInput, setRoomCodeInput] = useState(() => {
    const p = new URLSearchParams(window.location.search).get('room');
    return p ? p.toUpperCase().slice(0, 4) : '';
  });
  const [muted, setMuted] = useState(() => soundFX.muted);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const prevPhaseRef = useRef(null);
  const prevNightStepRef = useRef(null);
  const lastRoomVersionRef = useRef({ code: null, version: -1 });

  const pushToast = useCallback((text, type = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  useEffect(() => {
    const tryRejoin = () => {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (!saved) return;
      try {
        const { roomCode, playerId } = JSON.parse(saved);
        if (roomCode && playerId) {
          socket.emit('rejoin_room', { roomCode, playerId }, (res) => {
            if (!res?.ok) sessionStorage.removeItem(SESSION_KEY);
          });
        }
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    };

    if (socket.connected) tryRejoin();
    socket.on('connect', tryRejoin);

    const requestSync = () => {
      if (document.visibilityState === 'visible' && socket.connected) {
        socket.emit('sync_room', {}, (res) => {
          if (!res?.ok) tryRejoin();
        });
      }
    };
    document.addEventListener('visibilitychange', requestSync);
    window.addEventListener('focus', requestSync);
    const syncTimer = setInterval(() => {
      if (socket.connected && sessionStorage.getItem(SESSION_KEY)) {
        socket.emit('sync_room');
      }
    }, 5000);

    const onRoomState = (nextRoom) => {
      // Ignore out-of-order stale snapshots for the same room
      if (
        lastRoomVersionRef.current.code === nextRoom.code &&
        typeof nextRoom.stateVersion === 'number' &&
        nextRoom.stateVersion < lastRoomVersionRef.current.version
      ) {
        return;
      }
      lastRoomVersionRef.current = { code: nextRoom.code, version: nextRoom.stateVersion || 0 };
      const prevPhase = prevPhaseRef.current;
      const prevStep = prevNightStepRef.current;
      const isHostNarrator =
        nextRoom.settings?.controlMode === 'narrator' && nextRoom.hostId === nextRoom.myId;
      const visibleStep = nextRoom.privateData?.visibleNightStep || null;

      if (prevPhase !== nextRoom.phase) {
        const isDay = ['dawn', 'day_discuss', 'day_vote', 'game_over'].includes(nextRoom.phase);
        document.body.className = isDay ? 'theme-day' : 'theme-night';

        if (nextRoom.phase === 'night') {
          soundFX.playNight();
          if (prevPhase === 'day_vote' && nextRoom.lastVoteSummary) {
            const s = nextRoom.lastVoteSummary;
            if (s.eliminatedName) {
              pushToast(`ผลโหวต: ${s.eliminatedName} ถูกโหวตออกจากหมู่บ้าน`, 'error');
            } else if (s.reason === 'tie') {
              pushToast('ผลโหวตเสมอกัน วันนี้ไม่มีใครถูกโหวตออก', 'info');
            } else {
              pushToast('ผลโหวต: งดออกเสียง วันนี้ไม่มีใครถูกโหวตออก', 'info');
            }
          }
          if (isHostNarrator) speakThai(NARRATOR_SCRIPTS.night_start, { interrupt: true, muted: soundFX.muted });
        } else if (nextRoom.phase === 'dawn') {
          if (nextRoom.lastDawnSummary?.deaths?.length > 0) soundFX.playDeath();
          else soundFX.playDawn();
          if (isHostNarrator) speakThai(NARRATOR_SCRIPTS.dawn, { interrupt: true, muted: soundFX.muted });
        } else if (nextRoom.phase === 'day_vote') {
          if (isHostNarrator) speakThai(NARRATOR_SCRIPTS.day_vote, { interrupt: true, muted: soundFX.muted });
        } else if (nextRoom.phase === 'game_over') {
          soundFX.playWin(nextRoom.winner === 'village');
        }
        prevPhaseRef.current = nextRoom.phase;
      }

      // Voice Narrator announces sequential role steps on Host device only
      if (isHostNarrator && nextRoom.phase === 'night' && visibleStep && visibleStep !== prevStep) {
        if (NARRATOR_SCRIPTS[visibleStep]) {
          const sleepPrefix = prevStep && NARRATOR_SLEEP[prevStep] ? `${NARRATOR_SLEEP[prevStep]} ... ` : '';
          const phrase = `${sleepPrefix}${NARRATOR_SCRIPTS[visibleStep]}`;
          if (prevPhase !== 'night') {
            // Queue smoothly right after "เข้าสู่ช่วงกลางคืน ทุกคนหยุดพูดและหลับตา"
            speakThai(phrase, { interrupt: false, muted: soundFX.muted });
          } else {
            speakThai(phrase, { interrupt: true, muted: soundFX.muted });
          }
        }
      }
      prevNightStepRef.current = visibleStep;

      setTimerOffsetMs(Date.now() - nextRoom.serverNow);
      setRoom(nextRoom);
    };

    const onChatMessage = ({ channel, message }) => {
      setRoom((curr) => {
        if (!curr) return curr;
        const prevList = curr.chat?.[channel] || [];
        return {
          ...curr,
          chat: {
            ...curr.chat,
            [channel]: [...prevList, message],
          },
        };
      });
    };

    const onKicked = ({ message }) => {
      sessionStorage.removeItem(SESSION_KEY);
      prevPhaseRef.current = null;
      prevNightStepRef.current = null;
      document.body.className = 'theme-night';
      setRoom(null);
      pushToast(message || 'คุณถูกนำออกจากห้อง', 'error');
    };

    socket.on('room_state', onRoomState);
    socket.on('chat_message', onChatMessage);
    socket.on('kicked', onKicked);

    return () => {
      clearInterval(syncTimer);
      document.removeEventListener('visibilitychange', requestSync);
      window.removeEventListener('focus', requestSync);
      socket.off('connect', tryRejoin);
      socket.off('room_state', onRoomState);
      socket.off('chat_message', onChatMessage);
      socket.off('kicked', onKicked);
    };
  }, [pushToast]);

  const getProfile = () => {
    const clean = playerName.trim() || `ผู้เล่น${Math.floor(Math.random() * 90 + 10)}`;
    localStorage.setItem('werewolf_name', clean);
    localStorage.setItem('werewolf_avatar', avatar);
    return { playerName: clean, avatar };
  };

  const handleCreateRoom = () => {
    soundFX.playClick();
    socket.emit('create_room', getProfile(), (res) => {
      if (res?.ok) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ roomCode: res.roomCode, playerId: res.playerId }));
        pushToast(`สร้างห้อง ${res.roomCode} สำเร็จ`, 'success');
      } else {
        pushToast(res?.error || 'สร้างห้องไม่สำเร็จ', 'error');
      }
    });
  };

  const handleQuickSolo = () => {
    soundFX.playClick();
    socket.emit('create_room', getProfile(), (res) => {
      if (!res?.ok) return pushToast(res?.error || 'สร้างห้องไม่สำเร็จ', 'error');
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ roomCode: res.roomCode, playerId: res.playerId }));
      let added = 0;
      const addNext = () => {
        if (added >= 6) {
          pushToast('เตรียมบอท AI ครบ 6 ตัวแล้ว กดเริ่มเกมได้เลย', 'success');
          return;
        }
        socket.emit('add_bot', {}, () => {
          added += 1;
          addNext();
        });
      };
      addNext();
    });
  };

  const handleJoinRoom = () => {
    soundFX.playClick();
    const code = roomCodeInput.trim().toUpperCase();
    if (code.length < 4) return pushToast('กรุณากรอกรหัสห้อง 4 ตัวอักษร', 'error');
    socket.emit('join_room', { ...getProfile(), roomCode: code }, (res) => {
      if (res?.ok) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ roomCode: res.roomCode, playerId: res.playerId }));
        pushToast(`เข้าร่วมห้อง ${res.roomCode} สำเร็จ`, 'success');
      } else {
        pushToast(res?.error || 'เข้าร่วมห้องไม่สำเร็จ', 'error');
      }
    });
  };

  const handleCopyInvite = () => {
    if (!room) return;
    const url = `${window.location.origin}/?room=${room.code}`;
    navigator.clipboard?.writeText(url).then(
      () => pushToast(`คัดลอกลิงก์ห้อง ${room.code} แล้ว`, 'success'),
      () => pushToast(`รหัสห้อง: ${room.code}`, 'info')
    );
  };

  const handleLeave = () => {
    soundFX.playClick();
    socket.emit('leave_room', {}, () => {
      sessionStorage.removeItem(SESSION_KEY);
      prevPhaseRef.current = null;
      prevNightStepRef.current = null;
      document.body.className = 'theme-night';
      setRoom(null);
    });
  };

  const handleNightAction = (payload) => {
    soundFX.playClick();
    socket.emit('night_action', payload, (res) => {
      if (res?.ok && res.result) {
        const isWolf = res.result.team === 'werewolf';
        pushToast(
          `ผลตรวจสอบ ${res.result.targetName}: ${isWolf ? 'ฝ่ายมนุษย์หมาป่า!' : 'ฝ่ายชาวบ้าน'}`,
          isWolf ? 'error' : 'success'
        );
      } else if (res?.ok && res.sorcererResult) {
        const { targetName, isSeer } = res.sorcererResult;
        pushToast(
          `ผลส่อง ${targetName}: ${isSeer ? 'คือเทพพยากรณ์!' : 'ไม่ใช่เทพพยากรณ์'}`,
          isSeer ? 'success' : 'info'
        );
      } else if (!res?.ok && res?.error) {
        pushToast(res.error, 'error');
      }
    });
  };

  const handleSendChat = (channel, text, onSuccess) => {
    socket.emit('send_chat', { channel, text }, (res) => {
      if (res?.ok) onSuccess?.();
      else if (res?.error) pushToast(res.error, 'error');
    });
  };

  const handleModControl = (action, seconds) => {
    soundFX.playClick();
    socket.emit('mod_control', { action, seconds });
  };

  return (
    <>
      <div className="sky-canvas" aria-hidden="true" />

      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-item ${t.type}`}>
            {t.text}
          </div>
        ))}
      </div>

      {!room ? (
        <HomeView
          playerName={playerName}
          setPlayerName={setPlayerName}
          avatar={avatar}
          setAvatar={(av) => {
            soundFX.playClick();
            setAvatar(av);
            try {
              if (av) localStorage.setItem('werewolf_avatar', av);
              else localStorage.removeItem('werewolf_avatar');
            } catch {
              // Ignore storage quota / private mode errors
            }
          }}
          roomCodeInput={roomCodeInput}
          setRoomCodeInput={setRoomCodeInput}
          onCreateRoom={handleCreateRoom}
          onQuickSolo={handleQuickSolo}
          onJoinRoom={handleJoinRoom}
          onOpenRules={() => {
            soundFX.playClick();
            setRulesOpen(true);
          }}
          onError={(msg) => pushToast(msg, 'error')}
        />
      ) : room.phase === 'lobby' ? (
        <LobbyView
          room={room}
          onCopyInvite={handleCopyInvite}
          onOpenRules={() => {
            soundFX.playClick();
            setRulesOpen(true);
          }}
          onLeave={handleLeave}
          onToggleReady={() => {
            soundFX.playClick();
            setRoom((curr) =>
              curr
                ? {
                    ...curr,
                    players: curr.players.map((p) => (p.id === curr.myId ? { ...p, ready: !p.ready } : p)),
                  }
                : curr
            );
            socket.emit('toggle_ready');
          }}
          onAddBot={() => {
            soundFX.playClick();
            socket.emit('add_bot', {}, (res) => {
              if (!res?.ok && res?.error) pushToast(res.error, 'error');
            });
          }}
          onRemoveBot={(botId) => {
            soundFX.playClick();
            socket.emit('remove_bot', { botId }, (res) => {
              if (!res?.ok && res?.error) pushToast(res.error, 'error');
            });
          }}
          onKickPlayer={(targetId) => socket.emit('kick_player', { targetId })}
          onUpdateSettings={(partial) => {
            if (!room || room.hostId !== room.myId) {
              pushToast('เฉพาะหัวหน้าห้องเท่านั้นที่ปรับการตั้งค่าได้', 'error');
              return;
            }
            soundFX.playClick();
            if (partial.controlMode === 'narrator') unlockSpeech();
            if (!socket.connected) {
              pushToast('กำลังเชื่อมต่อเซิร์ฟเวอร์ใหม่ กรุณารอสักครู่...', 'error');
              return;
            }
            // Instant optimistic UI update so clicks feel 0ms responsive
            setRoom((curr) =>
              curr
                ? {
                    ...curr,
                    settings: {
                      ...curr.settings,
                      ...partial,
                      roleConfig: partial.roleConfig
                        ? { ...curr.settings.roleConfig, ...partial.roleConfig }
                        : curr.settings.roleConfig,
                    },
                  }
                : curr
            );
            socket.emit('update_settings', partial, (res) => {
              if (!res?.ok) {
                pushToast(res?.error || 'เปลี่ยนการตั้งค่าไม่สำเร็จ (เฉพาะหัวหน้าห้อง)', 'error');
              }
            });
          }}
          onStartGame={() => {
            soundFX.playClick();
            unlockSpeech();
            socket.emit('start_game', {}, (res) => {
              if (!res?.ok && res?.error) pushToast(res.error, 'error');
            });
          }}
          onTestNarrator={() => {
            unlockSpeech();
            const ok = speakThai(NARRATOR_SCRIPTS.test, { interrupt: true, muted: false });
            if (!ok) {
              pushToast('เบราว์เซอร์นี้ไม่รองรับเสียงบรรยายภาษาไทย (Web Speech API)', 'error');
            }
          }}
        />
      ) : (
        <GameView
          room={room}
          timerOffsetMs={timerOffsetMs}
          muted={muted}
          onToggleMute={() => setMuted(soundFX.toggleMute())}
          onOpenRules={() => {
            soundFX.playClick();
            setRulesOpen(true);
          }}
          onLeave={handleLeave}
          onNightAction={handleNightAction}
          onDayReady={() => {
            soundFX.playClick();
            if (!socket.connected) {
              pushToast('กำลังเชื่อมต่อเซิร์ฟเวอร์ใหม่ กรุณารอสักครู่...', 'error');
              return;
            }
            setRoom((curr) => {
              if (!curr) return curr;
              const set = new Set(curr.dayReadyIds || []);
              if (set.has(curr.myId)) set.delete(curr.myId);
              else set.add(curr.myId);
              return { ...curr, dayReadyIds: Array.from(set) };
            });
            socket.emit('day_ready', {}, (res) => {
              if (!res?.ok && res?.error) pushToast(res.error, 'error');
            });
          }}
          onDayVote={(targetId) => {
            soundFX.playClick();
            if (!socket.connected) {
              pushToast('กำลังเชื่อมต่อเซิร์ฟเวอร์ใหม่ กรุณารอสักครู่...', 'error');
              return;
            }
            setRoom((curr) =>
              curr
                ? {
                    ...curr,
                    dayVotes: { ...(curr.dayVotes || {}), [curr.myId]: targetId },
                  }
                : curr
            );
            socket.emit('day_vote', { targetId }, (res) => {
              if (!res?.ok) {
                pushToast(res?.error || 'ส่งคะแนนโหวตไม่สำเร็จ กรุณาลองอีกครั้ง', 'error');
              }
            });
          }}
          onHunterShoot={(targetId) => {
            soundFX.playClick();
            socket.emit('hunter_shoot', { targetId }, (res) => {
              if (!res?.ok && res?.error) pushToast(res.error, 'error');
            });
          }}
          onSendChat={handleSendChat}
          onModControl={handleModControl}
          onPlayAgain={() => {
            soundFX.playClick();
            socket.emit('play_again');
          }}
        />
      )}

      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} rolesCatalog={room?.rolesCatalog} />
    </>
  );
}
