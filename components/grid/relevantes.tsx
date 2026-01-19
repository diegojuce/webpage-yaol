import Image from "next/image";
import Link from "next/link";

export async function Relevantes(){

    return(

        <section className="bg-white flex justify-center w-full">
            <div className="my-20 mx-5 md:mx-15 grid grid-cols-2 md:grid-cols-4 grid-rows-3 gap-4 w-full">
                
                <div>
                <div className="group h-50 md:h-70 w-full bg-black overflow-hidden relative">
                    <Image
                        src="/fotos/IMG_0105.jpg"
                        alt="Tecnico Yantissimo"
                        fill
                        sizes="(min-width: 768px) 25vw, 50vw"
                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                        <h2 className="text-xl md:text-2xl font-bold italic">Compra en línea</h2>
                        <p className="mt-2 text-xs md:text-sm max-w-xs">Y reserva tu cita en cuestión de segundos</p>
                        <button className="mt-4 flex items-center gap-2 text-xs md:text-sm font-semibold">
                            Conocer más
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black transition-transform duration-400 ease-in-out group-hover:translate-x-2"> → </span>
                        </button>
                    </div>
                </div>
                </div>

                <div>
                <Link href="/ubicaciones">
                <div className="group h-50 md:h-70 w-full bg-black overflow-hidden relative">
                <Image
                    src="/fotos/IMG_0123.jpg"
                    alt="Tecnico Yantissimo"
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                        <h2 className="text-xl md:text-2xl font-bold italic">Cerca de ti</h2>
                        <p className="mt-2 text-xs md:text-sm max-w-xs">Encuentranos en nuestras sucursales</p>
                        <button className="mt-4 flex items-center gap-2 text-xs md:text-sm font-semibold">
                            Conocer más
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black transition-transform duration-400 ease-in-out group-hover:translate-x-2"> → </span>
                        </button>
                    </div>
                </div>
                </Link>
                </div>
                <div className="col-span-2 row-span-2 overflow-hidden relative">
                <Link href="/contacto">   
                <div className="group relative h-full w-full bg-black">
                <Image
                    src="/fotos/IMG_0138.jpg"
                    alt="Tecnico Yantissimo"
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                        <h2 className="text-xl md:text-2xl font-bold italic">Atención Profesional</h2>
                        <p className="mt-2 text-xs md:text-sm max-w-xs">Contacta a uno de nuestros expertos en llantas</p>
                        <button className="mt-4 flex items-center gap-2 text-xs md:text-sm font-semibold">
                            Conocer más
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black transition-transform duration-400 ease-in-out group-hover:translate-x-2"> → </span>
                        </button>
                    </div>
                </div>
                </Link> 
                </div>
                <div className="col-span-2">
                <div className="group h-50 md:h-70 w-full bg-black overflow-hidden relative">
                <Image
                    src="/fotos/IMG_0144.jpg"
                    alt="Tecnico Yantissimo"
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                        <h2 className="text-xl md:text-2xl font-bold italic">Amplia gama de llantas</h2>
                        <p className="mt-2 text-xs md:text-sm max-w-xs">Descubre nuestros modelos para todo tipo de uso</p>
                        <button className="mt-4 flex items-center gap-2 text-xs md:text-sm font-semibold">
                            Conocer más
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black transition-transform duration-400 ease-in-out group-hover:translate-x-2"> → </span>
                        </button>
                    </div>
                </div>
                </div>
                <div className="col-span-1">
                <div className="group h-50 md:h-70 w-full bg-black overflow-hidden relative">
                <Image
                    src="/fotos/IMG_0276.jpg"
                    alt="Tecnico Yantissimo"
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                        <h2 className="text-xl md:text-2xl font-bold italic">Tecnologia de primera</h2>
                        <p className="mt-2 text-xs md:text-sm max-w-xs">Contamos con la mejor tecnologia para ti</p>
                        <button className="mt-4 flex items-center gap-2 text-xs md:text-sm font-semibold">
                            Conocer más
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black transition-transform duration-400 ease-in-out group-hover:translate-x-2"> → </span>
                        </button>
                    </div>
                </div>
                </div>
                <div className="col-span-1">
                <div className="group h-50 md:h-70 w-full bg-black overflow-hidden relative">
                <Image
                    src="/fotos/IMG_0299.jpg"
                    alt="Tecnico Yantissimo"
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                        <h2 className="text-xl md:text-2xl font-bold italic">Productos</h2>
                        <p className="mt-2 text-xs md:text-sm max-w-xs">Descubre nuestros productos y servicios</p>
                        <button className="mt-4 flex items-center gap-2 text-xs md:text-sm font-semibold">
                            Conocer más
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black transition-transform duration-400 ease-in-out group-hover:translate-x-2"> → </span>
                        </button>
                    </div>
                </div>
                </div>
                <Link href="/nosotros">
                <div className="col-span-1">
                <div className="group h-50 md:h-70 w-full bg-black overflow-hidden relative">
                <Image
                    src="/fotos/IMG_6295.jpg"
                    alt="Tecnico Yantissimo"
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                        <h2 className="text-xl md:text-2xl font-bold italic">Sobre Nosotros</h2>
                        <p className="mt-2 text-xs md:text-sm max-w-xs">Encuentra Reseñas. ¿Por qué somos los mejores?</p>
                        <button className="mt-4 flex items-center gap-2 text-xs md:text-sm font-semibold">
                            Conocer más
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black transition-transform duration-400 ease-in-out group-hover:translate-x-2"> → </span>
                        </button>
                    </div>
                </div>
                </div>
                </Link>
                <div className="col-span-1">
                <div className="group h-50 md:h-70 w-full bg-black overflow-hidden relative">
                <Image
                    src="/fotos/IMG_0350.jpg"
                    alt="Tecnico Yantissimo"
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                        <h2 className="text-xl md:text-2xl font-bold italic">Guia de ayuda</h2>
                        <p className="mt-2 text-xs md:text-sm max-w-xs">Aprende como escoger las llantas indicadas</p>
                        <button className="mt-4 flex items-center gap-2 text-xs md:text-sm font-semibold">
                            Conocer más
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-black transition-transform duration-400 ease-in-out group-hover:translate-x-2"> → </span>
                        </button>
                    </div>
                </div>
                </div>


            </div>
            </section>
    )
}
