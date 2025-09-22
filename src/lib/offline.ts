// Offline data management for the hazard platform

interface OfflineReport {
  id: string;
  latitude: number;
  longitude: number;
  hazard_type: string;
  description: string;
  image_url?: string;
  video_url?: string;
  severity: number;
  language: string;
  user_id: string;
  created_at: string;
  synced: boolean;
}

class OfflineManager {
  private dbName = 'hazard-offline-db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('reports')) {
          const store = db.createObjectStore('reports', { keyPath: 'id' });
          store.createIndex('synced', 'synced', { unique: false });
          store.createIndex('created_at', 'created_at', { unique: false });
        }
      };
    });
  }

  async saveReport(report: Omit<OfflineReport, 'id' | 'created_at' | 'synced'>): Promise<string> {
    if (!this.db) await this.init();
    
    const offlineReport: OfflineReport = {
      ...report,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reports'], 'readwrite');
      const store = transaction.objectStore('reports');
      const request = store.add(offlineReport);
      
      request.onsuccess = () => resolve(offlineReport.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedReports(): Promise<OfflineReport[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reports'], 'readonly');
      const store = transaction.objectStore('reports');
      const index = store.index('synced');
      const request = index.getAll(IDBKeyRange.only(false));
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(reportId: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reports'], 'readwrite');
      const store = transaction.objectStore('reports');
      const getRequest = store.get(reportId);
      
      getRequest.onsuccess = () => {
        const report = getRequest.result;
        if (report) {
          report.synced = true;
          const putRequest = store.put(report);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getAllReports(): Promise<OfflineReport[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reports'], 'readonly');
      const store = transaction.objectStore('reports');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearSyncedReports(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reports'], 'readwrite');
      const store = transaction.objectStore('reports');
      const index = store.index('synced');
      const request = index.openCursor(IDBKeyRange.only(true));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineManager = new OfflineManager();

// Sync function to upload offline reports when online
export async function syncOfflineReports(): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const unsyncedReports = await offlineManager.getUnsyncedReports();
  let synced = 0;
  let failed = 0;

  for (const report of unsyncedReports) {
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: report.latitude,
          longitude: report.longitude,
          hazard_type: report.hazard_type,
          description: report.description,
          image_url: report.image_url,
          video_url: report.video_url,
          severity: report.severity,
          language: report.language,
          user_id: report.user_id,
        }),
      });

      if (response.ok) {
        await offlineManager.markAsSynced(report.id);
        synced++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('Failed to sync report:', error);
      failed++;
    }
  }

  return { synced, failed };
}

// Monitor online status and sync when connection is restored
export function setupOfflineSync(): void {
  window.addEventListener('online', async () => {
    const result = await syncOfflineReports();
    if (result.synced > 0) {
      console.log(`Synced ${result.synced} offline reports`);
      // You could show a toast notification here
    }
  });
}
