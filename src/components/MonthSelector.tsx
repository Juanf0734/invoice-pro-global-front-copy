import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subMonths, startOfMonth } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export const MonthSelector = ({ selectedMonth, onMonthChange }: MonthSelectorProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : enUS;

  // Generate last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = startOfMonth(subMonths(new Date(), i));
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale }),
      date: date
    };
  });

  return (
    <Select 
      value={format(selectedMonth, 'yyyy-MM')} 
      onValueChange={(value) => {
        const month = months.find(m => m.value === value);
        if (month) onMonthChange(month.date);
      }}
    >
      <SelectTrigger className="w-[200px] bg-background">
        <Calendar className="mr-2 h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {months.map((month) => (
          <SelectItem key={month.value} value={month.value}>
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
