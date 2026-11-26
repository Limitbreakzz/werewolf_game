import React from 'react';
import {
  Eye,
  Shield,
  FlaskConical,
  Crosshair,
  User,
  HelpCircle,
  Moon,
  Crown,
  Swords,
  Feather,
  Compass,
  KeyRound,
  Gem,
  ScrollText,
  Anchor,
  Sparkles,
  Bell,
  BookOpen,
  Trees,
  Flame,
  Hourglass,
  Landmark,
} from 'lucide-react';

export const ROLE_ORDER = ['werewolf', 'seer', 'doctor', 'witch', 'hunter', 'villager'];

export const FALLBACK_ROLES = {
  werewolf: {
    id: 'werewolf',
    nameTh: 'หมาป่า',
    nameEn: 'Werewolf',
    team: 'werewolf',
    color: '#C83232',
    description: 'ทุกคืนร่วมกับฝูงหมาป่าเลือกเหยื่อ 1 คนเพื่อกำจัด และแฝงตัวในหมู่บ้านตอนกลางวัน',
  },
  villager: {
    id: 'villager',
    nameTh: 'ชาวบ้าน',
    nameEn: 'Villager',
    team: 'village',
    color: '#A5A095',
    description: 'ไม่มีพลังพิเศษตอนกลางคืน ใช้การสังเกต คำพูด และตรรกะเพื่อจับผิดหมาป่าตอนกลางวัน',
  },
  seer: {
    id: 'seer',
    nameTh: 'เทพพยากรณ์',
    nameEn: 'Seer',
    team: 'village',
    color: '#A87CE8',
    description: 'ทุกคืนเลือกส่องผู้เล่น 1 คน เพื่อรู้ความจริงว่าเป็นฝ่ายหมาป่าหรือฝ่ายชาวบ้าน',
  },
  doctor: {
    id: 'doctor',
    nameTh: 'หมอ / บอดี้การ์ด',
    nameEn: 'Doctor',
    team: 'village',
    color: '#4DA6D6',
    description: 'ทุกคืนเลือกปกป้องผู้เล่น 1 คนจากการโจมตีของหมาป่า (ห้ามปกป้องคนเดิม 2 คืนติดกัน)',
  },
  witch: {
    id: 'witch',
    nameTh: 'แม่มด',
    nameEn: 'Witch',
    team: 'village',
    color: '#2E9E72',
    description: 'มียาชุบชีวิต 1 ขวด (ช่วยเหยื่อหมาป่า) และยาพิษ 1 ขวด (กำจัดผู้เล่น 1 คน) ใช้ได้ขวดละครั้งต่อเกม',
  },
  hunter: {
    id: 'hunter',
    nameTh: 'นักล่า',
    nameEn: 'Hunter',
    team: 'village',
    color: '#D6A354',
    description: 'หากถูกกำจัดไม่ว่ากลางวันหรือกลางคืน สามารถเลือกยิงผู้เล่น 1 คนให้ตายตามไปได้ทันที',
  },
};

export const AVATAR_CRESTS = [
  { id: 'moon', label: 'จันทร์เสี้ยว', Icon: Moon },
  { id: 'crown', label: 'มงกุฎ', Icon: Crown },
  { id: 'swords', label: 'ดาบไขว้', Icon: Swords },
  { id: 'shield', label: 'โล่เกียรติยศ', Icon: Shield },
  { id: 'feather', label: 'ขนนก', Icon: Feather },
  { id: 'compass', label: 'เข็มทิศ', Icon: Compass },
  { id: 'key', label: 'กุญแจโบราณ', Icon: KeyRound },
  { id: 'gem', label: 'อัญมณี', Icon: Gem },
  { id: 'scroll', label: 'ม้วนคัมภีร์', Icon: ScrollText },
  { id: 'anchor', label: 'สมอเรือ', Icon: Anchor },
  { id: 'sparkles', label: 'ดวงดาว', Icon: Sparkles },
  { id: 'bell', label: 'ระฆังหอคอย', Icon: Bell },
  { id: 'book', label: 'ตำรา', Icon: BookOpen },
  { id: 'trees', label: 'ไพรสน', Icon: Trees },
  { id: 'hourglass', label: 'นาฬิกาทราย', Icon: Hourglass },
  { id: 'landmark', label: 'หอคอยหมู่บ้าน', Icon: Landmark },
];

export const AVATARS = AVATAR_CRESTS.map((c) => c.id);

const AVATAR_MAP = Object.fromEntries(AVATAR_CRESTS.map((c) => [c.id, c.Icon]));

export function PlayerAvatar({ avatarId, size = 18, strokeWidth = 1.75, className = '' }) {
  if (typeof avatarId === 'string' && avatarId.startsWith('data:image/')) {
    return <img src={avatarId} alt="" className={`avatar-photo ${className}`} />;
  }
  const Icon = AVATAR_MAP[avatarId] || User;
  return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}

// Geometric 24x24 Wolf Crest SVG matching Lucide's exact 1.75px stroke language
export function WolfCrestIcon({ size = 20, strokeWidth = 1.75, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 4l3 5 4-1.5L16 9l3-5 1 8-3 5-5 4-5-4-3-5 1-8z" />
      <path d="M9.5 13h.01" />
      <path d="M14.5 13h.01" />
      <path d="M10.5 16.5L12 18l1.5-1.5" />
    </svg>
  );
}

export function RoleIcon({ roleId, size = 20, strokeWidth = 1.75, className = '' }) {
  const props = { size, strokeWidth, className, 'aria-hidden': true };
  switch (roleId) {
    case 'werewolf':
      return <WolfCrestIcon size={size} strokeWidth={strokeWidth} className={className} />;
    case 'seer':
      return <Eye {...props} />;
    case 'doctor':
      return <Shield {...props} />;
    case 'witch':
      return <FlaskConical {...props} />;
    case 'hunter':
      return <Crosshair {...props} />;
    case 'villager':
      return <User {...props} />;
    default:
      return <HelpCircle {...props} />;
  }
}

export { Flame };
