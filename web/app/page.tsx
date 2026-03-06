"use client";

import { ArrowUpRight, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { checkSession } from "@/lib/api/auth";

const services = [
  {
    title: "Business Cards",
    description: "Premium quality, fast turnaround",
    image: "https://static.vecteezy.com/system/resources/previews/047/920/967/large_2x/formal-shoes-isolated-on-a-transparent-background-free-png.png",
    href: "/login",
  },
  {
    title: "Brochures & Flyers",
    description: "Full-colour offset & digital",
    image: "https://static.vecteezy.com/system/resources/previews/035/500/119/non_2x/ai-generated-3d-succulent-plant-isolated-on-transparent-background-free-png.png",
    href: "/login",
  },
  {
    title: "Large Format",
    description: "Banners, posters & signage",
    image: "https://static.vecteezy.com/system/resources/previews/047/920/967/large_2x/formal-shoes-isolated-on-a-transparent-background-free-png.png",
    href: "/login",
  },
  {
    title: "Branded Merch",
    description: "T-shirts, caps, notebooks & more",
    image: "https://static.vecteezy.com/system/resources/previews/035/500/119/non_2x/ai-generated-3d-succulent-plant-isolated-on-transparent-background-free-png.png",
    href: "/login",
  },
];

const navigation = [
  { name: "Services", href: "#services" },
  { name: "About", href: "#about" },
  { name: "Blog", href: "#blog" },
  { name: "Contact", href: "#contact" },
];

import type { PortalRole } from "@/types/auth";

const PORTAL_ROLE_LABELS: Record<PortalRole, string> = {
  admin: "Admin Portal",
  account_manager: "Account Manager Portal",
  production_team: "Staff Portal",
  client: "Client Portal",
  vendor: "Vendor Portal",
};

const ROLE_DASHBOARD: Record<PortalRole, string> = {
  client: "/portal",
  admin: "/admin/dashboard",
  account_manager: "/account-manager",
  production_team: "/production/dashboard",
  vendor: "/vendors",
};

export default function Home() {
  const { data: session } = useQuery({
    queryKey: ["home-session"],
    queryFn: checkSession,
    staleTime: 60_000,
    retry: false,
  });

  const portalLabel: string =
    session?.authenticated && session.user?.portal_role
      ? PORTAL_ROLE_LABELS[session.user.portal_role]
      : "Sign In";

  const portalHref: string =
    session?.authenticated && session.user?.portal_role
      ? ROLE_DASHBOARD[session.user.portal_role]
      : "/login";
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
                    <Link href={portalHref}>
                      {portalLabel}
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
              <Link href={portalHref}>
                <span className="pl-4 py-2 text-sm font-medium">{portalLabel}</span>
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
              <span className="bg-gradient-to-r from-[#093756] via-[#093756]/80 to-[#F6B619] bg-clip-text text-transparent">
                We Build Brands
              </span>
              <br />
              <span className="text-foreground">Through Print.</span>
            </motion.h1>
            <motion.p
              className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              Premium print solutions for businesses across Kenya — from business cards
              to large-format signage, delivered on time, every time.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
            >
              <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-blue/90 text-white px-8 rounded-full shadow-lg hover:shadow-xl transition-all">
                <Link href="/login">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                <Link href="#services">View Services</Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Services grid */}
      <div id="services" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mt-12 pb-16">
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            className="group relative bg-muted/50 backdrop-blur-sm rounded-3xl p-4 sm:p-6 min-h-[250px] sm:min-h-[300px] w-full overflow-hidden transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
          >
            <Link href={service.href} className="absolute inset-0 z-20">
              <h2 className="text-center text-2xl sm:text-3xl font-bold relative z-10 text-brand-blue my-2 sm:my-4 group-hover:text-brand-blue/80 transition-colors duration-300">
                {service.title}
              </h2>
              <p className="text-center text-xs text-muted-foreground relative z-10 px-2">{service.description}</p>
              <div className="absolute inset-0 flex items-center justify-center p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full max-w-[140px] h-auto object-contain opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-background/95 backdrop-blur-sm rounded-tl-xl flex items-center justify-center z-10 border-l border-t border-border/50">
                <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-10 h-10 md:w-12 md:h-12 bg-secondary rounded-full flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

