/** @format */
"use client";

import { GET_API } from "@/api/request";
import { POST_API } from "@/api/request";

// Use relative paths so they behave like src/api/join-us/index.ts
const DONATION_PREFIX = "/donation";

export async function getDonationAmountPresets() {
	const response = await GET_API(`${DONATION_PREFIX}/config/amount-presets`);
	return response;
}

export async function getDedicationOptions() {
	const response = await GET_API(`${DONATION_PREFIX}/config/dedication-options`);
	return response;
}

export async function getFundDestinations() {
	const response = await GET_API(`${DONATION_PREFIX}/config/fund-destinations`);
	return response;
}

export async function getHowDidYouHearOptions() {
	const response = await GET_API(`${DONATION_PREFIX}/config/how-did-you-hear`);
	return response;
}

export async function getNameVisibilityOptions() {
	const response = await GET_API(`${DONATION_PREFIX}/config/name-visibility`);
	return response;
}

export async function createCheckoutSession<T extends Record<string, any>>(payload: T) {
	const response = await POST_API(`${DONATION_PREFIX}/create-checkout-session`, payload);
	return response;
}

export async function getDonorWall() {
	return await GET_API(`${DONATION_PREFIX}/donor-wall`);
}

export async function getDonationFaqs() {
	return await GET_API(`${DONATION_PREFIX}/faqs`);
}

export async function getDonationHistory() {
	return await GET_API(`${DONATION_PREFIX}/history`);
}
