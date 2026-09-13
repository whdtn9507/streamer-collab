"use client";

import {
  Loader2,
  Search,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import StreamerCard, {
  StreamerCardData,
} from "@/components/StreamerCard";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const categories = [
  "전체",
  "FC온라인",
  "배틀그라운드",
  "리그오브레전드",
  "종합게임",
  "토크",
  "기타",
];

type AvailabilityRow = {
  id: number;
  start_at: string;
  end_at: string;
};

type ProfileRow = {
  id: string;
  nickname: string;
  platform: string;
  channel_url: string | null;
  bio: string | null;
  categories: string[];
  availability: AvailabilityRow[];
};

export default function StreamersPage() {
  const router = useRouter();

  const [streamers, setStreamers] =
    useState<StreamerCardData[]>([]);

  const [searchKeyword, setSearchKeyword] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("전체");

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadStreamers = useCallback(async () => {
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

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        nickname,
        platform,
        channel_url,
        bio,
        categories,
        availability (
          id,
          start_at,
          end_at
        )
      `)
      .neq("id", user.id);

    if (error) {
      setErrorMessage(
        `스트리머 목록을 불러오지 못했습니다: ${error.message}`
      );
      setLoading(false);
      return;
    }

    const now = new Date().getTime();

    const mapped = (data as ProfileRow[]).map(
      (profile) => {
        const upcoming = (
          profile.availability ?? []
        )
          .filter(
            (schedule) =>
              new Date(schedule.end_at).getTime() > now
          )
          .sort(
            (a, b) =>
              new Date(a.start_at).getTime() -
              new Date(b.start_at).getTime()
          );

        return {
          id: profile.id,
          nickname: profile.nickname,
          platform: profile.platform,
          categories: profile.categories ?? [],
          description: profile.bio ?? "",
          channelUrl: profile.channel_url,
          nextAvailability: upcoming[0]
            ? {
                startAt: upcoming[0].start_at,
                endAt: upcoming[0].end_at,
              }
            : null,
        };
      }
    );

    setStreamers(mapped);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadStreamers();
  }, [loadStreamers]);

  const filteredStreamers = useMemo(() => {
    const keyword =
      searchKeyword.trim().toLowerCase();

    return streamers.filter((streamer) => {
      const categoryMatch =
        selectedCategory === "전체" ||
        streamer.categories.includes(
          selectedCategory
        );

      const searchMatch =
        keyword === "" ||
        streamer.nickname
          .toLowerCase()
          .includes(keyword) ||
        streamer.platform
          .toLowerCase()
          .includes(keyword) ||
        streamer.description
          .toLowerCase()
          .includes(keyword) ||
        streamer.categories.some((category) =>
          category.toLowerCase().includes(keyword)
        );

      return categoryMatch && searchMatch;
    });
  }, [
    searchKeyword,
    selectedCategory,
    streamers,
  ]);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2
            size={20}
            className="animate-spin"
          />
          스트리머를 불러오는 중입니다.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-blue-600">
            FIND STREAMERS
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            합방할 스트리머를 찾아보세요.
          </h1>

          <p className="mt-4 text-slate-500">
            실제 가입한 스트리머의 프로필과
            합방 가능 일정을 확인할 수 있습니다.
          </p>

          <div className="relative mt-8 max-w-2xl">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={searchKeyword}
              onChange={(event) =>
                setSearchKeyword(event.target.value)
              }
              placeholder="닉네임 또는 콘텐츠를 검색하세요"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-sm outline-none focus:border-slate-950"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <SlidersHorizontal size={17} />
            게임 / 콘텐츠
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <UsersRound size={17} />
            {filteredStreamers.length}명
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() =>
                setSelectedCategory(category)
              }
              className={
                selectedCategory === category
                  ? "shrink-0 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                  : "shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              }
            >
              {category}
            </button>
          ))}
        </div>

        {filteredStreamers.length > 0 ? (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStreamers.map(
              (streamer) => (
                <StreamerCard
                  key={streamer.id}
                  streamer={streamer}
                />
              )
            )}
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <UsersRound
              size={32}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 font-semibold text-slate-800">
              표시할 스트리머가 없습니다.
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              검색 조건을 변경하거나 다른 스트리머가
              가입한 뒤 다시 확인해주세요.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
