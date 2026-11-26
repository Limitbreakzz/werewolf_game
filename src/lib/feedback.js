let cachedVoices = [];
const activeUtterances = new Set();
let currentAudio = null;
const audioQueue = [];
let isPlayingQueue = false;

const SERVER_URL = (import.meta.env.VITE_SERVER_URL || '').trim().replace(/\/+$/, '');

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

export function unlockSpeech() {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      loadVoices();
      window.speechSynthesis.resume?.();
      const silent = new SpeechSynthesisUtterance('');
      silent.volume = 0;
      window.speechSynthesis.speak(silent);
    }
    return true;
  } catch {
    return false;
  }
}

function playNextAudioInQueue() {
  if (isPlayingQueue || audioQueue.length === 0) return;
  const nextText = audioQueue.shift();
  isPlayingQueue = true;

  const ttsUrl = `${SERVER_URL}/api/tts?text=${encodeURIComponent(nextText)}`;
  const audio = new Audio(ttsUrl);
  currentAudio = audio;

  const done = () => {
    if (currentAudio === audio) currentAudio = null;
    isPlayingQueue = false;
    playNextAudioInQueue();
  };

  audio.onended = done;
  audio.onerror = done;
  audio.play().catch(done);
}

function speakViaServerAudio(text, interrupt) {
  try {
    if (interrupt) {
      audioQueue.length = 0;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      isPlayingQueue = false;
    }
    audioQueue.push(text);
    playNextAudioInQueue();
    return true;
  } catch {
    return false;
  }
}

export function speakThai(text, { interrupt = true, muted = false } = {}) {
  try {
    if (muted || typeof window === 'undefined') return false;

    const voices = loadVoices();
    const thVoice =
      voices.find((v) => v.lang && v.lang.toLowerCase() === 'th-th') ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('th'));

    // If browser has NO Thai system voice (common on Windows Chrome), use cached Thai MP3 TTS from backend!
    if (!thVoice) {
      return speakViaServerAudio(text, interrupt);
    }

    const synth = window.speechSynthesis;
    const doSpeak = () => {
      synth.resume?.();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'th-TH';
      utter.rate = 0.94;
      utter.pitch = 1.0;
      utter.volume = 1.0;
      utter.voice = thVoice;

      activeUtterances.add(utter);
      utter.onend = () => activeUtterances.delete(utter);
      utter.onerror = () => {
        activeUtterances.delete(utter);
        speakViaServerAudio(text, false);
      };

      synth.speak(utter);
    };

    if (interrupt && (synth.speaking || synth.pending)) {
      synth.cancel();
      setTimeout(doSpeak, 70);
    } else {
      doSpeak();
    }
    return true;
  } catch {
    return speakViaServerAudio(text, interrupt);
  }
}

export const NARRATOR_SCRIPTS = {
  test: 'ระบบเสียงบรรยายกลางพร้อมทำงานแล้วครับ',
  night_start: 'เข้าสู่ช่วงกลางคืน ทุกคนหยุดพูดและหลับตา',
  werewolf: 'มนุษย์หมาป่าตื่นขึ้น เลือกเหยื่อในคืนนี้',
  sorcerer: 'จอมเวทมืดตื่นขึ้น เลือกตรวจสอบหาเทพพยากรณ์',
  seer: 'เทพพยากรณ์ตื่นขึ้น เลือกตรวจสอบผู้เล่นหนึ่งคน',
  doctor: 'บอดี้การ์ดตื่นขึ้น เลือกปกป้องผู้เล่นหนึ่งคน',
  witch: 'แม่มดตื่นขึ้น ตัดสินใจเรื่องยาชุบชีวิตและยาพิษ',
  dawn: 'เช้าแล้ว ทุกคนลืมตาขึ้น',
  day_vote: 'หมดเวลาปรึกษา เตรียมลงคะแนนโหวตเสนอชื่อผู้ต้องสงสัย',
  day_defense: 'ได้ผู้ต้องสงสัยแล้ว เชิญผู้ถูกเสนอชื่อพูดแก้ตัว',
  day_verdict: 'หมดเวลาแก้ตัว ทุกคนโหวตตัดสินว่าจะประหารหรือปล่อยตัว',
};

export const NARRATOR_SLEEP = {
  werewolf: 'มนุษย์หมาป่าหลับตา',
  sorcerer: 'จอมเวทมืดหลับตา',
  seer: 'เทพพยากรณ์หลับตา',
  doctor: 'บอดี้การ์ดหลับตา',
  witch: 'แม่มดหลับตา',
};
