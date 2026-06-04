import Image from "next/image";
import clsx from "clsx";
import logoColors from "@/assets/logo_colors.png";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { box: "h-8 w-8", img: 32 },
  md: { box: "h-10 w-10", img: 40 },
  lg: { box: "h-14 w-14", img: 56 },
};

export default function BrandLogo({ size = "md", className }: BrandLogoProps) {
  const s = sizes[size];

  return (
    <div
      className={clsx(
        s.box,
        "relative shrink-0 overflow-hidden rounded-xl bg-[var(--card)] ring-1 ring-[var(--card-border)] shadow-sm",
        className,
      )}
    >
      <Image
        src={logoColors}
        alt="Municip'All"
        width={s.img}
        height={s.img}
        className="h-full w-full object-contain p-1"
        priority
      />
    </div>
  );
}
