import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

export function RouterErrorBoundary() {
  const error = useRouteError()

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong'
  const description = isRouteErrorResponse(error)
    ? error.data?.message ?? 'The requested page could not be loaded.'
    : error instanceof Error
      ? error.message
      : 'An unexpected routing error occurred.'

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="max-w-lg rounded-2xl border bg-white px-8 py-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
    </div>
  )
}
