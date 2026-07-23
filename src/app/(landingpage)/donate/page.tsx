"use client";

import DonateCard from "@/components/common/DonateCard";
import React, { useEffect, useRef, useState } from "react";
import { donateCardData } from "@/constants/landingPage";
import RadioInput from "@/components/common/Input/RadioButton";
import { Input } from "@/components/common/Input";
import Button from "@/components/common/Button";
import Accordian from "@/components/landingpage/components/Accordian";
import { useCountryOptions, useStateOptions } from "@/hooks/useCountriesAndStates";
import { getDonationAmountPresets, getDedicationOptions, getFundDestinations, getHowDidYouHearOptions } from "@/api/donation";
import { getDonorWall } from "@/api/donation";
import { getDonationFaqs } from "@/api/donation";
import { getNameVisibilityOptions } from "@/api/donation";
import { createCheckoutSession } from "@/api/donation";
import { COUNTRY_CODE_OPTIONS } from "@/utils/countryDialCodes";
import { cn } from "@/utils/merge-class";
import { Input as AntInput } from "antd";
import { showToast } from "@/components/common/Toast";
import "./donate.css";
import { HeartDivider, NonProfit, SecureDonation, TaxDeductive } from "@/assets/icons";
// Donor wall UI data (fetched)
type DonorHighlight = { name: string; amount: string };
type LeaderboardRow = { rank: number; name: string; amount: string };
type FaqItem = { key: string; label: string; content: string };

const sectionBox =
    "md:rounded-[40px] md:border-b md:border border-gray-200   py-5 md:px-10 md:py-6 space-y-4";

/** Field labels: 16px, regular weight, #121212 */
const DONATE_LABEL_CLASS =
    "!text-base !font-normal !text-[#121212] [&_.inner-label]:!text-base [&_.inner-label]:!font-normal";

/** Checkbox rows: same fill as other inputs */
const DONATE_CHECKBOX_ROW_CLASS = "rounded-xl border border-gray-200 bg-background-input px-4 py-3";
const PAGE_GUTTER_CLASS = "w-full px-5 md:w-[70%] md:px-0 md:mx-auto";

