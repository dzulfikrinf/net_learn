import React from 'react';
import FlsmVisualizer from './FlsmVisualizer';
import VlsmVisualizer from './VlsmVisualizer';

// Terima props: moduleType (dari database) dan config (manual/auto)
export default function SubnetVisualizerWrapper({ moduleType, config = {} }) {

    // Ambil mode dari config, default manual
    const simulationMode = config.mode || 'manual';

    return (
        <div className="w-full h-full flex flex-col font-sans bg-slate-50">

            {/* Header Sederhana (Tanpa Tab Switcher) */}
            <div className="bg-white px-6 py-3 border-b border-slate-200 flex justify-between items-center shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${simulationMode === 'auto' ? 'bg-purple-500' : 'bg-green-500'} animate-pulse shadow-sm`}></div>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {moduleType === 'simulator_flsm' ? 'FLSM Laboratory' : 'VLSM Laboratory'}
                        <span className="text-slate-400 ml-1">({simulationMode === 'auto' ? 'Demonstrasi Otomatis' : 'Praktikum Manual'})</span>
                    </span>
                </div>
            </div>

            {/* Render sesuai Tipe dari Database */}
            <div className="flex-1 relative overflow-hidden">
                 {moduleType === 'simulator_flsm' ? (
                    <FlsmVisualizer initialMode={simulationMode} />
                 ) : (
                    <VlsmVisualizer initialMode={simulationMode} />
                 )}
            </div>
        </div>
    );
}
