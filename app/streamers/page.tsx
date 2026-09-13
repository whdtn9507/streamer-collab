"use client";

import { Search, SlidersHorizontal, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import StreamerCard from "@/components/StreamerCard";
import { streamers } from "@/lib/streamers";

const categories = [
  "전체",
  "FC온라인",
  "배틀그라운드",
  "리그오브레전드",
  "종합게임",
];

export default function StreamersPage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const filteredStreamers = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return streamers.filter((streamer) => {
      const categoryMatch =
        selectedCategory === "전체" ||
        streamer.category.includes(selectedCategory);

      const searchMatch =
        keyword === "" ||
        streamer.nickname.toLowerCase().includes(keyword) ||
        streamer.category.some((category) =>
          category.toLowerCase().includes(keyword)
        );

      return categoryMatch && searchMatch;
    });
  }, [searchKeyword, selectedCategory]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-blue-600">FIND STREAMERS</p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            합방할 스트리머를 찾아보세요.
          </h1>

          <p className="mt-4 text-slate-500">
            스트리머를 찾고 합방 가능한 시간을 확인할 수 있습니다.
          </p>

          <div className="relative mt-8 max-w-2xl">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="닉네임 또는 콘텐츠를 검색하세요"
              className="h-12 w-full rounded-xl border border-slate-300 pl-12 pr-4 text-sm outline-none focus:border-slate-950"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <SlidersHorizontal size={17} />
            게임 / 콘텐츠
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <UsersRound size={17} />
            {filteredStreamers.length}명
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "shrink-0 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                  : "shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600"
              }
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStreamers.map((streamer) => (
            <StreamerCard key={streamer.id} streamer={streamer} />
          ))}
        </div>
      </section>
    </main>
  );
}
