"use client";

import { Search, SlidersHorizontal, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import StreamerCard, { Streamer } from "@/components/StreamerCard";

const categories = [
  "전체",
  "FC온라인",
  "배틀그라운드",
  "리그오브레전드",
  "종합게임",
  "기타",
];

const streamers: Streamer[] = [
  {
    id: 1,
    nickname: "마차우",
    platform: "치지직",
    category: ["FC온라인", "종합게임"],
    description:
      "FC온라인을 중심으로 여러 게임을 함께 즐기는 종합게임 스트리머입니다.",
    availableDate: "9월 15일",
    availableTime: "20:00 ~ 23:00",
  },
  {
    id: 2,
    nickname: "마라메",
    platform: "치지직",
    category: ["배틀그라운드", "종합게임"],
    description:
      "배틀그라운드와 다양한 합방 콘텐츠를 즐기는 스트리머입니다.",
    availableDate: "9월 16일",
    availableTime: "21:00 ~ 24:00",
  },
  {
    id: 3,
    nickname: "소우밍",
    platform: "치지직",
    category: ["리그오브레전드", "종합게임"],
    description:
      "리그오브레전드와 시청자가 함께 즐길 수 있는 콘텐츠를 진행합니다.",
    availableDate: "9월 17일",
    availableTime: "19:30 ~ 22:30",
  },
  {
    id: 4,
    nickname: "김꼬롬",
    platform: "치지직",
    category: ["종합게임"],
    description:
      "여러 스트리머와 함께할 수 있는 종합게임 합방을 선호합니다.",
    availableDate: "9월 18일",
    availableTime: "20:00 ~ 23:30",
  },
  {
    id: 5,
    nickname: "눈꽃하임",
    platform: "치지직",
    category: ["배틀그라운드", "종합게임"],
    description:
      "배틀그라운드와 멀티플레이 게임 중심으로 방송을 진행합니다.",
    availableDate: "9월 20일",
    availableTime: "18:00 ~ 22:00",
  },
  {
    id: 6,
    nickname: "게스트스트리머",
    platform: "치지직",
    category: ["FC온라인"],
    description:
      "FC온라인 친선전과 팀 대결 콘텐츠 합방을 찾고 있습니다.",
    availableDate: "9월 21일",
    availableTime: "21:00 ~ 23:00",
  },
];

export default function StreamersPage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const filteredStreamers = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return streamers.filter((streamer) => {
      const matchesCategory =
        selectedCategory === "전체" ||
        streamer.category.includes(selectedCategory);

      const matchesSearch =
        keyword === "" ||
        streamer.nickname.toLowerCase().includes(keyword) ||
        streamer.platform.toLowerCase().includes(keyword) ||
        streamer.description.toLowerCase().includes(keyword) ||
        streamer.category.some((category) =>
          category.toLowerCase().includes(keyword)
        );

      return matchesCategory && matchesSearch;
    });
  }, [searchKeyword, selectedCategory]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-blue-600">
              FIND STREAMERS
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              합방할 스트리머를 찾아보세요.
            </h1>

            <p className="mt-4 text-base leading-7 text-slate-500">
              함께 방송하고 싶은 스트리머를 찾고,
              상대방이 등록한 합방 가능 시간을 확인할 수 있습니다.
            </p>
          </div>

          <div className="mt-9 max-w-2xl">
            <label
              htmlFor="streamer-search"
              className="sr-only"
            >
              스트리머 검색
            </label>

            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="streamer-search"
                type="search"
                value={searchKeyword}
                onChange={(event) =>
                  setSearchKeyword(event.target.value)
                }
                placeholder="닉네임 또는 콘텐츠를 검색하세요"
                className="h-13 w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <SlidersHorizontal size={17} />
              게임 / 콘텐츠
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <UsersRound size={17} />
              <span>
                {filteredStreamers.length}명의 스트리머
              </span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const active = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  className={
                    active
                      ? "shrink-0 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                      : "shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                  }
                >
                  {category}
                </button>
              );
            })}
          </div>

          {filteredStreamers.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredStreamers.map((streamer) => (
                <StreamerCard
                  key={streamer.id}
                  streamer={streamer}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <Search
                size={28}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 font-semibold text-slate-800">
                검색 결과가 없습니다.
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                다른 닉네임이나 콘텐츠로 검색해보세요.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchKeyword("");
                  setSelectedCategory("전체");
                }}
                className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                검색 초기화
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
