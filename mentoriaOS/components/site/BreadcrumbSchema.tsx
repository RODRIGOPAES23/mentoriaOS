"use client"

import { usePathname } from "next/navigation"
import { generateBreadcrumbSchema } from "@/lib/breadcrumb-schema"

export function BreadcrumbSchema() {
  const pathname = usePathname()
  const schema = generateBreadcrumbSchema(pathname)

  if (!schema) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
