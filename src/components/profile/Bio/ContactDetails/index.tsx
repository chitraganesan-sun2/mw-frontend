import React from "react";
import { IoMdCopy } from "react-icons/io";
import { TiTickOutline } from "react-icons/ti";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";

const ContactDetailItem = ({ tag }: { tag: any }) => {
    const { copied, copy } = useCopyToClipboard();

    if (!tag?.value) return null;

    return (
        <div className="flex flex-col gap-1" key={tag?.title}>
            <p className="text-sm flex gap-1 items-center">
                {tag?.icon} {tag?.title}
            </p>
            <p className="font-medium flex items-center gap-1">
                {tag?.value}
                {copied ? (
                    <TiTickOutline size={20} aria-hidden="true" />
                ) : (
                    <button
                        type="button"
                        onClick={() => copy(tag?.value)}
                        aria-label={`Copy ${tag?.title || "value"}`}
                        className="focus-ring appearance-none border-0 bg-transparent p-0 leading-none"
                    >
                        <IoMdCopy className="!text-red-500 cursor-pointer" size={20} />
                    </button>
                )}
            </p>
        </div>
    );
};

const ContactDetails = ({ tags = [] }: any) => {
    if (!tags?.length) return null;

    return (
        <div className="flex flex-col gap-2">
            <p className="font-normal text-sm text-gray-light">Contact Information</p>
            <div className="flex gap-1 flex-wrap justify-between">
                {tags?.map((tag: any) => (
                    <ContactDetailItem key={tag?.title} tag={tag} />
                ))}
            </div>
        </div>
    );
};

export default ContactDetails;
