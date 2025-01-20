import { CalendarDateTime } from "@internationalized/date";
import { DatePicker } from "@nextui-org/date-picker";
import { NextUIProvider } from "@nextui-org/react";

export default function DateTimePicker({ dateValue, dateString, setDate, setTime, change }: { dateValue: CalendarDateTime; dateString: string; setDate: React.Dispatch<React.SetStateAction<string>>; setTime: React.Dispatch<React.SetStateAction<string>>; change: Function; }) {

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
                    onChange={(e) => change(e, dateString)}
                />
            </div>
        </NextUIProvider>
    );
}
