import { useNavigate } from "react-router";
import { useState } from "react";

interface Doc {
  id: string;
  name: string;
  status: "Verified" | "Pending" | "Rejected";
  date: string;
  icon: string;
}

const STORAGE_KEY = "luminary_documents";

function getDocs(): Doc[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [
    { id: "1", name: "KTP", status: "Verified", date: "12 Jan 2023", icon: "🪪" },
    { id: "2", name: "NPWP", status: "Verified", date: "15 Feb 2023", icon: "📋" },
  ];
}

function saveDocs(docs: Doc[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

const DOC_TYPES = [
  { name: "KTP", icon: "🪪" },
  { name: "NPWP", icon: "📋" },
  { name: "Selfie + KTP", icon: "🤳" },
  { name: "Paspor", icon: "📕" },
  { name: "SIM", icon: "🚗" },
  { name: "Kartu Keluarga", icon: "👨‍👩‍👧" },
];

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Doc[]>(getDocs());
  const [showAdd, setShowAdd] = useState(false);
  const [selectedType, setSelectedType] = useState(DOC_TYPES[0]);

  const handleAdd = () => {
    const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    const newDoc: Doc = {
      id: crypto.randomUUID(),
      name: selectedType.name,
      status: "Pending",
      date: today,
      icon: selectedType.icon,
    };
    const updated = [...docs, newDoc];
    setDocs(updated);
    saveDocs(updated);
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const updated = docs.filter(d => d.id !== id);
    setDocs(updated);
    saveDocs(updated);
  };

  const statusStyle = (status: Doc["status"]) => {
    if (status === "Verified") return { bg: "rgba(78,222,163,0.1)", color: "#4edea3" };
    if (status === "Rejected") return { bg: "rgba(255,180,171,0.1)", color: "#ffb4ab" };
    return { bg: "rgba(233,196,0,0.1)", color: "#E9C400" };
  };

  return (
    <div className="w-full min-h-screen bg-[#0b1326] flex justify-center pb-28 overflow-y-auto">
      <div className="w-full max-w-[390px] px-5 pt-12 space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => navigate("/app/account")} className="bg-[#171f33] p-2 rounded-full hover:bg-[#1f2740] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#BBCABF" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[18px] text-[#dae2fd]">Dokumen</h1>
        </div>

        {showAdd && (
          <div className="bg-[#131b2e] rounded-[20px] p-5 border border-[rgba(78,222,163,0.15)] space-y-4">
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-[#dae2fd]">Upload Dokumen</p>
            <div>
              <p className="font-['Inter'] font-semibold text-[10px] text-[#64748b] tracking-[2px] uppercase mb-2">JENIS DOKUMEN</p>
              <div className="flex flex-wrap gap-2">
                {DOC_TYPES.map(dt => (
                  <button key={dt.name} onClick={() => setSelectedType(dt)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full font-['Inter'] font-semibold text-[12px] transition-all"
                    style={{
                      backgroundColor: selectedType.name === dt.name ? "rgba(78,222,163,0.15)" : "#2d3449",
                      color: selectedType.name === dt.name ? "#4edea3" : "#64748b",
                      border: selectedType.name === dt.name ? "1px solid rgba(78,222,163,0.3)" : "1px solid transparent",
                    }}>
                    <span>{dt.icon}</span><span>{dt.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-[rgba(45,52,73,0.4)] rounded-[14px] border border-dashed border-[rgba(78,222,163,0.2)] p-6 flex flex-col items-center gap-2">
              <span className="text-[28px]">{selectedType.icon}</span>
              <p className="font-['Inter'] text-[13px] text-[#64748b]">Tap untuk upload {selectedType.name}</p>
              <p className="font-['Inter'] text-[10px] text-[#475569]">JPG, PNG, PDF maks 5MB</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-[14px] bg-[#2d3449] font-['Inter'] font-semibold text-[13px] text-[#94a3b8]">Batal</button>
              <button onClick={handleAdd} className="flex-1 py-3 rounded-[14px] bg-[#00d18b] font-['Inter'] font-semibold text-[13px] text-[#060e20]">Submit</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {docs.length === 0 && (
            <div className="bg-[#131b2e] rounded-[20px] p-8 text-center">
              <span className="text-[36px] block mb-3">📄</span>
              <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] text-[#dae2fd] mb-1">Belum ada dokumen</p>
              <p className="font-['Inter'] text-[12px] text-[#64748b]">Upload dokumen identitas Anda</p>
            </div>
          )}
          {docs.map(doc => {
            const style = statusStyle(doc.status);
            return (
              <div key={doc.id} className="bg-[#131b2e] rounded-[20px] p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#2d3449] size-[44px] rounded-full flex items-center justify-center">
                    <span className="text-[20px]">{doc.icon}</span>
                  </div>
                  <div>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] text-[#dae2fd]">{doc.name}</p>
                    <p className="font-['Inter'] text-[12px] text-[#64748b]">Upload {doc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 rounded-full" style={{ backgroundColor: style.bg }}>
                    <span className="font-['Inter'] font-semibold text-[10px] uppercase" style={{ color: style.color }}>
                      {doc.status}
                    </span>
                  </div>
                  {doc.status !== "Verified" && (
                    <button onClick={() => handleDelete(doc.id)}
                      className="bg-[rgba(255,180,171,0.1)] rounded-full p-1.5 active:scale-90 transition-transform">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#ffb4ab" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!showAdd && (
          <button onClick={() => setShowAdd(true)}
            className="bg-[#2d3449] w-full rounded-[16px] py-4 border border-dashed border-[rgba(78,222,163,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#4edea3" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="font-['Inter'] font-semibold text-[14px] text-[#4edea3]">Upload Dokumen</span>
          </button>
        )}
      </div>
    </div>
  );
}
