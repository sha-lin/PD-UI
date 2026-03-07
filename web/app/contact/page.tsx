"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowUpRight, Menu } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import FooterSection from "@/components/ui/footer-section";
import { useState, FormEvent } from "react";
import { submitContactForm } from "@/services/contact";
import { toast } from "sonner";

const navigation = [
    { name: "Services", href: "/#services" },
    { name: "About", href: "/#about" },
    { name: "Contact", href: "/contact" },
];

export default function ContactPage() {
    const [selectedOption, setSelectedOption] = useState<string>("general");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);

        try {
            await submitContactForm({
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                message: formData.message,
                inquiry_type: selectedOption === "general" ? "General inquiry" : "Product Support",
            });

            toast.success("Thank you for contacting us! We'll get back to you shortly.");

            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                message: "",
            });
            setSelectedOption("general");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                                            src="/logo/logo.png"
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
                                        <a href="mailto:query@printduka.co.ke">
                                            Get Quote
                                            <ArrowUpRight className="w-4 h-4 ml-2" />
                                        </a>
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
                            <a href="mailto:query@printduka.co.ke">
                                <span className="pl-4 py-2 text-sm font-medium">Get Quote</span>
                                <div className="rounded-full flex items-center justify-center m-auto bg-white w-10 h-10 ml-2 group-hover:scale-110 transition-transform duration-300">
                                    <ArrowUpRight className="w-5 h-5 text-brand-blue" />
                                </div>
                            </a>
                        </Button>
                    </div>
                </header>

                {/* Content */}
                <section className="px-4 py-8 lg:py-16">
                    <div className="container mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <p className="mb-4 text-base lg:text-2xl text-brand-blue font-medium">
                                Customer Care
                            </p>
                            <h1 className="mb-4 text-3xl lg:text-5xl font-bold text-slate-900">
                                We&apos;re Here to Help
                            </h1>
                            <p className="mb-10 lg:mb-20 mx-auto max-w-3xl text-lg text-slate-600">
                                Whether it&apos;s a question about our services, a request for
                                technical assistance, or suggestions for improvement, our team is
                                eager to hear from you.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-2 items-start">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="w-full h-full"
                            >
                                <div className="bg-slate-100 rounded-2xl overflow-hidden h-full min-h-[600px]">
                                    <iframe
                                        src="https://www.google.com/maps?q=Parsonic+Business+Centre,+Kweria+Kirinyaga+Rd,+Nairobi,+Kenya&output=embed"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, minHeight: '600px' }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>
                            </motion.div>

                            <motion.form
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                onSubmit={handleSubmit}
                                className="flex flex-col gap-6 w-full"
                            >
                                <div>
                                    <Label className="text-sm font-semibold text-slate-600 mb-3 block text-left">
                                        Select Options for Business Engagement
                                    </Label>
                                    <div className="flex gap-4">
                                        <Button
                                            type="button"
                                            variant={selectedOption === "general" ? "default" : "outline"}
                                            onClick={() => setSelectedOption("general")}
                                            className={selectedOption === "general" ? "bg-brand-blue" : ""}
                                        >
                                            General inquiry
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={selectedOption === "support" ? "default" : "outline"}
                                            onClick={() => setSelectedOption("support")}
                                            className={selectedOption === "support" ? "bg-brand-blue" : ""}
                                        >
                                            Product Support
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <Label htmlFor="first-name" className="text-left font-medium text-slate-900 block">
                                            First Name
                                        </Label>
                                        <p className="text-sm text-slate-500 text-left">Enter your first name</p>
                                        <Input
                                            id="first-name"
                                            placeholder="John"
                                            name="first-name"
                                            className="w-full"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="last-name" className="text-left font-medium text-slate-900 block">
                                            Last Name
                                        </Label>
                                        <p className="text-sm text-slate-500 text-left">Enter your last name</p>
                                        <Input
                                            id="last-name"
                                            placeholder="Doe"
                                            name="last-name"
                                            className="w-full"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="email" className="text-left font-medium text-slate-900 block">
                                        Your Email
                                    </Label>
                                    <p className="text-sm text-slate-500 text-left">We'll use this to get back to you</p>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john.doe@example.com"
                                        name="email"
                                        className="w-full"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="message" className="text-left font-medium text-slate-900 block">
                                        Your Message
                                    </Label>
                                    <p className="text-sm text-slate-500 text-left">Tell us how we can help you</p>
                                    <Textarea
                                        id="message"
                                        rows={6}
                                        placeholder="Describe your inquiry or request..."
                                        name="message"
                                        className="w-full"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full md:w-auto bg-brand-blue hover:bg-brand-blue/90 px-12"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Sending..." : "Send message"}
                                </Button>
                            </motion.form>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-4xl mx-auto"
                        >
                            <h3 className="text-2xl font-bold mb-6 text-slate-900 text-center">Visit Us</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div>
                                    <p className="font-semibold text-slate-900 mb-2">Location</p>
                                    <p className="text-slate-600">
                                        Parsonic Business Centre, Kweria/Kirinyaga Rd Nairobi, Nairobi, Kenya
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 mb-2">Email</p>
                                    <a href="mailto:query@printduka.co.ke" className="text-brand-blue hover:underline">
                                        query@printduka.co.ke
                                    </a>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 mb-2">Phone</p>
                                    <a href="tel:+254795332766" className="text-brand-blue hover:underline">
                                        0795 332766
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <FooterSection />
        </div>
    );
}
