// ScamGuard pattern library: weighted phrases matched against screenshot text, each explained in plain language.
//
// Each PatternDef is one manipulation, in English and Afrikaans. The two languages sit in
// the same def on purpose: the same trick in either language counts once, and the
// caregiver-facing explanation is shared. Afrikaans phrases mostly drop the pronoun
// ("rekening sal gesluit word") so one substring covers both "u" and "jou" phrasings.

export interface PatternDef {
  /** Lower-case substrings; the first one found (affirmatively) is the match. */
  phrases: string[];
  weight: number;
  /** Plain language; names the manipulation, not the technology. */
  explanation: string;
  /**
   * "brand": the def merely names a bank or institution. When the text also shows a
   * genuine web address (LEGIT_DOMAINS) and no lookalike, this def counts for half —
   * a real bank page is allowed to say the bank's name.
   */
  kind?: "brand";
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
          // Afrikaans
          "tree nou op",
          "tree onmiddellik op",
          "dringend",
          "onmiddellike optrede vereis",
          "dringende optrede vereis",
          "antwoord onmiddellik",
          "tyd raak min",
          "moenie uitstel nie",
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
          // Afrikaans
          "binne 24 uur",
          "binne 48 uur",
          "verval vandag",
          "voor middernag",
          "laaste kans",
          "finale kennisgewing",
          "aanbod eindig vandag",
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
          // Afrikaans
          "rekening sal gesluit word",
          "rekening is opgeskort",
          "profiel is opgeskort",
          "sal permanent gesluit word",
          "rekening sal opgeskort word",
          "vermy opskorting",
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
          // Afrikaans
          "ongewone aktiwiteit",
          "verdagte aktiwiteit",
          "ongemagtigde transaksie",
          "ongewone aanmeldpoging",
          "rekening is gekompromitteer",
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
        kind: "brand",
        phrases: [
          "fnb account",
          "capitec account",
          "absa account",
          "standard bank account",
          "nedbank account",
          "tymebank account",
          "your bank account has been",
          // Afrikaans
          "fnb-rekening",
          "fnb rekening",
          "capitec-rekening",
          "capitec rekening",
          "absa-rekening",
          "absa rekening",
          "standard bank-rekening",
          "standard bank rekening",
          "nedbank-rekening",
          "nedbank rekening",
          "tymebank-rekening",
          "tymebank rekening",
          "bankrekening is",
        ],
        weight: 12,
        explanation:
          "A message that names the bank and reports a problem is usually someone pretending to be that bank, because real banks do not send links to fix accounts.",
      },
      {
        phrases: [
          "sars efiling",
          "from sars",
          "sars refund",
          "sars audit",
          "sars letter",
          "south african revenue service",
          "sassa",
          "srd grant",
          // Afrikaans
          "van sars",
          "sars-terugbetaling",
          "sars terugbetaling",
          "sars-oudit",
          "sars oudit",
          "sars-brief",
          "suid-afrikaanse inkomstediens",
          "srd-toelaag",
          "srd toelaag",
          "srd-toelae",
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
          // Afrikaans
          "efiling-terugbetaling",
          "belastingterugbetaling van r",
          "kwalifiseer vir 'n belastingterugbetaling",
          "eis u terugbetaling",
          "eis jou terugbetaling",
          "terugbetaling sal verbeur word",
          "toelaag is opgeskort",
          "toelae is opgeskort",
          "doen weer aansoek om u toelaag",
          "doen weer aansoek om jou toelaag",
          "toelaagbetaling is teruggehou",
        ],
        weight: 12,
        explanation:
          "A surprise refund is bait — SARS pays refunds into the bank account it already has on file, and SASSA never asks anyone to reapply through a link.",
      },
    ],
  },
  {
    id: "delivery-fee",
    label: "Fake parcel and delivery fees",
    patterns: [
      {
        phrases: [
          "your parcel is on hold",
          "package could not be delivered",
          "your package is waiting",
          "delivery attempt failed",
          "parcel has been suspended",
          // Afrikaans
          "pakkie word teruggehou",
          "pakkie kon nie afgelewer word nie",
          "pakkie wag vir u",
          "pakkie wag vir jou",
          "afleweringspoging het misluk",
          "pakkie is opgeskort",
        ],
        weight: 10,
        explanation:
          "A parcel your parent never ordered, suddenly stuck in transit, is one of the most common scam messages in South Africa — the parcel does not exist.",
      },
      {
        phrases: [
          "pay the customs fee",
          "customs fee of r",
          "unpaid customs fee",
          "delivery fee of r",
          "pay the delivery fee",
          "release your parcel",
          // Afrikaans
          "betaal die doeanefooi",
          "doeanefooi van r",
          "onbetaalde doeanefooi",
          "afleweringsfooi van r",
          "betaal die afleweringsfooi",
          "om u pakkie vry te stel",
          "om jou pakkie vry te stel",
        ],
        weight: 12,
        explanation:
          "Real couriers and the Post Office charge customs at collection, not through a pay-now link in a message.",
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
          // Afrikaans
          "verifieer u bankbesonderhede",
          "verifieer jou bankbesonderhede",
          "bevestig u bankbesonderhede",
          "bevestig jou bankbesonderhede",
          "dateer u bankbesonderhede op",
          "dateer jou bankbesonderhede op",
          "verifieer u kaartbesonderhede",
          "verifieer jou kaartbesonderhede",
          "bevestig u kaartnommer",
          "bevestig jou kaartnommer",
          "verifieer u rekeningbesonderhede",
          "verifieer jou rekeningbesonderhede",
          "u bankbesonderhede te verifieer",
          "jou bankbesonderhede te verifieer",
          "u bankbesonderhede te bevestig",
          "jou bankbesonderhede te bevestig",
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
          // Afrikaans
          "bevestig u pin",
          "bevestig jou pin",
          "verskaf u pin",
          "verskaf jou pin",
          "stuur u pin",
          "stuur jou pin",
          "voer u otm-pin in",
          "antwoord met u wagwoord",
          "antwoord met jou wagwoord",
          "stuur u wagwoord",
          "stuur jou wagwoord",
          "behou u huidige wagwoord",
          "behou jou huidige wagwoord",
          "behou my wagwoord",
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
          // Afrikaans
          "id-nommer en bankbesonderhede",
          "id nommer en bankbesonderhede",
          "voer u id-nommer in om te eis",
          "voer jou id-nommer in om te eis",
          "stuur 'n afskrif van u id",
          "stuur 'n afskrif van jou id",
          "id en bewys van adres om te eis",
        ],
        weight: 12,
        explanation:
          "Scammers collect ID numbers together with banking details so they can pose as your parent and open or empty accounts.",
      },
      {
        phrases: [
          "enter the otp",
          "enter your otp",
          "otp to verify",
          "submit the otp",
          "send the otp",
          "send us the otp",
          "one time pin",
          "one-time pin",
          "share your otp",
          // Afrikaans
          "voer die otp in",
          "voer u otp in",
          "voer jou otp in",
          "otp om te verifieer",
          "dien die otp in",
          "stuur die otp",
          "stuur die otp vir ons",
          "eenmalige pin",
          "deel u otp",
          "deel jou otp",
        ],
        weight: 20,
        explanation:
          "A one-time PIN is the key to the account — the bank sends it so only your parent can approve a payment, and nobody honest will ever ask them to hand it over.",
      },
    ],
  },
  {
    id: "payment-red-flags",
    label: "Strange ways to pay",
    patterns: [
      {
        phrases: [
          "with a gift card",
          "buy a gift card",
          "in gift cards",
          "gift card or voucher",
          "itunes card",
          "google play card",
          "1voucher",
          "ott voucher",
          "voucher pin",
          "buy a voucher",
          "send the voucher code",
          "pay with vouchers",
          // Afrikaans
          "met 'n geskenkkaart",
          "koop 'n geskenkkaart",
          "in geskenkkaarte",
          "geskenkkaart of koopbewys",
          "koopbewys-pin",
          "koopbewys pin",
          "koop 'n koopbewys",
          "stuur die koopbewyskode",
          "betaal met koopbewyse",
        ],
        weight: 16,
        explanation:
          "No real bank, company or government office asks to be paid in gift cards or vouchers — only scammers do, because vouchers cannot be traced.",
      },
      {
        phrases: [
          "deposit to secure",
          "pay a deposit to secure",
          "deposit before delivery",
          "courier will deliver it",
          "courier will collect",
          "secure the item with a deposit",
          // Afrikaans
          "deposito om te verseker",
          "betaal 'n deposito om te verseker",
          "deposito voor aflewering",
          "koerier sal dit aflewer",
          "koerier sal dit kom haal",
          "verseker die item met 'n deposito",
        ],
        weight: 12,
        explanation:
          "On marketplace sites, a stranger asking for a deposit before your parent has seen the item usually keeps both the deposit and the item.",
      },
      {
        phrases: [
          "bitcoin",
          "bitcoin atm",
          "crypto wallet",
          "cryptocurrency payment",
          "pay with crypto",
          "usdt",
          // Afrikaans
          "kripto-beursie",
          "kripto beursie",
          "kriptobetaling",
          "betaal met kripto",
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
          // Afrikaans
          "verwerkingsfooi",
          "vrystellingsfooi",
          "aktiveringsfooi",
          "klaringsfooi",
          "adminfooi om te eis",
          "betaal 'n klein fooi",
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
          // Afrikaans
          "stuur die ewallet-pin",
          "ewallet-pin",
          "cash send-pin",
          "instant money-pin",
          "betaal onmiddellik in hierdie rekening",
          "oorbetaling na hierdie rekening onmiddellik",
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
          // Afrikaans
          "u het gewen",
          "jy het gewen",
          "geluk u is gekies",
          "geluk jy is gekies",
          "u is 'n wenner",
          "jy is 'n wenner",
          "u is gekies",
          "jy is gekies",
          "eis u prys",
          "eis jou prys",
          "eis u beloning",
          "eis jou beloning",
          "gelukkige wenner",
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
          // Afrikaans
          "lotto-wengeld",
          "lotto wengeld",
          "lotery-wengeld",
          "lotery wengeld",
          "nasionale lotery-prys",
          "u wengeld van",
          "jou wengeld van",
          "onopgeëiste wengeld",
          "gelukkige trekking",
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
          // Afrikaans
          "gratis lugtyd",
          "gratis data",
          "eis u gratis",
          "eis jou gratis",
          "afslag op voorafbetaalde elektrisiteit",
          "voorafbetaalde elektrisiteit-afslag",
          "gratis kruideniersware-koopbewys",
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
          "viruses have been detected on your",
          "virus has been detected on your",
          "viruses detected on your computer",
          "spyware detected on your",
          "microsoft security alert",
          "your pc is at risk",
          // Afrikaans
          "rekenaar is besmet",
          "virusse is op u rekenaar opgespoor",
          "virusse is op jou rekenaar opgespoor",
          "virus is op u rekenaar opgespoor",
          "virus is op jou rekenaar opgespoor",
          "virusse opgespoor op u rekenaar",
          "spioenware opgespoor",
          "microsoft-sekuriteitswaarskuwing",
          "microsoft sekuriteitswaarskuwing",
          "u rekenaar loop gevaar",
          "jou rekenaar loop gevaar",
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
          // Afrikaans
          "bel microsoft",
          "bel hierdie nommer onmiddellik",
          "bel ons tolvrye nommer",
          "bel ondersteuning onmiddellik",
          "bel die nommer hieronder",
          "gesertifiseerde tegnici",
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
          // Afrikaans
          "moenie u rekenaar afskakel nie",
          "moenie jou rekenaar afskakel nie",
          "moenie hierdie venster toemaak nie",
          "rekenaar is gesluit",
          "windows is geblokkeer",
          "lêers is geënkripteer",
          "rekenaar sal gedeaktiveer word",
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
          // Afrikaans
          "afstandtoegang tot u rekenaar",
          "afstandtoegang tot jou rekenaar",
          "laat afstandtoegang toe",
          "gee die tegnikus toegang",
          "installeer hierdie program sodat ons",
        ],
        weight: 20,
        explanation:
          "Anyone who asks to connect to your parent's computer from far away is trying to take control of it — no real company does this uninvited.",
      },
      {
        phrases: [
          "app version is outdated",
          "app will stop working",
          "update your banking app immediately",
          "update your app immediately",
          "app has expired",
          // Afrikaans
          "app-weergawe is verouderd",
          "app weergawe is verouderd",
          "app sal ophou werk",
          "dateer u bankapp onmiddellik op",
          "dateer jou bankapp onmiddellik op",
          "dateer u app onmiddellik op",
          "dateer jou app onmiddellik op",
          "app het verval",
        ],
        weight: 12,
        explanation:
          "Banks update their apps quietly through the app store — a message warning that the app will stop working is pushing your parent toward a fake download.",
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
          // Afrikaans
          "dit is my nuwe nommer",
          "my nuwe nommer",
          "ek het 'n nuwe nommer",
          "nuwe nommer",
          "my foon is stukkend",
          "my foon is gebreek",
          "ek het my foon verloor",
          "foon het in die water geval",
          "gebruik 'n vriend se foon",
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
          // Afrikaans
          "hallo ma",
          "hallo pa",
          "hi mamma",
          "hallo mamma",
          "hi pappa",
          "hallo pappa",
          "hallo mammie",
          "hi mammie",
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
          // Afrikaans
          "dringende betaling",
          "kan ma geld stuur",
          "kan pa geld stuur",
          "kan jy geld stuur",
          "kan u geld stuur",
          "ek het dringend geld nodig",
          "betaal dit vir my",
          "betaling vir my",
          "stuur dit na hierdie rekening",
          "eft na hierdie rekening",
          "my bankapp werk nie",
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
          // Afrikaans
          "moenie vir enigiemand sê nie",
          "moenie vir iemand sê nie",
          "moet niemand vertel nie",
          "hou dit tussen ons",
          "hou dit vertroulik",
          "moenie vir u familie sê nie",
          "moenie vir jou familie sê nie",
          "sê vir niemand nie",
          "vertel niemand nie",
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
          // Afrikaans
          "gewaarborgde opbrengs",
          "gewaarborgde wins",
          "risikovrye belegging",
          "verdubbel u geld",
          "verdubbel jou geld",
          "100% opbrengs",
          "gewaarborgde maandelikse inkomste",
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
          // Afrikaans
          "forex-handelsgroep",
          "forex handelsgroep",
          "bitcoin-handelsplatform",
          "kripto-beleggingsgeleentheid",
          "sluit aan by ons handelsgroep",
          "handelseine",
          "handelsrobot",
          "outomatiese handel",
          "onttrekkings daagliks betaal",
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
          // Afrikaans
          "beperkte plekke",
          "plekke is beperk",
          "verseker u plek",
          "verseker jou plek",
          "geleentheid van 'n leeftyd",
          "eenmalige geleentheid",
          "registrasie sluit",
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
          // Afrikaans
          "betaal 'n fooi om te onttrek",
          "fooi om u wins vry te stel",
          "fooi om jou wins vry te stel",
          "betaal belasting voor onttrekking",
          "stel u wins vry",
          "stel jou wins vry",
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
          // Afrikaans
          "u sal gearresteer word",
          "jy sal gearresteer word",
          "lasbrief vir u arrestasie",
          "lasbrief vir jou arrestasie",
          "lasbrief van arrestasie",
          "vermy arrestasie",
          "polisie sal gestuur word",
          "onder kriminele ondersoek",
          "lasbrief is uitgereik",
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
          // Afrikaans
          "uitstaande boete",
          "onbetaalde verkeersboete",
          "uitstaande e-toll",
          "e-toll-boete",
          "verkeersboete van r",
          "betaal u boete onmiddellik",
          "betaal jou boete onmiddellik",
          "boete sal verdubbel",
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
          // Afrikaans
          "ons het u opgeneem",
          "ons het jou opgeneem",
          "deur u webkamera opgeneem",
          "deur jou webkamera opgeneem",
          "ons sal dit aan al u kontakte stuur",
          "ons sal dit aan al jou kontakte stuur",
          "betaal of ons deel",
          "u kamera is gekap",
          "jou kamera is gekap",
        ],
        weight: 16,
        explanation:
          "Emails claiming to have embarrassing recordings are bluffs sent to thousands of people, hoping fear makes a few of them pay.",
      },
      {
        phrases: [
          "meter will be disconnected",
          "electricity will be disconnected",
          "new token system",
          "update your meter",
          "meter has been blocked",
          // Afrikaans
          "meter sal ontkoppel word",
          "elektrisiteit sal afgesny word",
          "elektrisiteit sal ontkoppel word",
          "nuwe tokenstelsel",
          "nuwe token-stelsel",
          "dateer u meter op",
          "dateer jou meter op",
          "meter is geblokkeer",
        ],
        weight: 12,
        explanation:
          "Fake municipal messages threaten to cut the lights so people pay into the wrong account — real changes arrive on the bill, not through an SMS link.",
      },
    ],
  },
];

