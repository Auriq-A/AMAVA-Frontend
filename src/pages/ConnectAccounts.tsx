import { useState } from "react";
import axios from "axios";

export default function ConnectAccounts() {
  const [spApiKey, setSpApiKey] = useState("");
  const [supplierCreds, setSupplierCreds] = useState("");

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/accounts/connect", {
        spApiKey,
        supplierCreds,
      });
      alert("Accounts connected successfully!Server says: ${res.data.message}");
    } catch (err) {
      alert("Connection failed");
    }
  };

  return (
    <form onSubmit={handleConnect} className="flex flex-col gap-2 p-4">
      <input value={spApiKey} onChange={(e) => setSpApiKey(e.target.value)} placeholder="SP-API Key" className="border p-2" />
      <input value={supplierCreds} onChange={(e) => setSupplierCreds(e.target.value)} placeholder="Supplier Credentials" className="border p-2" />
      <button type="submit" className="bg-purple-500 text-white p-2">Connect</button>
    </form>
  );
}
