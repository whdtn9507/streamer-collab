"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Radio } from "lucide-react";
import { useState } from "react";
import CollabRequestModal from "@/components/CollabRequestModal";
import { getStreamerById } from "@/lib/streamers";

export default function StreamerDetailPage() {
  const params = useParams<{ id: string }>();
  const streamer = getStreamerById(Number(params.id));

  const [selectedScheduleId, setSelectedScheduleId] =
    useState<number | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  if (!streamer) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-950">
          스트리머를 찾을 수 없습니다.
        </h1>

        <Link
          href="/streamers"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
        >
          <ArrowLeft size={17} />
          스트리머 목록으로 돌아가기
        </Link>
      </main>
    );
  }

  const selectedSchedule = streamer.schedules.find(
    (schedule) => schedule.id === selectedScheduleId
  );

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/streamers"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950"
        >
          <ArrowLeft size={17} />
          스트리머 목록
        </Link>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-950 text-3xl font-bold text-white">
              {streamer.nickname.slice(0, 1)}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-950">
                  {streamer.nickname}
                </h1>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  합방 가능
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <Radio size={16} />
                {streamer.platform}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {streamer.category.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600">
                {streamer.description}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="text-sm font-semibold text-blue-600">
            AVAILABLE SCHEDULE
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            합방 가능한 일정
          </h2>

          <div className="mt-7 space-y-3">
            {streamer.schedules.map((schedule) => {
              const selected = selectedScheduleId === schedule.id;

              return (
                <button
                  key={schedule.id}
                  type="button"
                  onClick={() => setSelectedScheduleId(schedule.id)}
                  className={
                    selected
                      ? "flex w-full items-center justify-between rounded-xl border-2 border-slate-950 bg-slate-50 p-5 text-left"
                      : "flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-5 text-left hover:border-slate-400"
                  }
                >
                  <div className="flex items-center gap-4">
                    <CalendarDays size={20} />

                    <div>
                      <p className="font-semibold">
                        {schedule.date} ({schedule.day})
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {schedule.startTime} ~ {schedule.endTime}
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      selected
                        ? "h-5 w-5 rounded-full border-[6px] border-slate-950"
                        : "h-5 w-5 rounded-full border-2 border-slate-300"
                    }
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={!selectedSchedule}
            onClick={() => setModalOpen(true)}
            className="mt-7 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white disabled:bg-slate-300"
          >
            선택한 일정으로 합방 신청
          </button>
        </section>
      </div>

      {modalOpen && selectedSchedule && (
        <CollabRequestModal
          streamerName={streamer.nickname}
          schedule={selectedSchedule}
          onClose={() => setModalOpen(false)}
        />
      )}
    </main>
  );
}
