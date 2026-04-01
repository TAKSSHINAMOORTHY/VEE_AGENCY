import { useMemo, useState } from 'react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { createId } from '@/lib/id';
import { toast } from '@/hooks/use-toast';
import type { Company } from '@/types/company';

type CompanyForm = {
  companyName: string;
  ownerName: string;
  gstn: string;
  address: string;
  phoneNumber: string;
};

const emptyForm: CompanyForm = {
  companyName: '',
  ownerName: '',
  gstn: '',
  address: '',
  phoneNumber: '',
};

function normalizeGstn(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
}

export default function Companies() {
  const [companies, setCompanies] = useLocalStorageState<Company[]>(STORAGE_KEYS.companies, []);
  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedCompanies = useMemo(
    () => [...companies].sort((a, b) => a.companyName.localeCompare(b.companyName)),
    [companies],
  );

  const updateForm = (key: keyof CompanyForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === 'gstn' ? normalizeGstn(value) : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const findDuplicate = (name: string, ignoreId?: string) => {
    const normalized = name.trim().toLowerCase();
    if (!normalized) return false;
    return companies.some(
      (company) => company.id !== ignoreId && company.companyName.trim().toLowerCase() === normalized,
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (findDuplicate(form.companyName, editingId ?? undefined)) {
      toast({
        title: 'Company already exists',
        description: 'Use a unique company name.',
        variant: 'destructive',
      });
      return;
    }

    if (normalizeGstn(form.gstn).length !== 15) {
      toast({
        title: 'Invalid GSTN',
        description: 'GSTN must be exactly 15 uppercase characters.',
        variant: 'destructive',
      });
      return;
    }

    const now = new Date().toISOString();
    const payload = {
      companyName: form.companyName.trim(),
      ownerName: form.ownerName.trim(),
      gstn: normalizeGstn(form.gstn),
      address: form.address.trim(),
      phoneNumber: form.phoneNumber.trim(),
      updatedAt: now,
    };

    if (editingId) {
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === editingId
            ? {
                ...company,
                ...payload,
                name: payload.companyName,
              }
            : company,
        ),
      );
      toast({ title: 'Company updated' });
    } else {
      setCompanies((prev) => [
        {
          id: createId(),
          name: payload.companyName,
          createdAt: now,
          totalCredit: 0,
          totalDebit: 0,
          balance: 0,
          bills: [],
          ...payload,
        },
        ...prev,
      ]);
      toast({ title: 'Company created' });
    }

    resetForm();
  };

  const handleEdit = (company: Company) => {
    setEditingId(company.id);
    setForm({
      companyName: company.companyName,
      ownerName: company.ownerName,
      gstn: company.gstn,
      address: company.address,
      phoneNumber: company.phoneNumber,
    });
  };

  const handleDelete = (company: Company) => {
    const confirmed = window.confirm(`Delete ${company.companyName}?`);
    if (!confirmed) return;

    setCompanies((prev) => prev.filter((item) => item.id !== company.id));
    if (editingId === company.id) {
      resetForm();
    }
    toast({ title: 'Company deleted' });
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Companies</h1>
          <p className="text-muted-foreground">Manage company records for billing and reporting.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {editingId ? 'Edit Company' : 'Add Company'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(e) => updateForm('companyName', e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Company Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={form.ownerName}
                    onChange={(e) => updateForm('ownerName', e.target.value)}
                    placeholder="Enter owner name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstn">GSTN</Label>
                  <Input
                    id="gstn"
                    value={form.gstn}
                    onChange={(e) => updateForm('gstn', e.target.value)}
                    placeholder="Enter GSTN"
                    maxLength={15}
                    pattern="[A-Z0-9]{15}"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={form.phoneNumber}
                    onChange={(e) => updateForm('phoneNumber', e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={(e) => updateForm('address', e.target.value)}
                    placeholder="Enter company address"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {editingId ? 'Update Company' : 'Create Company'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>GSTN</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.companyName}</TableCell>
                      <TableCell>{company.ownerName}</TableCell>
                      <TableCell>{company.gstn}</TableCell>
                      <TableCell>{company.phoneNumber}</TableCell>
                      <TableCell className="max-w-[300px] truncate" title={company.address}>
                        {company.address}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(company)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(company)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sortedCompanies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No companies yet. Add your first company above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
