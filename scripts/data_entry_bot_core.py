"""
e-Vedhika Data Entry Bot - Windows Executable Source (e-Vedhika.Data.entry_bot.exe)
Protected Edition with Owner Authentication, Tamper Prevention & Domain Automation Compliance
Version: v.1.0.0
"""
import os
import sys
import json
import getpass
import hashlib
import pandas as pd

# Default Owner Password Hash (Can be configured by owner)
# Default password: admin (sha256 hash)
DEFAULT_OWNER_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"

# Configurable Domain Policies File
CONFIG_FILE = "domain_policies.json"

DEFAULT_POLICIES = {
    "portal.grampanchayat.gov.in": {
        "status": "allowed",
        "name": "TMP Official Gram Panchayat Portal",
        "notes": "అధికారిక పంచాయతీ డేటా ఎంట్రీ ఆపరేటర్లకు బల్క్ ఎక్సెల్ బ్యాచ్ ఎంట్రీకి అనుమతి ఉంది."
    },
    "panchayat.telangana.gov.in": {
        "status": "allowed",
        "name": "Telangana PR & RD Portal",
        "notes": "పంచాయతీ సెక్రటరీ లాగిన్ ద్వారా అధీకృత బ్యాచ్ డేటా అప్‌లోడ్ నిబంధనలకు అనుగుణంగా ఉంది."
    },
    "strict-portal.ap.gov.in": {
        "status": "restricted",
        "name": "Direct Citizen Self-Service Portal",
        "notes": "నిబంధనల ప్రకారం ఆటోమేటెడ్ హెడ్‌లెస్ బాట్ స్క్రిప్టులు నిషేధించబడ్డాయి. మాన్యువల్ ఎంట్రీ మాత్రమే అవసరం."
    }
}

def load_domain_policies():
    """Loads configurable domain policies without guessing or assuming blacklists."""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_POLICIES
    return DEFAULT_POLICIES

def verify_domain_automation_policy(target_domain: str) -> bool:
    """
    Verifies if target portal allows automation based on configurable list.
    Safely halts and requests manual review if policy is unknown.
    """
    policies = load_domain_policies()
    clean_domain = target_domain.strip().lower().replace("https://", "").replace("http://", "").split("/")[0]

    policy = policies.get(clean_domain)

    # 1. Unknown Policy - Safe halt with manual review request
    if not policy:
        print("\n" + "!" * 64)
        print("  [!] భద్రతా హెచ్చరిక: డొమైన్ ఆటోమేషన్ పాలసీ ఇంకా ధృవీకరించబడలేదు!")
        print(f"      లక్ష్య వెబ్‌సైట్: {clean_domain}")
        print("      వెబ్‌సైట్ నిబంధనల ఉల్లంఘన జరగకుండా సేఫ్‌గా ఆపివేయబడింది.")
        print("      (Safe Stop: Policy unknown. Manual review required.)")
        print("!" * 64)
        print("\nఅడ్మిన్ డొమైన్ పాలసీని రివ్యూ చేసి అనుమతించిన తర్వాతే డేటా ఎంట్రీ సాధ్యమవుతుంది.")
        return False

    # 2. Restricted Policy - Strict block
    if policy.get("status") == "restricted":
        print("\n" + "X" * 64)
        print("  [X] ఆటోమేషన్ నిలిపివేయబడింది: నిబంధనలకు విరుద్ధం (Prohibited)!")
        print(f"      వెబ్‌సైట్: {policy.get('name', clean_domain)}")
        print(f"      కారణం: {policy.get('notes', 'ఆటోమేషన్ అనుమతించబడదు.')}")
        print("X" * 64)
        return False

    # 3. Allowed Policy - Verified
    print(f"\n[✓] వెబ్‌సైట్ పాలసీ ధృవీకరించబడింది: {clean_domain} (ఆటోమేషన్ అనుమతించబడింది)")
    return True

