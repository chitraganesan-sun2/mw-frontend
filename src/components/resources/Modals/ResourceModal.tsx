import { z } from "zod";
import { Input } from "@/components/common/Input";
import CenterModal from "@/components/common/Modals/CenterModal";
import { ResourceFormConstants, ResourceFormDefaultValues, ResourceFormSchema } from "@/constants/resources";
import { cn } from "@/utils/merge-class";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCookie } from "@/utils/auth";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "@/store/useAppStore";
import { addResource, getSingleResource, updateResource } from "@/api/resources";
import { showToast } from "@/components/common/Toast";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import FeedHeader from "@/components/community/FeedHeader/index";
import LottieLoader from "@/components/common/Loader/Lottie";
import { FaTrashCan } from "react-icons/fa6";
import { FiPlus } from "react-icons/fi";

type ResourceModalProps = {
    isOpen: boolean;
    mode: ShowModalType;
    onClose: () => void;
    triggerReload: () => void;
};

type FormData = z.infer<typeof ResourceFormSchema>;

type ResourceActionProps = {
    data: FormData;
    actionFn: (data: FormData) => Promise<any>;
    successMessage: string;
    errorMessage: string;
};

type CuratedLink = {
    title: string;
    url: string
}

interface Props {
    value: CuratedLink[];
    onChange: (value: CuratedLink[]) => void;
    error: any;
}

