"use client";

import { useEffect, useState } from "react";

function formatWithSuffix(date: Date): string {
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
}

export default function TodayDate() {
  const [today, setToday] = useState("");

  useEffect(() => {
    const now = new Date();
    setToday(formatWithSuffix(now));
  }, []);

  return <span className="text-gray-600 px-2">{today || "..."}</span>;
}
