"use client";

import { useCallback, useState } from "react";
import { Upload, FileVideo, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface VideoUploaderProps {
    onVideoSelect: (file: File) => void;
}

export function VideoUploader({ onVideoSelect }: VideoUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith("video/")) {
                    setSelectedFile(file);
                    onVideoSelect(file);
                }
            }
        },
        [onVideoSelect]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setSelectedFile(file);
                onVideoSelect(file);
            }
        },
        [onVideoSelect]
    );

    const clearFile = () => {
        setSelectedFile(null);
    };

    if (selectedFile) {
        return (
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-500/20 rounded-full">
                            <FileVideo className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="font-medium text-white truncate max-w-[200px]">
                                {selectedFile.name}
                            </p>
                            <p className="text-sm text-white/40">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearFile}
                        className="text-white/40 hover:text-white hover:bg-white/10"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center ${isDragging
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept="video/*"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white/5 rounded-full">
                    <Upload className="w-8 h-8 text-white/50" />
                </div>
                <div>
                    <p className="text-lg font-medium text-white">点击或拖拽上传视频</p>
                    <p className="text-sm text-white/40 mt-1">支持 MP4, MOV (建议 10-40秒)</p>
                </div>
            </div>
        </div>
    );
}
