import { createClient } from './server'
import { PostgrestError } from '@supabase/supabase-js'

export class SupabaseService {
  // Always create fresh client to read cookies for auth context
  private async getClient() {
    return await createClient()
  }

  // Dashboard data aggregation
  async getDashboardData(userId: string) {
    try {
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)

      // Get total expenses
      const supabase = await this.getClient()
      const { data: totalExpenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('userId', userId)

      // Get total incomes
      const supabase2 = await this.getClient()
      const { data: totalIncomes } = await supabase2
        .from('incomes')
        .select('amount')
        .eq('userId', userId)

      // Get current month expenses
      const supabase3 = await this.getClient()
      const { data: currentMonthExpenses } = await supabase3
        .from('expenses')
        .select('amount')
        .eq('userId', userId)
        .gte('date', currentMonth.toISOString())

      // Get current month incomes
      const supabase4 = await this.getClient()
      const { data: currentMonthIncomes } = await supabase4
        .from('incomes')
        .select('amount')
        .eq('userId', userId)
        .gte('date', currentMonth.toISOString())

      // Calculate totals
      const totalExpensesAmount = totalExpenses?.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0) || 0
      const totalIncomesAmount = totalIncomes?.reduce((sum: number, inc: any) => sum + parseFloat(inc.amount), 0) || 0
      const currentMonthExpensesAmount = currentMonthExpenses?.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0) || 0
      const currentMonthIncomesAmount = currentMonthIncomes?.reduce((sum: number, inc: any) => sum + parseFloat(inc.amount), 0) || 0

