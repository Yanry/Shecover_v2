import { PoseLandmarks, AssessmentIssue } from "../types";

// MediaPipe Pose Landmark Indices
const ANKLE_LEFT = 27;
const ANKLE_RIGHT = 28;
const WRIST_LEFT = 15;
const WRIST_RIGHT = 16;
const SHOULDER_LEFT = 11;
const SHOULDER_RIGHT = 12;

export function analyzeWalking(landmarks: PoseLandmarks): AssessmentIssue[] {
    const issues: AssessmentIssue[] = [];
    if (!landmarks || landmarks.length < 33) return issues;

    // Gait analysis usually requires tracking over time (temporal).
    // For a single frame analyzer, we can check specific phases if caught, but it's unreliable.
    // However, we can check for *extreme* asymmetries if we happen to catch stride extremes.

    // Since we are building a "Real-time" highlighter, we likely need a stateful analyzer for Gait.
    // For this MVP step, we will implement a "Symmery" check that triggers only when feet are far apart (mid-stride).

    const ankleLeft = landmarks[ANKLE_LEFT];
    const ankleRight = landmarks[ANKLE_RIGHT];

    // Check separation distance
    const strideWidth = Math.abs(ankleLeft.x - ankleRight.x);

    // Only analyze if taking a step
    if (strideWidth > 0.1) {
        // Rule: Arm Swing Symmetry (at peak stride)
        // Check if wrists are moving opposite to ankles? 
        // Hard to do velocity without state.

        // We'll stick to a simple placeholder for "Walking" that warns about uneven arm height if detected.
        const wristLeft = landmarks[WRIST_LEFT];
        const wristRight = landmarks[WRIST_RIGHT];
        const shoulderLeft = landmarks[SHOULDER_LEFT];
        const shoulderRight = landmarks[SHOULDER_RIGHT];

        // Calculate arm distance from center
        const leftArmDist = Math.abs(wristLeft.x - shoulderLeft.x);
        const rightArmDist = Math.abs(wristRight.x - shoulderRight.x);

        if (Math.abs(leftArmDist - rightArmDist) > 0.15) {
            issues.push({
                id: "arm_asymmetry",
                name: "摆臂不对称 (Arm Swing Asymmetry)",
                riskLevel: "medium",
                description: "行走时双臂摆动幅度明显不一致，可能影响躯干旋转平衡。",
                suggestion: "尝试在镜子前原地摆臂，寻找对称的节奏感。",
                relatedJoints: [WRIST_LEFT, WRIST_RIGHT]
            })
        }
    }

    return issues;
}
