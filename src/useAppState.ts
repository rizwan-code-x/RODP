import { useState, useEffect } from 'react';
import { 
  User, Shop, ServiceModule, Appointment, Task, 
  CustomerCRM, Invoice, InventoryItem, DocumentVaultItem, 
  Staff, FinanceRecord, NotificationLog, SecurityLog, UserRole,
  AIKnowledgeItem
} from './types';
import { 
  DEFAULT_SERVICES, MOCK_SHOPS, MOCK_CUSTOMERS, 
  MOCK_APPOINTMENTS, MOCK_TASKS, MOCK_INVENTORIES, 
  MOCK_STAFF, MOCK_INVOICES, MOCK_FINANCE, 
  MOCK_DOCUMENTS, MOCK_NOTIFICATIONS, MOCK_SECURITY_LOGS 
} from './mockData';
import { db, isFirebaseAvailable } from './lib/firebase';
import { 
  collection, getDocs, setDoc, doc, updateDoc, 
  onSnapshot, writeBatch, query, where, deleteDoc
} from 'firebase/firestore';

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    }
    return cleaned;
  }
  return obj;
}

export function useAppState() {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('rodp_logged_in_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      id: 'usr_owner1',
      name: 'Rizwan Roushan',
      email: 'rizwanroushan0@gmail.com',
      role: 'shop_owner',
      shopId: 'shop_1',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    };
  });

  const [shops, setShops] = useState<Shop[]>([]);
  const [customers, setCustomers] = useState<CustomerCRM[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [services, setServices] = useState<ServiceModule[]>([]);
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [finance, setFinance] = useState<FinanceRecord[]>([]);
  const [vault, setVault] = useState<DocumentVaultItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [aiKnowledge, setAiKnowledge] = useState<AIKnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Load from Firestore OR LocalStorage fallback
  useEffect(() => {
    if (isFirebaseAvailable && db) {
      setLoading(true);
      const unsubscribers: (() => void)[] = [];

      try {
        // Quick helper to setup listener
        const setupSync = (colName: string, setter: (data: any) => void, defaultVal: any) => {
          const colRef = collection(db, colName);
          const unsub = onSnapshot(colRef, (snapshot) => {
            if (snapshot.empty) {
              // Seeding initial collections in firebase if they are completely empty
              const batch = writeBatch(db);
              defaultVal.forEach((item: any) => {
                const docRef = doc(db, colName, item.id);
                batch.set(docRef, sanitizeForFirestore(item));
              });
              batch.commit().then(() => {
                console.log(`Seeded collection: ${colName}`);
              }).catch(err => console.error(`Error seeding ${colName}:`, err));
              
              const stored = localStorage.getItem(`rodp_${colName}`);
              if (stored) {
                try {
                  setter(JSON.parse(stored));
                } catch {
                  setter(defaultVal);
                }
              } else {
                setter(defaultVal);
              }
            } else {
              const list = snapshot.docs.map(d => d.data());
              setter(list);
              localStorage.setItem(`rodp_${colName}`, JSON.stringify(list));
            }
          }, (err) => {
            console.error(`Sync error on ${colName}:`, err);
            const stored = localStorage.getItem(`rodp_${colName}`);
            if (stored) {
              try {
                setter(JSON.parse(stored));
              } catch {
                setter(defaultVal);
              }
            } else {
              setter(defaultVal);
            }
          });
          unsubscribers.push(unsub);
        };

        setupSync('shops', setShops, MOCK_SHOPS);
        setupSync('customers', setCustomers, MOCK_CUSTOMERS);
        setupSync('appointments', setAppointments, MOCK_APPOINTMENTS);
        setupSync('tasks', setTasks, MOCK_TASKS);
        setupSync('services', setServices, DEFAULT_SERVICES);
        setupSync('inventories', setInventories, MOCK_INVENTORIES);
        setupSync('staff', setStaff, MOCK_STAFF);
        setupSync('invoices', setInvoices, MOCK_INVOICES);
        setupSync('finance', setFinance, MOCK_FINANCE);
        setupSync('vault', setVault, MOCK_DOCUMENTS);
        setupSync('notifications', setNotifications, MOCK_NOTIFICATIONS);
        setupSync('securityLogs', setSecurityLogs, MOCK_SECURITY_LOGS);
        setupSync('aiKnowledge', setAiKnowledge, []);

        setLoading(false);
      } catch (err) {
        console.error('Error setting up Firebase synchronization listeners:', err);
        loadLocalFallbacks();
      }

      return () => {
        unsubscribers.forEach(u => u());
      };
    } else {
      loadLocalFallbacks();
    }
  }, []);

  const loadLocalFallbacks = () => {
    // Local storage sync
    const getOrSet = (key: string, defaultVal: any) => {
      const stored = localStorage.getItem(`rodp_${key}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return defaultVal;
        }
      }
      localStorage.setItem(`rodp_${key}`, JSON.stringify(defaultVal));
      return defaultVal;
    };

    setShops(getOrSet('shops', MOCK_SHOPS));
    setCustomers(getOrSet('customers', MOCK_CUSTOMERS));
    setAppointments(getOrSet('appointments', MOCK_APPOINTMENTS));
    setTasks(getOrSet('tasks', MOCK_TASKS));
    setServices(getOrSet('services', DEFAULT_SERVICES));
    setInventories(getOrSet('inventories', MOCK_INVENTORIES));
    setStaff(getOrSet('staff', MOCK_STAFF));
    setInvoices(getOrSet('invoices', MOCK_INVOICES));
    setFinance(getOrSet('finance', MOCK_FINANCE));
    setVault(getOrSet('vault', MOCK_DOCUMENTS));
    setNotifications(getOrSet('notifications', MOCK_NOTIFICATIONS));
    setSecurityLogs(getOrSet('securityLogs', MOCK_SECURITY_LOGS));
    setAiKnowledge(getOrSet('aiKnowledge', []));
    setLoading(false);
  };

  // Sync state changes to local storage as safety backup
  const syncLocal = (key: string, data: any) => {
    localStorage.setItem(`rodp_${key}`, JSON.stringify(data));
  };

  // State mutators with dual Firebase / Local support
  const addRecord = async (colName: string, record: any, setter: any, stateList: any[]) => {
    const updated = [...stateList, record];
    setter(updated);
    syncLocal(colName, updated);

    if (isFirebaseAvailable && db) {
      try {
        const cleanedRecord = sanitizeForFirestore(record);
        await setDoc(doc(db, colName, record.id), cleanedRecord);
      } catch (err) {
        console.error(`Firebase write error on ${colName}:`, err);
      }
    }
  };

  const updateRecord = async (colName: string, id: string, updates: any, setter: any, stateList: any[]) => {
    const updated = stateList.map(item => item.id === id ? { ...item, ...updates } : item);
    setter(updated);
    syncLocal(colName, updated);

    if (isFirebaseAvailable && db) {
      try {
        const cleanedUpdates = sanitizeForFirestore(updates);
        await updateDoc(doc(db, colName, id), cleanedUpdates);
      } catch (err) {
        console.error(`Firebase update error on ${colName}:`, err);
      }
    }
  };

  const deleteRecord = async (colName: string, id: string, setter: any, stateList: any[]) => {
    const updated = stateList.filter(item => item.id !== id);
    setter(updated);
    syncLocal(colName, updated);

    if (isFirebaseAvailable && db) {
      try {
        await deleteDoc(doc(db, colName, id));
      } catch (err) {
        console.error(`Firebase delete error on ${colName}:`, err);
      }
    }
  };

  const changeUserRole = (role: UserRole) => {
    let name = 'Rizwan Roushan';
    let email = 'rizwanroushan0@gmail.com';
    let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    let shopId = 'shop_1';
    let mobile: string | undefined = undefined;

    if (role === 'super_admin') {
      name = 'RODP Super Admin / CEO';
      email = 'ceo.rodp@online-dreams.com';
      avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150';
      shopId = '';
    } else if (role === 'staff') {
      name = 'Faisal Rizwan';
      email = 'faisal.rodp@gmail.com';
      avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
      shopId = 'shop_1';
      mobile = '9876543210';
    } else if (role === 'customer') {
      name = 'Rahul Sharma';
      email = 'rahul.sharma@gmail.com';
      avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150';
      shopId = 'shop_1';
      mobile = '9988776655';
    }

    setCurrentUser({
      id: role === 'customer' ? 'cust_1' : (role === 'staff' ? 'staff_1' : 'usr_owner1'),
      name,
      email,
      role,
      shopId,
      avatar,
      mobile
    });

    // Log security activity
    const newLog: SecurityLog = {
      id: `sec_${Date.now()}`,
      userId: role === 'customer' ? 'cust_1' : 'usr_owner1',
      userName: name,
      userRole: role,
      action: `Switched View Role to: ${role}`,
      ipAddress: '157.34.122.98',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      shopId: shopId || undefined
    };
    addRecord('securityLogs', newLog, setSecurityLogs, securityLogs);
  };

  const loginUser = (role: UserRole, name: string, email: string, permissions?: string[], mobile?: string, shopId?: string) => {
    let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    if (role === 'super_admin') {
      avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150';
    } else if (role === 'staff') {
      avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
    } else if (role === 'customer') {
      avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150';
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      shopId: shopId || (role === 'super_admin' ? '' : 'shop_1'),
      avatar,
      permissions,
      mobile: mobile || (role === 'customer' ? '9988776655' : undefined)
    };

    setCurrentUser(newUser);
    localStorage.setItem('rodp_logged_in_user', JSON.stringify(newUser));

    // Log security activity
    const newLog: SecurityLog = {
      id: `sec_${Date.now()}`,
      userId: newUser.id,
      userName: name,
      userRole: role,
      action: `Logged In Securely: ${name} (${role.toUpperCase()})`,
      ipAddress: '157.34.122.98',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      shopId: newUser.shopId || undefined
    };
    addRecord('securityLogs', newLog, setSecurityLogs, securityLogs);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const updateCustomerProfile = async (updates: { name: string; email: string; mobile: string; avatar: string }) => {
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem('rodp_logged_in_user', JSON.stringify(updatedUser));

    const matchingCustomer = customers.find(c => c.mobileNumber === currentUser.mobile || c.mobileNumber === updates.mobile || c.email === updates.email);
    if (matchingCustomer) {
      updateRecord('customers', matchingCustomer.id, {
        name: updates.name,
        email: updates.email,
        mobileNumber: updates.mobile,
        avatar: updates.avatar
      }, setCustomers, customers);
    }
  };

  return {
    currentUser,
    updateCustomerProfile,
    changeUserRole,
    loginUser,
    shops,
    addShop: (record: Shop) => addRecord('shops', record, setShops, shops),
    updateShop: (id: string, updates: any) => updateRecord('shops', id, updates, setShops, shops),
    deleteShop: (id: string) => deleteRecord('shops', id, setShops, shops),
    
    customers,
    addCustomer: (record: CustomerCRM) => addRecord('customers', record, setCustomers, customers),
    updateCustomer: (id: string, updates: any) => updateRecord('customers', id, updates, setCustomers, customers),
    deleteCustomer: (id: string) => deleteRecord('customers', id, setCustomers, customers),
    
    appointments,
    addAppointment: (record: Appointment) => addRecord('appointments', record, setAppointments, appointments),
    updateAppointment: (id: string, updates: any) => updateRecord('appointments', id, updates, setAppointments, appointments),
    
    tasks,
    addTask: (record: Task) => addRecord('tasks', record, setTasks, tasks),
    updateTask: (id: string, updates: any) => updateRecord('tasks', id, updates, setTasks, tasks),
    deleteTask: (id: string) => deleteRecord('tasks', id, setTasks, tasks),

    services,
    addService: (record: ServiceModule) => addRecord('services', record, setServices, services),
    updateService: (id: string, updates: any) => updateRecord('services', id, updates, setServices, services),
    deleteService: (id: string) => deleteRecord('services', id, setServices, services),

    inventories,
    addInventory: (record: InventoryItem) => addRecord('inventories', record, setInventories, inventories),
    updateInventory: (id: string, updates: any) => updateRecord('inventories', id, updates, setInventories, inventories),
    
    staff,
    addStaff: (record: Staff) => addRecord('staff', record, setStaff, staff),
    updateStaff: (id: string, updates: any) => updateRecord('staff', id, updates, setStaff, staff),
    
    invoices,
    addInvoice: (record: Invoice) => addRecord('invoices', record, setInvoices, invoices),
    updateInvoice: (id: string, updates: any) => updateRecord('invoices', id, updates, setInvoices, invoices),
    
    finance,
    addFinanceRecord: (record: FinanceRecord) => addRecord('finance', record, setFinance, finance),
    
    vault,
    addVaultItem: (record: DocumentVaultItem) => addRecord('vault', record, setVault, vault),
    deleteVaultItem: (id: string) => deleteRecord('vault', id, setVault, vault),
    
    notifications,
    addNotificationLog: (record: NotificationLog) => addRecord('notifications', record, setNotifications, notifications),
    
    securityLogs,
    aiKnowledge,
    addAIKnowledgeItem: (record: AIKnowledgeItem) => addRecord('aiKnowledge', record, setAiKnowledge, aiKnowledge),
    deleteAIKnowledgeItem: (id: string) => deleteRecord('aiKnowledge', id, setAiKnowledge, aiKnowledge),
    
    loading,
    theme,
    toggleTheme
  };
}
