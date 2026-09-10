import Link from "next/link";
import { CalendarDays, Search, Send, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: CalendarDays,
    number: "01",
    title: "가능 시간 등록",
    description: "내가 합방할 수 있는 날짜와 시간을 등록합니다.",
  },
  {
    icon: Search,
    number: "02",
    title: "스트리머 찾기",
    description: "함께 방송하고 싶은 스트리머를 찾아봅니다.",
  },
  {
    icon: Send,
    number: "03",
    title: "합방 신청",
    description: "가능한 시간을 선택하고 합방을 신청합니다.",
  },
  {
    icon: CheckCircle2,
    number: "04",
    title: "일정 확정",
    description: "상대방이 승인하면 합방 일정이 확정됩니다.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold text-blue-600">
              STREAMER COLLAB SCHEDULER
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              같이 방송할 사람,
              <br />
              일정 때문에 놓치지 마세요.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              서로 가능한 시간을 확인하고 여러 번 DM으로 일정을 조율하지 않아도
              간단하게 합방을 신청할 수 있습니다.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/streamers"
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                합방 찾기
              </Link>

              <Link
                href="/schedule"
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                내 일정 등록
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-sm font-semibold text-blue-600">
              HOW IT WORKS
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              합방 잡는 방법
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="mb-7 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      <Icon size={20} className="text-slate-700" />
                    </div>

                    <span className="text-xs font-semibold text-slate-400">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-950">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
