export const CustomResizeHandle = ({
  direction,
}: {
  direction: "horizontal" | "vertical";
}) => {
  const isHorizontal = direction === "horizontal";

  return (
    <div
      className={`relative flex ${
        isHorizontal ? "w-full h-[1px]" : "w-[1px] h-full"
      } bg-gray-300`}
    >
      <button
        className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-sky-300 hover:bg-sky-600"
        aria-label="Resize"
      />
    </div>
  );
};

export const CustomResizeHandle1 = ({
  direction,
}: {
  direction: "horizontal" | "vertical";
}) => {
  const isHorizontal = direction === "horizontal";

  return (
    <div
      className={`relative ${
        isHorizontal ? "w-full h-[1px]" : "w-[1px] h-full"
      } bg-gray-300`}
    >
      <button
        className={`absolute ${
          isHorizontal
            ? "top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
            : "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
        } w-3 h-3 rounded-full bg-sky-200 hover:bg-sky-600`}
        aria-label="Resize"
      />
    </div>
  );
};
