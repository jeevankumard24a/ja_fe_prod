// import { Register_Type } from "@/types/auth/register_type";
// import { make_api_request } from "@/components/utils/make_api_req";
// import { Login_Type } from "@/types/auth/login_type";
//
// export const Check_User_Name_Uniqueness = async (
//   v_user_id: string,
// ): Promise<any> => {
//   return make_api_request(`/api/auth/register/check-userid-unique/`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ user_id: v_user_id }),
//   });
// };
//
// export const submitRegistertData = async (
//   register_data: Register_Type,
// ): Promise<any> => {
//   return make_api_request(`/api/auth/register/create`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(register_data),
//   });
// };
//
// export const submitLoginData = async (login_data: Login_Type): Promise<any> => {
//   return make_api_request("/api/auth/login/create", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(login_data),
//   });
// };
//
// export const submitChangePassword = async (cp_data: {
//   current_password: string;
//   new_password: string;
// }): Promise<any> => {
//   return make_api_request("/api/auth/change_password", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(cp_data),
//   });
// };
//
// export const submitLogoutData = async (): Promise<any> => {
//   return make_api_request("/api/auth/logout", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({}),
//   });
// };
