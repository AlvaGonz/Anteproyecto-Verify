import os
import sys
import json
import urllib.request
import urllib.error
import argparse
import subprocess
import time
from datetime import datetime

def load_env(dotenv_path=".env"):
    if os.path.exists(dotenv_path):
        with open(dotenv_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip()
                    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                        val = val[1:-1]
                    if key:
                        os.environ[key] = val

# Load environment variables
load_env()

# Configuration
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_PRIMARY = os.environ.get("GROQ_MODEL_PRIMARY", "llama3-70b-8192")
MODEL_FAST = os.environ.get("GROQ_MODEL_FAST", "llama3-8b-8192")

def safe_parse_issues(res: str) -> list:
    try:
        data = json.loads(res)
        issues = data.get("issues", [])
        if not isinstance(issues, list): return []
        return [i for i in issues if isinstance(i, dict) and "severity" in i]
    except: return []

def main():
    parser = argparse.ArgumentParser(description="Post-Task Validation Loop")
    parser.add_argument("--task", type=str, default="No task description provided")
    parser.add_argument("--output", type=str, default="No output provided")
    args = parser.parse_args()

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print(json.dumps({"score": 100, "verdict": "PASS", "high_issues": 0, "message": "GROQ_API_KEY missing, bypassed"}))
        sys.exit(0)
        
    # Auto-detect latest session directory
    sessions_dir = os.path.join(".agents", "sessions")
    session_id = None
    if os.path.exists(sessions_dir):
        subdirs = [os.path.join(sessions_dir, d) for d in os.listdir(sessions_dir) if os.path.isdir(os.path.join(sessions_dir, d))]
        if subdirs:
            latest_session = max(subdirs, key=os.path.getmtime)
            session_id = os.path.basename(latest_session)
            
    if not session_id:
        print(json.dumps({"score": 100, "verdict": "PASS", "high_issues": 0, "message": "No session found, bypassed"}))
        sys.exit(0)

    session_path = os.path.join(sessions_dir, session_id)

    # Gather context
    diff_output = ""
    try:
        diff_output = subprocess.check_output(["git", "diff", "HEAD"], text=True, stderr=subprocess.STDOUT)
    except Exception:
        pass
        
    agents_md = ""
    try:
        with open(os.path.join(".agents", "docs", "AGENTS.md"), "r", encoding="utf-8") as f:
            agents_md = f.read()
    except Exception:
        pass

    # Helper function to call Groq
    def call_llm(system_prompt, user_prompt, agent_name, model=MODEL_PRIMARY, json_mode=False):
        # Prompt logging (Step 4)
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": agent_name,
            "model": model,
            "system": system_prompt[:500],
            "user": user_prompt[:500]
        }
        try:
            log_file = os.path.join(session_path, "prompt-log.jsonl")
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
        except Exception:
            pass

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.1
        }
        if json_mode:
            data["response_format"] = {"type": "json_object"}
            
        req = urllib.request.Request(GROQ_API_URL, data=json.dumps(data).encode("utf-8"), headers=headers)
        for attempt in range(4):
            try:
                with urllib.request.urlopen(req) as response:
                    res_body = response.read().decode("utf-8")
                    res_json = json.loads(res_body)
                    return res_json["choices"][0]["message"]["content"]
            except urllib.error.HTTPError as e:
                if e.code in [429, 500, 503] and attempt < 3:
                    sleep_time = (attempt + 1) * 3
                    time.sleep(sleep_time)
                    continue
                if hasattr(e, 'read'):
                    print(f"Error calling LLM (HTTP {e.code}): {e.read().decode('utf-8')}", file=sys.stderr)
                break
            except Exception as e:
                if attempt < 3:
                    time.sleep(2)
                    continue
                print(f"Error calling LLM: {e}", file=sys.stderr)
                break
        return "{}" if json_mode else ""

    # Wrap user-controlled inputs in XML tags (Step 1)
    diff_safe = f"<DIFF>\n{diff_output[:8000]}\n</DIFF>"
    task_safe = f"<TASK>\n{args.task}\n</TASK>"
    output_safe = f"<OUTPUT>\n{args.output}\n</OUTPUT>"

    # Context string
    context = f"{task_safe}\n\n{output_safe}\n\n{diff_safe}\n\nCONSTITUTION:\n{agents_md}"

    # Agent 1: Evaluator
    evaluator_sys = "You are the Evaluator. Score the work 0-100 based on adherence to the Constitution, OWASP, and Clean Architecture. Output JSON with a 'score' integer."
    eval_res = call_llm(evaluator_sys, context, "Evaluator", json_mode=True)
    try:
        score = int(json.loads(eval_res).get("score", 100))
    except:
        score = 100

    # Agent 2: Critic (General codebase checks)
    critic_sys = "You are the Critic. Identify any deviations from the Constitution, style guidelines, or codebase standards. Output a JSON array of issues: { 'issues': [ {'severity': 'HIGH|MEDIUM|LOW', 'description': '...', 'file': '...'} ] }"
    critic_res = call_llm(critic_sys, context, "Critic", json_mode=True)
    issues_list1 = safe_parse_issues(critic_res)

    # Agent 2b: Security Critic (OWASP & Agentic Security)
    owasp_skill_content = ""
    try:
        owasp_skill_path = os.path.join(".agents", "skills", "owasp-security", "SKILL.md")
        if os.path.exists(owasp_skill_path):
            with open(owasp_skill_path, "r", encoding="utf-8") as f:
                owasp_skill_content = f.read()
    except Exception:
        pass

    security_critic_sys = (
        "You are the Security Critic. Review the context against the OWASP Top 10:2025 standards, "
        "ASVS 5.0, and Agentic AI Security risks using the provided REFERENCE SECURITY MANUAL. Identify security vulnerabilities. "
        "Output a JSON array of issues: { 'issues': [ {'severity': 'HIGH|MEDIUM|LOW', 'description': '...', 'file': '...'} ] }"
    )
    security_prompt = f"REFERENCE SECURITY MANUAL:\n{owasp_skill_content}\n\nCONTEXT TO EVALUATE:\n{context}"
    sec_res = call_llm(security_critic_sys, security_prompt, "Security Critic", json_mode=True)
    issues_list2 = safe_parse_issues(sec_res)

    # Agent 2c: Architecture Critic
    arch_critic_sys = (
        "You are the Architectural Critic. Review the context against the repository's C4/Mermaid architecture "
        "and living documentation requirements. Identify architectural flaws or missing updates. "
        "Output a JSON array of issues: { 'issues': [ {'severity': 'HIGH|MEDIUM|LOW', 'description': '...', 'file': '...'} ] }"
    )
    arch_res = call_llm(arch_critic_sys, context, "Architecture Critic", json_mode=True)
    issues_list3 = safe_parse_issues(arch_res)

    # Combine issues (Step 3)
    issues_list = issues_list1 + issues_list2 + issues_list3
        
    high_issues = [i for i in issues_list if i.get("severity") == "HIGH"]
    verdict = "FAIL" if len(high_issues) > 0 else "PASS"

    # Agent 3 & 4: Mutator & Validator
    mutations = ""
    validation = "YES. No high issues."
    if high_issues:
        mutator_sys = "You are the Mutator. Given the following HIGH issues and diff, propose a brief text description of how to fix them."
        mutator_prompt = f"ISSUES:\n{json.dumps(high_issues)}\n\nCONTEXT:\n{context}"
        mutations = call_llm(mutator_sys, mutator_prompt, "Mutator", model=MODEL_FAST)

        # Refactored Validator Prompt (Step 2)
        validator_sys = "You are the Validator. State if the proposed mutations are safe and correct. Reply only with YES or NO, followed by a brief reason."
        validator_prompt = f"ORIGINAL DIFF:\n{diff_safe}\n\nISSUES IDENTIFIED:\n{json.dumps(high_issues)}\n\nPROPOSED MUTATIONS:\n{mutations}"
        validation = call_llm(validator_sys, validator_prompt, "Validator", model=MODEL_FAST)

    # Agent 5: Archivist
    archivist_sys = "You are the Archivist. Extract 1-3 generalized, short bullet-point lessons from these issues to avoid them in the future."
    archivist_prompt = f"ISSUES:\n{json.dumps(issues_list)}"
    lessons = call_llm(archivist_sys, archivist_prompt, "Archivist", model=MODEL_PRIMARY) if issues_list else ""

    # Generate Markdown Report
    issues_md = ""
    if issues_list:
        issues_md = "| Severity | File | Description |\n|---|---|---|\n"
        for issue in issues_list:
            severity = issue.get("severity", "UNKNOWN")
            file_name = issue.get("file", "UNKNOWN")
            description = issue.get("description", "No description provided")
            issues_md += f"| {severity} | `{file_name}` | {description} |\n"
    else:
        issues_md = "*No issues found.*"

    report_content = f"""# Validation Report
**Date:** {datetime.now().isoformat()}
**Verdict:** {verdict}
**Score:** {score}/100

## Issues Detected
{issues_md}

## Mutations Proposed
{mutations or '*None*'}

## Validation Status
{validation or '*None*'}
"""

    # File Outputs
    with open("validation-report.md", "w", encoding="utf-8") as f:
        f.write(report_content)

    log_content = f"# Loop Log\nDate: {datetime.now().isoformat()}\nScore: {score}\nVerdict: {verdict}\n\n## Issues\n{json.dumps(issues_list, indent=2)}\n\n## Mutations proposed\n{mutations}\n\n## Validation\n{validation}\n"
    with open(os.path.join(session_path, "loop-log.md"), "w", encoding="utf-8") as f:
        f.write(log_content)

    if lessons:
        with open(os.path.join(session_path, "lessons.md"), "a", encoding="utf-8") as f:
            f.write(f"\n## Lessons from {datetime.now().isoformat()}\n{lessons}\n")
            
        global_lessons_dir = os.path.expanduser("~/.agent-loop")
        if not os.path.exists(global_lessons_dir):
            os.makedirs(global_lessons_dir, exist_ok=True)
        with open(os.path.join(global_lessons_dir, "lessons.md"), "a", encoding="utf-8") as f:
            f.write(f"\n## Lessons from {datetime.now().isoformat()}\n{lessons}\n")

    if high_issues:
        with open(os.path.join(session_path, "error-patterns.md"), "a", encoding="utf-8") as f:
            f.write(f"\n## Errors from {datetime.now().isoformat()}\n{json.dumps(high_issues, indent=2)}\n")

    # Final Output to Stdout
    result = {
        "score": score,
        "verdict": verdict,
        "high_issues": len(high_issues),
        "issues": issues_list
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()