"use client";

import { ProfileChangeDiffItem } from "@/api/profileChanges";

type Props = {
    diff: ProfileChangeDiffItem[];
};

const NOT_SET = "Not set";

/** Before/after list of the fields a profile edit changes, grouped by section. */
const ProfileChangeDiff = ({ diff }: Props) => {
    const sections = diff.reduce<Record<string, ProfileChangeDiffItem[]>>((acc, item) => {
        (acc[item.section] ||= []).push(item);
        return acc;
    }, {});

    return (
        <div className="flex flex-col gap-4">
            {Object.entries(sections).map(([section, items]) => (
                <div key={section}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#828282] mb-2">{section}</p>
                    <div className="flex flex-col gap-2">
                        {items.map((item) => (
                            <div key={item.path.join(".")} className="rounded-xl border border-[#E5E5E5] p-3">
                                <p className="text-sm font-medium text-[#121212] mb-1">{item.label}</p>
                                <p className="text-sm text-[#828282] line-through break-words">
                                    {item.old ?? NOT_SET}
                                </p>
                                <p className="text-sm text-[#1B7F4B] break-words">{item.new ?? NOT_SET}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProfileChangeDiff;
