import React, { useState, useEffect } from 'react';
import { publicApi } from '../../services/api';
import SectionRenderer from '../../components/sections/SectionRenderer';

export default function HomePage() {
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
