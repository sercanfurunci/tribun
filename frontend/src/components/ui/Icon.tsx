import type { SVGProps } from 'react';

export type IconName =
  | 'zap'
  | 'ball'
  | 'trophy'
  | 'medal'
  | 'target'
  | 'award'
  | 'check'
  | 'pin'
  | 'refresh'
  | 'video'
  | 'card-yellow'
  | 'card-red'
  | 'log-out'
  | 'arrow-right'
  | 'x'
  | 'copy';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number | string;
}

const PATHS: Record<IconName, JSX.Element> = {
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  ball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3 9 8l3 4 3-4-3-5z M3.5 10.5 8 12l1 5-4.5 1.5z M20.5 10.5 16 12l-1 5 4.5 1.5z" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 21h8M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
      <path d="M7 6H4a2 2 0 0 0-2 2v1a3 3 0 0 0 3 3h2M17 6h3a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3h-2" />
    </>
  ),
  medal: (
    <>
      <path d="M7.5 3 9 8M16.5 3 15 8M5 3h14" />
      <circle cx="12" cy="15" r="6" />
      <path d="M12 12v6M10 14l2 1 2-1" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 14 7 21l5-3 5 3-1.5-7" />
    </>
  ),
  check: <path d="M5 12l5 5L20 7" />,
  pin: (
    <>
      <path d="M12 21s-7-7.5-7-13a7 7 0 1 1 14 0c0 5.5-7 13-7 13z" />
      <circle cx="12" cy="8" r="2.5" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </>
  ),
  video: (
    <>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="m22 8-6 4 6 4V8z" />
    </>
  ),
  'card-yellow': <rect x="6" y="3" width="12" height="18" rx="1.5" fill="#fbbf24" stroke="none" />,
  'card-red': <rect x="6" y="3" width="12" height="18" rx="1.5" fill="#ef4444" stroke="none" />,
  'log-out': (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  'arrow-right': <path d="M5 12h14M13 5l7 7-7 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </>
  ),
};

export function Icon({ name, size = 18, className, ...rest }: IconProps) {
  const isFilledOnly = name === 'card-yellow' || name === 'card-red';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilledOnly ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
