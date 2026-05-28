export async function POST(request: Request) {
  try {
    const { sql } = await request.json()

    if (!sql || typeof sql !== "string") {
      return Response.json({ error: "SQL parameter required" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRole) {
      return Response.json(
        { error: "Missing Supabase credentials" },
        { status: 500 }
      )
    }

    // Try to execute via direct database connection using the sql.cron extension
    // or via a stored procedure (if it exists)
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRole}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql }),
    })

    const result = await response.json()

    if (!response.ok) {
      // Try alternative endpoint
      const altResponse = await fetch(
        `${supabaseUrl}/rest/v1/rpc/execute_sql`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceRole}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ statement: sql }),
        }
      )

      const altResult = await altResponse.json()
      return Response.json(altResult, { status: altResponse.status })
    }

    return Response.json(result)
  } catch (error) {
    return Response.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
