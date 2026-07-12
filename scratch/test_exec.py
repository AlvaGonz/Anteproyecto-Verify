import subprocess
import os
import sys

cwd = os.getcwd()
cmd = ["docker", "run", "--rm", "-v", f"{cwd}:/src", "-w", "/src", "mcr.microsoft.com/dotnet/sdk:8.0", "dotnet", "test", "tests/backend/UnitTests/UnitTests.csproj", "-p:BaseIntermediateOutputPath=/tmp/obj/UnitTests/", "-p:OutputPath=/tmp/bin/UnitTests/", "--filter", "Category!=Integration", "-q"]

is_windows = sys.platform == "win32"
run_shell = False

print("Running command:", cmd)

try:
    result = subprocess.run(
        cmd, capture_output=True, text=True,
        timeout=120, cwd=cwd, shell=run_shell
    )
    print("Return code:", result.returncode)
    print("Stdout:", result.stdout)
    print("Stderr:", result.stderr)
except Exception as e:
    print("Exception:", e)
