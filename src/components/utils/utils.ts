import { make_api_request } from "@/components/utils/make_api_req";

export const get_cat_nm_by_search_id = async (
  search_term: string | undefined,
): Promise<any> => {
  console.log("JJJJJJJJJJJJ", JSON.stringify(search_term));
  return make_api_request(`/api/utils/icons_status/${search_term}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
