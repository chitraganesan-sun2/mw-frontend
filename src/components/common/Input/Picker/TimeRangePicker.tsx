import React, { useEffect, useState } from "react";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import dayjs from "dayjs";

interface TimeRange {
  from: dayjs.Dayjs | string | null;
  to: dayjs.Dayjs | string | null;
}

interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (newValue: TimeRange) => void;
  clearable?: boolean;
  name?: string;
}

interface TimePickerComponentProps {
  name: string;
  time: dayjs.Dayjs | string | null;
  type: "from" | "to";
  onTimeChange: (formattedTime: string | null, type: "from" | "to") => void;
}

const TimePickerComponent = ({ name, time, type, onTimeChange, }: TimePickerComponentProps) => {
  const [tempTime, setTempTime] = useState<dayjs.Dayjs | null>(time ? dayjs(time, "h:mm A") : null);

  useEffect(() => {
    setTempTime(time ? dayjs(time, "h:mm A") : null);
  }, [time]);

  return (
    <TimePicker
      name={`${name}-${type}`}
      timeSteps={{ minutes: 1 }}
      format="h:mm A"
      value={tempTime}
      onChange={(newTime) => setTempTime(newTime)}
      onAccept={() => {
        if (tempTime) {
          onTimeChange(tempTime?.format("h:mm A"), type);
        }
      }}
      closeOnSelect={false}
      // A single outer <label> can't describe two separate time inputs - each gets its
      // own real accessible name instead (MUI X v7's slot-prop API for the underlying
      // text field, not a plain id/aria-label prop on TimePicker itself).
      slotProps={{
        textField: {
          id: `${name}-${type}`,
          "aria-label": type === "from" ? "Start time" : "End time",
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            border: "2px solid var(--background-secondary-color) !important",
          },
        },
      }}
    />
  );
};

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({ value, onChange, clearable, name = "time-picker", }) => {

  const handleTimeChange = (newTime: string | null, type: "from" | "to") => {
    const newValue = {
      from: type === "from" ? dayjs(newTime, 'h:mm A') : value?.from,
      to: type === "to" ? dayjs(newTime, 'h:mm A') : value?.to,
    };

    if (newValue?.from && newValue?.to && dayjs(newValue?.from, "h:mm A").isAfter(dayjs(newValue?.to, "h:mm A"))) {
      [newValue.from, newValue.to] = [newValue.to, newValue.from];
    }

    onChange(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex items-center gap-2">
        <TimePickerComponent
          name={name}
          time={value?.from}
          type="from"
          onTimeChange={handleTimeChange}
        />
        <span className="text-gray-500">to</span>
        <TimePickerComponent
          name={name}
          time={value?.to}
          type="to"
          onTimeChange={handleTimeChange}
        />
        {clearable && (
          <IconButton onClick={() => onChange({ from: null, to: null })} aria-label="clear time range">
            <ClearIcon className="text-red-500" />
          </IconButton>
        )}
      </div>
    </LocalizationProvider>
  );
};

export default TimeRangePicker;
