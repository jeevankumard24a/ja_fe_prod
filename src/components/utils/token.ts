// utils/token.ts

export async function getRefreshToken(
  accessToken: string,
  refreshToken: string,
) {
  try {
    const Api_Base_Url = process.env.NEXT_PUBLIC_API_BASE_URL; // e.g. "https://your-api.com"

    const response = await fetch(`${Api_Base_Url}/ipa/v1/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Pass access token
        "x-refresh-token": refreshToken, // Pass refresh token
      },
    });

    // If the external API returns an error status code, handle that:
    if (!response.ok) {
      throw new Error(
        `Refresh token request failed with status ${response.status}`,
      );
    }

    // Assuming the response is JSON that includes a new access token
    // e.g. { newAccessToken: "...", ... }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}
