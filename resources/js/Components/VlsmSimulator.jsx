import React, { useEffect, useRef, useState } from "react";
import { ipToLong, longToIp } from "@/lib/ipUtils"; // Pastikan file ini ada di langkah Tahap 1
import { motion } from "framer-motion";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import DeviceNode from "@/Components/DeviceNode"; // Import Node yg baru kita buat

const nodeTypes = { device: DeviceNode };

// --- Initial Nodes ---
const initialNodes = [
  {
    id: "router",
    type: "device",
    data: {
      label: "ISP / Core",
      type: "router",
      subLabel: "192.168.10.0/24",
    },
    position: { x: 400, y: 50 },
  },
];

export default function VlsmSimulator() {
  const [networkInput, setNetworkInput] = useState("192.168.10.0/24");
  const [requirements, setRequirements] = useState([
    { id: 1, name: "Ruang Guru", hosts: 60 },
    { id: 2, name: "Lab Komputer", hosts: 30 },
    { id: 3, name: "Server", hosts: 5 },
  ]);

  const [isSimulating, setIsSimulating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Logika Simulasi & Hasil
  const [sortedReqs, setSortedReqs] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [logs, setLogs] = useState([]); // Log Visual text

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const rfInstance = useRef(null);

  // --- Input Handlers ---
  const handleReqChange = (id, field, val) => {
    setRequirements(prev => prev.map(r => r.id === id ? { ...r, [field]: field === 'hosts' ? parseInt(val)||0 : val } : r));
  };
  const addReq = () => setRequirements(prev => [...prev, { id: Date.now(), name: '', hosts: 0 }]);
  const removeReq = (id) => setRequirements(prev => prev.filter(r => r.id !== id));

  // --- Core Logic: Start Simulation ---
  const startSimulation = () => {
    // 1. Urutkan dari Host Terbesar (Kunci VLSM)
    const sorted = [...requirements].filter(r => r.hosts > 0).sort((a, b) => b.hosts - a.hosts);
    setSortedReqs(sorted);
    setAllocations([]);
    setLogs([]);
    setStepIndex(0);
    setIsSimulating(true);

    // Reset Topology
    setNodes([{
        id: "router",
        type: "device",
        data: { label: "Core Network", type: "router", subLabel: networkInput },
        position: { x: 400, y: 50 },
    }]);
    setEdges([]);
  };

  // --- Core Logic: Next Step ---
  const nextStep = () => {
    if (stepIndex >= sortedReqs.length) return;

    const req = sortedReqs[stepIndex];
    const needed = req.hosts + 2; // +2 untuk Network & Broadcast ID
    const hostBits = Math.ceil(Math.log2(needed));
    const prefix = 32 - hostBits;
    const allocatedSize = Math.pow(2, hostBits);

    // Hitung IP Base
    let baseIp = networkInput.split('/')[0];
    // Jika sudah ada alokasi sebelumnya, mulai setelah broadcast ID sebelumnya
    if (allocations.length > 0) {
        const prev = allocations[allocations.length - 1];
        const prevBroadcastLong = ipToLong(prev.broadcastId);
        baseIp = longToIp(prevBroadcastLong + 1);
    }

    const startLong = ipToLong(baseIp);
    const networkId = longToIp(startLong);
    const broadcastId = longToIp(startLong + allocatedSize - 1);
    const rangeStart = longToIp(startLong + 1);
    const rangeEnd = longToIp(startLong + allocatedSize - 2);

    // Simpan Hasil
    const newAlloc = {
        name: req.name,
        hostsNeeded: req.hosts,
        networkId,
        prefix,
        broadcastId,
        range: `${rangeStart} - ${rangeEnd}`
    };

    setAllocations(prev => [...prev, newAlloc]);

    // Update Log Visual
    setLogs(prev => [...prev, {
        msg: `Mengalokasikan ${req.name} (${req.hosts} host). Butuh 2^${hostBits} = ${allocatedSize} alamat.`,
        detail: `Network: ${networkId}/${prefix}`
    }]);

    // Update Topologi (React Flow)
    const nodeId = `sub-${stepIndex}`;
    const newNode = {
        id: nodeId,
        type: 'device',
        data: { label: req.name, type: 'subnet', subLabel: `${networkId}/${prefix}` },
        position: { x: 100 + (stepIndex * 200), y: 300 }, // Posisi berjajar ke kanan
    };

    const newEdge = {
        id: `e-${stepIndex}`,
        source: 'router',
        target: nodeId,
        animated: true,
        style: { stroke: '#45b0ac' }
    };

    setNodes(nds => [...nds, newNode]);
    setEdges(eds => [...eds, newEdge]);

    setStepIndex(prev => prev + 1);

    // Auto Focus Camera
    setTimeout(() => rfInstance.current?.fitView({ duration: 800 }), 200);
  };

  const reset = () => {
      setIsSimulating(false);
      setAllocations([]);
      setLogs([]);
      setNodes(initialNodes);
      setEdges([]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* --- Control Panel (Atas) --- */}
      <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10 flex flex-col md:flex-row gap-4 justify-between items-start">

        <div className="flex-1 w-full md:w-auto">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Network Induk (CIDR)</label>
            <input
                value={networkInput}
                onChange={e => setNetworkInput(e.target.value)}
                className="border border-slate-300 rounded px-3 py-2 w-full font-mono text-sm focus:ring-2 focus:ring-net-blue outline-none"
            />
        </div>

        <div className="flex gap-2">
            {!isSimulating ? (
                <button onClick={startSimulation} className="bg-net-blue text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                    Mulai Simulasi
                </button>
            ) : (
                <>
                    <button
                        onClick={nextStep}
                        disabled={stepIndex >= sortedReqs.length}
                        className="bg-net-teal text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-teal-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                    >
                        {stepIndex >= sortedReqs.length ? "Selesai" : "Langkah Berikutnya"}
                    </button>
                    <button onClick={reset} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-200">
                        Reset
                    </button>
                </>
            )}
        </div>
      </div>

      {/* --- Area Utama (Split: Kiri Config, Kanan Visual) --- */}
      <div className="flex-1 flex overflow-hidden">

          {/* Panel Kiri: Input Requirements & Log */}
          <div className="w-1/3 min-w-[300px] bg-white border-r border-slate-200 p-4 overflow-y-auto">
              {!isSimulating ? (
                  <div className="space-y-3">
                      <h3 className="font-bold text-slate-700 border-b pb-2">Daftar Kebutuhan (Ruangan)</h3>
                      {requirements.map(r => (
                          <div key={r.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded border border-slate-100">
                              <input
                                value={r.name} onChange={e => handleReqChange(r.id, 'name', e.target.value)}
                                placeholder="Nama (e.g. HRD)" className="w-full text-sm bg-transparent outline-none font-medium"
                              />
                              <div className="flex items-center bg-white border rounded px-2">
                                  <span className="text-xs text-slate-400 mr-1">PC:</span>
                                  <input
                                    type="number" value={r.hosts} onChange={e => handleReqChange(r.id, 'hosts', e.target.value)}
                                    className="w-12 text-sm outline-none text-center"
                                  />
                              </div>
                              <button onClick={() => removeReq(r.id)} className="text-red-400 hover:text-red-600">×</button>
                          </div>
                      ))}
                      <button onClick={addReq} className="w-full py-2 border-2 border-dashed border-slate-300 text-slate-400 rounded hover:border-net-blue hover:text-net-blue text-sm font-bold transition">
                          + Tambah Ruangan
                      </button>
                  </div>
              ) : (
                  <div className="space-y-4">
                      <h3 className="font-bold text-net-teal border-b pb-2">Hasil Perhitungan</h3>
                      {allocations.map((alloc, i) => (
                          <motion.div
                            key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-50 p-3 rounded border-l-4 border-net-teal shadow-sm"
                          >
                              <div className="flex justify-between mb-1">
                                  <span className="font-bold text-slate-700">{alloc.name}</span>
                                  <span className="text-xs bg-teal-100 text-teal-700 px-1 rounded">/{alloc.prefix}</span>
                              </div>
                              <div className="font-mono text-xs text-slate-500 space-y-1">
                                  <div className="flex justify-between"><span>Network:</span> <span className="text-slate-800">{alloc.networkId}</span></div>
                                  <div className="flex justify-between"><span>Range:</span> <span className="text-slate-800">{alloc.range}</span></div>
                                  <div className="flex justify-between"><span>Broadcast:</span> <span className="text-slate-800">{alloc.broadcastId}</span></div>
                              </div>
                          </motion.div>
                      ))}
                  </div>
              )}
          </div>

          {/* Panel Kanan: Visual Topologi */}
          <div className="flex-1 bg-slate-100 relative">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onInit={inst => rfInstance.current = inst}
                fitView
                attributionPosition="bottom-right"
              >
                  <Background color="#cbd5e1" gap={20} />
                  <Controls className="bg-white shadow-lg border-slate-200 text-slate-600" />
              </ReactFlow>
          </div>
      </div>
    </div>
  );
}
