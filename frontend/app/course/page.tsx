"use client";

import React, { useState, useEffect, useRef } from "react"; // Am adăugat useRef

// --- START: SVG Icons (Copied for consistency) ---
// ... (Omiterea iconițelor care sunt identice cu cele din SettingsPage)

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

const Plus = (props) => (
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
    <line x1="12" x2="12" y1="5" y2="19" />
    <line x1="5" x2="19" y1="12" y2="12" />
  </svg>
);

const Folder = (props) => (
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
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16z" />
  </svg>
);

const PenSquare = (props) => (
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
// --- END: SVG Icons ---

// --- START: Shared Layout Components (Translated to English) ---

/**
 * NavItem: A single item in the sidebar
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
 * Sidebar: The main navigation sidebar (in English)
 */
const Sidebar = ({ isSidebarOpen, userRole, activeLink }) => {
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
      {/* Logo/Title */}
      <div className="flex items-center justify-center h-20 px-6 border-b border-gray-700">
        <BookOpen className="h-8 w-8 text-blue-400" />
        <span className="ml-3 text-2xl font-bold text-white">Academia</span>
      </div>

      {/* Dynamic Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* ELEV Navigation */}
        {userRole === "ELEV" && (
          <>
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              active={activeLink === "Dashboard"}
            />
            <NavItem
              icon={BookOpen}
              label="My Courses"
              active={activeLink === "My Courses"}
            />
          </>
        )}

        {/* PROFESOR Navigation */}
        {userRole === "PROFESOR" && (
          <>
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              active={activeLink === "Dashboard"}
            />
            <NavItem
              icon={BookOpen} // Changed icon for consistency
              label="My Courses"
              active={activeLink === "My Courses"}
            />
            <NavItem
              icon={Edit}
              label="Course Management"
              active={activeLink === "Course Management"}
            />
            <NavItem
              icon={NotebookText}
              label="Grading Center"
              active={activeLink === "Grading Center"}
            />
            <NavItem
              icon={Users}
              label="Students"
              active={activeLink === "Students"}
            />
            <NavItem
              icon={Megaphone}
              label="Announcements"
              active={activeLink === "Announcements"}
            />
          </>
        )}

        {/* ADMIN Navigation (Example) */}
        {userRole === "ADMIN" && (
          <>
            <NavItem
              icon={LayoutDashboard}
              label="Statistics"
              active={activeLink === "Statistics"}
            />
            <NavItem
              icon={Users}
              label="User Management"
              active={activeLink === "User Management"}
            />
            <NavItem
              icon={Library}
              label="Course Management"
              active={activeLink === "Course Management"}
            />
          </>
        )}
      </nav>

      {/* Bottom of sidebar A FOST ELIMINAT */}
    </aside>
  );
};

/**
 * Navbar: The top bar (in English)
 */
