import React, { useEffect, useMemo, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, TimeScale } from "chart.js";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// register chart js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, TimeScale);

/**
 * Dashboard Analytics Premium
 * - Animated Bar / Line / Pie charts (react-chartjs-2)
 * - Psychologist view with user filter (based on localStorage mg_users & mg_screenings)
 * - Export Excel for analytics
 * - Heatmap (mood per day in month)
 * - High-risk notifications (screening)
 *
 * NOTE: This uses localStorage as data source (frontend-only)
 */

function readLocal(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function countScreeningCompletedByUser(screenings) {
  // If screenings have userId field, group by user; otherwise count total.
  const byUser = {};
  screenings.forEach((s) => {
    const uid = s.userId || "anonymous";
    byUser[uid] = (byUser[uid] || 0) + 1;
  });
  return byUser;
}

function groupByWeek(arr, dateKey = "created_at") {
  // returns map weekLabel -> count ; weekLabel like "2025-W02"
  const map = {};
  arr.forEach((it) => {
    const d = new Date(it[dateKey]);
    const year = d.getFullYear();
    // compute ISO week number
    const tmp = new Date(d.getTime());
    tmp.setHours(0,0,0,0);
    tmp.setDate(tmp.getDate() + 4 - (tmp.getDay()||7));
    const weekNumber = Math.ceil(((tmp - new Date(tmp.getFullYear(),0,1)) / 86400000 + 1)/7);
    const label = `${year}-W${String(weekNumber).padStart(2,"0")}`;
    map[label] = (map[label] || 0) + 1;
  });
  return map;
}

function getMoodCountsPerWeek(moods) {
  return groupByWeek(moods, "created_at");
}

function averageReadDuration(reads) {
  if (!reads.length) return 0;
  const total = reads.reduce((s, r) => s + (r.seconds || 0), 0);
  return Math.round(total / reads.length);
}

function flattenAnonCount(anonObj) {
  // anonObj: { "2025-01-01":[{...}], ...}
  let total = 0;
  Object.values(anonObj).forEach(arr => (total += arr.length));
  return total;
}

function getMoodHeatmapData(anonObj, monthISO) {
  // monthISO "2025-12" -> produce array days -> counts per mood
  const result = {}; // day -> { total, moods: {Sedih: n, Netral: n, ...}}
  Object.keys(anonObj || {}).forEach(date => {
    if (date.startsWith(monthISO)) {
      const arr = anonObj[date];
      result[date] = result[date] || { total: 0, moods: {} };
      arr.forEach(c => {
        result[date].total += 1;
        const label = c.mood?.label || c.mood || "Unknown";
        result[date].moods[label] = (result[date].moods[label] || 0) + 1;
      });
    }
  });
  return result; // keyed by date
}

export default function Dashboard() {
  // raw data
  const [screenings, setScreenings] = useState([]);
  const [moods, setMoods] = useState([]);
  const [reads, setReads] = useState([]);
  const [anon, setAnon] = useState({});
  const [users, setUsers] = useState([]);

  // UI states
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(() => (new Date()).toISOString().slice(0,7)); // YYYY-MM
  const [notified, setNotified] = useState(() => JSON.parse(localStorage.getItem("mg_notified") || "[]"));

  useEffect(() => {
    setScreenings(readLocal("mg_screenings", []));
    setMoods(readLocal("mg_moods", []));
    setReads(readLocal("mg_readtime", []));
    setAnon(readLocal("mg_anon", {}));
    setUsers(readLocal("mg_users", []));
  }, []);

  // derived metrics
  const totalScreenings = screenings.length;
  const totalCurhats = flattenAnonCount(anon);
  const moodPerWeek = useMemo(() => getMoodCountsPerWeek(moods), [moods]);
  const avgReadSec = averageReadDuration(reads);

  // chart data: weekly mood inputs (bar)
  const barLabels = Object.keys(moodPerWeek).sort();
  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: "Mood inputs per week",
        data: barLabels.map(l => moodPerWeek[l] || 0),
        backgroundColor: "rgba(99,102,241,0.8)",
        borderRadius: 6,
      }
    ]
  };

  // pie chart: screening severity distribution
  const severityCounts = useMemo(() => {
    const counts = { normal:0, mild:0, moderate:0, high:0 };
    screenings.forEach(s => {
      const sc = Number(s.score || 0);
      if (sc <= 2) counts.normal++;
      else if (sc <= 5) counts.mild++;
      else if (sc <= 7) counts.moderate++;
      else counts.high++;
    });
    return counts;
  }, [screenings]);

  const pieData = {
    labels: ["Normal","Sedang","Tinggi","Sangat Tinggi"],
    datasets: [{
      data: [severityCounts.normal, severityCounts.mild, severityCounts.moderate, severityCounts.high],
      backgroundColor: ["#10b981","#f59e0b","#f97316","#ef4444"]
    }]
  };

  // line chart: readings per day in selected month
  const lineData = useMemo(() => {
    const month = selectedMonth; // "YYYY-MM"
    const daysInMonth = new Date(Number(month.slice(0,4)), Number(month.slice(5))-0 + 1, 0).getDate(); // corrected below
    // safer compute days: get year/month
    const [y, m] = month.split("-");
    const dim = new Date(Number(y), Number(m), 0).getDate();
    const labels = Array.from({length: dim}, (_,i)=> `${month}-${String(i+1).padStart(2,"0")}`);
    const counts = labels.map(l => (reads.filter(r => r.at?.startsWith(l)).length || 0));
    return { labels: labels.map(l=> l.slice(8)), datasets: [{ label: "Read sessions per day", data: counts, borderColor: "#6366f1", tension: 0.3, fill:false }] };
  }, [reads, selectedMonth]);

  // heatmap mood data for month
  const heatmapData = useMemo(() => getMoodHeatmapData(anon, selectedMonth), [anon, selectedMonth]);

  // notification: detect high-risk screenings not yet notified
  useEffect(() => {
    // find screenings with score >=8 and not in notified list
    const high = screenings.filter(s => Number(s.score) >= 8);
    const newOnes = high.filter(h => !notified.includes(h.id));
    if (newOnes.length > 0) {
      // show in-app banner (we will render below) and store notified
      const ids = [...notified, ...newOnes.map(n=>n.id)];
      setNotified(ids);
      localStorage.setItem("mg_notified", JSON.stringify(ids));

      // Browser notification if allowed
      if ("Notification" in window && Notification.permission === "granted") {
        newOnes.forEach(n => {
          new Notification("MindGenZ — Screening Risiko Tinggi", {
            body: `Skor ${n.score} pada ${new Date(n.created_at).toLocaleString()}`,
          });
        });
      } else if ("Notification" in window && Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            newOnes.forEach(n => {
              new Notification("MindGenZ — Screening Risiko Tinggi", {
                body: `Skor ${n.score} pada ${new Date(n.created_at).toLocaleString()}`,
              });
            });
          }
        });
      }
    }
  }, [screenings]);

  // export excel
  function exportExcel() {
    // build sheet rows from screenings,moods,reads,anon
    const wb = XLSX.utils.book_new();

    const sSheet = XLSX.utils.json_to_sheet(screenings);
    XLSX.utils.book_append_sheet(wb, sSheet, "screenings");

    const mSheet = XLSX.utils.json_to_sheet(moods);
    XLSX.utils.book_append_sheet(wb, mSheet, "moods");

    const rSheet = XLSX.utils.json_to_sheet(reads);
    XLSX.utils.book_append_sheet(wb, rSheet, "reads");

    // anon: flatten
    const anonRows = [];
    Object.keys(anon || {}).forEach(date => {
      (anon[date]||[]).forEach(c => {
        anonRows.push({ date, mood: c.mood?.label || c.mood, time: c.created_at, message: c.message });
      });
    });
    const aSheet = XLSX.utils.json_to_sheet(anonRows);
    XLSX.utils.book_append_sheet(wb, aSheet, "anon_curhat");

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `mindgenz-analytics-${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  // psychologist filter: if mg_users exist allow selection
  const userOptions = [{ id: "all", name: "Semua Pengguna" }, ...(users || []).map(u=>({ id: u.id || u.userId || u.email || u.username, name: u.name || u.email || (u.username || "user") }))];

  // For UI - high-risk items to display
  const highRiskList = screenings.filter(s => Number(s.score) >= 8);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">📊 Analytics Dashboard (Premium)</h2>

        <div className="flex gap-3 items-center">
          <select value={selectedUser} onChange={e=>setSelectedUser(e.target.value)} className="px-3 py-2 rounded-lg">
            {userOptions.map(u => <option value={u.id} key={u.id}>{u.name}</option>)}
          </select>

          <input type="month" value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)} className="px-3 py-2 rounded-lg" />

          <button onClick={exportExcel} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow">Export Excel</button>
        </div>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/80 rounded-2xl shadow">
          <div className="text-sm text-slate-500">Screenings Completed</div>
          <div className="text-2xl font-bold">{totalScreenings}</div>
        </div>
        <div className="p-4 bg-white/80 rounded-2xl shadow">
          <div className="text-sm text-slate-500">Mood inputs (this week)</div>
          <div className="text-2xl font-bold">{Object.values(moodPerWeek).reduce((a,b)=>a+b,0)}</div>
        </div>
        <div className="p-4 bg-white/80 rounded-2xl shadow">
          <div className="text-sm text-slate-500">Average Read (sec)</div>
          <div className="text-2xl font-bold">{avgReadSec}s</div>
        </div>
        <div className="p-4 bg-white/80 rounded-2xl shadow">
          <div className="text-sm text-slate-500">Anon Curhat messages</div>
          <div className="text-2xl font-bold">{totalCurhats}</div>
        </div>
      </div>

      {/* charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/80 p-4 rounded-2xl shadow">
          <h3 className="font-semibold mb-2">Mood Inputs per Week (Bar)</h3>
          <Bar data={barData} options={{ responsive:true, animation:{duration:800} }} />
        </div>

        <div className="bg-white/80 p-4 rounded-2xl shadow">
          <h3 className="font-semibold mb-2">Screening Severity Distribution (Pie)</h3>
          <Pie data={pieData} options={{ responsive:true, animation:{duration:800} }} />
        </div>

        <div className="bg-white/80 p-4 rounded-2xl shadow md:col-span-2">
          <h3 className="font-semibold mb-2">Reads per day (Line) — {selectedMonth}</h3>
          <Line data={lineData} options={{ responsive:true, animation:{duration:900}, scales:{ x:{ ticks:{ maxRotation:0 } } }}} />
        </div>
      </div>

      {/* heatmap + high-risk notifications */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/80 p-4 rounded-2xl shadow">
          <h3 className="font-semibold mb-3">Heatmap Mood — {selectedMonth}</h3>

          <div className="grid grid-cols-7 gap-2">
            {/* days header */}
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
              <div key={d} className="text-xs text-slate-500 text-center">{d}</div>
            ))}
            {/* compute first day offset */}
            {(() => {
              const [y, m] = selectedMonth.split("-");
              const first = new Date(Number(y), Number(m)-1, 1);
              const dim = new Date(Number(y), Number(m), 0).getDate();
              const nodes = [];
              // add blanks until first.getDay()
              for (let i=0;i<first.getDay();i++) nodes.push(<div key={`b-${i}`} />);
              for (let d=1; d<=dim; d++) {
                const iso = `${selectedMonth}-${String(d).padStart(2,"0")}`;
                const cell = heatmapData[iso];
                const intensity = cell ? Math.min(1, cell.total/3) : 0; // scale
                const bg = intensity === 0 ? "bg-white/50" : `bg-gradient-to-b from-yellow-200 to-red-400`;
                nodes.push(
                  <div key={iso} className="p-2 rounded-lg text-xs text-center border bg-white/70">
                    <div className="font-semibold">{d}</div>
                    <div className="text-[10px] mt-1 text-slate-700">{cell?cell.total:0} msgs</div>
                  </div>
                );
              }
              return nodes;
            })()}
          </div>
        </div>

        <div className="bg-white/80 p-4 rounded-2xl shadow">
          <h3 className="font-semibold mb-2">High-risk Screenings</h3>

          {highRiskList.length === 0 ? (
            <div className="text-sm text-slate-500">Tidak ada screening risiko tinggi terbaru.</div>
          ) : (
            <ul className="space-y-2">
              {highRiskList.map(h => (
                <li key={h.id} className="p-3 rounded-lg border bg-red-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">Skor {h.score}</div>
                      <div className="text-xs text-slate-600">{new Date(h.created_at).toLocaleString()}</div>
                      {h.userId && <div className="text-xs text-slate-500">User: {h.userId}</div>}
                    </div>
                    <div>
                      {/* Mark as reviewed: store flagged in localStorage 'mg_reviewed' */}
                      <button onClick={() => {
                        const reviewed = JSON.parse(localStorage.getItem("mg_reviewed") || "[]");
                        if (!reviewed.includes(h.id)) reviewed.push(h.id);
                        localStorage.setItem("mg_reviewed", JSON.stringify(reviewed));
                        // refresh force
                        setScreenings(s => [...s]);
                      }} className="px-3 py-1 bg-white border rounded">Mark Reviewed</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="text-sm text-slate-500 mt-4">
        Tips: klik <strong>Export Excel</strong> untuk mengunduh data analitik. Untuk notifikasi browser, izinkan notifikasi pada permintaan pertama kali.
      </div>
    </div>
  );
}
