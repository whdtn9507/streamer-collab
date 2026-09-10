import Link from "next/link";
import { Heart, UserRound } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900"
        >
          COLLABLE
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/streamers"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            합방 찾기
          </Link>

          <Link
            href="/schedule"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            내 일정
          </Link>

          <Link
            href="/requests"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            내 신청
          </Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/contact"
            className="text-sm text-slate-500 transition hover:text-slate-950"
          >
            개발자 문의
          </Link>

          <Link
            href="/support"
            className="flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-950"
          >
            <Heart size={16} />
            후원
          </Link>

          <Link
            href="/profile"
            aria-label="프로필"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
          >
            <UserRound size={18} />
          </Link>
        </div>

        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium">
            메뉴
          </summary>

          <div className="absolute right-0 mt-3 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            <Link
              href="/streamers"
              className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
            >
              합방 찾기
            </Link>

            <Link
              href="/schedule"
              className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
            >
              내 일정
            </Link>

            <Link
              href="/requests"
              className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
            >
              내 신청
            </Link>

            <Link
              href="/profile"
              className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
            >
              프로필
            </Link>

            <div className="my-2 border-t border-slate-100" />

            <Link
              href="/contact"
              className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
            >
              개발자 문의
            </Link>

            <Link
              href="/support"
              className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
            >
              후원
            </Link>
          </div>
        </details>

      </div>
    </header>
  );
}
