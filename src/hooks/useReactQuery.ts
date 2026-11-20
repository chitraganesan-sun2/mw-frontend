import { useCallback, useRef } from "react";
import {
    MutationFunction,
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryOptions,
} from "@tanstack/react-query";

type useSendDataProps = {
    success?: (data: any) => void;
    error?: (data: any) => void;
    invalidateKey?: Array<string>;
    fn: MutationFunction;
};

export const useGetData = <T>(options: UseQueryOptions) => {
    const result = useQuery(options);
    return {
        ...result,
        data: result.data as T,
    };
};

export const useSendData = ({ invalidateKey, error, success, fn }: useSendDataProps) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: fn,
        onSuccess: (data: any) => {
            invalidateKey &&
                invalidateKey.forEach((key) =>
                    queryClient.invalidateQueries({
                        queryKey: [key],
                    })
                );
            success && success(data);
            return data;
        },
        onError: (data: any) => error && error(data),
    });

    // `isPending` is React state and only flips after a re-render, so a fast double-click
    // fired the mutation twice (duplicate bookings / records). A synchronous ref closes that
    // window: calls made while one is in flight are ignored.
    const inFlight = useRef(false);
    const { mutate, mutateAsync } = mutation;
    const guardedMutate = useCallback(
        (...args: Parameters<typeof mutate>) => {
            if (inFlight.current) return;
            inFlight.current = true;
            const [variables, options] = args;
            mutate(variables, {
                ...options,
                onSettled: (...rest: any[]) => {
                    inFlight.current = false;
                    (options?.onSettled as any)?.(...rest);
                },
            });
        },
        [mutate]
    );
    const guardedMutateAsync = useCallback(
        async (...args: Parameters<typeof mutateAsync>) => {
            if (inFlight.current) return undefined as any;
            inFlight.current = true;
            try {
                return await mutateAsync(...args);
            } finally {
                inFlight.current = false;
            }
        },
        [mutateAsync]
    );

    return { ...mutation, mutate: guardedMutate, mutateAsync: guardedMutateAsync };
};
