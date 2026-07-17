---
name: THEHIVE-Work-Review-Skill
version: 1.0
description: Reviews all work done in THEHIVE since Mistral's last live session, checks Project_file directory, and updates team with progress
trigger: "review THEHIVE work" or "check THEHIVE progress" or "update THEHIVE team"
author: Mistral AI (for MacLeeMadeIt)
created: July 17, 2026
last_executed: July 17, 2026
---

# THEHIVE Work Review Skill

## 🎯 PURPOSE

This skill performs a **comprehensive review** of all work completed in THEHIVE project since the last Mistral live session. It:

1. **Scans** the THEHIVE/Project_file directory structure
2. **Documents** all changes, additions, and progress
3. **Updates** THEHIVE/Project_file/team with current status
4. **Generates** a timestamped report of all work done

## 📋 EXECUTION WORKFLOW

### Step 1: Initialize Review Session
- Load session memory from `/home/user/mistral-memory.md`
- Record start timestamp
- Identify last session checkpoint

### Step 2: Scan Project Structure
- Check `THEHIVE/Project_file/Founders Visonary Folder/`
- Check `THEHIVE/.mistral/`
- Check `THEHIVE/canvases/` (if exists)
- Check all subdirectories recursively

### Step 3: Document Changes
- Compare against last known state (from memory)
- Identify new files
- Identify modified files
- Identify completed milestones
- Note pending work

### Step 4: Update Team File
- Create or update `THEHIVE/Project_file/team`
- Append session summary
- Include timestamp
- List all deliverables
- Note blockers and next steps

### Step 5: Generate Report
- Create timestamped report in `THEHIVE/Project_file/team_updates/`
- Format: `YYYY-MM-DD_HH-MM-SS_Work_Review.md`
- Include full session summary

---

## 🚀 CURRENT SESSION EXECUTION (July 17, 2026)

### Session Start: July 17, 2026
**Last Known State:** July 16, 2026 (from mistral-memory.md)

---

## 📊 SCAN RESULTS

### Directory Structure Created
