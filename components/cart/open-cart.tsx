import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function OpenCart({
  className,
  quantity,
  isWhite = false,
}: {
  className?: string;
  quantity?: number;
  isWhite?: boolean;
}) {
  const baseClasses =
    "relative flex h-11 w-11 items-center justify-center rounded-md border-2 transition-colors";
  const iconClasses =
    "h-6 transition-all ease-in-out hover:scale-110";

  return (
    <div
      className={clsx(
        baseClasses,
        isWhite ? "border-white text-black" : "border-black text-white"
      )}
    >
      <ShoppingCartIcon
        className={clsx(
          iconClasses,
          isWhite ? "text-white" : "text-black",
          className
        )}
      />

      {quantity ? (
        <div className="absolute right-0 top-0 -mr-2 -mt-2 h-4 w-4 rounded-sm bg-yellow-500 text-[11px] font-medium text-white">
          {quantity}
        </div>
      ) : null}
    </div>
  );
}
