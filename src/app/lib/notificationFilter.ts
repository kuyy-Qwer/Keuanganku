// Filter notifikasi untuk Pusher Beams vs Local
// Hanya notifikasi penting yang dikirim via Pusher Beams

import type { NotifPayload } from './notify';

export interface NotificationData {
  type: 'achievement' | 'alert' | 'reminder' | 'info';
  title: string;
  message: string;
  emoji: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

// Notifikasi yang HARUS dikirim via Pusher Beams
const CRITICAL_NOTIFICATIONS = [
  'saldo_tidak_mencukupi',
  'proteksi_keuangan_aktif', 
  'anggaran_habis',
  'waspada_tanggal_tua',
  'achievement_unlock'
];

export function shouldUsePusherBeams(notif: NotifPayload): boolean {
  // Critical alerts selalu pakai Pusher Beams
  if (notif.type === 'alert') {
    return CRITICAL_NOTIFICATIONS.some(pattern => 
      notif.title.toLowerCase().includes(pattern.replace('_', ' ')) ||
      notif.message.toLowerCase().includes(pattern.replace('_', ' '))
    );
  }
  
  // Achievement selalu pakai Pusher Beams
  if (notif.type === 'achievement') {
    return true;
  }
  
  // Daily reminder dan monthly backup pakai Pusher Beams
  if (notif.type === 'reminder') {
    return (
      notif.title.includes('Pengingat Pencatatan') ||
      notif.title.includes('Transaction Reminder') ||
      notif.title.includes('Waktunya Backup Data Bulanan') ||
      notif.title.includes('Monthly Backup Time')
    );
  }
  
  // Info hanya local
  return false;
}

export function getNotificationPriority(notif: NotifPayload): 'critical' | 'high' | 'medium' | 'low' {
  if (notif.type === 'alert') {
    if (notif.title.includes('Saldo Tidak Mencukupi')) return 'critical';
    if (notif.title.includes('Proteksi Keuangan')) return 'critical';
    if (notif.title.includes('Anggaran Habis')) return 'high';
    if (notif.title.includes('Waspada Tanggal Tua')) return 'critical';
  }
  
  if (notif.type === 'achievement') return 'high';
  if (notif.type === 'reminder') {
    // Daily reminder dan monthly backup sebagai high priority
    if (notif.title.includes('Pengingat Pencatatan') || 
        notif.title.includes('Transaction Reminder') ||
        notif.title.includes('Waktunya Backup Data Bulanan') ||
        notif.title.includes('Monthly Backup Time')) {
      return 'high';
    }
    return 'medium';
  }
  
  // Income, expense, saving, debt sebagai low priority
  if (notif.type === 'income' || notif.type === 'expense' || notif.type === 'saving' || notif.type === 'debt') return 'low';
  
  return 'medium';
}
