"use client";

import React, { useState, useEffect } from "react";

// --- Definiții Iconițe (Inline SVG) ---
// ... iconițe existente ...
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
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .5 1.92v.5a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .5 1.92v.5a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .5 1.92v.5a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .5 1.92v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-.5-1.92v-.5a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-.5-1.92v-.5a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-.5-1.92v-.18a2 2 0 0 0-2-2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73-.73l-.22-.38a2 2 0 0 0 .73-2.73l.15-.1a2 2 0 0 1 .5-1.92V4a2 2 0 0 0-2-2z" />
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

// --- Date Statice (Mock Data) ---
// ... date existente ...
const mockCourses = [
  {
    id: 1,
    title: "Istoria Artei Moderne",
    teacher: "Prof. Ionescu",
    progress: 75,
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Programare Web (React)",
    teacher: "Prof. Popescu",
    progress: 40,
    color: "bg-indigo-500",
  },
  {
    id: 3,
    title: "Literatură Comparată",
    teacher: "Prof. Vasilescu",
    progress: 90,
    color: "bg-purple-500",
  },
];

const mockAssignments = [
  { id: 1, title: "Eseu: Cubismul", course: "Istoria Artei", due: "2 zile" },
  { id: 2, title: "Proiect Final", course: "Programare Web", due: "5 zile" },
  { id: 3, title: "Citire: Capitolul 4", course: "Literatură", due: "Mâine" },
];

const mockGrades = [
  { id: 1, title: "Test Grilă 1", course: "Istoria Artei", grade: "9.50" },
  { id: 2, title: "Tema 1: HTML/CSS", course: "Programare Web", grade: "10.00" },
  { id: 3, title: "Prezentare: Romantismul", course: "Literatură", grade: "8.75" },
];

// --- DATE NOI PENTRU PROFESOR ---
const mockProfCourses = [
  {
    id: 1,
    title: "Istoria Artei Moderne",
    students: 45,
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Programare Web (React)",
    students: 30,
    color: "bg-indigo-500",
  },
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
 * Sidebar: Meniul lateral de navigare (ACUM DINAMIC)
 */
const Sidebar = ({ isSidebarOpen, userRole }) => {
  // Simulare pentru link-ul activ
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

      {/* Partea de jos a sidebar-ului */}
      <div className="p-4 border-t border-gray-700">
        <NavItem icon={Settings} label="Setări" />
        <a
          href="#" // Ar trebui să gestioneze delogarea
          className="
            flex items-center w-full px-4 py-2.5 mt-2 rounded-lg text-sm font-medium
            text-red-400 hover:text-white hover:bg-red-500
            transition-colors duration-150
          "
          onClick={() => {
            localStorage.removeItem("userRole");
            localStorage.removeItem("authToken");
            window.location.href = "/login";
          }}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Delogare
        </a>
      </div>
    </aside>
  );
};

/**
 * Navbar: Bara de sus a conținutului principal
 */
