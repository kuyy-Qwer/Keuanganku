/**
 * Sound engine menggunakan Web Audio API — tidak butuh file eksternal.
 * Setiap event punya karakter suara yang berbeda.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gainVal = 0.3,
  delay = 0
) {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime + delay);
    gain.gain.setValueAtTime(0, ac.currentTime + delay);
    gain.gain.linearRampToValueAtTime(gainVal, ac.currentTime + delay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + duration);
  } catch { /* silent fail */ }
}

/** Transaksi masuk (income) — nada naik, ceria */
export function playIncomeSound() {
  playTone(523, 0.12, "sine", 0.25);        // C5
  playTone(659, 0.12, "sine", 0.25, 0.1);   // E5
  playTone(784, 0.2, "sine", 0.25, 0.2);    // G5
}

/** Transaksi keluar (expense) — nada turun, netral */
export function playExpenseSound() {
  playTone(440, 0.12, "sine", 0.2);          // A4
  playTone(349, 0.18, "sine", 0.2, 0.12);   // F4
}

/** Tabungan dibuat / top-up — lembut, positif */
export function playSavingSound() {
  playTone(880, 0.08, "sine", 0.15);
  playTone(1047, 0.08, "sine", 0.15, 0.09);
  playTone(1319, 0.15, "sine", 0.15, 0.18);
}

/** Achievement unlock — fanfare kecil */
export function playAchievementSound() {
  playTone(523, 0.1, "triangle", 0.3);
  playTone(659, 0.1, "triangle", 0.3, 0.1);
  playTone(784, 0.1, "triangle", 0.3, 0.2);
  playTone(1047, 0.3, "triangle", 0.35, 0.3);
}

/** Peringatan / alert keamanan — tegas */
export function playAlertSound() {
  playTone(880, 0.08, "square", 0.15);
  playTone(880, 0.08, "square", 0.15, 0.15);
  playTone(660, 0.2, "square", 0.15, 0.3);
}

/** Pengingat / reminder — lembut ding */
export function playReminderSound() {
  playTone(1047, 0.05, "sine", 0.2);
  playTone(1047, 0.2, "sine", 0.15, 0.08);
}

/** Hutang lunas — resolusi positif */
export function playDebtPaidSound() {
  playTone(392, 0.1, "sine", 0.2);
  playTone(523, 0.1, "sine", 0.2, 0.1);
  playTone(659, 0.25, "sine", 0.25, 0.2);
}

/** Hapus / delete — nada turun tegas, singkat */
export function playDeleteSound() {
  playTone(330, 0.08, "square", 0.18);
  playTone(220, 0.18, "square", 0.18, 0.1);
}

/** Konfirmasi muncul — tanya, sedikit waspada */
export function playConfirmPromptSound() {
  playTone(660, 0.06, "sine", 0.15);
  playTone(550, 0.12, "sine", 0.12, 0.08);
}

/** Berhasil simpan/update — ding positif singkat */
export function playSuccessSound() {
  playTone(587, 0.08, "sine", 0.2);
  playTone(784, 0.18, "sine", 0.22, 0.09);
}

/** Pindah status / move task — klik ringan */
export function playMoveSound() {
  playTone(740, 0.06, "sine", 0.15);
  playTone(880, 0.1, "sine", 0.12, 0.07);
}

/** Checklist dicentang — pop ringan ceria */
export function playChecklistSound() {
  playTone(1047, 0.05, "sine", 0.18);
  playTone(1319, 0.12, "sine", 0.2, 0.06);
}

/** Debt progress milestone — peringatan lembut */
export function playDebtMilestoneSound() {
  playTone(660, 0.08, "sine", 0.18);
  playTone(784, 0.08, "sine", 0.18, 0.1);
  playTone(880, 0.2, "sine", 0.22, 0.2);
}
