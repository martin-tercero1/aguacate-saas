import { createClient } from './server'
import { PostgrestError } from '@supabase/supabase-js'

export class SupabaseService {
  private supabase: any

  constructor() {
    this.supabase = null
  }

  private async getClient() {
    if (!this.supabase) {
      this.supabase = await createClient()
    }
    return this.supabase
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
}
