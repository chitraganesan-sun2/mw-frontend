import { endpoints } from "../constants"
import { DELETE_API, GET_API, POST_API, PUT_API } from "../request"

export const getResources = async (params?: any) => {
    const endpoint = endpoints.resources.get;
    const { data } = await GET_API(`${endpoint}?${new URLSearchParams({ ...params })}`);
    return data || {};
}

export const getResourcesByCategory = async (category_id: string, params?: any) => {
    const endpoint = endpoints.resources.getResourcesByCategory(category_id);
    const { data } = await GET_API(`${endpoint}?${new URLSearchParams({ ...params })}`);
    return data || {};
}

export const getMyResources = async (params?: any) => {
    try{
        const endpoint = endpoints.resources.getMyResources;
        const { data } = await GET_API(`${endpoint}?${new URLSearchParams({ ...params })}`);
        return data || {};
    }catch(error){
        return {};
    }
}

export const addResource = async (payload: any) => {
    const endpoint = endpoints.resources.create;
    const { status } = await POST_API(endpoint, payload);
    return status === 201;
}

export const getSingleResource = async (resource_id: string) => {
    if (!resource_id) return null;
    const endpoint = endpoints.resources.getResource(resource_id);
    const { data } = await GET_API(endpoint);
    return data || {};
}

export const updateResource = async (resource_id: string, payload: any) => {
    if (!resource_id) return null;
    const endpoint = endpoints.resources.update(resource_id);
    const { status } = await PUT_API(endpoint, payload);
    return status === 200;
}

export const deleteResource = async (resource_id: string) => {
    if (!resource_id) return null;
    const endpoint = endpoints.resources.delete(resource_id);
    const { status } = await DELETE_API(endpoint);
    return status;
}

export const likeResource = async (resource_id: string) => {
    if (!resource_id) return null;
    const endpoint = endpoints.resources.like(resource_id);
    const { status } = await POST_API(endpoint);
    return status;
}

export const dislikeResource = async (resource_id: string) => {
    if (!resource_id) return null;
    const endpoint = endpoints.resources.dislike(resource_id);
    const { status } = await DELETE_API(endpoint);
    return status;
}

export const reportResource = async (payload: any) => {
    const { status } = await POST_API(endpoints.report.create, payload);
    return status === 201;
}