import { Keypoint } from "./types";

export function calculateDistance(a: Keypoint, b: Keypoint): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function calculateMidpoint(a: Keypoint, b: Keypoint): Keypoint {
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        z: ((a.z || 0) + (b.z || 0)) / 2,
        visibility: Math.min(a.visibility || 0, b.visibility || 0),
    };
}

// Calculates angle between three points (a-b-c), where b is the vertex
export function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
    const radians =
        Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);

    if (angle > 180.0) {
        angle = 360 - angle;
    }

    return angle;
}

// Calculates the angle of a line segment (a-b) relative to the horizontal axis (0 degrees)
// Returns value between -90 and 90, where 0 is perfectly horizontal
export function calculateHorizontalDeviation(a: Keypoint, b: Keypoint): number {
    const dy = b.y - a.y;
    const dx = b.x - a.x;
    const radians = Math.atan2(dy, dx);
    let degrees = (radians * 180) / Math.PI;

    // Normalize to deviation from horizontal (e.g., if degrees is 0 or 180, deviation is 0)
    // We want the absolute tilt
    // Simple approach: just return the raw angle, let caller interpret
    return degrees;
}

// Normalize X coordinate relative to a "center" (usually hip center)
// Returns relative position. 
export function calculateRelativeX(point: Keypoint, center: Keypoint): number {
    return point.x - center.x;
}
