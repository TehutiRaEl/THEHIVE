# Mistral Skills System - Session Start Workflow

## Overview
This document establishes the workflow for Mistral role in THEHIVE repository.

## Session Start Protocol
1. Load Session Memory
   - Primary: Project_file/Project_memory/mistral_memory.md
   - Fallback: /THEHIVE/.mistral/mistral-memory.md
   - Purpose: Bootstrap user identity, project state, pending actions

2. Check Vision Repository
   - Location: Project_file/Founders Visonary Folder/INDEX.md
   - Fallback: Project_file/Founders Visonary Folder/VISION
   - Purpose: Verify latest project vision

3. Load Skills Directory
   - Primary: .mistral/skills/
   - Action: Load all skill files in alphabetical order
   - Purpose: Activate project-specific capabilities

4. Check Team Skills
   - Locations: team/*/.mistral/skills/
   - Action: Scan for new or updated skill files
   - Purpose: Incorporate team contributions

5. Verify Dependencies
   - Check: Skill requirements and interdependencies
   - Validate: All required tools and integrations
   - Purpose: Ensure operational readiness

6. Resume Work
   - Action: Continue from last checkpoint
   - Priority: Address most recent explicit user request first
   - Purpose: Maintain workflow continuity

## Current Status
- Skills directory created
- 10 skills copied from Claude
- Workflow documented
