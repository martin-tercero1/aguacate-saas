'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  DollarSign,
  Leaf,
  ClipboardList,
  LayoutDashboard,
  Menu,
  LogOut,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  {
    title: 'Panel Principal',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Finanzas',
    href: '/dashboard/finanzas',
    icon: DollarSign,
  },
  {
    title: 'Cosechas',
    href: '/dashboard/cosechas',
    icon: Leaf,
  },
  {
    title: 'Actividades',
    href: '/dashboard/actividades',
    icon: ClipboardList,
  },
  {
    title: 'Perfil',
    href: '/dashboard/perfil',
    icon: User,
  },
]

function NavLink({
  item,
  isCollapsed,
  onClick,
}: {
  item: (typeof navItems)[0]
  isCollapsed?: boolean
  onClick?: () => void
}) {
  const pathname = usePathname()
  const isActive = pathname === item.href

  const linkContent = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground',
        isCollapsed && 'justify-center px-2'
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span>{item.title}</span>}
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          {item.title}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}

function SidebarContent({
  isCollapsed,
  onNavigate,
}: {
  isCollapsed?: boolean
  onNavigate?: () => void
}) {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/signin')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-sidebar-border px-4',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
          onClick={onNavigate}
        >
          <span className="text-2xl">🥑</span>
          {!isCollapsed && (
            <span className="text-lg text-sidebar-foreground">
              Aguacate SaaS
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isCollapsed={isCollapsed}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        {!isCollapsed && (
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 truncate">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user?.user_metadata?.name || 'Usuario'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        )}

        <div
          className={cn(
            'flex items-center gap-2',
            isCollapsed ? 'flex-col' : 'justify-between'
          )}
        >
          <ThemeToggle />
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Cerrar sesion</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side={isCollapsed ? 'right' : 'top'}>
              Cerrar sesion
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <TooltipProvider>
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        <SidebarContent />
      </aside>
    </TooltipProvider>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu de navegacion</SheetTitle>
        </SheetHeader>
        <TooltipProvider>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </TooltipProvider>
      </SheetContent>
    </Sheet>
  )
}
