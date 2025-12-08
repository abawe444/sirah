import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. تعريف أنواع البيانات (Types & Interfaces)
export type Language = 'ar' | 'en';
export type Direction = 'ltr' | 'rtl';

export interface Translation {
  app: {
    title: string;
    subtitle: string;
    systemName: string;
  };
  auth: {
    logout: string;
    login: string;
    adminPortal: string;
    backToSelection: string;
    password: string;
    selectPortal: string;
    employeePortal: string;
    userNoLongerExists: string;
    welcome: string;
    username: string;
    invalidCredentials: string;
    noPermission: string;
  };
  dashboard: {
    adminDashboard: string;
    employeeDashboard: string;
    backToDashboard: string;
    daily: string;
    payroll: string;
    advances: string;
    users: string;
    notifications: string;
  };
  navigation: {
    history: string;
    leave: string;
    reports: string;
    comparison: string;
    daily: string;
    payroll: string;
    advances: string;
    users: string;
    settings: string;
  };
  employee: {
    employees: string;
    center: string;
    hireDate: string;
    totalEmployees: string;
    name: string;
    salary: string;
    position: string;
    phoneNumber: string;
    addEmployee: string;
    time: string;
    profile: string;
  };
  attendance: {
    attendance: string;
    checkOut: string;
    checkIn: string;
    present: string;
    early: string;
    absent: string;
    delay: string;
    lateCount: string;
    noLocation: string;
    status: string;
    late: string;
    severeLate: string;
    onLeave: string;
    delayMinutes: string;
    presentCount: string;
    showMap: string;
  };
  stats: {
    centerStats: string;
    daysLate: string;
    daysAbsent: string;
    totalDeductions: string;
    daysPresent: string;
    statistics: string;
  };
  deductions: {
    deductionRules: string;
    noDeduction: string;
  };
  payroll: {
    payroll: string;
    netSalary: string;
    advances: string;
    baseSalary: string;
    bonuses: string;
  };
  leave: {
    leaves: string;
    leaveType: string;
    annual: string;
    emergency: string;
    sickLeave: string;
    unpaidLeave: string;
    startDate: string;
    endDate: string;
    days: string;
    reason: string;
    status: string;
    approved: string;
    rejected: string;
    pending: string;
  };
  centers: {
    main: string;
    american: string;
    european: string;
    selectCenter: string;
    add: string;
    delete: string;
    save: string;
    approve: string;
    print: string;
    reject: string;
  };
  actions: {
    edit: string;
    cancel: string;
    reset: string;
    back: string;
    update: string;
    success: string;
    error: string;
    confirmDelete: string;
    logoutSuccess: string;
    dataResetSuccess: string;
    savedSuccessfully: string;
  };
  settings: {
    settings: string;
    language: string;
    changeLanguage: string;
  };
  sync: {
    syncing: string;
    autoSync: string;
    syncFailed: string;
    backOnline: string;
    offline: string;
    syncNow: string;
    enableAutoSync: string;
    pendingItems: string;
  };
  geofence: {
    enableDescription: string;
    longitude: string;
    latitude: string;
    mapPreview: string;
    outsideGeofence: string;
    insideGeofence: string;
    locationNotAvailable: string;
    selectOnMap: string;
    description: string;
    enableGeofence: string;
    radius: string;
    locationPermissionDenied: string;
    singleGeofence: string;
    selectGeofence: string;
  };
  notifications: {
    high: string;
    low: string;
    general: string;
    attention: string;
    all: string;
    specific: string;
    send: string;
    browserNotificationsEnabled: string;
    dismiss: string;
    notificationTitle: string;
    priority: string;
    normal: string;
    meeting: string;
    targetType: string;
    center: string;
    selectCenter: string;
    notificationSent: string;
    unreadNotifications: string;
    newNotification: string;
    sendNotification: string;
    notifications: string;
  };
  pwa: {
    installTitle: string;
    installed: string;
    updateNow: string;
  };
}

