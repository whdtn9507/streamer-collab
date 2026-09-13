import Link from "next/link";
import {
  CalendarDays,
  ExternalLink,
} from "lucide-react";

export type StreamerCardData = {
  id: string;
  nickname: string;
  platform: string;
  categories: string[];
  description: string;
  channelUrl: string | null;
  nextAvailability: {
    startAt: string;
    endAt: string;
  } | null;
};

type Props = {
  streamer: StreamerCardData;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
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

export default function StreamerCard({
  streamer,
}: Props) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xl font-bold text-white">
            {streamer.nickname.slice(0, 1)}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-slate-950">
              {streamer.nickname}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {streamer.platform}
            </p>
          </div>
        </div>

        {streamer.nextAvailability ? (
          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            합방 가능
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            일정 없음
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {streamer.categories.length > 0 ? (
          streamer.categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
            >
              {category}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-400">
            등록된 콘텐츠 없음
          </span>
        )}
      </div>

      <p className="mt-5 min-h-12 text-sm leading-6 text-slate-600">
        {streamer.description ||
          "아직 스트리머 소개가 등록되지 않았습니다."}
      </p>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <div className="flex gap-3">
          <CalendarDays
            size={18}
            className="mt-0.5 shrink-0 text-slate-500"
          />

          {streamer.nextAvailability ? (
            <div>
              <p className="text-xs text-slate-400">
                다음 합방 가능 시간
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formatDate(
                  streamer.nextAvailability.startAt
                )}
              </p>

              <p className="text-sm text-slate-500">
                {formatTime(
                  streamer.nextAvailability.startAt
                )}
                {" ~ "}
                {formatTime(
                  streamer.nextAvailability.endAt
                )}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-400">
                합방 가능 시간
              </p>

              <p className="mt-1 text-sm text-slate-500">
                아직 등록된 일정이 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto flex gap-2 pt-6">
        <Link
          href={`/streamers/${streamer.id}`}
          className="flex flex-1 items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          프로필 보기
        </Link>

        {streamer.channelUrl && (
          <a
            href={streamer.channelUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`${streamer.nickname} 방송 채널`}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          >
            <ExternalLink size={17} />
          </a>
        )}
      </div>
    </article>
  );
}
