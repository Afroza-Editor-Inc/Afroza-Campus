import { create } from 'zustand';

export interface Call {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'voice' | 'video';
  timestamp: Date;
  duration?: number; // en secondes
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  participants: string[];
  participantCount: number;
  meetingLink?: string;
}

interface CallsState {
  calls: Call[];
  meetings: Meeting[];
  addCall: (call: Call) => void;
  addMeeting: (meeting: Meeting) => void;
  removeCall: (callId: string) => void;
  removeMeeting: (meetingId: string) => void;
}

const MOCK_CALLS: Call[] = [
  {
    id: '1',
    participantId: 'user1',
    participantName: 'Alice Dupont',
    type: 'incoming',
    callType: 'voice',
    timestamp: new Date(Date.now() - 86400000),
    duration: 1230,
  },
  {
    id: '2',
    participantId: 'user2',
    participantName: 'Bob Martin',
    type: 'outgoing',
    callType: 'video',
    timestamp: new Date(Date.now() - 172800000),
    duration: 456,
  },
  {
    id: '3',
    participantId: 'group1',
    participantName: 'Groupe Projet IA',
    type: 'missed',
    callType: 'video',
    timestamp: new Date(Date.now() - 345600000),
  },
];

const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'meet1',
    title: 'Réunion Projet IA',
    description: 'Sprint planning et roadmap Q2',
    startTime: new Date(Date.now() + 3600000),
    participants: ['user1', 'user2', 'user3', 'user4', 'user5'],
    participantCount: 5,
    meetingLink: 'https://meet.afroza.campus/proj-ia-q2',
  },
  {
    id: 'meet2',
    title: 'Club Lecture Tech',
    description: 'Discussion autour de "Domain-Driven Design"',
    startTime: new Date(Date.now() + 86400000),
    participants: ['user1', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12'],
    participantCount: 12,
    meetingLink: 'https://meet.afroza.campus/club-lecture-ddd',
  },
];

export const useCallsStore = create<CallsState>((set) => ({
  calls: MOCK_CALLS,
  meetings: MOCK_MEETINGS,

  addCall: (call) =>
    set((state) => ({
      calls: [call, ...state.calls],
    })),

  addMeeting: (meeting) =>
    set((state) => ({
      meetings: [meeting, ...state.meetings],
    })),

  removeCall: (callId) =>
    set((state) => ({
      calls: state.calls.filter((call) => call.id !== callId),
    })),

  removeMeeting: (meetingId) =>
    set((state) => ({
      meetings: state.meetings.filter((meeting) => meeting.id !== meetingId),
    })),
}));
