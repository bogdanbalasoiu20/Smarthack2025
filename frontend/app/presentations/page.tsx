"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredToken, clearStoredToken } from "@/lib/authToken";

interface Presentation {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string | null;
  current_user_permission: "OWNER" | "EDITOR" | "VIEWER" | null;
  updated_at: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

export default function PresentationsPage() {
  const router = useRouter();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPresentations = async () => {
      const token = getStoredToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/presentations/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            clearStoredToken();
            router.replace("/login");
            return;
          }

          throw new Error("Failed to load presentations");
        }

        const data = await response.json();
        if (isMounted) {
          // Handle both array and paginated responses
          const presentationsArray = Array.isArray(data) ? data : (data.results || []);
          setPresentations(presentationsArray);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching presentations:", err);
        if (isMounted) {
          setError("Failed to fetch presentations. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPresentations();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const createPresentation = async () => {
    const token = getStoredToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/presentations/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Prezentare noua",
            description: "",
          }),
        });

      if (!response.ok) {
        throw new Error("Failed to create presentation");
      }

      const data = (await response.json()) as Presentation;
      router.push(`/presentations/${data.id}`);
    } catch (err) {
      console.error("Error creating presentation:", err);
      setError("Nu am putut crea prezentarea. Reincercati.");
    }
  };

  const content = useMemo(() => {
    if (presentations.length === 0) {
      return (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Nicio prezentare
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Incepe prin a crea prima ta prezentare.
          </p>
          <button
            onClick={createPresentation}
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
          >
            Creeaza prezentare
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presentations.map((presentation) => (
          <Link
            key={presentation.id}
            href={`/presentations/${presentation.id}`}
            className="group"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                {presentation.thumbnail_url ? (
                  <img
                    src={presentation.thumbnail_url}
                    alt={presentation.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white opacity-70 text-lg font-semibold">
                    {presentation.title.slice(0, 24) || "Prezentare"}
                  </div>
                )}
                {presentation.current_user_permission && (
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {presentation.current_user_permission}
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {presentation.title}
                </h3>
                {presentation.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {presentation.description}
                  </p>
                )}
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Actualizata pe{" "}
                  {new Date(presentation.updated_at).toLocaleDateString("ro-RO")}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }, [presentations]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent" />
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Se incarca prezentarile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Prezentari
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Creeaza si gestioneaza prezentarile tale vizuale
            </p>
          </div>

          <div className="flex space-x-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={createPresentation}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Prezentare noua
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {content}
      </main>
    </div>
  );
}
