// ScamGuard pattern library: weighted phrases matched against screenshot text, each explained in plain language.

export interface PatternDef {
  phrases: string[];
  weight: number;
  explanation: string;
}

export interface PatternCategory {
  id: string;
  label: string;
  patterns: PatternDef[];
}

export const PATTERN_LIBRARY: PatternCategory[] = [
  {
    id: "urgency",
    label: "Urgency and pressure",
    patterns: [
      {
        phrases: [
          "act now",
          "act immediately",
          "urgent",
          "immediate action required",
          "urgent action required",
          "respond immediately",
          "time is running out",
          "do not delay",
        ],
        weight: 10,
        explanation:
          "Scammers rush you on purpose, because people who stop to think or ask someone they trust usually spot the trick.",
      },
      {
        phrases: [
          "within 24 hours",
          "within 48 hours",
          "expires today",
          "before midnight",
          "last chance",
          "final notice",
          "offer ends today",
        ],
        weight: 8,
        explanation:
          "A ticking deadline is pressure, not truth — anything genuine will still be true tomorrow.",
      },
      {
        phrases: [
          "your account will be closed",
          "account has been suspended",
          "profile has been suspended",
          "will be permanently closed",
          "your account will be suspended",
          "avoid suspension",
        ],
        weight: 12,
        explanation:
          "Threatening to close or suspend an account is a scare tactic to make your parent click a link instead of phoning the real company.",
      },
      {
        phrases: [
          "unusual activity",
          "suspicious activity",
          "unauthorised transaction",
          "unauthorized transaction",
          "unusual login attempt",
          "your account has been compromised",
        ],
        weight: 8,
        explanation:
          "Warnings about strange activity are meant to cause panic — the safe response is to contact the bank on the number printed on the card, not through the message.",
      },
    ],
  },
  {
    id: "impersonation",
    label: "Pretending to be a bank or SARS",
    patterns: [
      {
        phrases: [
          "fnb account",
          "capitec account",
          "absa account",
          "standard bank account",
          "nedbank account",
          "tymebank account",
          "your bank account has been",
        ],
        weight: 12,
        explanation:
          "A message that names the bank and reports a problem is usually someone pretending to be that bank, because real banks do not send links to fix accounts.",
      },
      {
        phrases: [
          "sars",
          "south african revenue service",
          "efiling",
          "sassa",
          "srd grant",
        ],
        weight: 10,
        explanation:
          "Scammers dress up as SARS or SASSA because official-sounding messages make people do as they are told.",
      },
      {
        phrases: [
          "efiling refund",
          "tax refund of r",
          "eligible for a tax refund",
          "claim your refund",
          "refund will be forfeited",
          "grant has been suspended",
          "reapply for your grant",
          "grant payment is on hold",
        ],
        weight: 12,
        explanation:
          "A surprise refund, or a grant that suddenly needs reapplying through a link, is bait — real refunds and grants never work through links.",
      },
      {
        phrases: [
          "your parcel is on hold",
          "package could not be delivered",
          "pay the customs fee",
          "customs fee of r",
          "your package is waiting",
          "delivery attempt failed",
        ],
        weight: 9,
        explanation:
          "Fake parcel messages invent a small customs or delivery fee so your parent types card details into a payment page.",
      },
    ],
  },
  {
    id: "credentials",
    label: "Asking for PINs and banking details",
    patterns: [
      {
        phrases: [
          "verify your banking details",
          "confirm your banking details",
          "update your banking details",
          "verify your card details",
          "confirm your card number",
          "verify your account details",
          "verify your details within",
        ],
        weight: 18,
        explanation:
          "Real banks never ask you to confirm your PIN, card number or banking details through a link, pop-up or email.",
      },
      {
        phrases: [
          "confirm your pin",
          "provide your pin",
          "send your pin",
          "enter your atm pin",
          "reply with your password",
          "send your password",
          "keep your current password",
          "keep my password",
        ],
        weight: 18,
        explanation:
          "No real company asks for a PIN or password, or offers a button to keep an old password — that request is the theft itself.",
      },
      {
        phrases: [
          "id number and banking details",
          "enter your id number to claim",
          "send a copy of your id",
          "id and proof of address to claim",
        ],
        weight: 12,
        explanation:
          "Scammers collect ID numbers together with banking details so they can pose as your parent and open or empty accounts.",
      },
    ],
  },
  {
    id: "payment-red-flags",
    label: "Strange ways to pay",
    patterns: [
      {
        phrases: [
          "gift card",
          "itunes card",
          "google play card",
          "1voucher",
          "voucher pin",
          "buy a voucher",
          "send the voucher code",
          "pay with vouchers",
        ],
        weight: 16,
        explanation:
          "No real bank, company or government office asks to be paid in gift cards or vouchers — only scammers do, because vouchers cannot be traced.",
      },
      {
        phrases: [
          "bitcoin",
          "bitcoin atm",
          "crypto wallet",
          "cryptocurrency payment",
          "pay with crypto",
          "usdt",
        ],
        weight: 14,
        explanation:
          "Asking for payment in Bitcoin or other crypto is a warning sign, because that money cannot be traced or recovered once sent.",
      },
      {
        phrases: [
          "processing fee",
          "release fee",
          "activation fee",
          "clearance fee",
          "admin fee to claim",
          "pay a small fee",
        ],
        weight: 10,
        explanation:
          "Real prizes, refunds and parcels never need money upfront — the small fee is the entire point of the scam.",
      },
      {
        phrases: [
          "western union",
          "moneygram",
          "send the ewallet pin",
          "cash send pin",
          "instant money pin",
          "transfer to this account immediately",
        ],
        weight: 10,
        explanation:
          "Scammers love eWallet, CashSend and Western Union style transfers because the money is gone the moment it is sent.",
      },
    ],
  },
  {
    id: "prize-bait",
    label: "Prizes and lucky draws",
    patterns: [
      {
        phrases: [
          "you have won",
          "you've won",
          "congratulations you have been selected",
          "you are a winner",
          "you have been chosen",
          "claim your prize",
          "claim your reward",
          "lucky winner",
        ],
        weight: 12,
        explanation:
          "Your parent cannot win a competition they never entered — a surprise prize exists only to collect details or a fee.",
      },
      {
        phrases: [
          "lotto winnings",
          "lottery winnings",
          "national lottery prize",
          "your winnings of",
          "unclaimed winnings",
          "lucky draw",
        ],
        weight: 12,
        explanation:
          "Real lottery or lucky draw winnings are never announced by SMS, email or a link with a claim button.",
      },
      {
        phrases: [
          "free airtime",
          "free data",
          "claim your free",
          "prepaid electricity discount",
          "discount on prepaid electricity",
          "free grocery voucher",
        ],
        weight: 8,
        explanation:
          "Free airtime, data or discounted prepaid electricity is bait that spreads fastest during load shedding, and the link is the trap.",
      },
    ],
  },
  {
    id: "tech-support",
    label: "Fake computer warnings",
    patterns: [
      {
        phrases: [
          "your computer has been infected",
          "your computer is infected",
          "viruses have been detected",
          "virus has been detected",
          "spyware detected",
          "microsoft security alert",
          "your pc is at risk",
        ],
        weight: 14,
        explanation:
          "A web page cannot scan a computer, so a browser warning about viruses is theatre designed to cause panic.",
      },
      {
        phrases: [
          "call microsoft",
          "call this number immediately",
          "call our toll free number",
          "call support immediately",
          "call the number below",
          "certified technicians",
        ],
        weight: 16,
        explanation:
          "Real error messages never include a phone number to call — that number rings straight through to the scammers.",
      },
      {
        phrases: [
          "do not shut down your computer",
          "do not close this window",
          "your computer has been locked",
          "windows has been blocked",
          "your files have been encrypted",
          "computer will be disabled",
        ],
        weight: 16,
        explanation:
          "Telling you not to close the window or switch off the computer is a trick to keep the fear going — switching off is exactly the right move.",
      },
      {
        phrases: [
          "anydesk",
          "teamviewer",
          "remote access to your computer",
          "allow remote access",
          "give the technician access",
          "install this program so we can",
        ],
        weight: 20,
        explanation:
          "Anyone who asks to connect to your parent's computer from far away is trying to take control of it — no real company does this uninvited.",
      },
    ],
  },
  {
    id: "family-impersonation",
    label: "Pretending to be family",
    patterns: [
      {
        phrases: [
          "this is my new number",
          "my new number",
          "i got a new number",
          "new number",
          "my phone broke",
          "i lost my phone",
          "phone fell in the water",
          "using a friends phone",
        ],
        weight: 12,
        explanation:
          "Claiming a new number explains away why the message is not coming from the number your parent has saved for you.",
      },
      {
        phrases: [
          "hi mom",
          "hi mum",
          "hi dad",
          "hello mom",
          "hello mum",
          "hi mommy",
          "hi mummy",
        ],
        weight: 8,
        explanation:
          "Opening with a warm greeting and no name lets your parent fill in which child or grandchild it must be.",
      },
      {
        phrases: [
          "urgent payment",
          "can you send money",
          "i need money urgently",
          "pay it for me",
          "payment for me",
          "send it to this account",
          "eft to this account",
          "my banking app is not working",
        ],
        weight: 16,
        explanation:
          "The story always ends with an urgent payment into a stranger's account, plus a reason why your parent cannot simply phone you to check.",
      },
    ],
  },
  {
    id: "secrecy",
    label: "Secrecy demands",
    patterns: [
      {
        phrases: [
          "do not tell anyone",
          "dont tell anyone",
          "don't tell anyone",
          "keep this between us",
          "keep it between us",
          "keep this confidential",
          "do not tell your family",
          "tell no one",
        ],
        weight: 18,
        explanation:
          "Demanding secrecy or confidentiality cuts your parent off from the one thing that defeats every scam: a quick word with you.",
      },
    ],
  },
  {
    id: "investment",
    label: "Get-rich-quick promises",
    patterns: [
      {
        phrases: [
          "guaranteed returns",
          "guaranteed profit",
          "risk free investment",
          "double your money",
          "100% return",
          "guaranteed monthly income",
        ],
        weight: 15,
        explanation:
          "No honest investment can guarantee returns — a promised profit means the numbers are invented.",
      },
      {
        phrases: [
          "forex trading group",
          "bitcoin trading platform",
          "crypto investment opportunity",
          "join our trading group",
          "trading signals",
          "trading robot",
          "automated trading",
          "withdrawals paid daily",
        ],
        weight: 12,
        explanation:
          "Strangers offering trading robots or to trade on your parent's behalf are not investing the money, they are taking it.",
      },
      {
        phrases: [
          "limited slots",
          "limited spots",
          "slots are limited",
          "secure your spot",
          "secure your slot",
          "opportunity of a lifetime",
          "once in a lifetime",
          "registration closes",
        ],
        weight: 9,
        explanation:
          "Limited spots and closing-tonight offers exist so your parent commits before anyone can check the story.",
      },
      {
        phrases: [
          "pay a fee to withdraw",
          "fee to release your",
          "unlock your withdrawal",
          "pay tax before withdrawing",
          "release your profit",
        ],
        weight: 16,
        explanation:
          "Having to pay a fee or tax before withdrawing your own money means the money was never really there.",
      },
    ],
  },
  {
    id: "threats",
    label: "Threats and scare tactics",
    patterns: [
      {
        phrases: [
          "you will be arrested",
          "warrant for your arrest",
          "warrant of arrest",
          "avoid arrest",
          "police will be sent",
          "under criminal investigation",
          "warrant has been issued",
        ],
        weight: 16,
        explanation:
          "The police and the courts never announce an arrest by SMS, email or phone call — that threat is pure intimidation.",
      },
      {
        phrases: [
          "outstanding fine",
          "unpaid traffic fine",
          "outstanding e-toll",
          "etoll fine",
          "traffic fine of r",
          "pay your fine immediately",
          "your fine will double",
        ],
        weight: 9,
        explanation:
          "Fake fines push for payment through a link right now, before anyone can check whether the fine even exists.",
      },
      {
        phrases: [
          "we have recorded you",
          "recorded you through your webcam",
          "embarrassing video of you",
          "we will send it to all your contacts",
          "pay or we will share",
          "your camera was hacked",
        ],
        weight: 16,
        explanation:
          "Emails claiming to have embarrassing recordings are bluffs sent to thousands of people, hoping fear makes a few of them pay.",
      },
    ],
  },
];
