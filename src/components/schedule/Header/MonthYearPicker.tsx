import React, { useState, useEffect, useRef } from "react";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { CalendarIcon } from "@/assets/icons";
import Button from "@/components/common/Button";

const MonthYearPicker: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCurrentMonth } = useAppStore();
  const [open, setOpen] = useState(false);
  const datePickerRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => {
    const urlDate = searchParams.get("current_month");
    return urlDate ? dayjs(urlDate) : dayjs();
  });

  const handleChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
      const params = new URLSearchParams(searchParams.toString());
      params.set("current_month", date.format("YYYY-MM"));
      setCurrentMonth(date.format("YYYY-MM"));
      router.push(`?${params.toString()}`);
      setOpen(false); // Close the picker after selection
    }
  };

  useEffect(() => {
    if (!searchParams.get("current_month")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("current_month", selectedDate.format("YYYY-MM"));
      setCurrentMonth(selectedDate.format("YYYY-MM"));
      router.push(`?${params.toString()}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time default of the month in the URL on mount
  }, []);

  return (
    <div className="flex items-center relative">
      <DatePicker
        ref={datePickerRef}
        picker="month"
        format="YYYY-MM"
        value={selectedDate}
        onChange={handleChange}
        open={open}
        onOpenChange={setOpen}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
      <Button
        onClick={() => setOpen(true)}
        btnVariant="tertiary"
        customClassName="text-sm font-medium rounded-full w-full shadow-none flex items-center !px-3 !py-0"
      >
        <CalendarIcon width="15" height="15" />
        {selectedDate.format("MMM YYYY")}
      </Button>
    </div>
  );
};

export default MonthYearPicker;