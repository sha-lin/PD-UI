import Image from "next/image";

interface LogoProps {
    variant?: "default" | "black";
    size?: "default" | "large";
}

export function Logo({ variant = "default", size = "default" }: LogoProps) {
    const logoSrc = variant === "black" ? "/logo/logo.png" : "/logo/pd.png";
    const sizeClasses = size === "large" ? "h-24" : "h-8";
    const width = size === "large" ? 360 : 120;
    const height = size === "large" ? 108 : 36;

    return (
        <Image
            src={logoSrc}
            alt="Print Duka"
            width={width}
            height={height}
            className={`${sizeClasses} w-auto`}
        />
    );
}
