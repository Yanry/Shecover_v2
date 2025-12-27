import { PoseLandmarks, AssessmentIssue } from "../types";

// MediaPipe Pose Landmark Indices
const HIP_LEFT = 23;
const HIP_RIGHT = 24;
const KNEE_LEFT = 25;
const KNEE_RIGHT = 26;
const ANKLE_LEFT = 27;
const ANKLE_RIGHT = 28;

export function analyzeClimbing(landmarks: PoseLandmarks): AssessmentIssue[] {
    const issues: AssessmentIssue[] = [];
    if (!landmarks || landmarks.length < 33) return issues;

    // Climbing Analysis is dynamic.
    // For MVP real-time frames, we check for "High Step" or "Load" positions.

    const kneeLeft = landmarks[KNEE_LEFT];
    const kneeRight = landmarks[KNEE_RIGHT];
    const ankleLeft = landmarks[ANKLE_LEFT];
    const ankleRight = landmarks[ANKLE_RIGHT];
    const hipLeft = landmarks[HIP_LEFT];
    const hipRight = landmarks[HIP_RIGHT];

    // 1. detect Knee Valgus on High Steps
    // If Knee Y < Hip Y + 0.2 (High step roughly)
    // And Knee X is inward relative to Ankle X
    checkValgus(issues, hipLeft, kneeLeft, ankleLeft, "Left");
    checkValgus(issues, hipRight, kneeRight, ankleRight, "Right");

    return issues;
}

function checkValgus(issues: AssessmentIssue[], hip: any, knee: any, ankle: any, side: string) {
    // Valgus = Knee collapses inward.
    // For Left Leg (Screen Left usually), Inward is +X (towards center).
    // Actually, Left Leg on screen depends on camera. Assume frontal self-view (Mirror).
    // Left Leg is on Left side of screen. Inward is Right (+X).

    // Check if Knee X is significantly "Inside" the Ankle X
    // (Relative to Hip-Ankle line)

    // Simple heuristic: If Knee X is > Ankle X (for Left leg) -> Valgus?
    // Let's use absolute deviation for MVP simplicity.
    const inwardBias = side === "Left" ? (knee.x - ankle.x) : (ankle.x - knee.x);

    // If inward bias is large
    if (inwardBias > 0.08) {
        issues.push({
            id: `climb_valgus_${side}`,
            name: `${side === 'Left' ? '左' : '右'}膝内扣 (Knee Valgus)`,
            riskLevel: inwardBias > 0.15 ? "high" : "medium",
            description: `发力时${side === 'Left' ? '左' : '右'}膝出现明显内扣，增加了韧带撕裂风险。`,
            suggestion: "尝试打开髋关节，保持膝盖指向脚尖方向。",
            relatedJoints: side === 'Left' ? [25, 27] : [26, 28]
        });
    }
}