// 2. كائن الترجمات (Translations Object)
export const translations: Record<Language, Translation> = {
  ar: {
    app: {
      title: 'صرح الإتقان',
      subtitle: 'نظام متكامل للرواتب والحضور',
      systemName: 'نظام صرح الإتقان'
    },
    auth: {
      logout: 'تسجيل الخروج',
      login: 'تسجيل الدخول',
      adminPortal: 'بوابة الإدارة',
      backToSelection: 'العودة للاختيار',
      password: 'كلمة المرور',
      selectPortal: 'اختر البوابة',
      employeePortal: 'بوابة الموظفين',
      userNoLongerExists: 'المستخدم لم يعد موجوداً',
      welcome: 'مرحباً',
      username: 'اسم المستخدم',
      invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة',
      noPermission: 'ليس لديك صلاحية الدخول لهذه البوابة'
    },
    dashboard: {
      adminDashboard: 'لوحة تحكم المدير',
      employeeDashboard: 'لوحة تحكم الموظف',
      backToDashboard: 'العودة للوحة التحكم',
      daily: 'يومي',
      payroll: 'الرواتب',
      advances: 'السلف',
      users: 'المستخدمين',
      notifications: 'الإشعارات'
    },
    navigation: {
      history: 'السجل',
      leave: 'الإجازات',
      reports: 'التقارير',
      comparison: 'مقارنة المراكز',
      daily: 'يومي',
      payroll: 'الرواتب',
      advances: 'السلف',
      users: 'المستخدمين',
      settings: 'الإعدادات'
    },
    employee: {
      employees: 'الموظفين',
      center: 'المركز',
      hireDate: 'تاريخ التعيين',
      totalEmployees: 'إجمالي الموظفين',
      name: 'الاسم',
      salary: 'الراتب',
      position: 'المسمى الوظيفي',
      phoneNumber: 'رقم الهاتف',
      addEmployee: 'إضافة موظف',
      time: 'الوقت',
      profile: 'الملف الشخصي'
    },
    attendance: {
      attendance: 'الحضور',
      checkOut: 'انصراف',
      checkIn: 'حضور',
      present: 'حاضر',
      early: 'مبكر',
      absent: 'غائب',
      delay: 'تأخير',
      lateCount: 'عدد التأخيرات',
      noLocation: 'لا يوجد موقع',
      status: 'الحالة',
      late: 'متأخر',
      severeLate: 'تأخير شديد',
      onLeave: 'في إجازة',
      delayMinutes: 'دقائق التأخير',
      presentCount: 'في الوقت المحدد',
      showMap: 'عرض الخريطة'
    },
    stats: {
      centerStats: 'إحصائيات المركز',
      daysLate: 'أيام التأخير',
      daysAbsent: 'أيام الغياب',
      totalDeductions: 'إجمالي الخصومات',
      daysPresent: 'أيام الحضور',
      statistics: 'الإحصائيات'
    },
    deductions: {
      deductionRules: 'قواعد الخصم',
      noDeduction: 'لا يوجد خصم'
    },
    payroll: {
      payroll: 'مسير الرواتب',
      netSalary: 'صافي الراتب',
      advances: 'السلف',
      baseSalary: 'الراتب الأساسي',
      bonuses: 'المكافآت'
    },
    leave: {
      leaves: 'الإجازات',
      leaveType: 'نوع الإجازة',
      annual: 'سنوية',
      emergency: 'طارئة',
      sickLeave: 'إجازة مرضية',
      unpaidLeave: 'إجازة غير مدفوعة',
      startDate: 'تاريخ البدء',
      endDate: 'تاريخ الانتهاء',
      days: 'الأيام',
      reason: 'السبب',
      status: 'الحالة',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      pending: 'قيد الانتظار'
    },
    centers: {
      main: 'صرح الاتقان الرئيسي',
      american: 'صرح الاتقان الامريكي',
      european: 'صرح الاتقان الاوربي 2',
      selectCenter: 'اختر المركز',
      add: 'إضافة',
      delete: 'حذف',
      save: 'حفظ',
      approve: 'اعتماد',
      print: 'طباعة',
      reject: 'رفض'
    },
    actions: {
      edit: 'تعديل',
      cancel: 'إلغاء',
      reset: 'تصفير',
      back: 'رجوع',
      update: 'تحديث',
      success: 'نجحت العملية',
      error: 'حدث خطأ',
      confirmDelete: 'هل أنت متأكد من الحذف؟',
      logoutSuccess: 'تم تسجيل الخروج بنجاح',
      dataResetSuccess: 'تم استعادة البيانات الافتراضية',
      savedSuccessfully: 'تم الحفظ بنجاح'
    },
    settings: {
      settings: 'الإعدادات',
      language: 'اللغة',
      changeLanguage: 'تغيير اللغة'
    },
    sync: {
      syncing: 'جاري المزامنة...',
      autoSync: 'مزامنة تلقائية',
      syncFailed: 'فشلت المزامنة',
      backOnline: 'عودة للاتصال',
      offline: 'غير متصل',
      syncNow: 'زامن الآن',
      enableAutoSync: 'تفعيل المزامنة التلقائية',
      pendingItems: 'عناصر معلقة'
    },
    geofence: {
      enableDescription: 'تفعيل تحديد النطاق الجغرافي',
      longitude: 'خط الطول',
      latitude: 'خط العرض',
      mapPreview: 'معاينة الخريطة',
      outsideGeofence: 'أنت خارج النطاق المسموح',
      insideGeofence: 'أنت داخل النطاق',
      locationNotAvailable: 'الموقع غير متاح',
      selectOnMap: 'تحديد على الخريطة',
      description: 'الوصف',
      enableGeofence: 'تفعيل السياج',
      radius: 'نصف القطر المسموح',
      locationPermissionDenied: 'تم رفض إذن الموقع',
      singleGeofence: 'نطاق جغرافي واحد',
      selectGeofence: 'اختر النطاق'
    },
    notifications: {
      high: 'عالية',
      low: 'منخفضة',
      general: 'عام',
      attention: 'انتباه',
      all: 'الجميع',
      specific: 'موظفون محددون',
      send: 'إرسال',
      browserNotificationsEnabled: 'إشعارات المتصفح مفعلة',
      dismiss: 'تجاهل',
      notificationTitle: 'عنوان الإشعار',
      priority: 'الأولوية',
      normal: 'عادي',
      meeting: 'اجتماع',
      targetType: 'المستلمون',
      center: 'مركز محدد',
      selectCenter: 'اختر المركز',
      notificationSent: 'تم إرسال الإشعار',
      unreadNotifications: 'إشعارات غير مقروءة',
      newNotification: 'إشعار جديد',
      sendNotification: 'إرسال الإشعارات',
      notifications: 'الإشعارات'
    },
    pwa: {
      installTitle: 'ثبّت التطبيق',
      installed: 'تم التثبيت',
      updateNow: 'تحديث الآن'
    }
  },
  en: {
    app: {
      title: 'Sarh Al-Itqan',
      subtitle: 'Integrated Payroll & Attendance System',
      systemName: 'Sarh Al-Itqan System'
    },
    auth: {
      logout: 'Logout',
      login: 'Login',
      adminPortal: 'Admin Portal',
      backToSelection: 'Back to Selection',
      password: 'Password',
      selectPortal: 'Select Portal',
      employeePortal: 'Employee Portal',
      userNoLongerExists: 'User no longer exists',
      welcome: 'Welcome',
      username: 'Username',
      invalidCredentials: 'Invalid username or password',
      noPermission: 'You do not have permission to access this portal'
    },
    dashboard: {
      adminDashboard: 'Admin Dashboard',
      employeeDashboard: 'Employee Dashboard',
      backToDashboard: 'Back to Dashboard',
      daily: 'Daily',
      payroll: 'Payroll',
      advances: 'Advances',
      users: 'Users',
      notifications: 'Notifications'
    },
    navigation: {
      history: 'History',
      leave: 'Leave',
      reports: 'Reports',
      comparison: 'Center Comparison',
      daily: 'Daily',
      payroll: 'Payroll',
      advances: 'Advances',
      users: 'Users',
      settings: 'Settings'
    },
    employee: {
      employees: 'Employees',
      center: 'Center',
      hireDate: 'Hire Date',
      totalEmployees: 'Total Employees',
      name: 'Name',
      salary: 'Salary',
      position: 'Position',
      phoneNumber: 'Phone Number',
      addEmployee: 'Add Employee',
      time: 'Time',
      profile: 'Profile'
    },
    attendance: {
      attendance: 'Attendance',
      checkOut: 'Check Out',
      checkIn: 'Check In',
      present: 'Present',
      early: 'Early',
      absent: 'Absent',
      delay: 'Delay',
      lateCount: 'Late Count',
      noLocation: 'No Location',
      status: 'Status',
      late: 'Late',
      severeLate: 'Severe Late',
      onLeave: 'On Leave',
      delayMinutes: 'Delay Minutes',
      presentCount: 'On Time',
      showMap: 'Show Map'
    },
    stats: {
      centerStats: 'Center Statistics',
      daysLate: 'Days Late',
      daysAbsent: 'Days Absent',
      totalDeductions: 'Total Deductions',
      daysPresent: 'Days Present',
      statistics: 'Statistics'
    },
    deductions: {
      deductionRules: 'Deduction Rules',
      noDeduction: 'No Deduction'
    },
    payroll: {
      payroll: 'Payroll',
      netSalary: 'Net Salary',
      advances: 'Advances',
      baseSalary: 'Base Salary',
      bonuses: 'Bonuses'
    },
    leave: {
      leaves: 'Leaves',
      leaveType: 'Leave Type',
      annual: 'Annual',
      emergency: 'Emergency',
      sickLeave: 'Sick Leave',
      unpaidLeave: 'Unpaid Leave',
      startDate: 'Start Date',
      endDate: 'End Date',
      days: 'Days',
      reason: 'Reason',
      status: 'Status',
      approved: 'Approved',
      rejected: 'Rejected',
      pending: 'Pending'
    },
    centers: {
      main: 'Sarh Al-Itqan Main',
      american: 'Sarh Al-Itqan American',
      european: 'Sarh Al-Itqan European 2',
      selectCenter: 'Select Center',
      add: 'Add',
      delete: 'Delete',
      save: 'Save',
      approve: 'Approve',
      print: 'Print',
      reject: 'Reject'
    },
    actions: {
      edit: 'Edit',
      cancel: 'Cancel',
      reset: 'Reset',
      back: 'Back',
      update: 'Update',
      success: 'Operation Successful',
      error: 'Error',
      confirmDelete: 'Are you sure you want to delete?',
      logoutSuccess: 'Logout Successful',
      dataResetSuccess: 'Default data restored',
      savedSuccessfully: 'Saved successfully'
    },
    settings: {
      settings: 'Settings',
      language: 'Language',
      changeLanguage: 'Change Language'
    },
    sync: {
      syncing: 'Syncing...',
      autoSync: 'Auto Sync',
      syncFailed: 'Sync Failed',
      backOnline: 'Back Online',
      offline: 'Offline',
      syncNow: 'Sync Now',
      enableAutoSync: 'Enable Auto Sync',
      pendingItems: 'Pending Items'
    },
    geofence: {
      enableDescription: 'Enable Geofence Tracking',
      longitude: 'Longitude',
      latitude: 'Latitude',
      mapPreview: 'Map Preview',
      outsideGeofence: 'You are outside the allowed area',
      insideGeofence: 'You are inside the geofence',
      locationNotAvailable: 'Location not available',
      selectOnMap: 'Select on Map',
      description: 'Description',
      enableGeofence: 'Enable Geofence',
      radius: 'Allowed Radius',
      locationPermissionDenied: 'Location permission denied',
      singleGeofence: 'Single Geofence',
      selectGeofence: 'Click to select location'
    },
    notifications: {
      high: 'High',
      low: 'Low',
      general: 'General',
      attention: 'Attention',
      all: 'All',
      specific: 'Specific Employees',
      send: 'Send',
      browserNotificationsEnabled: 'Browser notifications enabled',
      dismiss: 'Dismiss',
      notificationTitle: 'Notification Title',
      priority: 'Priority',
      normal: 'Normal',
      meeting: 'Meeting',
      targetType: 'Recipients',
      center: 'Specific Center',
      selectCenter: 'Select Center',
      notificationSent: 'Notification Sent',
      unreadNotifications: 'Unread Notifications',
      newNotification: 'New Notification',
      sendNotification: 'Send Notification',
      notifications: 'Notifications'
    },
    pwa: {
      installTitle: 'Install App',
      installed: 'Installed',
      updateNow: 'Update Now'
    }
  }
};

// 3. إنشاء الـ Context  
type TranslationFunction = Translation & ((key: string) => string);

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationFunction;
  dir: Direction;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function createTranslationFunction(translations: Translation): TranslationFunction {
  const getNestedValue = (obj: any, path: string): string => {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return path;
      }
    }
    
    return typeof current === 'string' ? current : path;
  };

  const fn = (key: string) => getNestedValue(translations, key);
  
  return Object.assign(fn, translations) as TranslationFunction;
}

// 4. مكون الـ Provider
export function LanguageProvider({ children }: { children: ReactNode }) {
  // تهيئة الحالة مع قراءة اللغة المخزنة أو الافتراضية
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('language');
      return (stored === 'ar' || stored === 'en') ? stored : 'ar';
    }
    return 'ar';
  });

  // تحديث اتجاه الصفحة عند تغيير اللغة
  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language]);

  const t = React.useMemo(() => createTranslationFunction(translations[language]), [language]);

  const value = React.useMemo(() => ({
    language,
    setLanguage,
    t,
    dir: language === 'ar' ? 'rtl' : 'ltr' as Direction
  }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// 5. Hook مخصص لاستخدام الـ Context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}