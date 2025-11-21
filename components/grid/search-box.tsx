"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SearchBox() {
  const router = useRouter();
  const [parts, setParts] = useState({ alto: "", ancho: "", rin: "" });
  const _searchParams = useSearchParams();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formatted = `${parts.alto}/${parts.ancho} R${parts.rin}`.trim();

    if (!parts.alto || !parts.ancho || !parts.rin) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(formatted)}`);
  };
  return (
    <div className="flex flex-col md:w-2/3 rounded-2xl border border-neutral-200 bg-neutral-50 py-5 mt-5  px-5 md:px-4 md:mt-0 gap-4 ">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-row gap-4 mb-5">
          <button className="bg-yellow-500 text-black rounded w-25 py-1 text-sm hover:bg-yellow-500">
            Por Medida
          </button>
          <button className=" border border-yellow-500 rounded text-yellow-500 w-25 py-1 text-sm hover:bg-yellow-500">
            Por Auto
          </button>
        </div>
        <div className="flex flex-col md:flex-row ">
          <div className="flex flex-row gap-5">
            <input
              name="alto"
              value={parts.alto}
              onChange={(e) => setParts({ ...parts, alto: e.target.value })}
              className="text-sm h-10 p-3 w-full text-black placeholder:text-black bg-white"
              placeholder="Alto"
            />
            <input
              name="ancho"
              value={parts.ancho}
              onChange={(e) => setParts({ ...parts, ancho: e.target.value })}
              className="text-sm h-10 p-3 w-full text-black placeholder:text-black bg-white"
              placeholder="Ancho"
            />
            <input
              name="rin"
              value={parts.rin}
              onChange={(e) => setParts({ ...parts, rin: e.target.value })}
              className="text-sm h-10 p-3 w-full text-black placeholder:text-black bg-white"
              placeholder="Rin"
            />
          </div>
          <button className="rounded bg-yellow-500 mt-5 md:mt-0 md:mx-5 w-full h-10 hover:bg-white hover:text-black">
            Buscar
          </button>
        </div>
      </form>
    </div>
  );
}
