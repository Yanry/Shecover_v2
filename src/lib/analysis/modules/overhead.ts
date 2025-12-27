import { PoseLandmarks, AssessmentIssue } from "../types";
import { calculateAngle } from "../calculators";

// MediaPipe Pose Landmark Indices
const EAR_LEFT = 7;
const EAR_RIGHT = 8;
const SHOULDER_LEFT = 11;
const SHOULDER_RIGHT = 12;
const WRIST_LEFT = 15;
const WRIST_RIGHT = 16;
const HIP_LEFT = 23;
const HIP_RIGHT = 24;

export function analyzeOverhead(landmarks: PoseLandmarks): AssessmentIssue[] {
    const issues: AssessmentIssue[] = [];
    if (!landmarks || landmarks.length < 33) return issues;

    const wristLeft = landmarks[WRIST_LEFT];
    const wristRight = landmarks[WRIST_RIGHT];
    const shoulderLeft = landmarks[SHOULDER_LEFT];
    const shoulderRight = landmarks[SHOULDER_RIGHT];
    const earLeft = landmarks[EAR_LEFT];
    const earRight = landmarks[EAR_RIGHT];

    // Check if arms are raised (Wrist Y < Shoulder Y)
    // Remember Y increases downwards.
    const armsRaised = wristLeft.y < shoulderLeft.y && wristRight.y < shoulderRight.y;

    if (armsRaised) {
        // Rule 1: Shoulder Shrugging (Shoulder approaching ears)
        const leftTrapDist = Math.abs(shoulderLeft.y - earLeft.y);
        const rightTrapDist = Math.abs(shoulderRight.y - earRight.y);

        // Threshold: hard to define absolute. We can check if it gets surprisingly small compared to head size?
        // Approximate: Distance between ears.
        const headSize = Math.abs(earLeft.x - earRight.x);

        if (leftTrapDist < headSize * 0.5 || rightTrapDist < headSize * 0.5) {
            issues.push({
                id: "shoulder_shrug",
                name: "耸肩代偿 (Shoulder Shrug)",
                riskLevel: "medium",
                description: "手臂上举时出现耸肩，提示上斜方肌过度代偿，下斜方肌和前锯肌力量不足。",
                suggestion: "练习'沉肩'动作，想象把肩胛骨插进后裤兜里。",
                relatedJoints: [EAR_LEFT, SHOULDER_LEFT, EAR_RIGHT, SHOULDER_RIGHT]
            });
        }

        // Rule 2: Rib Flare / Hyperextension
        // Check if shoulders are WAY behind hips horizontally? (Arching back)
        // On sagittal view this is easy, on frontal view hard.
        // We assume frontal view mostly. Skip for now.
    }

    return issues;
}
