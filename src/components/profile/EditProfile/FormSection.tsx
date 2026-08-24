"use client";

import { FormField } from "@/components/onboarding/FormSection/FormField";
import Button from "@/components/common/Button";
import { showToast } from "@/components/common/Toast";
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { validateLearnerParentFields, validateVolunteerParentDetails } from "@/components/onboarding/FormSection/config";
import { UseFormSetError, useWatch, UseFormClearErrors } from "react-hook-form";
import { calculateAge } from "@/utils/timeFunctions";
import { ADULT_VOLUNTEER_AGE } from "@/constants/volunteer";
import TagComponent from "@/components/common/Tag";
import { getCookie } from "@/utils/auth";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";

type FormTabsSectionProps = {
  formData: FormSectionConfig[];
  control: any;
  errors: any;
  trigger: (fields: any) => Promise<boolean>;
  validateForm: () => void;
  handleFillForm?: () => void;
  onSubmit: () => void;
  setError: UseFormSetError<any>;
  setValue: (name: string | any, value: any, options?: any) => void;
  isLoading: boolean;
  clearErrors: UseFormClearErrors<any>;
  onFormSubmitted?: () => void;
};

// ✅ using forwardRef so parent can call resetTabs
const FormTabsSection = forwardRef(
  (
    {
      formData,
      control,
      errors,
      trigger,
      setError,
      setValue,
      validateForm,
      handleFillForm,
      onSubmit,
      isLoading,
      clearErrors,
      onFormSubmitted,
    }: FormTabsSectionProps,
    ref
  ) => {
    const role = getCookie("role");
    const volunteer_birth_date = useWatch({ name: "volunteer_birth_date", control: control });
    const enrolled_by = useWatch({ name: "enrolled_by", control: control });

    const getSavedActiveTab = () => {
      const savedTab = getLocalStorage(`editProfile_activeTab_${role}`);
      return savedTab !== null ? parseInt(savedTab) : 0;
    };

    const [activeTab, setActiveTab] = useState(getSavedActiveTab);
    const [highestTab, setHighestTab] = useState(getSavedActiveTab);
    const tabButtonsRef = useRef<HTMLDivElement>(null);

    const handleValidationErrors = ({ success, errors }: { success: boolean; errors: any }) => {
      if (!success) {
        Object.entries(errors)?.forEach(([key, value]: any) => {
          if (key && value) setError(key, { message: value });
        });
        showToast({ type: "error", message: "Please fill in all required fields before proceeding." });
        return false;
      }
      return true;
    };

    const validateCurrentSection = async () => {
      const { fields, parent } = formData[activeTab];
      const currentFields = fields.map((field) =>
        parent ? `${parent}.${field.parent || field.id}` : field.parent || field.id
      );

      const isValidSection = await trigger(currentFields);

      if (role === "volunteer" && activeTab === 0) {
        const volunteerValidation = validateVolunteerParentDetails(control._formValues);
        if (!handleValidationErrors(volunteerValidation)) return false;
      }

      if (role === "learner") {
        const learnerValidation = validateLearnerParentFields(control._formValues);
        if (activeTab === 0 && highestTab > 1 && !learnerValidation?.success) {
          if (activeTab === 0) setActiveTab(1);
          return false;
        } else if (activeTab === 1 && !handleValidationErrors(learnerValidation)) {
          return false;
        }
      }

      if (!isValidSection) {
        showToast({ type: "error", message: "Please fill in all required fields before proceeding." });
        return false;
      }

      return true;
    };

    const learnerParentValidateKeys = [
      "parent_info.parent_first_name",
      "parent_info.parent_last_name",
      "parent_info.parent_email",
      "parent_info.parent_contact_number",
      "parent_info.relationship_to_learner",
    ];

    const goToTab = (index: number) => {
      setActiveTab(index);
      setHighestTab(Math.max(highestTab, index));
      setLocalStorage(`editProfile_activeTab_${role}`, index.toString());
    };

    // This is an editor for an already-saved, already-verified profile, not a first-time
    // onboarding wizard - clicking a tab pill directly should let the user jump anywhere to
    // review/fix a field, without being blocked by validation on a section they're leaving.
    // Only the "Next" button (sequential forward flow) still validates the current section.
    const handleTabClick = (index: number) => {
      if (role === "learner") learnerParentValidateKeys.forEach((key) => clearErrors(key));
      goToTab(index);
    };

    const handleNext = async () => {
      const isValidSection = await validateCurrentSection();
      if (!isValidSection) return;
      goToTab(activeTab + 1);
    };

    useEffect(() => {
      if (errors?.parent_info) setActiveTab(1);
    }, [errors]);

    useEffect(() => {
      tabButtonsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeTab]);

    useEffect(() => {
      const savedTab = getSavedActiveTab();
      const maxTabIndex = formData.length - 1;
      const validTab = Math.min(savedTab, maxTabIndex);
      if (validTab !== activeTab) {
        setActiveTab(validTab);
        setHighestTab(validTab);
      }
    }, [formData.length]);

    // ✅ Reset tabs when parent calls it or on unmount
    const resetTabs = () => {
      setActiveTab(0);
      setHighestTab(0);
      localStorage.removeItem(`editProfile_activeTab_${role}`);
    };

    // expose resetTabs to parent
    useImperativeHandle(ref, () => ({
      resetTabs,
    }));

    useEffect(() => {
      return () => {
        localStorage.removeItem(`editProfile_activeTab_${role}`);
      };
    }, []);

    const fields = ["consented_from_parent", "volunteer_parent_name", "volunteer_parent_email"];
    const volunteerAge = () => {
      const age = Number(calculateAge(volunteer_birth_date));
      return age >= ADULT_VOLUNTEER_AGE;
    };

    const hideFields = (field: any) =>
      role === "learner"
        ? enrolled_by === "parent" &&
          field.parent === "learner_contact_details" &&
          ["email", "contact_number"].includes(field.id)
        : fields.includes(field.id) && volunteerAge();

    const diableField = (field: any) =>
      (role === "learner" &&
        (((["self", "parent"].includes(enrolled_by) &&
            [
              "learner_date_of_birth",
              "learner_first_name",
              "learner_last_name",
              "learner_gender",
              "learner_preferred_pronoun",
              "learner_primary_language",
              "contact_number",
              "zip_code",
              "country",
              "timezone",
              "parent_first_name",
              "parent_last_name",
              "parent_contact_number",
              "relationship_to_learner",
            ].includes(field.id))) ||
          // The email tied to whichever party actually holds the login account is the one
          // that must stay locked - the other party's email is just contact info and can
          // still be edited.
          (enrolled_by === "self" && field.id === "email") ||
          (enrolled_by === "parent" && field.id === "parent_email"))) ||
      (role === "volunteer" &&
        [
          "volunteer_first_name",
          "volunteer_last_name",
          "volunteer_birth_date",
          "volunteer_gender",
          "email",
          "contact_number",
          "zip_code",
          "country",
          "timezone",
          "consented_from_parent",
          "volunteer_parent_name",
          "volunteer_parent_email",
          "convicted_of_a_felony",
          "involved_in_criminal_activity",
          "convicted_of_a_crime",
          "checked_for_sex_offender",
          "terminated_from_volunteer_position",
          "involved_in_disputes",
          "dismissed_from_institution",
          "having_health_issues",
          "consent_to_background_checks",
          "agree_to_follow_organization_policies",
          "agree_to_understand_termination_of_volunteer_agreement",
          "description",
          "invloved_in_complaints",
        ].includes(field.id));

    return (
      <form onSubmit={onSubmit} className="w-full">
        <div ref={tabButtonsRef} className="mx-auto pb-2">
          <div className="flex md:flex-wrap max-md:overflow-x-auto no-scrollbar py-3 gap-2 sticky top-0 bg-background-input md:bg-white z-10 border-b border-gray-500 md:border-stroke">
            {formData.map((section: any, index) => (
              <button key={section.title || index} type="button" onClick={() => handleTabClick(index)}>
                <TagComponent
                  text={section.title}
                  className={`!text-sm md:!text-base py-1 px-3 border ${
                    activeTab === index
                      ? "bg-background border-primary"
                      : "bg-white md:bg-background-input text-gray-dark border-gray-500 md:border-gray-dark "
                  }`}
                />
              </button>
            ))}
          </div>

          {formData.map((section: any, index) => (
            <div
              key={index}
              className={`md:!bg-white lg:rounded-3xl px-2 md:px-3 mx-auto py-5 ${
                activeTab === index ? "block" : "hidden"
              }`}
            >
              {section?.title && (
                <h2 className="text-2xl lg:text-2xl font-medium lg:font-semibold mb-4 lg:mb-5">
                  {section?.title}
                </h2>
              )}
              <div
                className={`grid grid-cols-1 w-full gap-3 ${
                  section?.type === "card" ? "lg:gap-5" : "lg:gap-3"
                }`}
              >
                {section?.fields
                  ?.filter((field: any) => !hideFields(field))
                  .map((field: any, index: number) => {
                    if (section?.type === "card") {
                      const parent = section?.parent ? `${section?.parent}.${field.parent}` : field.parent;
                      return (
                        <div key={field.title} className="border-b border-stroke pb-4">
                          <h3 className="text-xl font-medium mb-2">{field.title}</h3>
                          <div className="flex flex-col gap-2 md:gap-1">
                            {field.fields.map((childField: any) => {
                              const isChildDisabled = diableField(childField) || childField?.disabled;
                              return (
                                <FormField
                                  key={childField.id}
                                  field={{
                                    ...childField,
                                    gridCols: 2,
                                    rootClassName: `${childField.rootClassName} max-md:!bg-white max-md:!p-4 max-md:!rounded-lg`,
                                    disabled: isChildDisabled,
                                  }}
                                  control={control}
                                  errors={errors}
                                  parent={parent}
                                  setValue={setValue}
                                  clearErrors={clearErrors}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    const isFieldDisabled = diableField(field) || field?.disabled;
                    return (
                      <FormField
                        key={field.id}
                        field={{
                          ...field,
                          gridCols: 2,
                          rootClassName: `${field.rootClassName} max-md:!bg-white max-md:!p-4 max-md:!rounded-lg`,
                          disabled: isFieldDisabled,
                        }}
                        control={control}
                        errors={errors}
                        setValue={setValue}
                        clearErrors={clearErrors}
                        parent={field.parent ? `${section?.parent}.${field.parent}` : section?.parent}
                      />
                    );
                  })}
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  {activeTab === formData.length - 1 ? (
                    <Button
                      onClick={onSubmit}
                      loading={isLoading}
                      disabled={isLoading}
                      title="Submit Application"
                      size="large"
                      customClassName="w-full sm:w-[50%] lg:w-fit max-lg:mx-auto hover:!bg-background-secondary !text-sm !bg-background-secondary !text-black !rounded-lg !shadow-2xl !font-normal"
                    />
                  ) : (
                    <Button
                      htmlType="button"
                      onClick={handleNext}
                      title="Next"
                      size="large"
                      customClassName="w-full sm:w-[50%] lg:w-fit max-lg:mx-auto hover:!bg-background-secondary !text-sm !bg-background-secondary !text-black !rounded-lg !shadow-2xl !font-medium"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </form>
    );
  }
);

export default FormTabsSection;
