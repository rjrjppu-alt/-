import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BranchPerformance,
  CustomerProfile,
  CustomerSegment,
  KPICardData,
  LapseWarningItem,
  ProductBreakdown,
  AgencyWorkforce,
  StrategicDirective,
} from '../types';
import {
  mockExecutiveKPIs,
  mockBranches,
  mockProducts,
  mockCustomerSegments,
  mockCustomerLifecycleStages,
  mockDetailedCustomers,
  mockLapseWarningHall,
  mockAgencyWorkforce,
  mockDirectives,
} from '../data/mockData';

export interface DashboardDataState {
  executiveKPIs: Record<string, KPICardData>;
  branches: BranchPerformance[];
  products: ProductBreakdown[];
  customerSegments: CustomerSegment[];
  customerLifecycleStages: typeof mockCustomerLifecycleStages;
  customerProfiles: CustomerProfile[];
  lapseWarnings: LapseWarningItem[];
  agencyWorkforce: AgencyWorkforce;
  directives: StrategicDirective[];
  isCustomData: boolean;
  lastUpdated: string;
}

interface DataContextType {
  data: DashboardDataState;
  updateKPIs: (kpis: Record<string, KPICardData>) => void;
  updateBranches: (branches: BranchPerformance[]) => void;
  updateProducts: (products: ProductBreakdown[]) => void;
  updateCustomerSegments: (segments: CustomerSegment[]) => void;
  updateCustomerProfiles: (profiles: CustomerProfile[]) => void;
  updateLapseWarnings: (warnings: LapseWarningItem[]) => void;
  updateAgencyWorkforce: (workforce: AgencyWorkforce) => void;
  updateDirectives: (directives: StrategicDirective[]) => void;
  applyBulkImportData: (importedData: Partial<DashboardDataState>) => void;
  resetToDefaultData: () => void;
}

const STORAGE_KEY = 'INSURANCE_DASHBOARD_DATA_V2';

const getDefaultData = (): DashboardDataState => ({
  executiveKPIs: JSON.parse(JSON.stringify(mockExecutiveKPIs)),
  branches: JSON.parse(JSON.stringify(mockBranches)),
  products: JSON.parse(JSON.stringify(mockProducts)),
  customerSegments: JSON.parse(JSON.stringify(mockCustomerSegments)),
  customerLifecycleStages: JSON.parse(JSON.stringify(mockCustomerLifecycleStages)),
  customerProfiles: JSON.parse(JSON.stringify(mockDetailedCustomers)),
  lapseWarnings: JSON.parse(JSON.stringify(mockLapseWarningHall)),
  agencyWorkforce: JSON.parse(JSON.stringify(mockAgencyWorkforce)),
  directives: JSON.parse(JSON.stringify(mockDirectives)),
  isCustomData: false,
  lastUpdated: new Date().toLocaleString('zh-CN'),
});

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DashboardDataState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...getDefaultData(),
          ...parsed,
          isCustomData: true,
        };
      }
    } catch (e) {
      console.error('Failed to load saved dashboard data from storage:', e);
    }
    return getDefaultData();
  });

  useEffect(() => {
    if (data.isCustomData) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save data to storage:', e);
      }
    }
  }, [data]);

  const updateKPIs = (kpis: Record<string, KPICardData>) => {
    setData((prev) => ({
      ...prev,
      executiveKPIs: kpis,
      isCustomData: true,
      lastUpdated: new Date().toLocaleString('zh-CN'),
    }));
  };

  const updateBranches = (branches: BranchPerformance[]) => {
    setData((prev) => ({
      ...prev,
      branches,
      isCustomData: true,
      lastUpdated: new Date().toLocaleString('zh-CN'),
    }));
  };

  const updateProducts = (products: ProductBreakdown[]) => {
    setData((prev) => ({
      ...prev,
      products,
      isCustomData: true,
      lastUpdated: new Date().toLocaleString('zh-CN'),
    }));
  };

  const updateCustomerSegments = (customerSegments: CustomerSegment[]) => {
    setData((prev) => ({
      ...prev,
      customerSegments,
      isCustomData: true,
      lastUpdated: new Date().toLocaleString('zh-CN'),
    }));
  };

  const updateCustomerProfiles = (customerProfiles: CustomerProfile[]) => {
    setData((prev) => ({
      ...prev,
      customerProfiles,
      isCustomData: true,
      lastUpdated: new Date().toLocaleString('zh-CN'),
    }));
  };

  const updateLapseWarnings = (lapseWarnings: LapseWarningItem[]) => {
    setData((prev) => ({
      ...prev,
      lapseWarnings,
      isCustomData: true,
      lastUpdated: new Date().toLocaleString('zh-CN'),
    }));
  };

  const updateAgencyWorkforce = (agencyWorkforce: AgencyWorkforce) => {
    setData((prev) => ({
      ...prev,
      agencyWorkforce,
      isCustomData: true,
      lastUpdated: new Date().toLocaleString('zh-CN'),
    }));
  };

  const updateDirectives = (directives: StrategicDirective[]) => {
    setData((prev) => ({
      ...prev,
      directives,
      isCustomData: true,
      lastUpdated: new Date().toLocaleString('zh-CN'),
    }));
  };

  const applyBulkImportData = (importedData: Partial<DashboardDataState>) => {
    setData((prev) => ({
      ...prev,
      ...importedData,
      isCustomData: true,
      lastUpdated: new Date().toLocaleString('zh-CN'),
    }));
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(getDefaultData());
  };

  return (
    <DataContext.Provider
      value={{
        data,
        updateKPIs,
        updateBranches,
        updateProducts,
        updateCustomerSegments,
        updateCustomerProfiles,
        updateLapseWarnings,
        updateAgencyWorkforce,
        updateDirectives,
        applyBulkImportData,
        resetToDefaultData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useInsuranceData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useInsuranceData must be used within a DataProvider');
  }
  return context;
};
