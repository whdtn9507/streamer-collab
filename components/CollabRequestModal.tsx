"use client";

import { X } from "lucide-react";
import { useState } from "react";

type Schedule = {
  id: number;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
};

type CollabRequestModalProps = {
  streamerName: string;
  schedule: Schedule;
  onClose: () => void;
};

export default function CollabRequestModal({
  streamerName,
  schedule,
  onClose,
}: CollabRequestModalProps) {
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    alert(
      `${streamerName}님에게 합방 신청을 보냈습니다.\n\n현재는 UI 테스트 단계입니다.`
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              COLLAB REQUEST
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              합방 신청
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="font-semibold text-slate-950">
            {streamerName}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {schedule.date} ({schedule.day})
          </p>

          <p className="text-sm text-slate-500">
            {schedule.startTime} ~ {schedule.endTime}
          </p>
        </div>

        <div className="mt-6">
          <label
            htmlFor="collab-content"
            className="text-sm font-semibold text-slate-700"
          >
            합방 콘텐츠
          </label>

          <input
            id="collab-content"
            type="text"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="예: 배틀그라운드 5인 합방"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="collab-message"
            className="text-sm font-semibold text-slate-700"
          >
            전달 메시지
          </label>

          <textarea
            id="collab-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="시간 조율 가능합니다."
            rows={5}
            className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
          />
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            합방 신청
          </button>
        </div>
      </div>
    </div>
  );
}