const Donate = () => {
    const [donateAmount, setDonateAmount] = useState("");
    const [isCustom, setIsCustom] = useState(false);
    const [customAmount, setCustomAmount] = useState("");

    const [nameVisibility, setNameVisibility] = useState<"" | "full" | "first_only" | "anonymous">(
        ""
    );
    const [donorWall, setDonorWall] = useState(true);
    const [coverFees, setCoverFees] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneCountryCode, setPhoneCountryCode] = useState<string | number>("+1");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [city, setCity] = useState("");
    const [zip, setZip] = useState("");

    const [country, setCountry] = useState<string | number>("");
    const [state, setState] = useState<string | number>("");
    const { countryOptions, countriesLoading } = useCountryOptions();
    const { stateOptions, statesLoading } = useStateOptions(country);

    const [dedication, setDedication] = useState<string | number>("none");
    const [fundDesignation, setFundDesignation] = useState<string | number>("general-fund");
    const [fundOtherDetail, setFundOtherDetail] = useState("");
    const [message, setMessage] = useState("");
    const [hearAbout, setHearAbout] = useState<string | number>("");
    const [dedicationName, setDedicationName] = useState("");
    const [dedicationOptions, setDedicationOptions] = useState<
        { label: string; value: string }[]
    >([]);
    const [fundOptions, setFundOptions] = useState<{ label: string; value: string }[]>([]);
    const [hearAboutOptions, setHearAboutOptions] = useState<
        { label: string; value: string }[]
    >([]);
    const [nameVisibilityOptions, setNameVisibilityOptions] = useState<
        { label: string; value: string; sublabel?: string }[]
    >([]);
    const [donorHighlights, setDonorHighlights] = useState<DonorHighlight[]>([]);
    const [leaderboardRows, setLeaderboardRows] = useState<LeaderboardRow[]>([]);
    const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
    const [amountError, setAmountError] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mobile-only carousel state for "How Your Donation Helps" cards.
    const [topCardsIndex, setTopCardsIndex] = useState(0);
    const topCardsCarouselRef = useRef<HTMLDivElement | null>(null);

    const handleTopCardsScroll = () => {
        const el = topCardsCarouselRef.current;
        if (!el) return;

        const children = Array.from(el.children) as HTMLElement[];
        if (children.length === 0) return;

        const firstLeft = children[0].offsetLeft;
        const step =
            children.length > 1 ? children[1].offsetLeft - firstLeft : children[0].offsetWidth;
        if (!step) return;

        const idx = Math.round((el.scrollLeft - firstLeft) / step);
        setTopCardsIndex(Math.max(0, Math.min(idx, children.length - 1)));
    };

    // FAQs
    useEffect(() => {
        getDonationFaqs()
            .then((res: unknown) => {
                const root = (res as any)?.data ?? res;

                // Accept multiple shapes:
                // - { data: { faqs: [...] } } | { faqs: [...] } | { data: [...] } | [...]
                // - faqs as object map: { "Question": "Answer", ... }
                let raw: any = [];
                if (Array.isArray((root as any)?.faqs)) raw = (root as any).faqs;
                else if (Array.isArray((root as any)?.data?.faqs)) raw = (root as any).data.faqs;
                else if (Array.isArray((root as any)?.data)) raw = (root as any).data;
                else if (Array.isArray(root)) raw = root;
                else if ((root as any)?.faqs && typeof (root as any).faqs === "object") {
                    raw = Object.entries((root as any).faqs).map(([q, a]) => ({ question: q, answer: a }));
                } else if ((root as any)?.data?.faqs && typeof (root as any).data.faqs === "object") {
                    raw = Object.entries((root as any).data.faqs).map(([q, a]) => ({ question: q, answer: a }));
                }

                if (!Array.isArray(raw)) return;

                const mapped = raw
                    .map((item: any, i: number) => {
                        if (item && typeof item === "object") {
                            const q = item.question ?? item.title ?? `FAQ ${i + 1}`;
                            const a = item.answer ?? item.content ?? item.value ?? "";
                            return { key: String(i + 1), label: String(q), content: String(a) };
                        }
                        return { key: String(i + 1), label: `FAQ ${i + 1}`, content: String(item ?? "") };
                    })
                    .filter((x: any) => x.content && String(x.content).trim().length > 0);
                if (mapped.length) setFaqItems(mapped as FaqItem[]);
            })
            .catch((e) => console.error("Failed to load FAQs", e));
    }, []);

    // Donor wall
    useEffect(() => {
        getDonorWall()
            .then((res: unknown) => {
                const data = (res as any)?.data ?? res;
                // Support {success, data:{donors:[...]}} or {donors:[...]} or plain array
                const root = data as any;
                const donors = (
                    Array.isArray(root?.donors)
                        ? root.donors
                        : Array.isArray(root?.data?.donors)
                        ? root.data.donors
                        : Array.isArray(root)
                        ? root
                        : []
                ) as Array<{
                    display_name?: string;
                    total_amount?: number;
                    fund_destination?: string;
                }>;
                if (!Array.isArray(donors)) return;

                const fmt = (n: number) =>
                    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                        Number.isFinite(n) ? n : 0
                    );

                const sorted = [...donors].sort((a, b) => (b.total_amount ?? 0) - (a.total_amount ?? 0));
                setDonorHighlights(
                    sorted.slice(0, 3).map((d) => ({
                        name: d.display_name || "Anonymous",
                        amount: fmt(d.total_amount ?? 0),
                    }))
                );
                setLeaderboardRows(
                    sorted.slice(3, 10).map((d, i) => ({
                        rank: i + 4,
                        name: d.display_name || "Anonymous",
                        amount: fmt(d.total_amount ?? 0),
                    }))
                );
            })
            .catch((e) => console.error("Failed to load donor wall", e));
    }, []);
    useEffect(() => {
        getNameVisibilityOptions()
            .then((res: unknown) => {
                const data = (res as { data?: unknown })?.data ?? res;
                const list = (Array.isArray(data) ? data : (data as any)?.data) as string[] | undefined;
                if (!Array.isArray(list)) return;

                const sublabelByValue: Record<"full" | "first_only" | "anonymous", string> = {
                    full: "Your name will be visible to the public.",
                    first_only: "Only your first name will be shown.",
                    anonymous: "Your donation will remain private.",
                };
                const normalize = (s: string): "full" | "first_only" | "anonymous" => {
                    const l = s.toLowerCase();
                    if (l.includes("first")) return "first_only";
                    if (l.includes("anonymous")) return "anonymous";
                    return "full";
                };

                // Map unique values in order received
                const options = Array.from(
                    new Map(
                        list.map((label) => {
                            const value = normalize(label);
                            return [
                                value,
                                { label, value, sublabel: sublabelByValue[value] },
                            ] as const;
                        })
                    ).values()
                );

                setNameVisibilityOptions(options);
                if (!nameVisibility && options[0]) setNameVisibility(options[0].value);
            })
            .catch((e) => console.error("Failed to load name visibility options", e));
    }, []);


    const handleDonateAmount = (value: string | number) => {
        const v = String(value);
        setDonateAmount(v);
        setIsCustom(v === "custom");
        setAmountError("");
    };

    const [amountOptions, setAmountOptions] = useState<
        { label: string; value: string }[]
    >([]);

    useEffect(() => {
        getDonationAmountPresets()
            .then((res: unknown) => {
                const data = (res as { data?: unknown })?.data ?? res;
                const list = (Array.isArray(data) ? data : (data as any)?.data) as (string | number)[] | undefined;
                if (!Array.isArray(list)) return;

                const options = Array.from(
                    new Map(
                        list
                            .map((it) => String(it).trim())
                            .filter(Boolean)
                            .filter((s) => !/^(other|custom)$/i.test(s.toLowerCase()))
                            .map((s) => {
                                const value = s.replace(/[^\d]/g, "");
                                if (!value) return null;
                                const label = s.startsWith("$") ? s : `$${value}`;
                                return [value, { label, value }] as const;
                            })
                            .filter(Boolean) as Iterable<readonly [string, { label: string; value: string }]>
                    ).values()
                ).sort((a, b) => Number(a.value) - Number(b.value));

                options.push({ label: "Custom", value: "custom" });
                setAmountOptions(options);
            })
            .catch((e) => console.error("Failed to load amount presets", e));
    }, []);

    useEffect(() => {
        getDedicationOptions()
            .then((res: unknown) => {
                const data = (res as { data?: unknown })?.data ?? res;
                const list = (Array.isArray(data) ? data : (data as any)?.data) as string[] | undefined;
                if (!Array.isArray(list)) return;

                const normalize = (s: string) => {
                    const l = s.toLowerCase();
                    if (l.includes("honor")) return "honor";
                    if (l.includes("memory")) return "memory";
                    return "none";
                };

                const options = Array.from(
                    new Map(
                        list
                            .map((label) => [normalize(label), { label, value: normalize(label) }] as const)
                    ).values()
                );
                setDedicationOptions(options);
            })
            .catch((e) => console.error("Failed to load dedication options", e));
    }, []);

    useEffect(() => {
        getFundDestinations()
            .then((res: unknown) => {
                const data = (res as { data?: unknown })?.data ?? res;
                const list = (Array.isArray(data) ? data : (data as any)?.data) as string[] | undefined;
                if (!Array.isArray(list)) return;

                const slug = (s: string) =>
                    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

                const options = Array.from(
                    new Map(list.map((label) => [slug(label), { label, value: slug(label) }] as const)).values()
                );
                // Ensure "Other" is always available in this dropdown.
                if (!options.some((o) => o.value === "other")) {
                    options.push({ label: "Other", value: "other" });
                }
                setFundOptions(options);

                if (!options.find((o) => o.value === String(fundDesignation))) {
                    const general = options.find((o) => o.value === "general-fund");
                    setFundDesignation(general ? general.value : options[0]?.value ?? "other");
                }
            })
            .catch((e) => console.error("Failed to load fund destinations", e));
    }, []);

    const handleDonateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        const successUrl =
            typeof window !== "undefined" ? `${window.location.origin}/donate/success` : "";
        const cancelUrl =
            typeof window !== "undefined" ? `${window.location.origin}/donate` : "";

        // Resolve amount
        const amountNumber = Number(isCustom ? customAmount : donateAmount || 0);
        if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
            setAmountError("Please select an amount");
            showToast({ type: "error", message: "Please select an amount" });
            return;
        }

        // Basic required-field checks (personal details + billing address)
        const missing: string[] = [];
        if (!firstName) missing.push("First name");
        if (!lastName) missing.push("Last name");
        if (!email) missing.push("Email");
        if (!phoneNumber) missing.push("Phone number");
        if (!address1) missing.push("Address line 1");
        if (!city) missing.push("City");
        if (!state) missing.push("State / Region");
        if (!country) missing.push("Country");
        if (!zip) missing.push("ZIP / Postal Code");
        if (missing.length) {
            showToast({ type: "error", message: `Please fill required fields: ${missing.join(", ")}` });
            return;
        }

        // Map name visibility enum to API label
        const nameVisibilityLabel =
            nameVisibilityOptions.find((o) => o.value === nameVisibility)?.label ||
            "Show my full name";

        // Resolve fund destination label from selected value
        const fundDestinationLabel =
            fundOptions.find((o) => o.value === String(fundDesignation))?.label || "General Fund";
        const isFundOther = String(fundDesignation).toLowerCase() === "other";
        if (isFundOther && !fundOtherDetail.trim()) {
            showToast({ type: "error", message: "Please fill details for 'Other' fund designation" });
            return;
        }

        // Resolve dedication label
        const dedicationLabel =
            (dedication && dedicationOptions.find((o) => o.value === dedication)?.label) || "None";

        // Resolve how did you hear label
        const hearAboutLabel =
            hearAboutOptions.find((o) => o.value === String(hearAbout))?.label || "";

        const payload = {
            amount: amountNumber,
            cover_processing_fee: Boolean(coverFees),
            success_url: successUrl,
            cancel_url: cancelUrl,
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: `${phoneCountryCode ?? ""}${phoneNumber}`,
            address_line_1: address1,
            address_line_2: address2,
            city: city,
            state: state,
            zip_code: zip,
            country: String(country || ""),
            name_visibility: nameVisibilityLabel,
            show_on_donor_wall: Boolean(donorWall),
            fund_destination: isFundOther ? fundOtherDetail.trim() : fundDestinationLabel,
            dedication: dedicationLabel,
            dedication_name: dedication === "honor" || dedication === "memory" ? dedicationName : "",
            message: message,
            how_did_you_hear: hearAboutLabel || "Other",
            how_did_you_hear_other: "",
            amount_other_description: isCustom ? "Custom amount" : "",
        };

        setIsSubmitting(true);
        createCheckoutSession(payload)
            .then((res: any) => {
                const data = (res?.data as any) ?? res;
                const redirectUrl =
                    (data && (data.url || data.redirect_url)) ||
                    (data?.data && (data.data.url || data.data.redirect_url));
                if (redirectUrl && typeof window !== "undefined") {
                    window.location.href = redirectUrl as string;
                    return;
                }
                setIsSubmitting(false);
                showToast({ type: "error", message: "Unable to continue to checkout. Please try again." });
            })
            .catch((err) => {
                console.error("Failed to create checkout session", err);
                showToast({ type: "error", message: "Failed to process donation. Please try again." });
                setIsSubmitting(false);
            })
            .finally(() => {
                // Keep loader while redirecting to checkout page.
            });
    };

    useEffect(() => {
        getHowDidYouHearOptions()
            .then((res: unknown) => {
                const data = (res as { data?: unknown })?.data ?? res;
                const rawList: unknown = Array.isArray(data) ? data : (data as any)?.data;
                if (!Array.isArray(rawList)) return;

                const mapped = (rawList as string[]).reduce<
                    { label: string; value: string }[]
                >((acc, entry) => {
                    const label = String(entry).trim();
                    if (!label) return acc;
                    const value = label
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                    acc.push({ label, value });
                    return acc;
                }, []);

                const unique = new Map<string, { label: string; value: string }>();
                for (const m of mapped) if (!unique.has(m.value)) unique.set(m.value, m);
                const options = Array.from(unique.values());
                if (!options.some((o) => o.value === "other" || o.value === "others")) {
                    options.push({ label: "Others", value: "others" });
                }
                setHearAboutOptions(options);
            })
            .catch((e) => {
                console.error("Failed to load how-did-you-hear options", e);
            })
            .finally(() => {
                // placeholder for potential loading state
            });
    }, []);

    // Highlights are `sorted.slice(0, 3)`, so `donorHighlights.length >= 3` iff the API returned ≥3 contributors.
    const showWithGratitudeSection = donorHighlights.length >= 3;

    return (
        <div className="min-h-screen w-full bg-background-input flex flex-col donate-flow">
            <section className="w-full flex flex-col items-center justify-center pt-10 md:pt-16">
                <div className={`${PAGE_GUTTER_CLASS} flex flex-col gap-[20px] text-center`}>
                    <h1 className="text-[24px] md:text-[40px] font-medium tracking-tight text-[#121212]">
                        Support Our Mission
                    </h1>
                    <p className="text-[14px] md:text-[20px] font-regular md:font-medium text-[#4F4F4F] md:max-w-[1068px] md:leading-[28.2px] tracking-tight mx-auto">
                        At Melody Wings, we strive to provide opportunities for differently-abled
                        children to learn, grow, and unlock their potential. Your support helps us
                        sustain this mission and expand our reach to more learners in need.
                        Together, we can make a lasting impact.
                    </p>
                </div>
            </section>

            <section className={`${PAGE_GUTTER_CLASS} pt-10 md:pt-12`}>
                {/* Desktop/tablet */}
                <div className="hidden sm:grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(4,285px)] lg:justify-center gap-4 md:gap-6">
                    {donateCardData.map((item, index) => (
                        <DonateCard key={index} {...item} />
                    ))}
                </div>

                {/* Mobile carousel */}
                <div className="sm:hidden">
                    <div
                        ref={topCardsCarouselRef}
                        onScroll={handleTopCardsScroll}
						className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 no-scrollbar bleed-x"
                    >
                        {donateCardData.map((item, index) => (
                            <div
                                key={index}
								className="flex-[0_0_86%] snap-start first:pl-5 last:pr-5"
                                aria-label={item.title}
                            >
                                <DonateCard {...item} />
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-4">
                        {donateCardData.map((_, index) => (
                            <span
                                key={index}
                                className={`h-2 rounded-full transition-all ${
                                    index === topCardsIndex ? "w-2 bg-[#4F4F4F]" : "w-2 bg-[#D9D9D9]"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {showWithGratitudeSection && (
                <section className={`${PAGE_GUTTER_CLASS} pt-14 md:pt-20 pb-4`}>
                    <div className="flex flex-col items-center gap-[16px] text-center mb-6">
                        <HeartDivider />
                        <h2 className="text-[24px] md:text-[30px] font-medium md:font-semibold text-[#121212]">
                            With Gratitude
                        </h2>
                        <p className="text-[14px] text-[#4F4F4F] mx-auto leading-relaxed">
                            Honoring the generosity of our supporters whose contributions continue to
                            transform lives and build brighter futures.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-10">
                        {donorHighlights.map((row) => (
                            <div
                                key={row.name}
                                className="bg-white w-full h-auto md:h-[158px] rounded-[16px] border border-[#FECACA] p-4 md:p-8 flex flex-col items-center justify-center gap-2 md:gap-[10px] text-center shadow-[0_0_14px_rgba(239,68,68,0.22),0_0_28px_rgba(239,68,68,0.1)]"
                            >
                                <p className="text-[14px] md:text-[30px] font-semibold text-[#EF4444]">
                                    {row.amount}
                                </p>
                                <div className="h-px w-[80px] md:w-[180px] bg-[#FECACA] mt-0 md:mt-1" />
                                <p className="md:text-[18px] text-[12px] font-medium text-[#0A0A0A] w-[100px] md:w-auto px-2 md:px-3 block truncate md:overflow-visible md:whitespace-normal md:text-clip">
                                    {row.name}
                                </p>
                            </div>
                        ))}
                    </div>

                    <ul className="mt-6 md:mt-8 space-y-3">
                        {leaderboardRows.map((row) => (
                            <li
                                key={row.rank}
                                className="flex items-center gap-3 md:gap-4 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm"
                            >
                                <span className="text-sm text-gray-400 w-6 tabular-nums">
                                    {row.rank}
                                </span>
                                <span className="flex-1 min-w-0 truncate text-[12px] md:text-base text-gray-900 font-medium">
                                    {row.name}
                                </span>
                                <span className="text-[12px] md:text-base font-semibold text-[#EF4444] tabular-nums">
                                    {row.amount}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <p className="text-center text-[12px] text-[#4F4F4F] italic md:mt-8 mt-4 mx-auto">
                        Every contribution, regardless of size, makes a meaningful difference in the
                        lives we touch.
                    </p>
                </section>
            )}

            <main className="w-full flex-1 flex justify-center py-8 md:py-12 lg:py-16">
                <div className="w-full md:w-[70%] md:px-0 md:mx-auto">
                    <form
                        onSubmit={handleDonateSubmit}
                        className="bg-white md:rounded-[24px] md:shadow-sm px-5 sm:px-6 md:px-10 lg:px-12 py-6 md:py-8 lg:py-10 space-y-0 md:space-y-10 w-full min-w-0"
                    >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <h2 className="text-[20px] md:text-[24px] font-medium text-[#000000]">
                                Make a Difference Today
                            </h2>
                            <div className="flex flex-wrap gap-2 md:gap-3 text-xs md:text-[14px] text-[#4F4F4F]">
                                <span className="inline-flex items-center gap-1.5 md:px-3 py-1">
                                    <SecureDonation className="size-4 shrink-0" aria-hidden />
                                    Secure donation
                                </span>
                                <span className="inline-flex items-center gap-1.5 md:px-3 py-1">
                                    <TaxDeductive className="size-4 shrink-0" aria-hidden />
                                    Tax deductible
                                </span>
                                <span className="inline-flex items-center gap-1.5 md:px-3 py-1">
                                    <NonProfit className="size-4 shrink-0" aria-hidden />
                                    501(c)(3) nonprofit
                                </span>
                            </div>
                        </div>

                        <div className={`${sectionBox} border-none md:border-none md:pl-0`}>
                            <p className="text-base font-normal text-[#121212]">Select amount</p>
                            <div className="flex flex-wrap items-center md:gap-5 gap-2 w-full min-w-0">
                                {amountOptions
                                    .filter((o) => o.value !== "custom")
                                    .map((opt) => {
                                        const selected = donateAmount === String(opt.value);
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => handleDonateAmount(opt.value)}
                                                className={cn(
                                                    "shrink-0 rounded-[12px] border px-4 py-2 text-sm font-medium transition-colors min-h-[48px]",
                                                    selected
                                                        ? "bg-[#121212] text-white border-[#121212]"
                                                        : "bg-white text-[#121212] border-gray-200 hover:border-gray-300"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                <button
                                    type="button"
                                    onClick={() => handleDonateAmount("custom")}
                                    className={cn(
                                        "shrink-0 rounded-xl border px-4 py-2 text-[14px] font-medium transition-colors min-h-[48px]",
                                        isCustom
                                            ? "bg-[#121212] text-white border-[#121212]"
                                            : "bg-white text-[#121212] border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    Custom
                                </button>
                                {isCustom && (
                                    <AntInput
                                        value={customAmount}
                                        onChange={(e) =>
                                            setCustomAmount(e.target.value.replace(/[^\d.]/g, ""))
                                        }
                                        placeholder="Enter Amount here"
                                        suffix={<span className="text-[#121212]">$</span>}
                                        className={cn(
                                            "!h-[48px] !rounded-[12px] !border !border-[#E0E0E0] !bg-[#F4F7FB] min-w-[160px] w-[min(100%,280px)] md:w-[390px] flex-1 !px-3",
                                            "[&_.ant-input]:!bg-[#F4F7FB] [&_.ant-input]:!text-[#121212]"
                                        )}
                                    />
                                )}
                            </div>
                            {amountError && (
                                <p className="text-sm text-red-600 mt-1">{amountError}</p>
                            )}
                        </div>

                        <div className={sectionBox}>
                            <h3 className="text-[20px] font-medium text-[#121212] md:mb-6 mb-0">
                                Personal details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <Input
                                    labelClassName={DONATE_LABEL_CLASS}
                                    inputType="text"
                                    name="first_name"
                                    label="First Name"
                                    required
                                    value={firstName}
                                    onChange={(v) => setFirstName(typeof v === "string" ? v : "")}
                                    placeholder="Eg. John"
                                    rootClassName="w-full"
                                    inputClassName="w-full rounded-xl border-gray-200"
                                />
                                <Input
                                    labelClassName={DONATE_LABEL_CLASS}
                                    inputType="text"
                                    name="last_name"
                                    label="Last Name"
                                    required
                                    value={lastName}
                                    onChange={(v) => setLastName(typeof v === "string" ? v : "")}
                                    placeholder="Eg. Doe"
                                    rootClassName="w-full"
                                    inputClassName="w-full rounded-xl border-gray-200"
                                />
                                <Input
                                    labelClassName={DONATE_LABEL_CLASS}
                                    inputType="text"
                                    name="email"
                                    label="Email Address"
                                    required
                                    value={email}
                                    onChange={(v) => setEmail(typeof v === "string" ? v : "")}
                                    placeholder="Enter email address"
                                    rootClassName="w-full"
                                    inputClassName="w-full rounded-xl border-gray-200"
                                />
                                <div className="flex flex-col gap-2 w-full min-w-0">
                                    <label className="text-base font-normal text-[#121212]">
                                        Phone Number <span className="text-red-600">*</span>
                                    </label>
                                    <div className="flex gap-2 w-full min-w-0">
                                        <Input
                                            labelClassName={DONATE_LABEL_CLASS}
                                            inputType="select"
                                            name="phone_country_code"
                                            value={phoneCountryCode}
                                            onChange={(v) => setPhoneCountryCode(v ?? "+1")}
                                            options={COUNTRY_CODE_OPTIONS}
                                            rootClassName="!w-20 md:!w-24 !mb-0 shrink-0"
                                            inputClassName="w-full rounded-xl border-gray-200"
                                        />
                                        <Input
                                            labelClassName={DONATE_LABEL_CLASS}
                                            inputType="text"
                                            name="phone_number"
                                            value={phoneNumber}
                                            onChange={(v) =>
                                                setPhoneNumber(
                                                    (typeof v === "string" ? v : "").replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                )
                                            }
                                            placeholder="Enter phone number"
                                            rootClassName="w-full flex-1 min-w-0 !mb-0"
                                            inputClassName="w-full rounded-xl border-gray-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={sectionBox}>
                            <h3 className="text-[20px] font-medium text-[#121212] md:mb-6 mb-0">
                                Billing address
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <Input
                                    labelClassName={DONATE_LABEL_CLASS}
                                    inputType="text"
                                    name="address1"
                                    label="Address Line 1"
                                    required
                                    value={address1}
                                    onChange={(v) => setAddress1(typeof v === "string" ? v : "")}
                                    placeholder="Street address"
                                    rootClassName="w-full"
                                    inputClassName="w-full rounded-xl border-gray-200"
                                />
                                <Input
                                    labelClassName={DONATE_LABEL_CLASS}
                                    inputType="text"
                                    name="address2"
                                    label="Address Line 2"
                                    value={address2}
                                    onChange={(v) => setAddress2(typeof v === "string" ? v : "")}
                                    placeholder="Apt, suite (optional)"
                                    rootClassName="w-full"
                                    inputClassName="w-full rounded-xl border-gray-200"
                                />
                                <Input
                                    labelClassName={DONATE_LABEL_CLASS}
                                    inputType="text"
                                    name="city"
                                    label="City"
                                    required
                                    value={city}
                                    onChange={(v) => setCity(typeof v === "string" ? v : "")}
                                    placeholder="Enter city"
                                    rootClassName="w-full"
                                    inputClassName="w-full rounded-xl border-gray-200"
                                />
                                <Input
                                    labelClassName={DONATE_LABEL_CLASS}
                                    inputType="select"
                                    name="state"
                                    label="State / Region"
                                    required
                                    showSearch
                                    disabled={!country || statesLoading}
                                    isLoading={statesLoading}
                                    value={state}
                                    onChange={(v) => setState(v ?? "")}
                                    placeholder={statesLoading ? "Loading..." : "Select state"
                                    }
                                    options={stateOptions}
                                    rootClassName="w-full"
                                    inputClassName="w-full rounded-xl border-gray-200"
                                />
                                <Input
                                    labelClassName={DONATE_LABEL_CLASS}
                                    inputType="text"
                                    name="zip"
                                    label="ZIP / Postal Code"
                                    required
                                    value={zip}
                                    onChange={(v) => setZip(typeof v === "string" ? v : "")}
                                    placeholder="Enter ZIP or postal code"
                                    rootClassName="w-full"
                                    inputClassName="w-full rounded-xl border-gray-200"
                                />
                                <Input
                                    labelClassName={DONATE_LABEL_CLASS}
                                    inputType="select"
                                    name="country"
                                    label="Country"
                                    required
                                    showSearch
                                    disabled={countriesLoading}
                                    isLoading={countriesLoading}
                                    value={country}
                                    onChange={(v) => {
                                        setCountry(v ?? "");
                                        setState("");
                                    }}
                                    placeholder={countriesLoading ? "Loading..." : "Select country"}
                                    options={countryOptions}
                                    rootClassName="w-full"
                                    inputClassName="w-full rounded-xl border-gray-200"
                                />
                            </div>
                        </div>

                        <div className={sectionBox}>
                            <h3 className="text-[20px] font-medium text-[#121212] mb-0 md:mb-10">
                                Donation preferences
                            </h3>
                            <div className="space-y-2">
                                {/* <p className="text-base font-normal text-[#121212]">
                                    How should we show your name?
                                </p> */}
                                <RadioInput
                                    inputType="radio"
                                    name="name_visibility"
                                    value={nameVisibility}
                                    layout="horizontal"
                                    optionLabelClassName="!text-base !font-normal !text-[#121212]"
                                    optionSublabelClassName="!text-[12px] !font-normal !text-[#121212]"
                                    onChange={(value) =>
                                        setNameVisibility(
                                            value as "" | "full" | "first_only" | "anonymous"
                                        )
                                    }
                                    options={nameVisibilityOptions}
                                    radioButtonClassName="!bg-background-input rounded-xl border border-gray-200 md:w-[266px] w-full py-2.5 px-3 shadow-sm"
                                />
                            </div>

                            <div className={`${DONATE_CHECKBOX_ROW_CLASS} w-full`}>
                                <div className="w-full flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="donor_wall"
                                        checked={donorWall}
                                        onChange={(e) => setDonorWall(Boolean(e.target.checked))}
                                        className="donate-checkbox shrink-0"
                                        aria-label="Show my name on the donor wall"
                                    />
                                    <span className="!text-base !font-normal !text-[#121212]">
                                        Show my name on the donor wall
                                    </span>
                                </div>
                            </div>

                            <Input
                                labelClassName={DONATE_LABEL_CLASS}
                                inputType="select"
                                name="dedication"
                                label="Dedication (Optional)"
                                value={dedication}
                                onChange={(v) => setDedication(v ?? "none")}
                                options={dedicationOptions}
                                rootClassName="w-full"
                                inputClassName="w-full rounded-xl border-gray-200"
                            />

                            {(dedication === "honor" || dedication === "memory") && (
                                <Input
                                    labelClassName={DONATE_LABEL_CLASS}
                                    inputType="text"
                                    name="dedication_name"
                                    label=""
                                    value={dedicationName}
                                    onChange={(v) => setDedicationName(typeof v === "string" ? v : "")}
                                    placeholder="Person name"
                                    rootClassName="w-full"
                                    inputClassName="w-full rounded-xl border-gray-200"
                                />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <Input
                                    labelClassName={DONATE_LABEL_CLASS}
                                    inputType="select"
                                    name="fund"
                                    label="Campaign / fund designation"
                                    value={fundDesignation}
                                    onChange={(v) => {
                                        const val = v ?? "general-fund";
                                        setFundDesignation(val);
                                        if (val !== "other") setFundOtherDetail("");
                                    }}
                                    options={fundOptions}
                                    rootClassName="w-full"
                                    inputClassName="w-full rounded-xl border-gray-200"
                                />
                                {String(fundDesignation) === "other" && (
                                    <Input
                                        labelClassName={DONATE_LABEL_CLASS}
                                        inputType="text"
                                        name="fund_other"
                                        label="Details (If Other)"
                                        value={fundOtherDetail}
                                        onChange={(v) =>
                                            setFundOtherDetail(typeof v === "string" ? v : "")
                                        }
                                        placeholder="Enter here"
                                        rootClassName="w-full"
                                        inputClassName="w-full rounded-xl border-gray-200"
                                    />
                                )}
                            </div>

                            <div className={`${DONATE_CHECKBOX_ROW_CLASS} w-full`}>
                                <div className="w-full flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="cover_fees"
                                        checked={coverFees}
                                        onChange={(e) => setCoverFees(Boolean(e.target.checked))}
                                        className="donate-checkbox shrink-0"
                                        aria-label="Cover processing fees"
                                    />
                                    <div className="flex min-w-0 flex-col items-start gap-1">
                                        <span className="!text-base !font-normal !text-[#121212]">
                                            Cover processing fees
                                        </span>
                                        <p className="text-[12px] text-[#121212] -mt-1">
                                            100% of your donation will go directly to Melody Wings when you
                                            cover fees.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Input
                                labelClassName={DONATE_LABEL_CLASS}
                                inputType="textarea"
                                name="message"
                                label="Leave a message (Optional)"
                                value={message}
                                onChange={(v) => setMessage(typeof v === "string" ? v : "")}
                                placeholder="Share why you are supporting Melody Wings."
                                rows={4}
                                rootClassName="w-full"
                                inputClassName="w-full rounded-xl border-gray-200 !bg-background-input"
                            />

                            <Input
                                labelClassName={DONATE_LABEL_CLASS}
                                inputType="select"
                                name="hear_about"
                                label="How did you hear about us? (Optional)"
                                value={hearAbout}
                                onChange={(v) => setHearAbout(v ?? "")}
                                placeholder="Select an option"
                                options={hearAboutOptions}
                                rootClassName="w-full"
                                inputClassName="w-full rounded-xl border-gray-200"
                            />
                        </div>

                        <Button
                            htmlType="submit"
                            title="Donate Now"
                            btnVariant="secondary"
                            loading={isSubmitting}
                            disabled={isSubmitting}
                            customClassName="!w-full !rounded-[10px] !py-3 !h-12 !text-base !font-medium !text-white !bg-black hover:!bg-black"
                        />
                    </form>
                </div>
            </main>

            <section className={`${PAGE_GUTTER_CLASS} pb-16 md:pb-24`}>
                <h2 className="text-[20px] md:text-[32px] font-medium text-gray-900 text-left mb-6 md:mb-8">
                    Frequently Asked Questions
                </h2>
                <div className="w-full divide-y divide-gray-200">
                {faqItems.map((item, index) => (
                        <Accordian key={item.key} items={item} defaultExpanded={index === 0} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Donate;
