// Line icons. They take a `size` and use the current text color.
const base = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
})

export const TeamIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3 19c.6-3.3 3-5 6-5s5.4 1.7 6 5" />
    <circle cx="16.5" cy="9.5" r="2.6" />
    <path d="M16.5 14c2.4 0 4 1.4 4.5 4" />
  </svg>
)
export const ClockIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)
export const CheckIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="M8 12.5l2.6 2.5L16 9.5" />
  </svg>
)
export const WalletIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <rect x="3" y="6" width="18" height="13" rx="2.5" />
    <path d="M3 10h18" />
    <circle cx="16.5" cy="14.5" r="0.6" fill="currentColor" />
  </svg>
)
export const BoxIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <path d="M4 8l8-4 8 4v8l-8 4-8-4z" />
    <path d="M4 8l8 4 8-4M12 12v8" />
  </svg>
)
export const MailIcon = ({ size = 22 }) => (
  <svg {...base(size)}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="M3.5 7l8.5 6 8.5-6" />
  </svg>
)
export const PlusIcon = ({ size = 16 }) => (
  <svg {...base(size)} strokeWidth={2.2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
export const BackIcon = ({ size = 16 }) => (
  <svg {...base(size)} strokeWidth={2.2}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
)

// App logo: a ticket with a gold stub
export const Logo = () => (
  <svg width="34" height="22" viewBox="0 0 34 22" aria-hidden="true">
    <path d="M3 1h20v6a4 4 0 0 0 0 8v6H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z" fill="var(--ink)" />
    <path d="M25 1h6a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-6v-6a4 4 0 0 0 0-8z" fill="var(--gold)" />
  </svg>
)
