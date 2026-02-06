'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/app/lib/database';

type Requirement = {
  id: string;
  section: string;
  title: string;
  active: boolean;
};

type OrgRequirementStatus = {
  id: string;
  orgUsername: string;
  requirementId: string;
  submitted: boolean;
  graded: boolean;
  start: string | null;
  due: string | null;
  score: number | null;
  grade: number | null;
  year: number | null;
  active: boolean;
};

export default function OrgsRequirement({ username }: { username: string }) {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [statuses, setStatuses] = useState<OrgRequirementStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: reqData, error: reqError } = await supabase
          .from('requirements')
          .select('*')
          .eq('active', true)
          .order('section', { ascending: true })
          .order('id', { ascending: true });

        if (reqError) throw reqError;

        const { data: statusData, error: statusError } = await supabase
          .from('org_requirement_status')
          .select('*')
          .eq('active', true)
          .eq('orgUsername', username);

        if (statusError) throw statusError;

        setRequirements(reqData || []);
        setStatuses(statusData || []);
      } catch (err: any) {
        console.error('Error fetching requirements:', err.message ?? err);
        setRequirements([]);
        setStatuses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const getStatus = (reqId: string) =>
    statuses.find((s) => s.requirementId === reqId);

  const groupedRequirements: Record<string, Requirement[]> =
    requirements.reduce((acc, req) => {
      if (!acc[req.section]) acc[req.section] = [];
      acc[req.section].push(req);
      return acc;
    }, {} as Record<string, Requirement[]>);

  const getSectionTotal = (reqs: Requirement[]) => {
    return reqs.reduce((total, req) => {
      const status = getStatus(req.id);
      if (status?.graded && typeof status.grade === 'number') {
        return total + status.grade;
      }
      return total;
    }, 0);
  };

  const getGrandTotal = () => {
    return statuses.reduce((total, status) => {
      if (status.graded && typeof status.grade === 'number') {
        return total + status.grade;
      }
      return total;
    }, 0);
  };

  if (loading) {
    return <div className="p-4 text-black">Loading requirements...</div>;
  }

  if (requirements.length === 0) {
    return <div className="p-4 text-black">No requirements found.</div>;
  }

  const deactivateAllStatuses = async () => {
    const confirmed = confirm(
      'Are you sure you want to archive ALL requirements for this organization?'
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('org_requirement_status')
        .update({ active: false })
        .eq('orgUsername', username);

      if (error) throw error;

      setStatuses((prev) => prev.map((s) => ({ ...s, active: false })));

      alert('All requirement statuses have been deactivated.');
      window.location.reload();
    } catch (err: any) {
      console.error('Failed to deactivate statuses:', err.message ?? err);
      alert('Something went wrong while deactivating statuses.');
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex justify-end">
        <button
          onClick={deactivateAllStatuses}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm cursor-pointer"
        >
          Archive All Requirements
        </button>
      </div>

      <table className="min-w-full border border-gray-300 bg-white text-black text-xs sm:text-sm md:text-base">
        <thead>
          <tr>
            <th className="border px-3 py-2 text-left w-2/3">Requirement</th>
            <th className="border px-3 py-2">View</th>
            <th className="border px-3 py-2">Start</th>
            <th className="border px-3 py-2">Due</th>
            <th className="border px-3 py-2">Submitted</th>
            <th className="border px-3 py-2">Graded</th>
            <th className="border px-3 py-2">Score</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(groupedRequirements).map(([section, reqs]) => (
            <React.Fragment key={section}>
              <tr className="bg-gray-200 font-bold">
                <td colSpan={7} className="px-3 py-2">
                  {section}
                </td>
              </tr>

              {reqs.map((req) => {
                const status = getStatus(req.id);
                return (
                  <tr key={req.id}>
                    <td className="border px-3 py-2">{req.title}</td>
                    <td className="border px-3 py-2 text-center">
                      <Link
                        href={`/dashboard/orgs/${username}/requirements/${req.id}`}
                        className="text-blue-500 hover:underline flex flex-col items-center"
                      >
                        <DocumentTextIcon className="w-6 h-6 mb-1" />
                        <span>View</span>
                      </Link>
                    </td>
                    <td className="border px-3 py-2">
                      {status?.start
                        ? new Date(status.start).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="border px-3 py-2">
                      {status?.due
                        ? new Date(status.due).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="border px-3 py-2">
                      {status?.submitted ? '✅' : '❌'}
                    </td>
                    <td className="border px-3 py-2">
                      {status?.graded ? '✅' : '❌'}
                    </td>
                    <td className="border px-3 py-2">
                      {status?.graded ? status.grade : '-'}
                    </td>
                  </tr>
                );
              })}

              <tr className="bg-gray-100 font-semibold">
                <td colSpan={6} className="border px-3 py-2 text-right">
                  Section Total:
                </td>
                <td className="border px-3 py-2">
                  {getSectionTotal(reqs)}
                </td>
              </tr>
            </React.Fragment>
          ))}

          {/* GRAND TOTAL */}
          <tr className="bg-gray-300 font-bold">
            <td colSpan={6} className="border px-3 py-3 text-right">
              Final Total Score:
            </td>
            <td className="border px-3 py-3">
              {getGrandTotal()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
