import React, { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from './lib/socket.js';
import { soundFX } from './lib/sound.js';
import { speakThai, NARRATOR_SCRIPTS } from './lib/feedback.js';
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
    const saved = localStorage.getItem('werewolf_avatar');
    return saved && AVATARS.includes(saved) ? saved : AVATARS[0];
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

  const pushToast = useCallback((text, type = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
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
    }

    const onRoomState = (nextRoom) => {
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
          if (isHostNarrator) speakThai(NARRATOR_SCRIPTS.night_start);
        } else if (nextRoom.phase === 'dawn') {
          if (nextRoom.lastDawnSummary?.deaths?.length > 0) soundFX.playDeath();
          else soundFX.playDawn();
          if (isHostNarrator) speakThai(NARRATOR_SCRIPTS.dawn);
        } else if (nextRoom.phase === 'day_vote') {
          if (isHostNarrator) speakThai(NARRATOR_SCRIPTS.day_vote);
        } else if (nextRoom.phase === 'game_over') {
          soundFX.playWin(nextRoom.winner === 'village');
        }
        prevPhaseRef.current = nextRoom.phase;
      }

      // Voice Narrator announces sequential role steps on Host device only
      if (isHostNarrator && nextRoom.phase === 'night' && visibleStep && visibleStep !== prevStep) {
        if (NARRATOR_SCRIPTS[visibleStep]) {
          setTimeout(() => speakThai(NARRATOR_SCRIPTS[visibleStep]), prevPhase !== 'night' ? 2400 : 300);
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
          `ผลตรวจสอบ ${res.result.targetName}: ${isWolf ? 'ฝ่ายหมาป่า!' : 'ฝ่ายชาวบ้าน'}`,
          isWolf ? 'error' : 'success'
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
          onUpdateSettings={(partial) => socket.emit('update_settings', partial)}
          onStartGame={() => {
            soundFX.playClick();
            socket.emit('start_game', {}, (res) => {
              if (!res?.ok && res?.error) pushToast(res.error, 'error');
            });
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
            socket.emit('day_ready');
          }}
          onDayVote={(targetId) => {
            soundFX.playClick();
            socket.emit('day_vote', { targetId });
          }}
          onHunterShoot={(targetId) => {
            soundFX.playClick();
            socket.emit('hunter_shoot', { targetId });
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
