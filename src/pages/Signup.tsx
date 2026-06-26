import { useState } from "react";
import axios from "axios";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/signup", { email, password, username });
      localStorage.setItem("token", res.data.token);
      alert("Signup successful!");
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-2 p-4">
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="border p-2" />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border p-2" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border p-2" />
      <button type="submit" className="bg-green-500 text-white p-2">Signup</button>
    </form>
  );
}
