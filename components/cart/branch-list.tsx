"use client";

import { CheckIcon, MapPinIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { BranchOption } from "./branches";

type BranchListProps = {
  branches: BranchOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
  scroll?: boolean;
};

type BranchCardProps = {
  branch: BranchOption;
  selected: boolean;
  compact?: boolean;
  onClick: () => void;
};

function BranchCard({ branch, selected, compact = false, onClick }: BranchCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "relative w-full rounded-xl border text-left text-white transition",
        compact ? "p-3" : "p-4",
        selected
          ? "border-yellow-400 bg-yellow-400/10"
          : "border-white/10 bg-[#121214] hover:border-white/25"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={clsx(
            "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] border transition",
            selected
              ? "border-yellow-400 bg-yellow-400 text-black"
              : "border-white/10 bg-white/5 text-yellow-300"
          )}
        >
          <MapPinIcon className="h-[18px] w-[18px]" />
        </div>

        <div className="min-w-0 flex-1">
          <h4
            className={clsx(
              "m-0 text-[13px] font-extrabold uppercase tracking-[0.04em]",
              selected ? "text-yellow-300" : "text-white"
            )}
          >
            {branch.name}
          </h4>
          <p className="mt-1 text-xs leading-[1.4] text-neutral-400">
            {branch.address}
          </p>
          {!compact ? (
            <p className="mt-1 text-[11px] text-neutral-500">
              {branch.hours} · {branch.phone}
            </p>
          ) : null}
        </div>

        {selected ? (
          <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-yellow-400 text-black">
            <CheckIcon className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>
    </button>
  );
}

export default function BranchList({
  branches,
  selectedId,
  onSelect,
  compact = false,
  scroll = true,
}: BranchListProps) {
  return (
    <div
      className={clsx(
        "flex h-full flex-col gap-2",
        scroll ? "overflow-y-auto pr-1" : "overflow-visible"
      )}
    >
      {branches.map((branch) => (
        <BranchCard
          key={branch.id}
          branch={branch}
          selected={selectedId === branch.id}
          onClick={() => onSelect(branch.id)}
          compact={compact}
        />
      ))}
    </div>
  );
}