/* ----------------------------------------------------------------------------
 * Engine v3 data: signals that reinforce each other, and web addresses.
 * -------------------------------------------------------------------------- */

/** Two categories that, found close together, are worth more than their sum. */
export interface Combination {
  id: string;
  categories: [string, string];
  /** Maximum distance in characters between the two matches. */
  within: number;
  weight: number;
  explanation: string;
}

export const COMBINATIONS: Combination[] = [
  {
    id: "brand-and-deadline",
    categories: ["impersonation", "urgency"],
    within: 240,
    weight: 10,
    explanation:
      "Naming a bank or SARS and setting a deadline in the same breath is the classic shape of a phishing message — the real institution does neither at once.",
  },
  {
    id: "brand-and-details",
    categories: ["impersonation", "credentials"],
    within: 240,
    weight: 10,
    explanation:
      "A named bank or SARS asking for details right there on the page is exactly what the real one never does — the name is borrowed to make the request feel normal.",
  },
  {
    id: "deadline-and-details",
    categories: ["urgency", "credentials"],
    within: 240,
    weight: 8,
    explanation:
      "A deadline attached to a request for details is designed so your parent types first and thinks later.",
  },
  {
    id: "prize-and-fee",
    categories: ["prize-bait", "payment-red-flags"],
    within: 300,
    weight: 8,
    explanation:
      "A prize that needs a payment before it can be collected is not a prize — the payment is the whole point.",
  },
  {
    id: "threat-and-payment",
    categories: ["threats", "payment-red-flags"],
    within: 300,
    weight: 8,
    explanation:
      "A fine or an arrest that can be settled with a voucher or transfer right now is intimidation with a price tag — no court or police service works that way.",
  },
];

