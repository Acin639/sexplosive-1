export type MailFolder = "inbox" | "sent" | "drafts" | "spam" | "trash";

export type Mail = {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  time: string;
  folder: MailFolder;
  read: boolean;
  starred: boolean;
};

/** Seed mail used until a real mailbox is connected. */
export const SEED_MAIL: Mail[] = [
  {
    id: "m1",
    from: "streamer.luna@mail.com",
    to: "support@sexplosive.com",
    subject: "Payout not received",
    body: "Hi, my July payout is still pending — can you check?\n\nThanks,\nLuna",
    time: "09:12",
    folder: "inbox",
    read: false,
    starred: true,
  },
  {
    id: "m2",
    from: "dev@zinc1.app",
    to: "support@sexplosive.com",
    subject: "API rate limits",
    body: "We'd like a higher tier for the /v1/videos endpoint.\nOur current usage peaks at 4k req/min.",
    time: "08:40",
    folder: "inbox",
    read: false,
    starred: false,
  },
  {
    id: "m3",
    from: "abuse@report.io",
    to: "support@sexplosive.com",
    subject: "Content report #4482",
    body: "Reported clip on category leaks — please review.",
    time: "Yesterday",
    folder: "inbox",
    read: true,
    starred: false,
  },
  {
    id: "m4",
    from: "billing@mpesa.co.ke",
    to: "support@sexplosive.com",
    subject: "Mass payout completed",
    body: "Your batch payout of $12,480.00 has been completed.",
    time: "Yesterday",
    folder: "inbox",
    read: true,
    starred: false,
  },
  {
    id: "m5",
    from: "support@sexplosive.com",
    to: "streamer.luna@mail.com",
    subject: "Re: June payout",
    body: "Hi Luna, your June payout was sent on the 3rd. Let us know if it hasn't arrived.",
    time: "Mon",
    folder: "sent",
    read: true,
    starred: false,
  },
  {
    id: "m6",
    from: "promo@spamhub.net",
    to: "support@sexplosive.com",
    subject: "You won a prize!!!",
    body: "Click here to claim your reward now.",
    time: "Sun",
    folder: "spam",
    read: true,
    starred: false,
  },
];
