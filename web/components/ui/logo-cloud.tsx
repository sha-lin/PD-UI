export default function LogoCloud() {
    const logos = [
        {
            name: "Safaricom",
            url: "/logo/SAF-MAIN-LOGO.png",
            width: 180,
            height: 120,
        },
        {
            name: "Hotpoint",
            url: "/logo/hotpoint.png",
            width: 100,
            height: 40,
        },
        {
            name: "Asshut",
            url: "/logo/asshut.png",
            width: 100,
            height: 40,
        },
        {
            name: "IM",
            url: "/logo/im.png",
            width: 90,
            height: 40,
        },
        {
            name: "JTL",
            url: "/logo/jtl.png",
            width: 100,
            height: 40,
        },
        {
            name: "Njoodada",
            url: "/logo/njoodada.jpg",
            width: 100,
            height: 40,
        },
        {
            name: "Tumaini Innovation Center",
            url: "/logo/tumaini-innovation-center.png",
            width: 110,
            height: 40,
        },
        {
            name: "Victorial",
            url: "/logo/victorial.png",
            width: 100,
            height: 40,
        },
        {
            name: "European Union",
            url: "/logo/Flag-European-Union.webp",
            width: 80,
            height: 40,
        },
    ];

    return (
        <section className="bg-background py-16">
            <div className="mx-auto max-w-5xl px-6">
                <h2 className="text-center text-lg font-medium text-foreground">
                    Trusted by leading brands across the world
                </h2>
                <div className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-12">
                    {logos.map((logo) => (
                        <div
                            key={logo.name}
                            className="flex items-center justify-center transition-opacity duration-300"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={logo.url}
                                alt={logo.name}
                                width={logo.width}
                                height={logo.height}
                                className={logo.name === "Safaricom" ? "h-24 w-auto object-contain" : "h-10 w-auto object-contain"}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
