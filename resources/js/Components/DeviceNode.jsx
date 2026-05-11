import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaNetworkWired, FaServer, FaLaptop } from 'react-icons/fa';

export default function DeviceNode({ data }) {
    // Tentukan Icon berdasarkan tipe device
    let Icon = FaNetworkWired;
    let bgClass = "bg-white border-slate-300";

    if (data.type === 'router') {
        Icon = FaServer;
        bgClass = "bg-blue-50 border-blue-400 shadow-md shadow-blue-100";
    } else if (data.type === 'subnet') {
        Icon = FaNetworkWired;
        bgClass = "bg-green-50 border-green-400 shadow-md shadow-green-100";
    }

    return (
        <div className={`px-4 py-3 rounded-xl border-2 min-w-[150px] text-center transition-all ${bgClass}`}>
            {/* Handle (Titik koneksi kabel) */}
            <Handle type="target" position={Position.Top} className="!bg-slate-400" />

            <div className="flex flex-col items-center">
                <div className={`p-2 rounded-full mb-2 ${data.type === 'router' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    <Icon size={20} />
                </div>

                <div className="font-bold text-slate-700 text-sm">{data.label}</div>
                <div className="text-xs text-slate-500 font-mono bg-white/50 px-2 py-0.5 rounded mt-1">
                    {data.subLabel}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
        </div>
    );
}
