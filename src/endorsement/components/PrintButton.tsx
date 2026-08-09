import { IconPrinter } from './icons'

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="press no-print inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-l from-primary to-primary-light px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
    >
      <IconPrinter className="h-4 w-4" />
      چاپ / خروجی PDF
    </button>
  )
}
