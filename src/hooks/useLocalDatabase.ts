import { useState, useEffect, useCallback } from 'react'

interface DatabaseOptions<T> {
  filename: string
  defaultData?: T
}

interface UseLocalDatabaseReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  saveData: (newData: T) => Promise<void>
  updateData: (updates: Partial<T>) => Promise<void>
  addItem: (item: unknown, collectionName: string) => Promise<void>
  removeItem: (id: number, collectionName: string) => Promise<void>
  updateItem: (id: number, item: unknown, collectionName: string) => Promise<void>
  clearData: () => void
  reload: () => Promise<void>
}

export function useLocalDatabase<T>(
  options: DatabaseOptions<T>
): UseLocalDatabaseReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // تحميل البيانات من الملف
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
      const dataUrl = `${basePath}/data/${options.filename}`
      const response = await fetch(dataUrl)
      if (!response.ok) {
        throw new Error(`Failed to load ${options.filename}`)
      }
      const json = await response.json()
      setData(json)
      
      // حفظ في LocalStorage
      localStorage.setItem(`db_${options.filename}`, JSON.stringify(json))
      setError(null)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      
      // محاولة تحميل من LocalStorage
      const cached = localStorage.getItem(`db_${options.filename}`)
      if (cached) {
        try {
          setData(JSON.parse(cached))
        } catch {
          if (options.defaultData) {
            setData(options.defaultData)
          }
        }
      } else if (options.defaultData) {
        setData(options.defaultData)
      }
    } finally {
      setLoading(false)
    }
  }, [options])

  // حفظ البيانات
  const saveData = useCallback(async (newData: T) => {
    try {
      setData(newData)
      localStorage.setItem(`db_${options.filename}`, JSON.stringify(newData))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data')
    }
  }, [options.filename])

  // تحديث بيانات محددة
  const updateData = useCallback(
    async (updates: Partial<T>) => {
      if (!data) return
      const updated = { ...data, ...updates } as T
      await saveData(updated)
    },
    [data, saveData]
  )

  // إضافة عنصر إلى مجموعة
  const addItem = useCallback(
    async (item: unknown, collectionName: string) => {
      if (!data) return

      const currentData = data as Record<string, unknown>
      const updated: Record<string, unknown> = { ...currentData }
      const collection = currentData[collectionName]

      if (Array.isArray(collection)) {
        const newCollection = [...collection, item]
        updated[collectionName] = newCollection
      } else if (collection && typeof collection === 'object') {
        const map = { ...(collection as Record<string, unknown>) }
        const itemRecord = item as Record<string, unknown>
        const key = String(itemRecord?.id ?? `${Date.now()}-${Math.random()}`)
        map[key] = item
        updated[collectionName] = map
      } else {
        updated[collectionName] = [item]
      }

      if (typeof updated.nextId === 'number') {
        updated.nextId = (updated.nextId as number) + 1
      }

      await saveData(updated as T)
    },
    [data, saveData]
  )

  // حذف عنصر من مجموعة
  const removeItem = useCallback(
    async (id: number, collectionName: string) => {
      if (!data) return
      const currentData = data as Record<string, unknown>
      const updated: Record<string, unknown> = { ...currentData }
      const collection = currentData[collectionName]
      
      if (Array.isArray(collection)) {
        updated[collectionName] = collection.filter(
          (item: unknown) => (item as Record<string, unknown>).id !== id
        )
      } else if (collection && typeof collection === 'object') {
        const map = { ...(collection as Record<string, unknown>) }
        delete map[String(id)]
        updated[collectionName] = map
      }
      
      await saveData(updated as T)
    },
    [data, saveData]
  )

  // تحديث عنصر في مجموعة
  const updateItem = useCallback(
    async (id: number, item: unknown, collectionName: string) => {
      if (!data) return
      const currentData = data as Record<string, unknown>
      const updated: Record<string, unknown> = { ...currentData }
      const collection = currentData[collectionName]
      
      if (Array.isArray(collection)) {
        const itemData = item as Record<string, unknown>
        updated[collectionName] = collection.map((existing: unknown) => {
          const record = existing as Record<string, unknown>
          return record.id === id ? { ...record, ...itemData } : record
        })
      } else if (collection && typeof collection === 'object') {
        const map = { ...(collection as Record<string, unknown>) }
        const key = String(id)
        const existing = (map[key] as Record<string, unknown>) || {}
        map[key] = { ...existing, ...(item as Record<string, unknown>) }
        updated[collectionName] = map
      }
      
      await saveData(updated as T)
    },
    [data, saveData]
  )

  // حذف البيانات
  const clearData = useCallback(() => {
    setData(null)
    localStorage.removeItem(`db_${options.filename}`)
  }, [options.filename])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    error,
    saveData,
    updateData,
    addItem,
    removeItem,
    updateItem,
    clearData,
    reload: loadData
  }
}
