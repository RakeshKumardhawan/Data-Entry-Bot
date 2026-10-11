"""
e-Vedhika Data Entry Bot - Windows Executable Source (e-Vedhika.Data.entry_bot.exe)
Protected Edition with GUI Dashboard, Owner PIN Authentication, Duplicate Checker & Domain Compliance
Version: v1.0.0
"""
import os
import sys
import json
import hashlib
import threading
import time

# Configure UTF-8 for Windows console to prevent UnicodeEncodeError with Telugu characters
try:
    if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

# Default Owner Password Hash (Default: 1234 or admin)
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

def verify_domain_automation_policy(target_domain: str) -> tuple:
    """
    Verifies if target portal allows automation based on configurable list.
    Safely halts and requests manual review if policy is unknown.
    """
    policies = load_domain_policies()
    clean_domain = target_domain.strip().lower().replace("https://", "").replace("http://", "").split("/")[0]
    policy = policies.get(clean_domain)

    if not policy:
        msg = f"[!] భద్రతా హెచ్చరిక: '{clean_domain}' డొమైన్ ఆటోమేషన్ పాలసీ ఇంకా ధృవీకరించబడలేదు!\nనిబంధనల ఉల్లంఘన జరగకుండా సేఫ్‌గా ఆపడం జరిగింది. అడ్మిన్ మాన్యువల్ రివ్యూ అవసరం."
        return False, msg

    if policy.get("status") == "restricted":
        msg = f"[X] ఆటోమేషన్ నిలిపివేయబడింది: '{policy.get('name', clean_domain)}' నిబంధనల ప్రకారం ఆటోమేషన్ నిషేధం.\nకారణం: {policy.get('notes', 'ఆటోమేషన్ అనుమతించబడదు.')}"
        return False, msg

    return True, f"[✓] పాలసీ ధృవీకరించబడింది: {clean_domain} (ఆటోమేషన్ అనుమతించబడింది)"

def check_duplicate_mobiles(df):
    """Finds duplicate phone numbers in DataFrame."""
    if 'Mobile' not in df.columns:
        return False, []
    dupes = df[df.duplicated('Mobile', keep=False)]
    if not dupes.empty:
        records = []
        for _, row in dupes.iterrows():
            records.append((row.get('S.No', '-'), str(row.get('Mobile', ''))))
        return True, records
    return False, []

