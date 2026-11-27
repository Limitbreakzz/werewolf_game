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
  Award,
  Skull,
  Wand2,
  UserX,
  PawPrint,
  Heart,
  Wine,
  Search,
  Zap,
  Ghost,
  Users,
  Copy,
  ShieldPlus,
  Biohazard,
  Bomb,
  Brain,
  Target,
  Sun,
  Hand,
  MessageSquareOff,
  Frown,
  Droplets,
  FlameKindling,
  VenetianMask,
} from 'lucide-react';

export const ROLE_ORDER = [
  // Werewolf team
  'werewolf',
  'lone_wolf',
  'wolf_cub',
  'alpha_wolf',
  'minion',
  'sorcerer',
  'hoodlum',
  'cursed',
  // Core Village roles
  'seer',
  'doctor',
  'witch',
  'hunter',
  'mayor',
  'lycan',
  'villager',
  // Extended Village roles
  'spellcaster',
  'cupid',
  'aura_seer',
  'drunk',
  'prince',
  'priest',
  'pi',
  'troublemaker',
  'old_hag',
  'apprentice_seer',
  'disease',
  'pacifist',
  'ghost',
  'mason',
  'doppelganger',
  'tough_guy',
  'villager_idiot',
  // Independent
  'tanner',
  'vampire',
  'cult_leader',
  // Expansion Hunting Party
  'revealer',
  'mentalist',
  'huntress',
  'mad_bomber',
  'mystic_seer',
];

export const ROLE_CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด (40)' },
  { id: 'village', label: 'ฝ่ายชาวบ้าน' },
  { id: 'werewolf', label: 'ฝ่ายหมาป่า' },
  { id: 'independent', label: 'ฝ่ายอิสระ' },
  { id: 'expansion', label: 'ภาคเสริม' },
];

export function isPackWolf(roleId) {
  return (
    roleId === 'werewolf' ||
    roleId === 'wolf_cub' ||
    roleId === 'lone_wolf' ||
    roleId === 'alpha_wolf'
  );
}

const ILLUSTRATED_ROLES = new Set([
  'werewolf',
  'lone_wolf',
  'wolf_cub',
  'alpha_wolf',
  'minion',
  'sorcerer',
  'hoodlum',
  'cursed',
  'seer',
  'spellcaster',
  'cupid',
  'doctor',
  'aura_seer',
  'drunk',
  'prince',
  'priest',
  'pi',
  'troublemaker',
  'witch',
  'old_hag',
  'apprentice_seer',
  'mayor',
  'hunter',
  'disease',
  'pacifist',
  'ghost',
  'lycan',
  'villager',
  'tanner',
  'vampire',
  'cult_leader',
  'revealer',
  'mentalist',
  'huntress',
  'mad_bomber',
  'mystic_seer',
]);

