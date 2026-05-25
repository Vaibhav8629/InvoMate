// ShopProfile.jsx
// Requires: Tailwind CSS configured in your project
// Font: Add to index.html → <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../utils/api";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import { useAuth } from "../store/auth";

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <span className="text-violet-400 text-base">{icon}</span>
    <h2 className="text-sm font-semibold text-gray-200 tracking-wide">{title}</h2>
  </div>
);

const FieldBox = ({ label, value, mono = false, children, isEditing, onChange }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</p>
    )}
    <div
      className="border rounded-lg px-4 py-3 min-h-[48px] flex items-center"
      style={{ background: "var(--surface-2)", borderColor: "var(--border-subtle)" }}
    >
      {children || (
        isEditing ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            className={`w-full bg-transparent outline-none text-sm text-gray-200 ${mono ? "font-mono" : ""} focus:text-violet-300`}
          />
        ) : (
          <span className={`text-sm text-gray-200 ${mono ? "font-mono" : ""}`}>
            {value || <span className="text-gray-600 italic">Not set</span>}
          </span>
        )
      )}
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShopProfile() {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const surfaceCardStyle = { background: "var(--surface)", borderColor: "var(--border-subtle)" };
  const surfaceMutedStyle = { background: "var(--surface-2)", borderColor: "var(--border-subtle)" };
  const [copied, setCopied] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState("");
  const [signatureLoading, setSignatureLoading] = useState(false);
  const [signatureMessage, setSignatureMessage] = useState("");
  const [formData, setFormData] = useState({
    ShopName: "",
    GSTNumber: "",
    Address: "",
    Phone: "",
    Email: "",
    Pincode: "",
    ShopCode: ""
  });

  // Fetch profile and user data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching profile data...");
      console.log("API URL:", import.meta.env.VITE_API_URL);
      
      // Fetch profile data
      const profileResponse = await apiGet(`${import.meta.env.VITE_API_URL}/api/auth/findprofile`);
      console.log("Profile response status:", profileResponse.status);
      
      // Fetch user data
      const userResponse = await apiGet(`${import.meta.env.VITE_API_URL}/api/auth/user`);
      console.log("User response status:", userResponse.status);
      
      if (profileResponse.ok && userResponse.ok) {
        const profile = await profileResponse.json();
        const user = await userResponse.json();
        
        console.log("Profile data:", profile);
        console.log("User data:", user);
        
        setProfileData(profile);
        setUserData(user);
        setSignatureUrl(user?.signature?.url || "");
        
        // Initialize form data with profile data or empty values
        if (profile) {
          setFormData({
            ShopName: profile.ShopName || "",
            GSTNumber: profile.GSTNumber || "",
            Address: profile.Address || "",
            Phone: profile.Phone || "",
            Email: profile.Email || "",
            Pincode: profile.Pincode || "",
            ShopCode: profile.ShopCode || ""
          });
        } else {
          // Set email from user data if no profile
          setFormData(prev => ({
            ...prev,
            Email: user.email || ""
          }));
        }
      } else {
        const profileError = !profileResponse.ok ? await profileResponse.text() : null;
        const userError = !userResponse.ok ? await userResponse.text() : null;
        
        console.error("Profile error:", profileError);
        console.error("User error:", userError);
        
        setError(`Failed to fetch data. Profile: ${profileResponse.status}, User: ${userResponse.status}`);
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (profileData?.ShopCode) {
      navigator.clipboard.writeText(profileData.ShopCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const refreshSignature = async () => {
    try {
      const response = await apiGet(`${import.meta.env.VITE_API_URL}/api/signature`);
      if (!response.ok) return;

      const data = await response.json();
      setSignatureUrl(data?.signature?.url || "");
    } catch (err) {
      console.error("Error refreshing signature:", err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original profile data
    if (profileData) {
      setFormData({
        ShopName: profileData.ShopName || "",
        GSTNumber: profileData.GSTNumber || "",
        Address: profileData.Address || "",
        Phone: profileData.Phone || "",
        Email: profileData.Email || "",
        Pincode: profileData.Pincode || "",
        ShopCode: profileData.ShopCode || ""
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const endpoint = profileData 
        ? `${import.meta.env.VITE_API_URL}/api/auth/updateprofile`
        : `${import.meta.env.VITE_API_URL}/api/auth/createprofile`;
      
      const apiMethod = profileData ? apiPut : apiPost;
      
      const response = await apiMethod(endpoint, formData);
      
      if (response.ok) {
        alert(profileData ? "Profile updated successfully!" : "Profile created successfully!");
        setIsEditing(false);
        // Refresh data
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Failed to save profile: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Error saving profile");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignatureUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setSignatureLoading(true);
    setSignatureMessage("");

    try {
      const formData = new FormData();
      formData.append("signature", file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signature/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to save signature");
      }

      setSignatureUrl(data?.signature?.url || "");
      setSignatureMessage("Signature saved to cloudinary.");
      setUserData(prev => prev ? { ...prev, signature: data.signature } : prev);
      await refreshSignature();
    } catch (err) {
      setSignatureMessage(err.message || "Unable to save signature.");
    } finally {
      setSignatureLoading(false);
    }
  };

  const handleSignatureRemove = async () => {
    setSignatureLoading(true);
    setSignatureMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signature`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to remove signature");
      }

      setSignatureUrl("");
      setSignatureMessage("Signature removed.");
      setUserData(prev => prev ? { ...prev, signature: { url: null, public_id: null } } : prev);
      await refreshSignature();
    } catch (err) {
      setSignatureMessage(err.message || "Unable to remove signature.");
    } finally {
      setSignatureLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getLastValidatedText = () => {
    // You can implement actual validation date logic here
    return "Last validated: Recently";
  };

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", paddingLeft: SIDEBAR_WIDTH, background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <Sidebar onLogout={handleLogout} />

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-8 py-4 border-b border-white/5 backdrop-blur-md sticky top-0 z-10"
          style={{ background: "var(--surface)", borderColor: "var(--border-subtle)" }}
        >
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Shop Profile</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your workspace identity and billing details</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button 
                  onClick={handleCancelEdit}
                  className="px-5 py-2 rounded-lg border border-gray-500/50 text-gray-300 text-sm font-semibold bg-gray-600/10 hover:bg-gray-600/25 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="px-5 py-2 rounded-lg border border-violet-500/50 text-violet-300 text-sm font-semibold bg-violet-600/10 hover:bg-violet-600/25 transition-colors"
                >
                  Save Profile
                </button>
              </>
            ) : (
              <button 
                onClick={handleEditProfile}
                className="px-5 py-2 rounded-lg border border-violet-500/50 text-violet-300 text-sm font-semibold bg-violet-600/10 hover:bg-violet-600/25 transition-colors"
              >
                {profileData ? "Edit Profile" : "Edit Profile"}
              </button>
            )}
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 py-7 flex flex-col gap-6">

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mb-4"></div>
              <p className="font-mono text-sm">Loading profile...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-24 text-rose-400">
              <p className="text-4xl mb-3">⚠</p>
              <p className="font-mono text-sm">{error}</p>
              <button 
                onClick={fetchData}
                className="mt-4 px-4 py-2 rounded-lg bg-violet-600/20 border border-violet-500/40 text-violet-300 text-sm font-semibold hover:bg-violet-600/30 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Content */}
          {!loading && !error && userData && (
            <>
              {/* ── Business Identity Card ── */}
              <div className="grid grid-cols-[1fr_auto] gap-4">
                {/* Left — company info */}
                <div className="border rounded-xl p-5 flex items-center gap-5" style={surfaceCardStyle}>
                  {/* Logo placeholder */}
                  <div className="w-20 h-20 rounded-xl border flex items-center justify-center flex-shrink-0 overflow-hidden" style={surfaceMutedStyle}>
                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <span className="text-3xl">🏪</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.ShopName}
                          onChange={(e) => handleInputChange("ShopName", e.target.value)}
                          placeholder="Enter shop name"
                          className="text-xl font-bold text-white bg-transparent border-b border-violet-500/50 outline-none focus:border-violet-500 px-2 py-1"
                        />
                      ) : (
                        <h2 className="text-xl font-bold text-white">
                          {formData.ShopName || <span className="text-gray-600 italic">Shop Name</span>}
                        </h2>
                      )}
                      {profileData && (
                        <span className="text-[9px] font-mono font-bold tracking-widest text-violet-300 border border-violet-500/40 bg-violet-600/10 px-2 py-0.5 rounded">
                          VERIFIED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                      <span className="text-gray-600">@</span>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.Email}
                          onChange={(e) => handleInputChange("Email", e.target.value)}
                          placeholder="Enter email"
                          className="bg-transparent border-b border-violet-500/50 outline-none focus:border-violet-500 px-1"
                        />
                      ) : (
                        <span>{formData.Email || <span className="text-gray-600 italic">email@example.com</span>}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right — GST identifier */}
                <div className="border rounded-xl p-5 flex flex-col justify-center min-w-[240px]" style={surfaceCardStyle}>
                  <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-2">GST Identifier</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.GSTNumber}
                      onChange={(e) => handleInputChange("GSTNumber", e.target.value)}
                      placeholder="Enter GST Number"
                      className="text-xl font-bold font-mono text-cyan-400 tracking-wider mb-1.5 bg-transparent border-b border-cyan-500/50 outline-none focus:border-cyan-500"
                    />
                  ) : (
                    <p className="text-xl font-bold font-mono text-cyan-400 tracking-wider mb-1.5">
                      {formData.GSTNumber || <span className="text-gray-600 italic text-base">Not set</span>}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-600">{getLastValidatedText()}</p>
                </div>
              </div>

              {/* ── Business Information ── */}
              <div className="border rounded-xl p-6" style={surfaceCardStyle}>
                <SectionHeader icon="▣" title="Business Information" />
                <div className="flex flex-col gap-4">
                  {/* GST + Postal */}
                  <div className="grid grid-cols-2 gap-4">
                    <FieldBox 
                      label="Tax Identification (GST)" 
                      value={formData.GSTNumber} 
                      mono 
                      isEditing={isEditing}
                      onChange={(val) => handleInputChange("GSTNumber", val)}
                    />
                    <FieldBox 
                      label="Postal Code (Pincode)" 
                      value={formData.Pincode} 
                      mono 
                      isEditing={isEditing}
                      onChange={(val) => handleInputChange("Pincode", val)}
                    />
                  </div>
                  {/* Address */}
                  <FieldBox 
                    label="Full Business Address" 
                    value={formData.Address} 
                    isEditing={isEditing}
                    onChange={(val) => handleInputChange("Address", val)}
                  />
                </div>
              </div>

              {/* ── Contact Details ── */}
              <div className="border rounded-xl p-6" style={surfaceCardStyle}>
                <SectionHeader icon="?" title="Contact Details" />
                <div className="flex gap-4">
                  <div className="flex-1 border rounded-lg px-4 py-4 flex items-center gap-3" style={surfaceMutedStyle}>
                    <span className="text-gray-500 text-lg flex-shrink-0">📞</span>
                    <div className="flex-1">
                      <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Phone Number</p>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.Phone}
                          onChange={(e) => handleInputChange("Phone", e.target.value)}
                          placeholder="Enter phone number"
                          className="w-full text-sm font-semibold text-gray-100 bg-transparent outline-none focus:text-violet-300"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-gray-100">
                          {formData.Phone || <span className="text-gray-600 italic">Not set</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 border rounded-lg px-4 py-4 flex items-center gap-3" style={surfaceMutedStyle}>
                    <span className="text-gray-500 text-lg flex-shrink-0">✉</span>
                    <div className="flex-1">
                      <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Billing Email</p>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.Email}
                          onChange={(e) => handleInputChange("Email", e.target.value)}
                          placeholder="Enter email"
                          className="w-full text-sm font-semibold text-gray-100 bg-transparent outline-none focus:text-violet-300"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-gray-100">
                          {formData.Email || <span className="text-gray-600 italic">Not set</span>}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Authorised Signature ── */}
              <div className="border rounded-xl p-6" style={surfaceCardStyle}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <SectionHeader icon="✎" title="Authorised Signature" />
                    <p className="text-[11px] text-gray-500 -mt-1">Uploads here are used on invoices and PDF exports.</p>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] rounded-full px-3 py-1 border" style={surfaceMutedStyle}>
                    {signatureUrl ? "Synced" : "Not uploaded"}
                  </span>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-xl border p-4 flex flex-col gap-3" style={surfaceMutedStyle}>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Current signature</p>
                    <div className="min-h-[132px] rounded-lg border border-dashed border-white/10 bg-black/20 flex items-center justify-center overflow-hidden">
                      {signatureUrl ? (
                        <img
                          src={signatureUrl}
                          alt="Uploaded signature"
                          className="max-h-[120px] max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center px-4 py-6">
                          <p className="text-sm text-gray-300 font-medium">No signature uploaded yet</p>
                          <p className="text-xs text-gray-500 mt-1">Upload an image to show it on invoices.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border p-4 flex flex-col gap-3" style={surfaceMutedStyle}>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Upload / replace</p>
                    <label className="cursor-pointer rounded-lg border border-violet-500/30 bg-violet-600/10 px-4 py-3 text-sm font-semibold text-violet-200 hover:bg-violet-600/20 transition-colors">
                      {signatureLoading ? "Uploading..." : "Choose image"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} disabled={signatureLoading} />
                    </label>
                    <button
                      type="button"
                      onClick={handleSignatureRemove}
                      disabled={!signatureUrl || signatureLoading}
                      className="rounded-lg border border-gray-500/50 bg-gray-600/10 px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-gray-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Remove signature
                    </button>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, or WebP works best for invoice rendering.
                    </p>
                    {signatureMessage && (
                      <p className={`text-xs font-medium ${signatureMessage.toLowerCase().includes("error") ? "text-rose-400" : "text-emerald-400"}`}>
                        {signatureMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Shop Identifiers ── */}
              <div className="border rounded-xl p-6" style={surfaceCardStyle}>
                <SectionHeader icon="▭" title="Shop Identifiers" />
                <div className="w-[280px]">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Internal Shop Code</p>
                    <div className="border rounded-lg px-4 py-3 flex items-center justify-between group" style={surfaceMutedStyle}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.ShopCode}
                          onChange={(e) => handleInputChange("ShopCode", e.target.value)}
                          placeholder="Enter shop code"
                          className="flex-1 text-sm font-mono font-semibold text-gray-100 tracking-widest bg-transparent outline-none focus:text-violet-300"
                        />
                      ) : (
                        <>
                          <span className="text-sm font-mono font-semibold text-gray-100 tracking-widest">
                            {formData.ShopCode || <span className="text-gray-600 italic">Not set</span>}
                          </span>
                          {formData.ShopCode && (
                            <button
                              onClick={handleCopy}
                              title="Copy"
                              className="text-gray-600 hover:text-violet-400 transition-colors text-base ml-3"
                            >
                              {copied ? "✓" : "⧉"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Footer note ── */}
              <p className="text-[11px] text-gray-600 flex items-center gap-2 pb-2">
                <span className="text-violet-500">●</span>
                {profileData 
                  ? "To modify sensitive business details, click the Edit Profile button at the top."
                  : "Fill in your business details and click Save Profile to create your shop profile."
                }
                {profileData && " Some fields may require verification after saving."}
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}