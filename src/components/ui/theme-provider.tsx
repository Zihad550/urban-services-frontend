import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
    resolvedTheme: "dark" | "light"
}

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
    resolvedTheme: "light"
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "urban-services-ui-theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    )
    const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light")

    // Handle system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

        const handleChange = () => {
            if (theme === "system") {
                const newResolvedTheme = mediaQuery.matches ? "dark" : "light"
                setResolvedTheme(newResolvedTheme)
                updateTheme(newResolvedTheme)
            }
        }

        // Initial setup
        handleChange()

        // Listen for changes
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handleChange)
            return () => mediaQuery.removeEventListener("change", handleChange)
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleChange)
            return () => mediaQuery.removeListener(handleChange)
        }
    }, [theme])

    // Update the DOM when theme changes
    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light"

            root.classList.add(systemTheme)
            setResolvedTheme(systemTheme)

            // Set color-scheme for browser UI elements
            root.style.colorScheme = systemTheme

            // Announce theme change to screen readers
            announceThemeChange(systemTheme)
            return
        }

        root.classList.add(theme)
        setResolvedTheme(theme)

        // Set color-scheme for browser UI elements
        root.style.colorScheme = theme

        // Announce theme change to screen readers
        announceThemeChange(theme)
    }, [theme])

    // Helper function to update theme-related meta tags
    const updateTheme = (newTheme: "dark" | "light") => {
        const root = window.document.documentElement
        root.classList.remove("light", "dark")
        root.classList.add(newTheme)
        root.style.colorScheme = newTheme

        // Update theme color meta tag for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
            metaThemeColor.setAttribute(
                'content',
                newTheme === 'dark' ? '#1e1e1e' : '#ffffff'
            )
        }
    }

    // Announce theme changes to screen readers
    const announceThemeChange = (newTheme: string) => {
        const announcer = document.getElementById('announcer')
        if (announcer) {
            announcer.textContent = `Theme changed to ${newTheme} mode`
        }
    }

    const value = {
        theme,
        resolvedTheme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}