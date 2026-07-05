import { TransactionForm } from "@/components/TransactionForm";

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">거래 기록</h1>
        <p className="mt-1 text-slate-400">
          매수·매도 거래를 기록하세요. 과거 날짜도 선택할 수 있습니다.
        </p>
      </div>
      <TransactionForm />
    </div>
  );
}
