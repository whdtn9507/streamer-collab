"use client";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Loader2,
  Radio,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import CollabRequestModal from "@/components/CollabRequestModal";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Profile = {
  id: string;
  nickname: string;
  platform: string;
  channel_url: string | null;
  bio: string | null;
  categories: string[];
};

type Availability = {
  id: number;
  start_at: string;
  end_at: string;
};

type ModalSchedule = {
  id: number;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
};

function getKoreanSchedule(
  schedule: Availability
): ModalSchedule {
  const startDate = new Date(schedule.start_at);
  const endDate = new Date(schedule.end_at);

  const date = new Intl.DateTimeFormat(
    "ko-KR",
    {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  )
    .format(startDate)
    .replaceAll(". ", ".")
    .replace(/\.$/, "");

  const day = new Intl.DateTimeFormat(
    "ko-KR",
    {
      timeZone: "Asia/Seoul",
      weekday: "short",
    }
  ).format(startDate);

  const timeFormatter =
    new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

  return {
    id: schedule.id,
    date,
    day,
    startTime: timeFormatter.format(startDate),
    endTime: timeFormatter.format(endDate),
  };
}

export default function StreamerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [schedules, setSchedules] =
    useState<Availability[]>([]);

  const [selectedScheduleId, setSelectedScheduleId] =
    useState<number | null>(null);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadStreamer = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/auth/login");
      return;
    }

    const { data: profileData, error: profileError } =
      await supabase
        .from("profiles")
        .select(
          "id, nickname, platform, channel_url, bio, categories"
        )
        .eq("id", params.id)
        .single<Profile>();

    if (profileError || !profileData) {
      setErrorMessage(
        "스트리머를 찾을 수 없습니다."
      );
      setLoading(false);
      return;
    }

    const { data: availabilityData, error: availabilityError } =
      await supabase
        .from("availability")
        .select("id, start_at, end_at")
        .eq("user_id", params.id)
        .gte(
          "end_at",
          new Date().toISOString()
        )
        .order("start_at", {
          ascending: true,
        });

    if (availabilityError) {
      setErrorMessage(
        `일정을 불러오지 못했습니다: ${availabilityError.message}`
      );
      setLoading(false);
      return;
    }

    setProfile(profileData);
    setSchedules(
      (availabilityData ?? []) as Availability[]
    );
    setLoading(false);
  }, [params.id, router]);

  useEffect(() => {
    void loadStreamer();
  }, [loadStreamer]);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2
            size={20}
            className="animate-spin"
          />
          스트리머 정보를 불러오는 중입니다.
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-950">
          {errorMessage ??
            "스트리머를 찾을 수 없습니다."}
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

  const selectedSchedule =
    schedules.find(
      (schedule) =>
        schedule.id === selectedScheduleId
    ) ?? null;

  const modalSchedule = selectedSchedule
    ? getKoreanSchedule(selectedSchedule)
    : null;

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
              {profile.nickname.slice(0, 1)}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-950">
                  {profile.nickname}
                </h1>

                {schedules.length > 0 && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    합방 가능
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <Radio size={16} />
                {profile.platform}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(profile.categories ?? []).map(
                  (category) => (
                    <span
                      key={category}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {category}
                    </span>
                  )
                )}
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600">
                {profile.bio ||
                  "아직 소개가 등록되지 않았습니다."}
              </p>

              {profile.channel_url && (
                <a
                  href={profile.channel_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
                >
                  <ExternalLink size={16} />
                  방송 채널 보기
                </a>
              )}
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

          {schedules.length > 0 ? (
            <>
              <div className="mt-7 space-y-3">
                {schedules.map((schedule) => {
                  const formatted =
                    getKoreanSchedule(schedule);

                  const selected =
                    selectedScheduleId ===
                    schedule.id;

                  return (
                    <button
                      key={schedule.id}
                      type="button"
                      onClick={() =>
                        setSelectedScheduleId(
                          schedule.id
                        )
                      }
                      className={
                        selected
                          ? "flex w-full items-center justify-between rounded-xl border-2 border-slate-950 bg-slate-50 p-5 text-left"
                          : "flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-5 text-left hover:border-slate-400"
                      }
                    >
                      <div className="flex items-center gap-4">
                        <CalendarDays
                          size={20}
                          className="text-slate-600"
                        />

                        <div>
                          <p className="font-semibold text-slate-900">
                            {formatted.date} (
                            {formatted.day})
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatted.startTime}
                            {" ~ "}
                            {formatted.endTime}
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
                onClick={() =>
                  setModalOpen(true)
                }
                className="mt-7 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                선택한 일정으로 합방 신청
              </button>
            </>
          ) : (
            <div className="mt-7 rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
              현재 등록된 합방 가능 일정이 없습니다.
            </div>
          )}
        </section>
      </div>

      {modalOpen &&
        modalSchedule && (
          <CollabRequestModal
            streamerName={profile.nickname}
            schedule={modalSchedule}
            onClose={() =>
              setModalOpen(false)
            }
          />
        )}
    </main>
  );
}
