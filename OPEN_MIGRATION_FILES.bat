@echo off
echo Opening TrashFire Migration Files...
echo.

start "" "supabase\schema.sql"
timeout /t 1 /nobreak >nul

start "" "supabase\migrations\2025_12_15_refined_phase2.sql"
timeout /t 1 /nobreak >nul

start "" "supabase\migrations\2025_12_15_phase2_5_guardrails.sql"
timeout /t 1 /nobreak >nul

start "" "supabase\migrations\2025_12_17_phase3_animatic.sql"
timeout /t 1 /nobreak >nul

start "" "supabase\migrations\add_episode_passes.sql"

echo.
echo All files opened! Copy each file's contents and paste into Supabase SQL Editor.
echo.
pause

