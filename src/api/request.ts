/** @format */
"use client";

import { request } from "./api-client";

export async function GET_API<T>(endpoint: string) {
    const response = await request({
        method: "GET",
        url: endpoint,
    });
    return response;
}

export async function POST_API<T>(endpoint: string, data?: T) {
    const response = await request({
        method: "POST",
        url: endpoint,
        data: data,
    });
    return response;
}

export async function PUT_API<T>(endpoint: string, data: T) {
    const response = await request({
        method: "PUT",
        url: endpoint,
        data: data,
    });
    return response;
}

export async function DELETE_API(endpoint: string, data?: unknown) {
    const response = await request({
        method: "DELETE",
        url: endpoint,
        ...(data !== undefined ? { data } : {}),
    });
    return response;
}
