"use client";

import React from "react";
import { Drawer } from "antd";
import CenterModal from "@/components/common/Modals/CenterModal";
import TagComponent from "@/components/common/Tag";
import Button from "@/components/common/Button";
import JoinButton from "@/components/common/JoinButton";
import JoinOpensNote from "@/components/common/JoinOpensNote";
import { TimeIcon, HostedByIcon } from "@/assets/icons";
import useInnerWidth from "@/hooks/useInnerWidth";
import { useNow } from "@/hooks/schedule/useProfileTimeZone";
import { cn } from "@/utils/merge-class";
import { safeHref } from "@/utils/safeHref";
import { spotsText, wingtimeBounds, wingtimeJoinState, wingtimePill, wingtimeWhen, type WingTime } from "@/utils/wingtime";

export interface WingTimeAction {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    /** Destructive actions (Leave, Cancel) use the app's error button. */
    danger?: boolean;
}

interface Props {
    item: WingTime | null;
    onClose: () => void;
    tzLabel?: string | null;
    /** The one action available to this viewer on this WingTime, if any. */
    action?: WingTimeAction | null;
}

const rowLabel = "text-base font-medium text-[#4F4F4F]";
const rowValue = "text-base font-medium text-[#121212] text-right break-words";

/** Detail view - same structure as the Instant Session detail modal: title and status pill,
 * topic chips, description, label/value rows, Close + primary action; a bottom drawer on phones. */
export default function WingTimeDetailModal({ item, onClose, tzLabel, action }: Props) {
    const innerWidth = useInnerWidth();
    const isMobile = innerWidth > 0 && innerWidth < 768;
    const now = useNow();
    if (!item) return null;

    const pill = wingtimePill(item);
    const joinHref = safeHref(item.meeting_link);
    const joinState = joinHref ? wingtimeJoinState(item, now) : "none";
    const noMaterials = !item.materials || item.materials.trim().toLowerCase() === "none";

    const headerContent = (
        <div className="flex items-start justify-between w-full">
            <h2 className="text-[20px] font-medium text-[#121212] flex-1 pr-2 break-words">{item.topic}</h2>
            <TagComponent text={pill.label} tagClassName={`${pill.className} !border-none !px-3 !py-1 !text-sm !font-medium`} />
        </div>
    );

    const footerContent = (
        <div className="w-full flex flex-wrap gap-3 pb-2">
            <Button title="Close" btnVariant="outline" customClassName="flex-1" onClick={onClose} />
            {joinState !== "none" && (
                <JoinButton state={joinState} href={joinHref} variant="block" wrapperClassName="flex-1 min-w-0" contextLabel={item.topic} />
            )}
            {action && (
                <Button
                    title={action.label}
                    btnVariant={action.danger ? "error" : "primary"}
                    customClassName="flex-1"
                    loading={action.loading}
                    disabled={action.disabled || action.loading}
                    onClick={action.onClick}
                />
            )}
        </div>
    );

    const bodyContent = (
        <div className="relative flex flex-col gap-4">
            {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                        <TagComponent key={tag} text={tag} tagClassName="!bg-gray-100 !border-none !text-black !px-3 !py-1 !text-sm" />
                    ))}
                </div>
            )}
            <p className="text-sm text-black leading-relaxed whitespace-pre-line break-words">{item.description}</p>

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-1">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center pb-1! w-5 h-5 text-gray-600 flex-shrink-0">
                        <TimeIcon className="w-5 h-5" />
                    </div>
                    <span className={rowLabel}>Time</span>
                </div>
                <span className={rowValue}>{wingtimeWhen(item, tzLabel)}</span>
            </div>

            {!item.is_host && item.host_name && (
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-5 h-5 text-gray-600 flex-shrink-0">
                            <HostedByIcon />
                        </div>
                        <span className={rowLabel}>Hosted By</span>
                    </div>
                    <span className={rowValue}>{item.host_name}</span>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className={`${rowLabel} pl-7`}>Materials</span>
                <span className={rowValue}>{noMaterials ? "None needed" : item.materials}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pb-3">
                <span className={`${rowLabel} pl-7`}>{item.is_host ? "Signed Up" : "Spots"}</span>
                <span className={rowValue}>
                    {item.is_host ? `${item.registered_count} of ${item.capacity}` : spotsText(item)}
                </span>
            </div>

            {item.meeting_link && (
                <JoinOpensNote
                    status={item.status === "approved" ? "accepted" : item.status}
                    meetLink={item.meeting_link}
                    bounds={wingtimeBounds(item)}
                    now={now}
                />
            )}

            {item.is_host && item.status === "pending_approval" && (
                <div role="status" className="bg-[#FEF9C3] rounded-lg p-4 mb-1">
                    <p className="text-sm text-[#713F12] leading-relaxed">
                        <span className="font-semibold text-sm">Note:</span> An admin is reviewing this WingTime. Learners can see it once it&apos;s approved.
                    </p>
                </div>
            )}
            {item.is_host && item.status === "rejected" && item.reject_reason && (
                <div role="status" className="bg-[#FEF9C3] rounded-lg p-4 mb-1">
                    <p className="text-sm text-[#713F12] leading-relaxed">
                        <span className="font-semibold text-sm">Why it wasn&apos;t approved:</span> {item.reject_reason}
                    </p>
                </div>
            )}
        </div>
    );

    return isMobile ? (
        <Drawer
            open={!!item}
            onClose={onClose}
            placement="bottom"
            size={500}
            closable={false}
            className={cn(
                "instant-session-drawer",
                "[&_.ant-drawer-content-wrapper]:!rounded-t-2xl [&_.ant-drawer-content-wrapper]:!overflow-hidden",
                "[&_.ant-drawer-content]:!rounded-t-2xl [&_.ant-drawer-content]:!overflow-hidden",
                "[&_.ant-drawer-body]:!rounded-t-2xl"
            )}
            styles={{
                wrapper: { borderRadius: "16px 16px 0 0", overflow: "hidden" },
                section: { borderRadius: "16px 16px 0 0", overflow: "hidden" },
                body: {
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    overflow: "hidden",
                    borderRadius: "16px 16px 0 0",
                },
            }}
        >
            <div className="flex flex-col h-full overflow-hidden rounded-t-2xl">
                <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-stroke">{headerContent}</div>
                <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">{bodyContent}</div>
                <div className="flex-shrink-0 px-6 py-4 border-t border-stroke bg-white">{footerContent}</div>
            </div>
        </Drawer>
    ) : (
        <CenterModal
            isOpen={!!item}
            onClose={onClose}
            width={600}
            hideCloseIcon={true}
            headerComponent={headerContent}
            headerClassName="!px-6 !py-5 !border-0"
            bodyClassName="!px-6 !py-1"
            footerComponent={footerContent}
            footerClassName="!px-6 !py-4 !border-0"
        >
            {bodyContent}
        </CenterModal>
    );
}
