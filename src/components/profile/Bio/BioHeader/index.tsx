"use client";
import DummyProfileImg from "@/assets/images/DummyProfileImg.png";
import TagComponent from "@/components/common/Tag";
import Image from "next/image";
import EditProfileIcon from "@/assets/icons/EditProfileIcon";
import { getCookie } from "@/utils/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

const BioHeader = ({ data }: any) => {
    // getCookie reads document.cookie, which isn't available during SSR - reading it
    // directly in render made the server (role unknown -> blank badge, broken edit-
    // profile link) differ from the client's first render (real role), a hydration
    // mismatch on every profile page view. Deferring to an effect keeps the first
    // client render identical to the server's.
    const [role, setRole] = useState("");
    useEffect(() => {
        setRole(getCookie("role") || "");
    }, []);

    return (
        <div className="flex flex-col gap-4 w-full px-5">
            <div className="flex justify-between items-center gap-2 ">
                <div className="flex items-center gap-2">
                    <Image src={data?.profile_picture || DummyProfileImg} alt="avatar" width={100} height={100} className="!rounded-full !object-cover !w-[80px] !h-[80px]" />
                    <div className="flex flex-col gap-2">
                        <p className="font-medium text-xl">{data?.full_name}</p>
                        <TagComponent text={role} className="text-xs py-1 px-2" />
                        <p className="text-xs font-medium text-gray-light">{data?.timezone}</p>
                    </div>
                </div>
                <Link href={`/${role}/profile?mode=edit`}>
                    <EditProfileIcon />
                </Link>
            </div>
        </div>
    );
};

export default BioHeader;
