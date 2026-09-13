"use client";

import {
  CalendarDays,
  CalendarPlus,
  Clock3,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";

type Schedule = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
};

const initialSchedules: Schedule[] = [
  {
    id: 1,
    date: "2026-09-15",
    startTime: "20:00",
    endTime: "23:00",
  },
  {
    id: 2,
    date: "2026-09-17",
    startTime: "19:00",
    endTime: "22:00",
  },
];

export default function SchedulePage() {
  const [schedules, setSchedules] =
    useState<Schedule[]>(initialSchedules);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const resetForm = () => {
    setDate("");
    setStartTime("");
    setEndTime("");
    setEditingId(null);
    setFormOpen(false);
  };

  const openCreateForm = () => {
    setDate("");
    setStartTime("");
    setEndTime("");
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (schedule: Schedule) => {
    setDate(schedule.date);
    setStartTime(schedule.startTime);
    setEndTime(schedule.endTime);
    setEditingId(schedule.id);
    setFormOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!date || !startTime || !endTime) {
      alert("날짜와 시간을 모두 입력해주세요.");
      return;
    }

    if (startTime >= endTime) {
      alert("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    if (editingId !== null) {
      setSchedules((current) =>
        current.map((schedule) =>
          schedule.id === editingId
            ? {
                ...schedule,
                date,
                startTime,
                endTime,
              }
            : schedule
        )
      );
    } else {
      const newSchedule: Schedule = {
        id: Date.now(),
        date,
        startTime,
        endTime,
      };

      setSchedules((current) =>
        [...current, newSchedule].sort((a, b) =>
          `${a.date}${a.startTime}`.localeCompare(
            `${b.date}${b.startTime}`
          )
        )
      );
    }

    resetForm();
  };

  const handleDelete = (id: number) => {
    const confirmed = window.confirm(
      "이 합방 가능 일정을 삭제하시겠습니까?"
    );

    if (!confirmed) {
      return;
    }

    setSchedules((current) =>
      current.filter((schedule) => schedule.id !== id)
    );
  };

  const formatDate = (value: string) => {
    const [year, month, day] = value.split("-");
    return `${year}.${month}.${day}`;
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                MY SCHEDULE
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                내 합방 가능 일정
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                다른 스트리머에게 공개할 합방 가능한 날짜와
                시간을 등록합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <CalendarPlus size={18} />
              가능 시간 추가
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  {editingId !== null
                    ? "EDIT SCHEDULE"
                    : "ADD SCHEDULE"}
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {editingId !== null
                    ? "합방 가능 시간 수정"
                    : "합방 가능 시간 추가"}
                </h2>
              </div>

              <button
                type="button"
                onClick={resetForm}
                aria-label="닫기"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label
                  htmlFor="schedule-date"
                  className="text-sm font-semibold text-slate-700"
                >
                  날짜
                </label>

                <input
                  id="schedule-date"
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                  required
                  className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label
                  htmlFor="start-time"
                  className="text-sm font-semibold text-slate-700"
                >
                  시작 시간
                </label>

                <input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(event) =>
                    setStartTime(event.target.value)
                  }
                  required
                  className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label
                  htmlFor="end-time"
                  className="text-sm font-semibold text-slate-700"
                >
                  종료 시간
                </label>

                <input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(event.target.value)
                  }
                  required
                  className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-950"
                />
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                취소
              </button>

              <button
                type="submit"
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {editingId !== null ? "수정 완료" : "일정 등록"}
              </button>
            </div>
          </form>
        )}

        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-slate-950">
            등록된 일정
          </h2>

          <span className="text-sm text-slate-500">
            총 {schedules.length}개
          </span>
        </div>

        {schedules.length > 0 ? (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <article
                key={schedule.id}
                className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <CalendarDays
                      size={21}
                      className="text-slate-600"
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-950">
                      {formatDate(schedule.date)}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <Clock3 size={15} />
                      {schedule.startTime} ~ {schedule.endTime}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(schedule)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 sm:flex-none"
                  >
                    <Pencil size={15} />
                    수정
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(schedule.id)
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 sm:flex-none"
                  >
                    <Trash2 size={15} />
                    삭제
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <CalendarPlus
              size={30}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 font-semibold text-slate-800">
              등록된 합방 가능 시간이 없습니다.
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              가능한 날짜를 등록하면 다른 스트리머가
              확인하고 합방을 신청할 수 있습니다.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              첫 일정 등록하기
            </button>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm font-semibold text-blue-900">
            현재는 UI 테스트 단계입니다.
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-700">
            새로고침하면 등록한 일정이 초기화됩니다.
            Supabase 연결 후에는 실제 계정별 일정으로 저장됩니다.
          </p>
        </div>
      </section>
    </main>
  );
}
