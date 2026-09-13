"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Inbox,
  Loader2,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type RequestStatus =
  | "pending"
  | "accepted"
  | "rejected";

type RequestTab =
  | "received"
  | "sent";

type RequestRow = {
  id: number;
  requester_id: string;
  receiver_id: string;
  start_at: string;
  end_at: string;
  content: string;
  message: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  nickname: string;
  platform: string;
};

type CollabRequest = RequestRow & {
  type: RequestTab;
  streamerName: string;
  platform: string;
};

const statusConfig = {
  pending: {
    label: "승인 대기",
    className:
      "bg-amber-50 text-amber-700",
  },
  accepted: {
    label: "승인",
    className:
      "bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "거절",
    className:
      "bg-red-50 text-red-600",
  },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date(iso));
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export default function RequestsPage() {
  const router = useRouter();

  const [userId, setUserId] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<RequestTab>("received");

  const [requests, setRequests] =
    useState<CollabRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadRequests = useCallback(
    async (uid: string) => {
      setLoading(true);
      setErrorMessage(null);

      const {
        data: requestData,
        error: requestError,
      } = await supabase
        .from("collab_requests")
        .select(
          `
          id,
          requester_id,
          receiver_id,
          start_at,
          end_at,
          content,
          message,
          status,
          created_at,
          updated_at
          `
        )
        .or(
          `requester_id.eq.${uid},receiver_id.eq.${uid}`
        )
        .order("created_at", {
          ascending: false,
        });

      if (requestError) {
        setErrorMessage(
          `신청 목록을 불러오지 못했습니다: ${requestError.message}`
        );
        setLoading(false);
        return;
      }

      const rows =
        (requestData ?? []) as RequestRow[];

      const otherUserIds = [
        ...new Set(
          rows.map((request) =>
            request.requester_id === uid
              ? request.receiver_id
              : request.requester_id
          )
        ),
      ];

      let profileMap =
        new Map<string, ProfileRow>();

      if (otherUserIds.length > 0) {
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "id, nickname, platform"
          )
          .in("id", otherUserIds);

        if (profileError) {
          setErrorMessage(
            `스트리머 정보를 불러오지 못했습니다: ${profileError.message}`
          );
          setLoading(false);
          return;
        }

        profileMap = new Map(
          (
            (profileData ?? []) as ProfileRow[]
          ).map((profile) => [
            profile.id,
            profile,
          ])
        );
      }

      const mapped: CollabRequest[] =
        rows.map((request) => {
          const type: RequestTab =
            request.receiver_id === uid
              ? "received"
              : "sent";

          const otherUserId =
            type === "received"
              ? request.requester_id
              : request.receiver_id;

          const profile =
            profileMap.get(otherUserId);

          return {
            ...request,
            type,
            streamerName:
              profile?.nickname ??
              "알 수 없는 스트리머",
            platform:
              profile?.platform ?? "-",
          };
        });

      setRequests(mapped);
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { user },
        error,
      } =
        await supabase.auth.getUser();

      if (error || !user) {
        router.replace(
          "/auth/login"
        );
        return;
      }

      setUserId(user.id);

      await loadRequests(user.id);
    };

    void initialize();
  }, [loadRequests, router]);

  const filteredRequests =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            request.type === activeTab
        ),
      [requests, activeTab]
    );

  const pendingReceivedCount =
    requests.filter(
      (request) =>
        request.type ===
          "received" &&
        request.status === "pending"
    ).length;

  const updateStatus = async (
    id: number,
    status: "accepted" | "rejected"
  ) => {
    if (!userId) return;

    setUpdatingId(id);
    setErrorMessage(null);

    /*
     * 1. 승인 / 거절 DB 처리
     */
    if (status === "accepted") {
      const { error } =
        await supabase.rpc(
          "accept_collab_request",
          {
            p_request_id: id,
          }
        );

      if (error) {
        let message =
          `승인 실패: ${error.message}`;

        if (
          error.message.includes(
            "receiver_already_booked"
          )
        ) {
          message =
            "이미 같은 시간에 확정된 합방이 있습니다.";
        }

        if (
          error.message.includes(
            "requester_already_booked"
          )
        ) {
          message =
            "신청한 스트리머가 이미 같은 시간에 다른 합방이 확정되어 있습니다.";
        }

        if (
          error.message.includes(
            "already_processed"
          )
        ) {
          message =
            "이미 처리된 합방 신청입니다.";
        }

        setErrorMessage(message);
        setUpdatingId(null);

        await loadRequests(userId);
        return;
      }
    } else {
      const {
        data,
        error,
      } = await supabase
        .from("collab_requests")
        .update({
          status: "rejected",
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .eq(
          "receiver_id",
          userId
        )
        .eq(
          "status",
          "pending"
        )
        .select("id");

      if (error) {
        setErrorMessage(
          `거절 실패: ${error.message}`
        );
        setUpdatingId(null);
        return;
      }

      if (
        !data ||
        data.length === 0
      ) {
        setErrorMessage(
          "이미 처리됐거나 변경할 수 없는 신청입니다."
        );

        setUpdatingId(null);

        await loadRequests(userId);
        return;
      }
    }

    /*
     * 2. 신청자에게 승인/거절 이메일 알림
     *
     * 이메일이 실패해도
     * 승인/거절 결과 자체는 유지됩니다.
     */
    try {
      const response =
        await fetch(
          "/api/notifications/collab-status",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              requestId: id,
              status,
            }),
          }
        );

      if (!response.ok) {
        const emailError =
          await response
            .json()
            .catch(() => null);

        console.error(
          "합방 결과 이메일 알림 실패:",
          emailError
        );
      }
    } catch (error) {
      console.error(
        "합방 결과 이메일 요청 실패:",
        error
      );
    }

    /*
     * 3. 최신 신청 상태 다시 조회
     */
    await loadRequests(userId);

    setUpdatingId(null);
  };

  const cancelRequest =
    async (id: number) => {
      if (!userId) return;

      const confirmed =
        window.confirm(
          "보낸 합방 신청을 취소하시겠습니까?"
        );

      if (!confirmed) return;

      setUpdatingId(id);
      setErrorMessage(null);

      const {
        data,
        error,
      } = await supabase
        .from(
          "collab_requests"
        )
        .delete()
        .eq("id", id)
        .eq(
          "requester_id",
          userId
        )
        .eq(
          "status",
          "pending"
        )
        .select("id");

      if (error) {
        setErrorMessage(
          `신청 취소 실패: ${error.message}`
        );
        setUpdatingId(null);
        return;
      }

      if (
        !data ||
        data.length === 0
      ) {
        setErrorMessage(
          "이미 처리됐거나 취소할 수 없는 신청입니다."
        );
        setUpdatingId(null);
        await loadRequests(userId);
        return;
      }

      await loadRequests(userId);
      setUpdatingId(null);
    };

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2
            size={20}
            className="animate-spin"
          />
          합방 신청을 불러오는 중입니다.
        </div>
      </main>
    );
  }

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
            받은 신청을 승인하거나 거절하고,
            내가 보낸 신청 상태도 확인할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "received"
              )
            }
            className={
              activeTab ===
              "received"
                ? "flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                : "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50"
            }
          >
            <Inbox size={17} />
            받은 신청

            {pendingReceivedCount >
              0 && (
              <span
                className={
                  activeTab ===
                  "received"
                    ? "rounded-full bg-white px-2 py-0.5 text-xs text-slate-950"
                    : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                }
              >
                {
                  pendingReceivedCount
                }
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "sent"
              )
            }
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
              {activeTab ===
              "received"
                ? "받은 합방 신청"
                : "보낸 합방 신청"}
            </h2>

            <span className="text-sm text-slate-500">
              {
                filteredRequests.length
              }
              건
            </span>
          </div>

          {filteredRequests.length >
          0 ? (
            <div className="space-y-4">
              {filteredRequests.map(
                (request) => {
                  const status =
                    statusConfig[
                      request.status
                    ];

                  const busy =
                    updatingId ===
                    request.id;

                  return (
                    <article
                      key={
                        request.id
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-lg font-bold text-white">
                            {request.streamerName.slice(
                              0,
                              1
                            )}
                          </div>

                          <div>
                            <h3 className="font-bold text-slate-950">
                              {
                                request.streamerName
                              }
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {
                                request.platform
                              }
                            </p>
                          </div>
                        </div>

                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {
                            status.label
                          }
                        </span>
                      </div>

                      <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                        <div className="flex items-start gap-3">
                          <CalendarDays
                            size={
                              18
                            }
                            className="mt-0.5 text-slate-400"
                          />

                          <div>
                            <p className="text-xs font-medium text-slate-400">
                              합방 날짜
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {formatDate(
                                request.start_at
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Clock3
                            size={
                              18
                            }
                            className="mt-0.5 text-slate-400"
                          />

                          <div>
                            <p className="text-xs font-medium text-slate-400">
                              시간
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {formatTime(
                                request.start_at
                              )}
                              {" ~ "}
                              {formatTime(
                                request.end_at
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="text-xs font-medium text-slate-400">
                          합방 콘텐츠
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {
                            request.content
                          }
                        </p>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-medium text-slate-400">
                          메시지
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {request.message ||
                            "전달 메시지가 없습니다."}
                        </p>
                      </div>

                      {activeTab ===
                        "received" &&
                        request.status ===
                          "pending" && (
                          <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                            <button
                              type="button"
                              disabled={
                                busy
                              }
                              onClick={() =>
                                void updateStatus(
                                  request.id,
                                  "rejected"
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {busy ? (
                                <Loader2
                                  size={
                                    17
                                  }
                                  className="animate-spin"
                                />
                              ) : (
                                <XCircle
                                  size={
                                    17
                                  }
                                />
                              )}
                              거절
                            </button>

                            <button
                              type="button"
                              disabled={
                                busy
                              }
                              onClick={() =>
                                void updateStatus(
                                  request.id,
                                  "accepted"
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                              {busy ? (
                                <Loader2
                                  size={
                                    17
                                  }
                                  className="animate-spin"
                                />
                              ) : (
                                <CheckCircle2
                                  size={
                                    17
                                  }
                                />
                              )}
                              승인
                            </button>
                          </div>
                        )}

                      {activeTab ===
                        "sent" &&
                        request.status ===
                          "pending" && (
                          <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                            <button
                              type="button"
                              disabled={
                                busy
                              }
                              onClick={() =>
                                void cancelRequest(
                                  request.id
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {busy ? (
                                <Loader2
                                  size={
                                    17
                                  }
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={
                                    17
                                  }
                                />
                              )}
                              신청 취소
                            </button>
                          </div>
                        )}
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              {activeTab ===
              "received" ? (
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
                {activeTab ===
                "received"
                  ? "받은 합방 신청이 없습니다."
                  : "보낸 합방 신청이 없습니다."}
              </h2>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-900">
            Supabase에 연결된 신청입니다.
          </p>

          <p className="mt-1 text-sm leading-6 text-emerald-700">
            승인·거절·취소 상태가 실제 DB에 저장되며 새로고침해도 유지됩니다.
          </p>
        </div>
      </section>
    </main>
  );
}


