"use client";

import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  Loader2,
  Pencil,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Schedule = {
  id: number;
  user_id: string;
  start_at: string;
  end_at: string;
};

type AcceptedRequestRow = {
  id: number;
  requester_id: string;
  receiver_id: string;
  start_at: string;
  end_at: string;
  content: string;
  message: string | null;
};

type ProfileRow = {
  id: string;
  nickname: string;
  platform: string;
};

type ConfirmedCollab = AcceptedRequestRow & {
  streamerName: string;
  platform: string;
  isRequester: boolean;
};

function getSeoulParts(iso: string) {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date(iso));

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

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

export default function SchedulePage() {
  const router = useRouter();

  const [schedules, setSchedules] =
    useState<Schedule[]>([]);

  const [confirmedCollabs, setConfirmedCollabs] =
    useState<ConfirmedCollab[]>([]);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const loadScheduleData = useCallback(
    async (uid: string) => {
      setErrorMessage(null);

      const {
        data: availabilityData,
        error: availabilityError,
      } = await supabase
        .from("availability")
        .select("id, user_id, start_at, end_at")
        .eq("user_id", uid)
        .order("start_at", {
          ascending: true,
        });

      if (availabilityError) {
        setErrorMessage(
          `가능 일정을 불러오지 못했습니다: ${availabilityError.message}`
        );
        return;
      }

      setSchedules(
        (availabilityData ?? []) as Schedule[]
      );

      const {
        data: collabData,
        error: collabError,
      } = await supabase
        .from("collab_requests")
        .select(`
          id,
          requester_id,
          receiver_id,
          start_at,
          end_at,
          content,
          message
        `)
        .eq("status", "accepted")
        .or(
          `requester_id.eq.${uid},receiver_id.eq.${uid}`
        )
        .gte(
          "end_at",
          new Date().toISOString()
        )
        .order("start_at", {
          ascending: true,
        });

      if (collabError) {
        setErrorMessage(
          `확정된 합방을 불러오지 못했습니다: ${collabError.message}`
        );
        return;
      }

      const rows =
        (collabData ?? []) as AcceptedRequestRow[];

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
            `상대 스트리머 정보를 불러오지 못했습니다: ${profileError.message}`
          );
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

      const mapped: ConfirmedCollab[] =
        rows.map((request) => {
          const isRequester =
            request.requester_id === uid;

          const otherUserId = isRequester
            ? request.receiver_id
            : request.requester_id;

          const profile =
            profileMap.get(otherUserId);

          return {
            ...request,
            isRequester,
            streamerName:
              profile?.nickname ??
              "알 수 없는 스트리머",
            platform:
              profile?.platform ?? "-",
          };
        });

      setConfirmedCollabs(mapped);
    },
    []
  );

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/auth/login");
        return;
      }

      setUserId(user.id);

      await loadScheduleData(user.id);

      setLoading(false);
    };

    void initialize();
  }, [loadScheduleData, router]);

  const resetForm = () => {
    setDate("");
    setStartTime("");
    setEndTime("");
    setEditingId(null);
    setFormOpen(false);
    setErrorMessage(null);
  };

  const openCreateForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditForm = (
    schedule: Schedule
  ) => {
    const start =
      getSeoulParts(schedule.start_at);

    const end =
      getSeoulParts(schedule.end_at);

    setDate(start.date);
    setStartTime(start.time);
    setEndTime(end.time);

    setEditingId(schedule.id);
    setFormOpen(true);
    setErrorMessage(null);
  };

  const buildDateRange = () => {
    const start = new Date(
      `${date}T${startTime}:00+09:00`
    );

    let end = new Date(
      `${date}T${endTime}:00+09:00`
    );

    if (end <= start) {
      end = new Date(
        end.getTime() +
          24 * 60 * 60 * 1000
      );
    }

    return {
      startAt: start.toISOString(),
      endAt: end.toISOString(),
    };
  };

  const overlapsConfirmedCollab = (
    startAt: string,
    endAt: string
  ) => {
    const start =
      new Date(startAt).getTime();

    const end =
      new Date(endAt).getTime();

    return confirmedCollabs.some(
      (collab) => {
        const collabStart =
          new Date(
            collab.start_at
          ).getTime();

        const collabEnd =
          new Date(
            collab.end_at
          ).getTime();

        return (
          start < collabEnd &&
          end > collabStart
        );
      }
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!userId) {
      setErrorMessage(
        "로그인 정보를 확인할 수 없습니다."
      );
      return;
    }

    if (
      !date ||
      !startTime ||
      !endTime
    ) {
      setErrorMessage(
        "날짜와 시간을 모두 입력해주세요."
      );
      return;
    }

    const {
      startAt,
      endAt,
    } = buildDateRange();

    if (
      overlapsConfirmedCollab(
        startAt,
        endAt
      )
    ) {
      setErrorMessage(
        "이미 확정된 합방과 겹치는 시간은 가능 일정으로 등록할 수 없습니다."
      );
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    if (editingId !== null) {
      const { error } =
        await supabase
          .from("availability")
          .update({
            start_at: startAt,
            end_at: endAt,
          })
          .eq(
            "id",
            editingId
          )
          .eq(
            "user_id",
            userId
          );

      if (error) {
        setErrorMessage(
          `수정 실패: ${error.message}`
        );
        setSaving(false);
        return;
      }
    } else {
      const { error } =
        await supabase
          .from("availability")
          .insert({
            user_id: userId,
            start_at: startAt,
            end_at: endAt,
          });

      if (error) {
        setErrorMessage(
          `등록 실패: ${error.message}`
        );
        setSaving(false);
        return;
      }
    }

    await loadScheduleData(userId);

    setSaving(false);
    resetForm();
  };

  const handleDelete = async (
    id: number
  ) => {
    if (!userId) return;

    const confirmed =
      window.confirm(
        "이 합방 가능 일정을 삭제하시겠습니까?"
      );

    if (!confirmed) return;

    setErrorMessage(null);

    const { error } =
      await supabase
        .from("availability")
        .delete()
        .eq("id", id)
        .eq(
          "user_id",
          userId
        );

    if (error) {
      setErrorMessage(
        `삭제 실패: ${error.message}`
      );
      return;
    }

    await loadScheduleData(userId);
  };

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2
            className="animate-spin"
            size={20}
          />
          일정을 불러오는 중입니다.
        </div>
      </main>
    );
  }

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
                내 합방 일정
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                확정된 합방과 다른 스트리머에게 공개할 가능 시간을 관리합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <CalendarPlus size={18} />
              가능 시간 추가
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600">
                CONFIRMED COLLAB
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                확정된 합방
              </h2>
            </div>

            <span className="text-sm text-slate-500">
              총 {confirmedCollabs.length}개
            </span>
          </div>

          {confirmedCollabs.length > 0 ? (
            <div className="space-y-3">
              {confirmedCollabs.map(
                (collab) => (
                  <article
                    key={collab.id}
                    className="rounded-2xl border border-emerald-200 bg-white p-5 sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                          <CheckCircle2
                            size={22}
                            className="text-emerald-600"
                          />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-950">
                              {collab.content}
                            </h3>

                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              확정
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                            <UserRound size={15} />
                            {collab.streamerName}
                            <span className="text-slate-300">
                              ·
                            </span>
                            {collab.platform}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                            <span className="flex items-center gap-2">
                              <CalendarDays size={15} />
                              {formatDate(
                                collab.start_at
                              )}
                            </span>

                            <span className="flex items-center gap-2">
                              <Clock3 size={15} />
                              {formatTime(
                                collab.start_at
                              )}
                              {" ~ "}
                              {formatTime(
                                collab.end_at
                              )}
                            </span>
                          </div>

                          {collab.message && (
                            <p className="mt-3 text-sm leading-6 text-slate-500">
                              {collab.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {collab.isRequester
                          ? "내가 신청"
                          : "받은 신청"}
                      </span>
                    </div>
                  </article>
                )
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <CheckCircle2
                size={30}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-800">
                확정된 합방이 없습니다.
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                합방 신청이 승인되면 이곳에 확정 일정이 표시됩니다.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                AVAILABLE TIME
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                합방 가능 시간
              </h2>
            </div>

            <span className="text-sm text-slate-500">
              총 {schedules.length}개
            </span>
          </div>

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
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                <div>
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
                      setDate(
                        event.target.value
                      )
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
                      setStartTime(
                        event.target.value
                      )
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
                      setEndTime(
                        event.target.value
                      )
                    }
                    required
                    className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-950"
                  />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                종료 시간이 시작 시간보다 빠르면 다음 날 종료로 저장됩니다.
              </p>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-400"
                >
                  {saving && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {editingId !== null
                    ? "수정 완료"
                    : "일정 등록"}
                </button>
              </div>
            </form>
          )}

          {schedules.length > 0 ? (
            <div className="space-y-3">
              {schedules.map(
                (schedule) => (
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
                          {formatDate(
                            schedule.start_at
                          )}
                        </p>

                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                          <Clock3 size={15} />
                          {formatTime(
                            schedule.start_at
                          )}
                          {" ~ "}
                          {formatTime(
                            schedule.end_at
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(
                            schedule
                          )
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:flex-none"
                      >
                        <Pencil size={15} />
                        수정
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleDelete(
                            schedule.id
                          )
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 sm:flex-none"
                      >
                        <Trash2 size={15} />
                        삭제
                      </button>
                    </div>
                  </article>
                )
              )}
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
                가능한 시간을 등록하면 다른 스트리머가 확인하고 합방을 신청할 수 있습니다.
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
        </div>
      </section>
    </main>
  );
}
