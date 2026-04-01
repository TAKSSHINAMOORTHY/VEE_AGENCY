import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { createId } from '@/lib/id';
import { toast } from '@/hooks/use-toast';
import type { Company } from '@/types/company';

interface AddBillModalProps {
  onAddBill: (bill: {
    billNo: string;
    name: string;
    companyId?: string;
    billAmount: number;
    dateCreated: string;
  }) => void;
  presetCompany?: {
    id?: string;
    name: string;
  };
  lockCompany?: boolean;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerIconOnly?: boolean;
}

export function AddBillModal({
  onAddBill,
  presetCompany,
  lockCompany = false,
  triggerLabel = 'Add Bill',
  triggerClassName,
  triggerIconOnly = false,
}: AddBillModalProps) {
  const [companies, setCompanies] = useLocalStorageState<Company[]>(STORAGE_KEYS.companies, []);
  const [open, setOpen] = useState(false);
  const [companyFocused, setCompanyFocused] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(presetCompany?.id);
  const [formData, setFormData] = useState({
    name: presetCompany?.name ?? '',
    billNo: '',
    billAmount: '',
    dateCreated: new Date().toISOString().split('T')[0],
  });

  const trimmedCompany = formData.name.trim();
  const filteredCompanies = useMemo(() => {
    if (!trimmedCompany) return [];
    const query = trimmedCompany.toLowerCase();

    const startsWithMatches: Company[] = [];
    const containsMatches: Company[] = [];

    companies.forEach((company) => {
      const companyName = company.companyName.toLowerCase();
      const ownerName = company.ownerName.toLowerCase();
      const companyStartsWith = companyName.startsWith(query);
      const ownerStartsWith = ownerName.startsWith(query);
      const companyContains = companyName.includes(query);
      const ownerContains = ownerName.includes(query);

      if (companyStartsWith || ownerStartsWith) {
        startsWithMatches.push(company);
        return;
      }

      if (companyContains || ownerContains) {
        containsMatches.push(company);
      }
    });

    return [...startsWithMatches, ...containsMatches].slice(0, 8);
  }, [companies, trimmedCompany]);

  const exactCompanyExists = useMemo(() => {
    if (!trimmedCompany) return false;
    const query = trimmedCompany.toLowerCase();
    return companies.some((company) => company.companyName.trim().toLowerCase() === query);
  }, [companies, trimmedCompany]);

  const shouldShowSuggestions =
    companyFocused && Boolean(trimmedCompany) && (filteredCompanies.length > 0 || !exactCompanyExists);

  const handleSelectCompany = (companyName: string) => {
    const selectedCompany = companies.find((company) => company.companyName === companyName);
    setFormData((prev) => ({ ...prev, name: companyName }));
    setSelectedCompanyId(selectedCompany?.id);
    setCompanyFocused(false);
  };

  const handleCreateCompany = () => {
    if (!trimmedCompany || exactCompanyExists) return;

    const now = new Date().toISOString();
    const newCompany: Company = {
      id: createId(),
      name: trimmedCompany,
      companyName: trimmedCompany,
      ownerName: '',
      gstn: '',
      address: '',
      phoneNumber: '',
      createdAt: now,
      updatedAt: now,
      totalCredit: 0,
      totalDebit: 0,
      balance: 0,
      bills: [],
    };

    setCompanies((prev) => [newCompany, ...prev]);
    toast({
      title: 'Company created',
      description: 'Open Companies page later to add owner/GSTN/address/phone.',
    });
    setFormData((prev) => ({ ...prev, name: newCompany.companyName }));
    setSelectedCompanyId(newCompany.id);
    setCompanyFocused(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedCompany = companies.find(
      (company) => company.companyName.trim().toLowerCase() === formData.name.trim().toLowerCase(),
    );
    onAddBill({
      billNo: formData.billNo,
      name: formData.name.trim(),
      companyId: selectedCompanyId ?? matchedCompany?.id,
      billAmount: parseFloat(formData.billAmount),
      dateCreated: formData.dateCreated,
    });
    setFormData({
      name: presetCompany?.name ?? '',
      billNo: '',
      billAmount: '',
      dateCreated: new Date().toISOString().split('T')[0],
    });
    setSelectedCompanyId(presetCompany?.id);
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setFormData((prev) => ({
        ...prev,
        name: presetCompany?.name ?? prev.name,
      }));
      setSelectedCompanyId(presetCompany?.id ?? selectedCompanyId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className={triggerClassName || 'gap-2'} aria-label={triggerLabel}>
          <Plus className="w-4 h-4" />
          {!triggerIconOnly ? triggerLabel : <span className="sr-only">{triggerLabel}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Bill</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <div className="relative">
              <Input
                id="companyName"
                placeholder="Type company name"
                value={formData.name}
                disabled={lockCompany}
                onFocus={() => setCompanyFocused(true)}
                onBlur={() => {
                  setTimeout(() => setCompanyFocused(false), 120);
                }}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onInput={() => setSelectedCompanyId(undefined)}
                required
              />

              {!lockCompany && shouldShowSuggestions && (
                <div className="absolute z-20 mt-1 w-full bg-popover border border-border rounded-md shadow-md overflow-hidden">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-accent"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectCompany(company.companyName)}
                      >
                        <div className="text-sm font-medium">{company.companyName}</div>
                        {company.ownerName && (
                          <div className="text-xs text-muted-foreground">Owner: {company.ownerName}</div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No matching companies</div>
                  )}

                  {trimmedCompany && !exactCompanyExists && (
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm border-t border-border hover:bg-accent font-medium"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleCreateCompany}
                    >
                      Create company "{trimmedCompany}"
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="billNo">Bill No / Deal Name</Label>
            <Input
              id="billNo"
              placeholder="Enter bill number or deal name"
              value={formData.billNo}
              onChange={(e) => setFormData({ ...formData, billNo: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billAmount">Bill Amount (₹)</Label>
            <Input
              id="billAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.billAmount}
              onChange={(e) => setFormData({ ...formData, billAmount: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateCreated">Date Created</Label>
            <Input
              id="dateCreated"
              type="date"
              value={formData.dateCreated}
              onChange={(e) => setFormData({ ...formData, dateCreated: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Bill
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
