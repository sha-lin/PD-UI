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
import LogoCloud from "@/components/ui/logo-cloud";
import FeaturesSection from "@/components/ui/features-section";
import HoverSliderSection from "@/components/ui/hover-slider-section";
import ContactCTASection from "@/components/ui/contact-cta-section";
import FooterSection from "@/components/ui/footer-section";
import CallToActionSection from "@/components/ui/call-to-action-section";

const services = [
  {
    title: "Signage & Banners",
    description: "Large format banners, posters & signage",
    image: "/banner/banner.jpg",
  },
  {
    title: "Clothing",
    description: "Branded apparel & custom garments",
    image: "/banner/clothing.png",
  },
  {
    title: "Marketing Material",
    description: "Brochures, flyers & promotional print",
    image: "/banner/marketing.jpg",
  },
  {
    title: "Office & Stationery",
    description: "Business essentials & promotional products",
    image: "/banner/stationary.jpg",
  },
];

const navigation = [
  { name: "Services", href: "#services" },
  { name: "Contact", href: "/contact" },
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
                src="/logo/logo.png"
                alt="Print Duka"
                width={240}
                height={108}
                className="h-16 w-auto"
                priority
              />
            </Link>

            <nav className="hidden lg:flex items-center justify-end gap-2 w-full">
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
                      src="/logo/logo.png"
                      alt="Print Duka"
                      width={360}
                      height={108}
                      className="h-24 w-auto"
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
              <span className="bg-gradient-to-r from-[#093756] via-[#093756]/80 to-[#093756] bg-clip-text text-transparent">
                We Build{" "}
              </span>
              <span className="text-brand-yellow">Brands</span>
              <br />
              <span className="text-foreground">Through Print.</span>
            </motion.h1>
            <motion.p
              className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              We are a printing & design company with a passion for bringing ideas to life on paper.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
            >
              <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-blue/90 text-white px-8 rounded-full shadow-lg hover:shadow-xl transition-all">
                <Link href="/login">Get Quote</Link>
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
            className="group relative rounded-3xl min-h-[250px] sm:min-h-[300px] w-full overflow-hidden transition-all duration-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={service.image}
              alt={service.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <h2 className="absolute bottom-4 left-0 right-0 text-center text-2xl sm:text-3xl font-bold text-white px-4">
              {service.title}
            </h2>
          </motion.div>
        ))}
      </div>

      {/* Logo Cloud */}
      <LogoCloud />

      {/* Features Section */}
      <FeaturesSection />

      {/* Hover Slider Section */}
      <HoverSliderSection />

      {/* Call to Action Section */}
      <CallToActionSection />

      {/* Contact CTA */}
      <ContactCTASection />

      {/* Footer */}
      <FooterSection />
    </div>
  );
}

