import { z } from "zod";
import CenterModal from "@/components/common/Modals/CenterModal";
import ConfirmModal from "@/components/common/Modals/ConfirmModal";
import { useEffect, useState, useRef } from "react";
import { getCookie } from "@/utils/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { showToast } from "@/components/common/Toast";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import FeedHeader from "@/components/community/FeedHeader/index";
import { cn } from "@/utils/merge-class";

import { updateLearnerProfile } from "@/api/learners";
import { updateVolunteerProfile } from "@/api/volunteers";
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
  const isMobile = useMediaQuery("(max-width: 767px)");
  const formRef = useRef<any>(null);

  const role = getCookie("role");
  const isVolunteer = role === "volunteer";
  const userId = isVolunteer ? getCookie("volunteer_id") : getCookie("learner_id");

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

  const validateForm = () => isValid || showToast({ type: "error", message: "Fill required fields!" });

  useEffect(() => {
    if (isOpen) reset(data);
  }, [isOpen, reset, data]);

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
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
      showToast({ message: "Something went wrong!", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = () => {
    showToast({ message: "Please enter all details.", type: "error" });
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
      btnVariant: "secondary",
      customClassName: cn("!bg-transparent !text-black !rounded-xl sm:w-auto w-[72px]"),
      disabled: isSubmitting,
    },
    primary: {
      onClick: handleSubmit(onSubmit, onError),
      title: isSubmitting ? "Saving" : "Save",
      customClassName: cn("!rounded-xl hover:!bg-black hover:!text-white sm:w-auto w-[72px]"),
      disabled: isSubmitting,
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
      />
    </CenterModal>
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