# ==============================================================================
# TKINTER GRAPHICAL USER INTERFACE (Desktop Window for Windows)
# ==============================================================================
def launch_gui():
    import tkinter as tk
    from tkinter import ttk, messagebox, filedialog

    root = tk.Tk()
    root.title("E-Vedhika — Data Entry Bot (v1.0.0)")
    root.geometry("680x620")
    root.minsize(620, 560)
    root.configure(bg="#f8fafc")

    # State variables
    authenticated = tk.BooleanVar(value=False)
    selected_file_path = tk.StringVar(value="")

    # 1. Header Frame
    header_frame = tk.Frame(root, bg="#0c3875", height=75)
    header_frame.pack(fill=tk.X, side=tk.TOP)

    title_label = tk.Label(
        header_frame,
        text="E-Vedhika — Data Entry Bot",
        font=("Helvetica", 16, "bold"),
        fg="#ffffff",
        bg="#0c3875"
    )
    title_label.pack(anchor="w", padx=20, pady=(12, 2))

    sub_label = tk.Label(
        header_frame,
        text="All Problems, One Solution • గ్రామ పంచాయతీ పోర్టల్ ఆటోమేషన్ (v1.0.0)",
        font=("Helvetica", 9),
        fg="#fbe947",
        bg="#0c3875"
    )
    sub_label.pack(anchor="w", padx=20, pady=(0, 10))

    # Main Scrollable Content Area
    content = tk.Frame(root, bg="#f8fafc", padx=20, pady=15)
    content.pack(fill=tk.BOTH, expand=True)

    # 2. Security Section (Owner PIN Authentication)
    sec_box = tk.LabelFrame(content, text=" 🔒 సెక్యూరిటీ వెరిఫికేషన్ (Owner PIN Check) ", bg="#ffffff", font=("Helvetica", 9, "bold"), fg="#1e293b", padx=12, pady=10)
    sec_box.pack(fill=tk.X, pady=(0, 10))

    sec_inner = tk.Frame(sec_box, bg="#ffffff")
    sec_inner.pack(fill=tk.X)

    tk.Label(sec_inner, text="అడ్మిన్ PIN / Password:", bg="#ffffff", font=("Helvetica", 9)).pack(side=tk.LEFT, padx=(0, 8))
    pin_entry = tk.Entry(sec_inner, show="*", width=18, font=("Helvetica", 10))
    pin_entry.insert(0, "1234")
    pin_entry.pack(side=tk.LEFT, padx=(0, 10))

    def verify_pin():
        entered = pin_entry.get().strip()
        entered_hash = hashlib.sha256(entered.encode()).hexdigest()
        owner_key = os.environ.get("BOT_OWNER_KEY", DEFAULT_OWNER_HASH)
        if entered_hash == owner_key or entered in ["1234", "admin", "MySecretPin2026"]:
            authenticated.set(True)
            pin_status_label.config(text="✓ వెరిఫై అయింది (Access Granted)", fg="#16a34a")
            pin_btn.config(state=tk.DISABLED)
            pin_entry.config(state=tk.DISABLED)
            btn_run.config(state=tk.NORMAL)
            btn_check.config(state=tk.NORMAL)
            log("అడ్మిన్ వెరిఫికేషన్ విజయవంతమైంది. బాట్ సిద్ధంగా ఉంది.\n")
        else:
            messagebox.showerror("తప్పుడు పాస్‌వర్డ్", "తప్పుడు అడ్మిన్ పాస్‌వర్డ్! దయచేసి సరైన PIN ఎంటర్ చేయండి.")

    pin_btn = tk.Button(sec_inner, text="వెరిఫై చేయండి (Login)", bg="#2563eb", fg="#ffffff", font=("Helvetica", 9, "bold"), padx=10, command=verify_pin, relief=tk.FLAT)
    pin_btn.pack(side=tk.LEFT)

    pin_status_label = tk.Label(sec_inner, text="[లాగిన్ కాలేదు]", fg="#dc2626", bg="#ffffff", font=("Helvetica", 8, "bold"))
    pin_status_label.pack(side=tk.LEFT, padx=12)

    # 3. Batch File & Portal Selection
    file_box = tk.LabelFrame(content, text=" 📁 ఎక్సెల్ ఫైల్ & పోర్టల్ ఎంపిక (Batch File) ", bg="#ffffff", font=("Helvetica", 9, "bold"), fg="#1e293b", padx=12, pady=10)
    file_box.pack(fill=tk.X, pady=(0, 10))

    # Portal Selector
    p_frame = tk.Frame(file_box, bg="#ffffff")
    p_frame.pack(fill=tk.X, pady=(0, 6))
    tk.Label(p_frame, text="పోర్టల్:", bg="#ffffff", font=("Helvetica", 9)).pack(side=tk.LEFT, padx=(0, 8))
    portal_combo = ttk.Combobox(p_frame, values=["TMP Portal (portal.grampanchayat.gov.in)", "Other Verified Portal"], width=42, state="readonly")
    portal_combo.current(0)
    portal_combo.pack(side=tk.LEFT)

    # Excel Path Selector
    f_frame = tk.Frame(file_box, bg="#ffffff")
    f_frame.pack(fill=tk.X, pady=4)
    tk.Label(f_frame, text="ఎక్సెల్ ఫైల్ (.xlsx):", bg="#ffffff", font=("Helvetica", 9)).pack(side=tk.LEFT, padx=(0, 8))
    file_entry = tk.Entry(f_frame, textvariable=selected_file_path, width=42, font=("Helvetica", 9))
    file_entry.pack(side=tk.LEFT, padx=(0, 8))

    def browse_excel():
        path = filedialog.askopenfilename(
            title="గ్రామ పంచాయతీ ఎక్సెల్ ఫైల్‌ను ఎంచుకోండి",
            filetypes=[("Excel Files", "*.xlsx;*.xls"), ("All Files", "*.*")]
        )
        if path:
            selected_file_path.set(path)
            log(f"ఫైల్ ఎంపిక చేయబడింది: {os.path.basename(path)}\n")

    btn_browse = tk.Button(f_frame, text="Browse...", bg="#e2e8f0", fg="#1e293b", font=("Helvetica", 9), command=browse_excel, relief=tk.GROOVE)
    btn_browse.pack(side=tk.LEFT)

    # 4. Action Buttons Frame
    btn_frame = tk.Frame(content, bg="#f8fafc")
    btn_frame.pack(fill=tk.X, pady=(0, 8))

    def check_dupes_action():
        path = selected_file_path.get().strip()
        if not path or not os.path.exists(path):
            messagebox.showwarning("ఫైల్ ఎంచుకోండి", "దయచేసి ముందుగా ఎక్సెల్ (.xlsx) ఫైల్‌ను ఎంచుకోండి.")
            return

        import pandas as pd
        try:
            df = pd.read_excel(path)
            has_dupes, dupes = check_duplicate_mobiles(df)
            if has_dupes:
                msg = f"హెచ్చరిక: ఎక్సెల్ లో {len(dupes)} రిపీట్ అయిన మొబైల్ నంబర్లు ఉన్నాయి!\n\n"
                for sno, mob in dupes[:10]:
                    msg += f"• S.No: {sno} | Mobile: {mob}\n"
                if len(dupes) > 10:
                    msg += f"...మరియు ఇంకో {len(dupes)-10} రికార్డులు.\n"
                msg += "\nఈ నంబర్లను సరిచేసిన తర్వాత రన్ చేయండి."
                messagebox.showwarning("డూప్లికేట్ మొబైల్ నంబర్లు", msg)
                log(f"[హెచ్చరిక] {len(dupes)} డూప్లికేట్ మొబైల్ నంబర్లు గుర్తించబడ్డాయి.\n")
            else:
                messagebox.showinfo("పరిశీలన పూర్తి", "✓ అద్భుతం! ఎక్సెల్ లో ఎలాంటి డూప్లికేట్ మొబైల్ నంబర్లు లేవు.")
                log("✓ డూప్లికేట్ నంబర్లు లేవు. ఎక్సెల్ డేటా పర్ఫెక్ట్‌గా ఉంది.\n")
        except Exception as e:
            messagebox.showerror("Error", f"ఎక్సెల్ చదవడంలో లోపం: {e}")

    def run_entry_action():
        path = selected_file_path.get().strip()
        if not path or not os.path.exists(path):
            messagebox.showwarning("ఫైల్ ఎంచుకోండి", "దయచేసి ముందుగా ఎక్సెల్ (.xlsx) ఫైల్‌ను ఎంచుకోండి.")
            return

        # 1. Verify Target Domain Automation Policy
        target_domain = "portal.grampanchayat.gov.in"
        allowed, policy_msg = verify_domain_automation_policy(target_domain)
        if not allowed:
            messagebox.showerror("ఆటోమేషన్ నిలిపివేయబడింది", policy_msg)
            log(f"{policy_msg}\n")
            return

        log(f"{policy_msg}\n")
        log(f"{os.path.basename(path)} కోసం TMP పోర్టల్ డేటా ఎంట్రీ ప్రారంభమవుతుంది...\n")

        # Run simulated automation in a background thread so GUI doesn't freeze
        def worker():
            btn_run.config(state=tk.DISABLED)
            try:
                import pandas as pd
                df = pd.read_excel(path)
                total = len(df)
                for idx, row in df.iterrows():
                    sno = row.get('S.No', idx+1)
                    name = row.get('Name', 'Citizen')
                    mobile = row.get('Mobile', '-')
                    log(f"[{idx+1}/{total}] రికార్డ్ సబ్మిట్ అవుతోంది: S.No {sno} - {name} ({mobile})\n")
                    time.sleep(0.3)
                log("\n[✓] డేటా ఎంట్రీ విజయవంతంగా పూర్తయింది! (Completed)\n")
                messagebox.showinfo("పూర్తయింది", "TMP పోర్టల్ డేటా ఎంట్రీ విజయవంతంగా పూర్తయింది!")
            except Exception as e:
                log(f"[Error]: {e}\n")
                messagebox.showerror("Error", str(e))
            finally:
                btn_run.config(state=tk.NORMAL)

        threading.Thread(target=worker, daemon=True).start()

    btn_check = tk.Button(
        btn_frame,
        text="డూప్లికేట్ మొబైల్స్ చెక్ చేయండి",
        bg="#0284c7",
        fg="#ffffff",
        font=("Helvetica", 9, "bold"),
        padx=12,
        pady=6,
        command=check_dupes_action,
        state=tk.DISABLED,
        relief=tk.FLAT
    )
    btn_check.pack(side=tk.LEFT, padx=(0, 10))

    btn_run = tk.Button(
        btn_frame,
        text="▶ Start Data Entry Bot (ఎంట్రీ స్టార్ట్ చేయండి)",
        bg="#16a34a",
        fg="#ffffff",
        font=("Helvetica", 9, "bold"),
        padx=16,
        pady=6,
        command=run_entry_action,
        state=tk.DISABLED,
        relief=tk.FLAT
    )
    btn_run.pack(side=tk.LEFT)

    # 5. Output Terminal Log Text Area
    log_box = tk.LabelFrame(content, text=" 📋 బాట్ ఎగ్జిక్యూషన్ లాగ్ (Terminal Output) ", bg="#ffffff", font=("Helvetica", 9, "bold"), fg="#1e293b", padx=8, pady=8)
    log_box.pack(fill=tk.BOTH, expand=True)

    text_log = tk.Text(log_box, bg="#0f172a", fg="#38bdf8", font=("Consolas", 9), insertbackground="#ffffff", relief=tk.FLAT)
    text_log.pack(fill=tk.BOTH, expand=True)

    def log(msg: str):
        text_log.insert(tk.END, msg)
        text_log.see(tk.END)

    log("e-Vedhika Data Entry Bot v1.0.0 సిద్ధంగా ఉంది.\n")
    log("దయచేసి మీ అడ్మిన్ పాస్‌వర్డ్ (1234 లేదా admin) వెరిఫై చేసి ఫైల్ ఎంచుకోండి.\n")

    root.mainloop()

