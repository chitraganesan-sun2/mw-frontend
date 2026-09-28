import React, { useState } from "react";
import { IoMdCopy } from "react-icons/io";
import { TiTickOutline } from "react-icons/ti";

// Its own component: this used to be a render helper that called useState inside a .map,
// after an early `return null` for empty values - so the hook count changed as contact
// values loaded (React "rendered more hooks" crash) and rows shared hook slots.
const ContactRow = ({ tag }: { tag: any }) => {
    const [isTextCopied, setIsTextCopied] = useState(false);

    const copyContact = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setIsTextCopied(true);
            setTimeout(() => setIsTextCopied(false), 2000);
        } catch {
            // Clipboard can be unavailable (insecure context / denied permission) - no-op.
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <p className="text-sm flex gap-1 items-center">{tag?.icon} {tag?.title}</p>
            <p className="font-medium flex items-center gap-1">
                {tag?.value}
                {isTextCopied ? (
                    <TiTickOutline size={20} aria-label="Copied" />
                ) : (
                    <button
                        type="button"
                        aria-label={`Copy ${tag?.title}`}
                        onClick={() => copyContact(tag?.value)}
                        className="bg-transparent border-0 p-0 flex cursor-pointer"
                    >
                        <IoMdCopy className="!text-red-500" size={20} />
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
                {tags
                    .filter((tag: any) => tag?.value)
                    .map((tag: any) => (
                        <ContactRow key={tag?.title} tag={tag} />
                    ))}
            </div>
        </div>
    );
};

export default ContactDetails;