      return {
        totalExpenses: totalExpensesAmount,
        totalIncomes: totalIncomesAmount,
        totalProfit: totalIncomesAmount - totalExpensesAmount,
        currentMonthExpenses: currentMonthExpensesAmount,
        currentMonthIncomes: currentMonthIncomesAmount,
        currentMonthProfit: currentMonthIncomesAmount - currentMonthExpensesAmount
      }
    } catch (error) {
      console.error('Error getting dashboard data:', error)
      throw error
    }
  }

  // Expenses CRUD
  async getExpenses(userId: string) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('userId', userId)
        .order('date', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting expenses:', error)
      throw error
    }
  }

  async createExpense(userId: string, expense: {
    category: string
    description?: string
    amount: number
    date: string
  }) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          userId: userId,
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          date: expense.date
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating expense:', error)
      throw error
    }
  }

  async updateExpense(userId: string, expenseId: string, expense: {
    category?: string
    description?: string
    amount?: number
    date?: string
  }) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('expenses')
        .update({ ...expense, updatedAt: new Date().toISOString() })
        .eq('id', expenseId)
        .eq('userId', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating expense:', error)
      throw error
    }
  }

  async deleteExpense(userId: string, expenseId: string) {
    try {
      const supabase = await this.getClient()
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .eq('userId', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting expense:', error)
      throw error
    }
  }

  // Incomes CRUD
  async getIncomes(userId: string) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .eq('userId', userId)
        .order('date', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting incomes:', error)
      throw error
    }
  }

  async createIncome(userId: string, income: {
    source: string
    description?: string
    amount: number
    date: string
  }) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('incomes')
        .insert({
          userId: userId,
          source: income.source,
          description: income.description,
          amount: income.amount,
          date: income.date
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating income:', error)
      throw error
    }
  }

  async updateIncome(userId: string, incomeId: string, income: {
    source?: string
    description?: string
    amount?: number
    date?: string
  }) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('incomes')
        .update({ ...income, updatedAt: new Date().toISOString() })
        .eq('id', incomeId)
        .eq('userId', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating income:', error)
      throw error
    }
  }

  async deleteIncome(userId: string, incomeId: string) {
    try {
      const supabase = await this.getClient()
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', incomeId)
        .eq('userId', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting income:', error)
      throw error
    }
  }

  // User operations
  async getUserByEmail(email: string) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
      return data
    } catch (error) {
      console.error('Error getting user by email:', error)
      throw error
    }
  }

  async createUser(userData: {
    email: string
    password: string
    name?: string
  }) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, email, name')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  async getCurrentAuthUser() {
    try {
      const supabase = await this.getClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) return null
      
      return user
    } catch (error) {
      console.error('Error getting current auth user:', error)
      throw error
    }
  }

  // Harvests CRUD
  async getHarvests(userId: string) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('harvests')
        .select('*')
        .eq('userId', userId)
        .order('fechaCosecha', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting harvests:', error)
      throw error
    }
  }

  async createHarvest(userId: string, harvest: {
    parcela: string
    cantidad: number
    calidad?: string
    variedad?: string
    fechaCosecha: string
    precioUnitario: number
  }) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('harvests')
        .insert([{
          userId: userId,
          parcela: harvest.parcela,
          cantidad: harvest.cantidad,
          calidad: harvest.calidad,
          variedad: harvest.variedad,
          fechaCosecha: harvest.fechaCosecha,
          precioUnitario: harvest.precioUnitario
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating harvest:', error)
      throw error
    }
  }

  async updateHarvest(userId: string, harvestId: string, harvest: {
    parcela?: string
    cantidad?: number
    calidad?: string
    variedad?: string
    fechaCosecha?: string
    precioUnitario?: number
  }) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('harvests')
        .update({ ...harvest, updatedAt: new Date().toISOString() })
        .eq('id', harvestId)
        .eq('userId', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating harvest:', error)
      throw error
    }
  }

  async deleteHarvest(userId: string, harvestId: string) {
    try {
      const supabase = await this.getClient()
      const { error } = await supabase
        .from('harvests')
        .delete()
        .eq('id', harvestId)
        .eq('userId', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting harvest:', error)
      throw error
    }
  }

  // Activities CRUD
  async getActivities(userId: string) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('userId', userId)
        .order('fecha', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting activities:', error)
      throw error
    }
  }

  async createActivity(userId: string, activity: {
    tipo: string
    parcela: string
    descripcion?: string
    fecha: string
    estado?: string
  }) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('activities')
        .insert([{
          userId: userId,
          tipo: activity.tipo,
          parcela: activity.parcela,
          descripcion: activity.descripcion,
          fecha: activity.fecha,
          estado: activity.estado || 'pendiente'
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating activity:', error)
      throw error
    }
  }

  async updateActivityStatus(userId: string, activityId: string, estado: string) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('activities')
        .update({ estado, updatedAt: new Date().toISOString() })
        .eq('id', activityId)
        .eq('userId', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating activity status:', error)
      throw error
    }
  }

  async updateActivity(userId: string, activityId: string, activity: {
    tipo?: string
    parcela?: string
    descripcion?: string
    fecha?: string
    estado?: string
  }) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('activities')
        .update({ ...activity, updatedAt: new Date().toISOString() })
        .eq('id', activityId)
        .eq('userId', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating activity:', error)
      throw error
    }
  }

  async deleteActivity(userId: string, activityId: string) {
    try {
      const supabase = await this.getClient()
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId)
        .eq('userId', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting activity:', error)
      throw error
    }
  }

  // Categories CRUD
  // Now uses shared categories (userId IS NULL) + user's custom categories
  async getCategories(userId: string, type?: string) {
    try {
      const supabase = await this.getClient()

      // Query both shared categories (userId IS NULL) and user's own custom categories
      let query = supabase
        .from('categories')
        .select('*')
        .or(`userId.is.null,userId.eq.${userId}`)

      if (type) {
        query = query.eq('type', type)
      }

      // Order by isDefault desc (shared first), then by name
      const { data, error } = await query.order('isDefault', { ascending: false }).order('name', { ascending: true })

      if (error) throw error
      return data ?? []
    } catch (error) {
      console.error('Error getting categories:', error)
      throw error
    }
  }

  async createCategory(userId: string, category: {
    name: string
    type: string
    color?: string
  }) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          userId: userId,
          name: category.name,
          type: category.type,
          color: category.color || '#3b82f6',
          isDefault: false
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  async updateCategory(userId: string, categoryId: string, category: {
    name?: string
    color?: string
  }) {
    try {
      const supabase = await this.getClient()
      
      // Only allow updating user's own custom categories (not shared defaults)
      // RLS enforces this, but explicit check for clarity
      const { data, error } = await supabase
        .from('categories')
        .update({ ...category, updatedAt: new Date().toISOString() })
        .eq('id', categoryId)
        .eq('userId', userId)  // Must be user's own category (not shared)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  async deleteCategory(userId: string, categoryId: string) {
    try {
      const supabase = await this.getClient()
      
      // Only allow deleting user's own custom categories (not shared defaults)
      // RLS will enforce this, but we add explicit checks for clarity
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('userId', userId)  // Must be user's own category
        .eq('isDefault', false) // Cannot delete defaults

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }

  // Profile CRUD — schema uses `id` = auth.users.id, columns: fullName, phone, farmName, location, hectares, avatarUrl
  async getProfile(userId: string) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error
      return data || null
    } catch (error) {
      console.error('Error getting profile:', error)
      throw error
    }
  }

  async createProfile(userId: string, profile: {
    fullName?: string
    phone?: string
    avatarUrl?: string
    farmName?: string
    location?: string
    hectares?: number
  }) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ id: userId, ...profile }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating profile:', error)
      throw error
    }
  }

  async updateProfile(userId: string, profile: {
    fullName?: string
    phone?: string
    avatarUrl?: string
    farmName?: string
    location?: string
    hectares?: number
  }) {
    try {
      const supabase = await this.getClient()
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profile
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }
}
