'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJoinUsStore } from '@/store/useJoinUsStore';
import { submitStep1, updateStep1 } from '@/api/join-us';
import { useCountryOptions, useStateOptions } from '@/hooks/useCountriesAndStates';
import { showToast } from '@/components/common/Toast';
import Button from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import RadioInput from '@/components/common/Input/RadioButton';
import { COUNTRY_CODE_OPTIONS, countryDialCodes } from '@/utils/countryDialCodes';

const JoinUsStep1Page = () => {
    const router = useRouter();
    const { applicationId, setApplicationId, step1Submitted, setStep1Submitted, step1Data, setStep1Data } = useJoinUsStore();
    const [loading, setLoading] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const [compensationPreference, setCompensationPreference] = useState<'unpaid_ok' | 'paid_only' | ''>(step1Data?.compensation_preference || '');
    const [fullName, setFullName] = useState(step1Data?.full_name || '');
    const [email, setEmail] = useState(step1Data?.email || '');
    const [phoneCountryCode, setPhoneCountryCode] = useState<string | number>(step1Data?.phone?.country_code || '+1');
    const [phoneNumber, setPhoneNumber] = useState(step1Data?.phone?.number || '');
    const [dateOfBirth, setDateOfBirth] = useState(step1Data?.date_of_birth || '');
    const [country, setCountry] = useState<string | number>(step1Data?.address?.country || '');
    const [state, setState] = useState<string | number>(step1Data?.address?.state || '');
    const [linkedIn, setLinkedIn] = useState(step1Data?.linkedin_or_portfolio_url || '');
    const [school, setSchool] = useState(step1Data?.education?.school_or_university || '');
    const [gradeLevel, setGradeLevel] = useState(step1Data?.education?.grade_level_or_year || '');
    const [employmentDetails, setEmploymentDetails] = useState(step1Data?.current_employment_details || '');
    const [compensation, setCompensation] = useState(step1Data?.compensation_expectation || '');

    const { countryOptions, countriesLoading } = useCountryOptions();
    const { stateOptions, statesLoading } = useStateOptions(country);

    // Update phone country code automatically when country changes
    useEffect(() => {
        if (country) {
            const dialCode = countryDialCodes[country.toString()];
            if (dialCode) {
                setPhoneCountryCode(dialCode);
            }
        }
    }, [country]);

    const isNextEnabled =
        !loading &&
        !!fullName.trim() &&
        emailRegex.test(email) &&
        !!phoneCountryCode &&
        phoneNumber.trim().length > 0 &&
        !!dateOfBirth &&
        !!country &&
        !!state &&
        !!compensationPreference;

    const selectedCountryName =
        countryOptions.find((opt) => opt.value === country?.toString())?.label || country?.toString();

    const selectedStateName =
        stateOptions.find((opt) => opt.value === state?.toString())?.label || state?.toString();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) {
            showToast({ type: 'error', message: 'Please enter your full name.' });
            return;
        }
        if (!emailRegex.test(email)) {
            showToast({ type: 'error', message: 'Please enter a valid email address.' });
            return;
        }

        if (!phoneCountryCode || phoneNumber.trim().length === 0) {
            showToast({ type: 'error', message: 'Please enter your phone number.' });
            return;
        }

        if (!dateOfBirth) {
            showToast({ type: 'error', message: 'Please select your date of birth.' });
            return;
        }

        if (!country) {
            showToast({ type: 'error', message: 'Please select your country.' });
            return;
        }

        if (!state) {
            showToast({ type: 'error', message: 'Please select your state.' });
            return;
        }

        if (!compensationPreference) {
            showToast({ type: 'error', message: 'Please confirm compensation preference.' });
            return;
        }

        const payload = {
            full_name: fullName,
            email: email,
            phone: {
                country_code: phoneCountryCode.toString(),
                number: phoneNumber
            },
            date_of_birth: dateOfBirth,
            address: {
                // Send the selected display values (names), not the internal codes.
                country: selectedCountryName,
                state: selectedStateName
            },
            linkedin_or_portfolio_url: linkedIn || null,
            education: {
                school_or_university: school || null,
                grade_level_or_year: gradeLevel || null
            },
            current_employment_details: employmentDetails || null,
            compensation_expectation: compensation || null,
            compensation_preference: compensationPreference
        };

        setLoading(true);
        let navigated = false;
        try {
            if (!step1Submitted || !applicationId) {
                const res: any = await submitStep1(payload);

                const responseData = res?.data || res;
                const newAppId = responseData?.application_id
                    || responseData?.applicationId
                    || responseData?.id
                    || responseData?.data?.application_id
                    || responseData?.data?.applicationId
                    || responseData?.data?.id;

                if (!newAppId) {
                    showToast({ type: 'error', message: 'Application ID not returned. Check console.' });
                    console.error("Step 1 POST Response:", res);
                    setLoading(false);
                    return;
                }

                setApplicationId(newAppId);
                setStep1Submitted(true);
                setStep1Data(payload);
                navigated = true;
                router.push('/join-us/step-2');
            } else {
                await updateStep1(applicationId, payload);
                setStep1Data(payload);
                navigated = true;
                router.push('/join-us/step-2');
            }
        } catch (err: any) {
            showToast({ type: 'error', message: err?.message || 'Something went wrong!' });
        } finally {
            if (!navigated) setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-input flex flex-col items-center">
            {/* Title section (similar style to onboarding) */}
            <section className="w-full flex flex-col items-center justify-center pt-10 md:pt-16">
                <div className="max-w-5xl flex flex-col gap-[12px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-[24px] md:text-[32px] font-medium tracking-tight text-gray-900 ">
                        We&apos;re excited that you want to join us! 😊
                    </h1>
                    <p className="text-[14px] md:text-[20px]  text-[#121212] italic">
                        Fill in the details below so we can get to know you better. Once submitted, our team
                        will review your information and get in touch with you soon.
                    </p>
                </div>
            </section>

            {/* Form card */}
            <main className="w-full flex-1 flex justify-center py-8 md:py-12 lg:py-16">
                <div className="w-full max-w-5xl md:mx-auto md:px-8">
                    <div className="bg-white md:rounded-[24px] md:shadow-sm px-4 sm:px-6 md:px-10 lg:px-12 py-6 md:py-8 lg:py-10">
                        {/* Basic information heading */}
                        <div className="mb-6 md:mb-8">
                            <h2 className="text-[20px] md:text-[24px] font-medium text-gray-900">
                                Basic Information
                            </h2>
                        </div>

                        {/* Form fields */}
                        <form
                            onSubmit={handleSubmit}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full min-w-0">
                                {/* Full name */}
                                <Input
                                    inputType="text"
                                    name="full_name"
                                    label="Full Name"
                                    required
                                    value={fullName}
                                    onChange={(v) => setFullName(typeof v === 'string' ? v : v?.[0] ?? '')}
                                    placeholder="Eg. John Doe"
                                    rootClassName="w-full"
                                    inputClassName="w-full !rounded-xl border-gray-200"
                                />

                                {/* Email */}
                                <Input
                                    inputType="text"
                                    name="email"
                                    label="Email Address"
                                    required
                                    value={email}
                                    onChange={(v: any) => setEmail(typeof v === 'string' ? v : v?.[0] ?? '')}
                                    placeholder="Enter Email Address"
                                    rootClassName="w-full"
                                    inputClassName="w-full !rounded-xl border-gray-200"
                                />

                                {/* Phone */}
                                <div className="flex flex-col gap-2 w-full min-w-0">
                                    <label className="text-[16px] md:text-sm  text-gray-700">
                                        Phone No<span className="text-red-500"> *</span>
                                    </label>
                                    <div className="flex gap-2 w-full min-w-0">
                                        <Input
                                            inputType="select"
                                            name="phone_country_code"
                                            value={phoneCountryCode}
                                            onChange={(v) => setPhoneCountryCode(v ?? '+1')}
                                            options={COUNTRY_CODE_OPTIONS}
                                            rootClassName="!w-20 md:w-[70px]! !mb-0 shrink-0"
                                            inputClassName="w-full !rounded-[12px] border-gray-200 [&_.ant-select-selector]:!rounded-xl"
                                        />
                                        <Input
                                            inputType="text"
                                            name="phone_number"
                                            value={phoneNumber}
                                            onChange={(v) => setPhoneNumber((typeof v === 'string' ? v : v?.[0] ?? '').replace(/\D/g, ''))}
                                            placeholder="Enter Phone number"
                                            rootClassName="w-full flex-1 min-w-0 !mb-0"
                                            inputClassName="w-full !rounded-xl border-gray-200"
                                        />
                                    </div>
                                </div>

                                {/* Date of birth */}
                                <Input
                                    inputType="birthdatepicker"
                                    name="date_of_birth"
                                    label="Date of Birth"
                                    required
                                    value={dateOfBirth}
                                    birthDatePicker={{ minAge: 13, maxAge: 100 }}
                                    onChange={(v) => setDateOfBirth(typeof v === 'string' ? v : '')}
                                    placeholder="Select Date of Birth"
                                    rootClassName="w-full"
                                    inputClassName="w-full !rounded-xl border-gray-200"
                                />

                                {/* Country */}
                                <Input
                                    inputType="select"
                                    name="country"
                                    label="Country of Residence"
                                    required
                                    showSearch
                                    disabled={countriesLoading}
                                    isLoading={countriesLoading}
                                    value={country}
                                    onChange={(v) => {
                                        setCountry(v ?? '');
                                        setState(''); // reset state when country changes
                                    }}
                                    placeholder={countriesLoading ? "Loading countries..." : "Select Country"}
                                    options={countryOptions}
                                    rootClassName="w-full"
                                    inputClassName="w-full !rounded-xl border-gray-200 [&_.ant-select-selector]:!rounded-xl"
                                />

                                {/* State */}
                                <Input
                                    inputType="select"
                                    name="state"
                                    label="State"
                                    required
                                    showSearch
                                    disabled={!country || statesLoading}
                                    isLoading={statesLoading}
                                    value={state}
                                    onChange={(v) => setState(v ?? '')}
                                    placeholder={statesLoading ? "Loading states..." : "Select State"}
                                    options={stateOptions}
                                    rootClassName="w-full"
                                    inputClassName="w-full !rounded-xl border-gray-200 [&_.ant-select-selector]:!rounded-xl"
                                />

                                {/* LinkedIn */}
                                <Input
                                    inputType="text"
                                    name="linkedin"
                                    label="LinkedIn or Portfolio"
                                    value={linkedIn}
                                    onChange={(v) => setLinkedIn(typeof v === 'string' ? v : v?.[0] ?? '')}
                                    placeholder="Paste link here"
                                    rootClassName="w-full"
                                    inputClassName="w-full !rounded-xl border-gray-200"
                                />

                                {/* School / University */}
                                <Input
                                    inputType="text"
                                    name="school"
                                    label="School / University"
                                    value={school}
                                    onChange={(v) => setSchool(typeof v === 'string' ? v : v?.[0] ?? '')}
                                    placeholder="Enter School/University"
                                    rootClassName="w-full"
                                    inputClassName="w-full !rounded-xl border-gray-200"
                                />

                                {/* Grade level */}
                                <Input
                                    inputType="text"
                                    name="grade_level"
                                    label="Grade Level / Year"
                                    value={gradeLevel}
                                    onChange={(v) => setGradeLevel(typeof v === 'string' ? v : v?.[0] ?? '')}
                                    placeholder="Enter level/year"
                                    rootClassName="w-full"
                                    inputClassName="w-full !rounded-xl border-gray-200"
                                />

                                {/* Current employment */}
                                <Input
                                    inputType="text"
                                    name="employment_details"
                                    label="Current Employment Details"
                                    value={employmentDetails}
                                    onChange={(v) => setEmploymentDetails(typeof v === 'string' ? v : v?.[0] ?? '')}
                                    placeholder="Enter details"
                                    rootClassName="w-full"
                                    inputClassName="w-full !rounded-xl border-gray-200"
                                />

                                {/* Compensation */}
                                <Input
                                    inputType="text"
                                    name="compensation"
                                    label="Compensation / Stipend Expectation"
                                    value={compensation}
                                    onChange={(v) => setCompensation(typeof v === 'string' ? v : v?.[0] ?? '')}
                                    placeholder="Enter here"
                                    rootClassName="w-full md:col-span-2"
                                    inputClassName="w-full !rounded-xl border-gray-200"
                                />
                            </div>

                            {/* Info text */}
                            <div className="mt-2 text-[14px]  text-[#4F4F4F] leading-relaxed">
                                This internship is currently unpaid and designed as a volunteer or learning
                                opportunity. MelodyWings is a nonprofit organization, and while compensation
                                cannot be guaranteed at this time, stipends or honorariums may be offered in the
                                future if donations or funding become available.
                            </div>

                            {/* Radio confirmation */}
                            <div className="mt-4 space-y-3">
                                <p className="text-[14px]     text-[#4F4F4F]">
                                    Please confirm that you understand and are comfortable with this arrangement.<span className="text-red-500"> *</span>
                                </p>

                                <RadioInput
                                    inputType="radio"
                                    name="compensation_preference"
                                    value={compensationPreference}
                                    onChange={(value) =>
                                        setCompensationPreference(
                                            value as '' | 'unpaid_ok' | 'paid_only'
                                        )
                                    }
                                    options={[
                                        {
                                            value: 'unpaid_ok',
                                            label: 'Yes, I understand and am willing to participate under these conditions',
                                        },
                                        {
                                            value: 'paid_only',
                                            label: 'I would prefer only paid opportunities',
                                        },
                                    ]}
                                    inputClassName="mt-1"
                                    radioButtonClassName="w-full md:w-auto"
                                />
                            </div>

                            {/* Navigation buttons */}
                            <div className="mt-8 flex w-full  gap-3 md:flex-row md:justify-between md:items-center">
                                <Button
                                    title="Previous"
                                    disabled
                                    btnVariant="tertiary"
                                    customClassName="!px-6 !py-2 !w-full md:!w-auto !rounded-[10px] !h-10 md:!h-11 border border-gray-300 !text-gray-700"
                                    onClick={() => router.push('/join-us')}
                                />
                                <Button
                                    htmlType="submit"
                                    title={loading ? "Loading..." : "Next Step"}
                                    loading={loading}
                                    disabled={!isNextEnabled}
                                    btnVariant="secondary"
                                    customClassName="!px-6 !w-full md:!w-auto !rounded-[10px] !py-2 !h-10 md:!h-11 disabled:opacity-50"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JoinUsStep1Page;

