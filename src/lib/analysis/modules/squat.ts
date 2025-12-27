import { PoseLandmarks, AssessmentIssue } from "../types";

// MediaPipe Pose Landmark Indices
const HIP_LEFT = 23;
const HIP_RIGHT = 24;
const KNEE_LEFT = 25;
const KNEE_RIGHT = 26;
const ANKLE_LEFT = 27;
const ANKLE_RIGHT = 28;
const SHOULDER_LEFT = 11;
const SHOULDER_RIGHT = 12;

export function analyzeSquat(landmarks: PoseLandmarks): AssessmentIssue[] {
    const issues: AssessmentIssue[] = [];
    if (!landmarks || landmarks.length < 33) return issues;

    const kneeLeft = landmarks[KNEE_LEFT];
    const kneeRight = landmarks[KNEE_RIGHT];
    const hipLeft = landmarks[HIP_LEFT];
    const hipRight = landmarks[HIP_RIGHT];
    const ankleLeft = landmarks[ANKLE_LEFT];
    const ankleRight = landmarks[ANKLE_RIGHT];

    // 1. Knee Valgus Check (Knees caving in)
    // Compare Knee X distance vs Ankle X distance vs Hip X distance
    const kneeDist = Math.abs(kneeLeft.x - kneeRight.x);
    const footDist = Math.abs(ankleLeft.x - ankleRight.x);
    const hipDist = Math.abs(hipLeft.x - hipRight.x);

    // If Knee Distance is significantly smaller than Foot Distance/Hip Distance while squatting
    // We need to know if they are squatting. Check Y depth.
    const depth = Math.min(hipLeft.y, hipRight.y) - Math.min(kneeLeft.y, kneeRight.y);
    // Note: Y increases downwards. Hip needs to be close to Knee Y.

    // Check if "Low enough" to be a squat. Hip Y > Knee Y - 0.1 (Hip is below or near knee level) ??
    // No, Hip starts high (small Y). Knee starts high. 
    // Standing: Hip Y < Knee Y. 
    // Squatting: Hip Y increases, approaches Knee Y.

    const isSquatting = (meanY(hipLeft, hipRight) > meanY(kneeLeft, kneeRight) - 0.15); // Hips close to knees vertically

    if (isSquatting) {
        if (kneeDist < footDist * 0.8) {
            issues.push({
                id: "knee_valgus",
                name: "膝内扣 (Knee Valgus)",
                riskLevel: "high",
                description: "下蹲时膝盖内收，这是由于臀中肌无力或足踝受限导致的常见代偿，容易引发 ACL 损伤。",
                suggestion: "下蹲时想象双脚向外撕裂地板，并在膝盖套上弹力带进行对抗训练。",
                relatedJoints: [KNEE_LEFT, KNEE_RIGHT]
            });
        }

        // 2. Trunk Lean check?
        // Compare shoulder mid X to hip mid X? (Lateral shift)
        // Or forward lean (Z axis? Hard on 2D)
    }

    return issues;
}

function meanY(a: any, b: any) {
    return (a.y + b.y) / 2;
}
