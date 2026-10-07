'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useJoinUsStore } from '@/store/useJoinUsStore';
import { submitStep3, updateStep3 } from '@/api/join-us';
import { showToast } from '@/components/common/Toast';
import Button from '@/components/common/Button';
import RadioInput from '@/components/common/Input/RadioButton';

const JoinUsStep3Page = () => {
    const router = useRouter();
    const { applicationId, step1Submitted, step2Submitted, step3Submitted, setStep3Submitted, step3Data, setStep3Data, clearStore } = useJoinUsStore();
    const [loading, setLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    React.useEffect(() => {
        if (!step2Submitted || !applicationId) {
            setIsRedirecting(true);
            router.replace('/join-us/step-2');
        }
    }, [step2Submitted, applicationId, router]);


    // Helper functions for parsing initial booleans
    const getBoolOrEmpty = (val: boolean | null | undefined) => val === true ? 'yes' : val === false ? 'no' : '';

    const initQs = step3Data?.application_questions || {};
    const initLegal = step3Data?.legal_and_safety || {};
    const initPerms = step3Data?.permissions || {};

    const [isInternship, setIsInternship] = useState<'yes' | 'no' | ''>(getBoolOrEmpty(initQs.looking_for_internship));
    const [hoursAvailable, setHoursAvailable] = useState(initQs.hours_per_week || '');
    const [startDate, setStartDate] = useState(initQs.available_start_date || '');

    const [qMelodyWings, setQMelodyWings] = useState(initQs.interest_in_melodywings || '');
    const [qRole, setQRole] = useState(initQs.interest_in_selected_role || '');
    const [qExp, setQExp] = useState(initQs.relevant_experience || '');
    const [qSkills, setQSkills] = useState(initQs.skills_for_role || '');
    const [qChildren, setQChildren] = useState(initQs.children_or_neurodivergent_experience || '');
    const [qAdditional, setQAdditional] = useState(initQs.additional_information || '');

    const initCrim = initLegal.criminal_background || {};
    const [criminalCheck1, setCriminalCheck1] = useState<'yes' | 'no' | ''>(getBoolOrEmpty(initCrim.convicted_of_felony_or_misdemeanor));
    const [criminalCheck2, setCriminalCheck2] = useState<'yes' | 'no' | ''>(getBoolOrEmpty(initCrim.involved_in_criminal_activity));
    const [criminalCheck3, setCriminalCheck3] = useState<'yes' | 'no' | ''>(getBoolOrEmpty(initCrim.convicted_of_crimes_involving_minors));
    const [crimDetails, setCrimDetails] = useState(initCrim.details_if_yes || '');

    const initSex = initLegal.sex_offender_registry_check || {};
    const [sexOffenderCheck, setSexOffenderCheck] = useState<'yes' | 'no' | ''>(getBoolOrEmpty(initSex.listed_on_sex_offender_registry));
    const [sexDetails, setSexDetails] = useState(initSex.details_if_yes || '');

    const initDisc = initLegal.disciplinary_history || {};
    const [disciplinary1, setDisciplinary1] = useState<'yes' | 'no' | ''>(getBoolOrEmpty(initDisc.terminated_for_misconduct));
    const [disciplinary2, setDisciplinary2] = useState<'yes' | 'no' | ''>(getBoolOrEmpty(initDisc.dispute_related_to_safety_or_ethics));
    const [disciplinary3, setDisciplinary3] = useState<'yes' | 'no' | ''>(getBoolOrEmpty(initDisc.academic_or_professional_disciplinary_action));
    const [discDetails, setDiscDetails] = useState(initDisc.details_if_yes || '');

    const initHealth = initLegal.health_and_safety || {};
    const [healthCheck, setHealthCheck] = useState<'yes' | 'no' | ''>(getBoolOrEmpty(initHealth.condition_affecting_volunteer_duties));
    const [healthDetails, setHealthDetails] = useState(initHealth.details_if_yes || '');

    const initConsent = initPerms.consents || {};
    const [consent1, setConsent1] = useState<'yes' | 'no' | ''>(getBoolOrEmpty(initConsent.agree_child_abuse_and_registry_checks));
    const [consent2, setConsent2] = useState<'yes' | 'no' | ''>(getBoolOrEmpty(initConsent.agree_confidentiality_behavior_safeguarding_policies));
    const [consent3, setConsent3] = useState<'yes' | 'no' | ''>(getBoolOrEmpty(initConsent.understand_role_termination_if_policy_breach_or_criminal_activity));
    const [consentDetails, setConsentDetails] = useState(initConsent.details_if_no || '');

    const initPrevVol = initLegal.previous_volunteer_experience || {};
    const [previousVolunteer, setPreviousVolunteer] = useState<'yes' | 'no' | ''>(getBoolOrEmpty(initPrevVol.involved_in_incidents_or_complaints));
    const [prevVolDetails, setPrevVolDetails] = useState(initPrevVol.details_if_yes || '');

    const initConsentPerms = initPerms.consent_and_permissions || {};
    const [photoConsent, setPhotoConsent] = useState<'yes' | 'no' | ''>(getBoolOrEmpty(initConsentPerms.photo_or_video_consent));
    const [termsAccepted, setTermsAccepted] = useState(initConsentPerms.acknowledgement_of_program_policies === true);

    // Description fields are required only when the matching yes/no selection triggers it.
    const requiresCrimDetails = criminalCheck1 === 'yes' || criminalCheck2 === 'yes' || criminalCheck3 === 'yes';
    const requiresSexDetails = sexOffenderCheck === 'yes';
    const requiresDiscDetails = disciplinary1 === 'yes' || disciplinary2 === 'yes' || disciplinary3 === 'yes';
    const requiresHealthDetails = healthCheck === 'yes';
    const requiresConsentDetails = consent1 === 'no' || consent2 === 'no' || consent3 === 'no';
    const requiresPrevVolDetails = previousVolunteer === 'yes';

    const isNextEnabled =
        !loading &&
        !!isInternship &&
        !!hoursAvailable.trim() &&
        !!startDate.trim() &&
        !!qMelodyWings.trim() &&
        !!qRole.trim() &&
        !!qExp.trim() &&
        !!qSkills.trim() &&
        !!criminalCheck1 &&
        !!criminalCheck2 &&
        !!criminalCheck3 &&
        !!sexOffenderCheck &&
        !!disciplinary1 &&
        !!disciplinary2 &&
        !!disciplinary3 &&
        !!healthCheck &&
        !!consent1 &&
        !!consent2 &&
        !!consent3 &&
        !!previousVolunteer &&
        !!photoConsent &&
        termsAccepted &&
        (!requiresCrimDetails || !!crimDetails.trim()) &&
        (!requiresSexDetails || !!sexDetails.trim()) &&
        (!requiresDiscDetails || !!discDetails.trim()) &&
        (!requiresHealthDetails || !!healthDetails.trim()) &&
        (!requiresConsentDetails || !!consentDetails.trim()) &&
        (!requiresPrevVolDetails || !!prevVolDetails.trim());

    if (isRedirecting) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!applicationId) {
            showToast({ type: 'error', message: 'Application ID missing. Please start from Step 1.' });
            router.push('/join-us/step-1');
            return;
        }

        if (!termsAccepted) {
            showToast({ type: 'error', message: 'Please accept the Terms of Service to continue.' });
            return;
        }

        if (requiresCrimDetails && !crimDetails.trim()) {
            showToast({ type: 'error', message: 'Please describe the circumstance for the criminal background check.' });
            return;
        }

        if (requiresSexDetails && !sexDetails.trim()) {
            showToast({ type: 'error', message: 'Please describe the circumstance for the sex offender registry check.' });
            return;
        }

        if (requiresDiscDetails && !discDetails.trim()) {
            showToast({ type: 'error', message: 'Please describe the circumstance for the disciplinary history.' });
            return;
        }

        if (requiresHealthDetails && !healthDetails.trim()) {
            showToast({ type: 'error', message: 'Please describe the circumstance for the health and safety question.' });
            return;
        }

        if (requiresConsentDetails && !consentDetails.trim()) {
            showToast({ type: 'error', message: 'Please describe the circumstance for the consent (No answers).' });
            return;
        }

        if (requiresPrevVolDetails && !prevVolDetails.trim()) {
            showToast({ type: 'error', message: 'Please describe the circumstance for your previous volunteer experience.' });
            return;
        }

        const payload = {
            application_id: applicationId,
            application_questions: {
                looking_for_internship: isInternship === 'yes',
                interest_in_melodywings: qMelodyWings || null,
                interest_in_selected_role: qRole || null,
                relevant_experience: qExp || null,
                skills_for_role: qSkills || null,
                hours_per_week: hoursAvailable || "Not Provided", // Making it a string as per swagger Schema, required
                available_start_date: startDate || null,
                children_or_neurodivergent_experience: qChildren || null,
                additional_information: qAdditional || null
            },
            legal_and_safety: {
                criminal_background_check: {
                    convicted_of_felony_or_misdemeanor: criminalCheck1 === 'yes',
                    involved_in_criminal_activity: criminalCheck2 === 'yes',
                    convicted_of_crimes_involving_minors: criminalCheck3 === 'yes',
                    details_if_yes: crimDetails || null
                },
                sex_offender_registry_check: {
                    listed_on_sex_offender_registry: sexOffenderCheck === 'yes',
                    details_if_yes: sexDetails || null
                },
                disciplinary_history: {
                    terminated_for_misconduct: disciplinary1 === 'yes',
                    dispute_related_to_safety_or_ethics: disciplinary2 === 'yes',
                    academic_or_professional_disciplinary_action: disciplinary3 === 'yes',
                    details_if_yes: discDetails || null
                },
                health_and_safety: {
                    condition_affecting_volunteer_duties: healthCheck === 'yes',
                    details_if_yes: healthDetails || null
                },
                previous_volunteer_experience: {
                    involved_in_incidents_or_complaints: previousVolunteer === 'yes',
                    details_if_yes: prevVolDetails || null
                },
                consents: {
                    agree_child_abuse_and_registry_checks: consent1 === 'yes',
                    agree_confidentiality_behavior_safeguarding_policies: consent2 === 'yes',
                    understand_role_termination_if_policy_breach_or_criminal_activity: consent3 === 'yes',
                    details_if_no: consentDetails || null
                }
            },
            permissions: {
                photo_video_consent: photoConsent === 'yes' ? 'yes' : 'no',
                terms_accepted: termsAccepted
            }
        };

        setLoading(true);
        try {
            if (!step3Submitted) {
                await submitStep3(payload);
                setStep3Submitted(true);
            } else {
                await updateStep3(applicationId, payload);
            }

            setStep3Data(payload);
            showToast({ type: 'success', message: 'Application submitted successfully!' });

            router.push('/join-us/success');
        } catch (err: any) {
            showToast({ type: 'error', message: err?.message || 'Failed to submit application' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-input flex flex-col items-center">
            {/* Title section */}
            <section className="w-full flex flex-col items-center justify-center pt-10 md:pt-16">
                <div className="max-w-5xl flex flex-col gap-[12px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-[20px] md:text-[32px] font-medium text-gray-900">
                        We&apos;re excited that you want to join us! 😊
                    </h1>
                    <p className="text-[16px] md:text-[20px] text-[#121212] italic">
                        Fill in the details below so we can get to know you better. Once submitted, our team will
                        review your information and get in touch with you soon.
                    </p>
                </div>
            </section>

            {/* Form card */}
            <main className="w-full flex-1 flex justify-center py-8 md:py-12 lg:py-16">
                <div className="w-full md:max-w-5xl md:mx-auto md:px-8">
                    <form
                        className="bg-white md:rounded-[24px] shadow-sm px-4 sm:px-6 md:px-10 lg:px-12 py-6 md:py-8 lg:py-10 space-y-10 w-full min-w-0"
                        onSubmit={handleSubmit}
                    >
                        {/* Application Questions */}
                        <section className="space-y-5">
                            <h2 className="md:text-[24px] text-[20px] font-medium text-gray-900">
                                Application Questions
                            </h2>

                            <div className="space-y-2">
                                <p className="text-[16px] md:text-sm font-normal text-gray-800">
                                    Are you looking for an internship opportunity?
                                </p>
                                <RadioInput
                                    inputType="radio"
                                    name="internship_opportunity"
                                    value={isInternship}
                                    onChange={(value) => setIsInternship(value as '' | 'yes' | 'no')}
                                    options={[
                                        { value: 'yes', label: 'Yes' },
                                        { value: 'no', label: 'No' },
                                    ]}
                                    inputClassName="mt-1"
                                />
                            </div>

                            <div className="space-y-4 md:space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[16px] md:text-sm font-normal text-gray-800">Why are you interested in this opportunity with MelodyWings?</label>
                                    <textarea rows={4} className="w-full min-w-0 rounded-2xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0 focus:border-gray-900 box-border" placeholder="Describe here" value={qMelodyWings} onChange={(e) => setQMelodyWings(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[16px] md:text-sm font-normal text-gray-800">Why are you interested in the role you selected?</label>
                                    <textarea rows={4} className="w-full min-w-0 rounded-2xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0 focus:border-gray-900 box-border" placeholder="Describe here" value={qRole} onChange={(e) => setQRole(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[16px] md:text-sm font-normal text-gray-800">What relevant experience do you have for this role?</label>
                                    <textarea rows={4} className="w-full min-w-0 rounded-2xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0 focus:border-gray-900 box-border" placeholder="Clubs, volunteer work, internships, school projects, etc." value={qExp} onChange={(e) => setQExp(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[16px] md:text-sm font-normal text-gray-800">What skills would you bring to this role?</label>
                                    <textarea rows={4} className="w-full min-w-0 rounded-2xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0 focus:border-gray-900 box-border" placeholder="Describe here" value={qSkills} onChange={(e) => setQSkills(e.target.value)} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0">
                                    <div className="space-y-2 w-full min-w-0">
                                        <label className="text-[16px] font-normal text-gray-800">
                                            How many hours per week are you available?
                                        </label>

                                        <input
                                            type="text"
                                            required
                                            className="w-full min-w-0 rounded-xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0 focus:border-gray-900 box-border"
                                            placeholder="Enter here"
                                            value={hoursAvailable}
                                            onChange={(e) => setHoursAvailable(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2 w-full min-w-0">
                                        <label className="text-[16px] md:text-sm font-normal text-gray-800">
                                            When would you be available to start?
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full min-w-0 rounded-xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0 focus:border-gray-900 box-border"
                                            placeholder="Enter here"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 w-full min-w-0">
                                    <label className="text-[16px] md:text-sm font-normal text-gray-800">
                                        Have you previously volunteered or worked with children or neurodivergent learners? If yes, please describe.
                                    </label>
                                    <textarea rows={4} className="w-full min-w-0 rounded-2xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0 focus:border-gray-900 box-border" placeholder="Describe here" value={qChildren} onChange={(e) => setQChildren(e.target.value)} />
                                </div>

                                <div className="space-y-2 w-full min-w-0">
                                    <label className="text-[16px] md:text-sm font-normal text-gray-800">
                                        Is there anything else you would like us to know about you?
                                    </label>
                                    <textarea rows={4} className="w-full min-w-0 rounded-2xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0 focus:border-gray-900 box-border" placeholder="Describe here" value={qAdditional} onChange={(e) => setQAdditional(e.target.value)} />
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-200" />

                        {/* Legal and Safety Information */}
                        <section className="space-y-6">
                            <h2 className="text-[24px]  font-medium text-gray-900">
                                Legal and Safety Information
                            </h2>

                            <div className="rounded-3xl md:border border-gray-200 md:px-6 py-4 md:py-5 space-y-4">
                                <p className="text-[20px] font-medium text-gray-900">1. Criminal Background Check</p>

                                <div className="space-y-2">
                                    <p className="text-[16px] md:text-sm text-gray-800">Have you ever been convicted of a felony or misdemeanor?</p>
                                    <RadioInput name="criminal_1" value={criminalCheck1} onChange={(v) => setCriminalCheck1(v as '' | 'yes' | 'no')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} inputClassName="mt-1" inputType="radio" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[16px] md:text-sm text-gray-800">Have you ever been involved in any criminal activity or legal proceedings, including pending charges or arrests?</p>
                                    <RadioInput name="criminal_2" value={criminalCheck2} onChange={(v) => setCriminalCheck2(v as '' | 'yes' | 'no')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} inputClassName="mt-1" inputType="radio" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[16px] md:text-sm text-gray-800">Have you been convicted of any crimes involving minors, abuse, or neglect?</p>
                                    <RadioInput name="criminal_3" value={criminalCheck3} onChange={(v) => setCriminalCheck3(v as '' | 'yes' | 'no')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} inputClassName="mt-1" inputType="radio" />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[16px] text-gray-800">Please describe the circumstance behind the &quot;yes&quot; answer above.</p>
                                    <textarea
                                        rows={3}
                                        disabled={!requiresCrimDetails}
                                        className={`w-full min-w-0 rounded-2xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0 focus:border-gray-900 box-border ${!requiresCrimDetails ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        placeholder="Describe here"
                                        value={crimDetails}
                                        onChange={(e) => setCrimDetails(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rounded-3xl md:border border-gray-200 md:px-6 py-4 md:py-5 space-y-4">
                                <p className="text-[20px] font-medium text-gray-900">2. Sex Offender Registry Check</p>
                                <div className="space-y-2">
                                    <p className="text-[16px] text-gray-800">Are you listed on any_state or national sex offender registries?</p>
                                    <RadioInput inputType="radio" name="sex_offender" value={sexOffenderCheck} onChange={(v) => setSexOffenderCheck(v as '' | 'yes' | 'no')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} inputClassName="mt-1" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[16px] text-gray-800">Please describe the circumstance behind the &quot;yes&quot; answer above.</p>
                                    <textarea
                                        rows={3}
                                        disabled={!requiresSexDetails}
                                        className={`w-full min-w-0 rounded-2xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0 focus:border-gray-900 box-border ${!requiresSexDetails ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        placeholder="Describe here"
                                        value={sexDetails}
                                        onChange={(e) => setSexDetails(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rounded-3xl md:border border-gray-200 md:px-6 py-4 md:py-5 space-y-4">
                                <p className="text-[20px] font-medium text-gray-900">3. Disciplinary History</p>

                                <div className="space-y-2">
                                    <p className="text-[16px] md:text-sm text-gray-800">Have you ever been terminated or asked to resign from a volunteer or employment position for reasons related to misconduct or inappropriate behavior?</p>
                                    <RadioInput name="disc_1" value={disciplinary1} onChange={(v) => setDisciplinary1(v as '' | 'yes' | 'no')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} inputClassName="mt-1" inputType="radio" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[16px] text-gray-800">Have you ever been involved in any_disputes with employers or organizations related to safety or ethical issues?</p>
                                    <RadioInput name="disc_2" value={disciplinary2} onChange={(v) => setDisciplinary2(v as '' | 'yes' | 'no')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} inputClassName="mt-1" inputType="radio" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[16px] md:text-sm text-gray-800">Have you ever faced dismissal, suspension, probation, or any other disciplinary or academic action from a college, university, or professional school?</p>
                                    <RadioInput name="disc_3" value={disciplinary3} onChange={(v) => setDisciplinary3(v as '' | 'yes' | 'no')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} inputClassName="mt-1" inputType="radio" />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[16px] text-gray-800">Please describe the circumstance behind the &quot;yes&quot; answer above.</p>
                                    <textarea
                                        rows={3}
                                        disabled={!requiresDiscDetails}
                                        className={`w-full min-w-0 rounded-2xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0 focus:border-gray-900 box-border ${!requiresDiscDetails ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        placeholder="Describe here"
                                        value={discDetails}
                                        onChange={(e) => setDiscDetails(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rounded-3xl md:border border-gray-200 md:px-6 py-4 md:py-5 space-y-4">
                                <p className="text-[20px] font-medium text-gray-900">4. Health and Safety Information</p>
                                <div className="space-y-2">
                                    <p className="text-[16px] md:text-sm text-gray-800">Do you have any physical or mental health conditions that may affect your ability to perform volunteer duties?</p>
                                    <RadioInput inputType="radio" name="health_safety" value={healthCheck} onChange={(v) => setHealthCheck(v as '' | 'yes' | 'no')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} inputClassName="mt-1" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[16px] text-gray-800">Please describe the circumstance behind the &quot;yes&quot; answer above.</p>
                                    <textarea
                                        rows={3}
                                        disabled={!requiresHealthDetails}
                                        className={`w-full min-w-0 rounded-2xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0 focus:border-gray-900 box-border ${!requiresHealthDetails ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        placeholder="Describe here"
                                        value={healthDetails}
                                        onChange={(e) => setHealthDetails(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rounded-3xl md:border border-gray-200 md:px-6 py-4 md:py-5 space-y-4">
                                <p className="text-[20px] font-medium text-gray-900">5. Consents</p>
                                <div className="space-y-2">
                                    <p className="text-[16px] text-gray-800">Do you consent to do child abuse registry and sex offender checks if needed?</p>
                                    <RadioInput name="consent_1" value={consent1} onChange={(v) => setConsent1(v as '' | 'yes' | 'no')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} inputClassName="mt-1" inputType="radio" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[16px] text-gray-800">Do you agree to follow the organization&apos;s policies on confidentiality, behavior, and safeguarding procedures?</p>
                                    <RadioInput name="consent_2" value={consent2} onChange={(v) => setConsent2(v as '' | 'yes' | 'no')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} inputClassName="mt-1" inputType="radio" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[16px] text-gray-800">Do you understand that your volunteer role may be terminated based on any criminal activity or failure to adhere to the organization&apos;s policies?</p>
                                    <RadioInput name="consent_3" value={consent3} onChange={(v) => setConsent3(v as '' | 'yes' | 'no')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} inputClassName="mt-1" inputType="radio" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[16px] text-gray-800">Please describe the circumstance behind the &quot;No&quot; answer above.</p>
                                    <textarea
                                        rows={3}
                                        disabled={!requiresConsentDetails}
                                        className={`w-full min-w-0 rounded-2xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0 focus:border-gray-900 box-border ${!requiresConsentDetails ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        placeholder="Describe here"
                                        value={consentDetails}
                                        onChange={(e) => setConsentDetails(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rounded-3xl md:border border-gray-200 md:px-6 py-4 md:py-5 space-y-4">
                                <p className="text-[20px] font-medium text-gray-900">6. Previous Volunteer Experience</p>
                                <div className="space-y-2">
                                    <p className="text-[16px] text-gray-800">Have you ever been involved in any incidents or complaints during previous volunteer roles?</p>
                                    <RadioInput inputType="radio" name="previous_volunteer" value={previousVolunteer} onChange={(v) => setPreviousVolunteer(v as '' | 'yes' | 'no')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} inputClassName="mt-1" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[16px] text-gray-800">Please describe the circumstance behind the &quot;yes&quot; answer above.</p>
                                    <textarea
                                        rows={3}
                                        disabled={!requiresPrevVolDetails}
                                        className={`w-full min-w-0 rounded-2xl border border-gray-200 bg-background-input px-3 py-2.5 text-sm focus:outline-none focus:ring-0 focus:border-gray-900 box-border ${!requiresPrevVolDetails ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        placeholder="Mention here"
                                        value={prevVolDetails}
                                        onChange={(e) => setPrevVolDetails(e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-[24px] font-medium text-gray-900">Consent and Permissions</h2>
                            <div className="space-y-2">
                                <p className="text-[16px] md:text-sm font-normal text-gray-800">Photo/Video Consent</p>
                                <p className="text-xs md:text-sm text-gray-600">(for use in program materials or promotional content)</p>
                                <RadioInput inputType="radio" name="photo_consent" value={photoConsent} onChange={(v) => setPhotoConsent(v as '' | 'yes' | 'no')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} inputClassName="mt-1" />
                            </div>

                            <div className="mt-4 flex flex-col items-start gap-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        className="h-5 w-4 !rounded border-gray-300 text-black focus:ring-0 focus:ring-offset-0"
                                    />
                                    <p className="text-[16px] font-normal text-gray-800">
                                        I consent to MW collecting, using and/or sharing my personal information as mentioned in the <Link href="/privacy-policy" target="_blank" className="underline font-semibold text-[#121212]">Privacy Policy</Link>.
                                    </p>
                                </div>

                                <p className="text-[16px] font-normal text-gray-800">By accepting the <Link href="/terms-and-conditions" target="_blank" className="underline font-semibold text-[#121212]">Terms of Service</Link>, either by clicking a box indicating your acceptance or by using and navigating through our platform through our website, you agree that (a) you have read and understood the agreement; (b) you represent that you are at least 18 years old; (c) you can form a binding contract; and (d) you accept this agreement and agree that you are legally bound by its terms. Individuals under the age of 18 or those with mental developmental disabilities of any age may access the services only when accompanied by a parent or legal guardian. Parents or guardians accompanying such users, by accepting the <Link href="/terms-and-conditions" target="_blank" className="underline font-semibold text-[#121212]">Terms of Service</Link>, either by clicking a box indicating your acceptance or by using and navigating through our platform through our website, (a) you have read and understood the agreement; (b) you represent that you are the parent or legal guardian of such individual (c) your acceptance of these terms on behalf of the individual will form a binding contract; and (d) you accept this agreement on behalf of the individual and agree that the individual is legally bound by its terms&quot;</p>
                            </div>
                        </section>

                        <div className="mt-4 flex justify-between items-center">
                            <Button type="button" title="Previous" btnVariant="outline" customClassName="!px-6 !py-2 !h-10 md:!h-11 !rounded-[10px] disabled:opacity-50" onClick={() => router.push('/join-us/step-2')} disabled={loading} />
                            <Button htmlType="submit" title={loading ? "Submitting..." : "Submit Application"} loading={loading} disabled={!isNextEnabled} btnVariant="secondary" customClassName="!px-6 !py-2 !rounded-[10px] !h-10 md:!h-11 disabled:opacity-50" />
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default JoinUsStep3Page;