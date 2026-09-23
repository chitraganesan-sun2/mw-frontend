"use client";

import { LogoFooterIcon, LogoIcon } from "@/assets/icons";
import { cn } from "@/utils/merge-class";
import InnerWidth from "@/utils/innerWidth";

type LogoProps = {
    isFooterIcon?: boolean;
    className?: string;
};

const Logo = ({ isFooterIcon, className }: LogoProps) => {
    const innerWidth = InnerWidth();
    const isMobileScreen = innerWidth < 768;

    return (
        <div className={cn("flex items-center gap-2 rounded-lg", className)}>
            <span className="shrink-0">
                {
                    isFooterIcon ?
                        <LogoFooterIcon width={isMobileScreen ? 56 : 76} height={isMobileScreen ? 49 : 64} />
                        :
                        <LogoIcon width={isMobileScreen ? 34 : 44} height={isMobileScreen ? 30 : 40} />
                }
            </span>
            <h3 className="md:text-xl text-base font-medium flex-1 min-w-0">
                <span className="inline-block">Melody</span>
                <span className="inline-block">Wings</span>
            </h3>

        </div>
    );
};

export default Logo;