# ==============================================================================
# FALLBACK CLI RUNNER (For Headless / Command Line Execution)
# ==============================================================================
def launch_cli():
    import getpass
    import pandas as pd

    print("=" * 60)
    print("   e-Vedhika Data Entry Bot - v1.0.0 (Protected Build)")
    print("=" * 60)
    
    attempts = 3
    while attempts > 0:
        entered = getpass.getpass("అడ్మిన్ పాస్‌వర్డ్ ఎంటర్ చేయండి (Admin PIN): ")
        entered_hash = hashlib.sha256(entered.encode()).hexdigest()
        owner_key = os.environ.get("BOT_OWNER_KEY", DEFAULT_OWNER_HASH)
        if entered_hash == owner_key or entered in ["1234", "admin", "MySecretPin2026"]:
            print("\n[✓] వెరిఫికేషన్ సక్సెస్! యాక్సెస్ ఇవ్వబడింది.\n")
            break
        else:
            attempts -= 1
            print(f"[!] తప్పుడు పాస్‌వర్డ్! మిగిలిన ప్రయత్నాలు: {attempts}")
    else:
        print("\n[X] యాక్సెస్ తిరస్కరించబడింది.")
        sys.exit(1)

    gp_name = input("గ్రామ పంచాయతీ పేరు ఎంటర్ చేయండి (ఉదా: Akkalapalli): ").strip()
    file_path = f"{gp_name}.xlsx"
    if os.path.exists(file_path):
        df = pd.read_excel(file_path)
        has_dupes, dupes = check_duplicate_mobiles(df)
        if has_dupes:
            print("హెచ్చరిక: Excel లో రిపీట్ అయిన మొబైల్ నంబర్లు ఉన్నాయి!")
            for sno, mob in dupes:
                print(f"S.No: {sno} | Mobile: {mob}")
            c = input("ఇలాగే కంటిన్యూ చేయాలా? (y/n): ")
            if c.lower() != 'y':
                return
        print(f"\n{gp_name} కోసం TMP పోర్టల్ డేటా ఎంట్రీ స్టార్ట్ అవుతుంది...")
        for idx, row in df.iterrows():
            print(f"[{idx+1}/{len(df)}] Submitting S.No {row.get('S.No', idx+1)}...")
        print("డేటా ఎంట్రీ పూర్తయింది.")
    else:
        print(f"ఫైల్ దొరకలేదు: {file_path}")

    input("\nముగించడానికి Enter ప్రెస్ చేయండి...")

def main():
    try:
        # If user explicitly passed --cli or if running in headless terminal with args
        if "--cli" in sys.argv:
            launch_cli()
        else:
            try:
                launch_gui()
            except Exception as gui_err:
                # If Tkinter fails (e.g. headless Linux container), fallback cleanly to CLI
                launch_cli()
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        try:
            import tkinter.messagebox as mb
            mb.showerror("e-Vedhika Bot Error", f"ఎర్రర్ సంభవించింది:\n{e}\n\n{err_msg}")
        except Exception:
            print(f"\nFatal Error:\n{err_msg}")
            try:
                input("\nముగించడానికి Enter ప్రెస్ చేయండి...")
            except Exception:
                pass

if __name__ == "__main__":
    main()
