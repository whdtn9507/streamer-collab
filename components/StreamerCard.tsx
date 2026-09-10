import { CalendarDays, ExternalLink } from "lucide-react";

export type Streamer = {
  id: number;
  nickname: string;
  platform: string;
  category: string[];
  description: string;
  availableDate: string;
  availableTime: string;
  channelUrl?: string;
};

type StreamerCardProps = {
  streamer: Streamer;
};

export default function StreamerCard({
  streamer,
}: StreamerCardProps) {
  const initial = streamer.nickname.slice(0, 1);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">
            {initial}
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

        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          합방 가능
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {streamer.category.map((category) => (
          <span
            key={category}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
          >
            {category}
          </span>
        ))}
      </div>

      <p className="mt-5 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">
        {streamer.description}
      </p>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <CalendarDays
            size={18}
            className="mt-0.5 shrink-0 text-slate-500"
          />

          <div>
            <p className="text-xs font-medium text-slate-400">
              다음 합방 가능 시간
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {streamer.availableDate}
            </p>

            <p className="text-sm text-slate-500">
              {streamer.availableTime}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto flex gap-2 pt-6">
        <button
          type="button"
          className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          프로필 보기
        </button>

        {streamer.channelUrl && (
          <a
            href={streamer.channelUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`${streamer.nickname} 방송 채널`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
          >
            <ExternalLink size={18} />
          </a>
        )}
      </div>
    </article>
  );
}
