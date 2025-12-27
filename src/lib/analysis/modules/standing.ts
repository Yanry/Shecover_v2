import { PoseLandmarks, AssessmentIssue } from "../types";
import { calculateMidpoint, calculateDistance } from "../calculators";

// MediaPipe Pose Landmark Indices
const NOSE = 0;
const SHOULDER_LEFT = 11;
const SHOULDER_RIGHT = 12;
const HIP_LEFT = 23;
const HIP_RIGHT = 24;
const ANKLE_LEFT = 27;
const ANKLE_RIGHT = 28;

export function analyzeNaturalStanding(landmarks: PoseLandmarks): AssessmentIssue[] {
    const issues: AssessmentIssue[] = [];

    if (!landmarks || landmarks.length < 33) return issues;

    // 1. Check Visibility of Key Joints
    const keyPoints = [SHOULDER_LEFT, SHOULDER_RIGHT, HIP_LEFT, HIP_RIGHT, ANKLE_LEFT, ANKLE_RIGHT];
    const allVisible = keyPoints.every(idx => (landmarks[idx].visibility || 0) > 0.65);

    if (!allVisible) {
        // If not visible, we might skip analysis or return a warning
        return issues;
    }

    // --- Calculations ---

    // Shoulders
    const shoulderLeft = landmarks[SHOULDER_LEFT];
    const shoulderRight = landmarks[SHOULDER_RIGHT];
    const shoulderDiffY = Math.abs(shoulderLeft.y - shoulderRight.y);

    // Hips
    const hipLeft = landmarks[HIP_LEFT];
    const hipRight = landmarks[HIP_RIGHT];
    const hipDiffY = Math.abs(hipLeft.y - hipRight.y);

    // Head / Center Alignment
    // Calculate Mid-Shoulder and Mid-Hip
    const shoulderMid = calculateMidpoint(shoulderLeft, shoulderRight);
    const hipMid = calculateMidpoint(hipLeft, hipRight);
    const nose = landmarks[NOSE];

    // Deviation of Nose from Vertical Axis (defined by Hip Mid)
    // We strictly use X-deviation relative to Hip Mid
    const noseDeviationX = Math.abs(nose.x - hipMid.x);

    // Normalize thresholds based on shoulder width (approximate body scale)
    const shoulderWidth = calculateDistance(shoulderLeft, shoulderRight);

    // --- Risk Rules ---

    // Rule 1: High/Low Shoulder
    // Threshold: > 5% of shoulder width vertical difference
    if (shoulderDiffY > shoulderWidth * 0.05) {
        issues.push({
            id: "uneven_shoulders",
            name: "高低肩 (Uneven Shoulders)",
            riskLevel: shoulderDiffY > shoulderWidth * 0.08 ? "high" : "medium",
            description: "发现您的左右肩膀高度不一致，这可能与长期单侧受力或脊柱侧弯有关。",
            suggestion: "尝试对着镜子练习耸肩和沉肩，放松斜方肌，保持双肩水平。",
            relatedJoints: [SHOULDER_LEFT, SHOULDER_RIGHT],
        });
    }

    // Rule 2: Pelvic Tilt (Lateral)
    if (hipDiffY > shoulderWidth * 0.05) {
        issues.push({
            id: "pelvic_tilt",
            name: "骨盆倾斜 (Pelvic Tilt)",
            riskLevel: hipDiffY > shoulderWidth * 0.08 ? "high" : "medium",
            description: "骨盆左右高度不一致，可能是长短腿或核心肌群力量不平衡导致的。",
            suggestion: "建议加强核心稳定性训练，并检查是否有功能性长短腿问题。",
            relatedJoints: [HIP_LEFT, HIP_RIGHT],
        });
    }

    // Rule 3: Head Forward / Deviation (Frontal Plane only for now)
    if (noseDeviationX > shoulderWidth * 0.1) {
        issues.push({
            id: "head_deviation",
            name: "头部侧偏 (Head Deviation)",
            riskLevel: "medium",
            description: "头部偏离身体中轴线，可能导致颈部肌肉持续紧张。",
            suggestion: "注意收下巴，让耳朵与肩膀对齐，放松颈部。",
            relatedJoints: [NOSE, HIP_LEFT, HIP_RIGHT], // Highlight nose vs hips
        });
    }

    return issues;
}
