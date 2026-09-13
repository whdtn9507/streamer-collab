export type Streamer = {
  id: number;
  nickname: string;
  platform: string;
  category: string[];
  description: string;
  availableDate: string;
  availableTime: string;
  channelUrl?: string;
  schedules: {
    id: number;
    date: string;
    day: string;
    startTime: string;
    endTime: string;
  }[];
};

export const streamers: Streamer[] = [
  {
    id: 1,
    nickname: "마차우",
    platform: "치지직",
    category: ["FC온라인", "종합게임"],
    description: "FC온라인을 중심으로 여러 게임을 함께 즐기는 종합게임 스트리머입니다.",
    availableDate: "9월 15일",
    availableTime: "20:00 ~ 23:00",
    schedules: [
      { id: 1, date: "2026.09.15", day: "화", startTime: "20:00", endTime: "23:00" },
      { id: 2, date: "2026.09.17", day: "목", startTime: "19:00", endTime: "22:00" },
    ],
  },
  {
    id: 2,
    nickname: "마라메",
    platform: "치지직",
    category: ["배틀그라운드", "종합게임"],
    description: "배틀그라운드와 다양한 합방 콘텐츠를 즐기는 스트리머입니다.",
    availableDate: "9월 16일",
    availableTime: "21:00 ~ 24:00",
    schedules: [
      { id: 1, date: "2026.09.16", day: "수", startTime: "21:00", endTime: "24:00" },
    ],
  },
  {
    id: 3,
    nickname: "소우밍",
    platform: "치지직",
    category: ["리그오브레전드", "종합게임"],
    description: "리그오브레전드와 다양한 게임 콘텐츠를 진행합니다.",
    availableDate: "9월 17일",
    availableTime: "19:30 ~ 22:30",
    schedules: [
      { id: 1, date: "2026.09.17", day: "목", startTime: "19:30", endTime: "22:30" },
    ],
  },
  {
    id: 4,
    nickname: "김꼬롬",
    platform: "치지직",
    category: ["종합게임"],
    description: "여러 스트리머와 함께하는 종합게임 합방을 선호합니다.",
    availableDate: "9월 18일",
    availableTime: "20:00 ~ 23:30",
    schedules: [
      { id: 1, date: "2026.09.18", day: "금", startTime: "20:00", endTime: "23:30" },
    ],
  },
  {
    id: 5,
    nickname: "눈꽃하임",
    platform: "치지직",
    category: ["배틀그라운드", "종합게임"],
    description: "배틀그라운드와 멀티플레이 게임 중심으로 방송을 진행합니다.",
    availableDate: "9월 20일",
    availableTime: "18:00 ~ 22:00",
    schedules: [
      { id: 1, date: "2026.09.20", day: "일", startTime: "18:00", endTime: "22:00" },
    ],
  },
];

export function getStreamerById(id: number) {
  return streamers.find((streamer) => streamer.id === id);
}
