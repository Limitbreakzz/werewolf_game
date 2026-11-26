import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Moon,
  Sun,
  Sunrise,
  Scale,
  Crosshair,
  FlaskConical,
  Trophy,
  Skull,
  Volume2,
  VolumeX,
  BookOpen,
  LogOut,
  Eye,
  EyeOff,
  MessageSquare,
  Flame,
  Ghost,
  ScrollText,
  Send,
  Vote,
  HeartPulse,
  SkipForward,
  RotateCcw,
  ShieldAlert,
  Clock,
  Check,
  ShieldCheck,
  Vibrate,
} from 'lucide-react';
import { FALLBACK_ROLES, RoleIcon, PlayerAvatar, WolfCrestIcon, getRoleImage } from '../lib/roleIcons.jsx';
import { vibrateDevice } from '../lib/feedback.js';
import { PhaseTimer } from './PhaseTimer.jsx';

function padSeat(n) {
  return String(n || 0).padStart(2, '0');
}

function getPhaseInfo(room) {
  const day = room.dayNumber || 1;
  switch (room.phase) {
    case 'role_reveal':
      return { Icon: Eye, title: 'เปิดการ์ดบทบาทลับ', sub: 'ดูบทบาทส่วนตัวแล้วซ่อนหน้าจอไว้' };
    case 'night':
      return {
        Icon: Moon,
        title: `คืนที่ ${day} — ช่วงกลางคืน`,
        sub: room.privateData?.isMyNightTurn
          ? 'ถึงตาของคุณแล้ว ทำคำสั่งผ่านโทรศัพท์'
          : 'ทุกคนหลับตา เกมกำลังดำเนินการ',
      };
    case 'dawn':
      return { Icon: Sunrise, title: `รุ่งอรุณวันที่ ${day}`, sub: 'ประกาศผลเหตุการณ์เมื่อคืน' };
    case 'day_discuss':
      return { Icon: Sun, title: `กลางวันวันที่ ${day} — สนทนาหน้าโต๊ะ`, sub: 'พูดคุย ถกเถียง และจับพิรุธผู้ต้องสงสัย' };
    case 'day_vote':
      return { Icon: Scale, title: `กลางวันวันที่ ${day} — โหวตประหาร`, sub: 'เลือกผู้ต้องสงสัยและกดยืนยันคะแนน' };
    case 'hunter_revenge':
      return { Icon: Crosshair, title: 'นักล่าเล็งปืนนัดสุดท้าย', sub: 'นักล่ากำลังเลือกผู้เล่นที่จะยิงตามไป' };
    case 'game_over':
      return {
        Icon: room.winner === 'village' ? Trophy : Flame,
        title: room.winner === 'village' ? 'ฝ่ายชาวบ้านชนะ' : 'ฝ่ายหมาป่าชนะ',
        sub: 'จบเกม — เปิดเผยบทบาททุกคน',
      };
    default:
      return { Icon: Moon, title: 'Werewolf Online', sub: '' };
  }
}

