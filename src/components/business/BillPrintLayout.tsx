import { Bill } from '@/types/expense';
import { format } from 'date-fns';

interface BillPrintLayoutProps {
  bill: Bill;
  companyName?: string;
  companyDetails?: string;
}

export function BillPrintLayout({ bill, companyName = 'Vee Agency', companyDetails }: BillPrintLayoutProps) {
  const balance = Math.max(0, bill.billAmount - bill.paid);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white text-black p-6 shadow-lg">
        <style>{`
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .print-container {
              margin: 0;
              padding: 0;
              width: 100%;
            }
          }
        `}</style>

        {/* Header */}
        <div className="text-center mb-4 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold bg-yellow-300 inline-block px-3 py-1 mb-2">{companyName}</h1>
          {companyDetails && (
            <div className="text-sm space-y-1 mt-2">
              {companyDetails.split('\n').map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          )}
        </div>

        {/* Bill Header Section */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold bg-yellow-300 inline-block px-3 py-1">Bill Details</h2>
        </div>

        {/* Bill Information */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p><strong>Bill No:</strong> {bill.billNo}</p>
            <p><strong>Date Created:</strong> {format(new Date(bill.dateCreated), 'd-MMM-yyyy')}</p>
          </div>
          <div>
            <p><strong>Due Date:</strong> {format(new Date(bill.dateCreated), 'd-MMM-yyyy')}</p>
            <p><strong>Status:</strong> <span className="font-semibold capitalize">{bill.status}</span></p>
          </div>
        </div>

        {/* Amount Table */}
        <table className="w-full border-collapse border border-black text-sm mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black px-4 py-2 text-left">Description</th>
              <th className="border border-black px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black px-4 py-2">Bill Amount</td>
              <td className="border border-black px-4 py-2 text-right">{bill.billAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td className="border border-black px-4 py-2">Amount Paid</td>
              <td className="border border-black px-4 py-2 text-right">{bill.paid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            <tr className="font-bold bg-yellow-300">
              <td className="border border-black px-4 py-2">Outstanding Balance</td>
              <td className="border border-black px-4 py-2 text-right">{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>

        {/* Payment History */}
        {bill.payments.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-3 bg-yellow-300 inline-block px-3 py-1">Payment History</h3>
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black px-4 py-2 text-left">Date</th>
                  <th className="border border-black px-4 py-2 text-right">Amount</th>
                  <th className="border border-black px-4 py-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {bill.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="border border-black px-4 py-2">{format(new Date(payment.date), 'd-MMM-yyyy')}</td>
                    <td className="border border-black px-4 py-2 text-right">{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="border border-black px-4 py-2">{payment.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Print Styles */}
        <style>{`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none;
            }
            body {
              background: white;
              margin: 0;
              padding: 0;
            }
            .print-wrapper {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: white;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
