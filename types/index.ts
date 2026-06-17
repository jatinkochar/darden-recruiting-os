export type EventStatus =
  | "Invite Found" | "Register" | "Registered" | "Happening Today" | "Ended"
  | "Attended" | "Follow-up Pending" | "Completed" | "Manual Entry";

export type Priority = "High" | "Medium" | "Low";

export type RecruitingEvent = {
  id: string;
  title: string;
  company: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  status: EventStatus;
  priority: Priority;
  location: string;
  meetingLink: string;
  registrationLink: string;
  passcode: string;
  source: string;
  notes: string;
};

export type Contact = {
  id: string; name: string; company: string; office: string; role: string; email: string;
  linkedin: string; lastTouch: string; nextFollowUp: string; status: string; notes: string;
};

export type Application = {
  id: string; company: string; role: string; status: string; deadline: string;
  priority: Priority; link: string; notes: string;
};

export type Task = {
  id: string; title: string; company: string; dueDate: string;
  status: "Backlog" | "This Week" | "Today" | "Done"; priority: Priority; notes: string;
};
