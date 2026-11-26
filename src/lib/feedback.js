let cachedVoices = [];
const activeUtterances = new Set();

function loadVoices() {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    const list = window.speechSynthesis.getVoices() || [];
    if (list.length > 0) cachedVoices = list;
    return cachedVoices;
  } catch {
    return [];
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

export function vibrateDevice(pattern = [200, 90, 200]) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore unsupported browsers
  }
}

// Must be called inside a direct user click gesture (e.g., Start Game / Test Voice)
// to unlock Web Speech API on Chrome, Safari, and mobile browsers.
export function unlockSpeech() {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    loadVoices();
    window.speechSynthesis.resume?.();
    const silent = new SpeechSynthesisUtterance('');
    silent.volume = 0;
    window.speechSynthesis.speak(silent);
    return true;
  } catch {
    return false;
  }
}

export function speakThai(text, { interrupt = true, muted = false } = {}) {
  try {
    if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    const synth = window.speechSynthesis;
    const voices = loadVoices();
    const thVoice =
      voices.find((v) => v.lang && v.lang.toLowerCase() === 'th-th') ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('th'));

    const doSpeak = () => {
      synth.resume?.();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'th-TH';
      utter.rate = 0.94;
      utter.pitch = 1.0;
      utter.volume = 1.0;
      if (thVoice) utter.voice = thVoice;

      // Prevent Chrome GC bug from dropping utterance before completion
      activeUtterances.add(utter);
      utter.onend = () => activeUtterances.delete(utter);
      utter.onerror = () => activeUtterances.delete(utter);

      synth.speak(utter);
    };

    if (interrupt && (synth.speaking || synth.pending)) {
      synth.cancel();
      // Small delay avoids Chromium bug where speak() immediately after cancel() is dropped
      setTimeout(doSpeak, 70);
    } else {
      doSpeak();
    }
    return true;
  } catch {
    return false;
  }
}

export const NARRATOR_SCRIPTS = {
  test: 'ระบบเสียงบรรยายกลางพร้อมทำงานแล้วครับ',
  night_start: 'เข้าสู่ช่วงกลางคืน ทุกคนหยุดพูดและหลับตา',
  werewolf: 'หมาป่าตื่นขึ้น เลือกเหยื่อในคืนนี้',
  seer: 'เทพพยากรณ์ตื่นขึ้น เลือกตรวจสอบผู้เล่นหนึ่งคน',
  doctor: 'หมอตื่นขึ้น เลือกปกป้องผู้เล่นหนึ่งคน',
  witch: 'แม่มดตื่นขึ้น ตัดสินใจเรื่องยาชุบชีวิตและยาพิษ',
  dawn: 'เช้าแล้ว ทุกคนลืมตาขึ้น',
  day_vote: 'หมดเวลาปรึกษา เตรียมลงคะแนนโหวตผ่านโทรศัพท์',
};

export const NARRATOR_SLEEP = {
  werewolf: 'หมาป่าหลับตา',
  seer: 'เทพพยากรณ์หลับตา',
  doctor: 'หมอหลับตา',
  witch: 'แม่มดหลับตา',
};
