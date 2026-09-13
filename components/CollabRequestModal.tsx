"use client";

import {
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Schedule = {
  id: number;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
};

type CollabRequestModalProps = {
  streamerName: string;
  schedule: Schedule;
  onClose: () => void;
};

type AvailabilityRow = {
  start_at: string;
  end_at: string;
};

type CreatedRequest = {
  id: number;
};

export default function CollabRequestModal({
  streamerName,
  schedule,
  onClose,
}: CollabRequestModalProps) {
  const params = useParams<{ id: string }>();

  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setErrorMessage(
        "합방 콘텐츠를 입력해주세요."
      );
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    /*
     * 1. 현재 로그인 사용자 확인
     */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage(
        "로그인 정보를 확인할 수 없습니다."
      );
      setSaving(false);
      return;
    }

    /*
     * 2. 현재 보고 있는 상대 스트리머 UUID
     */
    const receiverId = params.id;

    if (!receiverId) {
      setErrorMessage(
        "신청할 스트리머 정보를 찾을 수 없습니다."
      );
      setSaving(false);
      return;
    }

    /*
     * 3. 자기 자신에게 신청 방지
     */
    if (user.id === receiverId) {
      setErrorMessage(
        "자기 자신에게 합방을 신청할 수 없습니다."
      );
      setSaving(false);
      return;
    }

    /*
     * 4. 선택한 일정이 아직 존재하는지
     * Supabase에서 다시 확인
     */
    const {
      data: availability,
      error: availabilityError,
    } = await supabase
      .from("availability")
      .select("start_at, end_at")
      .eq("id", schedule.id)
      .eq("user_id", receiverId)
      .single<AvailabilityRow>();

    if (
      availabilityError ||
      !availability
    ) {
      setErrorMessage(
        "선택한 일정을 찾을 수 없습니다. 상대방이 일정을 변경했을 수 있습니다."
      );
      setSaving(false);
      return;
    }

    /*
     * 5. 이미 종료된 일정인지 확인
     */
    if (
      new Date(
        availability.end_at
      ).getTime() <= Date.now()
    ) {
      setErrorMessage(
        "이미 종료된 일정에는 신청할 수 없습니다."
      );
      setSaving(false);
      return;
    }

    /*
     * 6. 동일한 상대 / 동일한 일정에
     * pending 신청이 이미 있는지 확인
     */
    const {
      data: duplicatedRequests,
      error: duplicateError,
    } = await supabase
      .from("collab_requests")
      .select("id")
      .eq(
        "requester_id",
        user.id
      )
      .eq(
        "receiver_id",
        receiverId
      )
      .eq(
        "start_at",
        availability.start_at
      )
      .eq(
        "end_at",
        availability.end_at
      )
      .eq("status", "pending")
      .limit(1);

    if (duplicateError) {
      setErrorMessage(
        `신청 상태 확인 실패: ${duplicateError.message}`
      );
      setSaving(false);
      return;
    }

    if (
      duplicatedRequests &&
      duplicatedRequests.length > 0
    ) {
      setErrorMessage(
        "이미 이 일정으로 보낸 합방 신청이 있습니다."
      );
      setSaving(false);
      return;
    }

    /*
     * 7. 실제 합방 신청 DB 저장
     *
     * 저장된 신청 ID를 받아서
     * 이메일 알림 API에 전달합니다.
     */
    const {
      data: createdRequest,
      error: insertError,
    } = await supabase
      .from("collab_requests")
      .insert({
        requester_id: user.id,
        receiver_id: receiverId,
        start_at:
          availability.start_at,
        end_at:
          availability.end_at,
        content: content.trim(),
        message:
          message.trim() || null,
        status: "pending",
      })
      .select("id")
      .single<CreatedRequest>();

    if (insertError) {
      /*
       * DB unique index에서도 중복 신청을 막고 있으므로
       * 동시에 두 번 신청한 경우도 처리
       */
      if (
        insertError.code === "23505"
      ) {
        setErrorMessage(
          "이미 이 일정으로 보낸 합방 신청이 있습니다."
        );
      } else {
        setErrorMessage(
          `합방 신청 실패: ${insertError.message}`
        );
      }

      setSaving(false);
      return;
    }

    /*
     * 8. 상대 스트리머에게 이메일 알림 요청
     *
     * 이메일 전송 실패가 발생해도
     * 이미 저장된 합방 신청은 유지합니다.
     */
    if (createdRequest) {
      try {
        const notificationResponse =
          await fetch(
            "/api/notifications/collab-request",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                requestId:
                  createdRequest.id,
              }),
            }
          );

        if (
          !notificationResponse.ok
        ) {
          const notificationError =
            await notificationResponse
              .json()
              .catch(() => null);

          console.error(
            "이메일 알림 전송 실패:",
            notificationError
          );
        }
      } catch (error) {
        console.error(
          "이메일 알림 요청 실패:",
          error
        );
      }
    }

    /*
     * 9. 신청 완료
     */
    setSaving(false);
    setSuccess(true);
  };

  /*
   * 신청 완료 화면
   */
  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2
              size={28}
              className="text-emerald-600"
            />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            합방 신청을 보냈습니다.
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {streamerName}님이 신청을
            확인하고 승인하거나 거절할 수
            있습니다.
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            이메일 알림이 설정되어 있다면
            상대방에게 신청 알림도 전송됩니다.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-7 w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  /*
   * 합방 신청 입력 화면
   */
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              COLLAB REQUEST
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              합방 신청
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="닫기"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* 선택한 상대 / 일정 */}
        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <p className="font-semibold text-slate-950">
            {streamerName}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {schedule.date} (
            {schedule.day})
          </p>

          <p className="text-sm text-slate-500">
            {schedule.startTime}
            {" ~ "}
            {schedule.endTime}
          </p>
        </div>

        {/* 오류 메시지 */}
        {errorMessage && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {errorMessage}
          </div>
        )}

        {/* 합방 콘텐츠 */}
        <div className="mt-6">
          <label
            htmlFor="collab-content"
            className="text-sm font-semibold text-slate-700"
          >
            합방 콘텐츠
          </label>

          <input
            id="collab-content"
            type="text"
            value={content}
            onChange={(event) =>
              setContent(
                event.target.value
              )
            }
            disabled={saving}
            maxLength={100}
            placeholder="예: 배틀그라운드 듀오"
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-950 disabled:bg-slate-50"
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {content.length}/100
          </p>
        </div>

        {/* 전달 메시지 */}
        <div className="mt-5">
          <label
            htmlFor="collab-message"
            className="text-sm font-semibold text-slate-700"
          >
            전달 메시지
          </label>

          <textarea
            id="collab-message"
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            disabled={saving}
            maxLength={500}
            placeholder="합방과 관련해 전달할 내용을 입력해주세요."
            rows={5}
            className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-950 disabled:bg-slate-50"
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {message.length}/500
          </p>
        </div>

        {/* 버튼 */}
        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            취소
          </button>

          <button
            type="button"
            onClick={() =>
              void handleSubmit()
            }
            disabled={
              saving ||
              !content.trim()
            }
            className="inline-flex min-w-28 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {saving
              ? "신청 중"
              : "합방 신청"}
          </button>
        </div>
      </div>
    </div>
  );
}