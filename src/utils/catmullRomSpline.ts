import { Quaternion, Vector3 } from "@dcl/sdk/math";

export interface SplinePoint {
    position: Vector3
    rotation: Quaternion
}

export function createCatmullRomSpline(points: Vector3[], nbPoints: number, closed: boolean): Vector3[] {
    if (points.length < 2) {
        throw new Error('At least 2 points are required');
    }

    const result: Vector3[] = [];
    const totalPoints = closed ? nbPoints * points.length : (nbPoints * (points.length - 1)) + 1;
    
    for (let i = 0; i < totalPoints; i++) {
        // Calculate which segment we're in and the local t within that segment
        let segmentIndex: number;
        let localT: number;

        if (closed) {
            const t = i / (nbPoints * points.length);
            segmentIndex = Math.floor(t * points.length);
            localT = (t * points.length) % 1;
        }
        else {
            const t = i / (nbPoints * (points.length - 1));
            segmentIndex = Math.min(Math.floor(t * (points.length - 1)), points.length - 2);
            localT = (t * (points.length - 1)) % 1;
            if (i === totalPoints - 1) {
                localT = 1; // Ensure we reach the last point exactly
            }
        }
        
        let p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3;
        
        if (closed) {
            // For closed curves, wrap around the points array
            p0 = points[(segmentIndex - 1 + points.length) % points.length];
            p1 = points[segmentIndex % points.length];
            p2 = points[(segmentIndex + 1) % points.length];
            p3 = points[(segmentIndex + 2) % points.length];
        }
        else {
            // For open curves, handle edge cases
            if (segmentIndex === 0) {
                // First segment - duplicate first point for start tangent
                p0 = points[0];
                p1 = points[0];
                p2 = points[1];
                p3 = points.length > 2 ? points[2] : points[1];
            } 
            else if (segmentIndex === points.length - 2) {
                // Last segment - duplicate last point for end tangent
                p0 = points[segmentIndex - 1];
                p1 = points[segmentIndex];
                p2 = points[segmentIndex + 1];
                p3 = points[segmentIndex + 1];
            } 
            else {
                // Middle segments
                p0 = points[segmentIndex - 1];
                p1 = points[segmentIndex];
                p2 = points[segmentIndex + 1];
                p3 = points[segmentIndex + 2];
            }
        }

        const point = Vector3.catmullRom(p0, p1, p2, p3, localT);
        result.push(point);
    }

    return result;
}
export function createCatmullRomSplineWithRotation(
    points: SplinePoint[],
    nbPoints: number,
    rotationBlend: number = 0.5,
    closed?: boolean
): SplinePoint[] {
    if (points.length < 2) {
        throw new Error('At least 2 points are required');
    }

    // Generate position spline
    const positions = createCatmullRomSpline(
        points.map(p => p.position),
        nbPoints,
        closed ?? false
    );

    const result: SplinePoint[] = [];
    const totalPoints = closed ? nbPoints * points.length : (nbPoints * (points.length - 1)) + 1;

    // Pre-calculate tangents for path-based rotation
    const tangents: Vector3[] = [];
    for (let i = 0; i < positions.length - 1; i++) {
        const direction = Vector3.subtract(positions[i + 1], positions[i]);
        tangents.push(Vector3.normalize(direction));
    }
    tangents.push(closed ? tangents[0] : tangents[tangents.length - 1]);

    for (let i = 0; i < totalPoints; i++) {
        const t = i / (closed ? (nbPoints * points.length) : (nbPoints * (points.length - 1)));
        const localT = (t * (points.length - (closed ? 0 : 1))) % 1;
        let segmentIndex = Math.floor(t * (points.length - (closed ? 0 : 1)));

        if (closed) {
            segmentIndex = segmentIndex % points.length;
        }

        // Check if this point coincides with a control point
        const isControlPoint = Math.abs(localT) < 0.001;
        const controlPointIndex = segmentIndex;

        if (rotationBlend === 0 && isControlPoint && controlPointIndex < points.length) {
            // Use exact control point rotation
            result.push({
                position: positions[Math.min(i, positions.length - 1)],
                rotation: points[controlPointIndex].rotation
            });
            continue;
        }

        // Get control point rotations to interpolate between
        const q1 = points[segmentIndex].rotation;
        const q2 = closed 
            ? points[(segmentIndex + 1) % points.length].rotation
            : points[Math.min(segmentIndex + 1, points.length - 1)].rotation;

        // Direct interpolation between control point rotations
        const controlRotation = Quaternion.slerp(q1, q2, localT);

        if (rotationBlend === 0) {
            result.push({
                position: positions[Math.min(i, positions.length - 1)],
                rotation: controlRotation
            });
            continue;
        }

        // Calculate path-based rotation from tangent
        const tangent = tangents[Math.min(i, tangents.length - 1)];
        const up = Vector3.Up();
        
        const right = Math.abs(Vector3.dot(tangent, up)) > 0.99 
            ? Vector3.cross(Vector3.Right(), tangent)
            : Vector3.cross(up, tangent);
            
        const pathUp = Vector3.cross(tangent, right);
        const pathRotation = Quaternion.lookRotation(tangent, pathUp);

        // Blend between control point rotation and path-based rotation
        const finalRotation = Quaternion.slerp(controlRotation, pathRotation, rotationBlend);

        result.push({
            position: positions[Math.min(i, positions.length - 1)],
            rotation: finalRotation
        });
    }

    return result;
}