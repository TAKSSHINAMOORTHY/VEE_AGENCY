import { FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ExportButtonsProps {
  onExportPDF?: () => void;
  onExportExcel?: () => void;
}

export function ExportButtons({ onExportPDF, onExportExcel }: ExportButtonsProps) {
  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF();
    } else {
      toast({
        title: 'Export Started',
        description: 'Your PDF export is being prepared...',
      });
    }
  };

  const handleExportExcel = () => {
    if (onExportExcel) {
      onExportExcel();
    } else {
      toast({
        title: 'Export Started',
        description: 'Your Excel export is being prepared...',
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        className="gap-2"
      >
        <FileDown className="w-4 h-4" />
        Export PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportExcel}
        className="gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Export Excel
      </Button>
    </div>
  );
}
