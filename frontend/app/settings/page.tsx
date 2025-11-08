"use client";

import React, { useState, useEffect } from "react";

// --- Definiții Iconițe (Inline SVG) ---
// Am copiat toate iconițele de la Dashboard pentru consistență
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
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .5 1.92v.5a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .5 1.92v.5a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .5 1.92v.5a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 .5 1.92v.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-.5-1.92v-.5a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-.5-1.92v-.5a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-.5-1.92v-.18a2 2 0 0 0-2-2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73-.73l-.22-.38a2 2 0 0 0 .73-2.73l.15-.1a2 2 0 0 1 .5-1.92V4a2 2 0 0 0-2-2z" />
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

// --- ICONIȚE NOI PENTRU SETTINGS ---
const User = (props) => (
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
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const Lock = (props) => (
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
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const Shield = (props) => (
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

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
 * Sidebar: Meniul lateral de navigare (ACUM CU 'activeLink' PROP)
 */
const Sidebar = ({ isSidebarOpen, userRole, activeLink }) => {
  // Acum 'activeLink' este un prop. ex: "Dashboard", "Setări"

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
              href="http://localhost:3000/dashboard"
            />
            <NavItem
              icon={BookOpen}
              label="Cursurile Mele"
              active={activeLink === "Cursurile Mele"}
              href="http://localhost:3000/course"
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
            />
            <NavItem
              icon={Edit}
              label="Management Cursuri"
              active={activeLink === "Management Cursuri"}
            />
            <NavItem
              icon={NotebookText}
              label="Centru de Notare"
              active={activeLink === "Centru de Notare"}
            />
            <NavItem
              icon={Users}
              label="Studenți"
              active={activeLink === "Studenți"}
            />
            <NavItem
              icon={Megaphone}
              label="Anunțuri"
              active={activeLink === "Anunțuri"}
            />
          </>
        )}

        {/* Navigare ADMIN (Exemplu) */}
        {userRole === "ADMIN" && (
          <>
            <NavItem
              icon={LayoutDashboard}
              label="Statistici"
              active={activeLink === "Statistici"}
            />
            <NavItem
              icon={Users}
              label="Management Useri"
              active={activeLink === "Management Useri"}
            />
            <NavItem
              icon={Library}
              label="Management Cursuri"
              active={activeLink === "Management Cursuri"}
            />
          </>
        )}
      </nav>

      {/* Partea de jos a sidebar-ului */}
      <div className="p-4 border-t border-gray-700">
        <NavItem
          icon={Settings}
          label="Settings"
          active={activeLink === "Settings"}
          href="http://localhost:3000/settings"
        />
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
          Log Out
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
              placeholder="Caută..."
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

// --- LAYOUT PRINCIPAL ---
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

// --- COMPONENTE NOI PENTRU PAGINA DE SETĂRI ---

/**
 * SettingsCard: Un container reutilizabil pentru secțiunile de setări
 */
const SettingsCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
    <div className="p-5 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <Icon className="h-6 w-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
    </div>
    <div className="p-5 space-y-4">{children}</div>
    <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 text-right">
      <button className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors">
        Salvează Modificările
      </button>
    </div>
  </div>
);

/**
 * FormInput: O componentă reutilizabilă pentru un câmp de formular
 */
const FormInput = ({ id, label, type, placeholder, value, onChange }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="block w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    />
  </div>
);

/**
 * ToggleSwitch: Un comutator simplu
 */
const ToggleSwitch = ({ id, label, enabled, setEnabled }) => (
  <div className="flex items-center justify-between">
    <label
      htmlFor={id}
      className="text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {label}
    </label>
    <button
      id={id}
      type="button"
      onClick={() => setEnabled(!enabled)}
      className={`
        relative inline-flex items-center h-6 rounded-full w-11
        transition-colors
        ${enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"}
      `}
    >
      <span
        className={`
          inline-block w-4 h-4 transform bg-white rounded-full
          transition-transform
          ${enabled ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  </div>
);

/**
 * SettingsContent: Conținutul principal al paginii de setări
 */
const SettingsContent = ({ userRole }) => {
  // Stări (mock) pentru formulare
  const [firstName, setFirstName] = useState("Ana");
  const [lastName, setLastName] = useState("Popescu");
  const [email, setEmail] = useState("ana.popescu@elev.ro");

  // Stări (mock) pentru toggle-uri
  const [allowSignups, setAllowSignups] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Settings Account
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coloana principală pentru formulare */}
        <div className="md:col-span-2 space-y-6">
          {/* Card Informații Profil */}
          <SettingsCard title="Info Profile" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                id="first-name"
                label="Prenume"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <FormInput
                id="last-name"
                label="Nume"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <FormInput
              id="email"
              label="Adresă Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Avatar
              </label>
              <div className="flex items-center space-x-4">
                <img
                  src={`https://placehold.co/64x64/E2E8F0/A0AEC0?text=${firstName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}${lastName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}`}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full"
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Schimbă
                </button>
              </div>
            </div>
          </SettingsCard>

          {/* Card Schimbare Parolă */}
          <SettingsCard title="Securitate" icon={Lock}>
            <FormInput
              id="current-password"
              label="Parola Curentă"
              type="password"
              placeholder="••••••••"
            />
            <FormInput
              id="new-password"
              label="Parola Nouă"
              type="password"
              placeholder="••••••••"
            />
            <FormInput
              id="confirm-password"
              label="Confirmă Parola Nouă"
              type="password"
              placeholder="••••••••"
            />
          </SettingsCard>
        </div>

        {/* Coloana laterală pentru setări specifice rolului */}
        <div className="md:col-span-1 space-y-6">
          {/* Card Setări Admin (condiționat) */}
          {(userRole === "PROFESOR" || userRole === "ADMIN") && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Setări Platformă
                  </h3>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <ToggleSwitch
                  id="allow-signups"
                  label="Permite înscrieri noi"
                  enabled={allowSignups}
                  setEnabled={setAllowSignups}
                />
                <ToggleSwitch
                  id="maintenance-mode"
                  label="Mod Mentenanță"
                  enabled={maintenanceMode}
                  setEnabled={setMaintenanceMode}
                />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 text-right">
                <button className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-red-700 transition-colors">
                  Salvează Setări Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// --- COMPONENTA PRINCIPALĂ (Controller-ul) ---

export default function SettingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(null); // Ex: 'ELEV', 'PROFESOR', 'ADMIN'
  const [userName, setUserName] = useState("Utilizator");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // La încărcarea paginii, citește rolul din localStorage
    const role = localStorage.getItem("userRole");

    // Simulare nume utilizator
    let name = "Utilizator";
    if (role === "ELEV") name = "Ana Popescu";
    if (role === "PROFESOR") name = "Prof. Ionescu";
    if (role === "ADMIN") name = "Administrator";

    setUserRole(role || "ELEV"); // Default to ELEV for demo if not set
    setUserName(name);
    setIsLoading(false);
  }, []);

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
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        userRole={userRole}
        activeLink="Settings" // Setăm link-ul activ
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardLayout
          userRole={userRole}
          userName={userName}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {/* Aici randăm conținutul specific paginii de setări */}
          <SettingsContent userRole={userRole} />
        </DashboardLayout>
      </div>
    </div>
  );
}