import QuotationList from "@/components/QuotationList";


export default function SellerQuotationPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Quotations</h1>
      <QuotationList />
    </div>
  );
}