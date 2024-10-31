export type Microphone = {
    id: string;
    x: number;
    y: number;
}

export type Point = {
    x: number;
    y: number;
}

export type Mode = 'pan' | 'add' | 'delete' | 'edit';

export const gridToScreen = (point: Point, zoom: number, pan: Point): Point => ({
    x: (point.x * zoom) + (window.innerWidth / 2) + pan.x,
    y: (-point.y * zoom) + (window.innerHeight / 2) + pan.y,
});

export const screenToGrid = (point: Point, zoom: number, pan: Point): Point => ({
    x: ((point.x - (window.innerWidth / 2) - pan.x) / zoom),
    y: -((point.y - (window.innerHeight / 2) - pan.y) / zoom),
});

export const handleMouseDown = (
    e: React.MouseEvent,
    svgRef: React.RefObject<SVGSVGElement>,
    setDragStart: React.Dispatch<React.SetStateAction<Point | null>>,
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>
) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };

    setDragStart(point);
    setIsDragging(true);
};

export const handleMouseMove = (
    e: React.MouseEvent,
    svgRef: React.RefObject<SVGSVGElement>,
    isDragging: boolean,
    mode: Mode,
    dragStart: Point | null,
    setPan: React.Dispatch<React.SetStateAction<Point>>,
    setDragStart: React.Dispatch<React.SetStateAction<Point | null>>
) => {
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

export const handleMouseUp = (
    e: React.MouseEvent,
    svgRef: React.RefObject<SVGSVGElement>,
    isDragging: boolean,
    dragStart: Point | null,
    mode: Mode,
    hoveredMic: Microphone | null,
    setMicrophones: React.Dispatch<React.SetStateAction<Microphone[]>>,
    setHoveredMic: React.Dispatch<React.SetStateAction<Microphone | null>>,
    setSelectedMic: React.Dispatch<React.SetStateAction<Microphone | null>>,
    setEditX: React.Dispatch<React.SetStateAction<string>>,
    setEditY: React.Dispatch<React.SetStateAction<string>>,
    setShowEditDialog: React.Dispatch<React.SetStateAction<boolean>>,
    zoom: number,
    pan: Point,
    microphones: Microphone[]
) => {
    if (!isDragging || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };

    const gridPoint = screenToGrid(point, zoom, pan);

    if (Math.abs(point.x - dragStart!.x) < 5 && Math.abs(point.y - dragStart!.y) < 5) {
        if (mode === 'add') {
            const newMic: Microphone = {
                id: `mic-${Date.now()}`,
                x: gridPoint.x,
                y: gridPoint.y,
            };
            setMicrophones([...microphones, newMic]);
        } else if (mode === 'delete' && hoveredMic) {
            setMicrophones(mics => mics.filter(m => m.id !== hoveredMic.id));
            setHoveredMic(null);
        } else if (mode === 'edit' && hoveredMic) {
            setSelectedMic(hoveredMic);
            setEditX(hoveredMic.x.toString());
            setEditY(hoveredMic.y.toString());
            setShowEditDialog(true);
        }
    }

    setIsDragging(false);
    setDragStart(null);
};

export const handleCoordinateUpdate = (
    e: React.FormEvent,
    selectedMic: Microphone | null,
    editX: string,
    editY: string,
    setMicrophones: React.Dispatch<React.SetStateAction<Microphone[]>>,
    setShowEditDialog: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedMic: React.Dispatch<React.SetStateAction<Microphone | null>>
) => {
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

export const generateGridLines = (
    gridSize: number,
    gridDivisions: number,
    zoom: number,
    pan: Point
) => {
    const lines = [];
    const step = gridSize / gridDivisions;

    for (let x = -gridSize / 2; x <= gridSize / 2; x += step) {
        const start = gridToScreen({ x, y: -gridSize / 2 }, zoom, pan);
        const end = gridToScreen({ x, y: gridSize / 2 }, zoom, pan);
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

    for (let y = -gridSize / 2; y <= gridSize / 2; y += step) {
        const start = gridToScreen({ x: -gridSize / 2, y }, zoom, pan);
        const end = gridToScreen({ x: gridSize / 2, y }, zoom, pan);
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

export const getNumpyArrayString = (microphones: Microphone[]) => {
    return `np.array([
  ${microphones.map(mic => `[${mic.x.toFixed(4)}, ${mic.y.toFixed(4)}]`).join(',\n  ')}
])`;
};

export const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
};

export const getCursor = (mode: Mode) => {
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
