#!/bin/bash

# Get first mentorado ID from Supabase
MENTORADO_ID=$(curl -s "http://localhost:3002/api/init-db" -X POST -H "Content-Type: application/json" -d '{}' 2>/dev/null)

# For testing, we'll use a hardcoded approach: fetch data via the page
# The dashboard page will show us if mentorados were created

echo "Testing mentorado form and analysis pipeline..."
echo "Dev server should be running on http://localhost:3002"
echo ""
echo "Dashboard: http://localhost:3002/dashboard"
echo "Expected: Shows list of 3 mentorados (João Silva, Maria Oliveira, Carlos Santos)"
echo ""
echo "To test form submission, navigate to:"
echo "/form/[mentorado-id] with sample data"
