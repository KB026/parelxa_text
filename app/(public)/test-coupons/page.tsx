'use client';

import React from 'react';
import PlanPickerScreen from '@/components/parlexa/vendor/PlanPickerScreen';

export default function TestCouponsPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <PlanPickerScreen
        toolName="My AI Product"
        formData={{}}
        onClearDraft={() => {}}
      />
    </div>
  );
}
