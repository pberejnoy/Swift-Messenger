import { supabase } from "./client"

/**
 * Gets table columns using RPC
 * @param tableName - The name of the table
 * @returns Promise with array of column information or null
 */
export async function getTableColumns(tableName: string): Promise<any[] | null> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    try {
      const { data, error } = await supabase.rpc("get_table_columns", { table_name: tableName })

      if (error) {
        console.warn(`Error getting columns for ${tableName}:`, error)
        return null
      }

      if (!Array.isArray(data)) {
        console.warn(`Unexpected response format when getting columns for ${tableName}`)
        return null
      }

      return data
    } catch (error) {
      console.warn(`Error in RPC call when getting columns for ${tableName}:`, error)
      return null
    }
  } catch (error) {
    console.error(`Error getting columns for ${tableName}:`, error)
    return null
  }
}

/**
 * Checks if a column exists in a table
 * @param tableName - The name of the table
 * @param columnName - The name of the column
 * @returns Promise<boolean> - Whether the column exists
 */
export async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  try {
    const columns = await getTableColumns(tableName)

    if (!columns) {
      return false
    }

    return columns.some((col: any) => col.column_name === columnName)
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists in ${tableName}:`, error)
    return false
  }
}
