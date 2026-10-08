import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import Button from "@/components/common/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

interface Props {
    onChange?: (date: Dayjs) => void;
    defaultDate?: string;
}

const MonthYearSlider: React.FC<Props> = ({ onChange, defaultDate }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setCurrentMonth } = useAppStore();

    // Initialize currentDate from props, URL, or default to current date
    const [currentDate, setCurrentDate] = useState<Dayjs>(() => {
        const urlDate = searchParams.get("current_month");
        return defaultDate ? dayjs(defaultDate) : urlDate ? dayjs(urlDate) : dayjs();
    });

    const handleMonthChange = (direction: "prev" | "next") => {
        const newDate =
            direction === "prev" ? currentDate.subtract(1, "month") : currentDate.add(1, "month");

        setCurrentDate(newDate);
        onChange?.(newDate);

        // Update URL with new date
        const params = new URLSearchParams(searchParams.toString());
        params.set("current_month", newDate.format("YYYY-MM"));
        setCurrentMonth(newDate.format("YYYY-MM"));
        router.push(`?${params.toString()}`);
    };

    // Follow ?current_month= when something else changes it (the calendar's Week/Day
    // stepping crosses month boundaries) - this used to read the URL only once on mount.
    const urlMonth = searchParams.get("current_month");
    useEffect(() => {
        if (urlMonth && dayjs(urlMonth).isValid()) {
            if (!dayjs(urlMonth).isSame(currentDate, "month")) setCurrentDate(dayjs(urlMonth));
            setCurrentMonth(dayjs(urlMonth).format("YYYY-MM"));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlMonth]);

    // Update URL when component mounts
    // (A month already in the URL is copied into the store by the effect above - the store
    // used to stay empty on a reload, so the calendar fetched the current month instead.)
    useEffect(() => {
        if (!searchParams.get("current_month")) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("current_month", currentDate.format("YYYY-MM"));
            setCurrentMonth(currentDate.format("YYYY-MM"));
            router.push(`?${params.toString()}`);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time default of the month in the URL on mount
    }, []);

    return (
        <div className="flex items-center">
            <Button
                icon={<IoIosArrowBack className="text-lg" />}
                rootClassName="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
                onClick={() => handleMonthChange("prev")}
            />

            <span className="text-xl font-medium min-w-[180px] text-center">
                {currentDate.format("MMMM YYYY")}
            </span>

            <Button
                icon={<IoIosArrowForward className="text-lg" />}
                rootClassName="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
                onClick={() => handleMonthChange("next")}
            />
        </div>
    );
};

export default MonthYearSlider;
