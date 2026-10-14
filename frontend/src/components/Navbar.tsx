"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Calendar,
  Activity,
  Zap,
  X,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";

interface SearchResultItem {
  id: string;
  type: string; // "patient" | "appointment" | "report" | "action"
  title: string;
  subtitle?: string;
  url: string;
  badge?: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      const role = localStorage.getItem("role") || "";
      const name = localStorage.getItem("user_name") || "";
      setIsAuthenticated(!!token);
      setUserRole(role);
      setUserName(name || (role === "DOCTOR" ? "Doctor" : "Patient"));
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [pathname]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K or "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      setSelectedIndex(-1);
      return;
    }

    if (!isAuthenticated) {
      // Local fallback for unauthenticated users
      const publicShortcuts: SearchResultItem[] = [
        { id: "pub-login", type: "action", title: "Sign In", subtitle: "Access patient or doctor portal", url: "/login", badge: "Auth" },
        { id: "pub-reg-p", type: "action", title: "Patient Registration", subtitle: "Create a new patient profile", url: "/register", badge: "Account" },
        { id: "pub-reg-d", type: "action", title: "Doctor Registration", subtitle: "Register medical credentials", url: "/register/doctor", badge: "Account" },
      ];
      setSearchResults(
        publicShortcuts.filter((s) => s.title.toLowerCase().includes(trimmed.toLowerCase()))
      );
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const res = await api.get("/search", {
          params: { q: trimmed },
        });
        setSearchResults(res.data.results || []);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_name");
    setIsAuthenticated(false);
    router.push("/login");
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/doctor/appointments")) return { title: "Appointments", sub: "Manage scheduled patient visits" };
    if (pathname.startsWith("/doctor/patients")) return { title: "My Patients", sub: "Patient directory and records" };
    if (pathname.startsWith("/doctor/reports")) return { title: "Diagnostic Reports", sub: "Review AI scan predictions" };
    if (pathname.startsWith("/doctor/notes")) return { title: "Consultation Notes", sub: "Clinical observations & guidance" };
    if (pathname.startsWith("/doctor/prescriptions")) return { title: "Prescriptions", sub: "Medication & dosage orders" };
    if (pathname.startsWith("/doctor/profile")) return { title: "Doctor Profile", sub: "Medical license & credentials" };
    if (pathname.startsWith("/doctor")) return { title: "Doctor Portal", sub: "Clinical Workspace & Overview" };
    if (pathname.startsWith("/patient")) return { title: "Patient Portal", sub: "Personal Health Overview" };
    if (pathname === "/" || pathname === "/dashboard") return { title: "Dashboard", sub: "Welcome back to VitaScan AI", hideBack: true };
    if (pathname.includes("/new-scan")) return { title: "New Diagnostic Scan", sub: "Upload medical data for AI analysis" };
    if (pathname.includes("/reports")) return { title: "Medical Reports", sub: "Review patient scan results" };
    if (pathname.includes("/appointments")) return { title: "Appointments", sub: "Manage patient visits" };
    if (pathname.includes("/profile")) return { title: "Provider Profile", sub: "Manage your credentials and settings" };
    return { title: "Portal", sub: "VitaScan AI Workspace" };
  };

  const { title, sub } = getPageTitle();

  // Quick suggestions shown when search input is empty
  const defaultSuggestions: SearchResultItem[] =
    userRole === "DOCTOR"
      ? [
          { id: "sugg-pats", type: "patient", title: "My Patients", subtitle: "Directory of registered patients", url: "/doctor/patients", badge: "Directory" },
          { id: "sugg-reps", type: "report", title: "Diagnostic Reports", subtitle: "Review AI scan predictions & approve", url: "/doctor/reports", badge: "AI Scans" },
          { id: "sugg-appts", type: "appointment", title: "Appointments", subtitle: "View and manage scheduled visits", url: "/doctor/appointments", badge: "Schedule" },
          { id: "sugg-rx", type: "action", title: "Prescriptions", subtitle: "Issue & manage medications", url: "/doctor/prescriptions", badge: "Rx" },
          { id: "sugg-notes", type: "action", title: "Consultation Notes", subtitle: "Clinical notes & observations", url: "/doctor/notes", badge: "Notes" },
        ]
      : [
          { id: "sugg-scan", type: "action", title: "New Diagnostic Scan", subtitle: "Upload MRI, CT, or Ultrasound image", url: "/dashboard/new-scan", badge: "AI Screen" },
          { id: "sugg-rep", type: "report", title: "Medical Reports", subtitle: "Review past scan results and diagnoses", url: "/dashboard/reports", badge: "History" },
          { id: "sugg-app", type: "appointment", title: "Book Appointment", subtitle: "Schedule consultation with a doctor", url: "/dashboard/appointments", badge: "Visit" },
          { id: "sugg-prof", type: "action", title: "Health Profile", subtitle: "Update medical details and contact info", url: "/dashboard/profile", badge: "Profile" },
        ];

  const displayedItems = searchQuery.trim().length > 0 ? searchResults : defaultSuggestions;

  const navigateToResult = (url: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(url);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!displayedItems.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < displayedItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : displayedItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < displayedItems.length) {
        navigateToResult(displayedItems[selectedIndex].url);
      } else if (displayedItems.length > 0) {
        navigateToResult(displayedItems[0].url);
      }
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "patient":
        return <UserIcon size={16} className="text-blue-600" />;
      case "appointment":
        return <Calendar size={16} className="text-amber-600" />;
      case "report":
        return <Activity size={16} className="text-emerald-600" />;
      case "action":
      default:
        return <Zap size={16} className="text-indigo-600" />;
    }
  };

  const getItemBadgeClasses = (type: string) => {
    switch (type) {
      case "patient":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "appointment":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "report":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "action":
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all h-20">
      <div className="flex items-center justify-between h-full px-8">
        
        {/* Left: Page Title */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>
            <p className="text-sm font-medium text-gray-500">
              {sub}
            </p>
          </div>
        </div>

        {/* Right: Search, Notifications & User Session */}
        <div className="flex items-center gap-5">

          {/* Interactive Global Search Component */}
          <div ref={searchContainerRef} className="relative hidden md:block">
            <div
              className={`flex items-center bg-gray-50/90 border transition-all rounded-full px-4 py-2 w-64 lg:w-80 ${
                isSearchOpen
                  ? "ring-2 ring-blue-500/30 border-blue-500 bg-white shadow-lg w-72 lg:w-96"
                  : "border-gray-200/80 hover:border-gray-300 hover:bg-gray-100/70"
              }`}
            >
              <Search
                size={18}
                className={`mr-2.5 transition-colors ${
                  isSearchOpen ? "text-blue-600" : "text-gray-400"
                }`}
              />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isSearchOpen) setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={handleInputKeyDown}
                placeholder={
                  userRole === "DOCTOR"
                    ? "Search patients, scans, records..."
                    : "Search scans, appointments..."
                }
                className="bg-transparent outline-none text-sm w-full font-medium placeholder:text-gray-400 text-gray-800"
              />

              {/* Status Indicator / Clear Button / Keyboard Shortcut */}
              <div className="flex items-center gap-1.5 ml-2">
                {isSearching ? (
                  <Loader2 size={16} className="text-blue-500 animate-spin" />
                ) : searchQuery.length > 0 ? (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/50 transition-colors"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[11px] font-semibold text-gray-400 bg-gray-100 border border-gray-200/70 rounded px-1.5 py-0.5 pointer-events-none">
                    <span className="text-[10px]">Ctrl</span> K
                  </kbd>
                )}
              </div>
            </div>

            {/* Search Dropdown Modal */}
            {isSearchOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-[360px] lg:w-[440px] bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 overflow-hidden backdrop-blur-2xl bg-white/95 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-2 mb-1 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    {searchQuery.trim().length > 0 ? (
                      <>
                        <Search size={12} className="text-blue-500" />
                        <span>Search Matches ({searchResults.length})</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} className="text-amber-500" />
                        <span>Quick Shortcuts</span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 lowercase font-normal">
                    press <kbd className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-600 uppercase text-[9px]">ESC</kbd> to exit
                  </span>
                </div>

                {/* Results List */}
                <div className="max-h-[360px] overflow-y-auto px-2 space-y-1">
                  {isSearching ? (
                    <div className="py-8 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                      <Loader2 size={24} className="animate-spin text-blue-600" />
                      <p className="text-xs font-medium text-gray-500">Searching clinical records...</p>
                    </div>
                  ) : displayedItems.length > 0 ? (
                    displayedItems.map((item, index) => {
                      const isSelected = index === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigateToResult(item.url)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full flex items-center justify-between text-left p-2.5 rounded-xl transition-all ${
                            isSelected
                              ? "bg-blue-50/80 text-blue-900 shadow-sm"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                isSelected
                                  ? "bg-white border-blue-200 shadow-sm"
                                  : "bg-gray-50 border-gray-100"
                              }`}
                            >
                              {getItemIcon(item.type)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {item.title}
                              </p>
                              {item.subtitle && (
                                <p className="text-xs text-gray-500 truncate">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            {item.badge && (
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getItemBadgeClasses(
                                  item.type
                                )}`}
                              >
                                {item.badge}
                              </span>
                            )}
                            <ArrowRight
                              size={14}
                              className={`transition-transform ${
                                isSelected
                                  ? "text-blue-600 translate-x-0.5"
                                  : "text-gray-300 opacity-0 group-hover:opacity-100"
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-8 px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-2 border border-gray-100">
                        <Search size={20} />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">
                        No results found for &ldquo;{searchQuery}&rdquo;
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try searching by patient name, email, report class, or quick action keywords.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Tip */}
                <div className="mt-2 pt-2 px-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    Navigate with <kbd className="bg-gray-100 px-1 py-0.5 rounded text-[10px] text-gray-600 font-mono">↑</kbd> <kbd className="bg-gray-100 px-1 py-0.5 rounded text-[10px] text-gray-600 font-mono">↓</kbd>
                  </span>
                  <span className="flex items-center gap-1">
                    Select with <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-600 font-mono">Enter</kbd>
                  </span>
                </div>
              </div>
            )}
          </div>

          <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors hidden md:block">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="w-px h-8 bg-gray-200 mx-1 hidden md:block"></div>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all ring-4 ring-white">
                  <UserIcon size={18} />
                </div>
                <div className="hidden md:block">
                  <p className="font-semibold text-gray-800 text-sm leading-tight">
                    {userName}
                  </p>
                  <p className="text-xs font-medium text-blue-600 capitalize">
                    {userRole ? userRole.toLowerCase() : "Active Session"}
                  </p>
                </div>
                <ChevronDown size={16} className="text-gray-400 hidden md:block" />
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors tooltip"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          )}

        </div>

      </div>
    </nav>
  );
}