import React, { useEffect, useMemo } from 'react';
import ReactFlow, { Background, Controls, Handle, Position, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { FaNetworkWired, FaLaptop, FaGlobe, FaEthernet } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- CUSTOM NODE DENGAN DARK MODE ---
const DeviceNode = ({ data }) => {
    let Icon = FaNetworkWired;
    // Default Style (PC / Generic)
    let bgClass = "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600";
    let iconColor = "text-slate-500 dark:text-slate-400";
    let shadowClass = "";

    // Router Style
    if (data.type === 'router') {
        Icon = FaGlobe;
        bgClass = "bg-blue-50 dark:bg-blue-950/40 border-blue-500 dark:border-blue-400";
        iconColor = "text-blue-600 dark:text-blue-400";
        shadowClass = "shadow-lg shadow-blue-200 dark:shadow-blue-900/20";
    }
    // Switch Style
    else if (data.type === 'switch') {
        Icon = FaEthernet;
        bgClass = "bg-teal-50 dark:bg-teal-950/40 border-teal-500 dark:border-teal-400";
        iconColor = "text-teal-600 dark:text-teal-400";
        shadowClass = "shadow-md shadow-teal-200 dark:shadow-teal-900/20";
    }
    // PC Style
    else if (data.type === 'pc') {
        Icon = FaLaptop;
        bgClass = "bg-slate-50 dark:bg-slate-800 border-slate-400 dark:border-slate-600";
        iconColor = "text-slate-600 dark:text-slate-400";
    }

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`px-4 py-3 rounded-xl border-2 min-w-[160px] text-center transition-colors duration-300 ${bgClass} ${shadowClass}`}
        >
            <Handle type="target" position={Position.Top} className="!bg-slate-400 dark:!bg-slate-500 !w-3 !h-3" />

            <div className="flex flex-col items-center">
                <div className={`p-2 rounded-full mb-2 bg-white/50 dark:bg-black/20 ${iconColor}`}>
                    <Icon className="text-xl" />
                </div>

                <div className="font-bold text-xs text-slate-700 dark:text-slate-200">{data.label}</div>

                {/* IP LABEL */}
                {data.ip && (
                    <div className="mt-1 px-2 py-0.5 rounded border text-[10px] font-mono font-bold shadow-sm whitespace-nowrap bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        {data.ip}
                    </div>
                )}

                {/* SUB LABEL */}
                {data.subLabel && (
                    <div className="text-[9px] mt-0.5 font-bold uppercase text-slate-500 dark:text-slate-400">
                        {data.subLabel}
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-slate-400 dark:!bg-slate-500 !w-3 !h-3" />
        </motion.div>
    );
};

// --- GRAPH UTAMA ---
function TopologyGraph({ allocations, masterNetwork }) {
    const { setCenter } = useReactFlow();

    // PERBAIKAN: Gunakan useMemo untuk nodeTypes agar tidak re-render terus menerus
    const nodeTypes = useMemo(() => ({ device: DeviceNode }), []);

    const { nodes, edges } = useMemo(() => {
        const newNodes = [];
        const newEdges = [];

        // 1. CORE ROUTER
        const coreIp = masterNetwork ? masterNetwork.split('/')[0] : '...';

        newNodes.push({
            id: 'router-main',
            type: 'device',
            position: { x: 400, y: 0 },
            data: { label: 'Core Router', type: 'router', ip: coreIp, subLabel: 'ISP Gateway' }
        });

        // 2. GENERATE SUBNETS
        allocations.forEach((alloc, index) => {
            const xPos = 100 + (index * 280);
            const switchId = `sw-${index}`;
            const pcId = `pc-${index}`;

            // SWITCH
            newNodes.push({
                id: switchId,
                type: 'device',
                position: { x: xPos, y: 200 },
                data: {
                    label: alloc.name,
                    type: 'switch',
                    ip: alloc.networkId,
                    subLabel: `Prefix: /${alloc.prefix}`
                }
            });

            newEdges.push({
                id: `e-r-${index}`,
                source: 'router-main',
                target: switchId,
                animated: true,
                // Warna kabel disesuaikan agar terlihat di dark & light (Teal agak terang)
                style: { stroke: '#2dd4bf', strokeWidth: 2 },
            });

            // PC (HOST RANGE)
            newNodes.push({
                id: pcId,
                type: 'device',
                position: { x: xPos, y: 400 },
                data: {
                    label: 'Host Range',
                    type: 'pc',
                    ip: `${alloc.rangeStart} - ${alloc.rangeEnd}`,
                    subLabel: `${alloc.hosts} PC`
                }
            });

            newEdges.push({
                id: `e-sw-${index}`,
                source: switchId,
                target: pcId,
                // Warna kabel abu-abu terang agar terlihat di gelap
                style: { stroke: '#94a3b8', strokeWidth: 1.5 },
            });
        });

        return { nodes: newNodes, edges: newEdges };
    }, [allocations, masterNetwork]);

    // Efek Kamera
    useEffect(() => {
        if (allocations.length > 0) {
            const lastIndex = allocations.length - 1;
            const xPos = 100 + (lastIndex * 280);
            setCenter(xPos, 250, { zoom: 0.9, duration: 800 });
        } else {
            setCenter(400, 100, { zoom: 1.2, duration: 800 });
        }
    }, [allocations, setCenter]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes} // Memakai nodeTypes yang sudah di-memoize
            fitView
            attributionPosition="bottom-right"
            panOnScroll={false}
            panOnDrag={true}
            zoomOnScroll={false}
            preventScrolling={true}
            style={{ touchAction: 'none' }}
        >
            {/* Background titik-titik (Dots) */}
            <Background color="#94a3b8" gap={30} size={1} />

            {/* Controls Zoom (+/-) dengan Dark Mode */}
            <Controls className='bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg [&>button]:!fill-slate-600 [&>button]:dark:!fill-slate-300 [&>button:hover]:!bg-slate-50 [&>button:hover]:dark:!bg-slate-700' />
        </ReactFlow>
    );
}

export default function NetworkTopologyGraph(props) {
    return (
        <ReactFlowProvider>
            {/* Container Utama dengan Background Dark Mode */}
            <div className="w-full h-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300" style={{ touchAction: 'none' }}>
                <TopologyGraph {...props} />
            </div>
        </ReactFlowProvider>
    );
}
