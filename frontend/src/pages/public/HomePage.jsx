import React, { useState, useEffect } from 'react';
import { publicApi } from '../../services/api';
import SectionRenderer from '../../components/sections/SectionRenderer';
import PublicMaintenanceNotice, { useSectionMaintenance } from '../../components/common/PublicMaintenanceNotice';
import { Church } from 'lucide-react';

export default function HomePage() {
  const isMaintenance = useSectionMaintenance('homepage');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await publicApi.getPage('home');
        if (res.data && res.data.sections) {
          setSections(res.data.sections);
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHome();
  }, []);

  if (isMaintenance) {
    return (
      <div className="min-h-screen bg-[#FCFBF9] flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="w-16 h-16 rounded-full bg-[#6B1D2F] text-amber-300 flex items-center justify-center mx-auto mb-4 shadow-md">
            <Church className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-2">
            Archdiocese of Cebu
          </span>
          <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold text-stone-900">
            Parish of the Alliance of the Two Hearts
          </h1>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            J. Fortich St., Banawa, Cebu City
          </p>
        </div>

        <PublicMaintenanceNotice sectionKey="homepage" forceShow />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FCFBF9]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#6B1D2F] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-stone-500">Loading parish content...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}
