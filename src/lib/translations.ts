export type Language = 'ar' | 'en' | 'hi' | 'ur'

export interface Translation {
  app: {
    title: string;
    subtitle: string;
    systemName: string;
  };
  auth: {
    login: string;
    logout: string;
    adminPortal: string;
    backToSelection: string;
    password: string;
    selectPortal: string;
    employeePortal: string;
    userNoLongerExists: string;
    welcome: string;
    username: string;
  };
  dashboard: {
    adminDashboard: string;
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
  };
  attendance: {
    attendance: string;
    checkOut: string;
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
    points: string;
    deductionPoints: string;
  };
  deductions: {
    deductionRules: string;
    noDeduction: string;
    points: string;
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
    save: string;
  };
  messages: {
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
    exitMapMode: string;
    title: string;
    enableGeofencing: string;
    mainGeofence: string;
    geofenceUpdated: string;
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
  };
  pwa: {
    installTitle: string;
    installed: string;
    updateNow: string;
  };
}

export const translations: Record<Language, Translation> = {
  ar: {
    app: {
      title: 'صرح الإتقان',
      subtitle: 'نظام الحضور والرواتب المتكامل',
      systemName: 'نظام صرح الإتقان'
    },
    auth: {
      logout: 'تسجيل الخروج',
      login: 'تسجيل الدخول',
      adminPortal: 'بوابة المسؤول',
      backToSelection: 'العودة للقائمة',
      password: 'كلمة المرور',
      selectPortal: 'اختر البوابة',
      employeePortal: 'بوابة الموظف',
      userNoLongerExists: 'المستخدم لم يعد موجوداً',
      welcome: 'مرحباً',
      username: 'اسم المستخدم'
    },
    dashboard: {
      adminDashboard: 'لوحة تحكم المسؤول',
      backToDashboard: 'العودة للوحة التحكم',
      daily: 'يومي',
      payroll: 'الرواتب',
      advances: 'السلف',
      users: 'المستخدمين',
      notifications: 'الإشعارات'
    },
    navigation: {
      history: 'السجلات',
      leave: 'الإجازات',
      reports: 'التقارير',
      comparison: 'مقارنة المراكز'
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
      addEmployee: 'إضافة موظف'
    },
    attendance: {
      attendance: 'الحضور',
      checkOut: 'تسجيل الخروج',
      present: 'حضور',
      early: 'مبكر',
      absent: 'غياب',
      delay: 'التأخير',
      lateCount: 'حالات التأخير',
      noLocation: 'لا يوجد موقع',
      status: 'الحالة',
      late: 'متأخر',
      severeLate: 'تأخير شديد',
      onLeave: 'في إجازة',
      delayMinutes: 'دقائق التأخير',
      presentCount: 'حضور في الوقت',
      showMap: 'عرض الخريطة'
    },
    stats: {
      centerStats: 'إحصائيات المركز',
      daysLate: 'أيام التأخير',
      daysAbsent: 'أيام الغياب',
      totalDeductions: 'إجمالي الخصومات',
      daysPresent: 'أيام الحضور',
      points: 'نقاط',
      deductionPoints: 'نقاط الخصم'
    },
    deductions: {
      deductionRules: 'قواعد الخصم',
      noDeduction: 'لا يوجد خصم',
      points: 'نقطة'
    },
    payroll: {
      payroll: 'الرواتب',
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
      save: 'حفظ'
    },
    messages: {
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
      selectGeofence: 'اختر النطاق',
      exitMapMode: 'إنهاء التحديد',
      title: 'إعدادات السياج الجغرافي',
      enableGeofencing: 'تفعيل السياج الجغرافي',
      mainGeofence: 'السياج الجغرافي الرئيسي',
      geofenceUpdated: 'تم تحديث السياج الجغرافي'
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
      newNotification: 'إشعار جديد'
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
      username: 'Username'
    },
    dashboard: {
      adminDashboard: 'Admin Dashboard',
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
      comparison: 'Center Comparison'
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
      addEmployee: 'Add Employee'
    },
    attendance: {
      attendance: 'Attendance',
      checkOut: 'Check Out',
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
      points: 'Points',
      deductionPoints: 'Deduction Points'
    },
    deductions: {
      deductionRules: 'Deduction Rules',
      noDeduction: 'No Deduction',
      points: 'Point'
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
      save: 'Save'
    },
    messages: {
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
      selectGeofence: 'Click to select location',
      exitMapMode: 'Exit Selection',
      title: 'Geofence Settings',
      enableGeofencing: 'Enable Geofencing',
      mainGeofence: 'Main Geofence',
      geofenceUpdated: 'Geofence Updated'
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
      newNotification: 'New Notification'
    },
    pwa: {
      installTitle: 'Install App',
      installed: 'Installed',
      updateNow: 'Update Now'
    }
  },
  hi: {
    app: {
      title: 'Sarh Al-Itqan',
      subtitle: 'एकीकृत उपस्थिति और वेतन प्रणाली',
      systemName: 'Sarh Al-Itqan System'
    },
    auth: {
      logout: 'लॉग आउट',
      login: 'लॉग इन',
      adminPortal: 'प्रशासक पोर्टल',
      backToSelection: 'चयन पर वापस',
      password: 'पासवर्ड',
      selectPortal: 'पोर्टल चुनें',
      employeePortal: 'कर्मचारी पोर्टल',
      userNoLongerExists: 'उपयोगकर्ता अब मौजूद नहीं है',
      welcome: 'स्वागत',
      username: 'उपयोगकर्ता नाम'
    },
    dashboard: {
      adminDashboard: 'प्रशासक डैशबोर्ड',
      backToDashboard: 'डैशबोर्ड पर वापस',
      daily: 'दैनिक',
      payroll: 'वेतन',
      advances: 'अग्रिम',
      users: 'उपयोगकर्ता',
      notifications: 'सूचनाएं'
    },
    navigation: {
      history: 'रिकॉर्ड',
      leave: 'छुट्टी',
      reports: 'रिपोर्ट',
      comparison: 'केंद्र तुलना'
    },
    employee: {
      employees: 'कर्मचारी',
      center: 'केंद्र',
      hireDate: 'नियुक्ति तिथि',
      totalEmployees: 'कुल कर्मचारी',
      name: 'नाम',
      salary: 'वेतन',
      position: 'पद',
      phoneNumber: 'फ़ोन नंबर',
      addEmployee: 'कर्मचारी जोड़ें'
    },
    attendance: {
      attendance: 'उपस्थिति',
      checkOut: 'चेक आउट',
      present: 'उपस्थित',
      early: 'जल्दी',
      absent: 'अनुपस्थित',
      delay: 'देरी',
      lateCount: 'देर से गिनती',
      noLocation: 'कोई स्थान नहीं',
      status: 'स्थिति',
      late: 'देर',
      severeLate: 'गंभीर देरी',
      onLeave: 'छुट्टी पर',
      delayMinutes: 'देरी (मिनट)',
      presentCount: 'समय पर',
      showMap: 'मानचित्र दिखाएं'
    },
    stats: {
      centerStats: 'केंद्र सांख्यिकी',
      daysLate: 'देरी के दिन',
      daysAbsent: 'अनुपस्थिति के दिन',
      totalDeductions: 'कुल कटौती',
      daysPresent: 'उपस्थिति के दिन',
      points: 'अंक',
      deductionPoints: 'कटौती अंक'
    },
    deductions: {
      deductionRules: 'कटौती के नियम',
      noDeduction: 'कोई कटौती नहीं',
      points: 'अंक'
    },
    payroll: {
      payroll: 'वेतन',
      netSalary: 'शुद्ध वेतन',
      advances: 'अग्रिम',
      baseSalary: 'मूल वेतन',
      bonuses: 'बोनस'
    },
    leave: {
      leaves: 'छुट्टियां',
      leaveType: 'छुट्टी का प्रकार',
      annual: 'वार्षिक',
      emergency: 'आपातकालीन',
      sickLeave: 'बीमारी की छुट्टी',
      unpaidLeave: 'बिना वेतन छुट्टी',
      startDate: 'आरंभ तिथि',
      endDate: 'समाप्ति तिथि',
      days: 'दिन',
      reason: 'कारण',
      status: 'स्थिति',
      approved: 'स्वीकृत',
      rejected: 'अस्वीकृत',
      pending: 'लंबित'
    },
    centers: {
      main: 'Sarh Al-Itqan Main',
      american: 'Sarh Al-Itqan American',
      european: 'Sarh Al-Itqan European 2',
      selectCenter: 'केंद्र चुनें',
      add: 'जोड़ें',
      delete: 'हटाएं',
      save: 'सहेजें',
      approve: 'मंजूरी दें',
      print: 'प्रिंट',
      reject: 'अस्वीकार करें'
    },
    actions: {
      edit: 'संपादित करें',
      cancel: 'रद्द करें',
      reset: 'रीसेट',
      back: 'वापस',
      update: 'अपडेट करें',
      success: 'ऑपरेशन सफल',
      error: 'त्रुटि',
      confirmDelete: 'क्या आप वाकई हटाना चाहते हैं?',
      save: 'सहेजें'
    },
    messages: {
      logoutSuccess: 'लॉगआउट सफल',
      dataResetSuccess: 'डिफ़ॉल्ट डेटा बहाल',
      savedSuccessfully: 'सफलतापूर्वक सहेजा गया'
    },
    settings: {
      settings: 'सेटिंग्स',
      language: 'भाषा',
      changeLanguage: 'भाषा बदलें'
    },
    sync: {
      syncing: 'सिंक हो रहा है...',
      autoSync: 'ऑटो सिंक',
      syncFailed: 'सिंक विफल',
      backOnline: 'वापस ऑनलाइन',
      offline: 'ऑफ़लाइन',
      syncNow: 'अभी सिंक करें',
      enableAutoSync: 'ऑटो सिंक सक्षम करें',
      pendingItems: 'लंबित आइटम'
    },
    geofence: {
      enableDescription: 'जियोफेंस ट्रैकिंग सक्षम करें',
      longitude: 'देशांतर',
      latitude: 'अक्षांश',
      mapPreview: 'मानचित्र पूर्वावलोकन',
      outsideGeofence: 'आप अनुमत क्षेत्र से बाहर हैं',
      insideGeofence: 'आप जियोफेंस के अंदर हैं',
      locationNotAvailable: 'स्थान उपलब्ध नहीं है',
      selectOnMap: 'मानचित्र पर चुनें',
      description: 'विवरण',
      enableGeofence: 'जियोफेंस सक्षम करें',
      radius: 'अनुमत दायरा',
      locationPermissionDenied: 'स्थान की अनुमति अस्वीकृत',
      singleGeofence: 'एकल जियोफेंस',
      selectGeofence: 'स्थान चुनने के लिए क्लिक करें',
      exitMapMode: 'चयन समाप्त करें',
      title: 'जियोफेंस सेटिंग्स',
      enableGeofencing: 'जियोफेंसिंग सक्षम करें',
      mainGeofence: 'मुख्य जियोफेंस',
      geofenceUpdated: 'जियोफेंस अपडेट किया गया'
    },
    notifications: {
      high: 'उच्च',
      low: 'कम',
      general: 'सामान्य',
      attention: 'ध्यान दें',
      all: 'सभी',
      specific: 'विशिष्ट कर्मचारी',
      send: 'भेजें',
      browserNotificationsEnabled: 'ब्राउज़र सूचनाएं सक्षम',
      dismiss: 'खारिज करें',
      notificationTitle: 'सूचना शीर्षक',
      priority: 'प्राथमिकता',
      normal: 'सामान्य',
      meeting: 'बैठक',
      targetType: 'प्राप्तकर्ता',
      center: 'विशिष्ट केंद्र',
      selectCenter: 'केंद्र चुनें',
      notificationSent: 'सूचना भेजी गई',
      unreadNotifications: 'अपठित सूचनाएं',
      newNotification: 'नई सूचना'
    },
    pwa: {
      installTitle: 'ऐप इंस्टॉल करें',
      installed: 'इंस्टॉल हो गया',
      updateNow: 'अभी अपडेट करें'
    }
  },
  ur: {
    app: {
      title: 'صرح الاتقان',
      subtitle: 'حاضری اور پے رول کا مربوط نظام',
      systemName: 'صرح الاتقان سسٹم'
    },
    auth: {
      logout: 'لاگ آؤٹ',
      login: 'لاگ ان',
      adminPortal: 'ایڈمن پورٹل',
      backToSelection: 'واپسی',
      password: 'پاس ورڈ',
      selectPortal: 'پورٹل منتخب کریں',
      employeePortal: 'ملازم پورٹل',
      userNoLongerExists: 'صارف سسٹم میں موجود نہیں',
      welcome: 'خوش آمدید',
      username: 'صارف کا نام'
    },
    dashboard: {
      adminDashboard: 'ایڈمن ڈیش بورڈ',
      backToDashboard: 'ڈیش بورڈ پر واپسی',
      daily: 'روزانہ',
      payroll: 'تنخواہ',
      advances: 'پیشگی',
      users: 'صارفین',
      notifications: 'اطلاعات'
    },
    navigation: {
      history: 'ریکارڈ',
      leave: 'چھٹی',
      reports: 'رپورٹس',
      comparison: 'مرکز کا موازنہ'
    },
    employee: {
      employees: 'ملازمین',
      center: 'مرکز',
      hireDate: 'تقرری کی تاریخ',
      totalEmployees: 'کل ملازمین',
      name: 'نام',
      salary: 'تنخواہ',
      position: 'عہدہ',
      phoneNumber: 'فون نمبر',
      addEmployee: 'ملازم شامل کریں'
    },
    attendance: {
      attendance: 'حاضری',
      checkOut: 'چیک آؤٹ',
      present: 'حاضر',
      early: 'جلد',
      absent: 'غیر حاضر',
      delay: 'تاخیر',
      lateCount: 'دیر سے گنتی',
      noLocation: 'کوئی مقام نہیں',
      status: 'حیثیت',
      late: 'دیر سے',
      severeLate: 'شدید تاخیر',
      onLeave: 'چھٹی پر',
      delayMinutes: 'تاخیر (منٹ)',
      presentCount: 'وقت پر',
      showMap: 'نقشہ دکھائیں'
    },
    stats: {
      centerStats: 'مرکز کے اعدادوشمار',
      daysLate: 'تاخیر کے دن',
      daysAbsent: 'غیر حاضری کے دن',
      totalDeductions: 'کل کٹوتی',
      daysPresent: 'حاضری کے دن',
      points: 'پوائنٹس',
      deductionPoints: 'کٹوتی پوائنٹس'
    },
    deductions: {
      deductionRules: 'کٹوتی کے اصول',
      noDeduction: 'کوئی کٹوتی نہیں',
      points: 'پوائنٹ'
    },
    payroll: {
      payroll: 'تنخواہ',
      netSalary: 'خالص تنخواہ',
      advances: 'پیشگی',
      baseSalary: 'بنیادی تنخواہ',
      bonuses: 'بونس'
    },
    leave: {
      leaves: 'چھٹیاں',
      leaveType: 'چھٹی کی قسم',
      annual: 'سالانہ',
      emergency: 'ہنگامی',
      sickLeave: 'بیماری کی چھٹی',
      unpaidLeave: 'بغیر تنخواہ چھٹی',
      startDate: 'شروع کی تاریخ',
      endDate: 'ختم ہونے کی تاریخ',
      days: 'دن',
      reason: 'وجہ',
      status: 'حیثیت',
      approved: 'منظور شدہ',
      rejected: 'مسترد',
      pending: 'زیر التواء'
    },
    centers: {
      main: 'صرح الاتقان مین',
      american: 'صرح الاتقان امریکن',
      european: 'صرح الاتقان یورپی 2',
      selectCenter: 'مرکز منتخب کریں',
      add: 'شامل کریں',
      delete: 'حذف کریں',
      save: 'محفوظ کریں',
      approve: 'منظور کریں',
      print: 'پرنٹ',
      reject: 'مسترد کریں'
    },
    actions: {
      edit: 'ترمیم',
      cancel: 'منسوخ کریں',
      reset: 'ری سیٹ',
      back: 'واپس',
      update: 'اپ ڈیٹ',
      success: 'آپریشن کامیاب',
      error: 'خرابی',
      confirmDelete: 'کیا آپ واقعی حذف کرنا چاہتے ہیں؟',
      save: 'محفوظ کریں'
    },
    messages: {
      logoutSuccess: 'لاگ آؤٹ کامیاب',
      dataResetSuccess: 'ڈیفالٹ ڈیٹا بحال',
      savedSuccessfully: 'کامیابی سے محفوظ'
    },
    settings: {
      settings: 'ترتیبات',
      language: 'زبان',
      changeLanguage: 'زبان تبدیل کریں'
    },
    sync: {
      syncing: 'ہم آہنگی جاری ہے...',
      autoSync: 'آٹو سنک',
      syncFailed: 'سنک ناکام',
      backOnline: 'واپس آن لائن',
      offline: 'آف لائن',
      syncNow: 'ابھی سنک کریں',
      enableAutoSync: 'آٹو سنک کو فعال کریں',
      pendingItems: 'زیر التواء آئٹمز'
    },
    geofence: {
      enableDescription: 'جیو فینس ٹریکنگ کو فعال کریں',
      longitude: 'طول البلد',
      latitude: 'عرض البلد',
      mapPreview: 'نقشہ پیش نظارہ',
      outsideGeofence: 'آپ اجازت یافتہ حد سے باہر ہیں',
      insideGeofence: 'آپ جیو فینس کے اندر ہیں',
      locationNotAvailable: 'مقام دستیاب نہیں',
      selectOnMap: 'نقشے پر منتخب کریں',
      description: 'تفصیل',
      enableGeofence: 'جیو فینس کو فعال کریں',
      radius: 'اجازت یافتہ رینج',
      locationPermissionDenied: 'مقام کی اجازت مسترد',
      singleGeofence: 'سنگل جیو فینس',
      selectGeofence: 'مقام منتخب کرنے کے لیے کلک کریں',
      exitMapMode: 'انتخاب ختم کریں',
      title: 'جیو فینس کی ترتیبات',
      enableGeofencing: 'جیو فینسنگ فعال کریں',
      mainGeofence: 'مرکزی جیو فینس',
      geofenceUpdated: 'جیو فینس اپ ڈیٹ ہو گیا'
    },
    notifications: {
      high: 'اعلی',
      low: 'کم',
      general: 'عام',
      attention: 'توجہ',
      all: 'سب',
      specific: 'مخصوص ملازمین',
      send: 'بھیجیں',
      browserNotificationsEnabled: 'براؤزر کی اطلاعات فعال',
      dismiss: 'خارج کریں',
      notificationTitle: 'اطلاع کا عنوان',
      priority: 'ترجیح',
      normal: 'عام',
      meeting: 'میٹنگ',
      targetType: 'وصول کنندگان',
      center: 'مخصوص مرکز',
      selectCenter: 'مرکز منتخب کریں',
      notificationSent: 'اطلاع بھیجی گئی',
      unreadNotifications: 'نہ پڑھی گئی اطلاعات',
      newNotification: 'نئی اطلاع'
    },
    pwa: {
      installTitle: 'ایپ انسٹال کریں',
      installed: 'انسٹال ہو گیا',
      updateNow: 'ابھی اپ ڈیٹ کریں'
    }
  }
};

// دالة مساعدة لجلب الترجمة بناءً على المسار
export function getTranslation(lang: Language, path: string): string {
  const keys = path.split('.');
  let result: any = translations[lang];

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      // العودة إلى اللغة الإنجليزية كاحتياطي أو إرجاع المسار
      return path;
    }
  }

  return typeof result === 'string' ? result : path;
}