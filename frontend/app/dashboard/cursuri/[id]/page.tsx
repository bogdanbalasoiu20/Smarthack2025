"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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

type CourseMaterial = {
  id: string;
  type: "presentation" | "kahoot";
  title: string;
};

const mockCourseDatabase = {
  "1001": {
    id: 1001,
    title: "Curs de Matematică",
    description: "Descriere pentru matematică.",
    studentCount: 10,
    materials: [
      {
        id: "p1_math",
        type: "presentation",
        title: "Prezentare: Algebra",
      },
      {
        id: "k1_math",
        type: "kahoot",
        title: "Kahoot: Ecuații de gradul 2",
      },
    ],
  },
  "1002": {
    id: 1002,
    title: "Curs de Programare",
    description: "Introducere în React și Next.js.",
    studentCount: 20,
    materials: [
      {
        id: "p1_prog",
        type: "presentation",
        title: "Prezentare: Ce este React?",
      },
    ],
  },
};

const MaterialCard = ({ material, isTeacherOrAdmin }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between border dark:border-gray-700">
      <div className="flex items-center min-w-0">
        {material.type === "presentation" ? (
          <FileText className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0" />
        ) : (
          <Brain className="h-6 w-6 text-purple-500 mr-3 flex-shrink-0" />
        )}
        <span className="text-gray-900 dark:text-white truncate">
          {material.title}
        </span>
      </div>
      <button className="ml-4 text-sm text-blue-500 hover:underline flex-shrink-0">
        {isTeacherOrAdmin ? "Gestionează" : "Deschide"}
      </button>
    </div>
  );
};

export default function CourseDetailPage() {
  const params = useParams();
  const { id: courseId } = params as { id: string };

  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
      setUserRole(role);
    }
  }, []);

  useEffect(() => {
    if (courseId) {
      setIsLoading(true);

      const timer = setTimeout(() => {
        const foundCourse = mockCourseDatabase[courseId];

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

  const isTeacherOrAdmin = userRole === "PROFESOR" || userRole === "ADMIN";

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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-700 dark:text-gray-300">
        Se încarcă detaliile cursului...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen w-full bg-gray-100 dark:bg-[#0f141d] py-10 px-4">
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex flex-col items-center justify-center text-center py-10">
            <p className="text-2xl font-semibold text-red-500 dark:text-red-400">
              Eroare: Cursul nu a fost găsit.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              ID-ul "{courseId}" nu corespunde niciunui curs.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-1.5 rounded-full transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Înapoi la Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-100 dark:bg-[#0f141d] py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-1.5 rounded-full transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {course.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
            {course.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Materiale de Curs
              </h2>
              <div className="space-y-3">
                {materials.length > 0 ? (
                  materials.map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      isTeacherOrAdmin={isTeacherOrAdmin}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Niciun material de curs adăugat încă.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {isTeacherOrAdmin && (
              <div className="border dark:border-gray-700 rounded-xl p-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Panou Profesor
                </h2>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleAddPresentation}
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Adaugă Prezentare
                  </button>
                  <button
                    onClick={handleCreateKahoot}
                    className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-purple-700 transition-colors"
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    Creează Kahoot
                  </button>
                </div>
              </div>
            )}

            <div className="border dark:border-gray-700 rounded-xl p-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Detalii Curs
              </h2>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {course.studentCount}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Studenți înscriși
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}