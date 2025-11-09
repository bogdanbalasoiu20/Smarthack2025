"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // --- NOU --- Importăm componenta Link
import Swal from "sweetalert2";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

type BackendUser = {
  // ... (restul tipului)
};

// --- Definiții Iconițe (Inline SVG) ---
// ... (Toate iconițele rămân neschimbate) ...
const LayoutDashboard = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const BookOpen = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const NotebookText = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 6h4" />
    <path d="M2 10h4" />
    <path d="M2 14h4" />
    <path d="M2 18h4" />
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <path d="M14 2v20" />
    <path d="M18 7h-2" />
    <path d="M18 12h-2" />
    <path d="M18 17h-2" />
  </svg>
);

const Library = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m16 6 4 14" />
    <path d="M12 6v14" />
    <path d="M8 8v12" />
    <path d="M4 4v16" />
  </svg>
);

const Settings = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* ... cod svg ... */}
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .5 1.92v.5a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .5 1.92v.5a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .5 1.92v.5a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .5 1.92v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-.5-1.92v-.5a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-.5-1.92v-.5a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-.5-1.92v-.18a2 2 0 0 0-2-2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73-.73l-.22-.38a2 2 0 0 0 .73 2.73l.15-.1a2 2 0 0 1 .5-1.92V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const LogOut = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const Search = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" x2="16.65" y1="21" y2="16.65" />
  </svg>
);

const Bell = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CalendarCheck = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <path d="m9 16 2 2 4-4" />
  </svg>
);

const Star = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const Megaphone = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m3 11 18-5v12L3 14v-3z" />
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
  </svg>
);

const Menu = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="3" x2="21" y1="6" y2="6" />
    <line x1="3" x2="21" y1="12" y2="12" />
    <line x1="3" x2="21" y1="18" y2="18" />
  </svg>
);

// --- ICONIȚE NOI PENTRU ROLURI ---
const Users = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PlusCircle = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="16" />
    <line x1="8" x2="16" y1="12" y2="12" />
  </svg>
);

const Edit = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const X = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
);

const Trash2 = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

// --- Date Statice (Mock Data) ---

const mockGrades = [
  { id: 1, title: "Test Grilă 1", course: "Istoria Artei", grade: "9.50" },
  { id: 2, title: "Tema 1: HTML/CSS", course: "Programare Web", grade: "10.00" },
  { id: 3, title: "Prezentare: Romantismul", course: "Literatură", grade: "8.75" },
];

const mockAssignmentsToGrade = [
  {
    id: 1,
    title: "Eseu: Cubismul",
    course: "Istoria Artei",
    pending: 12,
  },
  {
    id: 2,
    title: "Tema 2: Hooks",
    course: "Programare Web",
    pending: 5,
  },
];

const mockStudentGroups = [
  { id: "clasa_9a", name: "Clasa 9A" },
  { id: "clasa_9b", name: "Clasa 9B" },
  { id: "clasa_10a", name: "Clasa 10A" },
  { id: "clasa_11c", name: "Clasa 11C" },
  { id: "grupa_info_avansat", name: "Grupă Info Avansat" },
];

// --- Componentele Dashboard-ului ---

/**
 * NavItem: Un singur element din meniul lateral
 */
const NavItem = ({ icon: Icon, label, active = false, href = "#" }) => {
  return (
    <a
      href={href}
      className={`
        flex items-center px-4 py-2.5 rounded-lg text-sm font-medium
        transition-colors duration-150
        ${
          active
            ? "bg-blue-600 text-white shadow-lg"
            : "text-gray-300 hover:text-white hover:bg-gray-700"
        }
      `}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-5 w-5 mr-3" />
      {label}
    </a>
  );
};

/**
 * Sidebar: Meniul lateral de navigare
 */
