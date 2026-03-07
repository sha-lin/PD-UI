"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Menu, Palette, Sparkles, Lightbulb, Zap } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import FooterSection from "@/components/ui/footer-section";

const navigation = [
    { name: "Services", href: "/#services" },
    { name: "About", href: "/#about" },
    { name: "Contact", href: "/contact" },
];

export default function CreativeDukaPage() {
    const services = [
        {
            icon: Palette,
            title: "Custom Design",
            description: "Bespoke designs tailored to your brand identity and vision.",
        },
        {
            icon: Sparkles,
            title: "Creative Concepts",
            description: "Innovative ideas that make your brand stand out from the crowd.",
        },
        {
            icon: Lightbulb,
            title: "Brand Strategy",
            description: "Strategic thinking to position your brand for maximum impact.",
        },
        {
            icon: Zap,
            title: "Rapid Turnaround",
            description: "Fast delivery without compromising on quality or creativity.",
        },
    ];

    return (
        <div className="w-full relative container px-2 mx-auto max-w-7xl min-h-screen">
            <div className="mt-6 bg-accent/50 rounded-2xl relative">
                {/* Header */}
                <header className="flex items-center">
                    <div className="w-full md:w-2/3 lg:w-1/2 bg-background/95 backdrop-blur-sm p-4 rounded-br-2xl flex items-center gap-4">
                        <Link href="/" className="flex items-center shrink-0">
                            <Image
                                src="/logo/pd.png"
                                alt="Print Duka"
                                width={120}
                                height={36}
                                className="h-8 w-auto"
                                priority
                            />
                        </Link>

                        <nav className="hidden lg:flex items-center justify-between w-full">
                            {navigation.map((item) => (
                                <Button
                                    key={item.name}
                                    variant="link"
                                    asChild
                                    className="cursor-pointer hover:text-primary transition-colors"
                                >
                                    <Link href={item.href}>{item.name}</Link>
                                </Button>
                            ))}
                        </nav>

                        {/* Mobile menu */}
                        <Sheet>
                            <SheetTrigger asChild className="lg:hidden ml-auto">
                                <Button variant="ghost" size="icon" className="hover:text-primary transition-colors">
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="w-[300px] sm:w-[400px] p-0 bg-background/95 backdrop-blur-md border-r border-border/50"
                            >
                                <SheetHeader className="p-6 text-left border-b border-border/50">
                                    <SheetTitle>
                                        <Image
                                            src="/logo/pd.png"
                                            alt="Print Duka"
                                            width={120}
                                            height={36}
                                            className="h-8 w-auto"
                                        />
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col p-6 space-y-1">
                                    {navigation.map((item) => (
                                        <Button
                                            key={item.name}
                                            variant="ghost"
                                            asChild
                                            className="justify-start px-2 h-12 text-base font-medium hover:bg-accent/50 hover:text-primary transition-colors"
                                        >
                                            <Link href={item.href}>{item.name}</Link>
                                        </Button>
                                    ))}
                                </nav>
                                <Separator className="mx-6" />
                                <div className="p-6">
                                    <Button asChild className="w-full h-12 bg-brand-blue hover:bg-brand-blue/90 transition-all duration-300 shadow-lg">
                                        <Link href="/login">
                                            Get Quote
                                            <ArrowUpRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex w-1/2 justify-end items-center pr-4 gap-4 ml-auto">
                        <Button
                            asChild
                            variant="secondary"
                            className="cursor-pointer bg-brand-blue text-white p-0 rounded-full shadow-lg hover:shadow-xl hover:bg-brand-blue/90 transition-all duration-300 group"
                        >
                            <Link href="/login">
                                <span className="pl-4 py-2 text-sm font-medium">Get Quote</span>
                                <div className="rounded-full flex items-center justify-center m-auto bg-white w-10 h-10 ml-2 group-hover:scale-110 transition-transform duration-300">
                                    <ArrowUpRight className="w-5 h-5 text-brand-blue" />
                                </div>
                            </Link>
                        </Button>
                    </div>
                </header>

                {/* Hero section */}
                <motion.section
                    className="w-full px-4 py-24"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <div className="mx-auto text-center">
                        <motion.h1
                            className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        >
                            <span className="bg-gradient-to-r from-[#F6B619] via-[#F6B619]/80 to-[#093756] bg-clip-text text-transparent">
                                Creative Duka
                            </span>
                            <br />
                            <span className="text-foreground">Design That Delivers.</span>
                        </motion.h1>
                        <motion.p
                            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                        >
                            Where imagination meets execution. Our creative studio transforms ideas into print masterpieces that elevate your brand.
                        </motion.p>
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
                        >
                            <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-blue/90 text-white px-8 rounded-full shadow-lg hover:shadow-xl transition-all">
                                <Link href="/login">Request Quote</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                                <Link href="mailto:query@printduka.co.ke">Contact Us</Link>
                            </Button>
                        </motion.div>
                    </div>
                </motion.section>
            </div>

            {/* Services Grid */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {services.map((service, index) => (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="bg-brand-blue/10 p-3 rounded-xl">
                                        <service.icon className="w-6 h-6 text-brand-blue" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                            {service.title}
                                        </h3>
                                        <p className="text-slate-600">{service.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What We Do Section */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            What We Create
                        </h2>
                        <p className="text-lg text-slate-600">
                            From concept to completion, we handle every aspect of your print project.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            "Logo Design",
                            "Brand Identity",
                            "Marketing Collateral",
                            "Packaging Design",
                            "Large Format Graphics",
                            "Custom Illustrations",
                            "Social Media Graphics",
                            "Event Materials",
                            "Product Photography",
                        ].map((item, index) => (
                            <motion.div
                                key={item}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                className="bg-gradient-to-br from-brand-blue/5 to-brand-yellow/5 rounded-xl p-6 text-center hover:shadow-md transition-shadow"
                            >
                                <p className="font-medium text-slate-800">{item}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-brand-blue to-brand-blue/80 text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to Bring Your Vision to Life?
                        </h2>
                        <p className="text-xl mb-8 text-white/90">
                            Let's collaborate on your next creative project. Get in touch today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="bg-brand-yellow hover:bg-brand-yellow/90 text-slate-900 rounded-full px-8">
                                <Link href="/login">Request Quote</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="rounded-full px-8 border-white text-white hover:bg-white/10">
                                <Link href="mailto:query@printduka.co.ke">Contact Us</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <FooterSection />
        </div>
    );
}
