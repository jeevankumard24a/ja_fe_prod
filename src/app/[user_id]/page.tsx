// app/[user_id]/page.tsx
import Home_Dashboard from "@/components/dashboard/user_page";
import { redirect } from "next/navigation";
//import { serverRefreshIfNeeded } from "@/lib/server-auth";

export default async function UserHome({
                                           params,
                                       }: {
    params: { user_id: string };
}) {

    const { user_id } = await params

    console.log("kushuuuuuuuuuuuuuuuuuu",user_id)

    // Not signed in even after refresh → send to login and come back to this profile
   // if (!session) {
     //   const next = `/${encodeURIComponent(user_id)}`;
     //   redirect(`/accounts/login?next=${next}`);
    //}

    // Signed in → render the page
    return (
        <div className="h-full flex flex-col overflow-y-auto">
            <Home_Dashboard user_id={user_id} />
        </div>
    );
}
