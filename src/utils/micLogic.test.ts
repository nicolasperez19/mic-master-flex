import { gridToScreen, screenToGrid, handleMouseDown, handleMouseMove, handleMouseUp, handleCoordinateUpdate, generateGridLines, getNumpyArrayString, copyToClipboard, getCursor, Microphone, Point, Mode } from './micLogic';

describe('micLogic utility functions', () => {
    test('gridToScreen converts grid coordinates to screen coordinates correctly', () => {
        const point: Point = { x: 1, y: 1 };
        const zoom = 50;
        const pan: Point = { x: 0, y: 0 };
        const screenPoint = gridToScreen(point, zoom, pan);
        expect(screenPoint).toEqual({ x: window.innerWidth / 2 + 50, y: window.innerHeight / 2 - 50 });
    });

    test('screenToGrid converts screen coordinates to grid coordinates correctly', () => {
        const point: Point = { x: window.innerWidth / 2 + 50, y: window.innerHeight / 2 - 50 };
        const zoom = 50;
        const pan: Point = { x: 0, y: 0 };
        const gridPoint = screenToGrid(point, zoom, pan);
        expect(gridPoint).toEqual({ x: 1, y: 1 });
    });

    test('getNumpyArrayString generates correct numpy array string', () => {
        const microphones: Microphone[] = [
            { id: 'mic-1', x: 1.2345, y: 6.7890 },
            { id: 'mic-2', x: 2.3456, y: 7.8901 },
        ];
        const numpyString = getNumpyArrayString(microphones);
        expect(numpyString).toBe(`np.array([
  [1.2345, 6.7890],
  [2.3456, 7.8901]
])`);
    });

    // Add more tests for other utility functions as needed
});
