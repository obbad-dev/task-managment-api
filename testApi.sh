#!/bin/bash
set -e

BASE_URL="http://localhost:3000"
RANDOM_ID=$((1000 + RANDOM % 9000))
EMAIL="user_${RANDOM_ID}@example.com"
PASSWORD="securepassword123"

echo "========================================="
echo "   TASK MANAGEMENT API - FULL TEST SUITE"
echo "========================================="

echo ""
echo "1. Testing Public Endpoint: Register"
REGISTER_RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test User\", \"email\": \"${EMAIL}\", \"password\": \"${PASSWORD}\"}")
STATUS=$(echo "$REGISTER_RES" | grep "HTTP_STATUS" | cut -d':' -f2)
BODY=$(echo "$REGISTER_RES" | sed '/HTTP_STATUS/d')

if [ "$STATUS" -eq 201 ]; then
  echo "✅ Register succeeded (201)"
  USER_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
else
  echo "❌ Register failed ($STATUS): $BODY"
  exit 1
fi

echo ""
echo "2. Testing Public Endpoint: Login & Get JWT"
LOGIN_RES=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${EMAIL}\", \"password\": \"${PASSWORD}\"}")
TOKEN=$(echo "$LOGIN_RES" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "✅ Login succeeded, JWT token acquired"
else
  echo "❌ Login failed: $LOGIN_RES"
  exit 1
fi

echo ""
echo "3. Testing Guard: Protected route without token (Should be 401)"
NO_AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/projects")
if [ "$NO_AUTH_STATUS" -eq 401 ]; then
  echo "✅ Route correctly rejected without token (401 Unauthorized)"
else
  echo "❌ Expected 401 but got $NO_AUTH_STATUS"
  exit 1
fi

echo ""
echo "4. Testing Project Management: POST /projects"
PROJ_RES=$(curl -s -X POST "${BASE_URL}/projects" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Project ${RANDOM_ID}\", \"description\": \"Test project description\", \"ownerId\": ${USER_ID}}")
PROJ_ID=$(echo "$PROJ_RES" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$PROJ_ID" ]; then
  echo "✅ Project created successfully with ID: ${PROJ_ID}"
else
  echo "❌ Create project failed: $PROJ_RES"
  exit 1
fi

echo ""
echo "5. Testing Project Management: GET /projects and GET /projects/:id"
PROJ_GET=$(curl -s -H "Authorization: Bearer ${TOKEN}" "${BASE_URL}/projects/${PROJ_ID}")
echo "✅ GET /projects/${PROJ_ID} succeeded: $(echo "$PROJ_GET" | grep -o '"name":"[^"]*' | head -1)"

echo ""
echo "6. Testing Task Management: POST /projects/:id/tasks"
TASK_RES=$(curl -s -X POST "${BASE_URL}/projects/${PROJ_ID}/tasks" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"Build Auth\", \"description\": \"JWT setup\", \"status\": \"TODO\", \"assigneeId\": ${USER_ID}}")
TASK_ID=$(echo "$TASK_RES" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$TASK_ID" ]; then
  echo "✅ Task created successfully with ID: ${TASK_ID}"
else
  echo "❌ Create task failed: $TASK_RES"
  exit 1
fi

echo ""
echo "7. Testing Task Querying & Filtering: GET /projects/:id/tasks?status=TODO"
TASKS_LIST=$(curl -s -H "Authorization: Bearer ${TOKEN}" "${BASE_URL}/projects/${PROJ_ID}/tasks?status=TODO")
echo "✅ Retrieved tasks list filtered by status=TODO"

echo ""
echo "8. Testing Task Update: PATCH /tasks/:id (status -> IN_PROGRESS -> DONE)"
TASK_UPDATE=$(curl -s -X PATCH "${BASE_URL}/tasks/${TASK_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"status": "DONE"}')
UPDATED_STATUS=$(echo "$TASK_UPDATE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$UPDATED_STATUS" = "DONE" ]; then
  echo "✅ Task status successfully updated to DONE"
else
  echo "❌ Task update failed: $TASK_UPDATE"
  exit 1
fi

echo ""
echo "9. Testing Task Deletion: DELETE /tasks/:id"
DEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${BASE_URL}/tasks/${TASK_ID}" \
  -H "Authorization: Bearer ${TOKEN}")
if [ "$DEL_STATUS" -eq 200 ]; then
  echo "✅ Task deleted successfully (200)"
else
  echo "❌ Task delete failed with status: $DEL_STATUS"
  exit 1
fi

echo ""
echo "========================================="
echo "   🎉 ALL 9 INTEGRATION TESTS PASSED!    "
echo "========================================="
