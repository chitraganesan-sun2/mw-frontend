import { useQuery } from "@tanstack/react-query";
import { getCountries, getStates } from "@/api/common";

// Countries/states are effectively static reference data - a raw useEffect/useState
// fetch (the previous pattern here) re-fetches on every mount with no sharing between
// pages. useQuery with a long staleTime means join-us and donate share one fetch per
// session instead of one each, and instant per re-mount after that.
const REFERENCE_DATA_STALE_TIME = 24 * 60 * 60 * 1000; // 24 hours

type Option = { label: string; value: string };

const toOptions = (res: unknown, labelKey: string, valueKey: string): Option[] => {
    const data = (res as any)?.data ?? res;
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return list.map((item: any) => ({ label: item[labelKey], value: item[valueKey] }));
};

export const useCountryOptions = () => {
    const { data, isLoading } = useQuery({
        queryKey: ["countries"],
        queryFn: getCountries,
        staleTime: REFERENCE_DATA_STALE_TIME,
        select: (res) => toOptions(res, "country_name", "country_code"),
    });

    return { countryOptions: data ?? [], countriesLoading: isLoading };
};

export const useStateOptions = (countryCode: string | number | undefined) => {
    const { data, isLoading } = useQuery({
        queryKey: ["states", countryCode],
        queryFn: () => getStates(countryCode!.toString()),
        enabled: !!countryCode,
        staleTime: REFERENCE_DATA_STALE_TIME,
        select: (res) => toOptions(res, "state_name", "state_code"),
    });

    return { stateOptions: countryCode ? data ?? [] : [], statesLoading: !!countryCode && isLoading };
};
