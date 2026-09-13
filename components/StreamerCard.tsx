import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { Streamer } from "@/lib/streamers";

type Props = {
  streamer: Streamer;
};

export default function StreamerCard({ streamer }: Props) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-xl font-bold text-white">
            {streamer.nickname.slice(0, 1)}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-950">
              {streamer.nickname}
            </h2>
            <p className="text-sm text-slate-500">{streamer.platform}</p>
          </div>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          합방 가능
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {streamer.category.map((category) => (
          <span
            key={category}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
          >
            {category}
          </span>
        ))}
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-600">
        {streamer.description}
      </p>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <div className="flex gap-3">
          <CalendarDays size={18} className="text-slate-500" />

          <div>
            <p className="text-xs text-slate-400">다음 합방 가능 시간</p>
            <p className="mt-1 text-sm font-semibold">
              {streamer.availableDate}
            </p>
            <p className="text-sm text-slate-500">
              {streamer.availableTime}
            </p>
          </div>
        </div>
      </div>

      <Link
        href={`/streamers/${streamer.id}`}
        className="mt-6 flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
      >
        프로필 보기
      </Link>
    </article>
  );
}
