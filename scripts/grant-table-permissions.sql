-- Grant table-level permissions to authenticated and anon roles
-- RLS policies only work AFTER these base permissions are granted

-- Profiles table
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Categories table  
GRANT ALL ON public.categories TO authenticated;
GRANT SELECT ON public.categories TO anon;

-- Expenses table
GRANT ALL ON public.expenses TO authenticated;
GRANT SELECT ON public.expenses TO anon;

-- Incomes table
GRANT ALL ON public.incomes TO authenticated;
GRANT SELECT ON public.incomes TO anon;

-- Harvests table
GRANT ALL ON public.harvests TO authenticated;
GRANT SELECT ON public.harvests TO anon;

-- Activities table
GRANT ALL ON public.activities TO authenticated;
GRANT SELECT ON public.activities TO anon;

-- Grant usage on sequences (for auto-increment IDs if any)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.seed_default_categories(UUID) TO authenticated;
