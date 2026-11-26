import React from 'react';
import {
  Flame,
  Eye,
  Shield,
  FlaskConical,
  Crosshair,
  User,
  HelpCircle,
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

export const AVATARS = [
  '🦊', '🦉', '🐱', '🦅', '🐰', '🐻', '🐼', '🦁',
  '🦋', '🐉', '🐨', '🐯', '🦄', '🐧', '🦈', '🦝',
];

export function RoleIcon({ roleId, size = 20, strokeWidth = 1.75, className = '' }) {
  const props = { size, strokeWidth, className, 'aria-hidden': true };
  switch (roleId) {
    case 'werewolf':
      return <Flame {...props} />;
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
