export function vibrateDevice(pattern = [200, 90, 200]) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore unsupported browsers
  }
}

export function speakThai(text) {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'th-TH';
    utter.rate = 0.95;
    const voices = window.speechSynthesis.getVoices?.() || [];
    const thVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('th'));
    if (thVoice) utter.voice = thVoice;
    window.speechSynthesis.speak(utter);
  } catch {
    // Ignore speech synthesis errors
  }
}

export const NARRATOR_SCRIPTS = {
  night_start: 'เข้าสู่ช่วงกลางคืน ทุกคนหยุดพูดและหลับตา',
  werewolf: 'หมาป่าตื่นขึ้น เลือกเหยื่อในคืนนี้',
  seer: 'เทพพยากรณ์ตื่นขึ้น เลือกตรวจสอบผู้เล่นหนึ่งคน',
  doctor: 'หมอตื่นขึ้น เลือกปกป้องผู้เล่นหนึ่งคน',
  witch: 'แม่มดตื่นขึ้น ตัดสินใจเรื่องยาชุบชีวิตและยาพิษ',
  dawn: 'เช้าแล้ว ทุกคนลืมตาขึ้น',
  day_vote: 'หมดเวลาปรึกษา เตรียมลงคะแนนโหวตผ่านโทรศัพท์',
};
