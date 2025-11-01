// Utilitário para classes de tema escuro consistentes

export const themeClasses = {
  // Backgrounds
  bg: {
    page: 'bg-neutral-50 dark:bg-neutral-900',
    card: 'bg-white dark:bg-neutral-800',
    cardHover: 'bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750',
    input: 'bg-white dark:bg-neutral-700',
    modal: 'bg-white dark:bg-neutral-800',
    sidebar: 'bg-white dark:bg-neutral-800',
    header: 'bg-white dark:bg-neutral-800',
    footer: 'bg-neutral-900 dark:bg-neutral-950',
  },
  
  // Text colors
  text: {
    primary: 'text-neutral-900 dark:text-neutral-100',
    secondary: 'text-neutral-600 dark:text-neutral-400',
    muted: 'text-neutral-500 dark:text-neutral-500',
    inverse: 'text-white dark:text-neutral-900',
    link: 'text-primary-700 dark:text-primary-400',
    linkHover: 'hover:text-primary-800 dark:hover:text-primary-300',
  },
  
  // Borders
  border: {
    default: 'border-neutral-200 dark:border-neutral-700',
    light: 'border-neutral-100 dark:border-neutral-800',
    strong: 'border-neutral-300 dark:border-neutral-600',
  },
  
  // Buttons
  button: {
    primary: 'bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white',
    secondary: 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100',
    ghost: 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
  },
  
  // Form elements
  form: {
    input: 'bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
    inputFocus: 'focus:border-primary-600 dark:focus:border-primary-400 focus:ring-primary-600 dark:focus:ring-primary-400',
    label: 'text-neutral-700 dark:text-neutral-300',
  },
  
  // Hover states
  hover: {
    card: 'hover:bg-neutral-50 dark:hover:bg-neutral-750',
    button: 'hover:bg-neutral-100 dark:hover:bg-neutral-700',
  },
  
  // Shadows
  shadow: {
    sm: 'shadow-sm dark:shadow-neutral-900/50',
    md: 'shadow-md dark:shadow-neutral-900/50',
    lg: 'shadow-lg dark:shadow-neutral-900/50',
    xl: 'shadow-xl dark:shadow-neutral-900/50',
  },
  
  // Dividers
  divider: 'border-neutral-200 dark:border-neutral-700',
  
  // Transitions
  transition: 'transition-colors duration-300',
}

// Helper function to combine theme classes
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

// Preset combinations
export const presets = {
  page: cn(themeClasses.bg.page, themeClasses.text.primary, themeClasses.transition),
  card: cn(themeClasses.bg.card, themeClasses.border.default, themeClasses.shadow.md, themeClasses.transition),
  modal: cn(themeClasses.bg.modal, themeClasses.text.primary, themeClasses.shadow.xl, themeClasses.transition),
  input: cn(themeClasses.form.input, themeClasses.form.inputFocus, themeClasses.transition),
}
