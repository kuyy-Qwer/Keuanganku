import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router";
import {
  getTasks, addTask, updateTask, deleteTask, moveTask,
  type KanbanTask, type ChecklistItem,
} from "../store/database";
import { useLang } from "../i18n";
import ConfirmDialog from "../components/ConfirmDialog";
import { playMoveSound, playChecklistSound } from "../lib/sounds";
import { crudDeleteSuccess, crudSuccess } from "../lib/notify";

function calcPct(task: KanbanTask): number {
  if (task.status === "done") return 100;
  const total = task.checklists.length;
  if (total === 0) return 0;
  return Math.round((task.checklists.filter(i => i.completed).length / total) * 100);
}

function newItem(text: string): ChecklistItem {
  return { id: crypto.randomUUID(), text: text.trim(), completed: false, weight: 1 };
}

function MiniConfetti() {
  const dots = ["#4edea3","#60a5fa","#fbbf24","#f87171","#c084fc"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[20px]">
      {dots.map((c, i) => (
        <div key={i} className="absolute size-1.5 rounded-full animate-bounce opacity-60"
          style={{ backgroundColor: c, left: `${15 + i * 18}%`, top: `${10 + (i % 2) * 15}%`, animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

function AnimatedCheckbox({ checked, onChange, size = 20 }: { checked: boolean; onChange: () => void; size?: number }) {
  return (
    <button onClick={onChange}
      className="relative rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300"
      style={{ width: size, height: size, borderColor: checked ? "#4edea3" : "var(--app-border)", backgroundColor: "transparent" }}>
      <div className="absolute inset-0 rounded-full transition-all duration-300"
        style={{ backgroundColor: "#4edea3", transform: checked ? "scale(1)" : "scale(0)", opacity: checked ? 1 : 0 }} />
      {checked && (
        <svg className="relative z-10" width={size * 0.55} height={size * 0.55} viewBox="0 0 12 12" fill="none">
          <path d="M2 6L5 9L10 3" stroke="#003824" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

const LABELS = [
  { value: "", color: "#64748b", label: { id: "Tidak Ada", en: "None" } },
  { value: "green", color: "#4edea3", label: { id: "Personal", en: "Personal" } },
  { value: "yellow", color: "#e9c400", label: { id: "Kerja", en: "Work" } },
];

function LabelPicker({ value, onChange, lang }: { value?: string; onChange: (v: string) => void; lang: string }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {LABELS.map(l => (
        <button key={l.value} onClick={() => onChange(l.value)}
          style={{
            flex: 1, padding: "8px 4px", borderRadius: 12,
            border: `2px solid ${value === l.value ? l.color : "var(--app-border)"}`,
            background: value === l.value ? `${l.color}20` : "var(--app-card2)",
            color: value === l.value ? l.color : "var(--app-text2)",
            fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, display: "inline-block", flexShrink: 0 }} />
          {lang === "en" ? l.label.en : l.label.id}
        </button>
      ))}
    </div>
  );
}

function ChecklistEditor({ items, onChange, lang }: { items: ChecklistItem[]; onChange: (items: ChecklistItem[]) => void; lang: string }) {
  const L = (id: string, en: string) => lang === "en" ? en : id;
  const inputRef = useRef<HTMLInputElement>(null);
  const addItem = () => {
    const val = inputRef.current?.value.trim() ?? "";
    if (!val) return;
    onChange([...items, newItem(val)]);
    if (inputRef.current) inputRef.current.value = "";
  };
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">
        Checklist {items.length > 0 && `(${items.filter(i => i.completed).length}/${items.length})`}
      </p>
      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map(item => (
            <div key={item.id} className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border"
              style={{ backgroundColor: "var(--app-card2)", borderColor: "var(--app-border)" }}>
              <AnimatedCheckbox checked={item.completed} onChange={() => onChange(items.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i))} size={18} />
              <span className={`flex-1 text-[13px] ${item.completed ? "line-through" : ""}`}
                style={{ color: item.completed ? "var(--app-text2)" : "var(--app-text)" }}>{item.text}</span>
              <button onClick={() => onChange(items.filter(i => i.id !== item.id))} className="opacity-0 group-hover:opacity-100 p-1 transition-opacity"
                style={{ color: "var(--app-danger)" }}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.round((items.filter(i => i.completed).length / items.length) * 100)}%`, background: "linear-gradient(90deg,#60a5fa,#4edea3)" }} />
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <input ref={inputRef} type="text" placeholder={L("Tambah langkah...", "Add a step...")}
          className="flex-1 rounded-xl px-3 py-2.5 text-[13px] outline-none border"
          style={{ backgroundColor: "var(--app-input-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }} />
        <button onClick={addItem} className="size-10 rounded-xl flex items-center justify-center font-bold text-[18px] shrink-0"
          style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text)" }}>+</button>
      </div>
    </div>
  );
}

function AddChecklistInline({ taskId, onAdd, lang }: { taskId: string; onAdd: (id: string, text: string) => void; lang: string }) {
  const L = (id: string, en: string) => lang === "en" ? en : id;
  const ref = useRef<HTMLInputElement>(null);
  const submit = () => {
    const val = ref.current?.value.trim() ?? "";
    if (!val) return;
    onAdd(taskId, val);
    if (ref.current) ref.current.value = "";
  };
  return (
    <div className="flex gap-2">
      <input ref={ref} type="text" placeholder={L("Tambah langkah...","Add a step...")}
        className="flex-1 rounded-xl px-3 py-2.5 text-[13px] outline-none border"
        style={{ backgroundColor: "var(--app-input-bg)", borderColor: "var(--app-border)", color: "var(--app-text)" }}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); submit(); } }} />
      <button onClick={submit} className="size-10 rounded-xl flex items-center justify-center font-bold text-[18px] shrink-0"
        style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text)" }}>+</button>
    </div>
  );
}

function TaskCard({ task, colId, onOpen, onMove, lang }: {
  task: KanbanTask; colId: KanbanTask["status"];
  onOpen: () => void; onMove: (dir: "prev" | "next") => void; lang: string;
}) {
  const done = task.checklists.filter(i => i.completed).length;
  const total = task.checklists.length;
  const pct = calcPct(task);
  const isComplete = colId === "done";
  const isPastDue = task.dueDate && new Date(task.dueDate) < new Date() && !isComplete;
  const progLabel = pct >= 95 && !isComplete ? { text: lang === "en" ? "Almost There!" : "Satu Langkah Lagi!", color: "#fb923c", blink: true }
    : pct >= 50 && !isComplete ? { text: lang === "en" ? "Halfway!" : "Setengah Jalan!", color: "#60a5fa", blink: false } : null;

  return (
    <div onClick={onOpen}
      className={`group relative rounded-[20px] p-4 border cursor-pointer overflow-hidden transition-all duration-300 active:scale-[0.97] 
        ${isComplete 
          ? "opacity-75 bg-[#0f1a2e] border-white/5 hover:opacity-100" 
          : "bg-[#171f33] border-white/5 shadow-md hover:border-white/20 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.4)] hover:-translate-y-1"
        }`}
    >
      {/* Glow Effect saat Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {task.labelColor && (
        <div 
          className={`absolute top-0 left-0 w-full h-[3px] rounded-t-[20px] transition-all duration-300 group-hover:h-[5px] 
            ${task.labelColor === "green" ? "bg-[#4edea3]" : "bg-[#e9c400]"}`} 
        />
      )}
      
      {isComplete && <MiniConfetti />}

      <div className="relative z-10"> {/* Konten dibungkus agar di atas efek glow */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-[14px] leading-snug transition-colors ${isComplete ? "line-through" : ""}`}
              style={{ color: isComplete ? "var(--app-text2)" : "var(--app-text)" }}>
              {task.title}
            </h3>
            {task.notes && <p className="text-[11px] text-[#64748b] line-clamp-1 mt-0.5 italic">{task.notes}</p>}
          </div>
          {(total > 0 || isComplete) && (
            <span className={`text-[13px] font-black shrink-0 ${pct === 100 ? "text-[#4edea3]" : pct >= 95 ? "text-[#fb923c]" : "text-[#64748b]"}`}>{pct}%</span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {task.dueDate && (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors ${isPastDue ? "bg-[#ffb4ab]/15 text-[#ffb4ab]" : "bg-white/5 text-[#64748b] group-hover:bg-white/10"}`}>
              {new Date(task.dueDate).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", { day: "numeric", month: "short" })}
            </span>
          )}
          {total > 0 && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-[#64748b]">
              {done}/{total}
            </span>
          )}
          {progLabel && (
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${progLabel.blink ? "animate-pulse" : ""}`}
              style={{ backgroundColor: `${progLabel.color}20`, color: progLabel.color }}>{progLabel.text}</span>
          )}
        </div>

        {(total > 0 || isComplete) && (
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: pct === 100 ? "linear-gradient(90deg,#4edea3,#04b4a2)" : "linear-gradient(90deg,#60a5fa,#4edea3)" }} />
          </div>
        )}

        {isComplete && (
          <div className="flex justify-end mt-2.5" onClick={e => e.stopPropagation()}>
            <button onClick={() => onMove("prev")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all text-[9px] font-bold border"
              style={{ backgroundColor: "var(--app-card2)", color: "var(--app-text2)", borderColor: "var(--app-border)" }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
              {lang === "en" ? "Undo" : "Kembalikan"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptySlot({ index }: { index: number }) {
  return (
    <div 
      className="group rounded-[20px] border border-dashed border-white/10 p-4 flex items-center gap-3 opacity-30 hover:opacity-100 hover:border-white/30 hover:bg-white/[0.02] transition-all duration-300"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#4edea3]/20 transition-all">
        <svg className="w-4 h-4 text-white/20 group-hover:text-[#4edea3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 4v16m8-8H4" /></svg>
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="h-2 rounded-full bg-white/10 w-3/4 group-hover:bg-white/20 transition-colors" />
        <div className="h-1.5 rounded-full bg-white/5 w-1/2" />
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = useLang();
  const L = (id: string, en: string) => lang === "en" ? en : id;
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isClosingAdd, setIsClosingAdd] = useState(false);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [isClosingDetail, setIsClosingDetail] = useState(false);
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newChecklist, setNewChecklist] = useState<ChecklistItem[]>([]);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editChecklist, setEditChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const load = () => setTasks(getTasks());
    load();
    window.addEventListener("luminary_data_change", load);
    return () => window.removeEventListener("luminary_data_change", load);
  }, []);

  // Deep link from HomePage: /app/tasks?task=<id>
  useEffect(() => {
    const taskId = searchParams.get("task");
    if (!taskId) return;
    const found = getTasks().find(t => t.id === taskId) ?? null;
    if (found) setSelectedTask(found);
    // clean URL param (so it doesn't reopen every time)
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete("task");
      return next;
    }, { replace: true });
  }, [searchParams, setSearchParams]);

  // Auto-expire: task expired tepat jam 00:00 malam hari tenggat berakhir
  useEffect(() => {
    const expireOverdue = () => {
      const now = new Date();
      // Tengah malam hari ini (00:00:00.000)
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      getTasks().forEach(task => {
        if (task.status !== "done" && task.dueDate) {
          // dueDate adalah "YYYY-MM-DD", expired setelah jam 00:00 hari BERIKUTNYA
          const due = new Date(task.dueDate);
          const dueExpiry = new Date(due.getFullYear(), due.getMonth(), due.getDate() + 1);
          if (dueExpiry <= todayMidnight) {
            updateTask(task.id, { status: "done" });
          }
        }
      });
    };

    // Jalankan sekali saat mount (untuk task yang sudah lewat)
    expireOverdue();

    // Hitung ms sampai tengah malam berikutnya
    const scheduleNextMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const msUntilMidnight = nextMidnight.getTime() - now.getTime();

      const timeout = setTimeout(() => {
        expireOverdue();
        // Setelah tengah malam pertama, ulangi setiap 24 jam
        const daily = setInterval(expireOverdue, 24 * 60 * 60 * 1000);
        return () => clearInterval(daily);
      }, msUntilMidnight);

      return timeout;
    };

    const timeout = scheduleNextMidnight();
    return () => clearTimeout(timeout);
  }, []);

  const toggleChecklist = (taskId: string, itemId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updated = task.checklists.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i);
    const allDone = updated.length > 0 && updated.every(i => i.completed);
    if (allDone && task.status !== "done") {
      updateTask(taskId, { checklists: updated, status: "done" });
      void crudSuccess();
      setSelectedTask(prev => prev?.id === taskId ? { ...prev, checklists: updated, status: "done" } : prev);
    } else {
      updateTask(taskId, { checklists: updated });
      playChecklistSound();
      setSelectedTask(prev => prev?.id === taskId ? { ...prev, checklists: updated } : prev);
    }
  };

  const addChecklistItem = (taskId: string, text: string) => {
    if (!text.trim()) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updated = [...task.checklists, newItem(text)];
    updateTask(taskId, { checklists: updated });
    setSelectedTask(prev => prev?.id === taskId ? { ...prev, checklists: updated } : prev);
    void crudSuccess();
  };

  const deleteChecklistItem = (taskId: string, itemId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const updated = task.checklists.filter(i => i.id !== itemId);
    updateTask(taskId, { checklists: updated });
    setSelectedTask(prev => prev?.id === taskId ? { ...prev, checklists: updated } : prev);
  };

  const closeAddModal = () => {
    setIsClosingAdd(true);
    setTimeout(() => { setShowAddModal(false); setIsClosingAdd(false); }, 400);
  };

  const closeDetailModal = () => {
    setIsClosingDetail(true);
    setTimeout(() => { setSelectedTask(null); setEditingTaskId(null); setIsClosingDetail(false); }, 400);
  };

  const handleAddTask = () => {
    if (!newTitle.trim() || !newDueDate || !newLabel || newChecklist.length < 3) return;
    const allDone = newChecklist.length > 0 && newChecklist.every(i => i.completed);
    addTask({ title: newTitle.trim(), notes: newNotes.trim(), status: allDone ? "done" : "todo", checklists: newChecklist, dueDate: newDueDate || undefined, labelColor: newLabel || undefined });
    void crudSuccess();
    setNewTitle(""); setNewNotes(""); setNewDueDate(""); setNewLabel(""); setNewChecklist([]);
    closeAddModal();
  };

  const handleMove = (task: KanbanTask, dir: "prev" | "next") => {
    const order: KanbanTask["status"][] = ["todo", "doing", "done"];
    const idx = order.indexOf(task.status);
    const next = dir === "next" ? order[idx + 1] : order[idx - 1];
    
    // When moving from done back to doing/todo, reset all checklist progress
    if (task.status === "done" && (next === "doing" || next === "todo")) {
      const resetChecklists = task.checklists.map(item => ({ ...item, completed: false }));
      updateTask(task.id, { status: next, checklists: resetChecklists });
    } else if (next) {
      moveTask(task.id, next);
    }
    playMoveSound();
  };

  const startEdit = (task: KanbanTask) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditNotes(task.notes);
    setEditDueDate(task.dueDate ?? "");
    setEditLabel(task.labelColor ?? "");
    setEditChecklist(task.checklists);
  };

  const handleSaveEdit = () => {
    if (!editingTaskId || !editTitle.trim()) return;
    const allDone = editChecklist.length > 0 && editChecklist.every(i => i.completed);
    const task = tasks.find(t => t.id === editingTaskId);
    updateTask(editingTaskId, {
      title: editTitle.trim(), notes: editNotes.trim(),
      dueDate: editDueDate || undefined, labelColor: editLabel || undefined,
      checklists: editChecklist,
      ...(allDone && task?.status !== "done" ? { status: "done" as const } : {}),
    });
    void crudSuccess();
    setEditingTaskId(null);
    setSelectedTask(prev => prev
      ? { ...prev, title: editTitle.trim(), notes: editNotes.trim(), dueDate: editDueDate || undefined, labelColor: editLabel || undefined, checklists: editChecklist, ...(allDone ? { status: "done" as const } : {}) }
      : prev);
  };

  const activeTasks = tasks.filter(t => t.status !== "done");
  const doneTasks = tasks.filter(t => t.status === "done");
  const SLOT_COUNT = 5;
  const visibleActive = activeTasks.slice(0, SLOT_COUNT);
  const emptySlots = Math.max(0, SLOT_COUNT - visibleActive.length);

  const panelStyle = { backgroundColor: "var(--app-card)" as const, height: "85dvh", minHeight: "0" };

  return (
    <div className="w-full min-h-screen flex justify-center pb-32 overflow-y-auto" style={{ backgroundColor: "var(--app-bg)" }}>
      <div id="tour-tasks-board" className="w-full max-w-[390px] px-5 pt-12 space-y-4">
        {pendingDeleteTaskId && (
          <ConfirmDialog
            title={L("Hapus Tugas?", "Delete Task?")}
            message={L("Tugas ini akan dihapus permanen.", "This task will be permanently deleted.")}
            confirmLabel={L("Hapus", "Delete")} cancelLabel={L("Batal", "Cancel")}
            onConfirm={() => { deleteTask(pendingDeleteTaskId); void crudDeleteSuccess(); setPendingDeleteTaskId(null); setSelectedTask(null); }}
            onCancel={() => setPendingDeleteTaskId(null)}
          />
        )}
        <div className="flex items-center justify-between">
          <h1 id="tour-tasks-header" className="font-extrabold text-[22px]" style={{ color: "var(--app-text)" }}>{L("Tugas & Rencana","Tasks & Board")}</h1>
          <button onClick={() => { setNewTitle(""); setNewNotes(""); setNewDueDate(""); setNewLabel(""); setNewChecklist([]); setShowAddModal(true); }}
            className="p-3 rounded-full bg-[#4edea3] text-[#003824] shadow-[0_8px_20px_rgba(78,222,163,0.35)] active:scale-90 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 4v16m8-8H4"/></svg>
          </button>
        </div>
        <div className="flex gap-2 p-1 rounded-[14px]" style={{ backgroundColor: "var(--app-card)" }}>
          {(["active", "history"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-[10px] text-[12px] font-bold transition-all ${activeTab === tab ? "bg-[#4edea3] text-[#003824]" : "text-[#64748b]"}`}>
              {tab === "active" ? `${L("Aktif","Active")} (${activeTasks.length})` : `${L("Selesai","Done")} (${doneTasks.length})`}
            </button>
          ))}
        </div>
        {activeTab === "active" && (
          <div className="space-y-2">
            {visibleActive.map((task, i) => (
              <div key={task.id}
                style={{ animation: `taskSlideIn 0.5s cubic-bezier(0.2,0.8,0.2,1) both`, animationDelay: `${i * 50}ms` }}>
                <TaskCard task={task} colId={task.status}
                  onOpen={() => setSelectedTask(task)} onMove={dir => handleMove(task, dir)} lang={lang} />
              </div>
            ))}
            {Array.from({ length: emptySlots }).map((_, i) => <EmptySlot key={`e-${i}`} index={i} />)}
            {activeTasks.length > SLOT_COUNT && (
              <div className="text-center py-2">
                <span className="text-[11px] font-bold text-[#64748b] bg-white/5 px-3 py-1 rounded-full">
                  +{activeTasks.length - SLOT_COUNT} {L("tugas lainnya","more tasks")}
                </span>
              </div>
            )}
            {tasks.length === 0 && (
              <div className="py-10 text-center">
                <p className="font-bold text-[14px]" style={{ color: "var(--app-text2)" }}>{L("Belum ada tugas","No tasks yet")}</p>
              </div>
            )}
          </div>
        )}
        {activeTab === "history" && (
          <div className="space-y-2">
            {doneTasks.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-[13px] text-[#64748b]">{L("Belum ada tugas selesai","No completed tasks yet")}</p>
              </div>
            ) : (
            doneTasks.map((task, i) => (
                <div key={task.id}
                  style={{ animation: `taskSlideIn 0.5s cubic-bezier(0.2,0.8,0.2,1) both`, animationDelay: `${i * 50}ms` }}>
                  <TaskCard task={task} colId="done"
                    onOpen={() => setSelectedTask(task)}
                    onMove={dir => handleMove(task, dir)}
                    lang={lang} />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && createPortal(
        <div className={`fixed inset-0 z-[9999] flex items-end justify-center pb-4 px-0 ${isClosingAdd ? "animate-fade-out" : "animate-fade-in"}`}
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={closeAddModal}>
          <div className={`w-full max-w-[390px] overflow-hidden shadow-2xl ${isClosingAdd ? "animate-slide-down" : "animate-slide-up"}`}
            style={{ ...panelStyle, borderRadius: "28px 28px 0 0", display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 24px 12px", flexShrink: 0 }}>
              <h2 style={{ fontWeight: 800, fontSize: 18, color: "var(--app-text)", margin: 0 }}>{L("Tugas Baru","New Task")}</h2>
              <button onClick={closeAddModal} style={{ padding: 8, borderRadius: "50%", background: "var(--app-card2)", color: "var(--app-text2)", border: "none", cursor: "pointer", display: "flex" }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 16px", minHeight: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--app-text2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                  {L("Judul Tugas","Task Title")} <span style={{ color: "var(--app-danger)" }}>*</span>
                </p>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder={L("Judul tugas...","Task title...")}
                  style={{ width: "100%", background: "var(--app-input-bg)", border: `1px solid ${newTitle.trim() ? "rgba(78,222,163,0.3)" : "var(--app-border)"}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "var(--app-text)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder={L("Catatan (opsional)...","Notes (optional)...")}
                rows={6} style={{ width: "100%", background: "var(--app-input-bg)", border: "1px solid var(--app-border)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "var(--app-text)", outline: "none", resize: "none", boxSizing: "border-box", minHeight: 140 }} />
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--app-text2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                  {L("Tanggal","Due Date")} <span style={{ color: "var(--app-danger)" }}>*</span>
                </p>
                <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)}
                  style={{ width: "100%", background: "var(--app-input-bg)", border: `1px solid ${newDueDate ? "rgba(78,222,163,0.3)" : "var(--app-border)"}`, borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "var(--app-text)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--app-text2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                  {L("Label","Label")} <span style={{ color: "var(--app-danger)" }}>*</span>
                </p>
                <LabelPicker value={newLabel} onChange={setNewLabel} lang={lang} />
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "var(--app-text2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                  {L("Langkah","Steps")}
                  <span style={{ marginLeft: 6, color: newChecklist.length >= 3 ? "#4edea3" : "#fb923c" }}>
                    ({newChecklist.length}/3 {L("min","min")})
                  </span>
                </p>
                <ChecklistEditor items={newChecklist} onChange={setNewChecklist} lang={lang} />
              </div>
            </div>
            <div style={{ padding: "16px 24px", flexShrink: 0, borderTop: "1px solid var(--app-border)" }}>
              {(() => {
                const canSave = newTitle.trim() && newDueDate && newLabel && newChecklist.length >= 3;
                return (
                  <button onClick={handleAddTask} disabled={!canSave}
                    style={{ width: "100%", padding: "14px 0", borderRadius: 14, background: "#4edea3", color: "#003824", fontWeight: 800, fontSize: 14, border: "none", cursor: canSave ? "pointer" : "not-allowed", opacity: canSave ? 1 : 0.4 }}>
                    {L("Simpan Tugas","Save Task")}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Task Detail / Edit Modal */}
      {selectedTask && createPortal(
        <div className={`fixed inset-0 z-[9999] flex items-end justify-center pb-4 px-0 ${isClosingDetail ? "animate-fade-out" : "animate-fade-in"}`}
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={closeDetailModal}>
          <div className={`w-full max-w-[390px] overflow-hidden shadow-2xl ${isClosingDetail ? "animate-slide-down" : "animate-slide-up"}`}
            style={{ ...panelStyle, borderRadius: "28px 28px 0 0", display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 24px 12px", flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, backgroundColor: selectedTask.status === "done" ? "#4edea320" : selectedTask.status === "doing" ? "#60a5fa20" : "#64748b20", color: selectedTask.status === "done" ? "#4edea3" : selectedTask.status === "doing" ? "#60a5fa" : "#64748b" }}>
                {selectedTask.status === "done" ? L("Selesai","Done") : selectedTask.status === "doing" ? L("Proses","Doing") : L("Rencana","To Do")}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                {editingTaskId !== selectedTask.id && (
                  <button onClick={() => startEdit(selectedTask)} style={{ padding: 8, borderRadius: "50%", background: "var(--app-card2)", color: "var(--app-text2)", border: "none", cursor: "pointer", display: "flex" }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                )}
                <button onClick={() => setPendingDeleteTaskId(selectedTask.id)} style={{ padding: 8, borderRadius: "50%", background: "var(--app-danger-bg)", color: "var(--app-danger)", border: "none", cursor: "pointer", display: "flex" }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <button onClick={closeDetailModal} style={{ padding: 8, borderRadius: "50%", background: "var(--app-card2)", color: "var(--app-text2)", border: "none", cursor: "pointer", display: "flex" }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {editingTaskId === selectedTask.id ? (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 16px", minHeight: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    style={{ width: "100%", background: "var(--app-input-bg)", border: "1px solid var(--app-border)", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "var(--app-text)", outline: "none", fontWeight: 700, boxSizing: "border-box" }} />
                  <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2}
                    style={{ width: "100%", background: "var(--app-input-bg)", border: "1px solid var(--app-border)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "var(--app-text)", outline: "none", resize: "none", boxSizing: "border-box" }} />
                  <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)}
                    style={{ width: "100%", background: "var(--app-input-bg)", border: "1px solid var(--app-border)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "var(--app-text)", outline: "none", boxSizing: "border-box" }} />
                  <LabelPicker value={editLabel} onChange={setEditLabel} lang={lang} />
                  <ChecklistEditor items={editChecklist} onChange={setEditChecklist} lang={lang} />
                </div>
                <div style={{ padding: "16px 24px", flexShrink: 0, borderTop: "1px solid var(--app-border)", display: "flex", gap: 8 }}>
                  <button onClick={() => setEditingTaskId(null)}
                    style={{ flex: 1, padding: "12px 0", borderRadius: 14, background: "var(--app-card2)", color: "var(--app-text2)", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
                    {L("Batal","Cancel")}
                  </button>
                  <button onClick={handleSaveEdit}
                    style={{ flex: 1, padding: "12px 0", borderRadius: 14, background: "#4edea3", color: "#003824", fontWeight: 800, fontSize: 13, border: "none", cursor: "pointer" }}>
                    {L("Simpan","Save")}
                  </button>
                </div>
              </>
            ) : selectedTask.status === "todo" ? (
              /* ── Belum dimulai: hanya info + tombol Edit & Hapus ── */
              <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px", minHeight: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.3, color: "var(--app-text)", margin: 0 }}>{selectedTask.title}</h2>
                  {selectedTask.notes && <p style={{ fontSize: 13, color: "var(--app-text2)", marginTop: 4, fontStyle: "italic" }}>{selectedTask.notes}</p>}
                </div>
                {selectedTask.dueDate && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--app-text2)"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span style={{ fontSize: 12, color: "var(--app-text2)" }}>
                      {new Date(selectedTask.dueDate).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                )}
                {selectedTask.checklists.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "var(--app-text2)", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
                      Checklist ({selectedTask.checklists.length} {L("langkah","steps")})
                    </p>
                    {selectedTask.checklists.map(item => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--app-card2)", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--app-border)", opacity: 0.6 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13, color: "#94a3b8" }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: "auto", padding: "8px 0 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <button onClick={() => { moveTask(selectedTask.id, "doing"); playMoveSound(); setSelectedTask(prev => prev ? { ...prev, status: "doing" } : prev); }}
                    style={{ width: "100%", padding: "14px 0", borderRadius: 14, background: "#4edea3", color: "#003824", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 8px 20px rgba(78,222,163,0.3)" }}>
                    🚀 {L("Mulai Tugas","Start Task")}
                  </button>
                </div>
              </div>
            ) : (
              /* ── Sudah dimulai (doing/done): checklist interaktif + tambah langkah ── */
              <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px", minHeight: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <h2 style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.3, color: selectedTask.status === "done" ? "#64748b" : "white", textDecoration: selectedTask.status === "done" ? "line-through" : "none", margin: 0 }}>{selectedTask.title}</h2>
                  {selectedTask.notes && <p style={{ fontSize: 13, color: "#64748b", marginTop: 4, fontStyle: "italic" }}>{selectedTask.notes}</p>}
                </div>
                {selectedTask.dueDate && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748b"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      {new Date(selectedTask.dueDate).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                )}
                {selectedTask.checklists.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
                        Checklist ({selectedTask.checklists.filter(i => i.completed).length}/{selectedTask.checklists.length})
                      </p>
                      <span style={{ fontSize: 12, fontWeight: 900, color: calcPct(selectedTask) === 100 ? "#4edea3" : "#64748b" }}>{calcPct(selectedTask)}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 999, width: `${calcPct(selectedTask)}%`, background: calcPct(selectedTask) === 100 ? "linear-gradient(90deg,#4edea3,#04b4a2)" : "linear-gradient(90deg,#60a5fa,#4edea3)", transition: "width 0.7s" }} />
                    </div>
                    {selectedTask.checklists.map(item => (
                      <div key={item.id} className="group" style={{ display: "flex", alignItems: "center", gap: 10, background: "#0b1326", padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <AnimatedCheckbox checked={item.completed} onChange={() => toggleChecklist(selectedTask.id, item.id)} size={18} />
                        <span style={{ flex: 1, fontSize: 13, color: item.completed ? "#64748b" : "white", textDecoration: item.completed ? "line-through" : "none" }}>{item.text}</span>
                        <button onClick={() => deleteChecklistItem(selectedTask.id, item.id)} style={{ padding: 4, color: "#ffb4ab", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Tambah langkah - hanya jika belum done */}
                {selectedTask.status !== "done" && (
                  <AddChecklistInline taskId={selectedTask.id} onAdd={addChecklistItem} lang={lang} />
                )}
                
                {/* Tombol Selesai - muncul saat checklist 100% */}
                {calcPct(selectedTask) === 100 && selectedTask.checklists.length > 0 && (
                  <div style={{ marginTop: "auto", padding: "8px 0 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <button onClick={() => { 
                      moveTask(selectedTask.id, "done"); 
                      void crudSuccess(); 
                      closeDetailModal(); 
                      setActiveTab("history"); 
                    }}
                      style={{ width: "100%", padding: "14px 0", borderRadius: 14, background: "#4edea3", color: "#003824", fontWeight: 800, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 8px 20px rgba(78,222,163,0.3)" }}>
                      ✅ {L("Selesai","Done")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
