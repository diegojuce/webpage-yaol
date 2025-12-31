//small header with black background and few tabs
import Link from "next/link";

export async function Header() {


    return(

        <div className="top-0 bg-black flex flex-row gap-2 px-10 p-2 items-center "> 
        <div className="flex flex-row gap-3">
        <Link href="" className="text-white text-xs hover:underline">Auto</Link>
        <Link href="" className="text-white text-xs hover:underline">Camion</Link>
        <Link href="" className="text-white text-xs hover:underline">Flotillas</Link>
        </div>
        <div className="ml-auto flex flex-row gap-2">
            <h1 className="text-xs border-r border-r-white pr-2">MX</h1>
            <Link href="" className="text-white text-xs hover:underline">312 222 0099</Link>
        </div>
 
        </div>
    )
}