const MAX_LINKS = 5;
const CuratedInputComponent: React.FC<Props> = ({ value, onChange, error }) => {
    const [links, setLinks] = useState<CuratedLink[]>(value.length ? value : []);

    useEffect(() => {
        setLinks(value.length ? value : []);
    }, [value]);

    const handleChange = useCallback((index: number, field: keyof CuratedLink, eventValue: string) => {
        setLinks((prevLinks) => {
            const newLinks = [...prevLinks];
            newLinks[index] = { ...newLinks[index], [field]: eventValue };
            onChange(newLinks);
            return newLinks;
        });
    }, [onChange]);

    const addRow = useCallback(() => {
        if (links.length < MAX_LINKS) {
            setLinks((prevLinks) => {
                const newLinks = [...prevLinks, { title: "", url: "" }];
                return newLinks;
            });
        }
    }, [links.length]);

    const removeRow = useCallback((index: number) => {
        setLinks((prevLinks) => {
            const newLinks = prevLinks.filter((_, i) => i !== index);
            onChange(newLinks);
            return newLinks;
        });
    }, [onChange]);

    return (
        <div>
            <label className="inner-label text-sm font-medium">Curated Links</label>
            <div className="space-y-2 mt-2">
                {links.map((link, index) => {
                    const errors = Array.isArray(error) && error[index];
                    const titleError = errors?.title?.message;
                    const urlError = errors?.url?.message;

                    return (
                    <div key={index} className="flex flex-col">
                        <div className="flex items-center gap-2 w-full">
                            <Input
                                name={`title-${index}`}
                                value={link.title}
                                onChange={(value) => handleChange(index, "title", value as string)}
                                inputType="text"
                                placeholder="Title"
                                rootClassName="!w-[45%] !mb-0"
                                inputClassName={`!w-full ${titleError ? 'border !border-red-400 !bg-red-50' : ''}`}
                            />
                            <span>-</span>
                            <Input
                                name={`link-${index}`}
                                value={link.url}
                                onChange={(value) => handleChange(index, "url", value as string)}
                                inputType="text"
                                placeholder="Paste link here"
                                rootClassName="!w-full !mb-0"
                                inputClassName={`!w-full ${urlError ? 'border !border-red-400 !bg-red-50' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => removeRow(index)}
                                className="text-red-500 flex-center bg-red-100 rounded-md p-2 border hover:border-red-500"
                            >
                                <FaTrashCan size={20} />
                            </button>
                        </div>
                        {(titleError || urlError) ? <p className="text-red-500 text-xs mt-1">{titleError || urlError}</p> : null}
                    </div>
                )})}
                {error?.message && <p className="text-red-500 text-sm">{error?.message}</p>}
                {links.length < MAX_LINKS && (
                    <button
                        type="button"
                        onClick={addRow}
                        className="text-gray-800 text-sm border px-3 py-2 rounded-xl flex-center gap-1"
                    >
                        <FiPlus /> Add New Link
                    </button>
                )}
            </div>
        </div>
    );
};

const ResourceModal = ({ triggerReload, isOpen, mode = "view", onClose }: ResourceModalProps) => {
    const { userName } = useAppStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const role = getCookie("role");
    const [resourceId] = useQueryState("id") || "";
    const [currentMode] = useQueryState("mode");
    const isEditMode = currentMode === "edit";

    const modalRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (modalRef.current) {
            modalRef.current.scrollIntoView();
        }
    }, [isOpen]);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(ResourceFormSchema),
    });

    // Fetch resource data if in edit mode
    const { isFetching } = useQuery({
        queryKey: ["getSingleResource", resourceId],
        queryFn: async () => {
            if (!resourceId) return null;
            const resource = await getSingleResource(resourceId || "");
            reset(resource);
        },
        enabled: isEditMode && !!resourceId,
    });

    useEffect(() => {
        setValue("created_by", userName || role || "");
    }, [currentMode, resourceId]);

    useEffect(() => {
        if (currentMode === "create") {
            reset({ ...ResourceFormDefaultValues, created_by: userName || role || "" });
        }
    }, [currentMode, reset]);

    const handleResourceAction = async ({
        data,
        actionFn,
        successMessage,
        errorMessage,
    }: ResourceActionProps) => {
        setIsSubmitting(true);
        try {
            const isSuccess = await actionFn(data);
            if (isSuccess) {
                showToast({ message: successMessage });
                triggerReload();
                onClose();
                reset({});
            } else {
                showToast({ message: errorMessage, type: "error" });
            }
        } catch (error) {
            showToast({ message: "Something went wrong!", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmit = (data: FormData) => {
        const actionFn = isEditMode
            ? (d: FormData) => updateResource(resourceId || "", d)
            : (d: FormData) => addResource({ ...d, created_by: role });
        const successMessage = isEditMode ? "Resource updated" : "Resource created";
        const errorMessage = isEditMode ? "Resource not updated" : "Resource not created";

        handleResourceAction({ data, actionFn, successMessage, errorMessage });
    };

    const onError = () => {
        showToast({ message: "Please enter all details.", type: "error" });
    };

    const buttonProps = {
        secondary: {
            onClick: onClose,
            title: "Cancel",
            btnVariant: "secondary",
            customClassName: cn(
                mode === "view"
                    ? "!text-error !bg-error-light !border-none"
                    : "!bg-transparent !text-black",
                "!rounded-xl",
                "sm:w-auto w-[72px]"
            ),
        },
        primary: {
            onClick: handleSubmit(onSubmit, onError),
            title: isSubmitting ? (isEditMode ? "Saving" : "Adding") : isEditMode ? "Save" : "Add",
            customClassName: cn(
                "!rounded-xl hover:!bg-black hover:!text-white",
                "sm:w-auto w-[72px]"
            ),
            disabled: isSubmitting,
        },
    };

    const isMobile = useMediaQuery("(max-width: 767px)");

    return (
        <CenterModal
            title={isEditMode ? "Edit Resource" : "Add New Resource"}
            isOpen={isOpen}
            onClose={onClose}
            loading={isSubmitting}
            width={700}
            headerComponent={
                isMobile && (
                    <FeedHeader
                        mode={currentMode || ""}
                        title={isEditMode ? "Edit Resource" : "Add New Resource"}
                        rootClassName="!w-full !p-1"
                        onClose={onClose}
                        onSave={handleSubmit(onSubmit, onError)}
                        isSubmitting={isSubmitting}
                    />
                )
            }
            hideCloseIcon={isMobile}
            rootClassName="md:!h-auto md:!max-h-[70dvh]"
            bodyClassName="max-md:!bg-background-input"
            secondaryActionProps={buttonProps.secondary}
            primaryActionProps={buttonProps.primary}
            hideFooter={isMobile}
        >
            <div ref={modalRef} />
            {mode !== "view" ? (
                <form
                    onSubmit={handleSubmit(onSubmit, onError)}
                    className={cn(
                        "flex flex-col gap-2 md:gap-4 py-3",
                        isMobile && "overflow-y-auto px-4 pt-2"
                    )}
                >
                    {
                        isEditMode && isFetching ? (
                            <div className={`w-full flex-center ${isMobile ? "min-h-[90vh]" : "min-h-[45vh]"}`}>
                                <LottieLoader isLoading={true} customClassName="md:w-[5rem] md:h-[5rem] lg:w-[6rem] lg:h-[6rem]" />
                            </div>
                        )
                            :
                            (
                                <>
                                    {ResourceFormConstants.map((field: any) => (
                                        <Controller
                                            key={field.name}
                                            name={field.name}
                                            control={control}
                                            render={({ field: { value, onChange } }) => (
                                                <Input
                                                    key={field.name}
                                                    {...field}
                                                    error={errors[field.name as keyof FormData]?.message}
                                                    value={value}
                                                    onChange={onChange}
                                                    rootClassName="max-md:bg-white max-md:p-4 max-md:rounded-xl"
                                                    inputClassName={field.inputClassName}
                                                />
                                            )}
                                        />
                                    ))}
                                    <Controller
                                        key="curated_links"
                                        name="curated_links"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <CuratedInputComponent
                                                key="curated_links"
                                                value={value || []}
                                                error={errors.curated_links}
                                                onChange={onChange}
                                            />
                                        )}
                                    />
                                </>
                            )
                    }
                </form>
            ) : (
                <div>View</div>
            )}
        </CenterModal>
    );
};

export default ResourceModal;
