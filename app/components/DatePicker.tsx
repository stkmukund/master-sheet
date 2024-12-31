import { CalendarDateTime, getLocalTimeZone, now, parseAbsolute, parseDateTime, today } from "@internationalized/date";
import { DatePicker } from "@nextui-org/date-picker";
import { NextUIProvider } from "@nextui-org/react";

export default function DateTimePicker() {
    const timeZone = getLocalTimeZone(); // Get the current local timezone

    // Get today's date in the local timezone
    const todayDate = today(timeZone);

    // Construct the start and end of day with the required times
    const startOfDay = new CalendarDateTime(timeZone, todayDate.year, todayDate.month, todayDate.day, 0, 0, 0);
    const endOfDay = new CalendarDateTime(timeZone, todayDate.year, todayDate.month, todayDate.day, 23, 59, 59);

    // Log the dates for debugging
    console.log("Start of Day:", startOfDay.toString());
    console.log("End of Day:", endOfDay.toString());


    return (
        <NextUIProvider>
            <div className="w-full max-w-xl flex flex-row gap-4 text-white">
                <DatePicker
                    hideTimeZone
                    showMonthAndYearPickers
                    defaultValue={startOfDay}
                    label="Start Date"
                    variant="bordered"
                    color="secondary"
                    size="lg"
                />
            </div>
        </NextUIProvider>
    );
}
