import { CalendarDateTime } from "@internationalized/date";
import { DatePicker } from "@nextui-org/date-picker";
import { NextUIProvider } from "@nextui-org/react";

export default function DateTimePicker({ dateValue, dateString, setDate, setTime }: { dateValue: CalendarDateTime; dateString: string; setDate: React.Dispatch<React.SetStateAction<string>>; setTime: React.Dispatch<React.SetStateAction<string>> }) {
    // handle change
    const handleChange = (date: CalendarDateTime | null) => {
        if (date) {
            const formattedDate = `${String(date.month).padStart(2, "0")}/${String(date.day).padStart(2, "0")}/${date.year}`;
            const formattedTime = `${String(date.hour).padStart(2, "0")}:${String(date.minute).padStart(2, "0")}:${String(date.second).padStart(2, "0")}`;
            setDate(formattedDate);
            setTime(formattedTime);
        } else {
            console.log("No date selected");
        }
    };



    return (
        <NextUIProvider>
            <div className="w-full max-w-xl flex flex-row gap-4 text-white">
                <DatePicker
                    hideTimeZone={false}
                    showMonthAndYearPickers={true}
                    value={dateValue}
                    label={dateString}
                    variant="bordered"
                    color="secondary"
                    size="lg"
                    inert={false}
                    onChange={(e) => handleChange(e)}
                />
            </div>
        </NextUIProvider>
    );
}
