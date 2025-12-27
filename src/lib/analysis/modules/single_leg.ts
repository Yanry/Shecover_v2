import { PoseLandmarks, AssessmentIssue } from "../types";
import { calculateDistance } from "../calculators";

// MediaPipe Pose Landmark Indices
const HIP_LEFT = 23;
const HIP_RIGHT = 24;
const KNEE_LEFT = 25;
const KNEE_RIGHT = 26;
const SHOULDER_LEFT = 11;
const SHOULDER_RIGHT = 12;

export function analyzeSingleLegStance(landmarks: PoseLandmarks): AssessmentIssue[] {
    const issues: AssessmentIssue[] = [];
    if (!landmarks || landmarks.length < 33) return issues;

    const hipLeft = landmarks[HIP_LEFT];
    const hipRight = landmarks[HIP_RIGHT];
    const kneeLeft = landmarks[KNEE_LEFT];
    const kneeRight = landmarks[KNEE_RIGHT];
    const shoulderLeft = landmarks[SHOULDER_LEFT];
    const shoulderRight = landmarks[SHOULDER_RIGHT];

    // Detect which leg is standing (the one with lower y - higher visible)
    // Actually, standing leg is the one LOWER on screen (higher Y value), but wait, Y increases downwards.
    // Standing foot is usually lower (higher Y).
    // Lifting foot is higher (lower Y).

    // Simple heuristic: compare Ankle Y.
    // For MVP, we might analyze frame by frame.
    // Warning: Static analysis of a dynamic "lifting" phase is hard without state.
    // We check for general pelvic drop.

    const hipDiffY = hipLeft.y - hipRight.y; // Positive if Left is lower (Left tilt), Negative if Right is lower
    const shoulderWidth = calculateDistance(shoulderLeft, shoulderRight);

    // Rule: Trendelenburg Sign (Hip Drop on unsupported side)
    // We check for significant tilt.
    if (Math.abs(hipDiffY) > shoulderWidth * 0.08) {
        issues.push({
            id: "trendelenburg",
            name: "骨盆下沉 (Trendelenburg Sign)",
            riskLevel: Math.abs(hipDiffY) > shoulderWidth * 0.12 ? "high" : "medium",
            description: "发现单腿站立时骨盆向一侧显著下沉，提示臀中肌力量不足。",
            suggestion: "建议加强臀中肌训练（如贝壳式开启、侧卧抬腿）。",
            relatedJoints: [HIP_LEFT, HIP_RIGHT],
            angleValue: Math.abs(hipDiffY)
        })
    }

    // Rule: Knee Valgus (Dynamic calculation needs ankle, simplified here)

    return issues;
}
