

import Home_Dashboard from "@/components/dashboard/user_page";

import { redirect } from "next/navigation";
import { serverRefreshIfNeeded } from "@/lib/server-auth";


export default async function user_home({
    params
                                  }:{ params: Promise<{ user_id: string }>}){

    const { user_id } = await params

    return(
        <div className={`h-full flex flex-col overflow-y-auto`}>
            <Home_Dashboard user_id={user_id} />


        </div>
    )

}