/**
 * Genuine web addresses. Matching is by suffix ("online.fnb.co.za" counts), so listing
 * "gov.za" covers SARS, SASSA and every municipality. A domain that is NOT here but
 * contains one of BRAND_TOKENS is a lookalike and scores as impersonation.
 */
export const LEGIT_DOMAINS: string[] = [
  "capitec.co.za", "capitecbank.co.za", "fnb.co.za", "rmb.co.za", "absa.co.za", "absa.africa",
  "standardbank.co.za", "standardbank.com", "nedbank.co.za", "tymebank.co.za",
  "discovery.co.za", "discovery.com", "investec.com", "investec.co.za", "africanbank.co.za",
  "gov.za", "postoffice.co.za", "postnet.co.za", "eskom.co.za", "vodacom.co.za", "mtn.co.za",
  "telkom.co.za", "takealot.com", "microsoft.com", "live.com", "office.com", "netflix.com",
  "paypal.com", "dhl.com", "fedex.com", "whatsapp.com",
];

/** Names that a lookalike address borrows. Matched as substrings of the whole domain. */
export const BRAND_TOKENS: string[] = [
  "capitec", "fnb", "absa", "standardbank", "standard-bank", "nedbank", "tymebank", "tyme-bank",
  "discovery", "investec", "africanbank", "african-bank", "sars", "sassa", "efiling",
  "postoffice", "post-office", "postnet", "eskom", "vodacom", "mtn", "telkom", "takealot",
  "microsoft", "netflix", "paypal", "dhl", "fedex", "whatsapp",
];

export const LOOKALIKE_WEIGHT = 16;
export const LOOKALIKE_EXPLANATION =
  "The web address borrows a bank's or an official name but is not the real address — that is how a fake page makes itself look genuine. Real addresses end in fnb.co.za, capitec.co.za, sars.gov.za and the like.";
export const LEGIT_DOMAIN_NOTE =
  "Counted for less here because a genuine web address appears in the text — fakes usually show a lookalike instead.";