const Sidebar = ({ isSidebarOpen, userRole }) => {
  // ... (codul Sidebar rămâne neschimbat)
  const [activeLink, setActiveLink] = useState("Dashboard");

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-64
        flex flex-col
        bg-gray-800 dark:bg-gray-900 shadow-xl
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
      `}
    >
      {/* Logo/Titlu */}
      <div className="flex items-center justify-center h-20 px-6 border-b border-gray-700">
        <BookOpen className="h-8 w-8 text-blue-400" />
        <span className="ml-3 text-2xl font-bold text-white">Academia</span>
      </div>

      {/* Navigare Dinamică */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Navigare ELEV */}
        {userRole === "ELEV" && (
          <>
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              active={activeLink === "Dashboard"}
              onClick={() => setActiveLink("Dashboard")}
            />
            <NavItem
              icon={BookOpen}
              label="Cursurile Mele"
              active={activeLink === "Cursuri"}
              onClick={() => setActiveLink("Cursuri")}
            />
            <NavItem
              icon={NotebookText}
              label="Notele Mele"
              active={activeLink === "Note"}
              onClick={() => setActiveLink("Note")}
            />
            <NavItem
              icon={Library}
              label="Catalog Cursuri"
              active={activeLink === "Catalog"}
              onClick={() => setActiveLink("Catalog")}
            />
          </>
        )}

        {/* Navigare PROFESOR */}
        {userRole === "PROFESOR" && (
          <>
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              active={activeLink === "Dashboard"}
              onClick={() => setActiveLink("Dashboard")}
            />
            <NavItem
              icon={Edit}
              label="Management Cursuri"
              active={activeLink === "Management"}
              onClick={() => setActiveLink("Management")}
            />
            <NavItem
              icon={NotebookText}
              label="Centru de Notare"
              active={activeLink === "Notare"}
              onClick={() => setActiveLink("Notare")}
            />
            <NavItem
              icon={Users}
              label="Studenți"
              active={activeLink === "Studenti"}
              onClick={() => setActiveLink("Studenti")}
            />
            <NavItem
              icon={Megaphone}
              label="Anunțuri"
              active={activeLink === "Anunturi"}
              onClick={() => setActiveLink("Anunturi")}
            />
          </>
        )}

        {/* Navigare ADMIN (Exemplu) */}
        {userRole === "ADMIN" && (
          <>
            <NavItem icon={LayoutDashboard} label="Statistici" active />
            <NavItem icon={Users} label="Management Useri" />
            <NavItem icon={Library} label="Management Cursuri" />
          </>
        )}
      </nav>
    </aside>
  );
};

/**
 * Navbar: Bara de sus a conținutului principal
 */
const Navbar = ({ onMenuClick, userName, onLogout }) => {
  // ... (codul Navbar rămâne neschimbat)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Hook pentru a închide dropdown-ul la click în afara lui
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Buton meniu mobil (doar pe lg:hidden) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Căutare */}
        <div className="hidden md:block">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Caută cursuri sau teme..."
              className="
                w-full md:w-80 pl-10 pr-4 py-2
                rounded-lg border border-gray-300 dark:border-gray-600
                bg-gray-50 dark:bg-gray-700
                text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>
        </div>

        {/* Spacer pentru a alinia la dreapta pe mobil */}
        <div className="flex-1 md:hidden"></div>

        {/* Acțiuni dreapta (Notificări, Profil) */}
        <div className="flex items-center space-x-4">
          <button className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Bell className="h-6 w-6" />
          </button>

          {/* Meniu Profil (cu Dropdown) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <img
                src={`https://placehold.co/40x40/E2E8F0/A0AEC0?text=${userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}`}
                alt="Avatar profil"
                className="h-9 w-9 rounded-full border-2 border-gray-300 dark:border-gray-500"
              />
              <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                {userName}
              </span>
              {/* Săgeată dropdown */}
              <svg
                className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Dropdown-ul */}
            {isDropdownOpen && (
              <div
                className="
                  absolute right-0 mt-2 w-48
                  origin-top-right rounded-md shadow-lg
                  bg-white dark:bg-gray-800
                  ring-1 ring-black ring-opacity-5 dark:ring-gray-700
                  focus:outline-none
                "
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
              >
                <div className="py-1" role="none">
                  <a
                    href="#" // TODO: Înlocuiește cu link-ul real către setări
                    className="
                      flex items-center px-4 py-2 text-sm
                      text-gray-700 dark:text-gray-300
                      hover:bg-gray-100 dark:hover:bg-gray-700
                    "
                    role="menuitem"
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Setări
                  </a>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="
                      flex items-center w-full text-left px-4 py-2 text-sm
                      text-red-600 dark:text-red-400
                      hover:bg-gray-100 dark:hover:bg-gray-700
                    "
                    role="menuitem"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Delogare
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * CourseCard: Un card individual pentru un curs (MODIFICAT)
 */
const CourseCard = ({ course, userRole, onEditClick }) => {
  const isElev = userRole === "ELEV";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <div
        className={`h-24 w-full ${course.color} flex items-center justify-center`}
      >
        <BookOpen className="h-10 w-10 text-white opacity-50" />
      </div>
      <div className="p-5">
        {/* --- MODIFICAT --- Titlul este acum un Link */}
        <Link href={`/dashboard/cursuri/${course.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate hover:text-blue-500 dark:hover:text-blue-400 hover:underline cursor-pointer transition-colors">
            {course.title}
          </h3>
        </Link>
        {isElev ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {course.teacher}
          </p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {course.students} Studenți înscriși
          </p>
        )}

        {isElev && (
          <>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
              <div
                className={`${course.color} h-2.5 rounded-full`}
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
              {course.progress}% Completat
            </p>
          </>
        )}
      </div>
      <div className="px-5 pb-5">
        {isElev ? (
          // --- MODIFICAT --- Butonul "Vezi Cursul" este acum un <Link>
          <Link
            href={`/dashboard/cursuri/${course.id}`}
            className={`
              block w-full text-center px-4 py-2 rounded-lg text-sm font-medium
              ${course.color.replace("bg-", "text-").replace("-500", "-600")}
              dark:${course.color
                .replace("bg-", "text-")
                .replace("-500", "-400")}
              ${course.color.replace("bg-", "bg-").replace("-500", "-100")}
              dark:${course.color
                .replace("bg-", "bg-")
                .replace("-500", "-900/30")}
              hover:${course.color
                .replace("bg-", "bg-")
                .replace("-500", "-200")}
              dark:hover:${course.color
                .replace("bg-", "bg-")
                .replace("-500", "-900/50")}
              transition-colors
            `}
          >
            Vezi Cursul
          </Link>
        ) : (
          <button
            type="button"
            onClick={onEditClick} // Acesta deschide modalul de editare
            className={`
              block w-full text-center px-4 py-2 rounded-lg text-sm font-medium
              ${course.color.replace("bg-", "text-").replace("-500", "-600")}
              dark:${course.color
                .replace("bg-", "text-")
                .replace("-500", "-400")}
              ${course.color.replace("bg-", "bg-").replace("-500", "-100")}
              dark:${course.color
                .replace("bg-", "bg-")
                .replace("-500", "-900/30")}
              hover:${course.color
                .replace("bg-", "bg-")
                .replace("-500", "-200")}
              dark:hover:${course.color
                .replace("bg-", "bg-")
                .replace("-500", "-900/50")}
              transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
              ${course.color.replace("bg-", "focus:ring-").replace("-500", "-500")}
            `}
          >
            Editează Cursul
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * ListItem: Componentă generică pentru listele de pe dashboard
 */
const ListItem = ({ icon: Icon, title, subtitle, info, colorClass }) => {
  // ... (codul ListItem rămâne neschimbat)
  return (
    <li className="flex items-center space-x-4 py-3">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {subtitle}
        </p>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
        {info}
      </div>
    </li>
  );
};

// --- LAYOUT PRINCIPAL ---
/**
 * DashboardLayout: Container-ul care deține Sidebar și Navbar
 */
const DashboardLayout = ({
  userRole,
  userName,
  children,
  onMenuClick,
  onLogout,
}) => {
  // ... (codul DashboardLayout rămâne neschimbat)
  return (
    <>
      {/* Navbar */}
      <Navbar
        onMenuClick={onMenuClick}
        userName={userName}
        onLogout={onLogout}
      />

      {/* Zona de conținut principal (scrollabilă) */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </>
  );
};

// --- Componenta Modal pentru Crearea Cursului ---
const CreateCourseModal = ({ isOpen, onClose, onAddCourse }) => {
  // ... (codul CreateCourseModal rămâne neschimbat)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroups, setSelectedGroups] = useState(new Set());
  const modalRef = useRef(null);

  // Închide modalul la click în afara lui
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Resetează starea când se deschide
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setSelectedGroups(new Set());
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleGroupToggle = (groupId) => {
    const newSelection = new Set(selectedGroups);
    if (newSelection.has(groupId)) {
      newSelection.delete(groupId);
    } else {
      newSelection.add(groupId);
    }
    setSelectedGroups(newSelection);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) {
      Swal.fire({
        icon: "info",
        title: "Title required",
        text: "Please provide a course title before saving.",
      });
      return;
    }
    onAddCourse({
      title,
      description,
      groups: Array.from(selectedGroups),
    });
    onClose(); // Închide modalul
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      {/* Containerul Modalului */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800"
      >
        {/* Antet Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Creează un Curs Nou
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formular */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Titlu Curs */}
          <div>
            <label
              htmlFor="courseTitle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Titlu Curs
            </label>
            <input
              type="text"
              id="courseTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Descriere Curs */}
          <div>
            <label
              htmlFor="courseDescription"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Descriere (opțional)
            </label>
            <textarea
              id="courseDescription"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Selecție Grupuri */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Adaugă grupuri de studenți
            </label>
            <div className="mt-2 p-2 border border-gray-300 rounded-lg dark:border-gray-600 max-h-40 overflow-y-auto space-y-2">
              {mockStudentGroups.map((group) => (
                <label
                  key={group.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedGroups.has(group.id)}
                    onChange={() => handleGroupToggle(group.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {group.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Subsol Modal (Butoane) */}
          <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Anulează
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700"
            >
              Salvează Cursul
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Componenta Modal pentru Editarea Cursului ---
const EditCourseModal = ({ isOpen, onClose, course, onSave, onDelete }) => {
  // ... (codul EditCourseModal rămâne neschimbat)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGroups, setSelectedGroups] = useState(new Set());
  const modalRef = useRef(null);

  // Pre-populează formularul când se schimbă cursul (la deschidere)
  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description || ""); // Setează descrierea dacă există
      setSelectedGroups(new Set(course.groups || [])); // Setează grupurile dacă există
    }
  }, [course]);

  // Închide modalul la click în afara lui
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !course) {
    return null;
  }

  const handleGroupToggle = (groupId) => {
    const newSelection = new Set(selectedGroups);
    if (newSelection.has(groupId)) {
      newSelection.delete(groupId);
    } else {
      newSelection.add(groupId);
    }
    setSelectedGroups(newSelection);
  };

  // Salvează modificările
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) {
      Swal.fire({
        icon: "info",
        title: "Title required",
        text: "Please provide a course title before publishing.",
      });
      return;
    }
    onSave({
      ...course, // Păstrează id-ul și culoarea veche
      title,
      description,
      groups: Array.from(selectedGroups),
    });
    onClose();
  };

  // Șterge cursul
  const handleDelete = () => {
    // Afișează o confirmare
    if (
      window.confirm(
        `Sunteți sigur că doriți să ștergeți cursul "${course.title}"? Această acțiune este ireversibilă.`
      )
    ) {
      onDelete(course.id);
      onClose();
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      {/* Containerul Modalului */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800"
      >
        {/* Antet Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Editează Cursul
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formular */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Titlu Curs */}
          <div>
            <label
              htmlFor="editCourseTitle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Titlu Curs
            </label>
            <input
              type="text"
              id="editCourseTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Descriere Curs */}
          <div>
            <label
              htmlFor="editCourseDescription"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Descriere (opțional)
            </label>
            <textarea
              id="editCourseDescription"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Selecție Grupuri */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Adaugă grupuri de studenți
            </label>
            <div className="mt-2 p-2 border border-gray-300 rounded-lg dark:border-gray-600 max-h-40 overflow-y-auto space-y-2">
              {mockStudentGroups.map((group) => (
                <label
                  key={group.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedGroups.has(group.id)}
                    onChange={() => handleGroupToggle(group.id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {group.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Subsol Modal (Butoane) */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Buton Ștergere (stânga) */}
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Șterge Cursul
            </button>
            {/* Butoane Salvare/Anulare (dreapta) */}
            <div className="space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700"
              >
                Salvează Modificările
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENTE SPECIFICE ROLURILOR ---

/**
 * ElevDashboard: Conținutul pentru rolul ELEV
 */
const ElevDashboard = ({ userName }) => {
  // ... (codul ElevDashboard rămâne neschimbat)
  const [courses, setCourses] = useState([]);

  return (
    <>
      {/* Antet */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Bun venit, {userName}!
      </h1>

      {/* Grila de widget-uri */}
      <div className="space-y-6">
        {/* Widget: Cursurile Mele */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Cursurile Mele
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length > 0 ? (
              courses.map((course) => (
                <CourseCard key={course.id} course={course} userRole="ELEV" />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 md:col-span-2 lg:col-span-3">
                Nu sunteți înscris la niciun curs momentan.
              </p>
            )}
          </div>
        </div>

        {/* Widget: Note Recente */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Note Recente
          </h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {mockGrades.map((item) => (
              <ListItem
                key={item.id}
                icon={Star}
                title={item.title}
                subtitle={item.course}
                info={item.grade}
                colorClass="bg-green-500"
              />
            ))}
          </ul>
        </div>

        {/* Widget: Anunțuri */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Anunțuri Recente
          </h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            <ListItem
              icon={Megaphone}
              title="Examenul final la Istoria Artei a fost reprogramat"
              subtitle="Prof. Ionescu"
              info="Acum 2 ore"
              colorClass="bg-yellow-500"
            />
            <ListItem
              icon={Megaphone}
              title="Mentenanță platformă"
              subtitle="Admin"
              info="Ieri"
              colorClass="bg-gray-500"
            />
          </ul>
        </div>
      </div>
    </>
  );
};

// --- Paletă de culori globală pentru cursuri noi ---
const courseColors = [
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-cyan-500",
];

/**
 * ProfesorDashboard: Conținutul pentru rolul PROFESOR
 */
const ProfesorDashboard = ({ userName }) => {
  // ... (codul ProfesorDashboard rămâne neschimbat)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [courseToEdit, setCourseToEdit] = useState(null);

  // Funcție pentru a adăuga un curs nou
  const handleAddCourse = (formData) => {
    const studentCount = formData.groups.length * 10; // Simulare
    const newCourse = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      groups: formData.groups,
      students: studentCount,
      color: courseColors[courses.length % courseColors.length],
    };
    setCourses((prevCourses) => [...prevCourses, newCourse]);
  };

  // Funcție pentru a salva un curs editat
  const handleSaveCourse = (updatedCourse) => {
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.id === updatedCourse.id) {
          const studentCount = updatedCourse.groups.length * 10; // Simulare
          return {
            ...updatedCourse,
            students: studentCount,
          };
        }
        return c;
      })
    );
  };

  // Funcție pentru a șterge un curs
  const handleDeleteCourse = (courseId) => {
    setCourses((prevCourses) => prevCourses.filter((c) => c.id !== courseId));
  };

  return (
    <>
      {/* Antet */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Bun venit, {userName}!
      </h1>

      {/* Grila de widget-uri */}
      <div className="space-y-6">
        {/* Widget: Cursurile Mele (Profesor) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Cursurile Mele
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Creează Curs Nou
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length > 0 ? (
              courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  userRole="PROFESOR"
                  onEditClick={() => setCourseToEdit(course)}
                />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 md:col-span-2 lg:col-span-3">
                Nu ați creat încă niciun curs. Apăsați pe "Creează Curs Nou"
                pentru a începe.
              </p>
            )}
          </div>
        </div>

        {/* Grilă cu 2 coloane pentru listele de widget-uri */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Widget: Teme de Corectat */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Teme de Corectat
            </h3>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockAssignmentsToGrade.map((item) => (
                <ListItem
                  key={item.id}
                  icon={Edit}
                  title={item.title}
                  subtitle={item.course}
                  info={`${item.pending} de corectat`}
                  colorClass="bg-orange-500"
                />
              ))}
            </ul>
          </div>

          {/* Widget: Creează Anunț Rapid */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Anunț Rapid
            </h3>
            <form className="space-y-4">
              <textarea
                rows="3"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Scrie anunțul aici..."
              ></textarea>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
              >
                Trimite Anunțul
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de creare */}
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCourse={handleAddCourse}
      />

      {/* Modal de editare */}
      <EditCourseModal
        isOpen={!!courseToEdit}
        onClose={() => setCourseToEdit(null)}
        course={courseToEdit}
        onSave={handleSaveCourse}
        onDelete={handleDeleteCourse}
      />
    </>
  );
};

/**
 * AdminDashboard: Conținutul pentru rolul ADMIN
 */
const AdminDashboard = ({ userName }) => {
  // ... (codul AdminDashboard rămâne neschimbat)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [courseToEdit, setCourseToEdit] = useState(null);

  const handleAddCourse = (formData) => {
    const studentCount = formData.groups.length * 10; // Simulare
    const newCourse = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      groups: formData.groups,
      students: studentCount,
      color: courseColors[courses.length % courseColors.length],
    };
    setCourses((prevCourses) => [...prevCourses, newCourse]);
  };

  const handleSaveCourse = (updatedCourse) => {
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.id === updatedCourse.id) {
          const studentCount = updatedCourse.groups.length * 10; // Simulare
          return {
            ...updatedCourse,
            students: studentCount,
          };
        }
        return c;
      })
    );
  };

  const handleDeleteCourse = (courseId) => {
    setCourses((prevCourses) => prevCourses.filter((c) => c.id !== courseId));
  };

  return (
    <>
      {/* Antet */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Bun venit, {userName}!
      </h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Panou Administrator
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Creează Curs Nou
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Managementul cursurilor și utilizatorilor.
        </p>

        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Toate Cursurile
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length > 0 ? (
              courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  userRole="ADMIN"
                  onEditClick={() => setCourseToEdit(course)}
                />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 md:col-span-2 lg:col-span-3">
                Nu există cursuri create în platformă.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de creare */}
      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCourse={handleAddCourse}
      />

      {/* Modal de editare */}
      <EditCourseModal
        isOpen={!!courseToEdit}
        onClose={() => setCourseToEdit(null)}
        course={courseToEdit}
        onSave={handleSaveCourse}
        onDelete={handleDeleteCourse}
      />
    </>
  );
};

// --- COMPONENTA PRINCIPALĂ (Controller-ul) ---

export default function DashboardPage() {
  // ... (codul DashboardPage rămâne neschimbat)
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState("Utilizator");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    if (!token) {
      setError("Nu sunteti autentificat. Va rugam sa va logati.");
      setIsLoading(false);
      router.replace("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load user profile");
        }

        const data: BackendUser = await response.json();
        if (!isMounted) {
          return;
        }

        const resolvedRole =
          data.role ||
          (data.groups && data.groups.length > 0 ? data.groups[0] : null);

        setUserRole(resolvedRole);
        if (resolvedRole) {
          localStorage.setItem("userRole", resolvedRole);
        } else {
          localStorage.removeItem("userRole");
        }

        const computedName = `${data.first_name ?? ""} ${
          data.last_name ?? ""
        }`
          .trim()
          .replace(/\s+/g, " ");
        const finalName =
          computedName.length > 0 ? computedName : data.username;
        setUserName(finalName);
        localStorage.setItem("userName", finalName);
        setError(null);
      } catch (fetchError) {
        console.error("Failed to load user profile", fetchError);
        if (isMounted) {
          setError("Sesiunea a expirat. Autentificati-va din nou.");
        }
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        router.replace("/login");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    try {
      if (token) {
        await fetch(`${API_BASE_URL}/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
      }
    } catch (logoutError) {
      console.error("Logout failed", logoutError);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      router.replace("/login");
    }
  };

  const renderDashboardContent = () => {
    switch (userRole) {
      case "ELEV":
        return <ElevDashboard userName={userName} />;
      case "PROFESOR":
        return <ProfesorDashboard userName={userName} />;
      case "ADMIN":
        return <AdminDashboard userName={userName} />;
      default:
        return (
          <div className="text-center p-10">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              {error ?? "Rol invalid sau negasit."}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {error
                ? "Veti fi redirectionat catre pagina de autentificare."
                : "Va rugam sa va autentificati pentru a continua."}
            </p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-950 items-center justify-center">
        <p className="text-xl text-gray-700 dark:text-gray-300">
          Se incarca...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <Sidebar isSidebarOpen={isSidebarOpen} userRole={userRole} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardLayout
          userRole={userRole}
          userName={userName}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
        >
          {renderDashboardContent()}
        </DashboardLayout>
      </div>
    </div>
  );
}