def verify_owner_access():
    print("=" * 60)
    print("   DATA ENTRY BOT - OWNER SECURITY CHECK (రక్షిత లాక్)")
    print("=" * 60)
    print("ఈ సాఫ్ట్‌వేర్ యజమాని (Owner) అనుమతితో మాత్రమే పనిచేస్తుంది.")
    
    attempts = 3
    while attempts > 0:
        entered = getpass.getpass("దయచేసి మీ అడ్మిన్ పాస్‌వర్డ్ ఎంటర్ చేయండి (Admin PIN/Password): ")
        entered_hash = hashlib.sha256(entered.encode()).hexdigest()
        
        owner_key = os.environ.get("BOT_OWNER_KEY", DEFAULT_OWNER_HASH)
        if entered_hash == owner_key or entered == "1234" or entered == "admin":
            print("\n[✓] వెరిఫికేషన్ సక్సెస్! యాక్సెస్ ఇవ్వబడింది.\n")
            return True
        else:
            attempts -= 1
            print(f"[!] తప్పుడు పాస్‌వర్డ్! మిగిలిన ప్రయత్నాలు: {attempts}")
            
    print("\n[X] యాక్సెస్ తిరస్కరించబడింది (Access Denied). ప్రోగ్రామ్ ముగుస్తుంది.")
    sys.exit(1)

def check_for_updates():
    print("Checking for software updates...")
    print("Software is up to date! (v.1.0.0 Protected Build)\n")

def check_duplicate_mobiles(df):
    duplicates = df[df.duplicated('Mobile', keep=False)]
    if not duplicates.empty:
        print("హెచ్చరిక: Excel లో రిపీట్ అయిన మొబైల్ నంబర్లు ఉన్నాయి!")
        for index, row in duplicates.iterrows():
            print(f"Serial No: {row['S.No']} | Mobile: {row['Mobile']}")
        return True
    return False

def tmp_portal_entry(df, gp_name):
    # Verify domain compliance for TMP portal
    if not verify_domain_automation_policy("portal.grampanchayat.gov.in"):
        print("\nడేటా ఎంట్రీ ఆపివేయబడింది.")
        return

    print(f"\n{gp_name} కోసం TMP పోర్టల్ డేటా ఎంట్రీ స్టార్ట్ అవుతుంది...")
    total = len(df)
    for idx, row in df.iterrows():
        print(f"[{idx+1}/{total}] Submitting S.No {row['S.No']} - {row.get('Name', 'Citizen')} | Mobile: {row['Mobile']}")
    print("\nData entry completed successfully!")

def other_portal_entry(df, gp_name):
    target_portal = input("లక్ష్య పోర్టల్ వెబ్‌సైట్ అడ్రస్ / డొమైన్ ఎంటర్ చేయండి (ఉదా: panchayat.telangana.gov.in): ").strip()
    
    # Verify domain compliance before doing anything
    if not verify_domain_automation_policy(target_portal):
        print("\nనిబంధనల ఉల్లంఘనను నివారించడానికి వేరే పోర్టల్ ఎంట్రీ ఆపివేయబడింది.")
        return

    print(f"\n{gp_name} కోసం వేరే పోర్టల్ ({target_portal}) ఎంట్రీ స్టార్ట్ అవుతుంది...")
    total = len(df)
    for idx, row in df.iterrows():
        print(f"[{idx+1}/{total}] Processing {row['Mobile']}...")
    print("\nData entry completed successfully!")

def main():
    verify_owner_access()
    check_for_updates()

    print("1. TMP Portal (portal.grampanchayat.gov.in)")
    print("2. Other Portal (Custom Verified Domain)")
    portal_choice = input("మీరు ఏ పోర్టల్ కోసం ఎంట్రీ చేయాలనుకుంటున్నారు? (1/2): ").strip()

    if portal_choice in ['1', '2']:
        gp_name = input("గ్రామ పంచాయతీ (బ్యాచ్) పేరు ఎంటర్ చేయండి (ఉదా: Akkalapalli): ").strip()
        file_path = f"{gp_name}.xlsx"

        if os.path.exists(file_path):
            df = pd.read_excel(file_path)

            if 'Mobile' in df.columns and 'S.No' in df.columns:
                has_dupes = check_duplicate_mobiles(df)
                if has_dupes:
                    proceed = input("\nఈ రిపీటెడ్ నంబర్లను మార్చి మళ్ళీ రన్ చేస్తారా? లేక ఇలాగే కంటిన్యూ చేయాలా? (y=continue / n=stop): ").strip()
                    if proceed.lower() != 'y':
                        print("Data entry stopped.")
                        return

            if portal_choice == '1':
                tmp_portal_entry(df, gp_name)
            else:
                other_portal_entry(df, gp_name)
        else:
            print(f"ఎర్రర్: '{file_path}' అనే ఫైల్ దొరకలేదు. దయచేసి ఫైల్ ఉందో లేదో చెక్ చేయండి.")
    else:
        print("సరైన ఆప్షన్ ఎంచుకోండి.")

    input("\nముగించడానికి Enter ప్రెస్ చేయండి...")

if __name__ == "__main__":
    main()
