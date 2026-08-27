"use client";

import { useOnboardingForm } from "@/hooks/useOnboardingForm";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { GET_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { showToast } from "@/components/common/Toast";
import { validateVolunteerParentDetails, validateLearnerParentFields } from "./config";
import FormTabs from "./FormTabs";
import { getCookie } from "@/utils/auth";
import ModalLoader from "@/components/common/Loader/Modal";
import { useEffect } from "react";

type FormSectionProps = {
    schema: z.ZodSchema;
    formData: FormSectionConfig[];
};

const FormSection = ({ schema, formData }: FormSectionProps) => {
    const { form, onSubmit, isLoading, isRedirecting } = useOnboardingForm(schema);
    const {
        control,
        formState: { errors, isValid, dirtyFields },
        trigger,
        setError,
        setValue,
        clearErrors,
        reset,
        getValues,
    } = form;

    const role = getCookie("role");
    const isVolunteer = role === "volunteer";
    const isLearner = role === "learner";
    const userId = getCookie(isVolunteer ? "volunteer_id" : "learner_id") || "";

    const endpoint = isVolunteer
        ? endpoints.volunteer.getIndividualVolunteer(userId)
        : endpoints.learner.getIndividualLearner(userId);

    const { data: userData, isFetching: isUserLoading } = useQuery({
        queryKey: [role],

        queryFn: async () => {
            const res = await GET_API(endpoint);
            return res.data;
        },
    });

    // Set form values when userData changes
    useEffect(() => {
        if (userData) {
            if (isVolunteer) {
                form.setValue("volunteer_birth_date", userData?.date_of_birth || "");
                form.setValue("volunteer_contact_details.email", userData?.email || "");
            } else if (userData?.enrolled_by === "parent") {
                form.setValue("enrolled_by", "parent");
                form.setValue("parent_info.parent_email", userData?.email || "");
            } else {
                form.setValue("enrolled_by", "self");
                form.setValue(
                    "learner_personal_info.learner_date_of_birth",
                    userData?.date_of_birth
                );
                form.setValue(
                    "learner_personal_info.learner_contact_details.email",
                    userData?.email || ""
                );
            }
        }
    }, [userData, isVolunteer, form]);

    // Set cookie consent separately as it doesn't depend on userData
    useEffect(() => {
        form.setValue("cookie_consent_accepted", getCookie("cookieConsent") === "accepted");
    }, [form]);

    const validateForm = async () => {
        // First run custom validation for specific fields
        let hasCustomValidationErrors = false;
        
        // Additional validation for volunteer parent details (consent checkbox)
        if (isVolunteer) {
            const volunteerValidation = validateVolunteerParentDetails(getValues());
            if (!volunteerValidation.success) {
                // Set errors for the fields that failed validation
                Object.entries(volunteerValidation.errors).forEach(([key, value]) => {
                    setError(key, { message: value });
                });
                hasCustomValidationErrors = true;
            }
        }
        
        // Additional validation for learner parent details (guardian info)
        if (isLearner) {
            const formValues = getValues();         
            const learnerValidation = validateLearnerParentFields(formValues);
            
            if (!learnerValidation.success) {
                // Set errors for the fields that failed validation
                Object.entries(learnerValidation.errors).forEach(([key, value]) => {
                    setError(key, { message: value });
                });
                showToast({
                    type: "error",
                    message: "Guardian info is required when a parent enrolls the learner.",
                });
                hasCustomValidationErrors = true;
            }
        }
        
        // If custom validation failed, return false
        if (hasCustomValidationErrors) {
            showToast({ type: "error", message: "Please fill in all required fields before submitting." });
            return false;
        }
        
        // Then trigger validation for all fields including consent checkboxes
        const isFormValid = await trigger();

        if (!isFormValid) {
            showToast({ type: "error", message: "Please fill in all required fields before submitting." });
            return false;
        }
        
        return true;
    };

    return (
        <div>
            {isUserLoading && (
                <ModalLoader isLoading={isUserLoading} title="Fetching user details..." />
            )}
            {isRedirecting && <ModalLoader isLoading={isRedirecting} title="Loading..." />}
            <FormTabs
                reset={reset}
                setValue={setValue}
                setError={setError}
                clearErrors={clearErrors}
                formData={formData}
                control={control}
                errors={errors}
                trigger={trigger}
                validateForm={validateForm}
                onSubmit={onSubmit}
                getValues={getValues}
                isLoading={isLoading}
            />
        </div>
    );
};

export default FormSection;
