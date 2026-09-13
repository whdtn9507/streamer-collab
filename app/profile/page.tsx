"use client";

import {
  ExternalLink,
  Loader2,
  Save,
  UserRound,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const categoryOptions = [
  "FC온라인",
  "배틀그라운드",
  "리그오브레전드",
  "종합게임",
  "토크",
  "기타",
];

type Profile = {
  id: string;
  nickname: string;
  platform: string;
  channel_url: string | null;
  bio: string | null;
  categories: string[];
  avatar_url: string | null;
};

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const [nickname, setNickname] = useState("");
  const [platform, setPlatform] = useState("치지직");
  const [channelUrl, setChannelUrl] = useState("");
  const [bio, setBio] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
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

    setUserId(user.id);
    setEmail(user.email ?? "");

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, nickname, platform, channel_url, bio, categories, avatar_url"
      )
      .eq("id", user.id)
      .single<Profile>();

    if (error) {
      setErrorMessage(
        `프로필을 불러오지 못했습니다: ${error.message}`
      );
      setLoading(false);
      return;
    }

    setNickname(data.nickname ?? "");
    setPlatform(data.platform ?? "치지직");
    setChannelUrl(data.channel_url ?? "");
    setBio(data.bio ?? "");
    setCategories(data.categories ?? []);

    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const toggleCategory = (category: string) => {
    setCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!userId) {
      setErrorMessage("로그인 정보를 확인할 수 없습니다.");
      return;
    }

    if (!nickname.trim()) {
      setErrorMessage("스트리머 닉네임을 입력해주세요.");
      return;
    }

    setSaving(true);
    setMessage(null);
    setErrorMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        nickname: nickname.trim(),
        platform,
        channel_url: channelUrl.trim() || null,
        bio: bio.trim() || null,
        categories,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      setErrorMessage(`저장 실패: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("프로필이 저장되었습니다.");
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 size={20} className="animate-spin" />
          프로필을 불러오는 중입니다.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-blue-600">
            MY PROFILE
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            스트리머 프로필
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            다른 스트리머에게 표시될 방송 정보와 합방 콘텐츠를 설정합니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
        >
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-white">
              <UserRound size={28} />
            </div>

            <div>
              <p className="font-semibold text-slate-950">
                {nickname || "스트리머"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {email}
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="nickname"
                className="text-sm font-semibold text-slate-700"
              >
                스트리머 닉네임
              </label>

              <input
                id="nickname"
                value={nickname}
                onChange={(event) =>
                  setNickname(event.target.value)
                }
                maxLength={30}
                required
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-slate-950"
              />
            </div>

            <div>
              <label
                htmlFor="platform"
                className="text-sm font-semibold text-slate-700"
              >
                방송 플랫폼
              </label>

              <select
                id="platform"
                value={platform}
                onChange={(event) =>
                  setPlatform(event.target.value)
                }
                className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-slate-950"
              >
                <option value="치지직">치지직</option>
                <option value="SOOP">SOOP</option>
                <option value="YouTube">YouTube</option>
                <option value="Twitch">Twitch</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="channel-url"
              className="text-sm font-semibold text-slate-700"
            >
              방송 채널 주소
            </label>

            <div className="relative mt-2">
              <ExternalLink
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="channel-url"
                type="url"
                value={channelUrl}
                onChange={(event) =>
                  setChannelUrl(event.target.value)
                }
                placeholder="https://chzzk.naver.com/..."
                className="h-12 w-full rounded-xl border border-slate-300 pl-11 pr-4 text-sm outline-none focus:border-slate-950"
              />
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="bio"
              className="text-sm font-semibold text-slate-700"
            >
              소개
            </label>

            <textarea
              id="bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              maxLength={300}
              rows={5}
              placeholder="주로 어떤 방송을 하고 어떤 합방을 선호하는지 작성해주세요."
              className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {bio.length}/300
            </p>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">
              주요 콘텐츠
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {categoryOptions.map((category) => {
                const selected =
                  categories.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      toggleCategory(category)
                    }
                    className={
                      selected
                        ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                        : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    }
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-400"
            >
              {saving ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Save size={17} />
              )}

              {saving ? "저장 중" : "프로필 저장"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
