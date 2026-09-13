"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Inbox,
  Send,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

type RequestStatus = "pending" | "accepted" | "rejected";
type RequestTab = "received" | "sent";

type CollabRequest = {
  id: number;
  type: RequestTab;
  streamerName: string;
  platform: string;
  date: string;
  startTime: string;
  endTime: string;
  content: string;
  message: string;
  status: RequestStatus;
};

const initialRequests: CollabRequest[] = [
  {
    id: 1,
    type: "received",
    streamerName: "마라메",
    platform: "치지직",
    date: "2026.09.17",
    startTime: "20:00",
    endTime: "23:00",
    content: "배틀그라운드 듀오",
    message: "1부 배그 합방을 생각하고 있습니다. 시간 조율 가능합니다.",
    status: "pending",
  },
  {
    id: 2,
    type: "received",
    streamerName: "소우밍",
    platform: "치지직",
    date: "2026.09.20",
    startTime: "19:00",
    endTime: "22:00",
    content: "종합게임 합방",
    message: "같이 할 게임은 추후 정해도 괜찮습니다.",
    status: "accepted",
  },
  {
    id: 3,
    type: "sent",
    streamerName: "눈꽃하임",
    platform: "치지직",
    date: "2026.09.21",
    startTime: "18:00",
    endTime: "21:00",
    content: "배틀그라운드",
    message: "시간 괜찮으시면 같이 방송하고 싶습니다.",
    status: "pending",
  },
  {
    id: 4,
    type: "sent",
    streamerName: "김꼬롬",
    platform: "치지직",
    date: "2026.09.23",
    startTime: "20:00",
    endTime: "23:00",
    content: "종합게임",
    message: "편하게 합방 가능한지 확인 부탁드립니다.",
    status: "rejected",
  },
];

const statusConfig = {
  pending: {
    label: "승인 대기",
    className: "bg-amber-50 text-amber-700",
  },
  accepted: {
    label: "승인",
    className: "bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "거절",
    className: "bg-red-50 text-red-600",
  },
};

export default function RequestsPage() {
  const [activeTab, setActiveTab] =
    useState<RequestTab>("received");

  const [requests, setRequests] =
    useState<CollabRequest[]>(initialRequests);

  const filteredRequests = useMemo(
    () =>
      requests.filter(
        (request) => request.type === activeTab
      ),
    [requests, activeTab]
  );

  const pendingReceivedCount = requests.filter(
    (request) =>
      request.type === "received" &&
      request.status === "pending"
  ).length;

  const updateStatus = (
    id: number,
    status: RequestStatus
  ) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? { ...request, status }
          : request
      )
    );
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-blue-600">
            COLLAB REQUESTS
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            합방 신청
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            받은 합방 신청을 승인하거나 거절하고,
            내가 보낸 신청 상태도 확인할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setActiveTab("received")}
            className={
              activeTab === "received"
                ? "flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                : "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50"
            }
          >
            <Inbox size={17} />
            받은 신청

            {pendingReceivedCount > 0 && (
              <span
                className={
                  activeTab === "received"
                    ? "rounded-full bg-white px-2 py-0.5 text-xs text-slate-950"
                    : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                }
              >
                {pendingReceivedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sent")}
            className={
              activeTab === "sent"
                ? "flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                : "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50"
            }
          >
            <Send size={17} />
            보낸 신청
          </button>
        </div>

        <div className="mt-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-950">
              {activeTab === "received"
                ? "받은 합방 신청"
                : "보낸 합방 신청"}
            </h2>

            <span className="text-sm text-slate-500">
              {filteredRequests.length}건
            </span>
          </div>

          {filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const status =
                  statusConfig[request.status];

                return (
                  <article
                    key={request.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-lg font-bold text-white">
                          {request.streamerName.slice(0, 1)}
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-950">
                            {request.streamerName}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {request.platform}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <CalendarDays
                          size={18}
                          className="mt-0.5 text-slate-400"
                        />

                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            합방 날짜
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {request.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock3
                          size={18}
                          className="mt-0.5 text-slate-400"
                        />

                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            시간
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {request.startTime} ~{" "}
                            {request.endTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-xs font-medium text-slate-400">
                        합방 콘텐츠
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {request.content}
                      </p>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-medium text-slate-400">
                        메시지
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {request.message}
                      </p>
                    </div>

                    {activeTab === "received" &&
                      request.status === "pending" && (
                        <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(
                                request.id,
                                "rejected"
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            <XCircle size={17} />
                            거절
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(
                                request.id,
                                "accepted"
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            <CheckCircle2 size={17} />
                            승인
                          </button>
                        </div>
                      )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              {activeTab === "received" ? (
                <Inbox
                  size={30}
                  className="mx-auto text-slate-300"
                />
              ) : (
                <Send
                  size={30}
                  className="mx-auto text-slate-300"
                />
              )}

              <h2 className="mt-4 font-semibold text-slate-800">
                {activeTab === "received"
                  ? "받은 합방 신청이 없습니다."
                  : "보낸 합방 신청이 없습니다."}
              </h2>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm font-semibold text-blue-900">
            현재는 UI 테스트 단계입니다.
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-700">
            승인·거절 상태는 새로고침하면 초기화됩니다.
            Supabase 연결 후 실제 신청 데이터와 연동됩니다.
          </p>
        </div>
      </section>
    </main>
  );
}
