import React from "react";
import { Button } from "@/components/ui/button";

interface CallControlsProps {
  onStartAudioCall: () => void;
  onStartVideoCall: () => void;
}

export default function CallControls({
  onStartAudioCall,
  onStartVideoCall
}: CallControlsProps) {
  return (
    <div className="p-3 bg-slate-900/60 backdrop-blur-md border-t border-blue-800 flex justify-between items-center">
      <div className="text-blue-300 text-xs">
        LAN-based calls don't use internet data
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={onStartAudioCall}
          variant="outline"
          className="bg-blue-900/40 border-blue-700 text-blue-200 hover:bg-blue-900/60 flex items-center space-x-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span>Voice Call</span>
        </Button>

        <Button
          onClick={onStartVideoCall}
          variant="outline"
          className="bg-cyan-900/40 border-cyan-700 text-cyan-200 hover:bg-cyan-900/60 flex items-center space-x-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span>Video Call</span>
        </Button>
      </div>
    </div>
  );
}
