import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { API_ENDPOINTS } from "../config/api";
import {
  LayoutDashboard,
  FileText,
  Boxes,
  TrendingUp,
  Mail,
  Lock,
} from "lucide-react";

export default function InvoMateLogin() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!formData.email || !formData.password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        await loginUser();
        navigate("/home");
      } else {
        setErrorMessage(data.msg || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="h-screen overflow-hidden bg-[#07070B] text-white flex items-center justify-center p-3">
      <div className="w-full h-full max-w-7xl rounded-3xl overflow-hidden border border-[#1d1d27] bg-[#0b0b12] shadow-2xl">
        <div className="grid lg:grid-cols-2 h-full">
          
          {/* LEFT SIDE */}
          <div className="relative flex flex-col justify-between p-8 lg:p-12 bg-gradient-to-br from-[#12101d] via-[#0a0a11] to-[#09090f]">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#c8a9ff] flex items-center justify-center">
                <FileText className="text-black w-5 h-5" />
              </div>

              <h1 className="text-2xl font-bold">
                Invo<span className="text-[#c8a9ff]">Mate</span>
              </h1>
            </div>

            {/* Main Content */}
            <div className="max-w-lg">
              <h2 className="text-4xl lg:text-6xl font-extrabold leading-tight">
                Welcome back to <br />
                <span className="text-[#d7b8ff]">InvoMate</span>
              </h2>

              <p className="mt-4 text-gray-400 text-base lg:text-lg leading-7">
                Access your elite workspace and manage your global financial
                operations with surgical precision.
              </p>

              {/* Features */}
              <div className="mt-8 space-y-5">
                <FeatureItem
                  icon={<LayoutDashboard size={18} />}
                  text="Real-time dashboard"
                />

                <FeatureItem
                  icon={<FileText size={18} />}
                  text="GST Invoices"
                />

                <FeatureItem
                  icon={<Boxes size={18} />}
                  text="Smart inventory"
                />

                <FeatureItem
                  icon={<TrendingUp size={18} />}
                  text="Profit tracking"
                />
              </div>
            </div>

            {/* Bottom Line */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-green-400 via-[#d7b8ff] to-transparent" />
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center justify-center bg-[#09090f] p-6 lg:p-10 overflow-hidden">
            <div className="w-full max-w-md">
              
              <p className="text-gray-400 mt-2 text-sm lg:text-base">
                <b>Please enter your credentials to access your account.</b>
              </p>

              {/* FORM */}
              <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
                
                {/* Email */}
                <InputField
                  label="Work Email"
                  type="email"
                  placeholder="name@company.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  icon={<Mail size={17} className="text-gray-500" />}
                />

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] tracking-[0.25em] text-[#b89cff] uppercase">
                      Security Key
                    </label>

                    <button
                      type="button"
                      className="text-xs text-[#c8a9ff]"
                    >
                      Forgot key?
                    </button>
                  </div>

                  <div className="flex items-center bg-[#11111a] border border-[#1d1d27] rounded-xl px-4 h-12 focus-within:border-[#c8a9ff] transition">
                    <Lock size={17} className="text-gray-500" />

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      placeholder="••••••••••"
                      className="bg-transparent w-full px-3 outline-none text-white placeholder:text-gray-500 text-sm"
                    />
                  </div>
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#c8a9ff]"
                  />

                  <span className="text-sm text-gray-400">
                    Remember this device for 30 days
                  </span>
                </div>

                {/* Button */}
                {errorMessage ? (
                  <p className="text-sm text-red-400">{errorMessage}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-[#d7b8ff] text-black font-semibold hover:opacity-90 transition"
                >
                  {isSubmitting ? "Signing In..." : "Sign In to Dashboard →"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-[#1d1d27]" />

                  <span className="text-[10px] text-gray-500 tracking-[0.3em] uppercase">
                    Secure Connect
                  </span>

                  <div className="flex-1 h-px bg-[#1d1d27]" />
                </div>
              </form>

              {/* Bottom Tags */}
              <div className="flex items-center justify-center gap-5 mt-7 text-[10px] uppercase tracking-[0.2em] text-gray-600">
                <span>GST Ready</span>
                <span>Secure Login</span>
                <span>AI Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* INPUT FIELD */
function InputField({
  label,
  type,
  placeholder,
  icon,
  name,
  value,
  onChange,
  autoComplete,
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.25em] text-[#b89cff] uppercase mb-2">
        {label}
      </label>

      <div className="flex items-center bg-[#11111a] border border-[#1d1d27] rounded-xl px-4 h-12 focus-within:border-[#c8a9ff] transition">
        {icon}

        <input
          type={type}
          placeholder={placeholder}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="bg-transparent w-full px-3 outline-none text-white placeholder:text-gray-500 text-sm"
        />
      </div>
    </div>
  );
}

/* FEATURE ITEM */
function FeatureItem({ icon, text }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl border border-[#242433] bg-[#11111a] flex items-center justify-center text-[#c8a9ff]">
        {icon}
      </div>

      <span className="text-gray-300 text-base">
        {text}
      </span>
    </div>
  );
} 