const Navbar = ({ onMenuClick, userName }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Hook pentru a închide dropdown-ul la click în exterior
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search */}
        <div className="hidden md:block">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search..."
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

        {/* Spacer for mobile */}
        <div className="flex-1 md:hidden"></div>

        {/* Right actions (Notifications, Profile) */}
        <div className="flex items-center space-x-4">
          <button className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Bell className="h-6 w-6" />
          </button>

          {/* Profile Menu */}
          <div ref={profileMenuRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
            >
              <img
                src={`https://placehold.co/40x40/E2E8F0/A0AEC0?text=${userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}`}
                alt="Profile avatar"
                className="h-9 w-9 rounded-full border-2 border-gray-300 dark:border-gray-500"
              />
              <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                {userName}
              </span>
            </button>

            {/* Dropdown Menu */}
            <div
              className={`
                absolute right-0 w-48 mt-2 origin-top-right 
                bg-white dark:bg-gray-800 rounded-md shadow-lg 
                ring-1 ring-black ring-opacity-5 dark:ring-gray-700
                transition-all duration-150 ease-out
                ${
                  isProfileOpen
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 pointer-events-none"
                }
              `}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu-button"
            >
              <div className="py-1" role="none">
                <a
                  href="#" // TODO: Schimbă cu link-ul real, ex: /settings
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </a>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * DashboardLayout: The main content wrapper
 */
const DashboardLayout = ({ children, onMenuClick, userName }) => {
  return (
    <>
      <Navbar onMenuClick={onMenuClick} userName={userName} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </>
  );
};

// --- END: Shared Layout Components ---

// --- START: Page-Specific Components (MyCoursesPage) ---

/**
 * Mock Data (English)
 */
const mockStudentCourses = [
  {
    id: 1,
    title: "Modern Art History",
    teacher: "Prof. Ionescu",
    bannerColor: "bg-blue-700",
  },
  {
    id: 2,
    title: "Web Programming (React)",
    teacher: "Prof. Popescu",
    bannerColor: "bg-indigo-700",
  },
  {
    id: 3,
    title: "Comparative Literature",
    teacher: "Prof. Vasilescu",
    bannerColor: "bg-purple-700",
  },
];

const mockTeacherCourses = [
  {
    id: 1,
    title: "Modern Art History",
    studentCount: 45,
    bannerColor: "bg-blue-700",
  },
  {
    id: 2,
    title: "Web Programming (React)",
    studentCount: 30,
    bannerColor: "bg-indigo-700",
  },
];

/**
 * ClassroomCourseCard: A card inspired by Google Classroom
 */
const ClassroomCourseCard = ({ course, userRole }) => {
  const isElev = userRole === "ELEV";

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
      {/* Card Banner */}
      <div
        className={`relative h-28 ${course.bannerColor} p-4 flex flex-col justify-between`}
      >
        <a href="#" className="block">
          <h3 className="text-xl font-bold text-white shadow-sm truncate">
            {course.title}
          </h3>
        </a>
        <p className="text-sm text-white/90 shadow-sm">
          {isElev ? course.teacher : `${course.studentCount} Students`}
        </p>
        {isElev && (
          <img
            src={`https://placehold.co/48x48/E2E8F0/A0AEC0?text=${course.teacher
              .split(" ")
              .map((n) => n[0])
              .join("")}`}
            alt="Teacher"
            className="absolute right-4 bottom-4 h-12 w-12 rounded-full border-2 border-white"
          />
        )}
      </div>

      {/* Card Content (can be used for 'due soon' items) */}
      <div className="p-4 flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isElev
            ? "Next assignment due: Friday"
            : "No new submissions."}
        </p>
      </div>

      {/* Card Footer Actions */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-end space-x-2">
          {isElev ? (
            <>
              <a
                href="#"
                title="View Assignments"
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <PenSquare className="h-5 w-5" />
              </a>
              <a
                href="#"
                title="View Course Folder"
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Folder className="h-5 w-5" />
              </a>
            </>
          ) : (
            <>
              <a
                href="#"
                title="Manage Assignments"
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <PenSquare className="h-5 w-5" />
              </a>
              <a
                href="#"
                title="Manage Students"
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Users className="h-5 w-5" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * MyCoursesContent: The main content area for this page
 */
const MyCoursesContent = ({ userRole }) => {
  const isElev = userRole === "ELEV";
  const courses = isElev ? mockStudentCourses : mockTeacherCourses;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Courses
        </h1>
        {/* Action Buttons */}
        <div className="mt-4 sm:mt-0 flex space-x-2">
          {isElev ? (
            <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors">
              <Plus className="h-5 w-5 mr-1.5" />
              Join Course
            </button>
          ) : (
            <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors">
              <Plus className="h-5 w-5 mr-1.5" />
              Create Course
            </button>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <ClassroomCourseCard
            key={course.id}
            course={course}
            userRole={userRole}
          />
        ))}
      </div>
    </>
  );
};

// --- END: Page-Specific Components ---

// --- START: Main Page Controller ---

export default function MyCoursesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'ELEV', 'PROFESOR', 'ADMIN'
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On page load, read role from localStorage
    const role = localStorage.getItem("userRole");

    // Simulate user name based on role
    let name = "User";
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
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      {/* Mobile menu overlay */}
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
        activeLink="My Courses" // Set the active link
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardLayout
          userRole={userRole}
          userName={userName}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {/* Render the specific content for this page */}
          <MyCoursesContent userRole={userRole} />
        </DashboardLayout>
      </div>
    </div>
  );
}