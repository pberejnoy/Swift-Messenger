import { supabase } from "@/src/services/supabase/client"

export async function fetchData<T>(table: string, query: any = {}): Promise<T[]> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data as T[]
  } catch (error) {
    console.error(`Error fetching data from ${table}:`, error)
    throw error
  }
}

export async function fetchById<T>(table: string, id: string): Promise<T | null> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase.from(table).select("*").eq("id", id).single()

    if (error) {
      throw error
    }

    return data as T
  } catch (error) {
    console.error(`Error fetching ${table} by ID:`, error)
    return null
  }
}

export async function insertData<T>(table: string, data: any): Promise<T> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data: insertedData, error } = await supabase.from(table).insert(data).select().single()

    if (error) {
      throw error
    }

    return insertedData as T
  } catch (error) {
    console.error(`Error inserting data into ${table}:`, error)
    throw error
  }
}

export async function updateData<T>(table: string, id: string, data: any): Promise<T> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data: updatedData, error } = await supabase.from(table).update(data).eq("id", id).select().single()

    if (error) {
      throw error
    }

    return updatedData as T
  } catch (error) {
    console.error(`Error updating data in ${table}:`, error)
    throw error
  }
}

export async function deleteData(table: string, id: string): Promise<void> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { error } = await supabase.from(table).delete().eq("id", id)

    if (error) {
      throw error
    }
  } catch (error) {
    console.error(`Error deleting data from ${table}:`, error)
    throw error
  }
}