export const FALLBACK_ROLES = {
  werewolf: {
    id: 'werewolf',
    nameTh: 'มนุษย์หมาป่า',
    nameEn: 'Werewolf',
    team: 'werewolf',
    category: 'werewolf',
    color: '#C83232',
    shortDesc: 'ตื่นร่วมกับฝูงหมาป่าทุกคืนเพื่อเลือกเหยื่อ 1 คน',
    description: 'ทุกคืนตื่นขึ้นมาพร้อมกับฝูงมนุษย์หมาป่าเพื่อเลือกกำจัดผู้เล่น 1 คน และแฝงตัวในหมู่บ้านตอนกลางวัน',
  },
  lone_wolf: {
    id: 'lone_wolf',
    nameTh: 'มนุษย์หมาป่าเดียวดาย',
    nameEn: 'Lone Wolf',
    team: 'werewolf',
    category: 'werewolf',
    color: '#B91C1C',
    shortDesc: 'ตื่นกับฝูงหมาป่า แต่ชนะเฉพาะเมื่อรอดคนสุดท้ายคนเดียว',
    description: 'ตื่นพร้อมกับฝูงมนุษย์หมาป่าทุกคืน แต่เงื่อนไขชนะคือต้องเหลือรอดเป็นคนสุดท้ายเพียงคนเดียวเท่านั้น',
  },
  wolf_cub: {
    id: 'wolf_cub',
    nameTh: 'ลูกมนุษย์หมาป่า',
    nameEn: 'Wolf Cub',
    team: 'werewolf',
    category: 'werewolf',
    color: '#D94646',
    shortDesc: 'หากตาย คืนถัดไปฝูงหมาป่าล่าได้ 2 คน',
    description: 'ตื่นพร้อมฝูงมนุษย์หมาป่าทุกคืน หากลูกมนุษย์หมาป่าถูกกำจัด คืนถัดไปฝูงหมาป่าจะล่าได้ 2 คน',
  },
  minion: {
    id: 'minion',
    nameTh: 'สมุนรับใช้',
    nameEn: 'Minion',
    team: 'werewolf',
    category: 'werewolf',
    color: '#B84A4A',
    shortDesc: 'รู้ตัวหมาป่าแต่ไม่ตื่นล่า ส่องเห็นเป็นคนดี',
    description: 'อยู่ฝ่ายมนุษย์หมาป่า รู้ว่าใครคือหมาป่าตั้งแต่เริ่มเกมแต่ไม่ตื่นล่าตอนกลางคืน (เทพพยากรณ์ส่องเห็นเป็นคนดี)',
  },
  sorcerer: {
    id: 'sorcerer',
    nameTh: 'นางปีศาจ',
    nameEn: 'Sorcerer',
    team: 'werewolf',
    category: 'werewolf',
    color: '#9333EA',
    shortDesc: 'ส่องหาว่าใครคือเทพพยากรณ์ทุกคืน (ฝ่ายหมาป่า)',
    description: 'อยู่ฝ่ายมนุษย์หมาป่า ทุกคืนส่องผู้เล่น 1 คนเพื่อหาว่าใครคือเทพพยากรณ์ (เทพพยากรณ์ส่องเห็นเป็นคนดี)',
  },
  hoodlum: {
    id: 'hoodlum',
    nameTh: 'อันธพาล',
    nameEn: 'Hoodlum',
    team: 'werewolf',
    category: 'werewolf',
    color: '#991B1B',
    shortDesc: 'คืนแรกเลือก 2 คน ชนะหากรอดจนจบและ 2 คนนั้นตายแล้ว',
    description: 'ในคืนแรกเลือกผู้เล่น 2 คนเป็นเป้าหมาย ชนะเมื่อรอดชีวิตจนจบเกมและเป้าหมายทั้ง 2 คนถูกกำจัดแล้ว',
  },
  cursed: {
    id: 'cursed',
    nameTh: 'ผู้ต้องคำสาป',
    nameEn: 'Cursed',
    team: 'village',
    category: 'werewolf',
    color: '#7F1D1D',
    shortDesc: 'เริ่มเป็นชาวบ้าน แต่ถ้าถูกหมาป่าฆ่าจะกลายเป็นหมาป่าแทน',
    description: 'เริ่มเกมอยู่ฝ่ายชาวบ้าน แต่หากถูกมนุษย์หมาป่าเลือกกำจัดตอนกลางคืนจะไม่ตายและกลายเป็นมนุษย์หมาป่าแทน',
  },
  villager: {
    id: 'villager',
    nameTh: 'ชาวบ้าน',
    nameEn: 'Villager',
    team: 'village',
    category: 'village',
    color: '#A5A095',
    shortDesc: 'ไม่มีพลังกลางคืน ช่วยจับผิดและโหวตหมาป่า',
    description: 'ไม่มีพลังพิเศษตอนกลางคืน ใช้การสังเกต คำพูด และตรรกะเพื่อจับผิดมนุษย์หมาป่าตอนกลางวัน',
  },
  seer: {
    id: 'seer',
    nameTh: 'เทพพยากรณ์',
    nameEn: 'Seer',
    team: 'village',
    category: 'village',
    color: '#A87CE8',
    shortDesc: 'ส่องผู้เล่นคืนละ 1 คน รู้ว่าเป็นคนดีหรือคนไม่ดี',
    description: 'ทุกคืนเลือกตรวจสอบผู้เล่น 1 คน เพื่อรู้ความจริงว่าเป็นคนดีหรือคนไม่ดี (มนุษย์หมาป่า)',
  },
  spellcaster: {
    id: 'spellcaster',
    nameTh: 'จอมเวท',
    nameEn: 'Spellcaster',
    team: 'village',
    category: 'village',
    color: '#6366F1',
    shortDesc: 'กลางคืนใบ้ผู้เล่น 1 คน ห้ามพูด/แชทในวันถัดไป',
    description: 'ในแต่ละคืนเลือกผู้เล่น 1 คนเพื่อร่ายเวทปิดปาก ห้ามพูดหรือพิมพ์แชทในวันถัดไป',
  },
  cupid: {
    id: 'cupid',
    nameTh: 'กามเทพ',
    nameEn: 'Cupid',
    team: 'village',
    category: 'village',
    color: '#EC4899',
    shortDesc: 'คืนแรกจับคู่ 2 คน หากคนหนึ่งตาย อีกคนตายตาม',
    description: 'ในคืนแรกเลือกผู้เล่น 2 คนให้เป็นคู่รัก หากคนใดคนหนึ่งเสียชีวิต อีกคนจะตายตามทันที',
  },
  doctor: {
    id: 'doctor',
    nameTh: 'บอดี้การ์ด',
    nameEn: 'Bodyguard',
    team: 'village',
    category: 'village',
    color: '#4DA6D6',
    shortDesc: 'ปกป้องผู้เล่น 1 คนทุกคืน (ห้ามซ้ำคนเดิมติดกัน)',
    description: 'ทุกคืนเลือกปกป้องผู้เล่น 1 คนจากการโจมตีของมนุษย์หมาป่า (ห้ามเลือกตัวเองและห้ามปกป้องคนเดิม 2 คืนติดกัน)',
  },
  aura_seer: {
    id: 'aura_seer',
    nameTh: 'ญาณทิพย์',
    nameEn: 'Aura Seer',
    team: 'village',
    category: 'village',
    color: '#38BDF8',
    shortDesc: 'ส่อง 1 คนว่าเป็นบทบาทพิเศษหรือไม่',
    description: 'ในแต่ละคืนตรวจสอบผู้เล่น 1 คนว่ามีพลังพิเศษหรือไม่ (ไม่ใช่ชาวบ้านธรรมดาและไม่ใช่มนุษย์หมาป่าธรรมดา)',
  },
  drunk: {
    id: 'drunk',
    nameTh: 'ขี้เมา',
    nameEn: 'Drunk',
    team: 'village',
    category: 'village',
    color: '#D97706',
    shortDesc: 'เป็นชาวบ้านจนจบคืนที่ 3 แล้วจึงรู้บทบาทที่แท้จริง',
    description: 'เล่นเป็นชาวบ้านธรรมดาจนกระทั่งหลังคืนที่ 3 จึงจะสร่างเมาและรู้บทบาทที่แท้จริงของคุณ',
  },
  prince: {
    id: 'prince',
    nameTh: 'เจ้าชาย',
    nameEn: 'Prince',
    team: 'village',
    category: 'village',
    color: '#F59E0B',
    shortDesc: 'หากถูกโหวตประหารตอนกลางวัน เผยตัวแล้วรอดทันที',
    description: 'เมื่อถูกโหวตประหารตอนกลางวัน จะเผยบทบาทและรอดชีวิตทันที (แต่หากถูกหมาป่าฆ่าตอนกลางคืนจะตายปกติ)',
  },
  priest: {
    id: 'priest',
    nameTh: 'นักบวช',
    nameEn: 'Priest',
    team: 'village',
    category: 'village',
    color: '#FBBF24',
    shortDesc: 'คุ้มครองผู้เล่น 1 คนให้รอดตายได้ 1 ครั้ง (1 ครั้ง/เกม)',
    description: 'ในตอนกลางคืนเลือกอวยพรผู้เล่น 1 คนให้รอดพ้นจากการถูกกำจัดตอนกลางคืนได้ 1 ครั้ง (1 ครั้งต่อเกม)',
  },
  pi: {
    id: 'pi',
    nameTh: 'นักสืบเรื่องลี้ลับ',
    nameEn: 'P.I.',
    team: 'village',
    category: 'village',
    color: '#0EA5E9',
    shortDesc: 'ตรวจเป้าหมายและคนข้างๆ ซ้าย-ขวาว่ามีหมาป่าไหม (1 ครั้ง/เกม)',
    description: 'เลือกผู้เล่น 1 คนเพื่อตรวจดูว่าคนนั้นและคนข้างๆ ซ้าย-ขวามีมนุษย์หมาป่าปะปนอยู่หรือไม่ (1 ครั้งต่อเกม)',
  },
  troublemaker: {
    id: 'troublemaker',
    nameTh: 'ตัวป่วน',
    nameEn: 'Troublemaker',
    team: 'village',
    category: 'village',
    color: '#F97316',
    shortDesc: 'ป่วนหมู่บ้านให้โหวตประหารได้ 2 รอบในวันถัดไป (1 ครั้ง/เกม)',
    description: 'ในตอนกลางคืนสามารถป่วนหมู่บ้านเพื่อให้วันรุ่งขึ้นมีการโหวตประหาร 2 รอบ (ใช้ได้ 1 ครั้งต่อเกม)',
  },
  witch: {
    id: 'witch',
    nameTh: 'แม่มด',
    nameEn: 'Witch',
    team: 'village',
    category: 'village',
    color: '#2E9E72',
    shortDesc: 'มียาชุบชีวิต 1 ขวด และยาพิษ 1 ขวด',
    description: 'มียาชุบชีวิต 1 ขวด (ช่วยเหยื่อมนุษย์หมาป่า) และยาพิษ 1 ขวด (กำจัดผู้เล่น 1 คน) ใช้ได้ขวดละครั้งต่อเกม',
  },
  old_hag: {
    id: 'old_hag',
    nameTh: 'แม่หมอ',
    nameEn: 'Old Hag',
    team: 'village',
    category: 'village',
    color: '#84CC16',
    shortDesc: 'สาปผู้เล่น 1 คนให้ออกจากหมู่บ้าน 1 วัน (โหวตและถูกโหวตไม่ได้)',
    description: 'ในแต่ละคืนเลือกสาปแช่งผู้เล่น 1 คนให้ออกจากหมู่บ้าน 1 วัน โหวตไม่ได้และไม่ตกเป็นเป้าในวันนั้น',
  },
  apprentice_seer: {
    id: 'apprentice_seer',
    nameTh: 'ศิษย์เทพพยากรณ์',
    nameEn: 'Apprentice Seer',
    team: 'village',
    category: 'village',
    color: '#C084FC',
    shortDesc: 'หากเทพพยากรณ์ตาย จะสืบทอดพลังเป็นเทพพยากรณ์แทน',
    description: 'หากเทพพยากรณ์ถูกกำจัด คุณจะกลายเป็นเทพพยากรณ์และตรวจหามนุษย์หมาป่าได้ทุกคืนแทน',
  },
  mayor: {
    id: 'mayor',
    nameTh: 'นายกเทศมนตรี',
    nameEn: 'Mayor',
    team: 'village',
    category: 'village',
    color: '#E0B45A',
    shortDesc: 'คะแนนโหวตตอนกลางวันนับเป็น 2 เสียง',
    description: 'ผู้นำหมู่บ้าน คะแนนโหวตประหารในตอนกลางวันของนายกเทศมนตรีนับเป็น 2 คะแนน',
  },
  hunter: {
    id: 'hunter',
    nameTh: 'นายพราน',
    nameEn: 'Hunter',
    team: 'village',
    category: 'village',
    color: '#D6A354',
    shortDesc: 'เมื่อตาย สามารถยิงผู้เล่น 1 คนตามไปได้ทันที',
    description: 'หากถูกกำจัดไม่ว่ากลางวันหรือกลางคืน สามารถเลือกยิงผู้เล่น 1 คนให้ตายตามไปได้ทันที',
  },
  disease: {
    id: 'disease',
    nameTh: 'ผู้ป่วยติดเชื้อ',
    nameEn: 'Disease',
    team: 'village',
    category: 'village',
    color: '#10B981',
    shortDesc: 'หากถูกหมาป่าฆ่า คืนถัดไปหมาป่าจะล่าไม่ได้',
    description: 'หากคุณถูกมนุษย์หมาป่ากำจัด คืนถัดไปมนุษย์หมาป่าจะไม่สามารถออกล่าใครได้',
  },
  pacifist: {
    id: 'pacifist',
    nameTh: 'ผู้รักสันติ',
    nameEn: 'Pacifist',
    team: 'village',
    category: 'village',
    color: '#34D399',
    shortDesc: 'ต้องโหวตปล่อยตัวหรืองดออกเสียงเสมอ',
    description: 'ผู้รักความสงบ ต้องโหวตปล่อยตัว (ยกเลิกโหวต) เสมอ ห้ามโหวตประหาร',
  },
  ghost: {
    id: 'ghost',
    nameTh: 'พรายกระซิบ',
    nameEn: 'Ghost',
    team: 'village',
    category: 'village',
    color: '#94A3B8',
    shortDesc: 'ตายตั้งแต่คืนแรก ส่งคำใบ้ให้หมู่บ้านได้วันละ 1 ตัวอักษร',
    description: 'คุณจะเสียชีวิตตั้งแต่คืนแรก และสื่อสารคำใบ้กับหมู่บ้านได้วันละ 1 ตัวอักษร',
  },
  mason: {
    id: 'mason',
    nameTh: 'ภราดรแห่งเมสัน',
    nameEn: 'Mason',
    team: 'village',
    category: 'village',
    color: '#60A5FA',
    shortDesc: 'รู้จักภราดรแห่งเมสันด้วยกันตั้งแต่เริ่มเกม (ควรมี ≥ 2 คน)',
    description: 'เห็นกันเองตั้งแต่เริ่มเกมว่าใครคือภราดรแห่งเมสันคนอื่น (ควรใส่ในเกมอย่างน้อย 2 คน)',
  },
  doppelganger: {
    id: 'doppelganger',
    nameTh: 'ภูตจำแลง',
    nameEn: 'Doppelganger',
    team: 'village',
    category: 'village',
    color: '#A78BFA',
    shortDesc: 'คืนแรกเลือก 1 คน เมื่อคนนั้นตายจะสวมรอยบทบาทนั้นทันที',
    description: 'ในคืนแรกเลือกผู้เล่น 1 คน เมื่อผู้เล่นนั้นถูกกำจัด คุณจะสวมรอยเป็นบทบาทนั้นทันที',
  },
  lycan: {
    id: 'lycan',
    nameTh: 'ลูกครึ่งมนุษย์หมาป่า',
    nameEn: 'Lycan',
    team: 'village',
    category: 'village',
    color: '#8C9AB0',
    shortDesc: 'ฝ่ายชาวบ้าน แต่เทพพยากรณ์ส่องเห็นเป็นคนไม่ดี',
    description: 'อยู่ฝ่ายชาวบ้าน แต่ต้องคำสาปทำให้เทพพยากรณ์ส่องเห็นเป็นคนไม่ดี (มนุษย์หมาป่า)',
  },
  tough_guy: {
    id: 'tough_guy',
    nameTh: 'หนุ่มถึก',
    nameEn: 'Tough Guy',
    team: 'village',
    category: 'village',
    color: '#FB923C',
    shortDesc: 'ถูกหมาป่ากัดจะรอดไปอีก 1 วัน แล้วค่อยตายคืนถัดไป',
    description: 'หากถูกมนุษย์หมาป่าเลือกกำจัด จะยังไม่ตายทันที รอดไปโหวตตอนกลางวันได้ แล้วค่อยตายคืนถัดไป',
  },
  villager_idiot: {
    id: 'villager_idiot',
    nameTh: 'ไอ้ทึ่ม',
    nameEn: 'Villager Idiot',
    team: 'village',
    category: 'village',
    color: '#EAB308',
    shortDesc: 'ต้องโหวตประหารเสมอ (ห้ามงดออกเสียงหรือปล่อยตัว)',
    description: 'คุณต้องโหวตให้ผู้เล่นถูกประหารเสมอ ห้ามกดงดออกเสียงหรือยกเลิกโหวต',
  },
  tanner: {
    id: 'tanner',
    nameTh: 'ยาจก (คนคลั่ง)',
    nameEn: 'Tanner',
    team: 'independent',
    category: 'independent',
    color: '#D97742',
    shortDesc: 'ฝ่ายอิสระ ชนะคนเดียวทันทีหากถูกโหวตประหาร',
    description: 'ฝ่ายอิสระ ชนะคนเดียวทันทีหากถูกโหวตประหารตอนกลางวัน (ถ้าตายตอนกลางคืนจะแพ้)',
  },
  vampire: {
    id: 'vampire',
    nameTh: 'แวมไพร์',
    nameEn: 'Vampire',
    team: 'independent',
    category: 'independent',
    color: '#881337',
    shortDesc: 'กัดเหยื่อคืนละ 1 คน (ตายตอนเริ่มโหวต) หมาป่าฆ่าไม่ได้',
    description: 'ฝ่ายอิสระ กัดผู้เล่นคืนละ 1 คน เหยื่อจะตายเมื่อเริ่มโหวตในวันถัดไป หมาป่าฆ่าแวมไพร์ไม่ได้',
  },
  cult_leader: {
    id: 'cult_leader',
    nameTh: 'เจ้าลัทธิ',
    nameEn: 'Cult Leader',
    team: 'independent',
    category: 'independent',
    color: '#D946EF',
    shortDesc: 'ชวนผู้เล่นคืนละ 1 คนเข้าลัทธิ ชนะเมื่อทุกคนอยู่ในลัทธิ',
    description: 'ฝ่ายอิสระ ในแต่ละคืนชวนผู้เล่น 1 คนเข้าลัทธิ ชนะทันทีเมื่อผู้รอดชีวิตทุกคนอยู่ในลัทธิ',
  },
  revealer: {
    id: 'revealer',
    nameTh: 'ผู้เผยตัวตน',
    nameEn: 'Revealer',
    team: 'village',
    category: 'expansion',
    color: '#F43F5E',
    shortDesc: 'กลางคืนชี้ 1 คน ถ้าเป็นหมาป่าตายทันที ถ้าไม่ใช่ตัวเองตายแทน',
    description: 'ภาคเสริม: ชี้ผู้เล่นคืนละ 1 คน หากเป็นมนุษย์หมาป่าจะตายทันที แต่หากไม่ใช่คุณจะตายแทน',
  },
  mentalist: {
    id: 'mentalist',
    nameTh: 'นักสะกดจิต',
    nameEn: 'Mentalist',
    team: 'village',
    category: 'expansion',
    color: '#14B8A6',
    shortDesc: 'กลางคืนชี้ 2 คน ตรวจว่าอยู่ฝ่ายเดียวกันหรือไม่',
    description: 'ภาคเสริม: ในแต่ละคืนเลือกผู้เล่น 2 คนเพื่อตรวจสอบว่าอยู่ฝ่ายเดียวกันหรือไม่',
  },
  huntress: {
    id: 'huntress',
    nameTh: 'พรานหญิง',
    nameEn: 'Huntress',
    team: 'village',
    category: 'expansion',
    color: '#E11D48',
    shortDesc: 'กำจัดผู้เล่น 1 คนตอนกลางคืนได้ (1 ครั้งต่อเกม)',
    description: 'ภาคเสริม: สามารถเลือกกำจัดผู้เล่น 1 คนในช่วงกลางคืนได้ 1 ครั้งต่อเกม',
  },
  mad_bomber: {
    id: 'mad_bomber',
    nameTh: 'มือระเบิดพลีชีพ',
    nameEn: 'Mad Bomber',
    team: 'village',
    category: 'expansion',
    color: '#EA580C',
    shortDesc: 'หากตาย ผู้เล่นที่นั่งติดกันซ้าย-ขวาจะตายไปด้วย',
    description: 'ภาคเสริม: หากถูกกำจัด ผู้เล่นที่นั่งติดกันทางซ้ายและขวาจะถูกระเบิดตายตามไปด้วย',
  },
  mystic_seer: {
    id: 'mystic_seer',
    nameTh: 'เทพผู้รู้แจ้ง',
    nameEn: 'Mystic Seer',
    team: 'village',
    category: 'expansion',
    color: '#8B5CF6',
    shortDesc: 'กลางคืนส่อง 1 คน รู้บทบาทที่แท้จริงทันที',
    description: 'ภาคเสริม: ในแต่ละคืนเลือกชี้ผู้เล่น 1 คนเพื่อตรวจสอบและรู้บทบาทที่แท้จริงทันที',
  },
  alpha_wolf: {
    id: 'alpha_wolf',
    nameTh: 'มนุษย์หมาป่าจ่าฝูง',
    nameEn: 'Alpha Wolf',
    team: 'werewolf',
    category: 'expansion',
    color: '#9F1239',
    shortDesc: 'คืนหลังหมาป่าโดนโหวตออก แปลงเหยื่อเป็นหมาป่าแทนฆ่า (1 ครั้ง/เกม)',
    description: 'ภาคเสริม: คืนหลังมีมนุษย์หมาป่าถูกโหวตออก สามารถแปลงเหยื่อเป็นหมาป่าแทนการฆ่าได้ 1 ครั้งต่อเกม',
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
    case 'lone_wolf':
      return <Moon {...props} />;
    case 'wolf_cub':
      return <PawPrint {...props} />;
    case 'alpha_wolf':
      return <Crown {...props} />;
    case 'minion':
      return <UserX {...props} />;
    case 'sorcerer':
      return <Wand2 {...props} />;
    case 'hoodlum':
      return <Swords {...props} />;
    case 'cursed':
      return <FlameKindling {...props} />;
    case 'seer':
      return <Eye {...props} />;
    case 'spellcaster':
      return <MessageSquareOff {...props} />;
    case 'cupid':
      return <Heart {...props} />;
    case 'doctor':
      return <Shield {...props} />;
    case 'aura_seer':
      return <Sparkles {...props} />;
    case 'drunk':
      return <Wine {...props} />;
    case 'prince':
      return <Crown {...props} />;
    case 'priest':
      return <Sun {...props} />;
    case 'pi':
      return <Search {...props} />;
    case 'troublemaker':
      return <Zap {...props} />;
    case 'witch':
      return <FlaskConical {...props} />;
    case 'old_hag':
      return <Hand {...props} />;
    case 'apprentice_seer':
      return <Eye {...props} />;
    case 'mayor':
      return <Award {...props} />;
    case 'hunter':
      return <Crosshair {...props} />;
    case 'disease':
      return <Biohazard {...props} />;
    case 'pacifist':
      return <Feather {...props} />;
    case 'ghost':
      return <Ghost {...props} />;
    case 'mason':
      return <Users {...props} />;
    case 'doppelganger':
      return <Copy {...props} />;
    case 'lycan':
      return <Moon {...props} />;
    case 'tough_guy':
      return <ShieldPlus {...props} />;
    case 'villager_idiot':
      return <Frown {...props} />;
    case 'tanner':
      return <Skull {...props} />;
    case 'vampire':
      return <Droplets {...props} />;
    case 'cult_leader':
      return <Flame {...props} />;
    case 'revealer':
      return <Target {...props} />;
    case 'mentalist':
      return <Brain {...props} />;
    case 'huntress':
      return <Crosshair {...props} />;
    case 'mad_bomber':
      return <Bomb {...props} />;
    case 'mystic_seer':
      return <VenetianMask {...props} />;
    case 'villager':
      return <User {...props} />;
    default:
      return <HelpCircle {...props} />;
  }
}

export function getRoleImage(roleId) {
  if (!ILLUSTRATED_ROLES.has(roleId)) return null;
  return `/roles/${roleId}.jpg`;
}

export { Flame };
