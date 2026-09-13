import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

type RequestBody = {
  requestId?: number;
};

type CollabRequestRow = {
  id: number;
  requester_id: string;
  receiver_id: string;
  start_at: string;
  end_at: string;
  content: string;
  message: string | null;
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
    error: collabError,
  } = await admin
    .from("collab_requests")
    .select(`
      id,
      requester_id,
      receiver_id,
      start_at,
      end_at,
      content,
      message,
      status
    `)
    .eq("id", requestId)
    .single<CollabRequestRow>();

  if (
    collabError ||
    !collabRequest
  ) {
    return NextResponse.json(
      {
        error:
          "합방 신청 정보를 찾을 수 없습니다.",
      },
      {
        status: 404,
      }
    );
  }

  // 본인이 만든 신청에 대해서만 이메일 발송 가능
  if (
    collabRequest.requester_id !==
    user.id
  ) {
    return NextResponse.json(
      {
        error:
          "이 신청의 알림을 보낼 권한이 없습니다.",
      },
      {
        status: 403,
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
    data: receiverAuth,
    error: receiverError,
  } =
    await admin.auth.admin.getUserById(
      collabRequest.receiver_id
    );

  if (
    receiverError ||
    !receiverAuth.user?.email
  ) {
    return NextResponse.json(
      {
        error:
          "상대 스트리머의 이메일을 확인할 수 없습니다.",
      },
      {
        status: 404,
      }
    );
  }

  const requesterName =
    requesterProfile?.nickname ??
    "스트리머";

  const receiverName =
    receiverProfile?.nickname ??
    "스트리머";

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
          process.env
            .RESEND_FROM_EMAIL ??
          "Streamer Collab <onboarding@resend.dev>",

        to: [
          receiverAuth.user.email,
        ],

        subject:
          `[Streamer Collab] ${requesterName}님의 합방 신청`,

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
              새로운 합방 신청이 도착했습니다.
            </h1>

            <p style="
              font-size: 15px;
              line-height: 1.7;
            ">
              ${receiverName}님,
              <strong>${requesterName}</strong>님이
              합방을 신청했습니다.
            </p>

            <div style="
              background: #f8fafc;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
            ">
              <p>
                <strong>콘텐츠</strong><br />
                ${collabRequest.content}
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

              ${
                collabRequest.message
                  ? `
                    <p>
                      <strong>메시지</strong><br />
                      ${collabRequest.message}
                    </p>
                  `
                  : ""
              }
            </div>

            <a
              href="${requestsUrl}"
              style="
                display: inline-block;
                padding: 12px 20px;
                background: #0f172a;
                color: white;
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
          `collab-request/${collabRequest.id}`,
      }
    );

  if (emailError) {
    console.error(
      "Collab request email failed:",
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
