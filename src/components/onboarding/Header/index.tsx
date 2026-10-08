"use client";

import Logo from "@/components/common/Logo";
import Link from "next/link";
import { SignOutIcon } from "@/assets/icons";
import { signOut } from "@/utils/signOut";

type Props = {
    className?: string;
};

const Header = (props: Props) => {
    return (
        <header className={`w-full z-50 border-b bg-white sticky top-0 border-gray-200 ${props.className}`}>
            <div className='w-full p-8 flex items-center justify-between gap-4'>
                <Link href='/' className='flex items-center gap-2'>
                    <Logo />
                </Link>
                {/* Onboarding has no sidebar, so this is the only way out - e.g. for a
                    rejected learner, or someone who signed in with the wrong account. */}
                <button
                    type='button'
                    onClick={signOut}
                    className='flex items-center gap-1 cursor-pointer appearance-none border-0 bg-transparent p-0 font-medium text-black'
                >
                    <SignOutIcon />
                    Log Out
                </button>
            </div>
        </header>
    );
};

export default Header;
