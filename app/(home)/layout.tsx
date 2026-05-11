import Footer from "@/components/frontend/footer";
import SiteHeader from "@/components/frontend/site-header";
import { authOptions } from "@/config/auth";
import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import { PremiumProvider } from "@/components/providers/premium-provider";
import ClientModals from "@/components/modals/ClientModals";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const isSubscribed = session?.user?.subscriptionStatus === "active" || false;

  return (
    <div className="bg-[#0a0a0b] text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-200">
      <PremiumProvider>
        {/* Lazy‑loaded Client Modals – JS loaded only when needed */}
        <ClientModals isSubscribed={isSubscribed} />

        {/* ANNOUNCEMENT BANNER */}
        <div className="sticky top-0 z-[60] w-full h-12 flex items-center border-b border-[#2860c0] bg-[#3370D1] overflow-hidden">
          <div className="relative flex w-full overflow-hidden">
            <div className="animate-marquee flex items-center whitespace-nowrap">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-12 px-6">
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.15em]">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-200" />
                      <span className="font-semibold text-white">
                        Strictly RUO:
                      </span>
                      <span className="text-white">Research Use Only</span>
                    </span>
                    <span className="text-blue-200/40">|</span>
                    <span className="text-white">
                      Not for Human Consumption
                    </span>
                    <span className="text-blue-200/40">|</span>
                    <span className="text-white">No Therapeutic Use</span>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.15em]">
                    <span className="font-medium text-white">Logistics:</span>
                    <span className="text-white">USPS 2–3 Day Dispatch</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                    <span className="font-semibold text-white">
                      Complimentary Shipping Over $200
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GRAIN OVERLAY – static texture (no SVG filter) */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAMqADAAQAAAABAAAAMgAAAABGvApFAAAE+klEQVRoBdVafWwURRQfW7oCpYWWFgsUKIJSlBo/Kooo4F9i/EJjiAE/4h8kJsaYiCEaDUSNxi8UjSIqBPwDFNDYGhQFooKioCJV/P7QKKC0UAptC+2+mdmer+3e3e7e3d3b2++XbF7ndjPz5r03b2bevHkLcBBCVH0/6N8zVns4Cpn1dTBqhL0EoyrDmkQEsMFIqP4R7fHkoVHX5YEVZkxYqRlOGGTocRshhmKwnRIPB2VBB0JRTBgxfIJlT5h8B8MwGmSBB7BAqBgUE2LJmClBDhkkmGAAkMP88yT8RFU3RgCZBf6CQGPR/v2m1mfRBQpNm4oFDYPj3Dntdu7zI2nU8zKsZGGjJKH1IOgVhQH5eLy3RZxYBgFip47FKqUcijT7Kc0aBNcZgjZq0JbWqA+F83RMj4ZIC4wI7qgBNgIV0BLZB6bBLWTHSUPldRTzGeOGGRvWW44yJAPMAVsBSfDjpPeHPnAhSSC0j0BOFfgnmOcYCBTA4a44BHGZHIvFzIEFw5Jk3FqIV4rCaGhDG03A5iU3BAE0mLcIypNDo5Bt+ARHR1gaAYGLqJ8TEUcREg0YcEIsZqw5I88T0xkKbQB0v8RqURa8AOvDOdR+xYFhIpppOYKY/8JLyqKQBcg8lG4nPiyBDOpVbI+B5AEEBKy3FASibI8gAjhWJj1CtAoS06BfHHmkEFZRIhykBNJWE8HTRgRZ69w4JoW9oMBY+MRhyLRfUAQQ+Bm3ojCuF3QIFAjpKDZBjOFAlpD1mCn6YiX4N7SoDx1gHswHcZhnsMkX+C3qTlzYz9K7LUX0IUXrAmgN1gvZ8EFchCQ9RjLhAECB2B3ksy/me/Fg9cKHYTJRFLENg4UyHARmEUhry5adNEU2v6b6lubC2R3h8CaBQwGX1bJaYYC7BQh7N5tMnaGBBIdwqwFQMK9BaMggCO0cFZJWFEVIaTLqKEElNJU2AFozGC3aYKgDUwyMygM+FmQHdjiEDMqK1KIIW2x8wIhQ1JdFhYzJEBAJSoAAnQpJkHAzQFKx5cQBBIlEOCQJTNaEBRQfIP8BIsAq6R1KBTGjxC4mKBRTgPAHYHEQOQAiFBrF06FBhnB7eHKGQ5TMnM88MqqcP8P4ZqPuG0yd+9A+hv87g6HrJ5YIZBYso/Vt4F+SZ6DW/6BslMfjA0fylO1hdPKGZIEciJ/iMuyh3nAvQrS8hbEeSQNTEIXsRqneHCEDFADiYHlSK+QcENbXGoNyX2oO4DU4nO0YHj6ESaP6NYegHczYFAWvANiugWEOAj+E6ALWg/RhspxYx8J9oRZ6a7MQ8m8aXQRdC+tO0DbUE+lnjrgxKQmDXaDKeh3uKMC81BeDnqNQFmK5Ihs1IKwYmHPfo+iPW50XCezVGYIhfgBhyT01BFUJIM4A2MnaAzAATU2hj8TndM7PYHaqeWqgCddNOoW2MR7uLvRuIWMoFEvYH/2byYMakDhTGG8AVt+bZB1gW7UEiRCf5dECI1opdm6FifCgsUJWUCtCMDGkP07v2P0/wCV9mBcHAGkAAAAASUVORK5CYII=)",
            backgroundSize: "200px 200px",
          }}
        />

        {/* Rest of decorative elements unchanged */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[10]"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 right-0 top-0 z-[9998] h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(52,211,153,0.5) 30%, rgba(99,102,241,0.5) 70%, transparent 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-600/5 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-1/2 top-[40%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-900/10 blur-[140px]"
        />

        <div className="relative flex min-h-screen flex-col">
          <SiteHeader session={session} />
          <main className="flex-1 w-full flex flex-col min-h-[70vh] transition-all duration-700 ease-in-out">
            {children}
          </main>
          <Footer />
        </div>
      </PremiumProvider>
    </div>
  );
}