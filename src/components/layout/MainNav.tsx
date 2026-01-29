import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useScrollHide } from '@/hooks/useScrollHide'
import { NAV_ITEMS, NavItem } from '@/lib/constants'
import { uiStore, toggleMenu, closeMenu } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import { useEffect, useCallback } from 'react'

function NavItemComponent({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)

  // If it's a folder with children
  if (item.children) {
    return (
      <div className="nav-folder">
        <button
          className={cn('nav-item nav-folder-toggle', isExpanded && 'expanded')}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {item.label}
          <span className="folder-arrow">{isExpanded ? '▼' : '▶'}</span>
        </button>
        {isExpanded && (
          <div className="nav-folder-content">
            {item.children.map((child) => (
              <Link
                key={child.href}
                to={child.href!}
                className={cn(
                  'nav-item nav-child-item',
                  location.pathname === child.href && 'active'
                )}
                onClick={onNavigate}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Regular nav item
  return (
    <Link
      to={item.href!}
      className={cn(
        'nav-item',
        location.pathname === item.href && 'active'
      )}
      onClick={onNavigate}
    >
      {item.label}
    </Link>
  )
}

export function MainNav() {
  const location = useLocation()
  const isHidden = useScrollHide()
  const menuOpen = useStore(uiStore, (state) => state.menuOpen)

  // Close menu when clicking outside
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const navMenu = document.getElementById('nav-menu')
      const menuToggle = document.getElementById('menu-toggle')

      if (
        menuOpen &&
        navMenu &&
        menuToggle &&
        !navMenu.contains(target) &&
        !menuToggle.contains(target)
      ) {
        closeMenu()
      }
    },
    [menuOpen]
  )

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [handleClickOutside])

  // Close menu on navigation
  useEffect(() => {
    closeMenu()
  }, [location.pathname])

  return (
    <nav className={cn('main-nav', isHidden && 'nav-hide')}>
      <div className="nav-container">
        <button
          id="menu-toggle"
          className={cn('menu-toggle', menuOpen && 'hamburger-active')}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <div
          id="nav-menu"
          className={cn('nav-menu', menuOpen && 'active')}
        >
          {NAV_ITEMS.map((item, index) => (
            <NavItemComponent
              key={item.href || `folder-${index}`}
              item={item}
              onNavigate={closeMenu}
            />
          ))}
        </div>
      </div>
    </nav>
  )
}
