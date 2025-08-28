"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import IncomeSourceCard from "@/components/income/IncomeSourceCard";
import AddIncomeSourceModal from "@/components/income/AddIncomeSourceModal";
import AddIncomeEntryModal from "@/components/income/AddIncomeEntryModal";
import type { Database } from "@/lib/supabase/database.types";

type IncomeSource = Database["public"]["Tables"]["income_sources"]["Row"];
type IncomeEntry = Database["public"]["Tables"]["income_entries"]["Row"];

interface IncomeSourceWithEntries extends IncomeSource {
  recent_entries: IncomeEntry[];
  monthly_total: number;
}

export default function IncomePage() {
  const { profile } = useAuth() as {
    profile: {
      id: string;
      household_id: string | null;
    } | null;
  };

  const [incomeSources, setIncomeSources] = useState<IncomeSourceWithEntries[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showAddSource, setShowAddSource] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // totals
  const monthlyTotal = incomeSources.reduce(
    (sum, s) => sum + (s.monthly_total || 0),
    0
  );
  const yearlyProjected = monthlyTotal * 12;

  /** Fetcher (memoized) */
  const fetchIncomeSources = useCallback(async () => {
    if (!profile?.household_id) return;

    try {
      setLoading(true);

      // sources
      const { data: sources, error: sourcesError } = await supabase
        .from("income_sources")
        .select("*")
        .eq("household_id", profile.household_id)
        .order("created_at", { ascending: false });

      if (sourcesError) throw sourcesError;

      const sourcesWithEntries: IncomeSourceWithEntries[] = [];

      for (const source of sources ?? []) {
        // recent entries for last 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const { data: entries } = await supabase
          .from("income_entries")
          .select("*")
          .eq("income_source_id", source.id)
          .gte("date", threeMonthsAgo.toISOString().slice(0, 10)) // YYYY-MM-DD
          .order("date", { ascending: false })
          .limit(5);

        // this month's total
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const monthlyEntries =
          entries?.filter((e) => e.date.startsWith(currentMonth)) ?? [];
        const monthly_total = monthlyEntries.reduce(
          (sum, e) => sum + (e.amount ?? 0),
          0
        );

        sourcesWithEntries.push({
          ...source,
          recent_entries: entries ?? [],
          monthly_total,
        });
      }

      setIncomeSources(sourcesWithEntries);
    } catch (err) {
      console.error("Error fetching income sources:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.household_id]);

  // call fetcher when household changes
  useEffect(() => {
    if (profile?.household_id) {
      fetchIncomeSources();
    } else {
      setIncomeSources([]);
      setLoading(false);
    }
  }, [profile?.household_id, fetchIncomeSources]);

  const handleAddEntry = (sourceId: string) => {
    setSelectedSourceId(sourceId);
    setShowAddEntry(true);
  };

  const handleSourceAdded = () => {
    fetchIncomeSources();
    setShowAddSource(false);
  };

  const handleEntryAdded = () => {
    fetchIncomeSources();
    setShowAddEntry(false);
    setSelectedSourceId(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Income Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Track your household income sources and monthly earnings
            </p>
          </div>
          <button
            onClick={() => setShowAddSource(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            Add Income Source
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">This Month</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  ${monthlyTotal.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Projected Yearly</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600">
                  ${yearlyProjected.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Income Sources</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {incomeSources.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Income Sources */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Income Sources</h2>

          {incomeSources.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900">
                No income sources yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Get started by adding your first income source.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddSource(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Income Source
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {incomeSources.map((source) => (
                <IncomeSourceCard
                  key={source.id}
                  source={source}
                  onAddEntry={() => handleAddEntry(source.id)}
                  onRefresh={fetchIncomeSources}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddSource && (
        <AddIncomeSourceModal
          isOpen={showAddSource}
          onClose={() => setShowAddSource(false)}
          onSourceAdded={handleSourceAdded}
          householdId={profile?.household_id ?? ""}
          userId={profile?.id ?? ""}
        />
      )}

      {showAddEntry && selectedSourceId && (
        <AddIncomeEntryModal
          isOpen={showAddEntry}
          onClose={() => setShowAddEntry(false)}
          onEntryAdded={handleEntryAdded}
          sourceId={selectedSourceId}
        />
      )}
    </DashboardLayout>
  );
}
