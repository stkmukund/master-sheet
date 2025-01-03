import { CalendarDateTime, getLocalTimeZone, today } from "@internationalized/date";
import { DatePicker } from "@nextui-org/date-picker";
import { NextUIProvider } from "@nextui-org/react";
import { useEffect } from "react";

export default function DateTimePicker({ dateString, setDate, setTime }: { dateString: string; setDate: React.Dispatch<React.SetStateAction<string>>; setTime: React.Dispatch<React.SetStateAction<string>> }) {
    const timeZone = getLocalTimeZone(); // Get the current local timezone
    // Get today's date in the local timezone
    const todayDate = today(timeZone);
    // Construct the start and end of day with the required times
    const startOfDay = new CalendarDateTime(timeZone, todayDate.year, todayDate.month, todayDate.day, 0, 0, 0);
    const endOfDay = new CalendarDateTime(timeZone, todayDate.year, todayDate.month, todayDate.day, 23, 59, 59);

    useEffect(() => {
        if (dateString === "Start Date") {
            const formattedDate = `${String(startOfDay.month).padStart(2, "0")}/${String(startOfDay.day).padStart(2, "0")}/${startOfDay.year}`;
            const formattedTime = `${String(startOfDay.hour).padStart(2, "0")}:${String(startOfDay.minute).padStart(2, "0")}:${String(startOfDay.second).padStart(2, "0")}`;
            setDate(formattedDate);
            setTime(formattedTime);
        } else {
            const formattedDate = `${String(endOfDay.month).padStart(2, "0")}/${String(endOfDay.day).padStart(2, "0")}/${endOfDay.year}`;
            const formattedTime = `${String(endOfDay.hour).padStart(2, "0")}:${String(endOfDay.minute).padStart(2, "0")}:${String(endOfDay.second).padStart(2, "0")}`;
            setDate(formattedDate);
            setTime(formattedTime);
        }
    }, [])

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
                    defaultValue={dateString === "Start Date" ? startOfDay : endOfDay}
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
