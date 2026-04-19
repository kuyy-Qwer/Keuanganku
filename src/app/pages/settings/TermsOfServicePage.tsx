import { useNavigate } from "react-router";
import { useLang } from "../../i18n";
export default function TermsOfServicePage() {
  const navigate = useNavigate();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;

  const sections = [
    {
      title: L("1. Ketentuan Umum", "1. General Terms"),
      body: L(
        "Dengan menggunakan aplikasi Luminary, Anda menyetujui syarat dan ketentuan yang berlaku. Layanan ini disediakan untuk pengelolaan keuangan pribadi dan tidak menyediakan layanan perbankan resmi.",
        "By using the Luminary app, you agree to the applicable terms and conditions. This service is provided for personal financial management and does not provide official banking services."
      ),
    },
    {
      title: L("2. Akun Pengguna", "2. User Account"),
      body: L(
        "Anda bertanggung jawab penuh atas keamanan akun Anda, termasuk PIN dan data biometrik. Jangan membagikan informasi akun kepada pihak lain.",
        "You are fully responsible for the security of your account, including your PIN and biometric data. Do not share account information with others."
      ),
    },
    {
      title: L("3. Privasi Data", "3. Data Privacy"),
      body: L(
        "Data pribadi disimpan secara lokal di perangkat Anda dengan enkripsi. Tidak ada data yang dikirim ke server eksternal tanpa persetujuan Anda.",
        "Personal data is stored locally on your device with encryption. No data is sent to external servers without your consent."
      ),
    },
    {
      title: L("4. Batasan Tanggung Jawab", "4. Limitation of Liability"),
      body: L(
        "Luminary tidak bertanggung jawab atas kerugian yang timbul akibat penggunaan aplikasi di luar ketentuan yang berlaku. Informasi keuangan bersifat informatif dan bukan nasihat keuangan resmi.",
        "Luminary is not responsible for losses arising from use of the app outside the applicable terms. Financial information is informational and not official financial advice."
      ),
    },
    {
      title: L("5. Perubahan Ketentuan", "5. Changes to Terms"),
      body: L(
        "Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui notifikasi aplikasi.",
        "We reserve the right to change these terms at any time. Changes will be notified through app notifications."
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen flex justify-center pb-28 overflow-y-auto"
      style={{ backgroundColor: "var(--app-bg)" }}>
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-5">

        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate("/app/account")}
            className="p-2 rounded-full" style={{ backgroundColor: "var(--app-card)" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="var(--app-text2)">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px]"
            style={{ color: "var(--app-text)" }}>
            {L("Syarat & Ketentuan", "Terms of Service")}
          </h1>
        </div>

        <p className="font-['Inter'] text-[12px]" style={{ color: "var(--app-text2)" }}>
          {L("Terakhir diperbarui", "Last updated")}: 1 April 2026
        </p>

        <div className="space-y-3">
          {sections.map((s, i) => (
            <div key={i} className="rounded-[16px] p-5" style={{ backgroundColor: "var(--app-card)" }}>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[14px] mb-2"
                style={{ color: "var(--app-text)" }}>{s.title}</h3>
              <p className="font-['Inter'] text-[13px] leading-relaxed"
                style={{ color: "var(--app-text2)" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
