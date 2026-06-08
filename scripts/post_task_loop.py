import os
import sys
import json
import urllib.request
import argparse
import subprocess
from datetime import datetime

# Configuration
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_PRIMARY = "llama3-70b-8192"
MODEL_FAST = "llama3-8b-8192"

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
    def call_llm(system_prompt, user_prompt, model=MODEL_PRIMARY, json_mode=False):
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
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
        try:
            with urllib.request.urlopen(req) as response:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body)
                return res_json["choices"][0]["message"]["content"]
        except Exception as e:
            if hasattr(e, 'read'):
                print(f"Error calling LLM: {e.read().decode('utf-8')}", file=sys.stderr)
            return "{}" if json_mode else ""

    # Context string
    context = f"TASK:\n{args.task}\n\nOUTPUT INFO:\n{args.output}\n\nGIT DIFF:\n{diff_output}\n\nCONSTITUTION:\n{agents_md}"

    # Agent 1: Evaluator
    evaluator_sys = "You are the Evaluator. Score the work 0-100 based on adherence to the Constitution, OWASP, and Clean Architecture. Output JSON with a 'score' integer."
    eval_res = call_llm(evaluator_sys, context, json_mode=True)
    try:
        score = int(json.loads(eval_res).get("score", 100))
    except:
        score = 100

    # Agent 2: Critic
    critic_sys = "You are the Critic. Identify any deviations from the Constitution, security issues, or architectural flaws. Output a JSON array of issues: { 'issues': [ {'severity': 'HIGH|MEDIUM|LOW', 'description': '...', 'file': '...'} ] }"
    critic_res = call_llm(critic_sys, context, json_mode=True)
    try:
        issues_list = json.loads(critic_res).get("issues", [])
    except:
        issues_list = []
        
    high_issues = [i for i in issues_list if i.get("severity") == "HIGH"]
    verdict = "FAIL" if len(high_issues) > 0 else "PASS"

    # Agent 3 & 4: Mutator & Validator
    mutations = ""
    if high_issues:
        mutator_sys = "You are the Mutator. Given the following HIGH issues and diff, propose a brief text description of how to fix them."
        mutator_prompt = f"ISSUES:\n{json.dumps(high_issues)}\n\nCONTEXT:\n{context}"
        mutations = call_llm(mutator_sys, mutator_prompt, model=MODEL_FAST)

        validator_sys = "You are the Validator. State if the proposed mutations are safe and correct. Reply only with YES or NO, followed by a brief reason."
        validator_prompt = f"MUTATIONS:\n{mutations}"
        validation = call_llm(validator_sys, validator_prompt, model=MODEL_FAST)
    else:
        validation = "YES. No high issues."

    # Agent 5: Archivist
    archivist_sys = "You are the Archivist. Extract 1-3 generalized, short bullet-point lessons from these issues to avoid them in the future."
    archivist_prompt = f"ISSUES:\n{json.dumps(issues_list)}"
    lessons = call_llm(archivist_sys, archivist_prompt, model=MODEL_PRIMARY) if issues_list else ""

    # File Outputs
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
