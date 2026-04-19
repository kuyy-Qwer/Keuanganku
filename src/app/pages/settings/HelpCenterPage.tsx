import { useNavigate } from "react-router";
import { useState } from "react";
import { useLang } from "../../i18n";
const WA_NUMBER = "621213923253";
const WA_MESSAGE = encodeURIComponent(
  "Ada kendala yang ingin saya sampaikan 🙏\n\nHalo Tim Luminary, saya mengalami kesulitan saat menggunakan aplikasi dan membutuhkan bantuan. Mohon kiranya bisa dibantu ya. Terima kasih banyak sebelumnya! 😊"
);
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

export default function HelpCenterPage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: L("Bagaimana cara menambah transaksi?", "How do I add a transaction?"),
      a: L("Klik tombol '+' di halaman utama, isi nominal, kategori, dan catatan, lalu klik Simpan.", "Tap the '+' button on the home screen, fill in the amount, category, and notes, then tap Save.")
    },
    {
      q: L("Bagaimana cara mengubah PIN?", "How do I change my PIN?"),
      a: L("Buka Profil → Keamanan → Ubah PIN. Masukkan PIN lama, lalu buat PIN baru 6 digit.", "Go to Profile → Security → Change PIN. Enter your old PIN, then create a new 6-digit PIN.")
    },
    {
      q: L("Apakah data saya aman?", "Is my data safe?"),
      a: L("Ya, data Anda tersimpan secara lokal di perangkat dan tidak dikirim ke server manapun tanpa izin Anda.", "Yes, your data is stored locally on your device and is not sent to any server without your permission.")
    },
    {
      q: L("Bagaimana cara backup data?", "How do I back up my data?"),
      a: L("Buka Profil → Backup & Restore. Anda bisa mengekspor data ke file JSON dan mengimpornya kembali kapan saja.", "Go to Profile → Backup & Restore. You can export your data to a JSON file and import it back anytime.")
    },
    {
      q: L("Bagaimana cara mengatur anggaran?", "How do I set a budget?"),
      a: L("Buka Pengaturan → Kelola Kategori. Setiap kategori bisa diatur batas anggaran bulanannya.", "Go to Settings → Manage Categories. Each category can have a monthly budget limit.")
    },
  ];

  return (
    <div className="w-full min-h-screen flex justify-center pb-28 overflow-y-auto"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate("/app/account")}
            className="p-2 rounded-full transition-colors"
            style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--app-text2)">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]"
            style={{ color: "var(--app-text)" }}>
            {L("Pusat Bantuan", "Help Center")}
          </h1>
        </div>

        {/* Hero */}
        <div className="rounded-[24px] p-5 text-center"
          style={{ background: "linear-gradient(135deg, rgba(78,222,163,0.08), rgba(4,180,162,0.05))", border: "1px solid rgba(78,222,163,0.12)" }}>
          <span className="text-[40px] block mb-2">🛟</span>
          <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[16px] mb-1" style={{ color: "var(--app-text)" }}>
            {L("Ada yang bisa kami bantu?", "How can we help you?")}
          </p>
          <p className="font-['Inter'] text-[13px] leading-relaxed" style={{ color: "var(--app-text2)" }}>
            {L("Temukan jawaban di FAQ di bawah, atau hubungi tim kami langsung.", "Find answers in the FAQ below, or reach our team directly.")}
          </p>
        </div>

        {/* Hubungi Kami */}
        <div className="rounded-[24px] p-5 space-y-4"
          style={{ backgroundColor: "var(--app-card)", border: "1px solid var(--app-border)" }}>
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-[14px] flex items-center justify-center text-[22px]"
              style={{ backgroundColor: "rgba(37,211,102,0.12)" }}>
              💬
            </div>
            <div>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px]" style={{ color: "var(--app-text)" }}>
                {L("Hubungi Kami", "Contact Us")}
              </p>
              <p className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
                {L("Kami siap membantu kamu kapan saja 🙌", "We're here to help you anytime 🙌")}
              </p>
            </div>
          </div>

          <p className="font-['Inter'] text-[13px] leading-relaxed" style={{ color: "var(--app-text2)" }}>
            {L(
              "Jangan ragu untuk menghubungi kami ya! Tim Luminary dengan senang hati akan membantu menyelesaikan kendala yang kamu hadapi. Respons cepat, ramah, dan siap sedia — karena kepuasanmu adalah prioritas kami. 💚",
              "Don't hesitate to reach out! The Luminary team is happy to help resolve any issues you're facing. Fast response, friendly, and always ready — because your satisfaction is our priority. 💚"
            )}
          </p>

          <a href={WA_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[14px] font-['Plus_Jakarta_Sans'] font-bold text-[14px] transition-all active:scale-[0.98] hover:opacity-90"
            style={{ backgroundColor: "#25d366", color: "#fff" }}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {L("Chat via WhatsApp", "Chat via WhatsApp")}
          </a>
        </div>

        {/* FAQ */}
        <div>
          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[13px] tracking-[2px] uppercase mb-3"
            style={{ color: "var(--app-text2)" }}>FAQ</p>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-[16px] overflow-hidden transition-all"
                style={{ backgroundColor: "var(--app-card)", border: "1px solid var(--app-border)" }}>
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex items-center justify-between p-4 w-full text-left gap-3">
                  <span className="font-['Inter'] font-semibold text-[13px] flex-1" style={{ color: "var(--app-text)" }}>
                    {faq.q}
                  </span>
                  <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openIndex === i && (
                  <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--app-border)" }}>
                    <p className="font-['Inter'] text-[13px] leading-relaxed pt-3" style={{ color: "var(--app-text2)" }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