export function GameView({
  room,
  timerOffsetMs,
  muted,
  onToggleMute,
  onOpenRules,
  onLeave,
  onNightAction,
  onDayReady,
  onDayVote,
  onHunterShoot,
  onSendChat,
  onModControl,
  onPlayAgain,
}) {
  // Default hidden during active play so people sitting nearby cannot peek!
  const [hideRole, setHideRole] = useState(true);
  const [rolePeekedOverlay, setRolePeekedOverlay] = useState(false);
  const [activeChannel, setActiveChannel] = useState('village');
  const [chatText, setChatText] = useState('');
  const [dismissedGameOver, setDismissedGameOver] = useState(false);
  const [draftVoteId, setDraftVoteId] = useState(null);
  const [witchDraft, setWitchDraft] = useState({ heal: false, poisonTargetId: null, pickingPoison: false });
  const chatEndRef = useRef(null);
  const prevNightTurnRef = useRef(false);

  const me = useMemo(() => room.players.find((p) => p.id === room.myId), [room.players, room.myId]);
  const isHost = room.hostId === room.myId;
  const isMod = Boolean(room.privateData?.isModerator);
  const isMyNightTurn = Boolean(room.privateData?.isMyNightTurn);
  const catalog = room.rolesCatalog || FALLBACK_ROLES;
  const myRoleObj = me?.role ? catalog[me.role] || FALLBACK_ROLES[me.role] : null;
  const gamePlayers = useMemo(() => room.players.filter((p) => !p.isModerator), [room.players]);
  const aliveCount = useMemo(() => gamePlayers.filter((p) => p.alive).length, [gamePlayers]);

  const canSeeWolf = me?.role === 'werewolf' || isMod || (!me?.alive && !isMod) || room.phase === 'game_over';
  const canSeeGhost = isMod || !me?.alive || room.phase === 'game_over';

  // Vibrate phone when it becomes your Night Turn!
  useEffect(() => {
    if (isMyNightTurn && !prevNightTurnRef.current) {
      vibrateDevice([220, 90, 220]);
    }
    prevNightTurnRef.current = isMyNightTurn;
  }, [isMyNightTurn]);

  useEffect(() => {
    setWitchDraft({ heal: false, poisonTargetId: null, pickingPoison: false });
    setDraftVoteId(null);
    if (room.phase === 'role_reveal') setRolePeekedOverlay(false);
    if (room.phase !== 'game_over') setDismissedGameOver(false);

    if (room.phase === 'night' && isMyNightTurn && me?.role === 'werewolf') {
      setActiveChannel('wolf');
    } else if (room.phase === 'day_discuss' && activeChannel === 'wolf') {
      setActiveChannel('village');
    }
  }, [room.phase, isMyNightTurn, me?.role]);

  const resolvedChannel =
    activeChannel === 'wolf' && !canSeeWolf
      ? 'village'
      : activeChannel === 'ghost' && !canSeeGhost
      ? 'village'
      : activeChannel;

  const currentFeedLength =
    resolvedChannel === 'log'
      ? (room.logs || []).length
      : (room.chat?.[resolvedChannel] || []).length;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [currentFeedLength, resolvedChannel]);

  const voteCounts = useMemo(() => {
    const map = {};
    if (room.phase === 'day_vote' && room.dayVotes) {
      for (const tid of Object.values(room.dayVotes)) {
        if (tid && tid !== 'skip') map[tid] = (map[tid] || 0) + 1;
      }
    }
    return map;
  }, [room.phase, room.dayVotes]);

  const wolfCounts = useMemo(() => {
    const map = {};
    if (room.phase === 'night' && room.privateData?.wolfVotes) {
      for (const tid of Object.values(room.privateData.wolfVotes)) {
        map[tid] = (map[tid] || 0) + 1;
      }
    }
    return map;
  }, [room.phase, room.privateData?.wolfVotes]);

  const canTarget = (target) => {
    if (!me || isMod || !target.alive || target.isModerator) return false;
    if (room.phase === 'hunter_revenge') {
      return room.activeHunterId === me.id && target.id !== me.id;
    }
    if (!me.alive) return false;

    if (room.phase === 'night' && isMyNightTurn) {
      if (me.role === 'werewolf') return target.role !== 'werewolf';
      if (me.role === 'seer') return !room.privateData?.seerInspectedTonight && target.id !== me.id;
      if (me.role === 'doctor') return room.privateData?.doctorLastProtected !== target.id;
      if (me.role === 'witch') {
        return !room.privateData?.witchDoneTonight && witchDraft.pickingPoison && target.id !== me.id;
      }
    }
    if (room.phase === 'day_vote') {
      return target.id !== me.id;
    }
    return false;
  };

  const handleSeatClick = (target) => {
    if (!canTarget(target)) return;
    if (room.phase === 'night' && isMyNightTurn) {
      if (me.role === 'werewolf') onNightAction({ type: 'wolf_vote', targetId: target.id });
      else if (me.role === 'seer') onNightAction({ type: 'seer_inspect', targetId: target.id });
      else if (me.role === 'doctor') onNightAction({ type: 'doctor_protect', targetId: target.id });
      else if (me.role === 'witch') {
        setWitchDraft((prev) => ({ ...prev, poisonTargetId: target.id, pickingPoison: false }));
      }
    } else if (room.phase === 'day_vote') {
      // First tap selects candidate; second tap on the same candidate confirms vote immediately!
      if (draftVoteId === target.id) {
        onDayVote(target.id);
        setDraftVoteId(null);
      } else {
        setDraftVoteId(target.id);
      }
    } else if (room.phase === 'hunter_revenge') {
      onHunterShoot(target.id);
    }
  };

  // Sleeping Screen for players who are NOT acting right now during Night!
  // Zero leakage of which role is currently active!
  const showSleepingScreen = room.phase === 'night' && !isMyNightTurn && !isMod;

  let chatDisabled = false;
  let chatPlaceholder = 'พิมพ์ข้อความ...';
  if (resolvedChannel === 'log') {
    chatDisabled = true;
    chatPlaceholder = 'บันทึกเหตุการณ์ของโต๊ะ';
  } else if (resolvedChannel === 'village') {
    if (!me?.alive && !isMod && room.phase !== 'game_over') {
      chatDisabled = true;
      chatPlaceholder = 'ผู้เสียชีวิตสนทนาได้เฉพาะช่องวิญญาณ';
    } else if (room.phase === 'night') {
      chatDisabled = true;
      chatPlaceholder = 'ช่วงกลางคืนปิดแชทหมู่บ้าน';
    }
  } else if (resolvedChannel === 'wolf') {
    if (me?.role !== 'werewolf' || !me?.alive) {
      chatDisabled = true;
      chatPlaceholder = 'อ่านได้อย่างเดียว';
    } else {
      chatPlaceholder = 'ส่งข้อความลับถึงฝูงหมาป่า...';
    }
  } else if (resolvedChannel === 'ghost') {
    chatPlaceholder = 'สนทนากับวิญญาณผู้เสียชีวิต...';
  }

  const submitChat = (e) => {
    e.preventDefault();
    const trimmed = chatText.trim();
    if (!trimmed || chatDisabled) return;
    onSendChat(resolvedChannel, trimmed, () => setChatText(''));
  };

  // Manual Moderator Control Panel
  const renderModeratorControlBar = () => {
    if (!isMod) return null;
    const modNight = room.privateData?.modNightStatus;
    const stepRole = modNight?.step ? catalog[modNight.step] || FALLBACK_ROLES[modNight.step] : null;

    return (
      <div className="panel mod-control-panel">
        <div className="mod-control-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={20} color="var(--brass)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>แผงควบคุมกรรมการ (Game Control)</div>
              <div className="muted" style={{ fontSize: '0.84rem' }}>
                {room.phase === 'night' && stepRole
                  ? `กำลังเรียก: ${stepRole.nameTh} (${stepRole.nameEn}) • ส่งคำสั่งแล้ว ${modNight.doneIds.length}/${modNight.actorIds.length} คน`
                  : room.phase === 'day_vote'
                  ? `โหวตแล้ว ${Object.keys(room.dayVotes || {}).length}/${aliveCount} คน`
                  : 'ควบคุมการเปลี่ยนช่วงเวลาและข้ามบทบาทได้จากแผงนี้'}
              </div>
            </div>
          </div>

          <div className="action-strip-btns">
            {room.phase === 'night' ? (
              <button type="button" className="btn btn-sm btn-surface" onClick={() => onModControl('skip_role')}>
                <SkipForward size={15} />
                ข้าม Role นี้
              </button>
            ) : null}
            {room.phase === 'day_discuss' ? (
              <button type="button" className="btn btn-sm btn-surface" onClick={() => onModControl('extend_time', 30)}>
                <Clock size={15} />
                +30 วิ
              </button>
            ) : null}
            {room.phase !== 'game_over' ? (
              <button type="button" className="btn btn-sm btn-crimson" onClick={() => onModControl('next_step')}>
                <SkipForward size={15} />
                {room.phase === 'role_reveal'
                  ? 'เริ่มกลางคืน'
                  : room.phase === 'night'
                  ? 'เรียก Role ถัดไป'
                  : room.phase === 'dawn'
                  ? 'เริ่มสนทนากลางวัน'
                  : room.phase === 'day_discuss'
                  ? 'เริ่มโหวตประหาร'
                  : room.phase === 'day_vote'
                  ? 'สรุปผลโหวต'
                  : 'ขั้นตอนถัดไป'}
              </button>
            ) : (
              <button type="button" className="btn btn-sm btn-crimson" onClick={onPlayAgain}>
                <RotateCcw size={15} />
                กลับล็อบบี้
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Contextual Action Strip
  const renderActionStrip = () => {
    if (isMod) return null;

    if (room.phase === 'game_over') {
      return (
        <>
          <div className="action-strip-msg">
            <Trophy size={18} color="var(--brass)" />
            <span>
              {room.winner === 'village'
                ? 'ฝ่ายชาวบ้านกำจัดหมาป่าทั้งหมดสำเร็จ'
                : 'ฝ่ายหมาป่ายึดครองหมู่บ้านสำเร็จ'}
            </span>
          </div>
          {isHost ? (
            <div className="action-strip-btns">
              <button type="button" className="btn btn-sm btn-crimson" onClick={onPlayAgain}>
                <RotateCcw size={15} />
                กลับล็อบบี้เพื่อเริ่มเกมใหม่
              </button>
            </div>
          ) : null}
        </>
      );
    }

    if (!me?.alive && room.phase !== 'hunter_revenge') {
      return (
        <div className="action-strip-msg">
          <Ghost size={18} color="var(--ink-secondary)" />
          <span>คุณเสียชีวิตแล้ว ระบบล็อกสิทธิ์การโหวต สามารถรับชมเกมและคุยในช่องวิญญาณได้</span>
        </div>
      );
    }

    if (room.phase === 'night' && isMyNightTurn) {
      if (me.role === 'werewolf') {
        const myVote = room.privateData?.wolfVotes?.[me.id];
        const target = gamePlayers.find((p) => p.id === myVote);
        return (
          <div className="action-strip-msg">
            <Flame size={18} color="var(--crimson)" />
            <span>
              {target
                ? `หมาป่าเลือกเหยื่อ #${padSeat(target.seatNumber)} ${target.name} แล้ว (คลิกคนอื่นเพื่อเปลี่ยนได้)`
                : 'หมาป่าตื่นขึ้น — เลือกผู้เล่นที่ต้องการกำจัดในคืนนี้'}
            </span>
          </div>
        );
      }
      if (me.role === 'seer') {
        const res = room.privateData?.seerInspectedTonight;
        const t = res ? gamePlayers.find((p) => p.id === res.targetId) : null;
        return (
          <div className="action-strip-msg">
            <Eye size={18} color="var(--seer)" />
            <span>
              {res && t
                ? `ผลการตรวจสอบ #${padSeat(t.seatNumber)} ${t.name}: ${res.team === 'werewolf' ? 'เป็นฝ่ายหมาป่า!' : 'เป็นฝ่ายชาวบ้าน'}`
                : 'เทพพยากรณ์ตื่นขึ้น — เลือกตรวจสอบผู้เล่น 1 คน'}
            </span>
          </div>
        );
      }
      if (me.role === 'doctor') {
        const chosen = room.privateData?.doctorChoiceTonight;
        const t = chosen ? gamePlayers.find((p) => p.id === chosen) : null;
        return (
          <div className="action-strip-msg">
            <RoleIcon roleId="doctor" size={18} />
            <span>
              {t
                ? `คืนนี้คุณปกป้อง #${padSeat(t.seatNumber)} ${t.name}`
                : 'หมอตื่นขึ้น — เลือกปกป้องผู้เล่น 1 คน (ห้ามซ้ำคนเดิมจากคืนก่อน)'}
            </span>
          </div>
        );
      }
      if (me.role === 'witch') {
        if (room.privateData?.witchDoneTonight) {
          return (
            <div className="action-strip-msg">
              <FlaskConical size={18} color="var(--sage)" />
              <span>บันทึกการใช้ยาเรียบร้อยแล้ว กรุณาหลับตาลง</span>
            </div>
          );
        }
        const ws = room.privateData?.witchState || {};
        const victim = gamePlayers.find((p) => p.id === room.privateData?.witchVictimId);
        const pTarget = gamePlayers.find((p) => p.id === witchDraft.poisonTargetId);
        const msg = witchDraft.pickingPoison
          ? 'คลิกเลือกผู้เล่นด้านล่างที่ต้องการวางยาพิษ'
          : victim && ws.hasHeal
          ? `คืนนี้ #${padSeat(victim.seatNumber)} ${victim.name} ถูกหมาป่าโจมตี! จะใช้ยาชุบชีวิตหรือยาพิษหรือไม่?`
          : 'แม่มดตื่นขึ้น — เลือกใช้ยาพิษหรือกดข้ามคืนนี้';

        return (
          <>
            <div className="action-strip-msg">
              <FlaskConical size={18} color="var(--sage)" />
              <span>{msg}</span>
            </div>
            <div className="action-strip-btns">
              {victim && ws.hasHeal ? (
                <button
                  type="button"
                  className={`btn btn-sm ${witchDraft.heal ? 'btn-sage' : 'btn-surface'}`}
                  onClick={() => setWitchDraft((prev) => ({ ...prev, heal: !prev.heal }))}
                >
                  <HeartPulse size={15} />
                  {witchDraft.heal ? `ช่วย ${victim.name} แล้ว` : `ใช้ยาชุบชีวิตช่วย ${victim.name}`}
                </button>
              ) : null}
              {ws.hasPoison ? (
                <button
                  type="button"
                  className={`btn btn-sm ${pTarget || witchDraft.pickingPoison ? 'btn-crimson' : 'btn-surface'}`}
                  onClick={() =>
                    setWitchDraft((prev) =>
                      prev.poisonTargetId
                        ? { ...prev, poisonTargetId: null, pickingPoison: false }
                        : { ...prev, pickingPoison: !prev.pickingPoison }
                    )
                  }
                >
                  <Skull size={15} />
                  {pTarget
                    ? `ยาพิษ: ${pTarget.name} (ยกเลิก)`
                    : witchDraft.pickingPoison
                    ? 'กำลังเลือกเป้าหมาย...'
                    : 'เลือกเป้าหมายยาพิษ'}
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn-sm btn-brass"
                onClick={() =>
                  onNightAction({
                    type: 'witch_action',
                    heal: witchDraft.heal,
                    poisonTargetId: witchDraft.poisonTargetId,
                  })
                }
              >
                {witchDraft.heal || witchDraft.poisonTargetId ? 'ยืนยันการใช้ยา' : 'ข้ามคืนนี้'}
              </button>
            </div>
          </>
        );
      }
    }

    if (room.phase === 'day_discuss') {
      const aliveHumans = gamePlayers.filter((p) => p.alive && !p.isBot).length;
      const readyCount = room.dayReadyIds?.length || 0;
      const amReady = room.dayReadyIds?.includes(me.id);
      return (
        <>
          <div className="action-strip-msg">
            <Sun size={18} color="var(--brass)" />
            <span>ช่วงสนทนาหน้าโต๊ะ — พูดคุยและถกเถียงกันได้เลย กดพร้อมโหวตเมื่อทุกคนพร้อม</span>
          </div>
          <div className="action-strip-btns">
            {isHost ? (
              <>
                <button type="button" className="btn btn-sm btn-surface" onClick={() => onModControl('extend_time', 30)}>
                  <Clock size={15} />
                  +30 วิ
                </button>
                <button type="button" className="btn btn-sm btn-crimson" onClick={() => onModControl('start_vote_now')}>
                  <Vote size={15} />
                  เริ่มโหวตเลย
                </button>
              </>
            ) : null}
            <button
              type="button"
              className={`btn btn-sm ${amReady ? 'btn-sage' : 'btn-brass'}`}
              onClick={onDayReady}
            >
              <SkipForward size={15} />
              {amReady ? `พร้อมโหวตแล้ว (${readyCount}/${aliveHumans})` : `พร้อมโหวต (${readyCount}/${aliveHumans})`}
            </button>
          </div>
        </>
      );
    }

    if (room.phase === 'day_vote') {
      const confirmedVote = room.dayVotes?.[me.id];
      const draftPlayer = draftVoteId ? gamePlayers.find((p) => p.id === draftVoteId) : null;
      const confirmedPlayer = confirmedVote && confirmedVote !== 'skip'
        ? gamePlayers.find((p) => p.id === confirmedVote)
        : null;
      const totalVoted = Object.keys(room.dayVotes || {}).length;

      const msg = draftPlayer
        ? `เลือก #${padSeat(draftPlayer.seatNumber)} ${draftPlayer.name} — กดปุ่มยืนยันเพื่อส่งคะแนนโหวต`
        : confirmedVote === 'skip'
        ? `คุณยืนยันงดออกเสียงแล้ว (โหวตแล้ว ${totalVoted}/${aliveCount} คน)`
        : confirmedPlayer
        ? `คุณยืนยันโหวต #${padSeat(confirmedPlayer.seatNumber)} ${confirmedPlayer.name} แล้ว (โหวตแล้ว ${totalVoted}/${aliveCount} คน)`
        : `แตะเลือกผู้ต้องสงสัยด้านล่างแล้วกดยืนยันโหวต (โหวตแล้ว ${totalVoted}/${aliveCount} คน)`;

      return (
        <>
          <div className="action-strip-msg">
            <Vote size={18} color="var(--brass)" />
            <span>{msg}</span>
          </div>
          <div className="action-strip-btns">
            {draftPlayer ? (
              <button
                type="button"
                className="btn btn-sm btn-crimson"
                onClick={() => {
                  onDayVote(draftPlayer.id);
                  setDraftVoteId(null);
                }}
              >
                <Check size={15} />
                ยืนยันโหวต #{padSeat(draftPlayer.seatNumber)} {draftPlayer.name}
              </button>
            ) : null}
            <button
              type="button"
              className={`btn btn-sm ${confirmedVote === 'skip' ? 'btn-brass' : 'btn-surface'}`}
              onClick={() => {
                setDraftVoteId(null);
                onDayVote('skip');
              }}
            >
              {confirmedVote === 'skip' ? 'งดออกเสียงแล้ว' : 'งดออกเสียง (Skip)'}
            </button>
          </div>
        </>
      );
    }

    if (room.phase === 'hunter_revenge') {
      const hunter = gamePlayers.find((p) => p.id === room.activeHunterId);
      return (
        <div className="action-strip-msg">
          <Crosshair size={18} color="var(--crimson)" />
          <span>
            {room.activeHunterId === me.id
              ? 'คุณคือนักล่าที่เพิ่งเสียชีวิต แตะเลือกผู้เล่น 1 คนเพื่อยิงตามไปทันที'
              : `นักล่า "${hunter?.name || ''}" กำลังเล็งปืนนัดสุดท้าย...`}
          </span>
        </div>
      );
    }

    return null;
  };

  // Dramatic Overlay for Role Reveal (Tap to Peek!), Dawn, Game Over
  const renderOverlay = () => {
    if (room.phase === 'role_reveal' && !isMod && myRoleObj) {
      const isWolf = myRoleObj.team === 'werewolf';
      return (
        <div className="overlay-backdrop">
          <div className="panel overlay-card">
            {!rolePeekedOverlay ? (
              <>
                <div className="overlay-emblem" style={{ color: 'var(--brass)' }}>
                  <Eye size={30} />
                </div>
                <h2 className="overlay-heading">การ์ดบทบาทส่วนตัวของคุณ</h2>
                <p className="overlay-copy" style={{ marginBottom: 20 }}>
                  ระวังคนข้างๆ แอบดูหน้าจอ แตะปุ่มด้านล่างเมื่อพร้อมเปิดดูบทบาทลับ
                </p>
                <button
                  type="button"
                  className="btn btn-brass btn-lg btn-full"
                  onClick={() => setRolePeekedOverlay(true)}
                >
                  <Eye size={18} />
                  แตะเพื่อเปิดดูบทบาท
                </button>
              </>
            ) : (
              <>
                {getRoleImage(myRoleObj.id) ? (
                  <div className="role-reveal-art">
                    <img src={getRoleImage(myRoleObj.id)} alt={myRoleObj.nameTh} />
                  </div>
                ) : (
                  <div className="overlay-emblem" style={{ color: myRoleObj.color || 'var(--brass)' }}>
                    <RoleIcon roleId={myRoleObj.id} size={32} />
                  </div>
                )}
                <div className="muted" style={{ fontSize: '0.88rem', marginBottom: 4 }}>บทบาทของคุณคือ</div>
                <h2 className="overlay-heading" style={{ color: myRoleObj.color || 'var(--ink)' }}>
                  {myRoleObj.nameTh} ({myRoleObj.nameEn})
                </h2>
                <div style={{ marginBottom: 14 }}>
                  <span className={`tag-pill ${isWolf ? 'crimson' : 'sage'}`}>
                    {isWolf ? 'ฝ่ายหมาป่า' : 'ฝ่ายชาวบ้าน'}
                  </span>
                </div>
                <p className="overlay-copy" style={{ marginBottom: 18 }}>{myRoleObj.description}</p>
                <button
                  type="button"
                  className="btn btn-surface btn-full"
                  onClick={() => setRolePeekedOverlay(false)}
                >
                  <EyeOff size={16} />
                  ซ่อนการ์ดกลับ (ป้องกันคนแอบดู)
                </button>
              </>
            )}
          </div>
        </div>
      );
    }

    if (room.phase === 'dawn' && room.lastDawnSummary) {
      const deaths = room.lastDawnSummary.deaths || [];
      return (
        <div className="overlay-backdrop">
          <div className="panel overlay-card">
            <div className="overlay-emblem" style={{ color: deaths.length ? 'var(--crimson)' : 'var(--brass)' }}>
              {deaths.length ? <Skull size={32} /> : <Sunrise size={32} />}
            </div>
            <h2 className="overlay-heading">
              {deaths.length === 0
                ? `เช้าวันที่ ${room.lastDawnSummary.dayNumber} ที่สงบสุข`
                : `เช้าวันที่ ${room.lastDawnSummary.dayNumber} — พบผู้เสียชีวิต`}
            </h2>
            {deaths.length === 0 ? (
              <p className="overlay-copy">เมื่อคืนที่ผ่านมาไม่มีใครเสียชีวิต ทุกคนลืมตาและเริ่มพูดคุยได้เลย</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '14px 0', alignItems: 'center' }}>
                  {deaths.map((d) => (
                    <div key={d.playerId} className="dawn-victim-row">
                      <span className="seat-avatar-badge">
                        <PlayerAvatar avatarId={d.avatar} size={17} />
                      </span>
                      <span>{d.name}</span>
                    </div>
                  ))}
                </div>
                <p className="overlay-copy">ทุกคนลืมตาและเริ่มถกเถียงเพื่อหาตัวหมาป่า</p>
              </>
            )}
          </div>
        </div>
      );
    }

    if (room.phase === 'game_over' && !dismissedGameOver) {
      const isVillage = room.winner === 'village';
      return (
        <div className="overlay-backdrop">
          <div className="panel overlay-card">
            <div className="overlay-emblem" style={{ color: isVillage ? 'var(--sage)' : 'var(--crimson)' }}>
              {isVillage ? <Trophy size={32} /> : <Flame size={32} />}
            </div>
            <h2 className="overlay-heading" style={{ color: isVillage ? '#7ee3b8' : '#f49b9b' }}>
              {isVillage ? 'ฝ่ายชาวบ้านเป็นฝ่ายชนะ' : 'ฝ่ายหมาป่าเป็นฝ่ายชนะ'}
            </h2>
            <p className="overlay-copy" style={{ marginBottom: 22 }}>
              {isVillage
                ? 'หมาป่าทั้งหมดถูกกำจัดออกจากหมู่บ้านแล้ว ความสงบสุขกลับคืนมา'
                : 'ฝูงหมาป่ากลืนกินหมู่บ้านได้สำเร็จ'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-surface" onClick={() => setDismissedGameOver(true)}>
                ดูบทบาททั้งหมด
              </button>
              {isHost ? (
                <button type="button" className="btn btn-crimson" onClick={onPlayAgain}>
                  <RotateCcw size={16} />
                  เล่นอีกครั้ง
                </button>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const phaseInfo = getPhaseInfo(room);
  const PhaseIcon = phaseInfo.Icon;
  const wolfMates =
    me?.role === 'werewolf' ? gamePlayers.filter((p) => p.role === 'werewolf' && p.id !== me.id) : [];

  return (
    <section className="game-shell">
      {/* Top HUD */}
      <header className="panel game-hud">
        <div className="hud-phase">
          <div className="hud-phase-badge">
            <PhaseIcon size={20} strokeWidth={1.75} />
          </div>
          <div>
            <div className="hud-title">{phaseInfo.title}</div>
            <div className="hud-sub tabular">
              {phaseInfo.sub} • รอดชีวิต {aliveCount}/{gamePlayers.length} คน
            </div>
          </div>
        </div>

        <PhaseTimer
          phase={room.phase}
          phaseEndsAt={room.phaseEndsAt}
          timerOffsetMs={timerOffsetMs}
          settings={room.settings}
        />

        <div className="hud-controls">
          <span className="room-chip">
            ห้อง <strong>{room.code}</strong>
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleMute}
            title={muted ? 'เปิดเสียง' : 'ปิดเสียง'}
            aria-label={muted ? 'เปิดเสียง' : 'ปิดเสียง'}
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <button type="button" className="icon-btn" onClick={onOpenRules} title="คู่มือบทบาท" aria-label="คู่มือบทบาท">
            <BookOpen size={17} />
          </button>
          <button type="button" className="btn btn-sm btn-danger-outline" onClick={onLeave}>
            <LogOut size={15} />
            ออก
          </button>
        </div>
      </header>

      {renderModeratorControlBar()}

      {/* Main Layout */}
      <div className="game-grid">
        <div className="stage-col">
          {showSleepingScreen ? (
            /* Zero-leakage Night Sleeping Screen */
            <div className="panel sleep-stage">
              <div className="sleep-moon">
                <Moon size={36} strokeWidth={1.5} />
              </div>
              <h2 className="display-font" style={{ fontSize: '2rem', fontWeight: 700 }}>
                คืนที่ {room.dayNumber} — ทุกคนหลับตา
              </h2>
              <p className="muted" style={{ maxWidth: '42ch', lineHeight: 1.65 }}>
                ระบบกำลังเรียกบทบาทตามลำดับอย่างเงียบเชียบ กรุณางดพูดคุยและหลับตาไว้
              </p>
              <div className="sleep-hint">
                <Vibrate size={16} />
                <span>หากถึงตาบทบาทของคุณ โทรศัพท์จะสั่นเตือนและเปิดหน้าคำสั่งส่วนตัวให้ทันที</span>
              </div>
            </div>
          ) : (
            <>
              {!isMod ? <div className="panel action-strip">{renderActionStrip()}</div> : null}

              <div className="seats-grid">
                {gamePlayers.map((p) => {
                  const targetable = canTarget(p);
                  const isSelected =
                    (room.phase === 'day_vote' && (draftVoteId === p.id || room.dayVotes?.[me?.id] === p.id)) ||
                    (room.phase === 'night' &&
                      me?.role === 'werewolf' &&
                      room.privateData?.wolfVotes?.[me.id] === p.id) ||
                    (room.phase === 'night' &&
                      me?.role === 'doctor' &&
                      room.privateData?.doctorChoiceTonight === p.id) ||
                    (room.phase === 'night' && witchDraft.poisonTargetId === p.id);

                  const roleInfo = p.role ? catalog[p.role] || FALLBACK_ROLES[p.role] : null;
                  const seerKnown = room.privateData?.seerResults?.[p.id];
                  const isDocBlocked =
                    room.phase === 'night' &&
                    me?.role === 'doctor' &&
                    room.privateData?.doctorLastProtected === p.id;
                  const modDone = room.privateData?.modNightStatus?.doneIds?.includes(p.id);

                  const causeLabel = {
                    werewolf: 'ถูกหมาป่าล่า',
                    poison: 'ถูกวางยาพิษ',
                    vote: 'ถูกโหวตออก',
                    hunter: 'ถูกนักล่ายิง',
                  }[p.deathCause];

                  return (
                    <div
                      key={p.id}
                      role={targetable ? 'button' : undefined}
                      tabIndex={targetable ? 0 : undefined}
                      className={[
                        'seat-card',
                        p.id === room.myId ? 'is-me' : '',
                        !p.alive ? 'dead' : '',
                        targetable ? 'targetable' : '',
                        isSelected ? 'selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => handleSeatClick(p)}
                      onKeyDown={(e) => {
                        if (targetable && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleSeatClick(p);
                        }
                      }}
                    >
                      <span className="seat-number-tag tabular">#{padSeat(p.seatNumber)}</span>

                      {voteCounts[p.id] ? (
                        <span className="seat-counter tabular">
                          <Vote size={12} />
                          {voteCounts[p.id]}
                        </span>
                      ) : null}

                      {wolfCounts[p.id] ? (
                        <span className="seat-wolf-counter tabular">
                          <WolfCrestIcon size={12} />
                          {wolfCounts[p.id]}
                        </span>
                      ) : null}

                      <div className="seat-figure">
                        <PlayerAvatar avatarId={p.avatar} size={24} />
                        {!p.alive ? (
                          <div className="seat-dead-mark" aria-label="เสียชีวิตแล้ว">
                            <Skull size={22} />
                          </div>
                        ) : null}
                      </div>

                      <div className="seat-card-name">{p.name}</div>

                      {room.phase === 'day_vote' && draftVoteId === p.id && targetable ? (
                        <button
                          type="button"
                          className="btn btn-xs btn-crimson"
                          style={{ marginTop: 2 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDayVote(p.id);
                            setDraftVoteId(null);
                          }}
                        >
                          <Check size={13} />
                          ยืนยันโหวต
                        </button>
                      ) : null}

                      <div className="seat-card-badges">
                        {p.id === room.myId ? <span className="tag-pill brass">คุณ</span> : null}
                        {p.isBot ? <span className="tag-pill">AI</span> : null}
                        {modDone ? <span className="tag-pill sage">ทำคำสั่งแล้ว</span> : null}
                        {roleInfo ? (
                          <span className={`tag-pill ${roleInfo.team === 'werewolf' ? 'crimson' : 'sage'}`}>
                            <RoleIcon roleId={roleInfo.id} size={11} />
                            {roleInfo.nameTh}
                          </span>
                        ) : null}
                        {seerKnown ? (
                          <span className={`tag-pill ${seerKnown === 'werewolf' ? 'crimson' : 'sage'}`}>
                            <Eye size={11} />
                            {seerKnown === 'werewolf' ? 'หมาป่า' : 'ชาวบ้าน'}
                          </span>
                        ) : null}
                        {isDocBlocked ? (
                          <span className="tag-pill">
                            <ShieldAlert size={11} />
                            เพิ่งปกป้อง
                          </span>
                        ) : null}
                        {!p.alive && causeLabel ? <span className="tag-pill">{causeLabel}</span> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right Rail: Privacy Role Card + Comms/Chronicle */}
        <aside className="rail-col">
          {!isMod ? (
            <div className="panel secret-card">
              <div className="secret-card-head">
                <span className="secret-card-title">การ์ดบทบาทส่วนตัว</span>
                <button
                  type="button"
                  className="btn btn-xs btn-surface"
                  onClick={() => setHideRole((v) => !v)}
                >
                  {hideRole ? <Eye size={14} /> : <EyeOff size={14} />}
                  {hideRole ? 'แตะดูบทบาท' : 'ซ่อน'}
                </button>
              </div>

              {!hideRole && myRoleObj ? (
                <>
                  {getRoleImage(myRoleObj.id) ? (
                    <div className="secret-role-art">
                      <img src={getRoleImage(myRoleObj.id)} alt={myRoleObj.nameTh} />
                    </div>
                  ) : null}
                  <div className="secret-role-row">
                    <div className="secret-emblem" style={{ color: myRoleObj.color || 'var(--brass)' }}>
                      <RoleIcon roleId={myRoleObj.id} size={24} />
                    </div>
                    <div>
                      <div className="secret-name">{myRoleObj.nameTh}</div>
                      <div className="secret-en">{myRoleObj.nameEn}</div>
                      <span
                        className={`tag-pill ${myRoleObj.team === 'werewolf' ? 'crimson' : 'sage'}`}
                        style={{ marginTop: 4 }}
                      >
                        {myRoleObj.team === 'werewolf' ? 'ฝ่ายหมาป่า' : 'ฝ่ายชาวบ้าน'}
                      </span>
                    </div>
                  </div>
                  <p className="secret-desc">{myRoleObj.description}</p>

                  <div className="secret-meta-row">
                    {!me?.alive ? <span className="tag-pill">เสียชีวิตแล้ว</span> : null}
                    {me?.role === 'witch' && room.privateData?.witchState ? (
                      <>
                        <span className={`tag-pill ${room.privateData.witchState.hasHeal ? 'sage' : ''}`}>
                          ยาชุบชีวิต: {room.privateData.witchState.hasHeal ? 'เหลือ 1' : 'ใช้แล้ว'}
                        </span>
                        <span className={`tag-pill ${room.privateData.witchState.hasPoison ? 'crimson' : ''}`}>
                          ยาพิษ: {room.privateData.witchState.hasPoison ? 'เหลือ 1' : 'ใช้แล้ว'}
                        </span>
                      </>
                    ) : null}
                    {wolfMates.length > 0 ? (
                      <span className="tag-pill crimson">
                        เพื่อนร่วมฝูง: {wolfMates.map((m) => m.name).join(', ')}
                      </span>
                    ) : null}
                  </div>
                </>
              ) : (
                <p className="subtle" style={{ fontSize: '0.85rem' }}>
                  ซ่อนบทบาทไว้เพื่อป้องกันคนข้างๆ แอบมองหน้าจอ แตะ "แตะดูบทบาท" เมื่อต้องการตรวจสอบ
                </p>
              )}
            </div>
          ) : null}

          <div className="panel chat-box">
            <div className="chat-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={resolvedChannel === 'village'}
                className={`chat-tab ${resolvedChannel === 'village' ? 'active' : ''}`}
                onClick={() => setActiveChannel('village')}
              >
                <MessageSquare size={14} />
                หมู่บ้าน
              </button>
              {canSeeWolf ? (
                <button
                  type="button"
                  role="tab"
                  aria-selected={resolvedChannel === 'wolf'}
                  className={`chat-tab ${resolvedChannel === 'wolf' ? 'active' : ''}`}
                  onClick={() => setActiveChannel('wolf')}
                >
                  <Flame size={14} />
                  หมาป่า
                </button>
              ) : null}
              {canSeeGhost ? (
                <button
                  type="button"
                  role="tab"
                  aria-selected={resolvedChannel === 'ghost'}
                  className={`chat-tab ${resolvedChannel === 'ghost' ? 'active' : ''}`}
                  onClick={() => setActiveChannel('ghost')}
                >
                  <Ghost size={14} />
                  วิญญาณ
                </button>
              ) : null}
              <button
                type="button"
                role="tab"
                aria-selected={resolvedChannel === 'log'}
                className={`chat-tab ${resolvedChannel === 'log' ? 'active' : ''}`}
                onClick={() => setActiveChannel('log')}
              >
                <ScrollText size={14} />
                บันทึก
              </button>
            </div>

            <div className="chat-feed">
              {resolvedChannel === 'log' ? (
                (room.logs || []).map((entry) => (
                  <div className="chat-bubble log" key={entry.id}>
                    {entry.text}
                  </div>
                ))
              ) : (room.chat?.[resolvedChannel] || []).length === 0 ? (
                <div className="subtle" style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem' }}>
                  ยังไม่มีข้อความในช่องนี้
                </div>
              ) : (
                (room.chat?.[resolvedChannel] || []).map((m) => (
                  <div
                    className={`chat-bubble ${resolvedChannel === 'wolf' ? 'wolf' : resolvedChannel === 'ghost' ? 'ghost' : ''}`}
                    key={m.id}
                  >
                    <span className="chat-author">
                      <PlayerAvatar avatarId={m.senderAvatar} size={13} className="chat-author-icon" />
                      {m.senderName}:
                    </span>
                    <span>{m.text}</span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form className="chat-composer" onSubmit={submitChat}>
              <input
                type="text"
                className="text-input"
                maxLength={220}
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                disabled={chatDisabled}
                placeholder={chatPlaceholder}
                autoComplete="off"
              />
              <button type="submit" className="btn btn-sm btn-crimson" disabled={chatDisabled || !chatText.trim()}>
                <Send size={15} />
              </button>
            </form>
          </div>
        </aside>
      </div>

      {renderOverlay()}
    </section>
  );
}
