import { IconPrinter } from './icons'

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="press no-print inline-flex cursor-pointer items-center gap-2 rounded bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-foreground/85"
    >
      <IconPrinter className="h-4 w-4" />
      چاپ / خروجی PDF
    </button>
  )
}
