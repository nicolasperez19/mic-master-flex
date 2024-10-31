import React, { useState, useRef, useEffect } from 'react';
import { Copy, ZoomIn, ZoomOut, PlusCircle, Trash2, Hand, Edit2 } from 'lucide-react';

type Microphone = {
    id: string;
    x: number;
    y: number;
}

type Point = {
    x: number;
    y: number;
}

type Mode = 'pan' | 'add' | 'delete' | 'edit';

const MicMasterFlex = () => {
    const [microphones, setMicrophones] = useState<Microphone[]>([]);
    const [hoveredMic, setHoveredMic] = useState<Microphone | null>(null);
    const [selectedMic, setSelectedMic] = useState<Microphone | null>(null);
    const [zoom, setZoom] = useState(50); // pixels per meter
    const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<Point | null>(null);
    const [mode, setMode] = useState<Mode>('add');
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editX, setEditX] = useState('');
    const [editY, setEditY] = useState('');

    const svgRef = useRef<SVGSVGElement>(null);
    const gridSize = 10; // 10x10 meters grid
    const gridDivisions = 20; // Grid lines every 0.5 meters

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case '1':
                    setMode('pan');
                    break;
                case '2':
                    setMode('add');
                    break;
                case '3':
                    setMode('edit');
                    break;
                case '4':
                    setMode('delete');
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Convert grid coordinates to screen coordinates
    const gridToScreen = (point: Point): Point => ({
        x: (point.x * zoom) + (window.innerWidth / 2) + pan.x,
        y: (-point.y * zoom) + (window.innerHeight / 2) + pan.y,
    });

    // Convert screen coordinates to grid coordinates
    const screenToGrid = (point: Point): Point => ({
        x: ((point.x - (window.innerWidth / 2) - pan.x) / zoom),
        y: -((point.y - (window.innerHeight / 2) - pan.y) / zoom),
    });

    // Handle mouse down on the grid
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        setDragStart(point);
        setIsDragging(true);
    };

    // Handle mouse move
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!svgRef.current || !isDragging || mode !== 'pan') return;

        const rect = svgRef.current.getBoundingClientRect();
        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        if (dragStart) {
            const dx = point.x - dragStart.x;
            const dy = point.y - dragStart.y;
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setDragStart(point);
        }
    };

    // Handle mouse up
    const handleMouseUp = (e: React.MouseEvent) => {
        if (!isDragging || !svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        const gridPoint = screenToGrid(point);

        if (Math.abs(point.x - dragStart!.x) < 5 && Math.abs(point.y - dragStart!.y) < 5) {
            if (mode === 'add') {
                // Add new microphone at exact position
                const newMic: Microphone = {
                    id: `mic-${Date.now()}`,
                    x: gridPoint.x,
                    y: gridPoint.y,
                };
                setMicrophones([...microphones, newMic]);
            } else if (mode === 'delete' && hoveredMic) {
                // Delete microphone
                setMicrophones(mics => mics.filter(m => m.id !== hoveredMic.id));
                setHoveredMic(null);
            } else if (mode === 'edit' && hoveredMic) {
                // Open edit dialog
                setSelectedMic(hoveredMic);
                setEditX(hoveredMic.x.toString());
                setEditY(hoveredMic.y.toString());
                setShowEditDialog(true);
            }
        }

        setIsDragging(false);
        setDragStart(null);
    };

    // Handle coordinate update
    const handleCoordinateUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMic) return;

        const x = parseFloat(editX);
        const y = parseFloat(editY);

        if (isNaN(x) || isNaN(y)) return;

        setMicrophones(mics =>
            mics.map(mic =>
                mic.id === selectedMic.id ? { ...mic, x, y } : mic
            )
        );
        setShowEditDialog(false);
        setSelectedMic(null);
    };

    // Generate grid lines
    const generateGridLines = () => {
        const lines = [];
        const step = gridSize / gridDivisions;

        // Generate vertical lines
        for (let x = -gridSize / 2; x <= gridSize / 2; x += step) {
            const start = gridToScreen({ x, y: -gridSize / 2 });
            const end = gridToScreen({ x, y: gridSize / 2 });
            lines.push(
                <line
                    key={`v-${x}`}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={x === 0 ? "#666" : "#ddd"}
                    strokeWidth={x === 0 ? 2 : 1}
                />
            );
        }

        // Generate horizontal lines
        for (let y = -gridSize / 2; y <= gridSize / 2; y += step) {
            const start = gridToScreen({ x: -gridSize / 2, y });
            const end = gridToScreen({ x: gridSize / 2, y });
            lines.push(
                <line
                    key={`h-${y}`}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={y === 0 ? "#666" : "#ddd"}
                    strokeWidth={y === 0 ? 2 : 1}
                />
            );
        }

        return lines;
    };

    // Generate numpy array string
    const getNumpyArrayString = () => {
        return `np.array([
  ${microphones.map(mic => `[${mic.x.toFixed(4)}, ${mic.y.toFixed(4)}]`).join(',\n  ')}
])`;
    };

    // Copy array to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(getNumpyArrayString());
    };

    // Get cursor style based on mode
    const getCursor = () => {
        switch (mode) {
            case 'pan':
                return 'grab';
            case 'add':
                return 'crosshair';
            case 'delete':
                return 'not-allowed';
            case 'edit':
                return 'pointer';
            default:
                return 'default';
        }
    };

    return (
        <>
            <div className="flex-1 relative border border-gray-300 rounded-lg overflow-hidden bg-white mb-4">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                        onClick={() => setMode('pan')}
                        className={`p-2 bg-white rounded-full shadow hover:bg-gray-100 ${mode === 'pan' ? 'ring-2 ring-blue-500' : ''}`}
                        title="Pan Mode"
                    >
                        <Hand size={20} />
                    </button>
                    <button
                        onClick={() => setMode('add')}
                        className={`p-2 bg-white rounded-full shadow hover:bg-gray-100 ${mode === 'add' ? 'ring-2 ring-blue-500' : ''}`}
                        title="Add Microphone"
                    >
                        <PlusCircle size={20} />
                    </button>
                    <button
                        onClick={() => setMode('edit')}
                        className={`p-2 bg-white rounded-full shadow hover:bg-gray-100 ${mode === 'edit' ? 'ring-2 ring-blue-500' : ''}`}
                        title="Edit Microphone"
                    >
                        <Edit2 size={20} />
                    </button>
                    <button
                        onClick={() => setMode('delete')}
                        className={`p-2 bg-white rounded-full shadow hover:bg-gray-100 ${mode === 'delete' ? 'ring-2 ring-blue-500' : ''}`}
                        title="Delete Microphone"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button
                        onClick={() => setZoom(z => Math.min(z * 1.2, 200))}
                        className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                        title="Zoom In"
                    >
                        <ZoomIn size={20} />
                    </button>
                    <button
                        onClick={() => setZoom(z => Math.max(z / 1.2, 20))}
                        className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                        title="Zoom Out"
                    >
                        <ZoomOut size={20} />
                    </button>
                </div>

                <svg
                    ref={svgRef}
                    className="w-full h-full"
                    style={{ cursor: getCursor() }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => setIsDragging(false)}
                >
                    <g>
                        {generateGridLines()}
                        {microphones.map(mic => {
                            const pos = gridToScreen(mic);
                            return (
                                <g key={mic.id}>
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r={6}
                                        fill={mic === hoveredMic ? "#4299e1" : "#2b6cb0"}
                                        stroke="white"
                                        strokeWidth={2}
                                        onMouseEnter={() => setHoveredMic(mic)}
                                        onMouseLeave={() => setHoveredMic(null)}
                                        style={{ cursor: mode === 'delete' ? 'not-allowed' : 'pointer' }}
                                    />
                                </g>
                            );
                        })}
                    </g>
                </svg>

                {hoveredMic && (
                    <div
                        className="absolute bg-black text-white p-2 rounded text-sm pointer-events-none"
                        style={{
                            left: gridToScreen(hoveredMic).x + 10,
                            top: gridToScreen(hoveredMic).y - 30,
                        }}
                    >
                        ({hoveredMic.x.toFixed(4)}m, {hoveredMic.y.toFixed(4)}m)
                    </div>
                )}

                {showEditDialog && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg z-20">
                        <h3 className="text-lg font-semibold mb-4">Edit Microphone Position</h3>
                        <form onSubmit={handleCoordinateUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">X Coordinate (m)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={editX}
                                    onChange={(e) => setEditX(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Y Coordinate (m)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={editY}
                                    onChange={(e) => setEditY(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditDialog(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <div className="bg-gray-800 text-gray-100 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">Microphone Positions</h2>
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        <Copy size={16} />
                        Copy Array
                    </button>
                </div>
                <pre className="font-mono text-sm overflow-x-auto">
                    {getNumpyArrayString()}
                </pre>
            </div>
        </>
    );
};

export default MicMasterFlex;
