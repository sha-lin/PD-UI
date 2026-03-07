'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Flag, Shirt, FileText, Home, Gift } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BorderBeam } from '@/magicui/border-beam'

export default function HoverSliderSection() {
    type ImageKey = 'item-1' | 'item-2' | 'item-3' | 'item-4' | 'item-5'
    const [activeItem, setActiveItem] = useState<ImageKey>('item-1')

    const images = {
        'item-1': {
            image: '/banner/banner.jpg',
            alt: 'Signage and Banners',
        },
        'item-2': {
            image: '/banner/clothing.png',
            alt: 'Custom Clothing',
        },
        'item-3': {
            image: '/banner/marketing.jpg',
            alt: 'Marketing Material',
        },
        'item-4': {
            image: '/banner/stationary.jpg',
            alt: 'Office and Home decor',
        },
        'item-5': {
            image: '/banner/stationary.jpg',
            alt: 'Stationery and Promotional Products',
        },
    }

    return (
        <section className="py-12 md:py-20 lg:py-32">
            <div className="bg-linear-to-b absolute inset-0 -z-10 sm:inset-6 sm:rounded-b-3xl dark:block dark:to-[color-mix(in_oklab,var(--color-zinc-900)_75%,var(--color-background))]"></div>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16 lg:space-y-20 dark:[--color-border:color-mix(in_oklab,var(--color-white)_10%,transparent)]">
                <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-6xl">Print Solutions for Every Need</h2>
                    <p>From eye-catching signage to branded apparel and promotional products, we deliver quality printing services that bring your vision to life.</p>
                </div>

                <div className="grid gap-12 sm:px-12 md:grid-cols-2 lg:gap-20 lg:px-0">
                    <Accordion
                        type="single"
                        value={activeItem}
                        onValueChange={(value: string) => setActiveItem(value as ImageKey)}
                        className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Flag className="size-4" />
                                    Signage & Banners
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Large format printing for outdoor banners, indoor displays, event signage, and promotional materials that capture attention and communicate your message effectively.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Shirt className="size-4" />
                                    Clothing
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Custom branded apparel including t-shirts, uniforms, and corporate wear with high-quality printing and embroidery to showcase your brand identity.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <FileText className="size-4" />
                                    Marketing Material
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Professional brochures, flyers, posters, and catalogs designed to elevate your marketing campaigns with vibrant colors and premium finishes.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Home className="size-4" />
                                    Office & Home
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Custom prints for office spaces and homes including wall art, decorative signage, and personalized items that add character to any environment.</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Gift className="size-4" />
                                    Stationery & Promotional Products
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>Business cards, letterheads, notebooks, and branded promotional items that leave a lasting impression on clients and partners.</AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="bg-background relative flex overflow-hidden rounded-3xl border p-2">
                        <div className="w-15 absolute inset-0 right-0 ml-auto border-l bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]"></div>
                        <div className="aspect-76/59 bg-background relative w-[calc(3/4*100%+3rem)] rounded-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeItem}-id`}
                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="size-full overflow-hidden rounded-2xl border bg-zinc-900 shadow-md">
                                    <Image
                                        src={images[activeItem].image}
                                        className="size-full object-cover object-left-top dark:mix-blend-lighten"
                                        alt={images[activeItem].alt}
                                        width={1207}
                                        height={929}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <BorderBeam
                            duration={6}
                            size={200}
                            className="from-transparent via-yellow-700 to-transparent dark:via-white/50"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
