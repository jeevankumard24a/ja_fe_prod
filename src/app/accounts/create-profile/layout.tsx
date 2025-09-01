import { headers } from "next/headers";
import Providers from "@/providers/react_query";
import { RequestIdProvider } from "@/utils/request-id-context";
import NavChrome from "@/components/auth/sidebar1";

export default async  function Home_Layout({ children }: { children: React.ReactNode }) {
    // ✅ Server component – no "use client", no useState/usePathname here
    const h = await headers(); // not async in RSC
    const requestId = h.get("x-request-id") ?? "no-request-id";

    console.log("Server Side Registerrrrr",requestId);


    const baseImageUrl =
        process.env.NEXT_PUBLIC_IMAGE_URL ||
        "https://s3.ap-south-1.amazonaws.com/com.pa.images.1";

    const baseDomainUrl =
        process.env.NEXT_PUBLIC_DOMAIN_BASE_URL || "https://jalgo.shop";

    return (
        <div className="bg-white min-h-screen">
            <NavChrome baseImageUrl={baseImageUrl} baseDomainUrl={baseDomainUrl} />

            {/* Main Content Area (aligned with the sidebar width) */}
            <div className="lg:pl-[160px] min-h-screen">
                <main className="h-full w-full">
                    <RequestIdProvider requestId={requestId}>
                        <Providers>{children}</Providers>
                    </RequestIdProvider>
                </main>
            </div>
        </div>
    );
}
