import { z } from "zod";
import CenterModal from "@/components/common/Modals/CenterModal";
import ConfirmModal from "@/components/common/Modals/ConfirmModal";
import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCookie } from "@/utils/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showToast } from "@/components/common/Toast";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import FeedHeader from "@/components/community/FeedHeader/index";
import { cn } from "@/utils/merge-class";

import { updateLearnerProfile } from "@/api/learners";
import { updateVolunteerProfile } from "@/api/volunteers";
import { getApiErrorMessage } from "@/utils/apiError";
import { getProfileChangeState, previewProfileChange, ProfileChangeDiffItem, submitProfileChange } from "@/api/profileChanges";
import ProfileChangeReviewModal from "../ProfileChangeReviewModal";
import { PROFILE_CHANGE_QUERY_KEY } from "../ProfileChangeBanner";
import FormTabsSection from "./FormSection";
import { learnerFormSchema, volunteerFormSchema } from "@/components/onboarding/FormSection/config";
import { LearnerProfileFormSections } from "@/constants/learner";
import { VolunteerProfileFormConstants } from "@/constants/volunteer";

type EditProfileModalProps = {
  data?: any;
  isOpen: boolean;
  onClose: () => void;
  triggerReload: () => void;
};

const EditProfileModal = ({
  data = {},
  triggerReload,
  isOpen,
  onClose,
}: EditProfileModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  // Set while the member is looking at the before/after of what they're about to submit.
  const [pendingSubmit, setPendingSubmit] = useState<{ formData: any; diff: ProfileChangeDiffItem[] } | null>(null);
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const formRef = useRef<any>(null);

  const role = getCookie("role");
  const isVolunteer = role === "volunteer";
  const userId = isVolunteer ? getCookie("volunteer_id") : getCookie("learner_id");

  // Approved members' edits are held for admin review instead of saved straight away;
  // anyone still awaiting approval keeps the direct save.
  const { data: reviewState, isLoading: reviewStateLoading } = useQuery({
    queryKey: PROFILE_CHANGE_QUERY_KEY,
    queryFn: getProfileChangeState,
    enabled: isOpen,
  });
  const requiresReview = !!reviewState?.requires_review;

  const UserProfileFormConstants = isVolunteer ? VolunteerProfileFormConstants : LearnerProfileFormSections;
  const UserProfileFormSchema = isVolunteer ? volunteerFormSchema : learnerFormSchema;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    trigger,
    setError,
    setValue,
    clearErrors,
  } = useForm<z.infer<typeof UserProfileFormSchema>>({
    resolver: zodResolver(UserProfileFormSchema),
  });

  type FormData = z.infer<typeof UserProfileFormSchema>;

  const validateForm = () => isValid || showToast({ type: "error", message: "Please fill in all required fields." });

  useEffect(() => {
    if (isOpen) reset(data);
  }, [isOpen, reset, data]);

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      if (requiresReview) {
        // Step 1: show the member exactly what an admin will see; nothing is stored yet.
        const diff = await previewProfileChange(isVolunteer ? "volunteer" : "learner", formData);
        setPendingSubmit({ formData, diff });
        return;
      }

      const updateProfile = isVolunteer ? updateVolunteerProfile : updateLearnerProfile;
      const status = await updateProfile(userId || "", formData);

      if (status === 201) {
        showToast({ message: "Profile updated" });
        triggerReload();
        formRef.current?.resetTabs?.(); // ✅ Reset tabs on success
        onClose();
      } else {
        showToast({ message: "Profile not updated", type: "error" });
      }
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Something went wrong."), type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmSubmitForReview = async () => {
    if (!pendingSubmit) return;
    setIsSubmitting(true);
    try {
      await submitProfileChange(isVolunteer ? "volunteer" : "learner", pendingSubmit.formData);
      showToast({ message: "Submitted for admin review" });
      queryClient.invalidateQueries({ queryKey: PROFILE_CHANGE_QUERY_KEY });
      setPendingSubmit(null);
      formRef.current?.resetTabs?.();
      onClose();
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Couldn't submit your changes. Please try again."), type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Name the first thing that failed (e.g. a missing profile picture has no inline error of
  // its own), instead of only a generic "enter all details".
  const firstErrorMessage = (node: any): string | null => {
    if (!node || typeof node !== "object") return null;
    if (typeof node.message === "string" && node.message) return node.message;
    for (const key of Object.keys(node)) {
      if (key === "ref") continue;
      const found = firstErrorMessage(node[key]);
      if (found) return found;
    }
    return null;
  };

  const onError = (formErrors?: any) => {
    const detail = firstErrorMessage(formErrors);
    showToast({ message: detail ? `Please enter all details: ${detail}` : "Please enter all details.", type: "error" });
  };

  // ✅ handle cancel or close
  const handleClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      formRef.current?.resetTabs?.();
      onClose();
    }
  };

  const confirmDiscardChanges = () => {
    setShowDiscardConfirm(false);
    formRef.current?.resetTabs?.(); // ✅ reset tabs before close
    onClose();
  };

  const buttonProps = {
    secondary: {
      onClick: handleClose,
      title: "Cancel",
      btnVariant: "outline",
      customClassName: cn("!rounded-xl sm:w-auto w-[72px]"),
      disabled: isSubmitting,
    },
    primary: {
      onClick: handleSubmit(onSubmit, onError),
      title: isSubmitting ? (requiresReview ? "Checking" : "Saving") : requiresReview ? "Review changes" : "Save",
      btnVariant: "primary",
      customClassName: cn("!rounded-xl sm:w-auto", requiresReview ? "w-auto" : "w-[72px]"),
      disabled: isSubmitting || reviewStateLoading,
    },
  };

  return (
    <>
    <CenterModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Profile"
      loading={isSubmitting}
      hideFooter={true}
      hideCloseIcon={isMobile}
      height={isMobile ? "100dvh" : "auto"}
      width={isMobile ? "100dvw" : 680}
      headerComponent={
        isMobile && (
          <FeedHeader
            title="Edit Profile"
            mode="edit"
            onClose={handleClose}
            onSave={handleSubmit(onSubmit, onError)}
            isSubmitting={isSubmitting}
            rootClassName="w-full !mb-0 sticky top-0 bg-white z-10 !p-0 !flex-row-reverse"
            saveBtnClassName="!hidden"
          />
        )
      }
      secondaryActionProps={buttonProps.secondary}
      primaryActionProps={buttonProps.primary}
      rootClassName="md:h-[90vh] md:rounded-2xl md:overflow-hidden"
      bodyClassName="max-md:!bg-background-input !py-0"
      showScrollbar
    >
      <FormTabsSection
        ref={formRef}
        formData={UserProfileFormConstants}
        control={control}
        errors={errors}
        trigger={trigger}
        validateForm={validateForm}
        setValue={setValue}
        setError={setError}
        clearErrors={clearErrors}
        onSubmit={handleSubmit(onSubmit, onError)}
        isLoading={isSubmitting}
        savedData={data}
      />
    </CenterModal>
    <ProfileChangeReviewModal
      isOpen={!!pendingSubmit}
      diff={pendingSubmit?.diff ?? []}
      replacesPending={!!reviewState?.pending}
      isLoading={isSubmitting}
      onConfirm={confirmSubmitForReview}
      onCancel={() => setPendingSubmit(null)}
    />
    <ConfirmModal
      isOpen={showDiscardConfirm}
      title="Discard changes"
      description="You have unsaved changes. Are you sure you want to close without saving?"
      confirmText="Discard"
      danger
      onConfirm={confirmDiscardChanges}
      onCancel={() => setShowDiscardConfirm(false)}
    />
    </>
  );
};

export default EditProfileModal;
