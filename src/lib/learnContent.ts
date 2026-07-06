// ScamGuard scam library: plain-language guides to the scams that target elderly parents in South Africa.

export interface ScamGuideEntry {
  id: string;
  title: string;
  aka: string[];
  story: string;
  redFlags: string[];
  tellYourParent: string;
}

export const SCAM_GUIDE: ScamGuideEntry[] = [
  {
    id: "impersonation",
    title: "The fake bank alert",
    aka: ["The suspended account SMS", "The bank verification message"],
    story:
      "An SMS warns that your FNB profile has been suspended because of unusual activity, with a link to restore it. The page that opens looks just like the bank's site, down to the logo, and asks for your card number, PIN and password. A timer warns that the account will be closed if you do not finish in ten minutes.",
    redFlags: [
      "The link arrived out of the blue by SMS or email",
      "The page asks for a PIN, password or card number",
      "A countdown or deadline pushes you to hurry",
      "The web address is not the bank's normal address",
      "It threatens that the account will be closed",
    ],
    tellYourParent:
      "If a message ever seems to come from your bank, put it down and phone the number on the back of your card — I will gladly sit with you while you do.",
  },
  {
    id: "government-refund",
    title: "The SARS or SASSA refund trick",
    aka: ["The eFiling refund message", "The SRD grant scam"],
    story:
      "In tax season an SMS says SARS owes you a refund of R3,712 and gives a link to claim it before Friday. Another version says your SASSA grant or SRD grant has been suspended and you must reapply through a link. Both pages ask for your ID number and banking details so the money can supposedly be paid out.",
    redFlags: [
      "A refund or grant problem you were not expecting",
      "Asks for your ID number and banking details",
      "A deadline before the money is lost",
      "The link does not end in gov.za",
      "A small fee must be paid to release the money",
    ],
    tellYourParent:
      "SARS and SASSA never ask for your banking details through a link, so if money is really owed to you it will still be there once we have checked together.",
  },
  {
    id: "tech-support",
    title: "The fake virus pop-up",
    aka: ["The Microsoft call scam", "The fake virus warning", "The frozen screen"],
    story:
      "While you are reading the news, the screen suddenly fills with a flashing warning that your computer has been infected, sometimes with a loud alarm or a voice. A number on the screen promises help from a technician. The friendly man who answers talks you into installing a program that lets him control the computer, then asks to be paid in vouchers.",
    redFlags: [
      "A virus warning that shows a phone number",
      "Flashing, alarms or a voice saying do not switch off",
      "Someone asks to connect to the computer",
      "Payment is demanded in vouchers or gift cards",
    ],
    tellYourParent:
      "A real computer warning never asks you to phone anyone, so if the screen starts shouting, switch the computer off and call me — you cannot break it by turning it off.",
  },
  {
    id: "prize-bait",
    title: "The prize you never entered for",
    aka: ["The lucky winner message", "The lottery scam"],
    story:
      "A message congratulates you on winning R250,000 in a draw you cannot remember entering, and to claim it you must pay a processing fee or send your ID and banking details today. During load shedding the same trick dresses up as discounted prepaid electricity vouchers or free grocery coupons.",
    redFlags: [
      "You never entered any competition",
      "A fee must be paid before the prize is released",
      "They need your banking details to pay you",
      "It must be claimed today or it is lost",
      "You are told to keep the win confidential",
    ],
    tellYourParent:
      "Real prizes never cost anything to collect, so if you ever win something, let us open it together before you pay a cent or share a single detail.",
  },
  {
    id: "family-impersonation",
    title: "The 'Hi Mom, new number' message",
    aka: ["The WhatsApp child scam", "The new number trick"],
    story:
      "A WhatsApp from an unknown number says: Hi Mom, my phone broke, this is my new number. Within a day the messages turn urgent, because an account must be paid immediately and the banking app suddenly will not work. The money must go to an account you do not recognise, and there is always a reason a phone call is impossible.",
    redFlags: [
      "A new number, with no call to confirm it",
      "An urgent payment into an account you do not know",
      "An excuse every time you try to phone",
      "Pressure to act now and tell nobody",
    ],
    tellYourParent:
      "If I ever really get a new number I will phone you so you can hear my voice, so never send money because of a text alone.",
  },
  {
    id: "investment",
    title: "The get-rich-quick investment",
    aka: ["The Bitcoin trading scam", "The WhatsApp investment group"],
    story:
      "A Facebook ad or a WhatsApp group shows a trader turning R1,000 into R10,000 in a week, with screenshots of happy investors being paid out. On their app your money grows beautifully, but when you try to withdraw it there is suddenly a release fee, then a tax, and then silence.",
    redFlags: [
      "Returns are guaranteed or unrealistically high",
      "The invitation came from a stranger or a hacked friend",
      "Profits only exist inside their own app or site",
      "A fee or tax is needed to withdraw your own money",
      "Slots are limited and you must decide today",
    ],
    tellYourParent:
      "Anyone who guarantees to grow your money fast is lying, so before a cent leaves your account, let us have coffee and look at it together — a good opportunity can wait a day.",
  },
  {
    id: "romance",
    title: "The online friend who needs money",
    aka: ["The sweetheart scam", "The online admirer", "The lonely hearts scam"],
    story:
      "A charming widower or retired engineer sends a friend request and messages you warmly every single day for weeks. He can never video call, and just as you have grown fond of him disaster strikes: a hospital bill, a customs problem, a ticket to finally come and visit. Only you can help, and it must stay between the two of you.",
    redFlags: [
      "They can never meet or appear on a video call",
      "Strong feelings after a suspiciously short time",
      "A sudden emergency that only money can fix",
      "They want the friendship kept private",
      "Money must go by voucher, transfer or Bitcoin",
    ],
    tellYourParent:
      "Someone who truly cares about you will never need your money before you have even met, and whatever happens you can tell me anything — I will never judge you.",
  },
  {
    id: "threats",
    title: "The arrest threat and the fake fine",
    aka: ["The traffic fine SMS", "The arrest warrant email", "The e-toll scam"],
    story:
      "An email full of official-looking badges says a warrant for your arrest has been issued over unpaid traffic fines or an old e-toll bill. Unless you pay within 24 hours through their link, the sheriff will be at your door. The page wants your card details, and nothing about the fine can be checked anywhere else.",
    redFlags: [
      "An arrest threat delivered by SMS or email",
      "Payment only works through their link, right now",
      "No case number you can check anywhere official",
      "You are told to stay on the line and tell no one",
    ],
    tellYourParent:
      "Nobody in South Africa gets arrested by SMS, so if a fine ever looks real, send it to me and we will check it on the official site before paying anything.",
  },
];
