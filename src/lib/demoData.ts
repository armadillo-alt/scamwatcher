// Demo data for ScamGuard: sample red-key screenshots from a South African household.
import type { ScreenshotRow } from "./types";

const at = (daysAgo: number, hm: string): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const [h, m] = hm.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  // A "today" row scheduled later than the current clock would read as arriving in the
  // future; pull it back to a few minutes ago so the demo always looks freshly captured.
  const now = Date.now();
  if (d.getTime() > now) d.setTime(now - 3 * 60_000);
  return d.toISOString();
};

const svg = (s: string): string => "data:image/svg+xml;utf8," + encodeURIComponent(s);

export const DEMO_ROWS: ScreenshotRow[] = [
  {
    id: "demo-01",
    screenshotUrl: svg(`<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
<rect width="800" height="500" fill="#FFFFFF"/>
<rect width="800" height="36" fill="#EDEEE6"/>
<circle cx="22" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="42" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="62" cy="18" r="6" fill="#C9CCBB"/>
<rect x="100" y="70" width="600" height="64" rx="6" fill="#9E2B25"/>
<text x="400" y="112" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="bold" fill="#FFFFFF">SECURITY ALERT</text>
<text x="400" y="180" text-anchor="middle" font-family="Georgia, serif" font-size="21" fill="#333333">Your computer has been infected</text>
<rect x="160" y="215" width="480" height="13" rx="6" fill="#E3E4DA"/>
<rect x="160" y="242" width="420" height="13" rx="6" fill="#E3E4DA"/>
<rect x="160" y="269" width="450" height="13" rx="6" fill="#E3E4DA"/>
<text x="400" y="345" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#333333">Call 0800 555 0199</text>
<text x="400" y="400" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#555555">Time remaining 04:59</text>
</svg>`),
    timestamp: at(0, "09:14"),
    device: "Mom's PC",
    ocrText:
      "WARNING - SECURITY ALERT. Your computer has been infected with 5 viruses. Your banking details, passwords and photos will be deleted in 04:59. Do not shut down your computer. Call Microsoft Certified Technicians now on toll-free 0800 555 0199. Immediate action required. Error code 0x80072EE7. Do not close this window or your data will be lost.",
  },
  {
    id: "demo-02",
    screenshotUrl: svg(`<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
<rect width="800" height="500" fill="#FFFFFF"/>
<rect width="800" height="36" fill="#EDEEE6"/>
<circle cx="22" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="42" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="62" cy="18" r="6" fill="#C9CCBB"/>
<text x="70" y="105" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#333333">FNB</text>
<text x="70" y="155" font-family="Arial, sans-serif" font-size="22" fill="#333333">Your account has been suspended</text>
<rect x="70" y="190" width="520" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="217" width="470" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="244" width="500" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="271" width="430" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="330" width="230" height="48" rx="6" fill="#9E2B25"/>
<text x="185" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#FFFFFF">Verify within 24 hours</text>
</svg>`),
    timestamp: at(0, "16:42"),
    device: "Mom's PC",
    ocrText:
      "FNB First National Bank. Dear Valued Customer, we have detected unusual activity on your account. Your online banking profile has been suspended. You must verify your details within 24 hours or your account will be permanently closed. Click the secure link below to restore access now: www.fnb-secure-login.co.za.verify-account.com. Failure to act will result in loss of funds.",
  },
  {
    id: "demo-03",
    screenshotUrl: svg(`<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
<rect width="800" height="500" fill="#FFFFFF"/>
<rect width="800" height="36" fill="#EDEEE6"/>
<circle cx="22" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="42" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="62" cy="18" r="6" fill="#C9CCBB"/>
<text x="70" y="105" font-family="Georgia, serif" font-size="32" font-weight="bold" fill="#333333">SARS eFiling</text>
<text x="70" y="160" font-family="Arial, sans-serif" font-size="22" fill="#333333">Tax refund due: R3,450.00</text>
<rect x="70" y="195" width="520" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="222" width="460" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="249" width="490" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="310" width="260" height="48" rx="6" fill="#9E2B25"/>
<text x="200" y="340" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#FFFFFF">Claim your refund</text>
</svg>`),
    timestamp: at(1, "11:05"),
    device: "Dad's laptop",
    ocrText:
      "SARS eFiling - South African Revenue Service. Our latest calculation shows you are eligible for a tax refund of R3,450.00. To claim your refund, click below and verify your banking details so we can process the payment. Refunds not claimed within 48 hours will be forfeited. Reference TX-2026-88431. Proceed to claim refund.",
  },
  {
    id: "demo-04",
    screenshotUrl: svg(`<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
<rect width="800" height="500" fill="#FFFFFF"/>
<rect width="800" height="36" fill="#EDEEE6"/>
<circle cx="22" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="42" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="62" cy="18" r="6" fill="#C9CCBB"/>
<text x="400" y="125" text-anchor="middle" font-family="Georgia, serif" font-size="40" font-weight="bold" fill="#333333">You have WON</text>
<text x="400" y="175" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#333333">R250,000 Lucky Draw</text>
<rect x="180" y="215" width="440" height="13" rx="6" fill="#E3E4DA"/>
<rect x="180" y="242" width="380" height="13" rx="6" fill="#E3E4DA"/>
<text x="400" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#555555">Pay the release fee with a 1Voucher to claim</text>
<rect x="290" y="335" width="220" height="50" rx="25" fill="#9E2B25"/>
<text x="400" y="367" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF">CLAIM NOW</text>
</svg>`),
    timestamp: at(1, "19:23"),
    device: "Mom's PC",
    ocrText:
      "CONGRATULATIONS! You have WON R250,000 in the Shoprite Checkers 45th Anniversary Lucky Draw. Your cell number was selected from our national database. To claim your prize you must first pay a release fee of R480 using a 1Voucher or OTT voucher from any till point. SMS the voucher PIN to 071 555 0182 within 24 hours. Winners must keep this confidential.",
  },
  {
    id: "demo-05",
    screenshotUrl: svg(`<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
<rect width="800" height="500" fill="#FFFFFF"/>
<rect width="800" height="36" fill="#EDEEE6"/>
<circle cx="22" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="42" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="62" cy="18" r="6" fill="#C9CCBB"/>
<rect x="0" y="36" width="800" height="48" fill="#E3E4DA"/>
<text x="24" y="66" font-family="Arial, sans-serif" font-size="19" fill="#333333">WhatsApp Web - Unknown number</text>
<rect x="60" y="120" width="430" height="52" rx="14" fill="#E3E4DA"/>
<text x="82" y="152" font-family="Arial, sans-serif" font-size="17" fill="#333333">Hi Mom, this is my new number</text>
<rect x="60" y="188" width="500" height="52" rx="14" fill="#E3E4DA"/>
<text x="82" y="220" font-family="Arial, sans-serif" font-size="17" fill="#333333">I need you to make an urgent payment please</text>
<rect x="60" y="256" width="360" height="13" rx="6" fill="#E3E4DA"/>
<rect x="60" y="283" width="320" height="13" rx="6" fill="#E3E4DA"/>
<rect x="60" y="425" width="680" height="40" rx="20" fill="#E3E4DA"/>
</svg>`),
    timestamp: at(3, "08:37"),
    device: "Mom's PC",
    ocrText:
      "WhatsApp Web. Unknown number. Hi Mom, this is my new number, my phone broke yesterday. I need you to make an urgent payment for me please, R2,300 for my car repair. The mechanic is waiting and I cannot do banking on this phone. Please pay now and I will explain later. Do not call, my microphone is broken. EFT to this account.",
  },
  {
    id: "demo-06",
    screenshotUrl: svg(`<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
<rect width="800" height="500" fill="#FFFFFF"/>
<rect width="800" height="36" fill="#EDEEE6"/>
<circle cx="22" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="42" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="62" cy="18" r="6" fill="#C9CCBB"/>
<text x="70" y="105" font-family="Arial, sans-serif" font-size="30" font-weight="bold" fill="#333333">Microsoft 365</text>
<text x="70" y="158" font-family="Arial, sans-serif" font-size="22" fill="#333333">Your password expires today</text>
<rect x="70" y="195" width="500" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="222" width="440" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="249" width="470" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="310" width="250" height="48" rx="6" fill="#C9CCBB"/>
<text x="195" y="340" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#333333">Keep my password</text>
</svg>`),
    timestamp: at(4, "14:11"),
    device: "Dad's laptop",
    ocrText:
      "Microsoft 365 IT Notice. Your Microsoft password expires today. Click here to keep your current password and avoid interruption to your mailbox. If no action is taken your account access will be limited. This message was sent to all staff by the IT Helpdesk. Keep Password button below.",
  },
  {
    id: "demo-07",
    screenshotUrl: svg(`<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
<rect width="800" height="500" fill="#FFFFFF"/>
<rect width="800" height="36" fill="#EDEEE6"/>
<circle cx="22" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="42" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="62" cy="18" r="6" fill="#C9CCBB"/>
<text x="70" y="105" font-family="Georgia, serif" font-size="32" font-weight="bold" fill="#333333">BitVault Trading</text>
<text x="70" y="158" font-family="Arial, sans-serif" font-size="24" fill="#333333">R500 becomes R15,000 in 7 days</text>
<text x="70" y="200" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#555555">GUARANTEED RETURNS</text>
<rect x="70" y="235" width="480" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="262" width="430" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="320" width="230" height="50" rx="25" fill="#9E2B25"/>
<text x="185" y="352" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="bold" fill="#FFFFFF">ACT NOW</text>
</svg>`),
    timestamp: at(6, "10:48"),
    device: "Dad's laptop",
    ocrText:
      "BitVault Trading SA. GUARANTEED RETURNS for South African investors. R500 becomes R15,000 in just 7 days with our automated AI trading robot. No experience needed, withdrawals paid daily. Limited spots available - act now, registration closes tonight. Join over 12,000 members already earning. WhatsApp Trevor on 082 555 0147 to secure your spot today.",
  },
  {
    id: "demo-08",
    screenshotUrl: svg(`<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
<rect width="800" height="500" fill="#FFFFFF"/>
<rect width="800" height="36" fill="#EDEEE6"/>
<circle cx="22" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="42" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="62" cy="18" r="6" fill="#C9CCBB"/>
<text x="70" y="105" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#333333">News24</text>
<rect x="70" y="122" width="120" height="6" fill="#3D6B35"/>
<text x="70" y="175" font-family="Georgia, serif" font-size="24" fill="#333333">Load shedding schedule for the week ahead</text>
<rect x="70" y="210" width="560" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="237" width="600" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="264" width="540" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="291" width="580" height="13" rx="6" fill="#E3E4DA"/>
<rect x="70" y="318" width="500" height="13" rx="6" fill="#E3E4DA"/>
<text x="70" y="380" font-family="Arial, sans-serif" font-size="16" fill="#777777">Eskom news desk</text>
</svg>`),
    timestamp: at(8, "07:29"),
    device: "Mom's PC",
    ocrText:
      "News24. Load shedding: here is the schedule for the week ahead. Eskom said on Monday that stage 2 load shedding will continue until Thursday morning, with generation units at Medupi and Kusile expected back online over the weekend. Municipal customers should consult their local schedules. City of Cape Town will run stage 1 owing to Steenbras capacity. Full schedules below.",
  },
  {
    id: "demo-09",
    screenshotUrl: svg(`<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
<rect width="800" height="500" fill="#FFFFFF"/>
<rect width="800" height="36" fill="#EDEEE6"/>
<circle cx="22" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="42" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="62" cy="18" r="6" fill="#C9CCBB"/>
<text x="400" y="120" text-anchor="middle" font-family="Georgia, serif" font-size="32" font-weight="bold" fill="#333333">Capitec</text>
<text x="400" y="165" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#333333">Sign in to Internet Banking</text>
<rect x="250" y="200" width="300" height="42" rx="6" fill="#E3E4DA"/>
<rect x="250" y="256" width="300" height="42" rx="6" fill="#E3E4DA"/>
<rect x="250" y="318" width="300" height="46" rx="6" fill="#3D6B35"/>
<text x="400" y="347" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#FFFFFF">Sign in</text>
<text x="400" y="415" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" fill="#777777">Never share your PIN with anyone</text>
</svg>`),
    timestamp: at(10, "15:56"),
    device: "Dad's laptop",
    ocrText:
      "Capitec Bank. Sign in to Internet Banking. Username. Password. Remember my details on this computer. Safety notice: Capitec will never ask you to share your PIN, password or OTP over the phone or by email. Never share your PIN with anyone. Need help? Call client care on 0860 10 20 43 or visit your nearest branch.",
  },
  {
    id: "demo-10",
    screenshotUrl: svg(`<svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
<rect width="800" height="500" fill="#FFFFFF"/>
<rect width="800" height="36" fill="#EDEEE6"/>
<circle cx="22" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="42" cy="18" r="6" fill="#C9CCBB"/>
<circle cx="62" cy="18" r="6" fill="#C9CCBB"/>
<text x="400" y="115" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-weight="bold" fill="#333333">St Andrews Parish Newsletter</text>
<rect x="330" y="135" width="140" height="5" fill="#3D6B35"/>
<text x="400" y="185" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="#333333">Sunday services 08:30 and 10:00</text>
<rect x="150" y="225" width="500" height="13" rx="6" fill="#E3E4DA"/>
<rect x="150" y="252" width="460" height="13" rx="6" fill="#E3E4DA"/>
<rect x="150" y="279" width="480" height="13" rx="6" fill="#E3E4DA"/>
<rect x="150" y="306" width="420" height="13" rx="6" fill="#E3E4DA"/>
<text x="400" y="380" text-anchor="middle" font-family="Georgia, serif" font-size="19" fill="#333333">Recipe of the month: Oumas melktert</text>
</svg>`),
    timestamp: at(13, "12:03"),
    device: "Mom's PC",
    ocrText:
      "St Andrews Parish Newsletter, July edition. Sunday services at 08:30 and 10:00, all welcome. The ladies guild bake sale raised R1,840 for the soup kitchen - thank you to every helper. Choir practice moves to Wednesday evenings at 18:00. Recipe of the month: Oumas melktert with cinnamon sugar, a family favourite for generations. Tea and koeksisters served after the morning service.",
  },
];
