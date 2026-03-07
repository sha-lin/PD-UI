"use client";

import Link from "next/link";

export default function CallToActionSection() {
    return (
        <section className="pb-32 md:pb-44 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 text-sm">
            <div className="flex flex-col-reverse gap-10 md:flex-row px-4 md:px-16 lg:px-24 xl:px-32 pt-12 md:pt-32">
                <div className="max-md:text-center flex-1">
                    <h2 className="text-4xl md:text-5xl/tight font-semibold text-slate-900">
                        Built to Be Noticed. Printed to Last
                    </h2>

                    <p className="text-sm md:text-base max-w-md mt-6 max-md:px-2 text-slate-600">
                        Your brand has a story. We put it on paper, on products, and into the hands of the people who need to see it — with the craft and attention it deserves.
                    </p>

                    <div className="flex items-center gap-4 mt-6 max-md:justify-center">
                        <Link
                            href="mailto:query@printduka.co.ke"
                            className="px-8 py-3 text-white bg-brand-blue hover:bg-brand-blue/90 transition rounded-full font-medium"
                        >
                            Get Quote
                        </Link>
                    </div>
                </div>

                <div className="w-full md:max-w-xs lg:max-w-lg">
                    <img
                        className="w-full h-auto rounded-2xl"
                        src="/banner/inkwise.jpg"
                        alt="Print Duka printing services"
                    />
                </div>
            </div>
        </section>
    );
}
