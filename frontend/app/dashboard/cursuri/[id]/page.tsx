"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// --- Definiții Iconițe ---

const ArrowLeft = (props) => (
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
    <line x1="19" x2="5" y1="12" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const FileText = (props) => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </svg>
);

const Brain = (props) => (
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
    <path d="M12 5a3 3 0 1 0-5.997.142A5 5 0 0 0 7 12v2h10v-2a5 5 0 0 0-1.003-3.142A3 3 0 1 0 12 5z" />
    <path d="M12 14v1a2 2 0 0 1-2 2v1a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-1a2 2 0 0 1-2-2z" />
    <path d="M19 16v-2a5 5 0 0 0-1.003-3.142A3 3 0 1 0 12 5" />
    <path d="M5 16v-2a5 5 0 0 0 1.003-3.142A3 3 0 1 0 12 5" />
  </svg>
);

// Tipul pentru materialele de curs
type CourseMaterial = {
  id: string;
  type: "presentation" | "kahoot";
  title: string;
};

// --- BAZA DE DATE SIMULATĂ PENTRU CURSURI ---
const MOCK_COURSE_DATABASE = {
  "1001": {
    id: "1001",
    title: "Curs de Matematică",
    description: "O descriere simulată a cursului de matematică.",
    studentCount: 30,
    materials: [
      {
        id: "p1",
        type: "presentation",
        title: "Prezentare: Capitolul 1 - Introducere",
      },
      {
        id: "k1",
        type: "kahoot",
        title: "Kahoot: Test Recapitulativ Capitolul 1",
      },
    ],
  },
  "1002": {
    id: "1002",
    title: "Curs de Programare",
    description: "Introducere în React și Next.js.",
    studentCount: 20,
    materials: [
      {
        id: "p2",
        type: "presentation",
        title: "Prezentare: Capitolul 2 - Algebra",
      },
    ],
  },
};

// --- NOU: Componenta Buton pentru Materiale (Pentru Elevi) ---
const StudentMaterialButton = ({ material }) => {
  const isKahoot = material.type === "kahoot";

  // --- LOGICA PENTRU REDIRECȚIONARE ---
  const href = isKahoot ? "http://localhost:3000/game" : "#";
  const target = isKahoot ? "_blank" : "_self";
  // ------------------------------------

  const Icon = isKahoot ? Brain : FileText;
  const gradientClass = isKahoot
    ? "bg-gradient-to-r from-purple-600 to-pink-500 focus:ring-purple-300"
    : "bg-gradient-to-r from-blue-500 to-blue-700 focus:ring-blue-300";

  const title = material.title;

  return (
    <a
      href={href}
      target={target}
      rel={isKahoot ? "noopener noreferrer" : ""}
      className={`
        flex items-center justify-center text-lg font-semibold text-white
        px-8 py-4 rounded-xl shadow-lg
        ${gradientClass}
        transform transition-all duration-300
        hover:scale-105 hover:shadow-2xl
        focus:outline-none focus:ring-4
        w-full md:w-auto md:min-w-[400px]
      `}
    >
      <Icon className="h-6 w-6 mr-3" />
      <span>{title}</span> {/* Folosește titlul dinamic din backend */}
    </a>
  );
};

// --- Componenta Paginii de Detaliu a Cursului ---
export default function CourseDetailPage() {
  const params = useParams();
  const { id: courseId } = params;

  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ---------- MODIFICARE CRITICĂ AICI ----------
  // 1. Preluăm rolul utilizatorului și ÎL CONVERTIM LA MAJUSCULE
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
      if (role) {
        // Convertim rolul la majuscule pentru a evita erori de "case"
        setUserRole(role.toUpperCase());
      } else {
        // Dacă nu găsește rol, va fi tratat ca elev (default)
        setUserRole(null);
      }
    }
  }, []);
  // ----------------- SFÂRȘIT MODIFICARE -----------------

  // 2. Simulăm încărcarea datelor cursului pe baza ID-ului
  useEffect(() => {
    if (courseId) {
      setIsLoading(true);

      const timer = setTimeout(() => {
        const foundCourse = MOCK_COURSE_DATABASE[courseId as string];

        if (foundCourse) {
          setCourse(foundCourse);
          setMaterials(foundCourse.materials);
        } else {
          setCourse(null);
          setMaterials([]);
        }
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [courseId]);

  // Verificarea va funcționa acum corect, deoarece userRole este "ADMIN" sau "PROFESOR"
  const isTeacherOrAdmin = userRole === "PROFESOR" || userRole === "ADMIN";

  // --- Funcții placeholder pentru butoane (pentru Admin/Prof) ---
  const handleAddPresentation = () => {
    alert("Se deschide formularul pentru a adăuga o PREZENTARE...");
    const newPresentation: CourseMaterial = {
      id: `p-${Date.now()}`,
      type: "presentation",
      title: `Prezentare Nouă - ${new Date().toLocaleTimeString()}`,
    };
    setMaterials((prevMaterials) => [...prevMaterials, newPresentation]);
  };

  const handleCreateKahoot = () => {
    alert("Se deschide formularul pentru a crea un KAHOOT...");
    const newKahoot: CourseMaterial = {
      id: `k-${Date.now()}`,
      type: "kahoot",
      title: `Kahoot Nou - ${new Date().toLocaleTimeString()}`,
    };
    setMaterials((prevMaterials) => [...prevMaterials, newKahoot]);
  };

  // --- Logica de Randare ---

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-700 dark:text-gray-300">
        Se încarcă detaliile cursului...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-red-500">
        <p className="text-2xl font-bold mb-4">Eroare</p>
        <p className="text-lg">Cursul nu a fost găsit.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Înapoi la Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Antetul Paginii Cursului */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-full mb-4 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Înapoi la Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {course.title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
          {course.description}
        </p>
      </div>

      {/* --- Randare Condiționată (care acum funcționează) --- */}

      {/* --- 1. CONȚINUT PENTRU PROFESOR / ADMIN --- */}
      {isTeacherOrAdmin && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
            Panou Profesor
          </h2>
          <div className="flex flex-col md:flex-row md:justify-center md:space-x-8 space-y-4 md:space-y-0">
            {/* Buton Prezentare */}
            <button
              onClick={handleAddPresentation}
              className="
                flex items-center justify-center text-lg font-semibold text-white
                px-8 py-4 rounded-xl shadow-lg
                bg-gradient-to-r from-blue-500 to-blue-700
                transform transition-all duration-300
                hover:scale-105 hover:shadow-2xl
                focus:outline-none focus:ring-4 focus:ring-blue-300
              "
            >
              <FileText className="h-6 w-6 mr-3" />
              Adaugă Prezentare
            </button>

            {/* Buton Kahoot */}
            <button
              onClick={handleCreateKahoot}
              className="
                flex items-center justify-center text-lg font-semibold text-white
                px-8 py-4 rounded-xl shadow-lg
                bg-gradient-to-r from-purple-600 to-pink-500
                transform transition-all duration-300
                hover:scale-105 hover:shadow-2xl
                focus:outline-none focus:ring-4 focus:ring-purple-300
              "
            >
              <Brain className="h-6 w-6 mr-3" />
              Creează Kahoot
            </button>
          </div>
        </div>
      )}

      {/* --- 2. CONȚINUT PENTRU ELEV --- */}
      {!isTeacherOrAdmin && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center space-y-4 md:space-y-6">
            {materials.length > 0 ? (
              // Facem map direct la noile butoane
              materials.map((material) => (
                <StudentMaterialButton key={material.id} material={material} />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Niciun material de curs adăugat încă.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}