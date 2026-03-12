import QuotationList from "@/components/QuotationList";


export default function AdminQuotationPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin - All Quotations</h1>
      <QuotationList />
    </div>
  );
}