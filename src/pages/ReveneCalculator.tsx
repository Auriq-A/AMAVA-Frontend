import { useState } from "react";

interface ProfitResult {
    asin: string;
    price: number;
    fees: number;
    cost: number;
    profit: number;
}

const FBAProfitCalculatorPage = () => {
    const [asin, setAsin] = useState<string>("");
    const [cost, setCost] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [result, setResult] = useState<ProfitResult | null>(null);
    const [error, setError] = useState<string>("");

    const [allResults, setAllResults] = useState<ProfitResult[]>([]);
    const [allLoading, setAllLoading] = useState<boolean>(false);

    // Calculate for a single ASIN
    const handleCalculate = async () => {
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const res = await fetch("http://localhost:51483/fba-profit-calculator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ asin, cost: parseFloat(cost) })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to calculate profit.");
            }

            const data: ProfitResult = await res.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate for all checked products
    const CalculateAllCheckedProduct = async () => {
        setAllLoading(true);
        setAllResults([]);
        setError("");
        try {
            const res = await fetch("http://localhost:51483/revcalall", {
                method: "POST"
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to calculate all products.");
            }

            const data = await res.json();
            if (data.status === "success") {
                setAllResults(data.data || []);
            } else {
                setError(data.message || "Unknown error occurred.");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setAllLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 mt-10 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-center">
                FBA Profit Calculator
            </h2>

            {/* All Checked Products Button */}
            <button
                onClick={CalculateAllCheckedProduct}
                disabled={allLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mb-4 disabled:opacity-50"
            >
                {allLoading ? "Calculating All..." : "Start Calculating All Checked Products"}
            </button>

            {/* Input for single ASIN */}
            <div className="mb-4">
                <label className="block mb-1 font-medium">ASIN</label>
                <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={asin}
                    onChange={(e) => setAsin(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="block mb-1 font-medium">Cost Price (USD)</label>
                <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                />
            </div>

            {/* Single product calculation */}
            <button
                onClick={handleCalculate}
                disabled={loading || !asin || !cost}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                {loading ? "Calculating..." : "Calculate Profit"}
            </button>

            {error && <div className="mt-4 text-red-600">❌ {error}</div>}

            {result && (
                <div className="mt-6 border-t pt-4 text-sm text-gray-800 space-y-2">
                    <div><strong>ASIN:</strong> {result.asin}</div>
                    <div><strong>FBA Price:</strong> ${result.price.toFixed(2)}</div>
                    <div><strong>FBA Fees:</strong> ${result.fees.toFixed(2)}</div>
                    <div><strong>Cost Price:</strong> ${result.cost.toFixed(2)}</div>
                    <div className="font-semibold">
                        ✅ Net Profit: ${result.profit.toFixed(2)}
                    </div>
                </div>
            )}

            {/* All checked products results */}
            {allResults.length > 0 && (
                <div className="mt-6 border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">All Checked Products</h3>
                    <div className="space-y-2 text-sm">
                        {allResults.map((item, idx) => (
                            <div key={idx} className="p-2 border rounded">
                                <div><strong>ASIN:</strong> {item.asin}</div>
                                <div><strong>Price:</strong> ${item.price.toFixed(2)}</div>
                                <div><strong>Fees:</strong> ${item.fees.toFixed(2)}</div>
                                <div><strong>Cost:</strong> ${item.cost.toFixed(2)}</div>
                                <div><strong>Net:</strong> ${item.profit.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FBAProfitCalculatorPage;
// DONE :)