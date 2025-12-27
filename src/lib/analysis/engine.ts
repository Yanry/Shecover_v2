import { Pose, Results } from "@mediapipe/pose";
import { PoseLandmarks } from "./types";

export class PostureEngine {
    private pose: Pose | null = null;
    private onResultsCallback: ((landmarks: PoseLandmarks) => void) | null = null;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        // Dynamically load MediaPipe Pose to avoid SSR issues
        const { Pose } = await import("@mediapipe/pose");

        this.pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            },
        });

        this.pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        this.pose.onResults(this.handleResults);
    }

    private handleResults = (results: Results) => {
        if (!results.poseLandmarks) return;

        const landmarks: PoseLandmarks = results.poseLandmarks.map((lm) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility,
        }));

        if (this.onResultsCallback) {
            this.onResultsCallback(landmarks);
        }
    };

    public setOnResults(callback: (landmarks: PoseLandmarks) => void) {
        this.onResultsCallback = callback;
    }

    public async processFrame(videoElement: HTMLVideoElement) {
        if (this.pose) {
            await this.pose.send({ image: videoElement });
        }
    }

    public close() {
        if (this.pose) {
            this.pose.close();
        }
    }
}
