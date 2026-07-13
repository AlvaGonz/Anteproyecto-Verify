import dns.resolver

domain = "handymansolutionrd.lat"

def check_record(qtype):
    try:
        answers = dns.resolver.resolve(domain, qtype)
        print(f"\n--- {qtype} Records ---")
        for rdata in answers:
            print(rdata)
    except Exception as e:
        print(f"Error resolving {qtype}: {e}")

# Check MX, SPF (TXT)
check_record("MX")
check_record("TXT")