const Navbar = ({ onMenuClick, userName }) => {
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

          {/* Meniu Profil */}
          <div className="relative">
            <button className="flex items-center space-x-2 focus:outline-none">
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
            </button>
            {/* Dropdown-ul poate fi implementat ulterior */}
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * CourseCard: Un card individual pentru un curs (ACUM DINAMIC)
 */
const CourseCard = ({ course, userRole }) => {
  const isElev = userRole === "ELEV";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <div
        className={`h-24 w-full ${course.color} flex items-center justify-center`}
      >
        <BookOpen className="h-10 w-10 text-white opacity-50" />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {course.title}
        </h3>
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
        <a
          href="#"
          className={`
            block w-full text-center px-4 py-2 rounded-lg text-sm font-medium
            ${course.color.replace("bg-", "text-").replace("-500", "-600")}
            dark:${course.color.replace("bg-", "text-").replace("-500", "-400")}
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
          {isElev ? "Vezi Cursul" : "Editează Cursul"}
        </a>
      </div>
    </div>
  );
};

/**
 * ListItem: Componentă generică pentru listele de pe dashboard
 */
const ListItem = ({ icon: Icon, title, subtitle, info, colorClass }) => {
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

// --- LAYOUT PRINCIPAL (NOU) ---
/**
 * DashboardLayout: Container-ul care deține Sidebar și Navbar
 */
const DashboardLayout = ({ userRole, userName, children, onMenuClick }) => {
  return (
    <>
      {/* Navbar */}
      <Navbar onMenuClick={onMenuClick} userName={userName} />

      {/* Zona de conținut principal (scrollabilă) */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </>
  );
};

// --- COMPONENTE SPECIFICE ROLURILOR (NOI) ---

/**
 * ElevDashboard: Conținutul pentru rolul ELEV
 */
const ElevDashboard = () => {
  return (
    <>
      {/* Antet */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Bun venit, Ana!
      </h1>

      {/* Grila de widget-uri */}
      <div className="space-y-6">
        {/* Widget: Cursurile Mele */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Cursurile Mele
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCourses.map((course) => (
              <CourseCard key={course.id} course={course} userRole="ELEV" />
            ))}
          </div>
        </div>

        {/* Grilă cu 2 coloane pentru listele de widget-uri */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Widget: Termene Limită Următoare */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Termene Limită Următoare
            </h3>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockAssignments.map((item) => (
                <ListItem
                  key={item.id}
                  icon={CalendarCheck}
                  title={item.title}
                  subtitle={item.course}
                  info={item.due}
                  colorClass="bg-red-500"
                />
              ))}
            </ul>
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
        </div>

        {/* Widget: Anunțuri (dacă e nevoie) */}
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

/**
 * ProfesorDashboard: Conținutul pentru rolul PROFESOR
 */
const ProfesorDashboard = () => {
  return (
    <>
      {/* Antet */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard Profesor
      </h1>

      {/* Grila de widget-uri */}
      <div className="space-y-6">
        {/* Widget: Cursurile Mele (Profesor) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Cursurile Mele
            </h2>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors">
              <PlusCircle className="h-5 w-5 mr-2" />
              Creează Curs Nou
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProfCourses.map((course) => (
              <CourseCard key={course.id} course={course} userRole="PROFESOR" />
            ))}
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
    </>
  );
};

/**
 * AdminDashboard: Conținutul pentru rolul ADMIN (Placeholder)
 */
const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard Admin
      </h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Statistici (WIP)
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Aici vor apărea widget-urile de statistici și managementul
          utilizatorilor.
        </p>
      </div>
    </div>
  );
};

// --- COMPONENTA PRINCIPALĂ (Controller-ul) ---

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(null); // Ex: 'ELEV', 'PROFESOR', 'ADMIN'
  const [userName, setUserName] = useState("Utilizator");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // La încărcarea paginii, citește rolul din localStorage
    // În producție, ai valida token-ul și ai lua rolul de la API
    const role = localStorage.getItem("userRole");
    
    // Simulare nume utilizator
    let name = "Utilizator";
    if (role === 'ELEV') name = "Ana Popescu";
    if (role === 'PROFESOR') name = "Prof. Ionescu";
    if (role === 'ADMIN') name = "Administrator";
    
    setUserRole(role);
    setUserName(name);
    setIsLoading(false);
  }, []);

  const renderDashboardContent = () => {
    switch (userRole) {
      case "ELEV":
        return <ElevDashboard />;
      case "PROFESOR":
        return <ProfesorDashboard />;
      case "ADMIN":
        return <AdminDashboard />;
      default:
        // Dacă nu e logat sau nu are rol, poți redirecționa
        if (typeof window !== "undefined") {
          // window.location.href = "/login";
        }
        return (
          <div className="text-center p-10">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Rol invalid sau negăsit.
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Vă rugăm să vă autentificați.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              (Testați setând 'userRole' în localStorage: "ELEV" sau "PROFESOR")
            </p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-950 items-center justify-center">
        <p className="text-xl text-gray-700 dark:text-gray-300">
          Se încarcă...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      {/* Overlay pentru meniu mobil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} userRole={userRole} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardLayout
          userRole={userRole}
          userName={userName}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {renderDashboardContent()}
        </DashboardLayout>
      </div>
    </div>
  );
}