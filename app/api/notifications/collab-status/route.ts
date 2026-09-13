import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

type RequestStatus = "accepted" | "rejected";

type RequestBody = {
  requestId?: number;
  status?: RequestStatus;
};

type CollabRequestRow = {
  id: number;
  requester_id: string;
  receiver_id: string;
  start_at: string;
  end_at: string;
  content: string;
  status: string;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      {
        error: "로그인이 필요합니다.",
      },
      {
        status: 401,
      }
    );
  }

  const body = (await request
    .json()
    .catch(() => null)) as RequestBody | null;

  const requestId = Number(body?.requestId);
  const status = body?.status;

  if (
    !Number.isInteger(requestId) ||
    requestId <= 0
  ) {
    return NextResponse.json(
      {
        error: "잘못된 신청 번호입니다.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    status !== "accepted" &&
    status !== "rejected"
  ) {
    return NextResponse.json(
      {
        error: "잘못된 신청 상태입니다.",
      },
      {
        status: 400,
      }
    );
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const secretKey =
    process.env.SUPABASE_SECRET_KEY;

  const resendApiKey =
    process.env.RESEND_API_KEY;

  if (
    !supabaseUrl ||
    !secretKey ||
    !resendApiKey
  ) {
    return NextResponse.json(
      {
        error:
          "서버 이메일 설정이 완료되지 않았습니다.",
      },
      {
        status: 500,
      }
    );
  }

  const admin = createAdminClient(
    supabaseUrl,
    secretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const {
    data: collabRequest,
    error: requestError,
  } = await admin
    .from("collab_requests")
    .select(`
      id,
      requester_id,
      receiver_id,
      start_at,
      end_at,
      content,
      status
    `)
    .eq("id", requestId)
    .single<CollabRequestRow>();

  if (
    requestError ||
    !collabRequest
  ) {
    return NextResponse.json(
      {
        error:
          "합방 신청을 찾을 수 없습니다.",
      },
      {
        status: 404,
      }
    );
  }

  /*
   * 신청을 받은 사람만
   * 승인/거절 알림을 발송할 수 있습니다.
   */
  if (
    collabRequest.receiver_id !== user.id
  ) {
    return NextResponse.json(
      {
        error:
          "알림을 보낼 권한이 없습니다.",
      },
      {
        status: 403,
      }
    );
  }

  /*
   * 요청한 상태와 DB의 실제 상태가
   * 같은 경우에만 이메일을 보냅니다.
   */
  if (
    collabRequest.status !== status
  ) {
    return NextResponse.json(
      {
        error:
          "현재 신청 상태와 알림 상태가 일치하지 않습니다.",
      },
      {
        status: 409,
      }
    );
  }

  const {
    data: requesterProfile,
  } = await admin
    .from("profiles")
    .select("nickname")
    .eq(
      "id",
      collabRequest.requester_id
    )
    .single();

  const {
    data: receiverProfile,
  } = await admin
    .from("profiles")
    .select("nickname")
    .eq(
      "id",
      collabRequest.receiver_id
    )
    .single();

  const {
    data: requesterAuth,
    error: requesterAuthError,
  } =
    await admin.auth.admin.getUserById(
      collabRequest.requester_id
    );

  if (
    requesterAuthError ||
    !requesterAuth.user?.email
  ) {
    return NextResponse.json(
      {
        error:
          "신청자의 이메일을 확인할 수 없습니다.",
      },
      {
        status: 404,
      }
    );
  }

  const requesterName = escapeHtml(
    requesterProfile?.nickname ??
      "스트리머"
  );

  const receiverName = escapeHtml(
    receiverProfile?.nickname ??
      "스트리머"
  );

  const content = escapeHtml(
    collabRequest.content
  );

  const statusLabel =
    status === "accepted"
      ? "승인되었습니다"
      : "거절되었습니다";

  const statusColor =
    status === "accepted"
      ? "#059669"
      : "#dc2626";

  const statusBackground =
    status === "accepted"
      ? "#ecfdf5"
      : "#fef2f2";

  const requestsUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  }/requests`;

  const resend =
    new Resend(resendApiKey);

  const {
    error: emailError,
  } =
    await resend.emails.send(
      {
        from:
          process.env.RESEND_FROM_EMAIL ??
          "Streamer Collab <onboarding@resend.dev>",

        to: [
          requesterAuth.user.email,
        ],

        subject:
          `[Streamer Collab] 합방 신청이 ${
            status === "accepted"
              ? "승인"
              : "거절"
          }되었습니다`,

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 32px;
            color: #0f172a;
          ">
            <p style="
              font-size: 13px;
              font-weight: 700;
              color: #2563eb;
            ">
              STREAMER COLLAB
            </p>

            <h1 style="
              font-size: 24px;
              margin: 8px 0 24px;
            ">
              합방 신청 결과가 도착했습니다.
            </h1>

            <p style="
              font-size: 15px;
              line-height: 1.7;
            ">
              ${requesterName}님이 보낸
              <strong>${receiverName}</strong>님과의
              합방 신청이 처리되었습니다.
            </p>

            <div style="
              margin: 24px 0;
              padding: 16px 20px;
              border-radius: 12px;
              background: ${statusBackground};
              color: ${statusColor};
              font-size: 16px;
              font-weight: 700;
            ">
              ${statusLabel}
            </div>

            <div style="
              background: #f8fafc;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
            ">
              <p>
                <strong>합방 상대</strong><br />
                ${receiverName}
              </p>

              <p>
                <strong>콘텐츠</strong><br />
                ${content}
              </p>

              <p>
                <strong>날짜</strong><br />
                ${formatDate(
                  collabRequest.start_at
                )}
              </p>

              <p>
                <strong>시간</strong><br />
                ${formatTime(
                  collabRequest.start_at
                )}
                ~
                ${formatTime(
                  collabRequest.end_at
                )}
              </p>
            </div>

            ${
              status === "accepted"
                ? `
                  <p style="
                    font-size: 14px;
                    line-height: 1.7;
                    color: #475569;
                  ">
                    승인된 합방은 내 일정에서
                    확정 일정으로 확인할 수 있습니다.
                  </p>
                `
                : ""
            }

            <a
              href="${requestsUrl}"
              style="
                display: inline-block;
                margin-top: 16px;
                padding: 12px 20px;
                background: #0f172a;
                color: #ffffff;
                text-decoration: none;
                border-radius: 10px;
                font-weight: 700;
              "
            >
              합방 신청 확인하기
            </a>
          </div>
        `,
      },
      {
        idempotencyKey:
          `collab-status/${collabRequest.id}/${status}`,
      }
    );

  if (emailError) {
    console.error(
      "Collab status email failed:",
      emailError
    );

    return NextResponse.json(
      {
        error:
          "이메일 발송에 실패했습니다.",
      },
      {
        status: 502,
      }
    );
  }

  return NextResponse.json({
    ok: true,
  });
}
